import {
  IPaymentGatewayProvider,
  NormalizedWebhookResult,
} from '../interfaces/payment-provider.interface';
import { SubscriptionTier } from '@sidaya/shared-types';

export interface SubscriptionPlanDef {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  maxBranches: number;
  maxUsers: number;
}

export const PLATFORM_PLANS: Record<SubscriptionTier, SubscriptionPlanDef> = {
  [SubscriptionTier.STARTER_FREE]: {
    tier: SubscriptionTier.STARTER_FREE,
    name: 'SiDaya Free Tier',
    priceMonthly: 0,
    priceAnnual: 0,
    features: ['pos:checkout', 'shifts:operate', 'catalog:view'],
    maxBranches: 1,
    maxUsers: 2,
  },
  [SubscriptionTier.RETAIL_STARTER]: {
    tier: SubscriptionTier.RETAIL_STARTER,
    name: 'SiDaya Retail Starter',
    priceMonthly: 99000,
    priceAnnual: 990000,
    features: ['pos:checkout', 'shifts:operate', 'catalog:view', 'warehouse:inbound', 'reports:basic'],
    maxBranches: 1,
    maxUsers: 5,
  },
  [SubscriptionTier.GROSIR_PRO]: {
    tier: SubscriptionTier.GROSIR_PRO,
    name: 'SiDaya Grosir Pro Wholesale',
    priceMonthly: 299000,
    priceAnnual: 2990000,
    features: [
      'pos:checkout',
      'shifts:operate',
      'catalog:view',
      'catalog:view_cogs',
      'warehouse:inbound',
      'warehouse:fifo_override',
      'delivery:dispatch',
      'piutang:manage',
      'custom_domain:bind',
      'reports:financial',
    ],
    maxBranches: 3,
    maxUsers: 15,
  },
  [SubscriptionTier.OMNICHANNEL_ENTERPRISE]: {
    tier: SubscriptionTier.OMNICHANNEL_ENTERPRISE,
    name: 'SiDaya Omnichannel Enterprise',
    priceMonthly: 999000,
    priceAnnual: 9990000,
    features: [
      'pos:checkout',
      'shifts:operate',
      'catalog:view',
      'catalog:view_cogs',
      'warehouse:inbound',
      'warehouse:fifo_override',
      'delivery:dispatch',
      'piutang:manage',
      'custom_domain:bind',
      'reports:financial',
      'multi_store:central_hub',
      'api:webhook_access',
      'audit:unlimited_retention',
    ],
    maxBranches: 999,
    maxUsers: 999,
  },
};

export interface CreateSubscriptionCheckoutDTO {
  tenantId: string;
  tenantSubdomain: string;
  ownerEmail: string;
  ownerName: string;
  tier: SubscriptionTier;
  billingPeriod: 'MONTHLY' | 'ANNUAL';
}

export interface PlatformSubscriptionRecord {
  id: string;
  tenantId: string;
  tier: SubscriptionTier;
  status: 'ACTIVE' | 'PENDING_PAYMENT' | 'PAST_DUE' | 'CANCELED';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  autoRenew: boolean;
  lastPaymentReference?: string;
}


/**
 * Path 1: Platform Subscription & Add-On Billing Service (Tenant -> Developer / Ashvin Labs)
 * Uses the platform's central master payment gateway account.
 */
export class PlatformBillingService {
  constructor(private readonly platformGatewayProvider: IPaymentGatewayProvider) {}

  public async createSubscriptionSession(dto: CreateSubscriptionCheckoutDTO) {
    const plan = PLATFORM_PLANS[dto.tier];
    if (!plan) {
      throw new Error(`Invalid plan tier requested: ${dto.tier}`);
    }

    const amount = dto.billingPeriod === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;
    const invoiceNumber = `SUB-${dto.tenantSubdomain.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const session = await this.platformGatewayProvider.createPaymentSession({
      tenantId: dto.tenantId,
      orderId: `sub_order_${dto.tenantId}_${Date.now()}`,
      orderNumber: invoiceNumber,
      amount,
      customer: {
        name: dto.ownerName,
        email: dto.ownerEmail,
        phone: '081234567890',
      },
      items: [
        {
          id: `plan_${dto.tier.toLowerCase()}`,
          name: `${plan.name} (${dto.billingPeriod === 'ANNUAL' ? 'Tahunan' : 'Bulanan'})`,
          price: amount,
          quantity: 1,
        },
      ],
      expiresInMinutes: 1440,
    });

    return {
      invoiceNumber,
      tier: dto.tier,
      amount,
      billingPeriod: dto.billingPeriod,
      checkoutUrl: session.checkoutUrl,
      paymentToken: session.paymentToken,
      qrString: session.qrString,
      vaNumber: session.vaNumber,
      expiresAt: session.expiresAt,
    };
  }

  public verifyAndProcessPlatformWebhook(
    headers: Record<string, string>,
    body: Record<string, unknown>,
  ): NormalizedWebhookResult {
    const isValid = this.platformGatewayProvider.verifyWebhookSignature(headers, body);
    if (!isValid) {
      throw new Error('Platform billing webhook rejected: Cryptographic signature mismatch.');
    }

    return this.platformGatewayProvider.parseWebhook(body);
  }
}
