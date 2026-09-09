/**
 * ==========================================================================
 * CLIENT-SIDE ROUTER & UI RENDERER
 * ==========================================================================
 */
function switchModule(mod) {
  const slug = mod === 'owner' ? 'dashboard' : (mod === 'sj' ? 'surat-jalan' : mod);
  history.pushState(null, '', '/' + slug);
  store.dispatch('NAVIGATE', slug);
}

function renderUI(state) {
  // 1. Theme
  document.documentElement.setAttribute('data-theme', state.ui.theme);
  const iconMerchant = document.getElementById('theme-icon');
  const iconOps = document.getElementById('theme-icon-op');
  if (iconMerchant) iconMerchant.textContent = state.ui.theme === 'light' ? '☀️' : '🌙';
  if (iconOps) iconOps.textContent = state.ui.theme === 'light' ? '☀️' : '🌙';

  // 2. Dev Subdomain Links
  const linkMerchant = document.getElementById('dev-link-merchant');
  const linkOps = document.getElementById('dev-link-ops');
  if (linkMerchant) linkMerchant.classList.toggle('active', state.ui.portalMode === 'MERCHANT');
  if (linkOps) linkOps.classList.toggle('active', state.ui.portalMode === 'OPS');

  // 3. Mobile Drawer
  const backdrop = document.getElementById('sidebar-backdrop');
  const sidebars = document.querySelectorAll('.sidebar');
  if (backdrop) backdrop.classList.toggle('active', state.ui.sidebarOpen);
  sidebars.forEach(s => s.classList.toggle('open', state.ui.sidebarOpen));

  // 4. Modals
  const modalMap = {
    'owner-reg': 'modal-owner-reg',
    'forgot-pwd': 'modal-forgot-password',
    'invite-operator': 'modal-invite-operator',
    'invite-staff': 'modal-invite-staff',
    'inbound-lot': 'modal-inbound-lot',
    'add-product': 'modal-add-product',
    'add-customer': 'modal-add-customer',
    'receipt': 'modal-receipt'
  };
  Object.entries(modalMap).forEach(([key, elementId]) => {
    const el = document.getElementById(elementId);
    if (el) {
      if (state.ui.activeModal === key) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  const currentPath = (state.ui.activePath || '').toLowerCase();
  const isErrorRoute = ['400', '401', '403', '404', '429', '500', '503'].includes(currentPath) || currentPath.startsWith('error/');
  const errorCode = isErrorRoute ? (currentPath.replace('error/', '') || '404') : null;
  const isRoadmapRoute = !!ROADMAP_METADATA[currentPath] || !!ROADMAP_METADATA[currentPath.replace('ops/', '')];
  const roadmapKey = currentPath.replace('ops/', '');

  // 5. Portal & Route Rendering
  if (state.ui.portalMode === 'OPS') {
    const isAuth = !!state.auth.operatorUser;
    document.documentElement.className = isAuth ? 'state-auth-ops' : 'state-unauth-ops';

    if (!isAuth) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        history.replaceState(null, '', '/login');
      }
      return;
    }

    const opUser = state.auth.operatorUser;
    const opBadge = document.getElementById('op-sidebar-badge');
    const opName = document.getElementById('op-sidebar-name');
    if (opBadge) {
      opBadge.textContent = opUser.role || 'SUPER_ADMIN';
      opBadge.className = 'operator-role-badge ' + (opUser.badgeClass || 'role-super-admin');
    }
    if (opName) opName.textContent = opUser.name || opUser.email;

    document.querySelectorAll('.op-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('#operator-shell .nav-item').forEach(b => b.classList.remove('active'));

    if (isErrorRoute) {
      const targetTabEl = document.getElementById('op-tab-error');
      if (targetTabEl) targetTabEl.style.display = 'block';
      renderErrorPage(errorCode || '404', true, currentPath);
      document.getElementById('op-header-title').textContent = `⚠️ Status Error ${errorCode || '404'}`;
      document.getElementById('op-header-sub').textContent = 'Diagnostik kegagalan akses platform.';
    } else if (isRoadmapRoute) {
      const targetTabEl = document.getElementById('op-tab-coming-soon');
      const targetNavEl = document.getElementById(`nav-op-${roadmapKey}`);
      if (targetTabEl) targetTabEl.style.display = 'block';
      if (targetNavEl) targetNavEl.classList.add('active');
      renderComingSoonModule(roadmapKey, true);
    } else {
      const validTabs = ['telemetry', 'fleet', 'operators', 'audit'];
      let activeTab = validTabs.includes(currentPath) ? currentPath : null;

      if (!activeTab) {
        const targetTabEl = document.getElementById('op-tab-error');
        if (targetTabEl) targetTabEl.style.display = 'block';
        renderErrorPage('404', true, currentPath);
        document.getElementById('op-header-title').textContent = '🔍 404 • Resource Not Found';
        document.getElementById('op-header-sub').textContent = 'Endpoint kontrol plane tidak ditemukan.';
      } else {
        const targetTabEl = document.getElementById(`op-tab-${activeTab}`);
        const targetNavEl = document.getElementById(`nav-op-${activeTab}`);
        if (targetTabEl) targetTabEl.style.display = 'block';
        if (targetNavEl) targetNavEl.classList.add('active');

        const tabTitles = {
          telemetry: { title: '🌐 Platform Telemetry & Metrics', sub: 'Pemantauan performa cluster & database live.' },
          fleet: { title: '🏢 Tenant Fleet Directory', sub: 'Daftar semua penyewa, langganan tier, & sensor PDP.' },
          operators: { title: '⚡ Manajemen Tim Operator', sub: 'Undang dan kelola operator sistem Ashvin Labs.' },
          audit: { title: '📜 Operator Audit Trail', sub: 'Log aktivitas operator yang tidak dapat diubah (immutable).' }
        };
        if (tabTitles[activeTab]) {
          document.getElementById('op-header-title').textContent = tabTitles[activeTab].title;
          document.getElementById('op-header-sub').textContent = tabTitles[activeTab].sub;
        }

        renderTenantFleetTable(state.operator.tenants, state.operator.isPiiMasked);
        renderOperatorListTable(state.operator.operators);
        renderAuditLogsList(state.operator.auditLogs);
      }
    }

    if (window.location.pathname !== '/' + currentPath) {
      history.replaceState(null, '', '/' + currentPath);
    }

  } else {
    // Merchant Portal Mode
    const isAuth = !!state.auth.merchantUser;
    document.documentElement.className = isAuth ? 'state-auth-merchant' : 'state-unauth-merchant';

    if (!isAuth) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        history.replaceState(null, '', '/login');
      }
      return;
    }

    const mUser = state.auth.merchantUser;
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const tenantEl = document.getElementById('sidebar-tenant-name');

    if (avatarEl) avatarEl.textContent = mUser.avatar || mUser.name?.charAt(0) || 'U';
    if (nameEl) nameEl.textContent = mUser.name || mUser.email;
    if (roleEl) roleEl.textContent = mUser.role || 'MEMBER';
    if (tenantEl && mUser.tenant) tenantEl.textContent = mUser.tenant;

    document.querySelectorAll('.module-view').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));

    if (isErrorRoute) {
      document.getElementById('module-error')?.classList.add('active');
      renderErrorPage(errorCode || '404', false, currentPath);
      document.getElementById('page-heading').textContent = `⚠️ Status Error ${errorCode || '404'}`;
      document.getElementById('page-subheading').textContent = 'Diagnostik permintaan & pemulihan akses.';
    } else if (isRoadmapRoute) {
      document.getElementById('module-coming-soon')?.classList.add('active');
      const navBtn = document.getElementById(`nav-${roadmapKey}`) || document.getElementById(`nav-${currentPath}`);
      if (navBtn) navBtn.classList.add('active');
      renderComingSoonModule(roadmapKey, false);
    } else {
      const routeMap = {
        'dashboard': 'owner',
        'owner': 'owner',
        'pos': 'pos',
        'fifo': 'fifo',
        'sj': 'sj',
        'surat-jalan': 'sj',
        'piutang': 'piutang',
        'katalog': 'katalog',
        'catalog': 'katalog',
        'pengaturan': 'pengaturan',
        'settings': 'pengaturan',
        'customers': 'customers',
        'receiving': 'fifo',
        'invoices': 'invoices',
        'users': 'users',
        'roles': 'roles',
        'audit-logs': 'pengaturan',
        'backup': 'pengaturan'
      };
      let activeMod = routeMap[currentPath];

      if (!activeMod) {
        document.getElementById('module-error')?.classList.add('active');
        renderErrorPage('404', false, currentPath);
        document.getElementById('page-heading').textContent = '🔍 404 • Halaman Tidak Ditemukan';
        document.getElementById('page-subheading').textContent = 'Alamat URL tidak terdaftar di sistem SiDaya.';
      } else {
        document.getElementById(`module-${activeMod}`)?.classList.add('active');
        const navBtn = document.getElementById(`nav-${currentPath}`) || document.getElementById(`nav-${activeMod}`);
        if (navBtn) navBtn.classList.add('active');

        const modTitles = {
          owner: { title: 'Dashboard & Ringkasan Toko', sub: 'Pusat kontrol operasional, metrik omzet, stok, dan tim kerja.' },
          dashboard: { title: 'Dashboard & Ringkasan Toko', sub: 'Pusat kontrol operasional, metrik omzet, stok, dan tim kerja.' },
          customers: { title: 'Direktori Pelanggan & CRM', sub: 'Basis data pelanggan grosir, limit piutang, dan riwayat transaksi.' },
          invoices: { title: 'Faktur Penjualan (Nota Dagang)', sub: 'Semua faktur nota penjualan grosir dan status pelunasan.' },
          users: { title: 'Daftar Staf & Hak Akses PIN', sub: 'Daftar pengguna terdaftar, nomor WhatsApp, dan penugasan peran.' },
          roles: { title: 'Matriks Otoritas & Izin Modul', sub: 'Konfigurasi hak akses RBAC per peran (Owner, Kasir, Gudang, Driver).' },
          pos: { title: 'Kasir Grosir & Barcode Fast-Scan', sub: 'Transaksi penjualan, scan SKU, PayLink QRIS & cetak struk.' },
          fifo: { title: 'Inbound & Gudang FIFO', sub: 'Penerimaan stok lot, alokasi batch FIFO & masa simpan.' },
          receiving: { title: 'Dermaga Penerimaan Barang (Inbound Dock)', sub: 'Pencatatan lot masuk, verifikasi batch FIFO, dan modal supplier.' },
          sj: { title: 'Surat Jalan Driver Logistik', sub: 'Manifest armada logistik & bukti serah terima (Proof of Delivery).' },
          'surat-jalan': { title: 'Surat Jalan Driver Logistik', sub: 'Manifest armada logistik & bukti serah terima (Proof of Delivery).' },
          piutang: { title: 'Buku Piutang & Kasbon Dagang', sub: 'Pelacakan jatuh tempo & pengingat otomatis WhatsApp PayLink.' },
          katalog: { title: 'Master Katalog Produk & Barcode SKU', sub: 'Manajemen ribuan item komoditas, barcode EAN-13, dan COGS modal.' },
          pengaturan: { title: 'Pengaturan Toko & Hardware', sub: 'Profil workspace bisnis, subdomain, printer pairing, & rekening.' },
          'audit-logs': { title: 'Audit Trail Aktivitas Sistem', sub: 'Rekam jejak mutasi data dan otentikasi pengguna secara kronologis.' },
          backup: { title: 'Pencadangan & Ekspor Data Bisnis', sub: 'Ekspor database transaksi, stok opname, dan laporan keuangan.' }
        };
        const titleInfo = modTitles[currentPath] || modTitles[activeMod];
        if (titleInfo) {
          document.getElementById('page-heading').textContent = titleInfo.title;
          document.getElementById('page-subheading').textContent = titleInfo.sub;
        }

        // Render Active Components
        renderOwnerDashboardOverview(state);
        renderCustomerTable(state.customers || []);
        renderStaffTable(state.staff || []);
        renderRoleMatrixTable(state.rolePermissions || {});
        renderInvoicesTable(state.sales || []);
        renderPosCatalog(state.catalog, state.inventoryLots);
        renderPosCart(state.cart);
        renderFifoTimeline(state.catalog, state.inventoryLots);
        renderSuratJalanList(state.suratJalan);
        renderPiutangTable(state.piutang);
        renderKatalogMasterTable(state.catalog, state.inventoryLots, mUser.role.includes('OWNER'));
        renderSettingsView(state);
      }
    }

    const urlSlug = currentPath || 'dashboard';
    if (window.location.pathname !== '/' + urlSlug) {
      history.replaceState(null, '', '/' + urlSlug);
    }
  }
}
