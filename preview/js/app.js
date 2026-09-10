/**
 * @file app.js
 * @description Main Application Bootstrapper & MVC Modulith Coordinator
 * @module Core:App
 * @dependencies Core:DependencyManager, Store, Views, Controllers, Router
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

    // Validate internal dependency graph integrity
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

  // 5. Initialize Session Security & Inactivity Expiry Monitor
  if (typeof AuthController !== 'undefined' && AuthController.initSessionSecurity) {
    AuthController.initSessionSecurity();
  }

  // 6. Initialize SPA Router
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

/**
 * Toggles dark/light executive themes with local storage persistence
 */
function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('sidaya_theme', next);
  showToast(`Tema beralih ke mode ${next === 'dark' ? 'gelap 🌙' : 'terang ☀️'}`);
}

/**
 * Toggles responsive mobile sidebar drawer and backdrop
 */
function toggleMobileDrawer() {
  const sidebar = document.getElementById('sidebar-nav');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.toggle('open');
  if (backdrop) backdrop.classList.toggle('active');
}

/**
 * Switches development simulation subdomain between merchant and operator modes
 * @param {string} subdomain - 'berasjaya' or 'ops'
 */
function switchDevSubdomain(subdomain) {
  const links = document.querySelectorAll('.dev-subdomain-link');
  links.forEach(l => l.classList.remove('active'));

  if (subdomain === 'ops') {
    const hasOpsSession = !!localStorage.getItem('sidaya_operator_session');
    document.documentElement.className = hasOpsSession ? 'state-auth-ops' : 'state-unauth-ops';
    navigate('/telemetry');
  } else {
    const hasMerchantSession = !!localStorage.getItem('sidaya_merchant_session');
    document.documentElement.className = hasMerchantSession ? 'state-auth-merchant' : 'state-unauth-merchant';
    navigate('/dashboard');
  }

  showToast(`Simulasi beralih ke subdomain: ${subdomain}.sidaya.id`);
}

// UI Action Bindings
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
function openStaffProfile() { showToast('Profil staf toko: Budi Santoso (OWNER)'); }
function requestEarlyAccess(title) { showToast(`Permintaan akses awal untuk ${title} telah dicatat! ⭐`); }
function exportExecutiveReport() { showToast('Rekap eksekutif berhasil diunduh (CSV).'); }
function exportInvoicesCsv() { showToast('Rekap faktur berhasil diekspor (CSV).'); }
function exportPiutangCsv() { showToast('Rekap penuaan kasbon berhasil diekspor (CSV).'); }
function viewReceipt(orderNo) { showToast(`Mencetak struk kasir thermal untuk ${orderNo} 🧾`); }
function viewInvoiceReceipt(invNo) { showToast(`Mencetak struk faktur untuk ${invNo} 🧾`); }
function editProduct(id) { showToast(`Mengedit master SKU produk ${id}`); }
function viewPodSignature(sjNo) { showToast(`Membuka berkas tanda tangan digital POD untuk ${sjNo} ✍️`); }
