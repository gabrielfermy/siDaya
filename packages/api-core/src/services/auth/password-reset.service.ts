import crypto from 'crypto';
import {
  ResetPasswordPayload,
  validatePasswordStrength,
} from '@sidaya/shared-types';
import { StaffCatalogStore } from './staff-catalog.store';
import { PasswordResetTokenRecord } from './auth-types';
import { EmailDispatchService } from '../email-dispatch.service';

export class PasswordResetService {
  private resetTokens: PasswordResetTokenRecord[] = [];

  constructor(
    private store: StaffCatalogStore = StaffCatalogStore.getInstance(),
    private emailDispatch: EmailDispatchService = new EmailDispatchService(),
  ) {}

  public async requestPasswordReset(
    email: string,
    userType: 'TENANT_USER' | 'PLATFORM_OPERATOR' = 'TENANT_USER',
    baseUrl = 'http://localhost:3333',
  ): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    this.resetTokens.push({
      id: crypto.randomUUID(),
      email: normalizedEmail,
      userType,
      token: tokenHash,
      expiresAt,
    });

    const resetUrl = `${baseUrl}/auth/reset-password?token=${rawToken}`;
    await this.emailDispatch.sendPasswordReset(normalizedEmail, 'Pengguna SiDaya', resetUrl);

    return {
      success: true,
      message: 'Instruksi reset kata sandi telah dikirim ke email Anda jika terdaftar.',
    };
  }

  public async confirmPasswordReset(payload: ResetPasswordPayload): Promise<{
    success: boolean;
    email: string;
    message: string;
  }> {
    const tokenHash = crypto.createHash('sha256').update(payload.token).digest('hex');
    const record = this.resetTokens.find((r) => r.token === tokenHash && !r.usedAt);

    if (!record) {
      throw new Error('Token reset kata sandi tidak valid atau sudah digunakan.');
    }
    if (new Date() > record.expiresAt) {
      throw new Error('Token reset kata sandi sudah kedaluwarsa.');
    }

    const passwordVal = validatePasswordStrength(payload.newPassword);
    if (!passwordVal.isValid) {
      throw new Error(`Kata sandi baru tidak memenuhi syarat: ${passwordVal.errors.join(', ')}`);
    }

    record.usedAt = new Date();

    const user = this.store.catalog.find(
      (u) => u.email.toLowerCase().trim() === record.email.toLowerCase().trim(),
    );
    if (user) {
      user.password = payload.newPassword;
    }

    return {
      success: true,
      email: record.email,
      message: 'Kata sandi berhasil diperbarui. Silakan login kembali.',
    };
  }
}
