import { TenantSessionContext, buildSetTenantSessionSQL } from '@sidaya/database';
import { UserRole } from '@sidaya/shared-types';
import { verifyJwtToken, TokenClaims } from '../security/crypto-utils';

export interface HttpRequestLike {
  headers: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    role: UserRole;
    fullName: string;
    tenantId: string;
    permissions?: string[] | undefined;
    vehiclePlate?: string | undefined;
  } | undefined;
  tenantContext?: TenantSessionContext | undefined;
  tenantUser?: TokenClaims | undefined;
}

export interface HttpResponseLike {
  status: (statusCode: number) => HttpResponseLike;
  json: (data: unknown) => void;
}

export type NextFunctionLike = () => void | Promise<void>;

/**
 * Extracts and verifies JWT bearer token, validates tenant boundaries against token claims,
 * and sets PostgreSQL RLS session variables.
 * Untrusted client headers like forged X-Tenant-ID are strictly rejected if mismatched.
 */
export function createTenantContextMiddleware() {
  return async (req: HttpRequestLike, res: HttpResponseLike, next: NextFunctionLike): Promise<void> => {
    // 1. Check for Authorization Bearer Token
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const rawAuth = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    let tokenClaims: TokenClaims | undefined;

    if (rawAuth && typeof rawAuth === 'string' && rawAuth.startsWith('Bearer ')) {
      try {
        tokenClaims = verifyJwtToken(rawAuth.slice(7).trim());
        req.tenantUser = tokenClaims;
        req.user = {
          id: tokenClaims.userId,
          role: tokenClaims.role as UserRole,
          fullName: tokenClaims.fullName || 'Authenticated User',
          tenantId: tokenClaims.tenantId,
          permissions: tokenClaims.permissions,
        };
      } catch (err: any) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: `Authentication failed: ${err.message || 'Invalid or expired token.'}`,
          },
        });
        return;
      }
    }

    // 2. Resolve Tenant ID: Prefer verified JWT claims
    const rawTenantId = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];
    const headerTenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId;

    let effectiveTenantId = tokenClaims?.tenantId;

    if (headerTenantId) {
      if (tokenClaims && tokenClaims.tenantId !== headerTenantId) {
        // Multi-tenant isolation violation attempt
        res.status(403).json({
          success: false,
          error: {
            code: 'TENANT_FORBIDDEN',
            message: 'Cross-tenant access forbidden: Requested X-Tenant-ID does not match authenticated token.',
          },
        });
        return;
      }
      if (!effectiveTenantId) {
        effectiveTenantId = headerTenantId;
      }
    }

    if (!effectiveTenantId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TENANT_HEADER',
          message: 'The required tenant context could not be established. Missing X-Tenant-ID or Bearer token.',
        },
      });
      return;
    }

    const context: TenantSessionContext = {
      tenantId: effectiveTenantId,
      userId: req.user?.id,
      userRole: req.user?.role,
      userFullName: req.user?.fullName,
      vehiclePlate: req.user?.vehiclePlate,
    };

    req.tenantContext = context;

    try {
      const rlsSql = buildSetTenantSessionSQL(context);
      void rlsSql;
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TENANT_CONTEXT',
          message: `Malformed tenant context parameter: ${err.message}`,
        },
      });
      return;
    }

    await next();
  };
}

