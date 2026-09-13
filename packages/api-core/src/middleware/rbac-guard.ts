import { PermissionKey } from '@sidaya/shared-types';
import { HttpRequestLike, HttpResponseLike, NextFunctionLike } from './tenant-context.middleware';

export function requirePermission(requiredPermission: PermissionKey | string) {
  return async (req: HttpRequestLike, res: HttpResponseLike, next: NextFunctionLike): Promise<void> => {
    // 1. Retrieve user context STRICTLY from verified authentication token or user session
    // Never trust client-injected 'X-User-Role' or 'X-User-Permissions' headers
    const user = req.tenantUser || req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Autentikasi diperlukan: Token Bearer tidak ditemukan atau tidak valid.',
          status: 401,
        },
      });
      return;
    }

    const userRole = user.role;
    const userPermissions: string[] = (user.permissions || []) as string[];

    // 2. Owner bypass rule: Authenticated Tenant Owner possesses all capabilities
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

