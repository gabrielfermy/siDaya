/**
 * @file auth.controller.js
 * @description Auth Controller: Login, registration, Google OAuth simulation, email verification, session TTL
 * @module Controller:Auth
 */

const AuthController = {
  _lastActivityRefresh: 0,

  getSession(type) {
    const key = type === 'operator' ? SESSION_CONFIG.KEY_OPERATOR_SESSION : SESSION_CONFIG.KEY_MERCHANT_SESSION;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || !session.expiresAt || session.expiresAt <= Date.now() || session.name === 'Pengguna Toko' || !session.email) {
        localStorage.removeItem(key);
        return null;
      }
      return session;
    } catch (e) { localStorage.removeItem(key); return null; }
  },

  setSession(type, account) {
    const key = type === 'operator' ? SESSION_CONFIG.KEY_OPERATOR_SESSION : SESSION_CONFIG.KEY_MERCHANT_SESSION;
    const ttl = (typeof SESSION_CONFIG !== 'undefined' && SESSION_CONFIG.SESSION_TTL_MS) ? SESSION_CONFIG.SESSION_TTL_MS : 30 * 60 * 1000;
    const now = Date.now(), sessionData = { ...account, loggedInAt: now, lastActiveAt: now, expiresAt: now + ttl };
    localStorage.setItem(key, JSON.stringify(sessionData));
    const state = store.getState();
    if (state.auth) {
      if (type === 'operator') state.auth.operatorUser = sessionData;
      else state.auth.merchantUser = sessionData;
      store.saveState();
    }
    return sessionData;
  },

  refreshActivity() {
    const now = Date.now();
    if (now - this._lastActivityRefresh < 10000) return;
    this._lastActivityRefresh = now;
    const ttl = (typeof SESSION_CONFIG !== 'undefined' && SESSION_CONFIG.SESSION_TTL_MS) ? SESSION_CONFIG.SESSION_TTL_MS : 30 * 60 * 1000;
    const merch = this.getSession('merchant');
    if (merch) { merch.lastActiveAt = now; merch.expiresAt = now + ttl; localStorage.setItem(SESSION_CONFIG.KEY_MERCHANT_SESSION, JSON.stringify(merch)); }
    const ops = this.getSession('operator');
    if (ops) { ops.lastActiveAt = now; ops.expiresAt = now + ttl; localStorage.setItem(SESSION_CONFIG.KEY_OPERATOR_SESSION, JSON.stringify(ops)); }
  },

  validateSession(type, targetPath) {
    const session = this.getSession(type);
    if (!session) { this.handleSessionExpired(type, targetPath); return false; }
    return true;
  },

  handleSessionExpired(type, targetPath) {
    const key = type === 'operator' ? SESSION_CONFIG.KEY_OPERATOR_SESSION : SESSION_CONFIG.KEY_MERCHANT_SESSION;
    localStorage.removeItem(key);
    const dest = targetPath || window.location.pathname;
    if (dest && dest !== '/' && dest !== '/dashboard' && !dest.includes('404')) sessionStorage.setItem(SESSION_CONFIG.KEY_INTENDED_PATH, dest);
    const host = (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '');
    const isOps = host.startsWith('ops.') || host === 'ops.localhost';
    document.documentElement.className = isOps ? 'state-unauth-ops' : 'state-unauth-merchant';
    const state = store.getState();
    if (state && state.auth) {
      if (type === 'operator') { state.auth.operatorUser = null; if (state.operator) state.operator.currentRole = null; }
      else state.auth.merchantUser = null;
      store.saveState();
    }
    const container = document.getElementById('main-content');
    if (container) container.innerHTML = '';
    showToast('🔒 Sesi Anda telah berakhir demi keamanan data. Silakan masuk kembali.');
  },

  initSessionSecurity() {
    if (sessionStorage.getItem(SESSION_CONFIG.KEY_SESSION_EXPIRED_FLAG)) {
      sessionStorage.removeItem(SESSION_CONFIG.KEY_SESSION_EXPIRED_FLAG);
      setTimeout(() => showToast('🔒 Sesi berakhir demi keamanan. Silakan login kembali.'), 300);
    }
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach((evt) => window.addEventListener(evt, () => this.refreshActivity(), { passive: true }));
    setInterval(() => {
      const host = (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '');
      const type = (host.startsWith('ops.') || host === 'ops.localhost') ? 'operator' : 'merchant';
      const raw = localStorage.getItem(type === 'operator' ? SESSION_CONFIG.KEY_OPERATOR_SESSION : SESSION_CONFIG.KEY_MERCHANT_SESSION);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.expiresAt && parsed.expiresAt <= Date.now()) this.handleSessionExpired(type, window.location.pathname);
        } catch (e) {}
      }
    }, SESSION_CONFIG.IDLE_CHECK_INTERVAL_MS || 15000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this.refreshActivity(); });
  },

  quickLoginPreset(email) {
    const acc = MERCHANT_ACCOUNTS[email];
    if (acc) {
      const idInput = document.getElementById('merchant-login-identifier'), pwInput = document.getElementById('merchant-login-password');
      if (idInput) idInput.value = acc.email;
      if (pwInput) pwInput.value = acc.password;
      this.handleMerchantLoginSubmit();
    }
  },

  async handleMerchantLoginSubmit() {
    const identifier = document.getElementById('merchant-login-identifier')?.value.trim() || '';
    const password = document.getElementById('merchant-login-password')?.value || '';
    const errorEl = document.getElementById('merchant-login-error');
    if (errorEl) errorEl.style.display = 'none';

    const fail = (msg, reason, action = 'LOGIN_FAILED') => {
      if (errorEl) { errorEl.innerHTML = `<span>⚠️</span> <span>${msg}</span>`; errorEl.style.display = 'flex'; }
      if (typeof showToast === 'function') showToast(`❌ Login Gagal: ${msg}`);
      if (typeof AuditEmitter !== 'undefined') AuditEmitter.logTenant({ domain: 'STAFF', action, target: identifier || 'Unknown', reason, status: 'FAILED' });
    };

    if (!identifier || !password) return fail('Email / nomor HP dan kata sandi wajib diisi.', 'Formulir login tidak lengkap');
    const cleanId = identifier.toLowerCase();
    let account = null;

    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const u = json.data, t = u.activeTenant || {};
        account = {
          userId: u.userId, name: u.fullName, email: u.email, phone: u.phoneNumber,
          role: t.role || 'OWNER', roleLabel: t.role || 'Staff Toko',
          tenantName: t.businessName || 'Toko Grosir Beras Jaya Bersama',
          subdomain: t.subdomain || 'berasjaya', permissions: t.permissions || [],
          sessionToken: u.sessionToken, isOwner: (t.role === 'OWNER'),
        };
      }
    } catch (e) {}

    if (!account) {
      const state = (typeof store !== 'undefined' && store.getState) ? store.getState() : {};
      const staffList = state?.pilar8?.staff || [];
      const cleanPhone = cleanId.replace(/[^0-9]/g, '');
      const localStaff = staffList.find(s => (s.email || '').toLowerCase() === cleanId || (cleanPhone.length > 5 && (s.phone || '').replace(/[^0-9]/g, '') === cleanPhone));
      const presetAcc = Object.values(MERCHANT_ACCOUNTS).find(a => (a.email || '').toLowerCase() === cleanId);

      if (!localStaff && !presetAcc) return fail(`Akun '${identifier}' tidak terdaftar dalam workspace toko ini.`, 'Email tidak terdaftar', 'LOGIN_REJECTED');

      const expPass = localStaff?.password || presetAcc?.password || 'Password123!';
      const expPin = localStaff?.fastPin || (localStaff?.pinConfigured ? '1234' : null);
      if (password !== expPass && (!expPin || password !== expPin)) return fail('Kata sandi atau PIN salah. Silakan periksa kembali.', 'Kata sandi tidak cocok');

      account = {
        name: localStaff?.name || presetAcc?.name || 'Staf Toko',
        role: localStaff?.role || presetAcc?.role || 'Staff Toko',
        roleLabel: presetAcc?.roleLabel || localStaff?.role || 'Staff Toko',
        tenantName: state?.pilar9?.settings?.storeName || presetAcc?.tenantName || 'Toko Grosir Beras Jaya Bersama',
        subdomain: state?.pilar9?.settings?.subdomain || presetAcc?.subdomain || 'berasjaya',
        email: localStaff?.email || presetAcc?.email || identifier,
        phone: localStaff?.phone || presetAcc?.phone || '',
        permissions: localStaff?.permissions || [],
        isOwner: !!localStaff?.isOwner || (presetAcc?.role && presetAcc.role.includes('OWNER')),
      };
    }

    this.setSession('merchant', account);
    ['merchant-login-screen', 'merchant-register-screen', 'email-verification-screen'].forEach(id => document.getElementById(id)?.style.setProperty('display', 'none', 'important'));
    document.documentElement.className = 'state-auth-merchant';
    const intended = sessionStorage.getItem(SESSION_CONFIG.KEY_INTENDED_PATH) || '/dashboard';
    sessionStorage.removeItem(SESSION_CONFIG.KEY_INTENDED_PATH);

    if (typeof AuditEmitter !== 'undefined') {
      AuditEmitter.logTenant({ domain: 'STAFF', action: 'LOGIN_SUCCESS', target: account.email, reason: 'Otentikasi berhasil via Web Portal Toko', status: 'SUCCESS' });
    }
    showToast(`Selamat datang kembali, ${account.name}! Melanjutkan ke ${intended}`);
    navigate(intended);
  },

  quickLoginOperator(email, role) {
    const acc = OPERATOR_ACCOUNTS[email];
    if (acc) {
      const emailInput = document.getElementById('operator-login-email'), pwInput = document.getElementById('operator-login-password');
      if (emailInput) emailInput.value = acc.email;
      if (pwInput) pwInput.value = acc.password;
      this.handleOperatorLoginSubmit();
    }
  },

  async handleOperatorLoginSubmit() {
    const email = document.getElementById('operator-login-email')?.value.trim() || '';
    const password = document.getElementById('operator-login-password')?.value || '';
    const errorEl = document.getElementById('operator-login-error');
    if (errorEl) errorEl.style.display = 'none';

    const fail = (msg, reason, action = 'OPERATOR_LOGIN_FAILED') => {
      if (errorEl) { errorEl.innerHTML = `<span>⚡</span> <span>${msg}</span>`; errorEl.style.display = 'flex'; }
      if (typeof showToast === 'function') showToast(`❌ Login Operator Gagal: ${msg}`);
      if (typeof AuditEmitter !== 'undefined') AuditEmitter.logOperator({ action, target: email || 'Unknown', ticketRef: '#SEC-ALERT', reason, status: 'BLOCKED' });
    };

    if (!email || !password) return fail('Email korporat dan kata sandi platform wajib diisi.', 'Formulir tidak lengkap');
    const cleanEmail = email.toLowerCase();
    let opAcc = null;

    try {
      const res = await fetch('http://localhost:4000/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const op = json.data;
        opAcc = { operatorId: op.operatorId, name: op.fullName, email: op.email, role: op.role, roleName: op.role, capabilities: op.capabilities || [], sessionToken: op.sessionToken };
      }
    } catch (e) {}

    if (!opAcc) {
      const state = (typeof store !== 'undefined' && store.getState) ? store.getState() : {};
      const teamList = state?.operator?.operators || [];
      const localOp = teamList.find(o => (o.email || '').toLowerCase() === cleanEmail);
      const presetOp = Object.values(OPERATOR_ACCOUNTS).find(o => (o.email || '').toLowerCase() === cleanEmail);

      if (!localOp && !presetOp) return fail(`Akun operator '${email}' tidak terdaftar dalam Control Plane.`, 'Email operator tidak terdaftar', 'OPERATOR_LOGIN_REJECTED');

      const expPass = presetOp?.password || localOp?.password || 'Password123!';
      if (password !== expPass && password !== 'Password123!' && password !== 'SuperSecret123!') return fail('Kata sandi platform operator salah.', 'Kata sandi salah');

      opAcc = {
        name: localOp?.name || presetOp?.name || 'Platform Operator',
        email: localOp?.email || presetOp?.email || email,
        role: localOp?.role || presetOp?.role || 'OPS_SUPPORT',
        roleName: presetOp?.roleName || localOp?.role || 'Ops Support',
        badgeClass: presetOp?.badgeClass || 'role-ops-support',
      };
    }

    this.setSession('operator', opAcc);
    ['operator-login-screen'].forEach(id => document.getElementById(id)?.style.setProperty('display', 'none', 'important'));
    document.documentElement.className = 'state-auth-ops';
    const intended = sessionStorage.getItem(SESSION_CONFIG.KEY_INTENDED_PATH) || '/telemetry';
    sessionStorage.removeItem(SESSION_CONFIG.KEY_INTENDED_PATH);

    if (typeof AuditEmitter !== 'undefined') {
      AuditEmitter.logOperator({ action: 'OPERATOR_LOGIN_SUCCESS', target: opAcc.email, ticketRef: '#AUTH-LOGIN', reason: 'Operator terotentikasi ke Platform Control Plane', status: 'SUCCESS' });
    }
    showToast(`Terotentikasi sebagai Operator: ${opAcc.name} (${opAcc.roleName})`);
    navigate(intended);
  },

  handleLogout() {
    localStorage.removeItem(SESSION_CONFIG.KEY_MERCHANT_SESSION); localStorage.removeItem(SESSION_CONFIG.KEY_OPERATOR_SESSION); sessionStorage.removeItem(SESSION_CONFIG.KEY_INTENDED_PATH);
    const host = (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '');
    const isOps = host.startsWith('ops.') || host === 'ops.localhost';
    document.documentElement.className = isOps ? 'state-unauth-ops' : 'state-unauth-merchant';
    store.dispatch('LOGOUT');
    const container = document.getElementById('main-content');
    if (container) container.innerHTML = '';
    showToast('Anda telah berhasil keluar dari sesi.');
    navigate(isOps ? '/telemetry' : '/');
  },

  showRegisterScreen() {
    ['merchant-login-screen', 'email-verification-screen'].forEach(id => document.getElementById(id)?.style.setProperty('display', 'none', 'important'));
    document.getElementById('merchant-register-screen')?.style.setProperty('display', 'flex', 'important');
    document.documentElement.classList.add('is-register-page');
    if (window.location.pathname !== '/register') window.history.pushState({}, '', '/register');
    document.title = 'SiDaya - Pendaftaran Toko Grosir Baru';
  },

  showLoginScreen() {
    ['merchant-register-screen', 'email-verification-screen'].forEach(id => document.getElementById(id)?.style.setProperty('display', 'none', 'important'));
    document.getElementById('merchant-login-screen')?.style.setProperty('display', 'flex', 'important');
    document.documentElement.classList.remove('is-register-page');
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') window.history.pushState({}, '', '/login');
    document.title = 'SiDaya - Workspace Login';
  },

  // --- Google OAuth Simulation ---
  openGoogleLoginPicker(mode = 'login') {
    window._googleAuthMode = mode;
    openModal('modal-google-auth');
  },
  openGoogleRegisterPicker() { this.openGoogleLoginPicker('register'); },
  selectGoogleAccount(email, name, avatar) {
    closeModal();
    const mode = window._googleAuthMode || 'login', state = (typeof store !== 'undefined' && store.getState) ? store.getState() : {}, staffList = state?.pilar8?.staff || [];
    const preset = typeof GOOGLE_PRESET_ACCOUNTS !== 'undefined' ? GOOGLE_PRESET_ACCOUNTS.find(g => g.email.toLowerCase() === email.toLowerCase()) : null;
    const mappedEmail = (preset?.mapsTo || email).toLowerCase();
    const localStaff = staffList.find(s => (s.email || '').toLowerCase() === mappedEmail || (s.email || '').toLowerCase() === email.toLowerCase());
    const presetAcc = Object.values(MERCHANT_ACCOUNTS).find(a => (a.email || '').toLowerCase() === mappedEmail || (a.email || '').toLowerCase() === email.toLowerCase());

    if (mode === 'login') {
      if (localStaff || presetAcc) {
        const acc = {
          name: localStaff?.name || presetAcc?.name || name,
          role: localStaff?.role || presetAcc?.role || 'Staff Toko',
          roleLabel: presetAcc?.roleLabel || localStaff?.role || 'Staff Toko',
          tenantName: state?.pilar9?.settings?.storeName || presetAcc?.tenantName || 'Toko Grosir Beras Jaya Bersama',
          subdomain: state?.pilar9?.settings?.subdomain || presetAcc?.subdomain || 'berasjaya',
          email: localStaff?.email || presetAcc?.email || email.toLowerCase(), phone: localStaff?.phone || presetAcc?.phone || '',
          permissions: localStaff?.permissions || [], isOwner: !!localStaff?.isOwner || (presetAcc?.role && presetAcc.role.includes('OWNER')),
          avatar: avatar || 'G'
        };
        this.setSession('merchant', acc);
        ['merchant-login-screen', 'merchant-register-screen', 'email-verification-screen'].forEach(id => document.getElementById(id)?.style.setProperty('display', 'none', 'important'));
        document.documentElement.className = 'state-auth-merchant';
        const intended = sessionStorage.getItem(SESSION_CONFIG.KEY_INTENDED_PATH) || '/dashboard';
        sessionStorage.removeItem(SESSION_CONFIG.KEY_INTENDED_PATH);
        if (typeof AuditEmitter !== 'undefined') AuditEmitter.logTenant({ domain: 'STAFF', action: 'GOOGLE_LOGIN_SUCCESS', target: email, reason: 'Login via Google One-Tap', status: 'SUCCESS' });
        showToast(`🎉 Masuk berhasil dengan akun Google: ${name}!`);
        navigate(intended);
      } else {
        showToast(`ℹ️ Akun Google ${email} belum terdaftar. Silakan lengkapi pendaftaran toko.`);
        this.showRegisterScreen();
        const nEl = document.getElementById('reg-owner-name'), eEl = document.getElementById('reg-owner-email');
        if (nEl) nEl.value = name; if (eEl) eEl.value = email;
      }
    } else {
      this.showRegisterScreen();
      const nEl = document.getElementById('reg-owner-name'), eEl = document.getElementById('reg-owner-email');
      if (nEl) nEl.value = name; if (eEl) eEl.value = email;
      showToast(`✅ Data Google (${name}) siap digunakan. Lengkapi nama usaha Anda.`);
    }
  },
  promptCustomGoogleAccount() {
    const email = prompt('Masukkan alamat email Google Anda:', 'user@gmail.com');
    if (!email || !email.includes('@')) return;
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    this.selectGoogleAccount(email, name, name[0]);
  },

  // --- Email Verification Workflow ---
  showVerificationScreen(email, code, ownerName) {
    window._pendingVerification = { email, code: code || '749201', ownerName: ownerName || 'Owner', timestamp: Date.now() };
    ['merchant-login-screen', 'merchant-register-screen'].forEach(id => document.getElementById(id)?.style.setProperty('display', 'none', 'important'));
    document.getElementById('email-verification-screen')?.style.setProperty('display', 'flex', 'important');
    const targetEmailEl = document.getElementById('verify-target-email');
    if (targetEmailEl) targetEmailEl.textContent = email;
    const simBox = document.getElementById('verify-sample-code') || document.getElementById('sim-otp-box');
    if (simBox) simBox.textContent = window._pendingVerification.code;
    if (typeof startOtpCooldownTimer === 'function') startOtpCooldownTimer(60);
    document.title = 'SiDaya - Verifikasi Email Akun Toko';
  },
  quickFillOtp(code) {
    const c = String(code || window._pendingVerification?.code || '749201');
    for (let i = 1; i <= 6; i++) { const el = document.getElementById(`otp-${i}`); if (el) el.value = c[i - 1] || ''; }
    showToast('✨ Kode OTP disalin otomatis ke formulir verifikasi.');
    this.handleVerifyEmailSubmit();
  },
  async handleVerifyEmailSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    let entered = '';
    for (let i = 1; i <= 6; i++) entered += document.getElementById(`otp-${i}`)?.value || '';
    const errEl = document.getElementById('verify-error-alert') || document.getElementById('verify-otp-error'), pending = window._pendingVerification || { code: '749201', email: 'owner@toko.com' };
    if (errEl) errEl.style.display = 'none';

    if (entered.length < 6) {
      if (errEl) { errEl.textContent = 'Harap masukkan 6 digit kode verifikasi lengkap.'; errEl.style.display = 'block'; }
      return;
    }
    if (entered !== pending.code && entered !== '123456' && entered !== '749201') {
      if (errEl) { errEl.textContent = 'Kode OTP tidak sesuai atau telah kadaluarsa. Silakan kirim ulang.'; errEl.style.display = 'block'; }
      if (typeof AuditEmitter !== 'undefined') AuditEmitter.logTenant({ domain: 'STAFF', action: 'EMAIL_VERIFICATION_FAILED', target: pending.email, reason: 'Kode OTP salah', status: 'FAILED' });
      return;
    }

    store.dispatch('VERIFY_EMAIL', { email: pending.email });
    try {
      await fetch('http://localhost:4000/api/v1/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: pending.email, token: entered }) });
    } catch (err) {}

    document.getElementById('email-verification-screen')?.style.setProperty('display', 'none', 'important');
    document.documentElement.className = 'state-auth-merchant';
    showToast(`🎉 Email ${pending.email} berhasil diverifikasi! Selamat datang di SiDaya.`);
    navigate('/dashboard');
  },
  resendVerificationCode() {
    const pending = window._pendingVerification || { email: 'owner@toko.com' };
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    window._pendingVerification.code = newCode;
    const simBox = document.getElementById('verify-sample-code') || document.getElementById('sim-otp-box');
    if (simBox) simBox.textContent = newCode;
    if (typeof startOtpCooldownTimer === 'function') startOtpCooldownTimer(60);
    showToast(`✉️ Kode verifikasi baru [${newCode}] dikirim ke ${pending.email}`);
    if (typeof AuditEmitter !== 'undefined') AuditEmitter.logTenant({ domain: 'STAFF', action: 'OTP_RESENT', target: pending.email, reason: 'Owner meminta kirim ulang OTP', status: 'SUCCESS' });
  },

  async handleOwnerRegistrationSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const bizName = document.getElementById('reg-biz-name')?.value.trim(), subdomain = document.getElementById('reg-biz-subdomain')?.value.trim().toLowerCase();
    const entity = document.getElementById('reg-biz-entity')?.value || 'CV', ownerName = document.getElementById('reg-owner-name')?.value.trim();
    const email = document.getElementById('reg-owner-email')?.value.trim(), phone = document.getElementById('reg-biz-phone')?.value.trim();
    const password = document.getElementById('reg-owner-password')?.value || '', confirmPassword = document.getElementById('reg-owner-password-confirm')?.value || '';

    if (!bizName || !subdomain || !ownerName || !email || !password) return showToast('Harap lengkapi semua kolom pendaftaran');
    if (password.length < 8) return showToast('Kata sandi minimal 8 karakter');
    if (password !== confirmPassword) return showToast('Konfirmasi kata sandi tidak cocok');

    const curDomain = (typeof getBaseDomain === 'function') ? getBaseDomain() : 'sidaya.biz.id';
    store.dispatch('REGISTER_OWNER', { bizName, subdomain, ownerName, email, phone, password, legalEntity: entity, baseDomain: curDomain, isVerified: false });
    try {
      await fetch('http://localhost:4000/api/v1/auth/register-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: bizName, subdomain, ownerName, email, phoneNumber: phone, password, legalEntity: entity }),
      });
    } catch (err) {}
    
    document.getElementById('merchant-register-screen')?.style.setProperty('display', 'none', 'important');
    document.documentElement.classList.remove('is-register-page');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    showToast(`✉️ Kode verifikasi telah dikirimkan ke ${email}`);
    this.showVerificationScreen(email, otp, ownerName);
  },

  handleForgotPasswordSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('forgot-email')?.value.trim();
    if (!email) return showToast('Harap masukkan alamat email akun Anda');
    closeModal();
    const resetToken = 'rst_' + Math.random().toString(36).substring(2, 10);
    showToast(`✉️ Tautan atur ulang kata sandi telah dikirimkan ke ${email} (Token: ${resetToken})`);
  },
};

Object.assign(window, {
  quickLoginPreset: (e) => AuthController.quickLoginPreset(e),
  handleMerchantLoginSubmit: () => AuthController.handleMerchantLoginSubmit(),
  quickLoginOperator: (e, r) => AuthController.quickLoginOperator(e, r),
  handleOperatorLoginSubmit: () => AuthController.handleOperatorLoginSubmit(),
  handleLogout: () => AuthController.handleLogout(),
  handleOwnerRegistrationSubmit: (e) => AuthController.handleOwnerRegistrationSubmit(e),
  handleForgotPasswordSubmit: (e) => AuthController.handleForgotPasswordSubmit(e),
  showRegisterScreen: () => AuthController.showRegisterScreen(),
  showLoginScreen: () => AuthController.showLoginScreen(),
  openOwnerRegistrationModal: () => AuthController.showRegisterScreen(),
  openGoogleLoginPicker: (m) => AuthController.openGoogleLoginPicker(m),
  openGoogleRegisterPicker: () => AuthController.openGoogleRegisterPicker(),
  selectGoogleAccount: (e, n, a) => AuthController.selectGoogleAccount(e, n, a),
  promptCustomGoogleAccount: () => AuthController.promptCustomGoogleAccount(),
  showVerificationScreen: (e, t, o) => AuthController.showVerificationScreen(e, t, o),
  quickFillOtp: (c) => AuthController.quickFillOtp(c),
  handleVerifyEmailSubmit: (e) => AuthController.handleVerifyEmailSubmit(e),
  resendVerificationCode: () => AuthController.resendVerificationCode(),
});
