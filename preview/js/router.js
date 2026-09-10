/**
 * @fileoverview Client-side SPA Router: Coordinates routing, URL pushState, and dynamic MVC View mounting
 * @module Core:Router
 * @description
 * Manages client route transitions, pre-paint session validation, strict operator route guarding,
 * breadcrumb updating, and floating impersonation banner docking.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

const Router = {
  routes: {
    '/': { title: 'Dashboard', render: (s) => DashboardView.render(s) },
    '/dashboard': { title: 'Dashboard', render: (s) => DashboardView.render(s) },
    '/katalog': { title: 'Master SKU & Harga', render: (s) => KatalogView.render(s) },
    '/fifo': { title: 'Inbound Lot FIFO', render: (s) => FifoView.render(s) },
    '/customers': { title: 'CRM & Limit Piutang', render: (s) => CustomersView.render(s) },
    '/pos': { title: 'Kasir POS Grosir', render: (s) => PosView.render(s) },
    '/invoices': { title: 'Faktur & Penjualan', render: (s) => InvoicesView.render(s) },
    '/sj': { title: 'Surat Jalan (POD)', render: (s) => SjView.render(s) },
    '/piutang': { title: 'Buku Piutang & WA PayLink', render: (s) => PiutangView.render(s) },
    '/users': { title: 'Direktori Staf (PIN)', render: (s) => UsersView.render(s) },
    '/roles': { title: 'Matriks RBAC', render: (s) => RolesView.render(s) },
    '/settings': { title: 'Pengaturan & Domain', render: (s) => SettingsView.render(s) },
    '/telemetry': { title: 'Operator Control Plane', render: (s) => OperatorView.render(s) },
    '/fleet': { title: 'Operator Fleet Directory', render: (s) => OperatorView.render(s) },
  },

  /**
   * Navigates to a specific path, rendering the appropriate MVC view into #main-content
   * @param {string} path - Target route path
   * @param {boolean} [pushState=true] - Whether to push to browser history
   */
  navigate(path, pushState = true) {
    const cleanPath = '/' + path.replace(/^\/+|\/+$/g, '');
    const container = document.getElementById('main-content');
    if (!container) return;

    if (pushState && window.location.pathname !== cleanPath) {
      window.history.pushState({}, '', cleanPath);
    }

    const state = store.getState();
    const isOpsRoute = cleanPath === '/telemetry' || cleanPath === '/fleet';
    const isError = typeof ERROR_PAGES !== 'undefined' && !!ERROR_PAGES[cleanPath];

    // Strict Tenant Isolation: Block operator routes from regular tenant sessions
    if (isOpsRoute && !state?.auth?.impersonation?.active) {
      const isOpsUser = !!localStorage.getItem('sidaya_operator_session');
      const isMerchUser = !!localStorage.getItem('sidaya_merchant_session');
      if (!isOpsUser && isMerchUser) {
        Toast.show('⛔ Akses Ditolak: Rute ini khusus Operator Platform.', 'error');
        Router.navigate('/dashboard', false);
        return;
      }
    }

    // Session Security & Inactivity Validation Guard
    if (!isError && typeof AuthController !== 'undefined') {
      const isValid = AuthController.validateSession(isOpsRoute ? 'operator' : 'merchant', cleanPath);
      if (!isValid) return;
    }

    // Synchronize Plane Isolation (Sidebar, Branding, Breadcrumbs)
    this.syncPlaneShell(isOpsRoute, state);

    // Floating Top Impersonation Banner Docking
    this.updateImpersonationBanner(state?.auth?.impersonation);

    const route = this.routes[cleanPath];

    try {
      if (route) {
        container.innerHTML = route.render(state);
        document.title = `SiDaya - ${route.title}`;
        this.updateActiveNav(cleanPath);
        this.updateBreadcrumb(route.title);
      } else if (typeof ROADMAP_FEATURES !== 'undefined' && ROADMAP_FEATURES[cleanPath]) {
        const spec = ROADMAP_FEATURES[cleanPath];
        container.innerHTML = RoadmapView.render(spec);
        document.title = `SiDaya - ${spec.title} (Roadmap)`;
        this.updateActiveNav(cleanPath);
        this.updateBreadcrumb(`${spec.title} (Roadmap)`);
      } else if (typeof ERROR_PAGES !== 'undefined' && ERROR_PAGES[cleanPath]) {
        const errSpec = ERROR_PAGES[cleanPath];
        container.innerHTML = ErrorView.render(errSpec, cleanPath);
        document.title = `SiDaya - Error ${errSpec.statusCode}`;
        this.updateActiveNav('');
        this.updateBreadcrumb(`Error ${errSpec.statusCode}`);
      } else {
        const errSpec = typeof ERROR_PAGES !== 'undefined' && ERROR_PAGES['/404']
          ? ERROR_PAGES['/404']
          : { statusCode: '404', title: 'Halaman Tidak Ditemukan', desc: 'Rute tidak terdaftar.' };
        container.innerHTML = ErrorView.render(errSpec, cleanPath);
        document.title = 'SiDaya - 404 Halaman Tidak Ditemukan';
        this.updateActiveNav('');
        this.updateBreadcrumb('404 Not Found');
      }
    } catch (err) {
      console.error('[Router Navigation Error]', err);
      container.innerHTML = `
        <div class="card" style="max-width:540px; margin:40px auto; text-align:center; padding:32px 24px;">
          <div style="font-size:2.5rem; margin-bottom:12px;">⚠️</div>
          <h2 style="font-size:1.2rem; font-weight:800; color:var(--text-primary); margin-bottom:8px;">Terjadi Kendala Memuat Tampilan</h2>
          <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:20px; line-height:1.5;">${err.message || 'Gagal merender komponen modul tampilan.'}</p>
          <button class="btn btn-primary" onclick="resetAndReloadState()">🔄 Muat Ulang & Pulihkan State</button>
        </div>
      `;
    }

    // Close mobile drawer if open
    const sidebar = document.getElementById('sidebar-nav');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');

    // Trigger smooth view transition animation
    container.classList.remove('view-enter');
    void container.offsetWidth; // reflow
    container.classList.add('view-enter');

    window.scrollTo(0, 0);
  },

  /**
   * Synchronizes UI Shell branding and sidebar navigation to enforce strict plane isolation
   * @param {boolean} isOps
   * @param {Object} state
   */
  syncPlaneShell(isOps, state) {
    const navContent = document.getElementById('sidebar-nav-content');
    const badgeLabel = document.getElementById('sidebar-tenant-badge-label');
    const tenantName = document.getElementById('sidebar-tenant-name');
    const userAvatar = document.getElementById('sidebar-user-avatar');
    const userName = document.getElementById('sidebar-user-name');
    const userRole = document.getElementById('sidebar-user-role');
    const topbarSub = document.getElementById('topbar-breadcrumb-sub');
    const baseDomain = (typeof window !== 'undefined' && window.location.hostname.endsWith('sidaya.my.id')) ? 'sidaya.my.id' : 'sidaya.biz.id';

    if (isOps) {
      if (navContent && typeof LayoutView !== 'undefined' && LayoutView.renderOperatorNav) {
        navContent.innerHTML = LayoutView.renderOperatorNav();
      }
      if (badgeLabel) badgeLabel.textContent = 'Platform Scope';
      if (tenantName) tenantName.textContent = 'Ashvin Labs Fleet Ops';
      if (userAvatar) userAvatar.textContent = '⚡';
      if (userName) userName.textContent = state?.auth?.operatorUser?.name || 'Platform Operator';
      if (userRole) userRole.textContent = state?.auth?.operatorUser?.roleName || 'SUPER_ADMIN';
      if (topbarSub) topbarSub.innerHTML = `Ashvin Labs Platform Operations • Subdomain: <code id="topbar-subdomain-code">ops.${baseDomain}</code>`;
    } else {
      if (navContent && typeof LayoutView !== 'undefined' && LayoutView.renderMerchantNav) {
        navContent.innerHTML = LayoutView.renderMerchantNav();
      }
      if (badgeLabel) badgeLabel.textContent = 'Active Workspace';
      if (tenantName) tenantName.textContent = state?.auth?.impersonation?.active ? (state.auth.impersonation.targetTenant?.businessName || 'Toko Grosir Beras Jaya') : 'Toko Grosir Beras Jaya';
      if (userAvatar) userAvatar.textContent = state?.auth?.impersonation?.active ? (state.auth.impersonation.targetUser?.avatar || 'S') : 'B';
      if (userName) userName.textContent = state?.auth?.impersonation?.active ? (state.auth.impersonation.targetUser?.name || 'Staf') : 'Budi Santoso';
      if (userRole) userRole.textContent = state?.auth?.impersonation?.active ? (state.auth.impersonation.targetUser?.role || 'Staff') : 'OWNER';
      if (topbarSub) topbarSub.innerHTML = `Toko Grosir Beras Jaya Bersama • Subdomain: <code id="topbar-subdomain-code">berasjaya.${baseDomain}</code>`;

      // Strictly purge any floating operator remnants from tenant DOM
      const floatingDocks = document.querySelectorAll('#app-shell > .error-tester-dock, body > .error-tester-dock');
      floatingDocks.forEach(d => d.remove());
      const devPills = document.querySelectorAll('.dev-subdomain-pill');
      devPills.forEach(p => p.remove());
    }
  },

  /**
   * Updates sidebar active link indicators
   * @param {string} path - Current active path
   */
  updateActiveNav(path) {
    document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
      const routeAttr = item.getAttribute('data-route');
      if (routeAttr === path || (path === '/' && routeAttr === '/dashboard')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },

  /**
   * Updates topbar breadcrumb title and dynamic subdomain
   * @param {string} title - Breadcrumb title text
   */
  updateBreadcrumb(title) {
    const el = document.getElementById('breadcrumb-current-page');
    if (el) el.textContent = title;

    const subEl = document.getElementById('topbar-subdomain-code');
    if (subEl) {
      const isOps = window.location.pathname.includes('telemetry') || window.location.pathname.includes('fleet');
      const baseDomain = (typeof window !== 'undefined' && window.location.hostname.endsWith('sidaya.my.id')) ? 'sidaya.my.id' : 'sidaya.biz.id';
      if (isOps) {
        subEl.textContent = `ops.${baseDomain}`;
      } else {
        const currentSub = store.getState()?.pilar9?.settings?.subdomain || 'berasjaya';
        subEl.textContent = `${currentSub}.${baseDomain}`;
      }
    }
  },

  /**
   * Updates top floating impersonation warning banner
   * @param {Object} impersonation
   */
  updateImpersonationBanner(impersonation) {
    const bannerRoot = document.getElementById('impersonation-banner-root');
    if (!bannerRoot) return;

    if (impersonation && impersonation.active) {
      bannerRoot.innerHTML = LayoutView.renderImpersonationBanner(impersonation);
      document.body.classList.add('impersonation-active');
    } else {
      bannerRoot.innerHTML = '';
      document.body.classList.remove('impersonation-active');
    }
  },

  /**
   * Initializes browser popstate listener and navigates to current location
   */
  init() {
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });

    const initialPath = window.location.pathname || '/dashboard';
    this.navigate(initialPath, false);
  },
};

/**
 * Global navigation helper for inline HTML onclick attributes
 * @param {string} path - Target path
 */
function navigate(path) {
  Router.navigate(path);
}
