/**
 * Auth Views & Modals: Login Gateways, Registration, Password Reset, and Invites
 */
const AuthView = {
  renderMerchantLogin() {
    return `
      <div id="merchant-login-screen" class="login-overlay">
        <div class="login-card">
          <div class="login-brand">
            <div class="login-logo">S</div>
            <h2 class="login-title">SiDaya Workspace Login</h2>
            <p class="login-desc">Sistem Operasi Multi-Tenant Distribusi Grosir & Komoditas</p>
            <div class="login-security-badge">
              <span>🔒</span>
              <span>Keamanan Terisolasi Multi-Tenant & RBAC</span>
            </div>
          </div>

          <div class="preset-section-title">Pilih Akun Cepat Simulasi Peran:</div>
          <div class="preset-pill-grid">
            <button class="preset-pill-btn" onclick="quickLoginPreset('budi@berasjaya.com')">
              <span>👑 Budi Santoso</span>
              <span class="preset-role-badge">Owner / Billing POC</span>
            </button>
            <button class="preset-pill-btn" onclick="quickLoginPreset('siti@berasjaya.com')">
              <span>💳 Siti Rahma</span>
              <span class="preset-role-badge">Kasir Grosir (POS)</span>
            </button>
            <button class="preset-pill-btn" onclick="quickLoginPreset('agus@berasjaya.com')">
              <span>📦 Agus Santoso</span>
              <span class="preset-role-badge">Gudang & Batch FIFO</span>
            </button>
            <button class="preset-pill-btn" onclick="quickLoginPreset('joko@berasjaya.com')">
              <span>🚚 Joko Supir</span>
              <span class="preset-role-badge">Driver Logistik (POD)</span>
            </button>
          </div>

          <!-- Google 1-Click Login Button -->
          <button type="button" class="btn btn-google-auth" onclick="AuthController.openGoogleLoginPicker()" 
                  style="width:100%; display:flex; align-items:center; justify-content:center; gap:10px; background:#fff; color:#374151; border:1px solid #D1D5DB; border-radius:10px; padding:10px; font-weight:700; font-size:13.5px; box-shadow:0 1px 2px rgba(0,0,0,0.05); cursor:pointer; margin-bottom:14px; transition:all 0.2s;"
                  onmouseover="this.style.background='#F9FAFB'; this.style.borderColor='#9CA3AF'" onmouseout="this.style.background='#fff'; this.style.borderColor='#D1D5DB'">
            <svg style="width:18px; height:18px;" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Masuk Cepat dengan Google</span>
          </button>

          <div style="display:flex; align-items:center; margin-bottom:14px; gap:10px;">
            <div style="flex:1; height:1px; background:var(--border-color);"></div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">atau via kredensial</span>
            <div style="flex:1; height:1px; background:var(--border-color);"></div>
          </div>

          <form id="merchant-login-form" onsubmit="event.preventDefault(); handleMerchantLoginSubmit();">
            <div id="merchant-login-error" class="login-error-alert" style="display:none;"></div>
            <div class="form-group">
              <label class="form-label">Email Terdaftar / Nomor WhatsApp</label>
              <input id="merchant-login-identifier" type="text" class="form-input" required value="budi@berasjaya.com">
            </div>
            <div class="form-group">
              <label class="form-label">Kata Sandi / PIN Cepat</label>
              <div class="password-input-wrap">
                <input id="merchant-login-password" type="password" class="form-input" required value="Password123!">
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

          <div class="login-brand" style="margin-bottom: 18px;">
            <div class="login-logo" style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);">🏪</div>
            <h2 class="login-title">Pendaftaran Toko Grosir Baru</h2>
            <p class="login-desc">Inisialisasi workspace mandiri, isolasi database, dan subdomain resmi toko Anda.</p>
          </div>

          <!-- Fast Signup with Google -->
          <div style="margin-bottom: 14px;">
            <button type="button" onclick="AuthController.openGoogleRegisterPicker()" 
                    style="width:100%; display:flex; align-items:center; justify-content:center; gap:10px; background:#fff; color:#374151; border:1px solid #D1D5DB; border-radius:10px; padding:10px; font-weight:700; font-size:13.5px; box-shadow:0 1px 2px rgba(0,0,0,0.05); cursor:pointer;"
                    onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='#fff'">
              <svg style="width:18px; height:18px;" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Daftar Cepat dengan Akun Google</span>
            </button>
            <div style="display:flex; align-items:center; margin-top:12px; gap:10px;">
              <div style="flex:1; height:1px; background:var(--border-color);"></div>
              <span style="font-size:11px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">atau isi manual</span>
              <div style="flex:1; height:1px; background:var(--border-color);"></div>
            </div>
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
                <input id="reg-owner-password" type="password" class="form-input" required placeholder="Minimal 8 karakter" oninput="checkPasswordStrengthAndMatch()">
              </div>
              <div class="form-group" style="margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <label class="form-label" style="margin-bottom:0;">Konfirmasi Sandi*</label>
                  <div id="reg-password-match-indicator" style="font-size:11px; font-weight:700;"></div>
                </div>
                <input id="reg-owner-password-confirm" type="password" class="form-input" required placeholder="Ulangi kata sandi" oninput="checkPasswordStrengthAndMatch()">
              </div>

              <!-- Google-style Single Unmask Checkbox -->
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

          <div class="preset-section-title">Pilih Akun Operator Simulasi:</div>
          <div class="preset-pill-grid">
            <button class="preset-pill-btn" onclick="quickLoginOperator('gabriel@ashvinlabs.com', 'SUPER_ADMIN')">
              <span>⚡ Gabriel (CEO)</span>
              <span class="preset-role-badge" style="color:#7C3AED;">Super Admin</span>
            </button>
            <button class="preset-pill-btn" onclick="quickLoginOperator('alex@ashvinlabs.com', 'DEV_ENGINEER')">
              <span>🛠️ Alex (Lead Dev)</span>
              <span class="preset-role-badge" style="color:#0284C7;">Dev Engineer</span>
            </button>
            <button class="preset-pill-btn" onclick="quickLoginOperator('dina@ashvinlabs.com', 'OPS_SUPPORT')">
              <span>🎧 Dina (Customer Ops)</span>
              <span class="preset-role-badge" style="color:#059669;">Ops Support</span>
            </button>
          </div>

          <form id="operator-login-form" onsubmit="event.preventDefault(); handleOperatorLoginSubmit();">
            <div id="operator-login-error" class="login-error-alert" style="display:none;"></div>
            <div class="form-group">
              <label class="form-label">Email Korporat (@ashvinlabs.com)</label>
              <input id="operator-login-email" type="email" class="form-input" required value="gabriel@ashvinlabs.com">
            </div>
            <div class="form-group">
              <label class="form-label">Kata Sandi Platform</label>
              <div class="password-input-wrap">
                <input id="operator-login-password" type="password" class="form-input" required value="Password123!">
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
          <p class="login-desc" style="margin-bottom:12px;">
            Kode OTP verifikasi telah dikirimkan ke alamat:
            <br><strong id="verify-target-email" style="color:var(--text-primary); font-size:13px;">owner@toko.com</strong>
          </p>
          
          <div id="verify-simulator-pill" style="display:inline-flex; align-items:center; gap:8px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); padding:6px 14px; border-radius:20px; font-size:11.5px; color:var(--accent-green, #10b981); margin-bottom:16px; cursor:pointer;" onclick="AuthController.quickFillOtp()" title="Klik untuk mengisi otomatis kode OTP simulasi">
            <span>📩 Simulasi Inbox: Kode OTP Anda adalah <strong id="verify-sample-code">749201</strong> (Klik Isi)</span>
          </div>

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
