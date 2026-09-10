/**
 * Client-side SPA Router: Coordinates routing, URL updates, and MVC View mounting
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

  navigate(path, pushState = true) {
    const cleanPath = '/' + path.replace(/^\/+|\/+$/g, '');
    const container = document.getElementById('main-viewport');
    if (!container) return;

    if (pushState && window.location.pathname !== cleanPath) {
      window.history.pushState({}, '', cleanPath);
    }

    const state = store.getState();
    const route = this.routes[cleanPath];

    if (route) {
      container.innerHTML = route.render(state);
      document.title = `SiDaya - ${route.title}`;
      this.updateActiveNav(cleanPath);
      this.updateBreadcrumb(route.title);
    } else if (ROADMAP_FEATURES[cleanPath]) {
      const spec = ROADMAP_FEATURES[cleanPath];
      container.innerHTML = RoadmapView.render(spec);
      document.title = `SiDaya - ${spec.title} (Roadmap)`;
      this.updateActiveNav(cleanPath);
      this.updateBreadcrumb(`${spec.title} (Roadmap)`);
    } else if (ERROR_PAGES[cleanPath]) {
      const errSpec = ERROR_PAGES[cleanPath];
      container.innerHTML = ErrorView.render(errSpec, cleanPath);
      document.title = `SiDaya - Error ${errSpec.statusCode}`;
      this.updateActiveNav('');
      this.updateBreadcrumb(`Error ${errSpec.statusCode}`);
    } else {
      const errSpec = ERROR_PAGES['/404'];
      container.innerHTML = ErrorView.render(errSpec, cleanPath);
      document.title = 'SiDaya - 404 Halaman Tidak Ditemukan';
      this.updateActiveNav('');
      this.updateBreadcrumb('404 Not Found');
    }

    window.scrollTo(0, 0);
  },

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

  updateBreadcrumb(title) {
    const el = document.getElementById('breadcrumb-current-page');
    if (el) el.textContent = title;
  },

  init() {
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });

    const initialPath = window.location.pathname || '/dashboard';
    this.navigate(initialPath, false);
  },
};

function navigate(path) {
  Router.navigate(path);
}
