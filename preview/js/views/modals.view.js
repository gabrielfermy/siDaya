/**
 * Modals View: Shared overlay modals for Owner Registration, Checkout, Staff Invites, and Diagnostics
 */
const ModalsView = {
  renderAllModals() {
    return `
      <!-- MODAL: OWNER REGISTRATION -->
      <div id="modal-owner-reg" class="modal-overlay hidden">
        <div class="modal-card">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">🏪 Pendaftaran Pemilik Toko Baru</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Setiap pendaftaran owner otomatis menginisialisasi workspace tenant dan subdomain terisolasi.
            </p>
          </div>

          <form id="owner-registration-form" onsubmit="handleOwnerRegistrationSubmit(event)">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label class="form-label">Nama Bisnis / Toko</label>
                <input id="reg-biz-name" type="text" class="form-input" required placeholder="contoh: Beras Makmur Abadi">
              </div>
              <div class="form-group">
                <label class="form-label">Subdomain Unik Toko</label>
                <input id="reg-biz-subdomain" type="text" class="form-input" required placeholder="berasmakmur">
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label class="form-label">Nama Lengkap Owner</label>
                <input id="reg-owner-name" type="text" class="form-input" required placeholder="H. Hendro">
              </div>
              <div class="form-group">
                <label class="form-label">No. WhatsApp Bisnis</label>
                <input id="reg-biz-phone" type="tel" class="form-input" required placeholder="0812xxxxxxxx">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Alamat Email Owner (Login)</label>
              <input id="reg-owner-email" type="email" class="form-input" required placeholder="hendro@berasmakmur.com">
            </div>
            <div class="form-group">
              <label class="form-label">Kata Sandi Kuat</label>
              <div class="password-input-wrap">
                <input id="reg-owner-password" type="password" class="form-input" required placeholder="Minimal 8 karakter" oninput="checkPasswordStrength('reg-owner-password', 'reg-strength-fill', 'reg-strength-label')">
                <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('reg-owner-password', this)">👁️</button>
              </div>
              <div class="password-strength-wrap">
                <div class="password-strength-bar-bg">
                  <div id="reg-strength-fill" class="password-strength-bar-fill"></div>
                </div>
                <div id="reg-strength-label" class="password-strength-text">Masukkan kata sandi</div>
              </div>
            </div>
            <button type="submit" class="login-btn" style="margin-top:12px;">
              <span>🚀</span> Selesaikan Pendaftaran & Mulai Toko
            </button>
          </form>
        </div>
      </div>

      <!-- MODAL: FORGOT PASSWORD -->
      <div id="modal-forgot-password" class="modal-overlay hidden">
        <div class="modal-card">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">🔑 Lupa Kata Sandi Akun</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Instruksi tautan reset berbatas waktu (1 jam) akan dikirimkan ke email terdaftar Anda.
            </p>
          </div>
          <form id="forgot-password-form" onsubmit="handleForgotPasswordSubmit(event)">
            <div class="form-group">
              <label class="form-label">Alamat Email Akun Terdaftar</label>
              <input id="forgot-email" type="email" class="form-input" required placeholder="budi@berasjaya.com">
            </div>
            <button type="submit" class="login-btn">
              <span>✉️</span> Kirim Tautan Reset Kata Sandi
            </button>
          </form>
        </div>
      </div>

      <!-- MODAL: POS CHECKOUT -->
      <div id="modal-checkout" class="modal-overlay hidden">
        <div class="modal-card">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">💳 Pilih Metode Pembayaran</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Pilih metode penyelesaian transaksi POS grosir.
            </p>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px;">
            <button class="btn btn-primary" style="padding:16px; flex-direction:column; gap:6px;" onclick="executePosCheckout('TUNAI')">
              <span style="font-size:1.5rem;">💵</span>
              <strong>Kas Tunai (Cash)</strong>
            </button>
            <button class="btn btn-outline" style="padding:16px; flex-direction:column; gap:6px; border-color:var(--primary);" onclick="executePosCheckout('QRIS_PAYLINK')">
              <span style="font-size:1.5rem;">📱</span>
              <strong>PayLink QRIS / VA</strong>
            </button>
            <button class="btn btn-outline" style="padding:16px; flex-direction:column; gap:6px;" onclick="executePosCheckout('TEMPO_KASBON')">
              <span style="font-size:1.5rem;">📋</span>
              <strong>Tempo / Kasbon (TOP)</strong>
            </button>
            <button class="btn btn-outline" style="padding:16px; flex-direction:column; gap:6px;" onclick="executePosCheckout('TRANSFER_BANK')">
              <span style="font-size:1.5rem;">🏦</span>
              <strong>Transfer Bank Manual</strong>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL: BREAKGLASS DIAGNOSTIC -->
      <div id="modal-breakglass" class="modal-overlay hidden">
        <div class="modal-card" style="border-color:var(--accent-rose);">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--accent-rose);">🚨 Break-Glass Emergency Diagnostic</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Akses darurat untuk membuka proteksi PII dan audit log kepatuhan UU PDP.
            </p>
          </div>
          <div class="form-group">
            <label class="form-label">Nomor Tiket Support / Emergency Incident</label>
            <input id="bg-ticket-id" type="text" class="form-input" value="INC-2026-0909-01">
          </div>
          <div class="form-group">
            <label class="form-label">Alasan & Cakupan Investigasi</label>
            <textarea id="bg-reason" class="form-input" rows="3">Investigasi mismatch transaksi webhook payment gateway toko Beras Jaya</textarea>
          </div>
          <button class="btn btn-primary" style="width:100%; background:var(--accent-rose); border-color:var(--accent-rose);" onclick="executeBreakglass()">
            ⚠️ Aktifkan Sesi Break-Glass (Dicatat di Audit Trail)
          </button>
        </div>
      </div>
    `;
  },
};
