import { PermissionKey } from '@sidaya/shared-types';
import { HttpRequestLike, HttpResponseLike, NextFunctionLike } from './tenant-context.middleware';

export interface AuthenticatedUserContext {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

export function requirePermission(requiredPermission: PermissionKey | string) {
  return async (req: HttpRequestLike, res: HttpResponseLike, next: NextFunctionLike): Promise<void> => {
    // 1. Retrieve user context from auth middleware or headers
    const user = (req as any).tenantUser as AuthenticatedUserContext | undefined;
    const userRole = user?.role || (req.headers['x-user-role'] as string);
    const rawPermissions = req.headers['x-user-permissions'];
    let parsedPermissions: string[] = [];
    if (typeof rawPermissions === 'string') {
      try {
        parsedPermissions = JSON.parse(rawPermissions);
      } catch {
        parsedPermissions = [];
      }
    } else if (Array.isArray(rawPermissions)) {
      parsedPermissions = rawPermissions;
    }
    const userPermissions: string[] = user?.permissions || parsedPermissions;

    // 2. Owner bypass rule: Tenant Owner possesses all capabilities
    if (userRole === 'OWNER') {
      await next();
      return;
    }

    // 3. Check granular permission key
    if (userPermissions.includes(requiredPermission)) {
      await next();
      return;
    }

    // 4. Return standard 403 Forbidden
    res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Akses ditolak: Anda membutuhkan izin '${requiredPermission}' untuk mengakses modul ini.`,
        status: 403,
        details: {
          requiredPermission,
          userRole,
        },
      },
    });
  };
}
