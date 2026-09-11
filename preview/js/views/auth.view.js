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

          <form id="merchant-login-form" onsubmit="event.preventDefault(); handleMerchantLoginSubmit();">
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
          <div class="login-footer-meta">
            Subdomain routing otomatis mendeteksi tenant workspace secara transparan.
          </div>
        </div>
      </div>
    `;
  },

  renderMerchantRegister() {
    const baseDomain = (typeof window !== 'undefined' && window.location.hostname.endsWith('sidaya.my.id')) ? 'sidaya.my.id' : 'sidaya.biz.id';
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
                  <input id="reg-biz-subdomain" type="text" class="form-input" required placeholder="berasmakmur" style="padding-right:110px;">
                  <span style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:11px; color:var(--text-muted); pointer-events:none;">.${baseDomain}</span>
                </div>
                <div id="reg-subdomain-hint" style="font-size:11px; color:var(--text-secondary); margin-top:4px;">
                  Alamat resmi toko: <code>https://<span id="reg-subdomain-preview">berasmakmur</span>.${baseDomain}</code>
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
              <div class="form-group" style="margin-bottom:6px;">
                <label class="form-label">Kata Sandi Kuat*</label>
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
            <div class="form-group">
              <label class="form-label">Email Korporat (@ashvinlabs.com)</label>
              <input id="operator-login-email" type="email" class="form-input" required value="gabriel@ashvinlabs.com">
            </div>
            <div class="form-group">
              <label class="form-label">Kata Sandi Platform</label>
              <div class="password-input-wrap">
                <input id="operator-login-password" type="password" class="form-input" required value="SuperSecret123!">
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
};
