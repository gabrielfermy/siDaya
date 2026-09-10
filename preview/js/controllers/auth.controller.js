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

    const isOps = type === 'operator' || window.location.pathname.includes('telemetry') || window.location.pathname.includes('fleet');
    document.documentElement.className = isOps ? 'state-unauth-ops' : 'state-unauth-merchant';

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
      const isOps = document.documentElement.className.includes('ops');
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
        const isOps = document.documentElement.className.includes('ops');
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
    
    const isOps = window.location.pathname.includes('telemetry') || window.location.pathname.includes('fleet');
    document.documentElement.className = isOps ? 'state-unauth-ops' : 'state-unauth-merchant';
    
    showToast('Anda telah berhasil keluar dari sesi.');
    navigate('/dashboard');
  },

  handleOwnerRegistrationSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const bizName = document.getElementById('reg-biz-name').value;
    const subdomain = document.getElementById('reg-biz-subdomain').value;
    const ownerName = document.getElementById('reg-owner-name').value;
    const email = document.getElementById('reg-owner-email').value;
    const phone = document.getElementById('reg-biz-phone').value;

    store.dispatch('REGISTER_OWNER', { bizName, subdomain, ownerName, email, phone });
    closeModal();
    showToast(`Pendaftaran ${bizName} berhasil! Silakan periksa email verifikasi.`);
  },

  handleForgotPasswordSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    closeModal();
    showToast(`Tautan atur ulang kata sandi telah dikirimkan ke ${email}`);
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

