/**
 * ==========================================================================
 * MODALS & AUTHENTICATION FORMS COMPONENT
 * ==========================================================================
 */
function openModal(modalKey) { store.dispatch('OPEN_MODAL', modalKey); }
function closeModal() { store.dispatch('CLOSE_MODAL'); }
function openOwnerRegistrationModal() { store.dispatch('OPEN_MODAL', 'owner-reg'); }
function openForgotPasswordModal() { store.dispatch('OPEN_MODAL', 'forgot-pwd'); }

function quickLoginPreset(email) {
  if (typeof AuthController !== 'undefined') AuthController.quickLoginPreset(email);
}

function handleMerchantLoginSubmit() {
  if (typeof AuthController !== 'undefined') AuthController.handleMerchantLoginSubmit();
}

function quickLoginOperator(email, role) {
  if (typeof AuthController !== 'undefined') AuthController.quickLoginOperator(email, role);
}

function handleOperatorLoginSubmit() {
  if (typeof AuthController !== 'undefined') AuthController.handleOperatorLoginSubmit();
}

function handleLogout() {
  if (typeof AuthController !== 'undefined') AuthController.handleLogout();
  else store.dispatch('LOGOUT');
}

async function handleOwnerRegistrationSubmit(e) {
  e.preventDefault();
  const payload = {
    businessName: document.getElementById('reg-biz-name').value,
    subdomain: document.getElementById('reg-biz-subdomain').value,
    phoneNumber: document.getElementById('reg-biz-phone').value,
    ownerName: document.getElementById('reg-owner-name').value,
    email: document.getElementById('reg-owner-email').value,
    password: document.getElementById('reg-owner-password').value,
  };
  try {
    await fetch('http://localhost:4000/api/v1/auth/register-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {}
  store.dispatch('CLOSE_MODAL');
  showToast(`🎉 Registrasi Berhasil! Verifikasi dikirim ke ${payload.email}`, 'success');
}

async function handleForgotPasswordSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value;
  try {
    await fetch('http://localhost:4000/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  } catch (err) {}
  store.dispatch('CLOSE_MODAL');
  showToast(`✉️ Tautan reset sandi dikirim ke ${email}`, 'success');
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🔒';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

function checkPasswordStrength(inputId, fillId, labelId) {
  const password = document.getElementById(inputId).value;
  const fill = document.getElementById(fillId);
  const label = document.getElementById(labelId);

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;

  if (score <= 1) {
    fill.style.width = '20%';
    fill.style.backgroundColor = 'var(--accent-rose)';
    label.textContent = 'Sangat Lemah';
    label.style.color = 'var(--accent-rose)';
  } else if (score === 2) {
    fill.style.width = '40%';
    fill.style.backgroundColor = 'var(--accent-amber)';
    label.textContent = 'Lemah';
    label.style.color = 'var(--accent-amber)';
  } else if (score === 3) {
    fill.style.width = '60%';
    fill.style.backgroundColor = '#EAB308';
    label.textContent = 'Cukup';
    label.style.color = '#EAB308';
  } else if (score === 4) {
    fill.style.width = '80%';
    fill.style.backgroundColor = 'var(--primary)';
    label.textContent = 'Kuat';
    label.style.color = 'var(--primary)';
  } else {
    fill.style.width = '100%';
    fill.style.backgroundColor = 'var(--accent-green)';
    label.textContent = 'Sangat Kuat ✓';
    label.style.color = 'var(--accent-green)';
  }
}
