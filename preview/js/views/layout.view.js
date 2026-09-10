/**
 * @file layout.view.js
 * @description Layout View: App Shell, Sticky Topbar, Responsive Sidebar, and Navigation Frame
 * @module View:Layout
 * @implements {LayoutViewInterface}
 * @dependencies Store
 */

const LayoutView = {
  /**
   * Renders navigation items for the Merchant / Tenant Plane
   * (Strict isolation: Merchant plane has ZERO knowledge of operator plane)
   * @returns {string}
   */
  renderMerchantNav() {
    return `
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
    `;
  },

  /**
   * Renders navigation items for the Operator Plane (exclusive to platform operators)
   * @returns {string}
   */
  renderOperatorNav() {
    return `
      <div class="nav-section-label">ASHVIN LABS OPERATOR</div>
      <a class="nav-item active" data-route="/telemetry" onclick="navigate('/telemetry')">
        <span class="nav-icon">⚡</span>
        <span class="nav-label">Operator Control Plane</span>
      </a>
      <a class="nav-item" data-route="/fleet" onclick="navigate('/fleet')">
        <span class="nav-icon">🏢</span>
        <span class="nav-label">Tenant Fleet Directory</span>
      </a>
    `;
  },

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
              <span class="tenant-badge-label" id="sidebar-tenant-badge-label">Active Workspace</span>
              <span class="tenant-badge-name" id="sidebar-tenant-name">Toko Grosir Beras Jaya</span>
            </div>
          </div>

          <div class="sidebar-nav" id="sidebar-nav-content">
            ${this.renderMerchantNav()}
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
                <div class="breadcrumb-sub" id="topbar-breadcrumb-sub">Toko Grosir Beras Jaya Bersama • Subdomain: <code id="topbar-subdomain-code">berasjaya.${(typeof window !== 'undefined' && window.location.hostname.endsWith('sidaya.my.id')) ? 'sidaya.my.id' : 'sidaya.biz.id'}</code></div>
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
    `;
  },

  /**
   * Renders top warning banner during active operator impersonation session
   * @param {Object} imp - Impersonation details
   * @returns {string}
   */
  renderImpersonationBanner(imp) {
    const tenantName = imp?.targetTenant?.businessName || 'Toko Grosir Beras Jaya';
    const userName = imp?.targetUser?.name || 'Staf';
    const ticketRef = imp?.ticketRef || '#INC-SUPPORT';
    const reason = imp?.reason || 'Support Investigation';

    return `
      <div class="impersonation-dock-banner">
        <div class="impersonation-dock-left">
          <span class="impersonation-pulse-icon">🎭</span>
          <div>
            <div class="impersonation-title">MODE INVESTIGASI OPERATOR: Bertindak atas nama ${tenantName} (${userName})</div>
            <div class="impersonation-sub">Ref Tiket: <code>${ticketRef}</code> • Alasan: ${reason}</div>
          </div>
        </div>
        <button class="btn-exit-impersonation" onclick="OperatorController.handleExitImpersonation()">
          🚪 Akhiri Impersonasi & Kembali ke Control Plane
        </button>
      </div>
    `;
  },
};
