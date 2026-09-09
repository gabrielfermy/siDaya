import crypto from 'crypto';

export interface BreakGlassSession {
  token: string;
  operatorId: string;
  ticketNumber: string;
  reason: string;
  grantedAt: Date;
  expiresAt: Date;
}

export class PdpMaskingDomainService {
  private activeBreakGlassSessions: Map<string, BreakGlassSession> = new Map();

  /**
   * Mask full name for UU PDP No. 27/2022 compliance.
   * e.g., "Budi Santoso" -> "B*** S***"
   */
  public maskFullName(fullName: string): string {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(part => (part.length > 1 ? `${part[0]}***` : part))
      .join(' ');
  }

  /**
   * Mask phone number for UU PDP No. 27/2022 compliance.
   * e.g., "+6281234567890" -> "+6281****7890"
   */
  public maskPhoneNumber(phone: string): string {
    if (!phone) return '';
    const clean = phone.trim();
    if (clean.length < 8) return '****';
    const start = clean.slice(0, 5);
    const end = clean.slice(-4);
    return `${start}****${end}`;
  }

  /**
   * Mask email address.
   * e.g., "budi@berasjaya.com" -> "b***@berasjaya.com"
   */
  public maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '';
    const parts = email.split('@');
    const user = parts[0] || '';
    const domain = parts[1] || '';
    const maskedUser = user.length > 1 ? `${user[0]}***` : '*';
    return `${maskedUser}@${domain}`;
  }

  /**
   * Authorize a Break-Glass emergency unmasking session.
   * STRICT SECURITY INVARIANT:
   * A valid external Support Ticket reference (e.g. INC-9482) is MANDATORY.
   */
  public createBreakGlassSession(
    operatorId: string,
    ticketNumber: string,
    reason: string
  ): BreakGlassSession {
    if (!ticketNumber || ticketNumber.trim().length === 0) {
      throw new Error('Nomor tiket darurat (Ticket Reference) wajib diisi untuk membuka sensor PDP.');
    }
    if (!reason || reason.trim().length === 0) {
      throw new Error('Alasan pembukaan data (Justification Reason) wajib disertakan.');
    }

    const token = `tok_bg_${operatorId.slice(-6)}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const session: BreakGlassSession = {
      token,
      operatorId,
      ticketNumber,
      reason,
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes validity
    };

    this.activeBreakGlassSessions.set(token, session);
    return session;
  }

  /**
   * Validate if a break-glass session token is currently valid and unexpired.
   */
  public isBreakGlassActive(token?: string): boolean {
    if (!token) return false;
    const session = this.activeBreakGlassSessions.get(token);
    if (!session) return false;
    if (new Date() > session.expiresAt) {
      this.activeBreakGlassSessions.delete(token);
      return false;
    }
    return true;
  }
}

export const pdpMaskingService = new PdpMaskingDomainService();
