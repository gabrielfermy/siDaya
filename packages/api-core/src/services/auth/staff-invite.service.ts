import crypto from 'crypto';
import {
  InviteStaffPayload,
  UserInvitationRecord,
  AcceptStaffInvitePayload,
  PermissionKey,
  DEFAULT_ROLE_PERMISSION_PRESETS,
  validatePasswordStrength,
} from '@sidaya/shared-types';
import { StaffCatalogStore } from './staff-catalog.store';
import { EmailDispatchService } from '../email-dispatch.service';

export class StaffInviteService {
  private invitations: UserInvitationRecord[] = [];

  constructor(
    private store: StaffCatalogStore = StaffCatalogStore.getInstance(),
    private emailDispatch: EmailDispatchService = new EmailDispatchService(),
  ) {}

  public async inviteStaff(
    payload: InviteStaffPayload,
    baseUrl = 'http://localhost:3333',
  ): Promise<UserInvitationRecord> {
    const normalizedEmail = payload.email.toLowerCase().trim();

    const existingUser = this.store.catalog.find(
      (u) => u.email.toLowerCase().trim() === normalizedEmail,
    );
    if (existingUser && existingUser.tenants.some((t) => t.tenantId === payload.tenantId)) {
      throw new Error(`Pengguna dengan email '${payload.email}' sudah menjadi anggota di toko ini.`);
    }

    const pendingInvite = this.invitations.find(
      (inv) =>
        inv.tenantId === payload.tenantId &&
        inv.email.toLowerCase().trim() === normalizedEmail &&
        !inv.acceptedAt,
    );
    if (pendingInvite && new Date() < new Date(pendingInvite.expiresAt)) {
      throw new Error(`Undangan untuk '${payload.email}' masih aktif dan menunggu konfirmasi.`);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const invitationRecord: UserInvitationRecord = {
      id: crypto.randomUUID(),
      tenantId: payload.tenantId,
      email: normalizedEmail,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber || '',
      role: payload.role,
      token: rawToken,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    this.invitations.push(invitationRecord);

    const inviteUrl = `${baseUrl}/auth/invite-accept?token=${rawToken}`;
    await this.emailDispatch.sendStaffInvitation(
      normalizedEmail,
      payload.fullName,
      'Pemilik Toko',
      payload.role,
      inviteUrl,
    );

    return invitationRecord;
  }

  public async acceptStaffInvite(payload: AcceptStaffInvitePayload): Promise<{
    userId: string;
    tenantId: string;
    role: string;
    message: string;
  }> {
    const invite = this.invitations.find((inv) => inv.token === payload.token);

    if (!invite) {
      throw new Error('Token undangan tidak valid.');
    }
    if (invite.acceptedAt) {
      throw new Error('Undangan sudah diterima sebelumnya.');
    }
    if (new Date() > new Date(invite.expiresAt)) {
      throw new Error('Undangan telah kedaluwarsa. Minta pemilik toko mengirimkan undangan baru.');
    }

    const passwordVal = validatePasswordStrength(payload.password);
    if (!passwordVal.isValid) {
      throw new Error(`Kata sandi tidak memenuhi standar keamanan: ${passwordVal.errors.join(', ')}`);
    }

    let existingUser = this.store.catalog.find(
      (u) => u.email.toLowerCase().trim() === invite.email.toLowerCase().trim(),
    );
    let userId: string;

    const tenantMembership = {
      tenantId: invite.tenantId,
      businessName: 'Toko SiDaya',
      subdomain: 'toko',
      role: invite.role,
      permissions: (DEFAULT_ROLE_PERMISSION_PRESETS[invite.role] || []) as PermissionKey[],
      branchId: 'b0000000-0000-0000-0000-000000000001',
      branchName: 'Cabang Utama',
    };

    if (existingUser) {
      userId = existingUser.userId;
      existingUser.password = payload.password;
      if (payload.pin) existingUser.pin = payload.pin;
      existingUser.tenants.push(tenantMembership);
    } else {
      userId = crypto.randomUUID();
      this.store.catalog.push({
        userId,
        fullName: invite.fullName,
        email: invite.email,
        phoneNumber: invite.phoneNumber || '',
        password: payload.password,
        ...(payload.pin ? { pin: payload.pin } : {}),
        isEmailVerified: true,
        tenants: [tenantMembership],
      });
    }

    invite.acceptedAt = new Date().toISOString();

    return {
      userId,
      tenantId: invite.tenantId,
      role: invite.role,
      message: 'Undangan berhasil diterima. Akun staf telah aktif.',
    };
  }
}
