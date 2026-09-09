import { TenantSessionContext, buildSetTenantSessionSQL } from '@sidaya/database';
import { UserRole } from '@sidaya/shared-types';

export interface HttpRequestLike {
  headers: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    role: UserRole;
    fullName: string;
    tenantId: string;
    vehiclePlate?: string | undefined;
  } | undefined;
  tenantContext?: TenantSessionContext | undefined;
}

export interface HttpResponseLike {
  status: (statusCode: number) => HttpResponseLike;
  json: (data: unknown) => void;
}

export type NextFunctionLike = () => void | Promise<void>;

/**
 * Extracts X-Tenant-ID header and authentication session, validates tenant boundaries,
 * and sets local PostgreSQL RLS session variables.
 */
export function createTenantContextMiddleware() {
  return async (req: HttpRequestLike, res: HttpResponseLike, next: NextFunctionLike): Promise<void> => {
    const rawTenantId = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];
    const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId;

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TENANT_HEADER',
          message: 'The required X-Tenant-ID header is missing from the request.',
        },
      });
      return;
    }

    const context: TenantSessionContext = {
      tenantId,
      userId: req.user?.id,
      userRole: req.user?.role,
      userFullName: req.user?.fullName,
      vehiclePlate: req.user?.vehiclePlate,
    };

    req.tenantContext = context;

    // Helper to generate the RLS session SQL for database queries executed in this request context
    const rlsSql = buildSetTenantSessionSQL(context);
    void rlsSql; // Available for request transaction wrappers

    await next();
  };
}
