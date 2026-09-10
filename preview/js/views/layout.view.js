/**
 * @file layout.view.js
 * @description Layout View: App Shell, Sticky Topbar, Responsive Sidebar, and Navigation Frame
 * @module View:Layout
 * @implements {LayoutViewInterface}
 * @dependencies Store
 */

const LayoutView = {
  /**
   * Renders the complete application shell structure
   * @returns {string} HTML string of layout shell
   */
  renderShell() {
    return `
      <!-- MASTER APPLICATION SHELL -->
      <div class="app-shell" id="app-shell">
        <!-- SIDEBAR NAVIGATION DRAWER -->
        <aside class="sidebar" id="sidebar-nav">
          <div class="sidebar-top">
            <a class="sidebar-brand" onclick="navigate('/dashboard')">
              <div class="sidebar-logo">S</div>
              <div class="brand-title-wrap">
                <span class="sidebar-brand-name">SiDaya</span>
                <span class="sidebar-brand-sub">Enterprise OS</span>
              </div>
            </a>
            <div class="sidebar-tenant-badge">
              <span class="tenant-badge-label">Active Workspace</span>
              <span class="tenant-badge-name" id="sidebar-tenant-name">Toko Grosir Beras Jaya</span>
            </div>
          </div>

          <div class="sidebar-nav">
            <!-- PILAR 01 & PILAR 02 -->
            <div class="nav-section-label">OPERASIONAL UTAMA</div>
            <a class="nav-item active" data-route="/dashboard" onclick="navigate('/dashboard')">
              <span class="nav-icon">📊</span>
              <span class="nav-label">Dashboard</span>
            </a>
            <a class="nav-item" data-route="/katalog" onclick="navigate('/katalog')">
              <span class="nav-icon">🏷️</span>
              <span class="nav-label">Master SKU & Harga</span>
            </a>
            <a class="nav-item" data-route="/fifo" onclick="navigate('/fifo')">
              <span class="nav-icon">📦</span>
              <span class="nav-label">Inbound Lot FIFO</span>
            </a>
            <a class="nav-item" data-route="/pos" onclick="navigate('/pos')">
              <span class="nav-icon">🛒</span>
              <span class="nav-label">Kasir POS Grosir</span>
            </a>

            <!-- PILAR 03, PILAR 05, PILAR 06, PILAR 07 -->
            <div class="nav-section-label">DISTRIBUSI & LOGISTIK</div>
            <a class="nav-item" data-route="/customers" onclick="navigate('/customers')">
              <span class="nav-icon">👥</span>
              <span class="nav-label">CRM & Limit Piutang</span>
            </a>
            <a class="nav-item" data-route="/invoices" onclick="navigate('/invoices')">
              <span class="nav-icon">🧾</span>
              <span class="nav-label">Faktur & Penjualan</span>
            </a>
            <a class="nav-item" data-route="/sj" onclick="navigate('/sj')">
              <span class="nav-icon">🚚</span>
              <span class="nav-label">Surat Jalan (POD)</span>
            </a>
            <a class="nav-item" data-route="/piutang" onclick="navigate('/piutang')">
              <span class="nav-icon">💬</span>
              <span class="nav-label">Buku Piutang & WA</span>
            </a>

            <!-- PILAR 08 & PILAR 09 -->
            <div class="nav-section-label">PENGATURAN & AKSES</div>
            <a class="nav-item" data-route="/users" onclick="navigate('/users')">
              <span class="nav-icon">👤</span>
              <span class="nav-label">Direktori Staf (PIN)</span>
            </a>
            <a class="nav-item" data-route="/roles" onclick="navigate('/roles')">
              <span class="nav-icon">🛡️</span>
              <span class="nav-label">Matriks RBAC</span>
            </a>
            <a class="nav-item" data-route="/settings" onclick="navigate('/settings')">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label">Konfigurasi Hardware</span>
            </a>

            <!-- ASHVIN LABS PLATFORM OPERATOR -->
            <div class="nav-section-label operator-only">ASHVIN LABS OPERATOR</div>
            <a class="nav-item operator-only" data-route="/telemetry" onclick="navigate('/telemetry')">
              <span class="nav-icon">⚡</span>
              <span class="nav-label">Operator Control Plane</span>
            </a>
          </div>

          <div class="sidebar-bottom">
            <div class="user-profile-card" onclick="openStaffProfile()" style="cursor: pointer;" title="Klik untuk lihat profil akun">
              <span class="user-avatar" id="sidebar-user-avatar">B</span>
              <div class="user-meta">
                <span class="user-name" id="sidebar-user-name">Budi Santoso</span>
                <span class="user-role-tag" id="sidebar-user-role">OWNER</span>
              </div>
            </div>
            <button class="logout-btn" onclick="handleLogout()" title="Keluar dari Akun">
              <span>🚪</span> Keluar Sesi
            </button>
          </div>
        </aside>

        <!-- MAIN VIEWPORT CONTAINER -->
        <main class="main-viewport">
          <!-- TOPBAR NAVIGATION -->
          <header class="topbar">
            <div class="topbar-left">
              <button class="mobile-menu-toggle" onclick="toggleMobileDrawer()">☰</button>
              <div>
                <div class="breadcrumb-title" id="breadcrumb-current-page">Dashboard</div>
                <div class="breadcrumb-sub">Toko Grosir Beras Jaya Bersama • Subdomain: <code>berasjaya.sidaya.id</code></div>
              </div>
            </div>

            <div class="topbar-controls">
              <button class="theme-toggle-btn" onclick="toggleDarkMode()" title="Ganti Tema (Gelap/Terang)">🌓</button>
            </div>
          </header>

          <!-- MAIN CONTENT MOUNT TARGET -->
          <div class="content-container" id="main-content">
            <!-- Active View is dynamically mounted here by Router.navigate() -->
          </div>
        </main>
      </div>

      <!-- SIDEBAR BACKDROP FOR MOBILE DRAWER -->
      <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileDrawer()"></div>

      <!-- DEV SUBDOMAIN & HTTP ERROR SIMULATOR FLOATING DOCKS -->
      <div class="dev-subdomain-pill">
        <span style="font-size:0.8rem;">🌐</span>
        <a href="javascript:void(0)" class="dev-subdomain-link active" onclick="switchDevSubdomain('berasjaya')">berasjaya.sidaya.id (Merchant)</a>
        <span style="color:var(--border-medium)">|</span>
        <a href="javascript:void(0)" class="dev-subdomain-link" onclick="switchDevSubdomain('ops')">ops.sidaya.id (Platform Operator)</a>
      </div>

      <div class="error-tester-dock">
        <span style="font-size:0.75rem; font-weight:800; color:var(--text-muted);">HTTP Simulator:</span>
        <button class="error-pill-btn" onclick="navigate('/400')">400</button>
        <button class="error-pill-btn" onclick="navigate('/401')">401</button>
        <button class="error-pill-btn" onclick="navigate('/403')">403</button>
        <button class="error-pill-btn" onclick="navigate('/404')">404</button>
        <button class="error-pill-btn" onclick="navigate('/429')">429</button>
        <button class="error-pill-btn" onclick="navigate('/500')">500</button>
        <button class="error-pill-btn" onclick="navigate('/503')">503</button>
      </div>
    `;
  },
};
