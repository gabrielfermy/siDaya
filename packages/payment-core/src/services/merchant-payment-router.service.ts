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

/**
 * Path 2: Pluggable Merchant Payment Router Service
 * Dynamically instantiates and routes payments through the tenant's chosen payment rail.
 */
export class MerchantPaymentRouterService {
  private tenantConfigs = new Map<string, TenantPaymentConfig>();
  private defaultPlatformProvider?: IPaymentGatewayProvider | undefined;

  constructor(defaultPlatformProvider?: IPaymentGatewayProvider | undefined) {
    this.defaultPlatformProvider = defaultPlatformProvider;
  }


  public registerTenantPaymentConfig(config: TenantPaymentConfig): void {
    this.tenantConfigs.set(config.tenantId, config);
  }

  public getTenantPaymentConfig(tenantId: string): TenantPaymentConfig | undefined {
    return this.tenantConfigs.get(tenantId);
  }

  /**
   * Resolves the active IPaymentGatewayProvider instance for a specific tenant.
   */
  public resolveProviderForTenant(tenantId: string): IPaymentGatewayProvider {
    const config = this.tenantConfigs.get(tenantId);

    // If no custom config or Tier is PLATFORM_MANAGED, fallback to platform gateway
    if (!config || config.tier === 'PLATFORM_MANAGED') {
      if (!this.defaultPlatformProvider) {
        throw new Error(`No payment provider configured for tenant '${tenantId}' and no platform default available.`);
      }
      return this.defaultPlatformProvider;
    }

    if (config.tier === 'MANUAL') {
      throw new Error(`Tenant '${tenantId}' operates in MANUAL payment mode (Cash/Direct Transfer). Online gateway session is disabled.`);
    }

    if (config.tier === 'CUSTOM_OPAP' && config.customOpap) {
      return new CustomWebhookPaymentProvider(config.customOpap);
    }

    if (config.tier === 'BYOK') {
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

    throw new Error(`Invalid payment configuration for tenant '${tenantId}'.`);
  }

  /**
   * Creates a commercial payment session for a customer order
   */
  public async createCommercialPaymentSession(
    tenantId: string,
    dto: CreatePaymentSessionDTO,
  ): Promise<PaymentSessionResult> {
    const provider = this.resolveProviderForTenant(tenantId);
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
