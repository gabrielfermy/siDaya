/**
 * @file auth.controller.js
 * @description Auth Controller: Manages login, registration, session TTL, idle timeout, and intended return path routing
 * @module Controller:Auth
 * @dependencies Config:Constants, Store, Router
 */

const AuthController = {
  _lastActivityRefresh: 0,

  /**
   * Retrieves active session for given portal mode ('merchant' | 'operator')
   * @param {'merchant'|'operator'} type
   * @returns {Object|null}
   */
  getSession(type) {
    const key = type === 'operator' 
      ? SESSION_CONFIG.KEY_OPERATOR_SESSION 
      : SESSION_CONFIG.KEY_MERCHANT_SESSION;
    
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || !session.expiresAt || session.expiresAt <= Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      return session;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Saves new active session with security expiration timestamp (TTL)
   * @param {'merchant'|'operator'} type
   * @param {Object} account
   */
  setSession(type, account) {
    const key = type === 'operator' 
      ? SESSION_CONFIG.KEY_OPERATOR_SESSION 
      : SESSION_CONFIG.KEY_MERCHANT_SESSION;

    const ttl = (typeof SESSION_CONFIG !== 'undefined' && SESSION_CONFIG.SESSION_TTL_MS) 
      ? SESSION_CONFIG.SESSION_TTL_MS 
      : 30 * 60 * 1000;

    const now = Date.now();
    const sessionData = {
      ...account,
      loggedInAt: now,
      lastActiveAt: now,
      expiresAt: now + ttl,
    };

    localStorage.setItem(key, JSON.stringify(sessionData));
    
    // Update store state
    const state = store.getState();
    if (state.auth) {
      if (type === 'operator') {
        state.auth.operatorUser = sessionData;
      } else {
        state.auth.merchantUser = sessionData;
      }
      store.saveState();
    }

    return sessionData;
  },

  /**
   * Refreshes active session expiration timestamp on user activity
   */
  refreshActivity() {
    const now = Date.now();
    // Throttle refresh to once every 10 seconds
    if (now - this._lastActivityRefresh < 10000) return;
    this._lastActivityRefresh = now;

    const ttl = (typeof SESSION_CONFIG !== 'undefined' && SESSION_CONFIG.SESSION_TTL_MS) 
      ? SESSION_CONFIG.SESSION_TTL_MS 
      : 30 * 60 * 1000;

    // Refresh Merchant Session if active
    const merch = this.getSession('merchant');
    if (merch) {
      merch.lastActiveAt = now;
      merch.expiresAt = now + ttl;
      localStorage.setItem(SESSION_CONFIG.KEY_MERCHANT_SESSION, JSON.stringify(merch));
    }

    // Refresh Operator Session if active
    const ops = this.getSession('operator');
    if (ops) {
      ops.lastActiveAt = now;
      ops.expiresAt = now + ttl;
      localStorage.setItem(SESSION_CONFIG.KEY_OPERATOR_SESSION, JSON.stringify(ops));
    }
  },

  /**
   * Validates whether current session is valid for requested path
   * @param {'merchant'|'operator'} type
   * @param {string} targetPath
   * @returns {boolean}
   */
  validateSession(type, targetPath) {
    const session = this.getSession(type);
    if (!session) {
      this.handleSessionExpired(type, targetPath);
      return false;
    }
    return true;
  },

  /**
   * Handles session expiration: purges storage, saves target path, and presents login overlay
   * @param {'merchant'|'operator'} type
   * @param {string} [targetPath]
   */
  handleSessionExpired(type, targetPath) {
    const key = type === 'operator' 
      ? SESSION_CONFIG.KEY_OPERATOR_SESSION 
      : SESSION_CONFIG.KEY_MERCHANT_SESSION;
    localStorage.removeItem(key);

    const dest = targetPath || window.location.pathname;
    if (dest && dest !== '/' && dest !== '/dashboard' && !dest.includes('404')) {
      sessionStorage.setItem(SESSION_CONFIG.KEY_INTENDED_PATH, dest);
    }

    const host = (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '');
    const isOps = host.startsWith('ops.') || host === 'ops.localhost';
    document.documentElement.className = isOps ? 'state-unauth-ops' : 'state-unauth-merchant';

    const state = store.getState();
    if (state && state.auth) {
      if (type === 'operator') {
        state.auth.operatorUser = null;
        if (state.operator) state.operator.currentRole = null;
      } else {
        state.auth.merchantUser = null;
      }
      store.saveState();
    }

    const container = document.getElementById('main-content');
    if (container) container.innerHTML = '';

    showToast('🔒 Sesi Anda telah berakhir demi keamanan data. Silakan masuk kembali.');
  },

  /**
   * Initializes inactivity listeners and periodic expiry checker
   */
  initSessionSecurity() {
    // 1. Check if boot was flagged as session expired
    if (sessionStorage.getItem(SESSION_CONFIG.KEY_SESSION_EXPIRED_FLAG)) {
      sessionStorage.removeItem(SESSION_CONFIG.KEY_SESSION_EXPIRED_FLAG);
      setTimeout(() => {
        showToast('🔒 Sesi berakhir demi keamanan. Silakan login kembali.');
      }, 300);
    }

    // 2. Attach user interaction activity listeners (throttled)
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, () => this.refreshActivity(), { passive: true });
    });

    // 3. Periodic idle timeout checker
    const checkInterval = SESSION_CONFIG.IDLE_CHECK_INTERVAL_MS || 15000;
    setInterval(() => {
      const host = (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '');
      const isOps = host.startsWith('ops.') || host === 'ops.localhost';
      const type = isOps ? 'operator' : 'merchant';
      const raw = localStorage.getItem(type === 'operator' ? SESSION_CONFIG.KEY_OPERATOR_SESSION : SESSION_CONFIG.KEY_MERCHANT_SESSION);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.expiresAt && parsed.expiresAt <= Date.now()) {
            this.handleSessionExpired(type, window.location.pathname);
          }
        } catch (e) {}
      }
    }, checkInterval);

    // 4. Handle tab visibility change (e.g., returning to tab after laptop sleep)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const host = (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '');
        const isOps = host.startsWith('ops.') || host === 'ops.localhost';
        const type = isOps ? 'operator' : 'merchant';
        const raw = localStorage.getItem(type === 'operator' ? SESSION_CONFIG.KEY_OPERATOR_SESSION : SESSION_CONFIG.KEY_MERCHANT_SESSION);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.expiresAt && parsed.expiresAt <= Date.now()) {
              this.handleSessionExpired(type, window.location.pathname);
            } else if (parsed) {
              this.refreshActivity();
            }
          } catch (e) {}
        }
      }
    });
  },

  /**
   * Quick preset login helper
   * @param {string} email
   */
  quickLoginPreset(email) {
    const acc = MERCHANT_ACCOUNTS[email];
    if (acc) {
      const idInput = document.getElementById('merchant-login-identifier');
      const pwInput = document.getElementById('merchant-login-password');
      if (idInput) idInput.value = acc.email;
      if (pwInput) pwInput.value = acc.password;
      this.handleMerchantLoginSubmit();
    }
  },

  /**
   * Submits merchant workspace login, restores intended destination route
   */
  handleMerchantLoginSubmit() {
    const idInput = document.getElementById('merchant-login-identifier');
    const identifier = idInput ? idInput.value.trim() : 'budi@berasjaya.com';
    const account = MERCHANT_ACCOUNTS[identifier] || {
      name: 'Pengguna Toko',
      role: 'Staff Toko',
      tenantName: 'Toko Grosir Beras Jaya',
      email: identifier,
    };

    this.setSession('merchant', account);
    document.documentElement.className = 'state-auth-merchant';

    // Retrieve and clear intended destination route
    const intended = sessionStorage.getItem(SESSION_CONFIG.KEY_INTENDED_PATH) || '/dashboard';
    sessionStorage.removeItem(SESSION_CONFIG.KEY_INTENDED_PATH);

    showToast(`Selamat datang kembali, ${account.name}! Melanjutkan ke ${intended}`);
    navigate(intended);
  },

  /**
   * Quick operator login helper
   * @param {string} email
   * @param {string} role
   */
  quickLoginOperator(email, role) {
    const acc = OPERATOR_ACCOUNTS[email] || {
      name: 'Platform Operator',
      email,
      role,
      roleName: role,
    };

    this.setSession('operator', acc);
    document.documentElement.className = 'state-auth-ops';

    // Retrieve and clear intended destination route
    const intended = sessionStorage.getItem(SESSION_CONFIG.KEY_INTENDED_PATH) || '/telemetry';
    sessionStorage.removeItem(SESSION_CONFIG.KEY_INTENDED_PATH);

    showToast(`Terotentikasi sebagai Operator: ${acc.name} (${acc.roleName})`);
    navigate(intended);
  },

  /**
   * Submits operator control plane login
   */
  handleOperatorLoginSubmit() {
    const emailInput = document.getElementById('operator-login-email');
    const email = emailInput ? emailInput.value.trim() : 'gabriel@ashvinlabs.com';
    this.quickLoginOperator(email, 'SUPER_ADMIN');
  },

  /**
   * User initiated logout
   */
  handleLogout() {
    localStorage.removeItem(SESSION_CONFIG.KEY_MERCHANT_SESSION);
    localStorage.removeItem(SESSION_CONFIG.KEY_OPERATOR_SESSION);
    sessionStorage.removeItem(SESSION_CONFIG.KEY_INTENDED_PATH);
    
    const host = (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '');
    const isOps = host.startsWith('ops.') || host === 'ops.localhost';
    document.documentElement.className = isOps ? 'state-unauth-ops' : 'state-unauth-merchant';
    
    store.dispatch('LOGOUT');

    const container = document.getElementById('main-content');
    if (container) container.innerHTML = '';

    showToast('Anda telah berhasil keluar dari sesi.');
    navigate(isOps ? '/telemetry' : '/');
  },

  /**
   * Switches to the full-page merchant owner registration view
   */
  showRegisterScreen() {
    const loginScreen = document.getElementById('merchant-login-screen');
    const regScreen = document.getElementById('merchant-register-screen');
    if (loginScreen) loginScreen.style.setProperty('display', 'none', 'important');
    if (regScreen) regScreen.style.setProperty('display', 'flex', 'important');
    document.documentElement.classList.add('is-register-page');
    if (window.history && window.history.pushState && window.location.pathname !== '/register') {
      window.history.pushState({}, '', '/register');
    }
    document.title = 'SiDaya - Pendaftaran Toko Grosir Baru';
  },

  /**
   * Switches to the merchant login view
   */
  showLoginScreen() {
    const loginScreen = document.getElementById('merchant-login-screen');
    const regScreen = document.getElementById('merchant-register-screen');
    if (regScreen) regScreen.style.setProperty('display', 'none', 'important');
    if (loginScreen) loginScreen.style.setProperty('display', 'flex', 'important');
    document.documentElement.classList.remove('is-register-page');
    if (window.history && window.history.pushState && window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/login');
    }
    document.title = 'SiDaya - Workspace Login';
  },

  handleOwnerRegistrationSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const bizName = document.getElementById('reg-biz-name')?.value.trim();
    const subdomain = document.getElementById('reg-biz-subdomain')?.value.trim().toLowerCase();
    const entity = document.getElementById('reg-biz-entity')?.value || 'CV';
    const ownerName = document.getElementById('reg-owner-name')?.value.trim();
    const email = document.getElementById('reg-owner-email')?.value.trim();
    const phone = document.getElementById('reg-biz-phone')?.value.trim();

    if (!bizName || !subdomain || !ownerName || !email) {
      showToast('Harap lengkapi semua kolom pendaftaran');
      return;
    }

    store.dispatch('REGISTER_OWNER', { bizName, subdomain, ownerName, email, phone, legalEntity: entity });
    
    // Hide registration screen and activate authenticated shell
    const regScreen = document.getElementById('merchant-register-screen');
    if (regScreen) regScreen.style.setProperty('display', 'none', 'important');
    document.documentElement.classList.remove('is-register-page');
    document.documentElement.className = 'state-auth-merchant';

    showToast(`🎉 Selamat datang, ${ownerName}! Workspace ${bizName} berhasil dibuat.`);
    navigate('/dashboard');
  },

  handleForgotPasswordSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('forgot-email')?.value.trim();
    if (!email) {
      showToast('Harap masukkan alamat email akun Anda');
      return;
    }
    closeModal();
    const resetToken = 'rst_' + Math.random().toString(36).substring(2, 10);
    showToast(`✉️ Tautan atur ulang kata sandi telah dikirimkan ke ${email} (Token: ${resetToken})`);
  },
};

// Global helper bindings for inline HTML onclick handlers
function quickLoginPreset(email) { AuthController.quickLoginPreset(email); }
function handleMerchantLoginSubmit() { AuthController.handleMerchantLoginSubmit(); }
function quickLoginOperator(email, role) { AuthController.quickLoginOperator(email, role); }
function handleOperatorLoginSubmit() { AuthController.handleOperatorLoginSubmit(); }
function handleLogout() { AuthController.handleLogout(); }
function handleOwnerRegistrationSubmit(e) { AuthController.handleOwnerRegistrationSubmit(e); }
function handleForgotPasswordSubmit(e) { AuthController.handleForgotPasswordSubmit(e); }
function showRegisterScreen() { AuthController.showRegisterScreen(); }
function showLoginScreen() { AuthController.showLoginScreen(); }
function openOwnerRegistrationModal() { AuthController.showRegisterScreen(); }


