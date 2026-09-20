/**
 * Auth Views & Modals: Login Gateways, Registration, Password Reset, and Invites
 */
const AuthView = {
  renderMerchantLogin() {
    return `
      <div id="merchant-login-screen" class="login-overlay">
        <div class="login-card">
          <div class="login-brand" style="display:flex; flex-direction:column; align-items:center; margin-bottom:18px;">
            <img src="/assets/brand/logo-horizontal-dark.svg" alt="siDaya By Ashvin Labs Idn" height="56" class="brand-logo-horizontal dark-theme-logo" style="height:56px; width:auto; max-width:270px; object-fit:contain; margin-bottom:8px;">
            <img src="/assets/brand/logo-horizontal-transparent.svg" alt="siDaya By Ashvin Labs Idn" height="56" class="brand-logo-horizontal light-theme-logo" style="height:56px; width:auto; max-width:270px; object-fit:contain; margin-bottom:8px;">
            <p class="login-desc" style="margin-top:2px;">Sistem Operasi Grosir Multi-Tenant & POS</p>
            <div class="login-security-badge" style="margin-top:8px;">
              <span>🔒</span>
              <span>Keamanan Terisolasi Multi-Tenant & RBAC</span>
            </div>
          </div>

          <form id="merchant-login-form" onsubmit="event.preventDefault(); handleMerchantLoginSubmit();">
            <div id="merchant-login-error" class="login-error-alert" style="display:none;"></div>
            <div class="form-group">
              <label class="form-label">Email Terdaftar / Nomor WhatsApp</label>
              <input id="merchant-login-identifier" type="text" class="form-input" required placeholder="nama@toko.com atau 081234567890" autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">Kata Sandi / PIN Cepat</label>
              <div class="password-input-wrap">
                <input id="merchant-login-password" type="password" class="form-input" required placeholder="Masukkan kata sandi akun Anda" autocomplete="current-password">
                <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('merchant-login-password', this)">👁️</button>
              </div>
            </div>
            <button type="submit" class="login-btn">
              <span>🚀</span> Masuk ke Workspace Toko
            </button>
          </form>

          <div class="login-action-links">
            <a class="login-action-link" onclick="openForgotPasswordModal()">Lupa Kata Sandi?</a>
            <a class="login-action-link" onclick="showRegisterScreen()">Daftar Toko Baru (Owner) →</a>
          </div>
          <div class="login-footer-meta" style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border-color); display:flex; flex-direction:column; gap:8px;">
            <div>Subdomain routing otomatis mendeteksi tenant workspace secara transparan.</div>
            <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; font-size:11px; margin-top:2px;">
              <a onclick="navigate('/faq')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">FAQ</a>
              <span style="color:var(--text-muted);">•</span>
              <a onclick="navigate('/terms-and-conditions')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">Syarat & Ketentuan</a>
              <span style="color:var(--text-muted);">•</span>
              <a onclick="navigate('/refund-policy')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">Kebijakan Refund</a>
              <span style="color:var(--text-muted);">•</span>
              <a onclick="navigate('/privacy-policy')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">Privasi (UU PDP)</a>
              <span style="color:var(--text-muted);">•</span>
              <a onclick="navigate('/contact')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">Kontak Usaha</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderMerchantRegister() {
    const baseDomain = (typeof getBaseDomain === 'function') ? getBaseDomain() : 'sidaya.biz.id';
    const proto = (typeof getAppProtocol === 'function') ? getAppProtocol() : 'https:';
    return `
      <div id="merchant-register-screen" class="login-overlay" style="display:none;">
        <div class="login-card register-card" style="max-width: 580px; width:100%; margin: 24px auto;">
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
            <button type="button" class="btn btn-outline btn-sm" onclick="showLoginScreen()" style="gap:5px; padding:6px 12px; font-size:12px; font-weight:700;">
              ← Kembali ke Login
            </button>
            <div class="login-security-badge" style="margin:0;">
              <span>🔒</span> Multi-Tenant Isolation
            </div>
          </div>

          <div class="login-brand" style="display:flex; flex-direction:column; align-items:center; margin-bottom: 18px;">
            <img src="/assets/brand/logo-horizontal-dark.svg" alt="siDaya By Ashvin Labs Idn" height="56" class="brand-logo-horizontal dark-theme-logo" style="height:56px; width:auto; max-width:270px; object-fit:contain; margin-bottom:8px;">
            <img src="/assets/brand/logo-horizontal-transparent.svg" alt="siDaya By Ashvin Labs Idn" height="56" class="brand-logo-horizontal light-theme-logo" style="height:56px; width:auto; max-width:270px; object-fit:contain; margin-bottom:8px;">
            <p class="login-desc" style="margin-top:2px;">Registrasi Toko Baru & Inisialisasi Workspace</p>
          </div>

          <form id="owner-registration-form" onsubmit="handleOwnerRegistrationSubmit(event)">
            <!-- Bagian 1: Identitas Bisnis & Subdomain -->
            <div style="background:var(--bg-hover); border:1px solid var(--border-color); border-radius:10px; padding:14px; margin-bottom:12px;">
              <div style="font-size:12px; font-weight:800; color:var(--text-primary); margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                <span>🏢</span> 1. Identitas Usaha & Subdomain Toko
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="form-group" style="margin-bottom:6px;">
                  <label class="form-label">Nama Bisnis / Toko*</label>
                  <input id="reg-biz-name" type="text" class="form-input" required placeholder="contoh: Beras Makmur Abadi" oninput="handleRegNameChange(this.value)">
                </div>
                <div class="form-group" style="margin-bottom:6px;">
                  <label class="form-label">Bentuk Badan Usaha</label>
                  <select id="reg-biz-entity" class="form-select">
                    <option value="UD">UD / Usaha Dagang</option>
                    <option value="CV" selected>CV (Komanditer)</option>
                    <option value="PT">PT (Perseroan Terbatas)</option>
                    <option value="PERORANGAN">Toko Perorangan</option>
                  </select>
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Subdomain Unik Toko (Alamat Web)*</label>
                <div style="position:relative;">
                  <input id="reg-biz-subdomain" type="text" class="form-input" required placeholder="berasmakmur" style="padding-right:150px;" oninput="handleRegSubdomainChange(this.value)">
                  <span id="reg-subdomain-suffix" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:11px; font-weight:600; color:var(--text-muted); pointer-events:none;">.${baseDomain}</span>
                </div>
                <div id="reg-subdomain-hint" style="font-size:11px; color:var(--text-secondary); margin-top:4px;">
                  Alamat resmi toko: <code>${proto}//<span id="reg-subdomain-preview">berasmakmur</span>.${baseDomain}</code>
                </div>
              </div>
            </div>

            <!-- Bagian 2: Kontak & Identitas Owner -->
            <div style="background:var(--bg-hover); border:1px solid var(--border-color); border-radius:10px; padding:14px; margin-bottom:12px;">
              <div style="font-size:12px; font-weight:800; color:var(--text-primary); margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                <span>👑</span> 2. Identitas Pemilik Toko (Owner)
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="form-group" style="margin-bottom:6px;">
                  <label class="form-label">Nama Lengkap Owner*</label>
                  <input id="reg-owner-name" type="text" class="form-input" required placeholder="H. Hendro Purnomo">
                </div>
                <div class="form-group" style="margin-bottom:6px;">
                  <label class="form-label">No. WhatsApp Bisnis*</label>
                  <input id="reg-biz-phone" type="tel" class="form-input" required placeholder="081234567890">
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Alamat Email Owner (Akun Login)*</label>
                <input id="reg-owner-email" type="email" class="form-input" required placeholder="hendro@berasmakmur.com">
              </div>
            </div>

            <!-- Bagian 3: Keamanan Sandi -->
            <div style="background:var(--bg-hover); border:1px solid var(--border-color); border-radius:10px; padding:14px; margin-bottom:14px;">
              <div style="font-size:12px; font-weight:800; color:var(--text-primary); margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                <span>🔑</span> 3. Keamanan Sandi Akun
              </div>
              <div class="form-group" style="margin-bottom:10px;">
                <label class="form-label">Kata Sandi*</label>
                <input id="reg-owner-password" type="password" class="form-input" required placeholder="Minimal 8 karakter (huruf & angka)" oninput="checkPasswordStrengthAndMatch()">
              </div>
              <div class="form-group" style="margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <label class="form-label" style="margin-bottom:0;">Konfirmasi Sandi*</label>
                  <div id="reg-password-match-indicator" style="font-size:11px; font-weight:700;"></div>
                </div>
                <input id="reg-owner-password-confirm" type="password" class="form-input" required placeholder="Ulangi kata sandi" oninput="checkPasswordStrengthAndMatch()">
              </div>

              <!-- Single Unmask Checkbox -->
              <div style="margin-top:6px; margin-bottom:8px;">
                <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; font-weight:600; color:var(--text-secondary); user-select:none;">
                  <input type="checkbox" id="reg-show-passwords-check" onchange="toggleDualPasswordVisibility(this, 'reg-owner-password', 'reg-owner-password-confirm')" style="width:15px; height:15px; cursor:pointer; accent-color:var(--color-primary, #2563EB);">
                  <span>Tampilkan sandi</span>
                </label>
              </div>

              <div class="password-strength-wrap" style="margin-top:2px;">
                <div class="password-strength-bar-bg">
                  <div id="reg-strength-fill" class="password-strength-bar-fill"></div>
                </div>
                <div id="reg-strength-label" class="password-strength-text">Gunakan 8 karakter atau lebih dengan kombinasi huruf & angka</div>
              </div>
            </div>

            <button type="submit" class="login-btn" style="width:100%; margin-top:8px; padding:12px; font-size:14px;">
              <span>🚀</span> Selesaikan Pendaftaran & Buka Workspace Toko
            </button>
          </form>

          <div style="text-align:center; margin-top:16px; font-size:12px; color:var(--text-secondary);">
            Sudah memiliki akun toko? 
            <a href="javascript:void(0)" onclick="showLoginScreen()" style="color:var(--color-primary, #6366f1); font-weight:700; text-decoration:underline;">
              Masuk ke Workspace (Login) →
            </a>
          </div>

          <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border-color); display:flex; justify-content:center; gap:10px; flex-wrap:wrap; font-size:11px; color:var(--text-muted);">
            <a onclick="navigate('/faq')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">FAQ</a>
            <span>•</span>
            <a onclick="navigate('/terms-and-conditions')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">Syarat & Ketentuan</a>
            <span>•</span>
            <a onclick="navigate('/refund-policy')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">Kebijakan Refund</a>
            <span>•</span>
            <a onclick="navigate('/privacy-policy')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">Privasi</a>
            <span>•</span>
            <a onclick="navigate('/contact')" style="color:var(--primary-color, #059669); cursor:pointer; font-weight:600;">Kontak Usaha</a>
          </div>

        </div>
      </div>
    `;
  },

  renderOperatorLogin() {
    return `
      <div id="operator-login-screen" class="login-overlay">
        <div class="login-card" style="border-color: rgba(124, 58, 237, 0.4);">
          <div class="login-brand">
            <div class="login-logo" style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%);">⚡</div>
            <h2 class="login-title">Ashvin Labs Control Plane</h2>
            <p class="login-desc">Platform Operations & Tenant Fleet Infrastructure</p>
          </div>

          <form id="operator-login-form" onsubmit="event.preventDefault(); handleOperatorLoginSubmit();">
            <div id="operator-login-error" class="login-error-alert" style="display:none;"></div>
            <div class="form-group">
              <label class="form-label">Email Korporat (@ashvinlabs.com)</label>
              <input id="operator-login-email" type="email" class="form-input" required placeholder="operator@ashvinlabs.com" autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">Kata Sandi Platform</label>
              <div class="password-input-wrap">
                <input id="operator-login-password" type="password" class="form-input" required placeholder="Masukkan kata sandi platform" autocomplete="current-password">
                <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('operator-login-password', this)">👁️</button>
              </div>
            </div>
            <button type="submit" class="login-btn" style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%);">
              ⚡ Masuk ke Control Plane
            </button>
          </form>
        </div>
      </div>
    `;
  },

  renderEmailVerification() {
    return `
      <div id="email-verification-screen" class="login-overlay" style="display:none;">
        <div class="login-card" style="max-width: 480px; width:100%; margin: 24px auto; text-align:center;">
          <div style="width:54px; height:54px; margin:0 auto 14px auto; border-radius:50%; background:rgba(37,99,235,0.1); color:var(--color-primary, #2563EB); display:flex; align-items:center; justify-content:center; font-size:26px;">
            ✉️
          </div>
          <h2 class="login-title" style="font-size:1.35rem;">Verifikasi Email Anda</h2>
          <p class="login-desc" style="margin-bottom:16px;">
            Kode OTP verifikasi telah dikirimkan ke alamat email Anda:
            <br><strong id="verify-target-email" style="color:var(--text-primary); font-size:13px;">owner@toko.com</strong>
          </p>

          <div id="verify-error-alert" class="login-error-alert" style="display:none; margin-bottom:14px;"></div>

          <form id="email-verification-form" onsubmit="event.preventDefault(); AuthController.handleVerifyEmailSubmit();">
            <div style="display:flex; justify-content:center; gap:8px; margin-bottom:16px;">
              <input class="form-input otp-digit" id="otp-1" maxlength="1" style="width:44px; height:48px; text-align:center; font-size:20px; font-weight:800;" oninput="handleOtpInput(1, this)" onkeydown="handleOtpKey(1, event)">
              <input class="form-input otp-digit" id="otp-2" maxlength="1" style="width:44px; height:48px; text-align:center; font-size:20px; font-weight:800;" oninput="handleOtpInput(2, this)" onkeydown="handleOtpKey(2, event)">
              <input class="form-input otp-digit" id="otp-3" maxlength="1" style="width:44px; height:48px; text-align:center; font-size:20px; font-weight:800;" oninput="handleOtpInput(3, this)" onkeydown="handleOtpKey(3, event)">
              <input class="form-input otp-digit" id="otp-4" maxlength="1" style="width:44px; height:48px; text-align:center; font-size:20px; font-weight:800;" oninput="handleOtpInput(4, this)" onkeydown="handleOtpKey(4, event)">
              <input class="form-input otp-digit" id="otp-5" maxlength="1" style="width:44px; height:48px; text-align:center; font-size:20px; font-weight:800;" oninput="handleOtpInput(5, this)" onkeydown="handleOtpKey(5, event)">
              <input class="form-input otp-digit" id="otp-6" maxlength="1" style="width:44px; height:48px; text-align:center; font-size:20px; font-weight:800;" oninput="handleOtpInput(6, this)" onkeydown="handleOtpKey(6, event)">
            </div>

            <button type="submit" class="login-btn" style="width:100%; padding:12px; font-size:14px;">
              <span>✓</span> Verifikasi & Aktifkan Workspace
            </button>
          </form>

          <div style="margin-top:16px; font-size:12px; color:var(--text-secondary); display:flex; justify-content:space-between; align-items:center;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-resend-otp" onclick="AuthController.resendVerificationCode()" style="font-size:11.5px;">
              🔄 Kirim Ulang (<span id="resend-countdown">60</span>s)
            </button>
            <a onclick="AuthController.showRegisterScreen()" style="color:var(--color-primary); cursor:pointer; font-weight:700;">
              ← Kembali
            </a>
          </div>
        </div>
      </div>
    `;
  },
};

