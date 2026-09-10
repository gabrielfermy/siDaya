import crypto from 'crypto';
import { StaffCatalogStore } from './staff-catalog.store';
import { AuthenticatedUserSession } from './auth-types';

export class TokenAuthService {
  constructor(private store: StaffCatalogStore = StaffCatalogStore.getInstance()) {}

  public async login(
    identifier: string,
    credential?: string,
  ): Promise<AuthenticatedUserSession> {
    const cleanId = identifier.toLowerCase().trim();
    const user = this.store.catalog.find(
      (u) => u.email.toLowerCase().trim() === cleanId || u.phoneNumber === cleanId,
    );

    if (!user) {
      throw new Error('Kredensial tidak valid. Email atau Nomor HP tidak ditemukan.');
    }

    if (credential) {
      const isPasswordMatch = user.password && user.password === credential;
      const isPinMatch = user.pin && user.pin === credential;

      if (!isPasswordMatch && !isPinMatch) {
        throw new Error('Kata sandi atau PIN salah.');
      }
    }

    if (!user.tenants || user.tenants.length === 0) {
      throw new Error('Akun ini tidak memiliki akses ke toko manapun.');
    }

    const activeTenant = user.tenants[0]!;
    const sessionToken = `jwt_mock_${crypto.randomBytes(24).toString('hex')}`;

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

  public getStaffByTenantId(tenantId: string) {
    return this.store.catalog
      .filter((u) => u.tenants.some((t) => t.tenantId === tenantId))
      .map((u) => {
        const tenantInfo = u.tenants.find((t) => t.tenantId === tenantId)!;
        return {
          id: u.userId,
          name: u.fullName,
          email: u.email,
          phone: u.phoneNumber,
          role: tenantInfo.role,
          status: 'ACTIVE',
          pinConfigured: !!u.pin,
          branchName: tenantInfo.branchName,
        };
      });
  }

  public setStaffPin(tenantId: string, staffId: string, pin: string) {
    const user = this.store.catalog.find(
      (u) => u.userId === staffId && u.tenants.some((t) => t.tenantId === tenantId),
    );
    if (!user) {
      throw new Error('Staf tidak ditemukan pada toko ini.');
    }
    user.pin = pin;
    return { success: true, message: 'PIN staf berhasil diperbarui.' };
  }
}
