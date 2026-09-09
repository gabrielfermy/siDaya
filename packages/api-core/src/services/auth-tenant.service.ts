import {
  PermissionKey,
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_PRESETS,
  UserRole,
  RegisterOwnerPayload,
  RegisterOwnerResult,
  InviteStaffPayload,
  UserInvitationRecord,
  AcceptStaffInvitePayload,
  ResetPasswordPayload,
  validatePasswordStrength,
} from '@sidaya/shared-types';
import { EmailDispatchService } from './email-dispatch.service.js';

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

export class AuthTenantDomainService {
  /**
   * In-memory / database aligned registry of tenant staff
   */
  private staffCatalog = [
    {
      userId: 'a0000001-0001-0000-0000-000000000001',
      fullName: 'Budi Santoso',
      email: 'budi@berasjaya.com',
      phoneNumber: '081234567890',
      pin: '1234',
      password: 'Password123!',
      isEmailVerified: true,
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
      password: 'Password123!',
      isEmailVerified: true,
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
      password: 'Password123!',
      isEmailVerified: true,
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
      password: 'Password123!',
      isEmailVerified: true,
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
      password: 'Password123!',
      isEmailVerified: true,
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
      password: 'Password123!',
      isEmailVerified: true,
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
      ],
    },
  ];

  private invitations: UserInvitationRecord[] = [];
  private passwordResetTokens: PasswordResetTokenRecord[] = [];
  private emailVerifications: EmailVerificationRecord[] = [];

  /**
   * Helper: Check if email already exists globally in tenant catalog
   */
  isEmailRegistered(email: string): boolean {
    const target = email.trim().toLowerCase();
    return this.staffCatalog.some((u) => u.email.trim().toLowerCase() === target);
  }

  /**
   * 1. Merchant Owner Self-Registration (Creates Tenant Group & Billing POC)
   */
  async registerOwner(
    payload: RegisterOwnerPayload,
    emailService?: EmailDispatchService,
    baseUrl?: string,
  ): Promise<RegisterOwnerResult> {
    const cleanEmail = payload.email.trim().toLowerCase();

    // 1. Validate email uniqueness
    if (this.isEmailRegistered(cleanEmail)) {
      throw new Error(`Email '${payload.email}' sudah terdaftar di sistem. Gunakan email lain.`);
    }

    // 2. Validate Password Policy
    const passwordCheck = validatePasswordStrength(payload.password);
    if (!passwordCheck.isValid) {
      throw new Error(`Kata sandi tidak memenuhi standar keamanan: ${passwordCheck.errors.join(', ')}`);
    }

    // 3. Create Tenant & User
    const newTenantId = `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBranchId = `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUserId = `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanSubdomain = payload.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

    const newOwnerRecord = {
      userId: newUserId,
      fullName: payload.ownerName,
      email: cleanEmail,
      phoneNumber: payload.phoneNumber,
      pin: '0000',
      password: payload.password,
      isEmailVerified: false,
      tenants: [
        {
          tenantId: newTenantId,
          businessName: payload.businessName,
          subdomain: cleanSubdomain,
          role: 'OWNER',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['OWNER'] as PermissionKey[],
          branchId: newBranchId,
          branchName: 'Kantor Utama / Cabang 1',
        },
      ],
    };

    this.staffCatalog.push(newOwnerRecord);

    // 4. Generate Email Verification Token
    const verificationToken = `ver_${Math.random().toString(36).substring(2)}${Date.now()}`;
    this.emailVerifications.push({
      id: `ev_${Date.now()}`,
      email: cleanEmail,
      userType: 'TENANT_USER',
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // 5. Dispatch Verification Email via Resend
    if (emailService) {
      const verificationDomain = baseUrl || 'http://localhost:3333';
      const verifyUrl = `${verificationDomain}/verify-email?token=${verificationToken}`;
      await emailService.sendEmailVerification(cleanEmail, payload.ownerName, verifyUrl);
    }

    return {
      tenantId: newTenantId,
      businessName: payload.businessName,
      subdomain: cleanSubdomain,
      userId: newUserId,
      email: cleanEmail,
      fullName: payload.ownerName,
      role: UserRole.OWNER,
      isEmailVerified: false,
      verificationToken,
      message: 'Registrasi pemilik toko berhasil. Silakan periksa email Anda untuk memverifikasi akun.',
    };
  }

  /**
   * 2. Verify Email Token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; email: string; message: string }> {
    const record = this.emailVerifications.find((r) => r.token === token);
    if (!record) {
      throw new Error('Token verifikasi tidak valid atau telah kadaluarsa.');
    }

    if (record.expiresAt < new Date()) {
      throw new Error('Token verifikasi telah kadaluarsa. Silakan minta tautan baru.');
    }

    record.verifiedAt = new Date();

    const user = this.staffCatalog.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
    if (user) {
      user.isEmailVerified = true;
    }

    return {
      success: true,
      email: record.email,
      message: 'Email berhasil diverifikasi. Akun Anda telah aktif sepenuhnya.',
    };
  }

  /**
   * 3. Request Password Reset Link
   */
  async requestPasswordReset(
    email: string,
    emailService?: EmailDispatchService,
    baseUrl?: string,
  ): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.staffCatalog.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Return ambiguous message for security
      return {
        success: true,
        message: 'Jika email terdaftar, instruksi atur ulang kata sandi telah dikirimkan ke kotak masuk Anda.',
      };
    }

    const resetToken = `rst_${Math.random().toString(36).substring(2)}${Date.now()}`;
    this.passwordResetTokens.push({
      id: `pr_${Date.now()}`,
      email: cleanEmail,
      userType: 'TENANT_USER',
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour validity
    });

    if (emailService) {
      const resetDomain = baseUrl || 'http://localhost:3333';
      const resetUrl = `${resetDomain}/reset-password?token=${resetToken}`;
      await emailService.sendPasswordReset(cleanEmail, user.fullName, resetUrl);
    }

    return {
      success: true,
      message: 'Instruksi atur ulang kata sandi telah dikirimkan ke email Anda.',
      resetToken,
    };
  }

  /**
   * 4. Reset Password with Token
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<{ success: boolean; message: string }> {
    const record = this.passwordResetTokens.find((r) => r.token === payload.token);
    if (!record || record.usedAt) {
      throw new Error('Token atur ulang kata sandi tidak valid atau telah digunakan.');
    }

    if (record.expiresAt < new Date()) {
      throw new Error('Token atur ulang kata sandi telah kadaluarsa.');
    }

    const passwordCheck = validatePasswordStrength(payload.newPassword);
    if (!passwordCheck.isValid) {
      throw new Error(`Kata sandi baru tidak memenuhi syarat: ${passwordCheck.errors.join(', ')}`);
    }

    const user = this.staffCatalog.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
    if (!user) {
      throw new Error('Akun pengguna tidak ditemukan.');
    }

    user.password = payload.newPassword;
    record.usedAt = new Date();

    return {
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru Anda.',
    };
  }

  /**
   * 5. Tenant Staff Invitation (Kasir, Gudang, Driver)
   */
  async inviteStaff(
    payload: InviteStaffPayload,
    emailService?: EmailDispatchService,
    baseUrl?: string,
  ): Promise<UserInvitationRecord> {
    const cleanEmail = payload.email.trim().toLowerCase();

    if (this.isEmailRegistered(cleanEmail)) {
      throw new Error(`Email '${payload.email}' sudah terdaftar di sistem.`);
    }

    const existingInvite = this.invitations.find(
      (inv) => inv.email.toLowerCase() === cleanEmail && !inv.acceptedAt && new Date(inv.expiresAt) > new Date(),
    );
    if (existingInvite) {
      throw new Error(`Undangan aktif untuk email '${payload.email}' sudah dikirim sebelumnya.`);
    }

    const inviteToken = `inv_stf_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const invitation: UserInvitationRecord = {
      id: `inv_${Date.now()}`,
      tenantId: payload.tenantId,
      email: cleanEmail,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
      token: inviteToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString(),
    };

    this.invitations.push(invitation);

    if (emailService) {
      const inviteDomain = baseUrl || 'http://localhost:3333';
      const inviteUrl = `${inviteDomain}/accept-invite?token=${inviteToken}`;
      await emailService.sendStaffInvitation(cleanEmail, payload.fullName, 'Toko Anda', payload.role, inviteUrl);
    }

    return invitation;
  }

  /**
   * 6. Accept Staff Invitation & Create User Record
   */
  async acceptStaffInvite(payload: AcceptStaffInvitePayload): Promise<AuthenticatedUserSession> {
    const invite = this.invitations.find((i) => i.token === payload.token);
    if (!invite || invite.acceptedAt) {
      throw new Error('Undangan tidak valid atau telah diterima sebelumnya.');
    }

    if (new Date(invite.expiresAt) < new Date()) {
      throw new Error('Undangan telah kadaluarsa. Minta pemilik toko untuk mengirim undangan baru.');
    }

    const passwordCheck = validatePasswordStrength(payload.password);
    if (!passwordCheck.isValid) {
      throw new Error(`Kata sandi tidak memenuhi standar: ${passwordCheck.errors.join(', ')}`);
    }

    const newUserId = `u_stf_${Date.now()}`;
    const newStaffUser = {
      userId: newUserId,
      fullName: invite.fullName,
      email: invite.email,
      phoneNumber: invite.phoneNumber,
      pin: payload.pin || '0000',
      password: payload.password,
      isEmailVerified: true,
      tenants: [
        {
          tenantId: invite.tenantId,
          businessName: 'Toko Terdaftar',
          subdomain: 'merchant',
          role: invite.role,
          permissions: (DEFAULT_ROLE_PERMISSION_PRESETS[invite.role as keyof typeof DEFAULT_ROLE_PERMISSION_PRESETS] ||
            []) as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Cabang Utama',
        },
      ],
    };

    this.staffCatalog.push(newStaffUser);
    invite.acceptedAt = new Date().toISOString();

    return this.login(invite.email, payload.password);
  }

  /**
   * 7. List Staff & Pending Invitations for a Tenant
   */
  listTenantStaff(tenantId: string) {
    const activeStaff = this.staffCatalog
      .filter((u) => u.tenants.some((t) => t.tenantId === tenantId))
      .map((u) => {
        const membership = u.tenants.find((t) => t.tenantId === tenantId)!;
        return {
          userId: u.userId,
          fullName: u.fullName,
          email: u.email,
          phoneNumber: u.phoneNumber,
          role: membership.role,
          permissions: membership.permissions,
          isEmailVerified: u.isEmailVerified,
          status: 'ACTIVE',
        };
      });

    const pendingInvites = this.invitations
      .filter((i) => i.tenantId === tenantId && !i.acceptedAt)
      .map((i) => ({
        id: i.id,
        fullName: i.fullName,
        email: i.email,
        phoneNumber: i.phoneNumber,
        role: i.role,
        token: i.token,
        status: 'PENDING_INVITATION',
        expiresAt: i.expiresAt,
      }));

    return {
      activeStaff,
      pendingInvites,
    };
  }

  /**
   * Authenticates by email or phone or pin
   */
  async login(identifier: string, credential?: string): Promise<AuthenticatedUserSession> {
    const user = this.staffCatalog.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.phoneNumber === identifier ||
        u.pin === identifier,
    );

    if (!user) {
      throw new Error(`Kredensial tidak valid: user '${identifier}' tidak ditemukan.`);
    }

    if (credential && user.password && user.password !== credential && user.pin !== credential) {
      throw new Error('Kata sandi / PIN yang Anda masukkan salah.');
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
      isEmailVerified: user.isEmailVerified,
    };
  }

  /**
   * Switches active tenant workspace
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
   * Returns canonical permission definitions
   */
  getPermissionsCatalog() {
    return PERMISSION_DEFINITIONS;
  }

  /**
   * Update staff permissions
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
   * Check permissions
   */
  hasPermission(membership: UserTenantMembership, permission: PermissionKey): boolean {
    if (membership.role === 'OWNER') return true;
    return membership.permissions.includes(permission);
  }
}
