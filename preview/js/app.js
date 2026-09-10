/**
 * Main Application Bootstrapper & MVC / Modulith Coordinator
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Register Modules into Internal Dependency Manager
  if (window.moduleManager) {
    moduleManager.register('Store', [], store);
    moduleManager.register('View:Layout', ['Store'], LayoutView);
    moduleManager.register('View:Auth', ['Store'], AuthView);
    moduleManager.register('View:Modals', ['Store'], ModalsView);
    moduleManager.register('View:Dashboard', ['Store'], DashboardView);
    moduleManager.register('View:POS', ['Store'], PosView);
    moduleManager.register('View:Katalog', ['Store'], KatalogView);
    moduleManager.register('View:FIFO', ['Store'], FifoView);
    moduleManager.register('View:Customers', ['Store'], CustomersView);
    moduleManager.register('View:Invoices', ['Store'], InvoicesView);
    moduleManager.register('View:SJ', ['Store'], SjView);
    moduleManager.register('View:Piutang', ['Store'], PiutangView);
    moduleManager.register('View:Users', ['Store'], UsersView);
    moduleManager.register('View:Roles', ['Store'], RolesView);
    moduleManager.register('View:Settings', ['Store'], SettingsView);
    moduleManager.register('View:Operator', ['Store'], OperatorView);

    moduleManager.register('Controller:Auth', ['Store'], AuthController);
    moduleManager.register('Controller:POS', ['Store', 'View:POS'], PosController);
    moduleManager.register('Controller:FIFO', ['Store'], FifoController);
    moduleManager.register('Controller:Customers', ['Store'], CustomersController);
    moduleManager.register('Controller:Roles', ['Store'], RolesController);
    moduleManager.register('Controller:Operator', ['Store'], OperatorController);
    moduleManager.register('Controller:Invoices', ['Store'], InvoicesController);

    // Validate internal dependency health
    moduleManager.validateAll();
  }

  // 2. Mount Auth Overlays
  const authRoot = document.getElementById('auth-root');
  if (authRoot) {
    authRoot.innerHTML = AuthView.renderMerchantLogin() + AuthView.renderOperatorLogin();
  }

  // 3. Mount Modals
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = ModalsView.renderAllModals();
  }

  // 4. Mount App Layout Shell
  const appRoot = document.getElementById('app-root');
  if (appRoot) {
    appRoot.innerHTML = LayoutView.renderShell();
  }

  // 5. Initialize SPA Router
  Router.init();

  // 6. Global Keyboard Shortcuts
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
