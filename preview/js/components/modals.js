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

/**
 * Toggles visibility for two password input fields simultaneously (Google-style single control)
 * @param {HTMLInputElement} checkboxEl
 * @param {string} id1
 * @param {string} id2
 */
function toggleDualPasswordVisibility(checkboxEl, id1 = 'reg-owner-password', id2 = 'reg-owner-password-confirm') {
  const isShow = checkboxEl ? !!checkboxEl.checked : false;
  [id1, id2].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.type = isShow ? 'text' : 'password';
  });
}

/**
 * Evaluates password strength and tests confirmation equality in real-time
 */
function checkPasswordStrengthAndMatch() {
  checkPasswordStrength('reg-owner-password', 'reg-strength-fill', 'reg-strength-label');
  const p1 = document.getElementById('reg-owner-password')?.value || '';
  const p2 = document.getElementById('reg-owner-password-confirm')?.value || '';
  const indicator = document.getElementById('reg-password-match-indicator');
  const confirmInput = document.getElementById('reg-owner-password-confirm');

  if (!indicator) return;
  if (!p2) {
    indicator.textContent = '';
    if (confirmInput) confirmInput.style.borderColor = '';
    return;
  }
  if (p1 === p2) {
    indicator.textContent = '✓ Sandi cocok';
    indicator.style.color = 'var(--accent-green, #10b981)';
    if (confirmInput) confirmInput.style.borderColor = 'var(--accent-green, #10b981)';
  } else {
    indicator.textContent = '⚠️ Sandi tidak cocok';
    indicator.style.color = 'var(--accent-rose, #ef4444)';
    if (confirmInput) confirmInput.style.borderColor = 'var(--accent-rose, #ef4444)';
  }
}

/**
 * Handles 6-digit OTP auto-advance on numeric input
 */
function handleOtpInput(index, input) {
  input.value = input.value.replace(/[^0-9]/g, '');
  if (input.value && index < 6) {
    const next = document.getElementById(`otp-${index + 1}`);
    if (next) next.focus();
  }
}

/**
 * Handles backspace navigation between OTP boxes
 */
function handleOtpKey(index, event) {
  if (event.key === 'Backspace' && !event.target.value && index > 1) {
    const prev = document.getElementById(`otp-${index - 1}`);
    if (prev) prev.focus();
  }
}

let resendTimerInterval = null;
function startOtpCooldownTimer(seconds = 60) {
  clearInterval(resendTimerInterval);
  let remaining = seconds;
  const btn = document.getElementById('btn-resend-otp');
  const span = document.getElementById('resend-countdown');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }

  resendTimerInterval = setInterval(() => {
    remaining--;
    if (span) span.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(resendTimerInterval);
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.innerHTML = '🔄 Kirim Ulang Kode';
      }
    }
  }, 1000);
}

if (typeof window !== 'undefined') {
  window.toggleDualPasswordVisibility = toggleDualPasswordVisibility;
  window.checkPasswordStrengthAndMatch = checkPasswordStrengthAndMatch;
  window.handleOtpInput = handleOtpInput;
  window.handleOtpKey = handleOtpKey;
  window.startOtpCooldownTimer = startOtpCooldownTimer;
}

