import {
  IPaymentGatewayProvider,
  CreatePaymentSessionDTO,
  PaymentSessionResult,
  NormalizedWebhookResult,
} from '../interfaces/payment-provider.interface';
import { MidtransPaymentProvider, MidtransConfig } from '../providers/midtrans.provider';
import { XenditPaymentProvider, XenditConfig } from '../providers/xendit.provider';
import { DuitkuPaymentProvider, DuitkuConfig } from '../providers/duitku.provider';
import { CustomWebhookPaymentProvider, CustomWebhookConfig } from '../providers/custom-webhook.provider';

export type MerchantPaymentTier = 'MANUAL' | 'BYOK' | 'CUSTOM_OPAP' | 'PLATFORM_MANAGED';

export interface TenantPaymentConfig {
  tenantId: string;
  tier: MerchantPaymentTier;
  activeProviderId: string; // 'MIDTRANS' | 'XENDIT' | 'DUITKU' | 'CUSTOM_GATEWAY' | 'MANUAL'
  // Encrypted or loaded credentials
  midtrans?: MidtransConfig;
  xendit?: XenditConfig;
  duitku?: DuitkuConfig;
  customOpap?: CustomWebhookConfig;
  enabledChannels?: string[];
}

export interface PaymentRoutingRule {
  id: string;
  name: string;
  priority: number; // Higher number = higher precedence
  evaluate: (dto: CreatePaymentSessionDTO, tenantConfig?: TenantPaymentConfig) => boolean;
  targetProviderId: 'XENDIT' | 'DUITKU' | 'MIDTRANS' | 'CUSTOM_GATEWAY';
}

/**
 * Path 2: Pluggable Merchant Payment Router Service
 * Dynamically instantiates and routes payments through the tenant's chosen payment rail
 * or platform-managed smart routing rules (by channel, ticket size, or fee policy).
 */
export class MerchantPaymentRouterService {
  private tenantConfigs = new Map<string, TenantPaymentConfig>();
  private routingRules: PaymentRoutingRule[] = [];
  private providerPool = new Map<string, IPaymentGatewayProvider>();
  private defaultPlatformProvider?: IPaymentGatewayProvider | undefined;

  constructor(defaultPlatformProvider?: IPaymentGatewayProvider | undefined) {
    this.defaultPlatformProvider = defaultPlatformProvider;
    if (defaultPlatformProvider) {
      this.providerPool.set(defaultPlatformProvider.providerId.toUpperCase(), defaultPlatformProvider);
    }
  }

  public registerProvider(provider: IPaymentGatewayProvider): void {
    this.providerPool.set(provider.providerId.toUpperCase(), provider);
  }

  public registerRoutingRule(rule: PaymentRoutingRule): void {
    this.routingRules.push(rule);
    this.routingRules.sort((a, b) => b.priority - a.priority);
  }

  public registerTenantPaymentConfig(config: TenantPaymentConfig): void {
    this.tenantConfigs.set(config.tenantId, config);
  }

  public getTenantPaymentConfig(tenantId: string): TenantPaymentConfig | undefined {
    return this.tenantConfigs.get(tenantId);
  }

  /**
   * Resolves the active IPaymentGatewayProvider instance for a specific tenant and transaction context.
   */
  public resolveProviderForSession(tenantId: string, dto?: CreatePaymentSessionDTO): IPaymentGatewayProvider {
    const config = this.tenantConfigs.get(tenantId);

    // 1. If Tenant has BYOK, their direct merchant configuration takes top priority
    if (config?.tier === 'BYOK') {
      switch (config.activeProviderId.toUpperCase()) {
        case 'MIDTRANS':
          if (!config.midtrans) throw new Error(`Missing Midtrans configuration for tenant '${tenantId}'.`);
          return new MidtransPaymentProvider(config.midtrans);
        case 'XENDIT':
          if (!config.xendit) throw new Error(`Missing Xendit configuration for tenant '${tenantId}'.`);
          return new XenditPaymentProvider(config.xendit);
        case 'DUITKU':
          if (!config.duitku) throw new Error(`Missing Duitku configuration for tenant '${tenantId}'.`);
          return new DuitkuPaymentProvider(config.duitku);
        default:
          throw new Error(`Unsupported BYOK payment provider '${config.activeProviderId}' for tenant '${tenantId}'.`);
      }
    }

    if (config?.tier === 'CUSTOM_OPAP' && config.customOpap) {
      return new CustomWebhookPaymentProvider(config.customOpap);
    }

    if (config?.tier === 'MANUAL') {
      throw new Error(`Tenant '${tenantId}' operates in MANUAL payment mode (Cash/Direct Transfer). Online gateway session is disabled.`);
    }

    // 2. Granular Smart Routing Evaluation (Channel, Amount, Fee optimization)
    if (dto && this.routingRules.length > 0) {
      for (const rule of this.routingRules) {
        if (rule.evaluate(dto, config)) {
          const matchedProvider = this.providerPool.get(rule.targetProviderId.toUpperCase());
          if (matchedProvider) {
            return matchedProvider;
          }
        }
      }
    }

    // 3. Fallback to Platform Default Provider
    if (this.defaultPlatformProvider) {
      return this.defaultPlatformProvider;
    }

    throw new Error(`No payment provider configured for tenant '${tenantId}' and no platform default available.`);
  }

  /**
   * Resolves the active IPaymentGatewayProvider instance for a specific tenant.
   */
  public resolveProviderForTenant(tenantId: string): IPaymentGatewayProvider {
    return this.resolveProviderForSession(tenantId);
  }

  /**
   * Creates a commercial payment session for a customer order with granular smart routing
   */
  public async createCommercialPaymentSession(
    tenantId: string,
    dto: CreatePaymentSessionDTO,
  ): Promise<PaymentSessionResult> {
    const provider = this.resolveProviderForSession(tenantId, dto);
    return provider.createPaymentSession(dto);
  }

  /**
   * Verifies and processes an incoming commercial webhook scoped to a specific tenant
   */
  public verifyAndParseCommercialWebhook(
    tenantId: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
  ): NormalizedWebhookResult {
    const provider = this.resolveProviderForTenant(tenantId);
    const isValid = provider.verifyWebhookSignature(headers, body);

    if (!isValid) {
      throw new Error(
        `Commercial payment webhook rejected for tenant '${tenantId}' via provider '${provider.providerId}': Invalid cryptographic signature.`,
      );
    }

    return provider.parseWebhook(body);
  }
}
