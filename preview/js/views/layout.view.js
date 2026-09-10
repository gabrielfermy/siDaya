/**
 * Layout View: Topbar, Sidebar, Mobile Drawer, and App Frame
 */
const LayoutView = {
  renderShell() {
    return `
      <!-- TOPBAR NAVIGATION -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="mobile-menu-toggle" onclick="toggleMobileDrawer()">☰</button>
          <div class="topbar-brand">
            <span class="topbar-logo">S</span>
            <span class="topbar-title">SiDaya <span class="badge-tag">ENTERPRISE</span></span>
          </div>
          <div class="breadcrumb" id="topbar-breadcrumb">
            <span class="breadcrumb-item">Toko Grosir Beras Jaya</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item active" id="breadcrumb-current-page">Dashboard</span>
          </div>
        </div>

        <div class="topbar-right">
          <div class="tenant-selector-pill" onclick="switchTenantModal()">
            <span>🏪</span>
            <span id="topbar-tenant-name">Beras Jaya Bersama</span>
            <span class="badge-tag" style="background:var(--accent-amber-soft); color:var(--accent-amber);">PRO</span>
          </div>

          <div class="user-profile-pill" onclick="openStaffProfile()">
            <span class="user-avatar" id="topbar-user-avatar">B</span>
            <div class="user-info">
              <span class="user-name" id="topbar-user-name">Budi Santoso</span>
              <span class="user-role-badge" id="topbar-user-role">OWNER</span>
            </div>
          </div>

          <button class="icon-btn theme-toggle-btn" onclick="toggleDarkMode()" title="Ganti Tema (Gelap/Terang)">🌓</button>
          <button class="icon-btn logout-btn" onclick="handleLogout()" title="Keluar dari Akun">🚪</button>
        </div>
      </header>

      <div class="app-layout-body">
        <!-- SIDEBAR NAVIGATION -->
        <aside class="sidebar" id="sidebar-nav">
          <div class="sidebar-section-label">OPERASIONAL UTAMA</div>
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

          <div class="sidebar-section-label">DISTRIBUSI & LOGISTIK</div>
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

          <div class="sidebar-section-label">PENGATURAN & AKSES</div>
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

          <div class="sidebar-section-label operator-only">ASHVIN LABS OPERATOR</div>
          <a class="nav-item operator-only" data-route="/telemetry" onclick="navigate('/telemetry')">
            <span class="nav-icon">⚡</span>
            <span class="nav-label">Operator Control Plane</span>
          </a>
        </aside>

        <!-- MAIN VIEWPORT CONTAINER -->
        <main class="main-viewport" id="main-viewport"></main>
      </div>
    `;
  },
};
