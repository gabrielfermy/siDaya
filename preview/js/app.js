/**
 * Main Application Bootstrapper & MVC Coordinator
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mount Auth Overlays
  const authRoot = document.getElementById('auth-root');
  if (authRoot) {
    authRoot.innerHTML = AuthView.renderMerchantLogin() + AuthView.renderOperatorLogin();
  }

  // 2. Mount Modals
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = ModalsView.renderAllModals();
  }

  // 3. Mount App Layout Shell
  const appRoot = document.getElementById('app-root');
  if (appRoot) {
    appRoot.innerHTML = LayoutView.renderShell();
  }

  // 4. Initialize SPA Router
  Router.init();

  // 5. Global Keyboard Shortcuts (e.g. F2 for POS, Esc for closing modals)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
    if (e.key === 'F2') {
      e.preventDefault();
      navigate('/pos');
    }
  });
});

// UI Helper Functions
function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('sidaya_theme', next);
  showToast(`Tema beralih ke mode ${next === 'dark' ? 'gelap 🌙' : 'terang ☀️'}`);
}

function toggleMobileDrawer() {
  const sidebar = document.getElementById('sidebar-nav');
  if (sidebar) sidebar.classList.toggle('drawer-open');
}

function openAddProductModal() { showToast('Form Tambah Produk SKU dibuka.'); }
function openReceiveInboundModal() { showToast('Form Penerimaan Muatan Inbound dibuka.'); }
function openAddCustomerModal() { showToast('Form Tambah Pelanggan Baru dibuka.'); }
function openCreateSjModal() { showToast('Form Penerbitan Surat Jalan dibuka.'); }
function openInviteStaffModal() { showToast('Form Undangan Staf Toko dibuka.'); }
function openInviteOperatorModal() { showToast('Form Undangan Platform Operator dibuka.'); }
function openShiftCloseModal() { showToast('Dialog Penutupan Shift Kasir dibuka.'); }
function openOwnerRegistrationModal() { openModal('modal-owner-reg'); }
function openForgotPasswordModal() { openModal('modal-forgot-password'); }
function switchTenantModal() { showToast('Peralihan multi-tenant workspace aktif.'); }
function openStaffProfile() { showToast('Profil staf toko aktif.'); }
function requestEarlyAccess(title) { showToast(`Permintaan akses awal untuk ${title} telah dicatat! ⭐`); }
