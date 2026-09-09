import { FeatureKey } from './feature-keys.enum.js';

/**
 * Commercial Subscription Tiers for SiDaya Tenants
 */
export enum SubscriptionTier {
  STARTER_FREE = 'STARTER_FREE',
  RETAIL_STARTER = 'RETAIL_STARTER',
  GROSIR_PRO = 'GROSIR_PRO',
  OMNICHANNEL_ENTERPRISE = 'OMNICHANNEL_ENTERPRISE',
}

/**
 * Default Entitlements granted to each Subscription Tier
 */
export const TIER_DEFAULT_ENTITLEMENTS: Record<SubscriptionTier, readonly FeatureKey[]> = {
  [SubscriptionTier.STARTER_FREE]: [
    FeatureKey.CORE_POS,
    FeatureKey.BASIC_INVENTORY,
    FeatureKey.RECEIPT_PRINTING_THERMAL,
  ],
  [SubscriptionTier.RETAIL_STARTER]: [
    FeatureKey.CORE_POS,
    FeatureKey.BASIC_INVENTORY,
    FeatureKey.RECEIPT_PRINTING_THERMAL,
    FeatureKey.CLIENT_PAYLINK,
  ],
  [SubscriptionTier.GROSIR_PRO]: [
    FeatureKey.CORE_POS,
    FeatureKey.BASIC_INVENTORY,
    FeatureKey.RECEIPT_PRINTING_THERMAL,
    FeatureKey.CLIENT_PAYLINK,
    FeatureKey.WHOLESALE_PRICING,
    FeatureKey.COMPOUND_DISCOUNTS,
    FeatureKey.UNIT_CONVERSIONS,
    FeatureKey.CUSTOMER_TIERS,
    FeatureKey.INBOUND_PROCUREMENT,
    FeatureKey.STORAGE_BINS,
    FeatureKey.FIFO_BATCH_ALLOCATION,
    FeatureKey.DRIVER_SURAT_JALAN,
    FeatureKey.DOT_MATRIX_ESC_P2,
    FeatureKey.PIUTANG_LEDGER,
    FeatureKey.FAST_PIN_SWITCH,
    FeatureKey.SHIFT_RECONCILIATION,
    FeatureKey.COGS_PRIVACY_MASK,
    FeatureKey.REALTIME_SYNC,
  ],
  [SubscriptionTier.OMNICHANNEL_ENTERPRISE]: [
    FeatureKey.CORE_POS,
    FeatureKey.BASIC_INVENTORY,
    FeatureKey.RECEIPT_PRINTING_THERMAL,
    FeatureKey.CLIENT_PAYLINK,
    FeatureKey.WHOLESALE_PRICING,
    FeatureKey.COMPOUND_DISCOUNTS,
    FeatureKey.UNIT_CONVERSIONS,
    FeatureKey.CUSTOMER_TIERS,
    FeatureKey.INBOUND_PROCUREMENT,
    FeatureKey.STORAGE_BINS,
    FeatureKey.FIFO_BATCH_ALLOCATION,
    FeatureKey.DRIVER_SURAT_JALAN,
    FeatureKey.DOT_MATRIX_ESC_P2,
    FeatureKey.PIUTANG_LEDGER,
    FeatureKey.FAST_PIN_SWITCH,
    FeatureKey.SHIFT_RECONCILIATION,
    FeatureKey.COGS_PRIVACY_MASK,
    FeatureKey.REALTIME_SYNC,
    FeatureKey.MULTI_WAREHOUSE,
    FeatureKey.SUPPLIER_RETURNS,
    FeatureKey.MARKETPLACE_SYNC,
    FeatureKey.WHATSAPP_OFFICIAL_CLOUD,
  ],
};
