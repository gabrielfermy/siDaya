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
  /**
   * Checks if current runtime is hosted on operator subdomain
   * @returns {boolean}
   */
  isOpsHost() {
    if (typeof window === 'undefined') return false;
    const h = window.location.hostname.toLowerCase();
    return h.startsWith('ops.') || h === 'ops.localhost';
  },

  // Routes accessible on the Merchant / Tenant Plane
  merchantRoutes: {
    '/': { title: 'Dashboard', render: (s) => DashboardView.render(s) },
    '/dashboard': { title: 'Dashboard', render: (s) => DashboardView.render(s) },
    '/katalog': { title: 'Master SKU & Harga', render: (s) => KatalogView.render(s) },
    '/fifo': { title: 'Inbound Lot FIFO', render: (s) => FifoView.render(s) },
    '/customers': { title: 'CRM & Limit Piutang', render: (s) => CustomersView.render(s) },
    '/pos': { title: 'Kasir POS Grosir', render: (s) => PosView.render(s) },
    '/invoices': { title: 'Faktur & Penjualan', render: (s) => InvoicesView.render(s) },
    '/sj': { title: 'Surat Jalan (POD)', render: (s) => SjView.render(s) },
    '/piutang': { title: 'Buku Piutang & WA PayLink', render: (s) => PiutangView.render(s) },
    '/users': { title: 'Staf & Hak Akses', render: (s) => UsersView.render(s) },
    '/roles': { title: 'Staf & Hak Akses', render: (s) => UsersView.render(s) },
    '/settings': { title: 'Pengaturan & Domain', render: (s) => SettingsView.render(s) },
  },

  // Routes accessible exclusively on the Operator Plane (ops. subdomain)
  operatorRoutes: {
    '/': { title: 'Operator Control Plane', render: (s) => OperatorView.render(s) },
    '/telemetry': { title: 'Operator Control Plane', render: (s) => OperatorView.render(s) },
    '/fleet': { title: 'Operator Fleet Directory', render: (s) => OperatorView.render(s) },
  },

  /**
   * Toggles standalone error full-screen layout mode
   * @param {boolean} active
   */
  setErrorMode(active) {
    const appShell = document.getElementById('app-shell');
    if (appShell) {
      if (active) appShell.classList.add('is-error-page');
      else appShell.classList.remove('is-error-page');
    }
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
    const isOps = this.isOpsHost();
    const isError = typeof ERROR_PAGES !== 'undefined' && !!ERROR_PAGES[cleanPath];

    // STRICT SUBDOMAIN BARRIER:
    // Operator endpoints are completely non-existent on the Tenant Plane.
    const isOperatorEndpoint = ['/telemetry', '/fleet', '/operators', '/audit'].includes(cleanPath);
    if (!isOps && isOperatorEndpoint) {
      const errSpec = typeof ERROR_PAGES !== 'undefined' && ERROR_PAGES['/404']
        ? ERROR_PAGES['/404']
        : { statusCode: '404', title: 'Halaman Tidak Ditemukan', desc: 'Rute tidak terdaftar.' };
      this.setErrorMode(true);
      container.innerHTML = ErrorView.render(errSpec, cleanPath);
      document.title = 'SiDaya - 404 Halaman Tidak Ditemukan';
      return;
    }

    // On OPS subdomain, root and /dashboard redirect to /telemetry
    if (isOps && (cleanPath === '/' || cleanPath === '/dashboard')) {
      this.navigate('/telemetry', pushState);
      return;
    }

    // Session Security & Inactivity Validation Guard
    if (!isError && typeof AuthController !== 'undefined') {
      const sessionType = isOps ? 'operator' : 'merchant';
      const isValid = AuthController.validateSession(sessionType, cleanPath);
      if (!isValid) return;
    }

    // Synchronize Plane Isolation (Sidebar, Branding, Breadcrumbs)
    this.syncPlaneShell(isOps, state);

    // Floating Top Impersonation Banner Docking
    this.updateImpersonationBanner(state?.auth?.impersonation);

    // Resolve route strictly according to current plane
    const routeTable = isOps ? this.operatorRoutes : this.merchantRoutes;
    const route = routeTable[cleanPath] || (state?.auth?.impersonation?.active ? this.merchantRoutes[cleanPath] : null);

    try {
      if (route) {
        this.setErrorMode(false);
        container.innerHTML = route.render(state);
        document.title = `SiDaya - ${route.title}`;
        this.updateActiveNav(cleanPath);
        this.updateBreadcrumb(route.title);
      } else if (typeof ROADMAP_FEATURES !== 'undefined' && ROADMAP_FEATURES[cleanPath]) {
        this.setErrorMode(false);
        const spec = ROADMAP_FEATURES[cleanPath];
        container.innerHTML = RoadmapView.render(spec);
        document.title = `SiDaya - ${spec.title} (Roadmap)`;
        this.updateActiveNav(cleanPath);
        this.updateBreadcrumb(`${spec.title} (Roadmap)`);
      } else if (typeof ERROR_PAGES !== 'undefined' && ERROR_PAGES[cleanPath]) {
        const errSpec = ERROR_PAGES[cleanPath];
        this.setErrorMode(true);
        container.innerHTML = ErrorView.render(errSpec, cleanPath);
        document.title = `SiDaya - Error ${errSpec.statusCode}`;
      } else {
        const errSpec = typeof ERROR_PAGES !== 'undefined' && ERROR_PAGES['/404']
          ? ERROR_PAGES['/404']
          : { statusCode: '404', title: 'Halaman Tidak Ditemukan', desc: 'Rute tidak terdaftar.' };
        this.setErrorMode(true);
        container.innerHTML = ErrorView.render(errSpec, cleanPath);
        document.title = 'SiDaya - 404 Halaman Tidak Ditemukan';
      }
    } catch (err) {
      console.error('[Router Navigation Error]', err);
      this.setErrorMode(true);
      container.innerHTML = ErrorView.render({ statusCode: '500', title: 'Terjadi Kendala Sistem', desc: err.message || 'Gagal memuat modul tampilan.' }, cleanPath);
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

    // Synchronize Daya AI Operational Screen Context
    if (!isOps && typeof DayaController !== 'undefined' && DayaController.onRouteChanged) {
      DayaController.onRouteChanged(cleanPath);
    }

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
      const mUser = state?.auth?.merchantUser;
      const imp = state?.auth?.impersonation;
      if (badgeLabel) badgeLabel.textContent = 'Active Workspace';
      if (tenantName) tenantName.textContent = imp?.active ? (imp.targetTenant?.businessName || 'Toko Grosir Beras Jaya') : (mUser?.tenantName || 'Toko Grosir Beras Jaya');
      if (userAvatar) userAvatar.textContent = imp?.active ? (imp.targetUser?.avatar || 'S') : (mUser?.avatar || (mUser?.name ? mUser.name.charAt(0) : '—'));
      if (userName) userName.textContent = imp?.active ? (imp.targetUser?.name || 'Staf') : (mUser?.name || 'Belum Masuk');
      if (userRole) userRole.textContent = imp?.active ? (imp.targetUser?.role || 'Staff') : (mUser?.role || 'Tamu');
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
      const isOps = this.isOpsHost();
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

    const isOps = this.isOpsHost();
    const initialPath = window.location.pathname || (isOps ? '/telemetry' : '/dashboard');
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
