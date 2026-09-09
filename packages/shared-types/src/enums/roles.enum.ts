/**
 * Tenant Staff Roles in SiDaya
 */
export enum UserRole {
  OWNER = 'OWNER',
  STORE_MANAGER = 'STORE_MANAGER',
  CASHIER = 'CASHIER',
  SALESMAN = 'SALESMAN',
  WAREHOUSE = 'WAREHOUSE',
}

/**
 * Access Control Matrix for Role capabilities
 */
export const ROLE_PERMISSIONS = {
  [UserRole.OWNER]: {
    canViewCOGS: true,
    canOverridePrices: true,
    canVoidTransactions: true,
    canManageStaff: true,
    canAccessFinancialReports: true,
    canManageInboundPO: true,
  },
  [UserRole.STORE_MANAGER]: {
    canViewCOGS: true,
    canOverridePrices: true,
    canVoidTransactions: true,
    canManageStaff: false,
    canAccessFinancialReports: true,
    canManageInboundPO: true,
  },
  [UserRole.CASHIER]: {
    canViewCOGS: false, // Strictly masked via PostgreSQL RLS
    canOverridePrices: false,
    canVoidTransactions: false,
    canManageStaff: false,
    canAccessFinancialReports: false,
    canManageInboundPO: false,
  },
  [UserRole.SALESMAN]: {
    canViewCOGS: false,
    canOverridePrices: false,
    canVoidTransactions: false,
    canManageStaff: false,
    canAccessFinancialReports: false,
    canManageInboundPO: false,
  },
  [UserRole.WAREHOUSE]: {
    canViewCOGS: false,
    canOverridePrices: false,
    canVoidTransactions: false,
    canManageStaff: false,
    canAccessFinancialReports: false,
    canManageInboundPO: true,
  },
} as const;
