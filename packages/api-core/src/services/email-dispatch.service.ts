export interface EmailDispatchOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface DispatchedEmailRecord {
  id: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  timestamp: string;
  provider: 'RESEND' | 'MOCK';
  status: 'SENT' | 'QUEUED' | 'MOCKED';
}

export class EmailDispatchService {
  private resendApiKey: string;
  private fromEmail: string;
  private sentLog: DispatchedEmailRecord[] = [];

  constructor(options?: { resendApiKey?: string; fromEmail?: string }) {
    this.resendApiKey =
      options?.resendApiKey ||
      process.env['RESEND_API_KEY'] ||
      process.env['RESEND_STAGING_API_KEY'] ||
      process.env['RESEND_PROD_API_KEY'] ||
      '';

    const env = (process.env['NODE_ENV'] || '').toLowerCase();
    const defaultDomain =
      env === 'production' ? 'sidaya.biz.id' : env === 'staging' ? 'sidaya.my.id' : 'sidaya.test';
    this.fromEmail = options?.fromEmail || process.env['RESEND_FROM_EMAIL'] || `SiDaya Platform <no-reply@${defaultDomain}>`;
  }

  /**
   * Dispatches an email via Resend REST API or records in mock audit log for local tests
   */
  async sendEmail(opts: EmailDispatchOptions): Promise<DispatchedEmailRecord> {
    const from = opts.from || this.fromEmail;
    const recordId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const isMock = process.env['MOCK_EMAIL_DISPATCH'] === 'true' || process.env['MOCK_EMAIL_DISPATCH'] === '1';
    if (this.resendApiKey && !isMock) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [opts.to],
            subject: opts.subject,
            html: opts.html,
          }),
        });

        if (response.ok) {
          const resData = (await response.json()) as { id?: string };
          const record: DispatchedEmailRecord = {
            id: resData.id || recordId,
            to: opts.to,
            from,
            subject: opts.subject,
            html: opts.html,
            timestamp: new Date().toISOString(),
            provider: 'RESEND',
            status: 'SENT',
          };
          this.sentLog.unshift(record);
          console.log(`[EmailDispatch] ✓ Email sent via Resend API to: ${opts.to} (ID: ${record.id})`);
          return record;
        } else {
          const errBody = await response.text();
          console.warn(`[EmailDispatch] ⚠️ Resend API error (${response.status}): ${errBody}. Falling back to mock record.`);
        }
      } catch (err) {
        console.warn(`[EmailDispatch] ⚠️ Error connecting to Resend API: ${err}. Falling back to mock record.`);
      }
    }

    // Mock dispatch record for offline / testing / fallback
    const mockRecord: DispatchedEmailRecord = {
      id: recordId,
      to: opts.to,
      from,
      subject: opts.subject,
      html: opts.html,
      timestamp: new Date().toISOString(),
      provider: 'MOCK',
      status: 'MOCKED',
    };
    this.sentLog.unshift(mockRecord);
    console.log(`[EmailDispatch] ℹ️ Mock email dispatched to: ${opts.to} (Subject: "${opts.subject}")`);
    return mockRecord;
  }

  /**
   * 1. Email Verification for Merchant Owner / Users with 6-digit OTP
   */
  async sendEmailVerification(
    to: string,
    fullName: string,
    verificationUrl: string,
    otpCode?: string,
  ): Promise<DispatchedEmailRecord> {
    const otpSection = otpCode
      ? `
        <div style="margin: 24px 0; padding: 18px; background: #f8fafc; border: 2px dashed #0284c7; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Kode OTP Verifikasi Anda:</p>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${otpCode}</div>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">Berlaku selama 15 menit. Masukkan 6 digit di atas pada layar verifikasi.</p>
        </div>
      `
      : '';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px;">Verifikasi Alamat Email Anda</h2>
          <p style="color: #64748b; font-size: 15px; margin: 0;">Halo <strong>${fullName}</strong>, selamat datang di platform SiDaya.</p>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Terima kasih telah mendaftarkan bisnis Anda di <strong>SiDaya</strong>. Gunakan kode verifikasi di bawah ini atau klik tombol aktivasi untuk mengaktifkan akun toko Anda:
        </p>
        ${otpSection}
        <div style="margin: 28px 0; text-align: center;">
          <a href="${verificationUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 14px;">
            ✓ Verifikasi Email Saya
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px;">Atau salin tautan berikut ke peramban Anda:<br><a href="${verificationUrl}" style="color: #0284c7;">${verificationUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Jika Anda tidak merasa mendaftar di SiDaya, silakan abaikan email ini.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `[SiDaya] Kode Verifikasi Akun: ${otpCode || 'Konfirmasi Email'}`,
      html,
    });
  }

  /**
   * 2. Password Reset Email
   */
  async sendPasswordReset(to: string, fullName: string, resetUrl: string): Promise<DispatchedEmailRecord> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px;">Permintaan Atur Ulang Kata Sandi</h2>
          <p style="color: #64748b; font-size: 15px; margin: 0;">Halo <strong>${fullName}</strong>,</p>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Kami menerima permintaan untuk mengatur ulang kata sandi akun SiDaya Anda. Tautan ini berlaku selama <strong>1 jam</strong>:
        </p>
        <div style="margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 14px;">
            Atur Ulang Kata Sandi
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px;">Atau salin tautan berikut ke peramban Anda:<br><a href="${resetUrl}" style="color: #0284c7;">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Jika Anda tidak meminta perubahan kata sandi, abaikan email ini. Akun Anda tetap aman.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Atur Ulang Kata Sandi SiDaya',
      html,
    });
  }

  /**
   * 3. Tenant Staff Invitation Email (Kasir, Gudang, Driver)
   */
  async sendStaffInvitation(
    to: string,
    fullName: string,
    tenantName: string,
    role: string,
    inviteUrl: string,
  ): Promise<DispatchedEmailRecord> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px;">Undangan Bergabung ke ${tenantName}</h2>
          <p style="color: #64748b; font-size: 15px; margin: 0;">Halo <strong>${fullName}</strong>,</p>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Anda telah diundang untuk bergabung dengan <strong>${tenantName}</strong> sebagai <strong>${role}</strong> di platform SiDaya.
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Klik tombol di bawah untuk memverifikasi akun Anda dan membuat kata sandi baru:
        </p>
        <div style="margin: 32px 0;">
          <a href="${inviteUrl}" style="background-color: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 14px;">
            Terima Undangan & Buat Sandi
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px;">Tautan undangan:<br><a href="${inviteUrl}" style="color: #16a34a;">${inviteUrl}</a></p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Undangan Bergabung ke ${tenantName} (SiDaya)`,
      html,
    });
  }

  /**
   * 4. Platform Operator Invitation Email (Ashvin Labs Management Plane)
   */
  async sendOperatorInvitation(
    to: string,
    fullName: string,
    role: string,
    inviteUrl: string,
  ): Promise<DispatchedEmailRecord> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 8px; border: 1px solid #334155;">
        <div style="margin-bottom: 24px;">
          <span style="background: #38bdf8; color: #0f172a; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Ashvin Labs Control Plane</span>
          <h2 style="color: #f8fafc; margin: 12px 0 8px 0; font-size: 22px;">Undangan Operator Platform SiDaya</h2>
          <p style="color: #94a3b8; font-size: 15px; margin: 0;">Halo <strong>${fullName}</strong>,</p>
        </div>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Anda telah diundang untuk menjadi Platform Operator di <strong>Ashvin Labs Control Plane</strong> dengan hak akses peranan: <strong style="color: #38bdf8;">${role}</strong>.
        </p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Klik tombol di bawah untuk memverifikasi akun operator Anda dan mengatur kata sandi master Anda:
        </p>
        <div style="margin: 32px 0;">
          <a href="${inviteUrl}" style="background-color: #38bdf8; color: #0f172a; padding: 12px 24px; border-radius: 6px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px;">
            Terima Undangan Operator & Buat Sandi
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">Tautan verifikasi master:<br><a href="${inviteUrl}" style="color: #38bdf8;">${inviteUrl}</a></p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `[Ashvin Labs] Undangan Akses Operator Platform SiDaya (${role})`,
      html,
    });
  }

  /**
   * Retrieves log of sent emails (for inspection/testing)
   */
  getSentLogs(): DispatchedEmailRecord[] {
    return [...this.sentLog];
  }
}
