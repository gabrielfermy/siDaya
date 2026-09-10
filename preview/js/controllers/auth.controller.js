/**
 * Auth Controller: Manages login, registration, password reset, and session state
 */
const AuthController = {
  quickLoginPreset(email) {
    const acc = MERCHANT_ACCOUNTS[email];
    if (acc) {
      document.getElementById('merchant-login-identifier').value = acc.email;
      document.getElementById('merchant-login-password').value = acc.password;
      this.handleMerchantLoginSubmit();
    }
  },

  handleMerchantLoginSubmit() {
    const identifier = document.getElementById('merchant-login-identifier').value.trim();
    const account = MERCHANT_ACCOUNTS[identifier] || {
      name: 'Pengguna Toko',
      role: 'Staff Toko',
      tenantName: 'Toko Grosir Beras Jaya',
      email: identifier,
    };

    localStorage.setItem('sidaya_merchant_session', JSON.stringify(account));
    document.documentElement.className = 'state-auth-merchant';

    showToast(`Selamat datang kembali, ${account.name}!`);
    navigate('/dashboard');
  },

  quickLoginOperator(email, role) {
    const acc = OPERATOR_ACCOUNTS[email] || {
      name: 'Platform Operator',
      email,
      role,
      roleName: role,
    };

    localStorage.setItem('sidaya_operator_session', JSON.stringify(acc));
    document.documentElement.className = 'state-auth-ops';

    showToast(`Terotentikasi sebagai Platform Operator: ${acc.name} (${acc.roleName})`);
    navigate('/telemetry');
  },

  handleOperatorLoginSubmit() {
    const email = document.getElementById('operator-login-email').value.trim();
    this.quickLoginOperator(email, 'SUPER_ADMIN');
  },

  handleLogout() {
    localStorage.removeItem('sidaya_merchant_session');
    localStorage.removeItem('sidaya_operator_session');
    
    const isOps = window.location.pathname.includes('telemetry') || window.location.pathname.includes('fleet');
    document.documentElement.className = isOps ? 'state-unauth-ops' : 'state-unauth-merchant';
    
    showToast('Anda telah berhasil keluar dari sesi.');
    navigate('/dashboard');
  },

  handleOwnerRegistrationSubmit(e) {
    e.preventDefault();
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
    e.preventDefault();
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
