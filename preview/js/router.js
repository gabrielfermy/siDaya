/**
 * @file router.js
 * @description Client-side SPA Router: Coordinates routing, URL pushState, and dynamic MVC View mounting
 * @module Core:Router
 * @implements {RouterInterface}
 * @dependencies Store, LayoutView, DashboardView, KatalogView, FifoView, CustomersView, PosView, InvoicesView, SjView, PiutangView, UsersView, RolesView, SettingsView, OperatorView, RoadmapView, ErrorView
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
    '/settings': { title: 'Konfigurasi Toko & Hardware', render: (s) => SettingsView.render(s) },
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

    // 1. Session Security & Access Authorization Guard
    const isOps = cleanPath === '/telemetry' || cleanPath === '/fleet';
    const isError = typeof ERROR_PAGES !== 'undefined' && !!ERROR_PAGES[cleanPath];
    if (!isError && typeof AuthController !== 'undefined') {
      const isValid = AuthController.validateSession(isOps ? 'operator' : 'merchant', cleanPath);
      if (!isValid) {
        return;
      }
    }

    const state = store.getState();
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
    void container.offsetWidth; // trigger reflow
    container.classList.add('view-enter');

    window.scrollTo(0, 0);
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
   * Updates topbar breadcrumb title
   * @param {string} title - Breadcrumb title text
   */
  updateBreadcrumb(title) {
    const el = document.getElementById('breadcrumb-current-page');
    if (el) el.textContent = title;
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
