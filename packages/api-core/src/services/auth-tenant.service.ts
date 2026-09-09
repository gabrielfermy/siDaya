import {
  PermissionKey,
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_PRESETS,
} from '@sidaya/shared-types';

export interface UserTenantMembership {
  tenantId: string;
  businessName: string;
  subdomain: string;
  role: string;
  permissions: PermissionKey[];
  branchId: string;
  branchName: string;
}

export interface AuthenticatedUserSession {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  activeTenant: UserTenantMembership;
  availableTenants: UserTenantMembership[];
  sessionToken: string;
}

export class AuthTenantDomainService {
  /**
   * In-memory/database mock registry aligned with seeded tenant accounts
   */
  private staffCatalog = [
    {
      userId: 'a0000001-0001-0000-0000-000000000001',
      fullName: 'Budi Santoso',
      email: 'budi@berasjaya.com',
      phoneNumber: '081234567890',
      pin: '1234',
      tenants: [
        {
          tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
          businessName: 'Toko Grosir Beras Jaya Bersama',
          subdomain: 'berasjaya',
          role: 'OWNER',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['OWNER'] as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Pasar Induk Kramat Jati',
        },
      ],
    },
    {
      userId: 'a0000001-0001-0000-0000-000000000002',
      fullName: 'Agus Gudang',
      email: 'agus@berasjaya.com',
      phoneNumber: '081234567892',
      pin: '3344',
      tenants: [
        {
          tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
          businessName: 'Toko Grosir Beras Jaya Bersama',
          subdomain: 'berasjaya',
          role: 'WAREHOUSE',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['WAREHOUSE'] as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Pasar Induk Kramat Jati',
        },
      ],
    },
    {
      userId: 'a0000001-0001-0000-0000-000000000003',
      fullName: 'Siti Rahma',
      email: 'siti@berasjaya.com',
      phoneNumber: '081234567891',
      pin: '2468',
      tenants: [
        {
          tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
          businessName: 'Toko Grosir Beras Jaya Bersama',
          subdomain: 'berasjaya',
          role: 'CASHIER',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['CASHIER'] as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Pasar Induk Kramat Jati',
        },
      ],
    },
    {
      userId: 'a0000001-0001-0000-0000-000000000004',
      fullName: 'Joko Supir',
      email: 'joko@berasjaya.com',
      phoneNumber: '081234567893',
      pin: '5566',
      tenants: [
        {
          tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
          businessName: 'Toko Grosir Beras Jaya Bersama',
          subdomain: 'berasjaya',
          role: 'DRIVER',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['DRIVER'] as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Pasar Induk Kramat Jati',
        },
      ],
    },
    {
      userId: 'a0000002-0001-0000-0000-000000000001',
      fullName: 'Hendro Makmur',
      email: 'hendro@sembakonusantara.com',
      phoneNumber: '081398765432',
      pin: '9999',
      tenants: [
        {
          tenantId: 'd5c9f320-1942-493b-cd02-34b0df9f23e5',
          businessName: 'CV Sembako Nusantara Makmur',
          subdomain: 'sembakonusantara',
          role: 'OWNER',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['OWNER'] as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000002',
          branchName: 'Gudang Distribusi Cipinang',
        },
      ],
    },
    {
      userId: 'a0000003-0001-0000-0000-000000000001',
      fullName: 'Iwan Mitra',
      email: 'investor@mitraretail.com',
      phoneNumber: '081198765432',
      pin: '7788',
      tenants: [
        {
          tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
          businessName: 'Toko Grosir Beras Jaya Bersama',
          subdomain: 'berasjaya',
          role: 'STORE_MANAGER',
          permissions: [PermissionKey.CATALOG_VIEW, PermissionKey.FINANCE_REPORTS],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Pasar Induk Kramat Jati',
        },
        {
          tenantId: 'd5c9f320-1942-493b-cd02-34b0df9f23e5',
          businessName: 'CV Sembako Nusantara Makmur',
          subdomain: 'sembakonusantara',
          role: 'STORE_MANAGER',
          permissions: [PermissionKey.CATALOG_VIEW, PermissionKey.FINANCE_REPORTS],
          branchId: 'b0000000-0000-0000-0000-000000000002',
          branchName: 'Gudang Distribusi Cipinang',
        },
      ],
    },
  ];

  /**
   * Authenticates by email or phone.
   */
  async login(identifier: string, _credential?: string): Promise<AuthenticatedUserSession> {
    const user = this.staffCatalog.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.phoneNumber === identifier ||
        u.pin === identifier,
    );

    if (!user) {
      throw new Error(`Kredensial tidak valid: user '${identifier}' tidak ditemukan.`);
    }

    const activeTenant = user.tenants[0];
    if (!activeTenant) {
      throw new Error(`User '${identifier}' tidak terdaftar di tenant aktif manapun.`);
    }

    const sessionToken = `tok_sess_${user.userId.slice(-8)}_${Date.now()}`;

    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      activeTenant,
      availableTenants: user.tenants,
      sessionToken,
    };
  }

  /**
   * Switches the active tenant workspace.
   */
  selectTenant(userId: string, targetTenantId: string): UserTenantMembership {
    const user = this.staffCatalog.find((u) => u.userId === userId);
    if (!user) {
      throw new Error(`User '${userId}' tidak ditemukan.`);
    }

    const targetMembership = user.tenants.find((t) => t.tenantId === targetTenantId);
    if (!targetMembership) {
      throw new Error(`User '${user.fullName}' tidak memiliki akses ke tenant ID: ${targetTenantId}`);
    }

    return targetMembership;
  }

  /**
   * Returns the canonical metadata catalog for rendering the Checkbox Permission Matrix in the UI.
   */
  getPermissionsCatalog() {
    return PERMISSION_DEFINITIONS;
  }

  /**
   * Allows an Owner to update capability checkboxes for a staff member.
   */
  updateStaffPermissions(
    staffId: string,
    tenantId: string,
    newPermissions: PermissionKey[],
  ): UserTenantMembership {
    const user = this.staffCatalog.find((u) => u.userId === staffId);
    if (!user) {
      throw new Error(`Staff dengan ID '${staffId}' tidak ditemukan.`);
    }

    const tenantMembership = user.tenants.find((t) => t.tenantId === tenantId);
    if (!tenantMembership) {
      throw new Error(`Staff '${user.fullName}' tidak terdaftar di tenant '${tenantId}'.`);
    }

    tenantMembership.permissions = [...newPermissions];
    return tenantMembership;
  }

  /**
   * Checks whether a user has a specific permission checkbox.
   */
  hasPermission(membership: UserTenantMembership, permission: PermissionKey): boolean {
    if (membership.role === 'OWNER') return true;
    return membership.permissions.includes(permission);
  }
}
