import { FeatureKey } from '@sidaya/shared-types';
import { HttpRequestLike, HttpResponseLike, NextFunctionLike } from './tenant-context.middleware';

export interface IFeatureEntitlementProvider {
  isFeatureEnabled(tenantId: string, featureKey: FeatureKey): Promise<boolean>;
}

/**
 * Higher-order middleware factory that verifies a tenant has purchased / enabled a FeatureKey
 */
export function requireFeature(featureKey: FeatureKey, provider: IFeatureEntitlementProvider) {
  return async (req: HttpRequestLike, res: HttpResponseLike, next: NextFunctionLike): Promise<void> => {
    const tenantId = req.tenantContext?.tenantId;

    if (!tenantId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_TENANT',
          message: 'Tenant context must be established before checking feature entitlements.',
        },
      });
      return;
    }

    const isEnabled = await provider.isFeatureEnabled(tenantId, featureKey);

    if (!isEnabled) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FEATURE_NOT_ENTITLED',
          message: `Tenant does not have an active entitlement for feature '${featureKey}'. Upgrade subscription plan to unlock.`,
          details: { requiredFeature: featureKey },
        },
      });
      return;
    }

    await next();
  };
}
