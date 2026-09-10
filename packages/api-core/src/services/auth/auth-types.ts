import { PermissionKey } from '@sidaya/shared-types';

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
  isEmailVerified: boolean;
}

export interface PasswordResetTokenRecord {
  id: string;
  email: string;
  userType: 'TENANT_USER' | 'PLATFORM_OPERATOR';
  token: string;
  expiresAt: Date;
  usedAt?: Date;
}

export interface EmailVerificationRecord {
  id: string;
  email: string;
  userType: 'TENANT_USER' | 'PLATFORM_OPERATOR';
  token: string;
  expiresAt: Date;
  verifiedAt?: Date;
}

export interface StaffCatalogItem {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  pin?: string;
  password?: string;
  isEmailVerified: boolean;
  tenants: UserTenantMembership[];
}
