import { StaffCatalogStore } from './staff-catalog.store';
import { AuthenticatedUserSession } from './auth-types';
import {
  verifyPassword,
  hashPassword,
  verifyPin,
  hashPin,
  signJwtToken,
  timingSafeEqualStrings,
} from '../../security/crypto-utils';

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
      let isMatch = false;

      // 1. Check password
      if (user.password) {
        if (user.password.startsWith('scrypt$')) {
          isMatch = await verifyPassword(credential, user.password);
        } else {
          // Backward compatibility check for seed data + auto-upgrade to scrypt
          if (timingSafeEqualStrings(credential, user.password)) {
            isMatch = true;
            user.password = await hashPassword(credential);
          }
        }
      }

      // 2. Check PIN
      if (!isMatch && user.pin) {
        if (user.pin.startsWith('pin_pbkdf2$')) {
          isMatch = verifyPin(credential, user.pin);
        } else {
          if (timingSafeEqualStrings(credential, user.pin)) {
            isMatch = true;
            user.pin = hashPin(credential);
          }
        }
      }

      if (!isMatch) {
        throw new Error('Kata sandi atau PIN salah.');
      }
    }

    if (!user.tenants || user.tenants.length === 0) {
      throw new Error('Akun ini tidak memiliki akses ke toko manapun.');
    }

    const activeTenant = user.tenants[0]!;

    // Generate real cryptographically signed JWT token embedding user identity, tenant binding, and permissions
    const sessionToken = signJwtToken({
      userId: user.userId,
      tenantId: activeTenant.tenantId,
      role: activeTenant.role,
      permissions: (activeTenant.permissions || []) as string[],
      email: user.email,
      fullName: user.fullName,
    });

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
    // Store securely hashed PIN
    user.pin = hashPin(pin);
    return { success: true, message: 'PIN staf berhasil diperbarui.' };
  }
}

