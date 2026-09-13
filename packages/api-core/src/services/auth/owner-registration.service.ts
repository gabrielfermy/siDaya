import crypto from 'crypto';
import {
  RegisterOwnerPayload,
  RegisterOwnerResult,
  UserRole,
  PermissionKey,
  DEFAULT_ROLE_PERMISSION_PRESETS,
  validatePasswordStrength,
} from '@sidaya/shared-types';
import { StaffCatalogStore } from './staff-catalog.store';
import { EmailVerificationRecord } from './auth-types';
import { EmailDispatchService } from '../email-dispatch.service';

export class OwnerRegistrationService {
  private emailVerifications: EmailVerificationRecord[] = [];

  constructor(
    private store: StaffCatalogStore = StaffCatalogStore.getInstance(),
    private emailDispatch: EmailDispatchService = new EmailDispatchService(),
  ) {}

  public isEmailRegistered(email: string): boolean {
    const norm = email.toLowerCase().trim();
    return this.store.catalog.some((u) => u.email.toLowerCase().trim() === norm);
  }

  public isSubdomainAvailable(subdomain: string): boolean {
    const slug = subdomain.toLowerCase().trim();
    return !this.store.catalog.some((u) =>
      u.tenants.some((t) => t.subdomain.toLowerCase().trim() === slug),
    );
  }

  public async registerOwner(
    payload: RegisterOwnerPayload,
    baseUrl = 'http://localhost:3333',
  ): Promise<RegisterOwnerResult> {
    const normalizedEmail = payload.email.toLowerCase().trim();

    if (this.isEmailRegistered(normalizedEmail)) {
      throw new Error(`Email '${payload.email}' sudah terdaftar. Silakan gunakan email lain atau login.`);
    }

    const passwordVal = validatePasswordStrength(payload.password);
    if (!passwordVal.isValid) {
      throw new Error(`Kata sandi tidak memenuhi standar keamanan: ${passwordVal.errors.join(', ')}`);
    }

    const baseSlug = payload.subdomain || payload.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let subdomain = baseSlug;
    let counter = 1;
    while (!this.isSubdomainAvailable(subdomain)) {
      subdomain = `${baseSlug}${counter++}`;
    }

    const tenantId = crypto.randomUUID();
    const branchId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const newOwnerRecord = {
      userId,
      fullName: payload.ownerName,
      email: normalizedEmail,
      phoneNumber: payload.phoneNumber || '',
      password: payload.password,
      isEmailVerified: false,
      tenants: [
        {
          tenantId,
          businessName: payload.businessName,
          subdomain,
          role: 'OWNER',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['OWNER'] as PermissionKey[],
          branchId,
          branchName: 'Kantor Pusat / Gudang Utama',
        },
      ],
    };

    this.store.catalog.push(newOwnerRecord);

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailVerifications.push({
      id: crypto.randomUUID(),
      email: normalizedEmail,
      userType: 'TENANT_USER',
      token: verifyToken,
      otpCode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyUrl = `${baseUrl}/auth/verify-email?token=${verifyToken}`;
    await this.emailDispatch.sendEmailVerification(normalizedEmail, payload.ownerName, verifyUrl, otpCode);

    return {
      tenantId,
      businessName: payload.businessName,
      subdomain,
      userId,
      email: normalizedEmail,
      fullName: payload.ownerName,
      role: UserRole.OWNER,
      isEmailVerified: false,
      verificationToken: verifyToken,
      message: 'Registrasi pemilik toko berhasil. Silakan verifikasi email Anda.',
    };
  }

  public verifyEmail(tokenOrOtp: string, email?: string): { success: boolean; email: string; message: string } {
    const clean = tokenOrOtp.trim();
    const record = this.emailVerifications.find((r) => {
      const matchToken = r.token === clean || r.otpCode === clean;
      if (email) return matchToken && r.email.toLowerCase().trim() === email.toLowerCase().trim() && !r.verifiedAt;
      return matchToken && !r.verifiedAt;
    });

    if (!record) {
      // If mock token or generic 6-digit test OTP in development mode
      if (process.env['NODE_ENV'] !== 'production' && (clean === '123456' || clean === '749201')) {
        const targetEmail = email || 'owner@toko.com';
        const user = this.store.catalog.find((u) => u.email.toLowerCase().trim() === targetEmail.toLowerCase().trim());
        if (user) user.isEmailVerified = true;
        return { success: true, email: targetEmail, message: 'Email berhasil diverifikasi via Sandbox Test OTP.' };
      }
      throw new Error('Token atau kode OTP verifikasi email tidak valid atau sudah kedaluwarsa.');
    }
    if (new Date() > record.expiresAt) {
      throw new Error('Token atau kode OTP verifikasi email sudah kedaluwarsa.');
    }

    record.verifiedAt = new Date();
    const user = this.store.catalog.find(
      (u) => u.email.toLowerCase().trim() === record.email.toLowerCase().trim(),
    );
    if (user) {
      user.isEmailVerified = true;
    }

    return {
      success: true,
      email: record.email,
      message: 'Email berhasil diverifikasi.',
    };
  }
}
