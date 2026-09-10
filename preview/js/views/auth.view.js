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
            <a class="login-action-link" onclick="openOwnerRegistrationModal()">Daftar Toko Baru (Owner) →</a>
          </div>
          <div class="login-footer-meta">
            Subdomain routing otomatis mendeteksi tenant workspace secara transparan.
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
