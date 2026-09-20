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
    moduleManager.register('View:Landing', ['Store'], LandingView);
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
    moduleManager.register('View:Profile', ['Store'], ProfileView);
    moduleManager.register('View:Settings', ['Store'], SettingsView);
    moduleManager.register('View:Operator', ['Store'], OperatorView);
    moduleManager.register('View:Legal', ['Store'], LegalView);

    moduleManager.register('Controller:Auth', ['Store'], AuthController);
    moduleManager.register('Controller:POS', ['Store', 'View:POS'], PosController);
    moduleManager.register('Controller:FIFO', ['Store'], FifoController);
    moduleManager.register('Controller:Customers', ['Store'], CustomersController);
    moduleManager.register('Controller:Users', ['Store'], UsersController);
    moduleManager.register('Controller:Operator', ['Store'], OperatorController);
    moduleManager.register('Controller:Invoices', ['Store'], InvoicesController);
    moduleManager.register('Controller:Legal', ['Store'], LegalController);

    moduleManager.register('View:Daya', ['Store'], DayaView);
    moduleManager.register('Controller:Daya', ['Store'], DayaController);
    moduleManager.register('Util:Audit', ['Store'], AuditEmitter);

    // Validate internal dependency graph integrity
    moduleManager.validateAll();
  }

  // 2. Mount Auth Overlays
  const authRoot = document.getElementById('auth-root');
  if (authRoot) {
    authRoot.innerHTML = AuthView.renderMerchantLogin() + AuthView.renderMerchantRegister() + AuthView.renderEmailVerification() + AuthView.renderOperatorLogin();
    if (window.location.pathname === '/register' && typeof AuthController !== 'undefined') {
      setTimeout(() => AuthController.showRegisterScreen(), 0);
    }
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

  // 5. Initialize Daya AI Co-Pilot Widget
  if (typeof DayaController !== 'undefined' && DayaController.init) {
    DayaController.init();
  }

  // 6. Initialize Session Security & Inactivity Expiry Monitor
  if (typeof AuthController !== 'undefined' && AuthController.initSessionSecurity) {
    AuthController.initSessionSecurity();
  }

  // 7. Initialize SPA Router
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
 * Executive Theme Manager
 * Supports 3 options: 'system' (default), 'light', 'dark'
 */
const ThemeManager = {
  getMode() {
    return localStorage.getItem('sidaya_theme_mode') || 'system';
  },

  getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  },

  getEffectiveTheme(mode) {
    const targetMode = mode || this.getMode();
    return targetMode === 'system' ? this.getSystemTheme() : targetMode;
  },

  setTheme(mode, notify = true) {
    if (!['system', 'light', 'dark'].includes(mode)) mode = 'system';
    localStorage.setItem('sidaya_theme_mode', mode);
    
    const effective = this.getEffectiveTheme(mode);
    document.documentElement.setAttribute('data-theme', effective);
    document.documentElement.setAttribute('data-theme-mode', mode);

    this.updateControls(mode);

    if (notify && typeof showToast === 'function') {
      const labels = {
        system: `Tema Sistem (${effective === 'dark' ? 'Gelap 🌙' : 'Terang ☀️'})`,
        light: 'Tema Terang ☀️',
        dark: 'Tema Gelap 🌙'
      };
      showToast(`Tema diatur ke: ${labels[mode]}`);
    }
  },

  init() {
    const mode = this.getMode();
    this.setTheme(mode, false);

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.getMode() === 'system') {
          const effective = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', effective);
          this.updateControls('system');
        }
      });
    }
  },

  updateControls(mode) {
    const activeMode = mode || this.getMode();
    document.querySelectorAll('[data-theme-option]').forEach(btn => {
      const option = btn.getAttribute('data-theme-option');
      if (option === activeMode) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  },

  /**
   * Renders the 3-option Segmented Theme Switcher Control
   * @param {Object} [options]
   * @param {string} [options.id]
   * @param {string} [options.className]
   * @returns {string} HTML string
   */
  renderSwitcher(options = {}) {
    const currentMode = this.getMode();
    const idAttr = options.id ? `id="${options.id}"` : '';
    const classAttr = options.className || 'theme-switcher-segmented';

    return `
      <div class="${classAttr}" ${idAttr} role="radiogroup" aria-label="Pilihan Tema Tampilan">
        <button type="button" 
                class="theme-btn ${currentMode === 'light' ? 'active' : ''}" 
                data-theme-option="light" 
                onclick="ThemeManager.setTheme('light')" 
                title="Mode Terang (Light)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <span class="theme-btn-label">Terang</span>
        </button>

        <button type="button" 
                class="theme-btn ${currentMode === 'dark' ? 'active' : ''}" 
                data-theme-option="dark" 
                onclick="ThemeManager.setTheme('dark')" 
                title="Mode Gelap (Dark)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span class="theme-btn-label">Gelap</span>
        </button>

        <button type="button" 
                class="theme-btn ${currentMode === 'system' ? 'active' : ''}" 
                data-theme-option="system" 
                onclick="ThemeManager.setTheme('system')" 
                title="Ikuti Tema Sistem Operasi (Default)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span class="theme-btn-label">Sistem</span>
        </button>
      </div>
    `;
  }
};

// Initialize ThemeManager immediately
ThemeManager.init();

/**
 * Toggles dark/light/system executive themes
 */
function toggleDarkMode() {
  const current = ThemeManager.getMode();
  const next = current === 'light' ? 'dark' : (current === 'dark' ? 'system' : 'light');
  ThemeManager.setTheme(next);
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
function openInviteStaffModal() {
  if (typeof UsersController !== 'undefined' && UsersController.openInviteModal) {
    UsersController.openInviteModal();
  } else {
    showToast('Form Undangan Staf Toko dibuka.');
  }
}
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

// Live Reload Client for Local Development (Automatic hot-reload on save)
if (typeof window !== 'undefined' && window.EventSource && (window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost') || window.location.hostname === '127.0.0.1')) {
  try {
    const es = new EventSource('/__livereload');
    es.onmessage = (e) => {
      if (e.data === 'reload') {
        console.log('[LiveReload] File change detected, reloading page...');
        window.location.reload();
      }
    };
  } catch (err) {}
}
