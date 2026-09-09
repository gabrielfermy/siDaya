import crypto from 'crypto';

export interface CashierPinSession {
  userId: string;
  tenantId: string;
  fullName: string;
  role: string;
  permissions: string[];
  sessionToken: string;
  authenticatedAt: Date;
}

export class PinAuthDomainService {
  /**
   * Fast Cashier PIN hashing using SHA-256 with tenant salt.
   */
  public hashPin(pin: string, salt: string = 'sidaya_tenant_pin_salt'): string {
    return crypto
      .createHmac('sha256', salt)
      .update(pin.trim())
      .digest('hex');
  }

  /**
   * Verify cashier 4-6 digit PIN for fast station switching.
   */
  public verifyPin(inputPin: string, storedHash: string, salt: string = 'sidaya_tenant_pin_salt'): boolean {
    const computed = this.hashPin(inputPin, salt);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  }

  /**
   * Generate an ephemeral station session token for the cashier on duty.
   */
  public createStationSession(
    userId: string,
    tenantId: string,
    fullName: string,
    role: string,
    permissions: string[]
  ): CashierPinSession {
    const sessionToken = `ses_pin_${userId.slice(-6)}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    return {
      userId,
      tenantId,
      fullName,
      role,
      permissions,
      sessionToken,
      authenticatedAt: new Date(),
    };
  }
}

export const pinAuthService = new PinAuthDomainService();
