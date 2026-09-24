/**
 * @file landing.view.js
 * @description Executive-Grade Public Landing Page for SiDaya Wholesale SaaS Platform
 * With Out-of-Screen Responsive Mobile Menu Drawer & Refined Ashvin Labs ID Branding
 * @module View:Landing
 */

const LandingView = {
  /**
   * Toggles the sliding out-of-screen mobile navigation drawer
   * @param {boolean} [open]
   */
  toggleMobileMenu(open) {
    const drawer = document.getElementById('landing-mobile-drawer');
    const backdrop = document.getElementById('landing-drawer-backdrop');
    if (!drawer || !backdrop) return;

    const shouldOpen = (typeof open === 'boolean') ? open : !drawer.classList.contains('open');
    if (shouldOpen) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  render() {
    const baseDomain = (typeof getBaseDomain === 'function') ? getBaseDomain() : 'sidaya.biz.id';
    const proto = (typeof getAppProtocol === 'function') ? getAppProtocol() : 'https:';

    return `
      <div class="landing-container">
        <!-- Ambient Radial Lighting -->
        <div class="landing-ambient-top"></div>
        <div class="landing-ambient-mid"></div>
        <div class="landing-ambient-bottom"></div>

        <!-- 1. EXECUTIVE NAVIGATION BAR -->
        <header class="landing-navbar">
          <div class="landing-nav-inner">
            <!-- Brand Logo (Affinity Designer Bespoke Vector Lockup) -->
            <div class="landing-brand" onclick="navigate('/')" role="button" aria-label="siDaya by Ashvin Labs IDN">
              <img src="/assets/brand/logo-horizontal-dark.svg" alt="siDaya By Ashvin Labs Idn" height="46" class="brand-logo-horizontal dark-theme-logo" style="height:46px; width:auto; max-width:240px; object-fit:contain;">
              <img src="/assets/brand/logo-horizontal-transparent.svg" alt="siDaya By Ashvin Labs Idn" height="46" class="brand-logo-horizontal light-theme-logo" style="height:46px; width:auto; max-width:240px; object-fit:contain;">
            </div>

            <!-- Desktop Menu Links -->
            <nav class="landing-nav-menu">
              <a class="landing-nav-link" href="#fitur" onclick="event.preventDefault(); document.getElementById('fitur')?.scrollIntoView({behavior:'smooth'});">Fitur Unggulan</a>
              <a class="landing-nav-link" href="#komparasi" onclick="event.preventDefault(); document.getElementById('komparasi')?.scrollIntoView({behavior:'smooth'});">Kenapa SiDaya</a>
              <a class="landing-nav-link" href="#harga" onclick="event.preventDefault(); document.getElementById('harga')?.scrollIntoView({behavior:'smooth'});">Paket & Harga</a>
              <a class="landing-nav-link" href="#keamanan" onclick="event.preventDefault(); document.getElementById('keamanan')?.scrollIntoView({behavior:'smooth'});">Keamanan & Regulasi</a>
              <a class="landing-nav-link" href="#faq" onclick="event.preventDefault(); document.getElementById('faq')?.scrollIntoView({behavior:'smooth'});">FAQ</a>
            </nav>

            <!-- Desktop Action Buttons & Theme Dropdown -->
            <div class="landing-nav-actions">
              ${(typeof ThemeManager !== 'undefined') ? ThemeManager.renderDropdown({ id: 'landing-nav-theme-dropdown', showLabel: false }) : ''}
              <button type="button" class="btn-nav-login" onclick="navigate('/login')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span>Masuk Toko</span>
              </button>
              <button type="button" class="btn-nav-cta" onclick="navigate('/register')">
                <span>Coba Gratis 14 Hari</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            <!-- Mobile Out-of-Screen Menu Toggle Button -->
            <button type="button" class="landing-mobile-toggle" onclick="LandingView.toggleMobileMenu(true)" aria-label="Buka Menu Navigasi">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <!-- OUT-OF-SCREEN SLIDE-OUT MOBILE DRAWER -->
        <div class="landing-mobile-backdrop" id="landing-drawer-backdrop" onclick="LandingView.toggleMobileMenu(false)"></div>
        <div class="landing-mobile-drawer" id="landing-mobile-drawer">
          <div>
            <!-- Drawer Header -->
            <div class="drawer-top-header">
              <div class="landing-brand" onclick="LandingView.toggleMobileMenu(false); navigate('/');" role="button" aria-label="siDaya by Ashvin Labs IDN">
                <img src="/assets/brand/logo-horizontal-dark.svg" alt="siDaya By Ashvin Labs Idn" height="42" class="brand-logo-horizontal dark-theme-logo" style="height:42px; width:auto; max-width:220px; object-fit:contain;">
                <img src="/assets/brand/logo-horizontal-transparent.svg" alt="siDaya By Ashvin Labs Idn" height="42" class="brand-logo-horizontal light-theme-logo" style="height:42px; width:auto; max-width:220px; object-fit:contain;">
              </div>

              <button type="button" class="drawer-close-btn" onclick="LandingView.toggleMobileMenu(false)" aria-label="Tutup Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Drawer Navigation Links -->
            <ul class="drawer-nav-list">
              <li class="drawer-nav-item">
                <a onclick="LandingView.toggleMobileMenu(false); document.getElementById('fitur')?.scrollIntoView({behavior:'smooth'});">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>
                  <span>Fitur Unggulan</span>
                </a>
              </li>
              <li class="drawer-nav-item">
                <a onclick="LandingView.toggleMobileMenu(false); document.getElementById('komparasi')?.scrollIntoView({behavior:'smooth'});">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  <span>Kenapa SiDaya (ROI)</span>
                </a>
              </li>
              <li class="drawer-nav-item">
                <a onclick="LandingView.toggleMobileMenu(false); document.getElementById('harga')?.scrollIntoView({behavior:'smooth'});">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  <span>Paket & Harga Langganan</span>
                </a>
              </li>
              <li class="drawer-nav-item">
                <a onclick="LandingView.toggleMobileMenu(false); document.getElementById('keamanan')?.scrollIntoView({behavior:'smooth'});">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span>Keamanan & Regulasi UU PDP</span>
                </a>
              </li>
              <li class="drawer-nav-item">
                <a onclick="LandingView.toggleMobileMenu(false); document.getElementById('faq')?.scrollIntoView({behavior:'smooth'});">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <span>Pusat Bantuan & FAQ</span>
                </a>
              </li>
            </ul>

            <!-- Drawer CTA Action Stack -->
            <div class="drawer-actions-stack">
              <button type="button" class="drawer-btn-cta" onclick="LandingView.toggleMobileMenu(false); navigate('/register');">
                <span>Coba Gratis 14 Hari</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
              <button type="button" class="drawer-btn-login" onclick="LandingView.toggleMobileMenu(false); navigate('/login');">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Masuk ke Workspace Toko</span>
              </button>
            </div>

            <!-- Drawer Theme Section -->
            <div class="drawer-theme-section">
              <div class="drawer-theme-label">PILIHAN TEMA TAMPILAN</div>
              ${(typeof ThemeManager !== 'undefined') ? ThemeManager.renderSwitcher({ className: 'theme-switcher-segmented' }) : ''}
            </div>
          </div>

          <!-- Drawer Footer -->
          <div class="drawer-footer-note">
            © 2026 SiDaya · Engineered by <strong>Ashvin Labs ID</strong>
          </div>
        </div>

        <!-- 2. HERO SECTION -->
        <section class="landing-hero">
          <div class="landing-pill-badge">
            <span class="pulse-dot"></span>
            <span>Platform Operasional Grosir & Komoditas #1 di Indonesia</span>
          </div>

          <h1 class="landing-hero-title">
            Kelola Distribusi, Lot FIFO & Penjualan Grosir <br/>
            <span class="gradient-text">Tanpa Kebocoran Modal.</span>
          </h1>

          <p class="landing-hero-desc">
            Tinggalkan pencatatan manual yang rentan selisih satuan dan piutang macet. SiDaya menyatukan POS kasir multi-satuan grosir,
            pelacakan muatan lot inbound FIFO, penagihan tempo otomatis via WhatsApp PayLink, dan Surat Jalan digital
            dengan validasi foto & GPS langsung dalam workspace cloud terisolasi.
          </p>

          <div class="landing-hero-actions">
            <button type="button" class="btn-hero-main" onclick="navigate('/register')">
              <span>Mulai Uji Coba Gratis 14 Hari</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button type="button" class="btn-hero-outline" onclick="navigate('/login')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Masuk ke Workspace Toko</span>
            </button>
          </div>

          <div class="hero-proof-text">
            <div class="hero-proof-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Tanpa Kartu Kredit</span>
            </div>
            <div class="hero-proof-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Setup Instan 2 Menit</span>
            </div>
            <div class="hero-proof-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>100% Sesuai Regulasi Bank Indonesia & UU PDP</span>
            </div>
          </div>

          <!-- HERO INTERACTIVE PRODUCT SHOWCASE -->
          <div class="hero-mockup-frame">
            <div class="mockup-topbar">
              <div class="window-controls">
                <div class="win-dot red"></div>
                <div class="win-dot yellow"></div>
                <div class="win-dot green"></div>
              </div>
              <div class="mockup-address-bar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>${proto}//berasjaya.${baseDomain}/pos</span>
              </div>
              <div class="status-live-tag">
                <span class="pulse-dot" style="background:#10b981; box-shadow:0 0 6px #10b981;"></span>
                <span>WORKSPACE AKTIF</span>
              </div>
            </div>

            <div class="mockup-stats-strip">
              <div class="mockup-stat-box">
                <div class="mockup-stat-lbl">Omset Grosir Hari Ini</div>
                <div class="mockup-stat-num">Rp 48.500.000</div>
                <div class="mockup-stat-tag">↑ +14.2% vs kemarin</div>
              </div>
              <div class="mockup-stat-box">
                <div class="mockup-stat-lbl">Inbound FIFO Aktif</div>
                <div class="mockup-stat-num">12 Batch Muatan</div>
                <div class="mockup-stat-tag">✓ Zero Expiry Leakage</div>
              </div>
              <div class="mockup-stat-box">
                <div class="mockup-stat-lbl">Surat Jalan Terbit (POD)</div>
                <div class="mockup-stat-num">8 Pengiriman</div>
                <div class="mockup-stat-tag">✓ Tanda Tangan & GPS</div>
              </div>
              <div class="mockup-stat-box">
                <div class="mockup-stat-lbl">Gateway Settle Direct</div>
                <div class="mockup-stat-num">Rp 32.100.000</div>
                <div class="mockup-stat-tag">✓ 100% Reconciled</div>
              </div>
            </div>

            <div class="mockup-split-workstation">
              <!-- Left Panel: POS Multi-Satuan Cart -->
              <div class="mockup-pos-cart">
                <div class="workstation-header">
                  <span>Kasir POS Multi-Satuan Grosir (Faktur #INV-202609-082)</span>
                  <span style="color:#38bdf8; font-weight:700; font-size:0.75rem;">Pelanggan: Toko Berkah Mandiri (Tier Grosir)</span>
                </div>
                <div class="sku-row-item">
                  <div class="sku-info">
                    <span class="sku-name">Beras Ramos Super Premium (Karung 50kg)</span>
                    <span class="sku-tier-badge">Tier Grosir (≥10 Karung) · Diskon Volume Rp 15.000/Sak</span>
                  </div>
                  <div class="sku-pricing">
                    <span class="sku-subtotal">Rp 13.400.000</span>
                    <span class="sku-unit-qty">20 Karung @ Rp 670.000</span>
                  </div>
                </div>
                <div class="sku-row-item">
                  <div class="sku-info">
                    <span class="sku-name">Minyak Goreng Minyakita 1L (Karton 12 Pouch)</span>
                    <span class="sku-tier-badge">Tier Distributor (≥50 Karton)</span>
                  </div>
                  <div class="sku-pricing">
                    <span class="sku-subtotal">Rp 8.400.000</span>
                    <span class="sku-unit-qty">50 Karton @ Rp 168.000</span>
                  </div>
                </div>
                <div class="sku-row-item" style="border-bottom:none;">
                  <div class="sku-info">
                    <span class="sku-name">Gula Kristal Putih GMP (Sak 50kg)</span>
                    <span class="sku-tier-badge">Inbound Lot #L-202609-041 · Exp Mar 2027</span>
                  </div>
                  <div class="sku-pricing">
                    <span class="sku-subtotal">Rp 7.650.000</span>
                    <span class="sku-unit-qty">10 Sak @ Rp 765.000</span>
                  </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);">
                  <span style="font-weight:700; color:#94a3b8; font-size:0.85rem;">Total Tagihan Tempo (TOP 14 Hari):</span>
                  <span style="font-weight:800; color:#38bdf8; font-size:1.15rem;">Rp 29.450.000</span>
                </div>
              </div>

              <!-- Right Panel: FIFO & PayLink Live Automation -->
              <div class="mockup-fifo-paylink">
                <div class="fifo-badge-card">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#94a3b8;">Alokasi FIFO Otomatis</span>
                    <span class="fifo-lot-pill">BATCH #B26-09A</span>
                  </div>
                  <div style="font-size:0.82rem; color:#cbd5e1; line-height:1.5;">
                    Muatan Truk Fuso Inbound tgl 12 Sep dialokasikan terlebih dahulu (Stok Sisa: 40 Sak). Menjamin perputaran barang tertua tanpa risiko kedaluwarsa.
                  </div>
                </div>

                <div class="paylink-preview-box">
                  <div class="paylink-header">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      <span style="font-size:0.82rem; font-weight:800; color:#ffffff;">WhatsApp PayLink Resmi</span>
                    </div>
                    <span style="font-size:0.7rem; background:rgba(16,185,129,0.2); color:#10b981; padding:2px 8px; border-radius:4px; font-weight:700;">QRIS SIAP</span>
                  </div>
                  <div style="font-size:0.78rem; color:#94a3b8; margin-bottom:12px; font-family:'JetBrains Mono', monospace;">
                    pay.sidaya.biz.id/pay/INV-202609-082
                  </div>
                  <button type="button" class="paylink-btn-preview">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                    <span>Kirim Tagihan & QRIS ke WhatsApp Pembeli</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. STRATEGIC 6 PILLARS MATRIX -->
        <section id="fitur" class="landing-section">
          <div class="section-head">
            <span class="section-tag">6 PILAR STRATEGIS</span>
            <h2 class="section-h2">Dirancang Khusus untuk Kompleksitas Pedagang Grosir</h2>
            <p class="section-sub">
              Bukan sekadar POS ritel biasa. SiDaya dibangun dari nol untuk menangani alur distribusi sembako, beras, komoditas pangan, dan barang konsumen bervolume tinggi.
            </p>
          </div>

          <div class="pillars-matrix">
            <!-- Pilar 1 -->
            <div class="pillar-box">
              <div class="pillar-svg-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h3 class="pillar-h3">1. POS Kasir Multi-Satuan Berjenjang</h3>
              <p class="pillar-desc-text">
                Konversi satuan otomatis (Dus $\leftrightarrow$ Bal $\leftrightarrow$ Pak $\leftrightarrow$ Pcs). Hitung diskon bertingkat berdasarkan kuantiti pesanan secara instan dan bebas human error.
              </p>
            </div>

            <!-- Pilar 2 -->
            <div class="pillar-box">
              <div class="pillar-svg-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3 class="pillar-h3">2. Inbound Lot FIFO & Expiry Guard</h3>
              <p class="pillar-desc-text">
                Penerimaan muatan kontainer dan truk dengan nomor lot otomatis. Sistem mengunci stok tertua agar keluar lebih dahulu sehingga meniadakan kerugian barang rusak/expired.
              </p>
            </div>

            <!-- Pilar 3 -->
            <div class="pillar-box">
              <div class="pillar-svg-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <h3 class="pillar-h3">3. WhatsApp PayLink & Dynamic QRIS</h3>
              <p class="pillar-desc-text">
                Kirim tautan tagihan resmi ber-QRIS langsung ke WhatsApp langganan grosir. Pembayaran otomatis tercatat lunas tanpa perlu cek mutasi rekening manual.
              </p>
            </div>

            <!-- Pilar 4 -->
            <div class="pillar-box">
              <div class="pillar-svg-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <h3 class="pillar-h3">4. Surat Jalan (POD) & Proteksi HPP</h3>
              <p class="pillar-desc-text">
                Penerbitan surat jalan digital terproteksi (harga pokok modal disembunyikan dari pengemudi). Bukti serah terima tervalidasi tanda tangan digital, foto muatan, dan koordinat GPS.
              </p>
            </div>

            <!-- Pilar 5 -->
            <div class="pillar-box">
              <div class="pillar-svg-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <h3 class="pillar-h3">5. Dual-Topology Payment Gateway</h3>
              <p class="pillar-desc-text">
                Dukungan arsitektur BYOK (Bring Your Own Key) untuk iPaymu, Midtrans, dan Xendit. Uang transaksi langsung masuk ke rekening bank toko Anda tanpa risiko pengendapan pihak ketiga.
              </p>
            </div>

            <!-- Pilar 6 -->
            <div class="pillar-box">
              <div class="pillar-svg-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 class="pillar-h3">6. Isolasi Data Multi-Tenant & UU PDP</h3>
              <p class="pillar-desc-text">
                Setiap toko memiliki subdomain aman dan database row-level security (RLS) terisolasi penuh. Menjamin kepatuhan UU Perlindungan Data Pribadi No. 27/2022 dan PCI-DSS.
              </p>
            </div>
          </div>
        </section>

        <!-- 4. COMPARISON / ROI MATRIX -->
        <section id="komparasi" class="landing-section">
          <div class="section-head">
            <span class="section-tag">NILAI INVESTASI & ROI</span>
            <h2 class="section-h2">Mengapa Pedagang Grosir Beralih ke SiDaya?</h2>
            <p class="section-sub">Perbandingan langsung antara metode pembukuan konvensional dengan ekosistem SiDaya.</p>
          </div>

          <!-- Desktop Comparison Table (Hidden on Mobile) -->
          <div class="comparison-card-wrapper">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th class="col-dim">Aspek Operasional</th>
                  <th class="col-bad">Metode Konvensional / Kertas</th>
                  <th class="col-good">Sistem Operasi SiDaya</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="cell-aspect">Konversi Satuan & Harga Grosir</td>
                  <td class="cell-bad">
                    <div class="cell-flex">
                      <span class="cell-icon-bad">✕</span>
                      <span>Manual di kalkulator, sering salah hitung antar satuan dus/renceng</span>
                    </div>
                  </td>
                  <td class="cell-good">
                    <div class="cell-flex">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Otomatis bertingkat per tier pelanggan dalam 1 detik</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="cell-aspect">Pengelolaan Stok Inbound Truk/Kontainer</td>
                  <td class="cell-bad">
                    <div class="cell-flex">
                      <span class="cell-icon-bad">✕</span>
                      <span>Stok tercampur tanpa nomor batch; barang lama tertimbun dan kedaluwarsa</span>
                    </div>
                  </td>
                  <td class="cell-good">
                    <div class="cell-flex">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Alokasi FIFO otomatis dengan barcode & tracking tanggal kedaluwarsa</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="cell-aspect">Penagihan Piutang & Tempo Toko</td>
                  <td class="cell-bad">
                    <div class="cell-flex">
                      <span class="cell-icon-bad">✕</span>
                      <span>Buku kasbon tercecer, pembeli lupa bayar, staf repot cek mutasi manual</span>
                    </div>
                  </td>
                  <td class="cell-good">
                    <div class="cell-flex">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Otomasi WhatsApp PayLink & QRIS dinamis berbatas plafon piutang</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="cell-aspect">Pengiriman & Surat Jalan (POD)</td>
                  <td class="cell-bad">
                    <div class="cell-flex">
                      <span class="cell-icon-bad">✕</span>
                      <span>Kertas surat jalan rawan hilang; nota sopir membocorkan modal margin ke pelanggan</span>
                    </div>
                  </td>
                  <td class="cell-good">
                    <div class="cell-flex">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Surat jalan digital, HPP terproteksi rahasia, bukti foto GPS & tanda tangan</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="cell-aspect">Pencairan Uang Hasil Penjualan</td>
                  <td class="cell-bad">
                    <div class="cell-flex">
                      <span class="cell-icon-bad">✕</span>
                      <span>Dana tertahan di rekening perantara atau pihak ketiga</span>
                    </div>
                  </td>
                  <td class="cell-good">
                    <div class="cell-flex">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Arsitektur BYOK: Dana langsung masuk 100% ke rekening bank pemilik toko</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Comparison Cards (Shown exclusively on Mobile Screens <= 768px) -->
          <div class="comparison-mobile-cards">
            <!-- Item 1 -->
            <div class="comp-mobile-card">
              <div class="comp-mobile-aspect">Konversi Satuan & Harga Grosir</div>
              <div class="comp-mobile-box bad">
                <div class="comp-box-label">Metode Konvensional / Kertas</div>
                <div class="comp-box-content">
                  <span class="cell-icon-bad">✕</span>
                  <span>Manual di kalkulator, sering salah hitung antar satuan dus/renceng</span>
                </div>
              </div>
              <div class="comp-mobile-box good">
                <div class="comp-box-label">Sistem Operasi SiDaya</div>
                <div class="comp-box-content">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Otomatis bertingkat per tier pelanggan dalam 1 detik</span>
                </div>
              </div>
            </div>

            <!-- Item 2 -->
            <div class="comp-mobile-card">
              <div class="comp-mobile-aspect">Pengelolaan Stok Inbound Truk/Kontainer</div>
              <div class="comp-mobile-box bad">
                <div class="comp-box-label">Metode Konvensional / Kertas</div>
                <div class="comp-box-content">
                  <span class="cell-icon-bad">✕</span>
                  <span>Stok tercampur tanpa nomor batch; barang lama tertimbun dan kedaluwarsa</span>
                </div>
              </div>
              <div class="comp-mobile-box good">
                <div class="comp-box-label">Sistem Operasi SiDaya</div>
                <div class="comp-box-content">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Alokasi FIFO otomatis dengan barcode & tracking tanggal kedaluwarsa</span>
                </div>
              </div>
            </div>

            <!-- Item 3 -->
            <div class="comp-mobile-card">
              <div class="comp-mobile-aspect">Penagihan Piutang & Tempo Toko</div>
              <div class="comp-mobile-box bad">
                <div class="comp-box-label">Metode Konvensional / Kertas</div>
                <div class="comp-box-content">
                  <span class="cell-icon-bad">✕</span>
                  <span>Buku kasbon tercecer, pembeli lupa bayar, staf repot cek mutasi manual</span>
                </div>
              </div>
              <div class="comp-mobile-box good">
                <div class="comp-box-label">Sistem Operasi SiDaya</div>
                <div class="comp-box-content">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Otomasi WhatsApp PayLink & QRIS dinamis berbatas plafon piutang</span>
                </div>
              </div>
            </div>

            <!-- Item 4 -->
            <div class="comp-mobile-card">
              <div class="comp-mobile-aspect">Pengiriman & Surat Jalan (POD)</div>
              <div class="comp-mobile-box bad">
                <div class="comp-box-label">Metode Konvensional / Kertas</div>
                <div class="comp-box-content">
                  <span class="cell-icon-bad">✕</span>
                  <span>Kertas surat jalan rawan hilang; nota sopir membocorkan modal margin ke pelanggan</span>
                </div>
              </div>
              <div class="comp-mobile-box good">
                <div class="comp-box-label">Sistem Operasi SiDaya</div>
                <div class="comp-box-content">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Surat jalan digital, HPP terproteksi rahasia, bukti foto GPS & tanda tangan</span>
                </div>
              </div>
            </div>

            <!-- Item 5 -->
            <div class="comp-mobile-card">
              <div class="comp-mobile-aspect">Pencairan Uang Hasil Penjualan</div>
              <div class="comp-mobile-box bad">
                <div class="comp-box-label">Metode Konvensional / Kertas</div>
                <div class="comp-box-content">
                  <span class="cell-icon-bad">✕</span>
                  <span>Dana tertahan di rekening perantara atau pihak ketiga</span>
                </div>
              </div>
              <div class="comp-mobile-box good">
                <div class="comp-box-label">Sistem Operasi SiDaya</div>
                <div class="comp-box-content">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Arsitektur BYOK: Dana langsung masuk 100% ke rekening bank pemilik toko</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. TRANSPARENT SAAS PRICING MATRIX -->
        <section id="harga" class="landing-section">
          <div class="section-head">
            <span class="section-tag">TRANSPARAN TANPA BIAYA TERSEMBUNYI</span>
            <h2 class="section-h2">Pilih Paket Sesuai Skala Bisnis Grosir Anda</h2>
            <p class="section-sub">Investasi terbaik untuk memodernisasi gudang, melindungi modal, dan melipatgandakan omset usaha.</p>
          </div>

          <div class="pricing-cards-grid">
            <!-- TIER 0: PERINTIS / SUPPLIER MANDIRI (FREE FOREVER) -->
            <div class="tier-card free-tier">
              <div class="free-ribbon">GRATIS SELAMANYA</div>
              <h3 class="tier-title">Perintis</h3>
              <p class="tier-subtitle">Didedikasikan untuk pemasok perorangan, agen rumahan, dan juragan mandiri yang ingin bebas dari pembukuan manual.</p>
              <div class="tier-price-box">
                <span class="tier-price-val">Rp 0</span>
                <span class="tier-price-period">/ selamanya</span>
              </div>
              <ul class="tier-features-list">
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>1 Akun Pemilik (Solo Operator)</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>1 Lokasi Usaha / Gudang Mandiri</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>POS Kasir Cepat & Struk Bluetooth 58mm</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Kirim Nota & Faktur PDF via WhatsApp</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Master Katalog & Stok Sederhana</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Buku Kasbon & Saldo Piutang Dasar</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span><strong>PayLink SiDaya</strong> (Dynamic QRIS & Transfer)</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Subdomain Resmi <code>[toko].${baseDomain}</code></span>
                </li>
              </ul>
              <button type="button" class="btn-tier btn-free" onclick="navigate('/register?plan=free')">
                <span>Mulai Gratis Sekarang</span>
              </button>
            </div>

            <!-- TIER 1: STARTER -->
            <div class="tier-card">
              <h3 class="tier-title">Starter</h3>
              <p class="tier-subtitle">Untuk toko grosir & agen 1 lokasi yang mulai memiliki tim kasir dan butuh kontrol harga bertingkat.</p>
              <div class="tier-price-box">
                <span class="tier-price-val">Rp 149.000</span>
                <span class="tier-price-period">/ bulan</span>
              </div>
              <ul class="tier-features-list">
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>1 Cabang / Lokasi Usaha Toko</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Hingga 3 Akun Staf (PIN Terisolasi)</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Multi-Tier Harga Grosir (Ecer, Agen)</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Konversi Multi-Satuan (Dus, Pcs)</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Rekap Shift & Laporan Buka/Tutup Toko</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Pengingat Kasbon WhatsApp Otomatis</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Cetak Struk Termal ESC/POS (58mm/80mm)</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Export Laporan Penjualan ke Excel</span>
                </li>
              </ul>
              <button type="button" class="btn-tier" onclick="LandingView.openCheckoutModal('STARTER', 'Starter', 149000)">
                <span>Pilih Paket Starter</span>
              </button>
            </div>

            <!-- TIER 2: GROSIR PRO (POPULAR) -->
            <div class="tier-card featured">
              <div class="featured-ribbon">PALING BANYAK DIGUNAKAN DISTRIBUTOR</div>
              <h3 class="tier-title">Grosir Pro</h3>
              <p class="tier-subtitle">Solusi komprehensif untuk distributor sembako, agen FMCG, dan toko grosir bervolume tinggi dengan armada pengiriman.</p>
              <div class="tier-price-box">
                <span class="tier-price-val">Rp 399.000</span>
                <span class="tier-price-period">/ bulan</span>
              </div>
              <ul class="tier-features-list">
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Hingga 3 Cabang & Gudang Terpadu</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span><strong>Unlimited Akun Staf</strong> (Kasir, Gudang, Driver)</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span><strong>Inbound FIFO & Lot Expiry Tracking</strong></span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span><strong>Surat Jalan Digital + Foto GPS POD Driver</strong></span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Plafon Piutang & Auto-Lock Tempo Toko</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span><strong>Bebas Pilih: PayLink SiDaya ATAU BYOK Gateway</strong></span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Virtual Account Multi-Bank & Dynamic QRIS</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Subdomain Resmi <code>[toko].${baseDomain}</code> + SSL</span>
                </li>
              </ul>
              <button type="button" class="btn-tier btn-featured" onclick="LandingView.openCheckoutModal('PRO', 'Grosir Pro', 399000)">
                <span>Pilih Paket Grosir Pro</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>

            <!-- TIER 3: ENTERPRISE FLEET -->
            <div class="tier-card">
              <h3 class="tier-title">Enterprise Fleet</h3>
              <p class="tier-subtitle">Untuk rantai distribusi berskala besar, prinsipal manufaktur pangan, dan multi-cabang regional.</p>
              <div class="tier-price-box">
                <span class="tier-price-val">Rp 899.000</span>
                <span class="tier-price-period">/ bulan</span>
              </div>
              <ul class="tier-features-list">
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Unlimited Cabang & Multi-Gudang Terpadu</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span><strong>Custom Domain Sendiri</strong> (<code>pos.namatoko.com</code>)</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Open API & Webhook ERP Integration</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Custom RBAC & Matrix Hak Akses Khusus</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>SLA Ketersediaan Layanan 99.9%</span>
                </li>
                <li class="tier-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Dedicated Account Manager & Onsite Training</span>
                </li>
              </ul>
              <button type="button" class="btn-tier" onclick="navigate('/contact')">
                <span>Hubungi Tim Enterprise</span>
              </button>
            </div>
          </div>

          <!-- OFFICIAL PAYMENT GATEWAY PARTNER TRUST BANNER -->
          <div style="max-width:1120px; margin:32px auto 0 auto; background:var(--bg-card, #ffffff); border:1px solid var(--border-color, #e2e8f0); border-radius:14px; padding:18px 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:44px; height:44px; border-radius:10px; background:rgba(2, 132, 199, 0.1); display:flex; align-items:center; justify-content:center; font-size:22px;">
                🛡️
              </div>
              <div>
                <div style="font-size:13.5px; font-weight:800; color:var(--text-primary); letter-spacing:-0.2px;">
                  Sistem Pembayaran Resmi Berlisensi Bank Indonesia
                </div>
                <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                  Seluruh transaksi langganan & operasional toko diproses langsung melalui Payment Gateway resmi terverifikasi:
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <div style="background:rgba(2, 132, 199, 0.08); border:1.5px solid #0284c7; color:#0284c7; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:800; display:inline-flex; align-items:center; gap:6px;">
                <span>🔷</span> Mitra Resmi: <strong>iPaymu Gateway</strong>
              </div>
              <div style="background:rgba(16, 183, 127, 0.08); border:1.5px solid #10b981; color:#059669; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:800; display:inline-flex; align-items:center; gap:6px;">
                <span>⚡</span> Mitra Resmi: <strong>Xendit Invoice</strong>
              </div>
              <div style="background:var(--bg-hover, #f1f5f9); color:var(--text-secondary); padding:7px 12px; border-radius:8px; font-size:11.5px; font-weight:600;">
                QRIS Dinamis · VA BCA / Mandiri / BRI / BNI · Alfamart · Indomaret
              </div>
            </div>
          </div>
        </section>

        <!-- 6. TRUST & REGULATORY COMPLIANCE STRIP -->
        <section id="keamanan" class="compliance-strip">
          <div class="compliance-inner">
            <div class="compliance-title">STANDAR KEAMANAN DATA, PRIVASI & KEPATUHAN REGULASI FINANSIAL</div>
            <div class="compliance-badges-row">
              <div class="compliance-badge-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>UU PDP No. 27/2022 Compliant</span>
              </div>
              <div class="compliance-badge-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>PCI-DSS Section 6.5 Standard</span>
              </div>
              <div class="compliance-badge-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                <span>PostgreSQL Row-Level Security (RLS)</span>
              </div>
              <div class="compliance-badge-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                <span>Bank Indonesia QRIS Standard</span>
              </div>
              <div class="compliance-badge-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                <span>Dual-Topology Direct Settlement</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 7. FREQUENTLY ASKED QUESTIONS (FAQ) -->
        <section id="faq" class="landing-section">
          <div class="section-head">
            <span class="section-tag">PUSAT INFORMASI</span>
            <h2 class="section-h2">Pertanyaan yang Sering Diajukan</h2>
            <p class="section-sub">Pelajari lebih lanjut bagaimana SiDaya mengamankan dan mempermudah operasional usaha grosir Anda.</p>
          </div>

          <div class="faq-container">
            <div class="faq-item open">
              <button type="button" class="faq-header-btn" onclick="this.parentElement.classList.toggle('open')">
                <span>Bagaimana cara toko saya mendapatkan alamat subdomain resmi?</span>
                <svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="faq-body-content">
                Saat Anda mendaftar, Anda menentukan slug subdomain (contoh: <code>berasjaya</code>). Sistem secara instan mengonfigurasi workspace aman Anda di <code>https://berasjaya.${baseDomain}</code> lengkap dengan sertifikat SSL gratis tanpa biaya setup tambahan.
              </div>
            </div>

            <div class="faq-item">
              <button type="button" class="faq-header-btn" onclick="this.parentElement.classList.toggle('open')">
                <span>Apakah uang hasil transaksi QRIS / PayLink masuk ke rekening SiDaya?</span>
                <svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="faq-body-content">
                Sama sekali tidak. Kami menerapkan arsitektur Dual-Topology (BYOK). Uang hasil transaksi dari pelanggan langsung disalurkan oleh payment gateway resmi berlisensi Bank Indonesia (iPaymu / Midtrans / Xendit) langsung ke rekening bank pemilik toko Anda tanpa perantara dan tanpa biaya komisi siluman.
              </div>
            </div>

            <div class="faq-item">
              <button type="button" class="faq-header-btn" onclick="this.parentElement.classList.toggle('open')">
                <span>Apakah SiDaya kompatibel dengan printer kasir dan barcode scanner fisik?</span>
                <svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="faq-body-content">
                Ya! SiDaya mendukung pencetakan struk termal standar ESC/POS 58mm & 80mm via USB dan Bluetooth, serta input barcode scanner laser standar untuk kasir kasir grosir berkecepatan tinggi.
              </div>
            </div>

            <div class="faq-item">
              <button type="button" class="faq-header-btn" onclick="this.parentElement.classList.toggle('open')">
                <span>Bagaimana keamanan data pelanggan dan harga pokok toko saya?</span>
                <svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="faq-body-content">
                Data toko Anda dilindungi dengan enkripsi AES-256 dan Row-Level Security (RLS) pada database. Pengemudi atau staf gudang yang mengakses Surat Jalan tidak dapat melihat harga pokok modal (HPP) atau margin profit toko demi keamanan bisnis komersial Anda.
              </div>
            </div>
          </div>
        </section>

        <!-- 8. FINAL HIGH-IMPACT CALL TO ACTION -->
        <section class="cta-banner-section">
          <div class="cta-banner-box">
            <h2 class="cta-banner-h2">Siap Melindungi Modal & Mengembangkan Usaha Grosir Anda?</h2>
            <p class="cta-banner-sub">
              Bergabunglah dengan ratusan pemilik toko grosir dan distributor di seluruh Indonesia yang telah beralih ke sistem operasi cloud SiDaya.
            </p>
            <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
              <button type="button" class="btn-hero-main" onclick="navigate('/register')">
                <span>Daftar Akun & Coba Gratis 14 Hari</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
              <button type="button" class="btn-hero-outline" onclick="navigate('/contact')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>Konsultasi Demo Bersama Tim Ahli</span>
              </button>
            </div>
          </div>
        </section>

        <!-- 9. VERIFIED LEGAL & COMPLIANCE FOOTER -->
        <footer class="landing-footer">
          <div class="footer-main-grid">
            <div>
              <div class="landing-brand" style="margin-bottom:14px;" onclick="navigate('/')" role="button" aria-label="siDaya by Ashvin Labs IDN">
                <img src="/assets/brand/logo-horizontal-dark.svg" alt="siDaya By Ashvin Labs Idn" height="48" class="brand-logo-horizontal dark-theme-logo" style="height:48px; width:auto; max-width:250px; object-fit:contain;">
                <img src="/assets/brand/logo-horizontal-transparent.svg" alt="siDaya By Ashvin Labs Idn" height="48" class="brand-logo-horizontal light-theme-logo" style="height:48px; width:auto; max-width:250px; object-fit:contain;">
              </div>
              <p class="footer-brand-desc">
                Platform SaaS terpadu untuk pedagang grosir komoditas, manajemen muatan FIFO, surat jalan digital, dan otomasi penagihan pembayaran di Indonesia.
              </p>
            </div>

            <div>
              <div class="footer-heading">Navigasi Cepat</div>
              <ul class="footer-links-list">
                <li><a onclick="navigate('/login')">Masuk Workspace Toko</a></li>
                <li><a onclick="navigate('/register')">Daftar Toko Baru</a></li>
                <li><a href="#fitur" onclick="event.preventDefault(); document.getElementById('fitur')?.scrollIntoView({behavior:'smooth'});">Fitur Unggulan</a></li>
                <li><a href="#harga" onclick="event.preventDefault(); document.getElementById('harga')?.scrollIntoView({behavior:'smooth'});">Paket & Harga</a></li>
                <li><a onclick="navigate('/faq')">Pusat Bantuan & FAQ</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-heading">Kepatuhan Legal</div>
              <ul class="footer-links-list">
                <li><a onclick="navigate('/terms-and-conditions')">Syarat & Ketentuan</a></li>
                <li><a onclick="navigate('/privacy-policy')">Kebijakan Privasi (UU PDP)</a></li>
                <li><a onclick="navigate('/refund-policy')">Kebijakan Refund</a></li>
                <li><a onclick="navigate('/contact')">Kontak & Alamat Usaha</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-heading">Informasi & Kontak Resmi</div>
              <div class="footer-contact-details">
                <p style="margin:0 0 6px 0;"><strong style="color:#ffffff;">Kantor Operasional:</strong></p>
                <p style="margin:0 0 10px 0;">Griya Sari Semai, Jl. Wonosari KM 8, Banguntapan, Bantul, D.I. Yogyakarta 55198</p>
                <p style="margin:0 0 6px 0;"><strong style="color:#ffffff;">WhatsApp Resmi:</strong> <a href="tel:+628139506092" style="color:#38bdf8; text-decoration:none;">+62 813-9506-092</a></p>
                <p style="margin:0;"><strong style="color:#ffffff;">Email:</strong> official@${baseDomain}</p>
              </div>
            </div>
          </div>

          <div class="footer-bottom-bar" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
            <div>
              © 2026 SiDaya Platform · Engineered <span style="color:#10B77F; font-weight:800;">By</span> <strong>Ashvin Labs Idn</strong>. Hak Cipta Dilindungi Undang-Undang RI.
            </div>
            <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
              <div style="display:flex; gap:16px;">
                <a onclick="navigate('/terms-and-conditions')" style="color:#64748b; cursor:pointer;">Syarat & Ketentuan</a>
                <a onclick="navigate('/privacy-policy')" style="color:#64748b; cursor:pointer;">Privasi</a>
                <a onclick="navigate('/refund-policy')" style="color:#64748b; cursor:pointer;">Refund</a>
                <a onclick="navigate('/contact')" style="color:#64748b; cursor:pointer;">Kontak Resmi</a>
              </div>
              <div class="footer-theme-wrap">
                ${(typeof ThemeManager !== 'undefined') ? ThemeManager.renderDropdown({ id: 'footer-theme-dropdown', showLabel: true }) : ''}
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;
  },

  /**
   * Updates UI when user toggles payment gateway in checkout modal
   * @param {'IPAYMU'|'XENDIT'} gw
   * @param {string} formattedPrice
   */
  updateSelectedGateway(gw, formattedPrice) {
    const cardIpaymu = document.getElementById('card-gw-ipaymu');
    const cardXendit = document.getElementById('card-gw-xendit');
    const descEl = document.getElementById('checkout-gateway-desc');
    const submitBtn = document.getElementById('btn-submit-sub-checkout');

    if (gw === 'IPAYMU') {
      if (cardIpaymu) {
        cardIpaymu.style.borderColor = '#0284c7';
        cardIpaymu.style.background = 'rgba(2, 132, 199, 0.08)';
      }
      if (cardXendit) {
        cardXendit.style.borderColor = 'var(--border-color, #e2e8f0)';
        cardXendit.style.background = 'var(--card-bg, #fff)';
      }
      if (descEl) {
        descEl.innerHTML = `
          🛡️ <strong>Metode Pembayaran Resmi via iPaymu:</strong><br/>
          Mendukung QRIS Dinamis (Semua Bank & E-Wallet), Virtual Account Multi-Bank (BCA, Mandiri, BRI, BNI, Permata, BSI), Direct Debit, & Gerai Retail (Indomaret, Alfamart).
        `;
      }
      if (submitBtn) {
        submitBtn.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
        submitBtn.innerHTML = `<span>🔷</span> Bayar via iPaymu (${formattedPrice})`;
      }
    } else {
      if (cardXendit) {
        cardXendit.style.borderColor = '#10b981';
        cardXendit.style.background = 'rgba(16, 183, 127, 0.08)';
      }
      if (cardIpaymu) {
        cardIpaymu.style.borderColor = 'var(--border-color, #e2e8f0)';
        cardIpaymu.style.background = 'var(--card-bg, #fff)';
      }
      if (descEl) {
        descEl.innerHTML = `
          🛡️ <strong>Metode Pembayaran Resmi via Xendit:</strong><br/>
          Mendukung QRIS Dinamis, Virtual Account Bank (BCA, Mandiri, BRI, BNI, Permata), Kartu Kredit/Debit Visa/Mastercard, & E-Wallet.
        `;
      }
      if (submitBtn) {
        submitBtn.style.background = 'linear-gradient(135deg, #10B77F 0%, #059669 100%)';
        submitBtn.innerHTML = `<span>⚡</span> Bayar via Xendit (${formattedPrice})`;
      }
    }
  },

  /**
   * Opens live subscription checkout modal with iPaymu & Xendit gateway choices
   * @param {'STARTER'|'PRO'|'ENTERPRISE'} tier
   * @param {string} planName
   * @param {number} price
   */
  openCheckoutModal(tier, planName, price) {
    const modalRoot = document.getElementById('modal-root') || document.body;
    const formattedPrice = (typeof formatRupiah === 'function') 
      ? formatRupiah(price) 
      : 'Rp ' + Number(price).toLocaleString('id-ID');

    // Remove existing if any
    const existing = document.getElementById('modal-landing-checkout');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.id = 'modal-landing-checkout';
    wrapper.className = 'modal-overlay';
    wrapper.style.zIndex = '99999';

    wrapper.innerHTML = `
      <div class="modal-card" style="max-width:540px;">
        <button type="button" class="modal-close-btn" onclick="LandingView.closeCheckoutModal()">✕</button>
        
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
          <div style="width:44px; height:44px; border-radius:12px; background:rgba(2, 132, 199, 0.12); display:flex; align-items:center; justify-content:center; font-size:22px;">
            💳
          </div>
          <div>
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary); margin:0;">
              Langganan SiDaya — Paket ${planName}
            </h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin:2px 0 0 0;">
              Integrasi Resmi Payment Gateway Bank Indonesia via iPaymu & Xendit
            </p>
          </div>
        </div>

        <div style="background:var(--bg-hover, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:8px; padding:12px 14px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">Paket Software SaaS:</span>
            <strong style="font-size:0.9rem; color:var(--text-primary);">SiDaya ${planName}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">Siklus Pembayaran:</span>
            <span style="font-size:0.85rem; font-weight:600; color:var(--primary);">Bulanan (Cancel Kapan Saja)</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:8px; border-top:1px dashed var(--border-color, #cbd5e1);">
            <span style="font-size:0.95rem; font-weight:700; color:var(--text-primary);">Total Tagihan:</span>
            <span style="font-size:1.15rem; font-weight:800; color:var(--brand-warm-blue, #5048e5);">${formattedPrice} <span style="font-size:0.75rem; font-weight:500; color:var(--text-muted);">/ bulan</span></span>
          </div>
        </div>

        <form id="landing-checkout-form" onsubmit="event.preventDefault(); LandingView.executeSubscriptionCheckout('${tier}', '${planName}', ${price});">
          <!-- PAYMENT GATEWAY SELECTOR -->
          <div style="margin-bottom:14px;">
            <label style="font-size:11.5px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:6px;">
              Pilih Saluran Pembayaran Resmi:
            </label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <label id="card-gw-ipaymu" style="border:2px solid #0284c7; background:rgba(2, 132, 199, 0.08); border-radius:8px; padding:10px 12px; cursor:pointer; display:flex; flex-direction:column; gap:4px; transition:all 0.2s ease;">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <span style="font-size:12.5px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
                    <input type="radio" name="selected_gateway" value="IPAYMU" checked onchange="LandingView.updateSelectedGateway('IPAYMU', '${formattedPrice}')" style="accent-color:#0284c7;">
                    iPaymu
                  </span>
                  <span style="font-size:10px; background:#0284c7; color:#fff; padding:2px 6px; border-radius:4px; font-weight:700;">Rekomendasi</span>
                </div>
                <span style="font-size:10.5px; color:var(--text-muted); margin-left:18px;">
                  QRIS Dinamis, VA Bank, & Alfamart/Indomaret
                </span>
              </label>

              <label id="card-gw-xendit" style="border:1px solid var(--border-color, #cbd5e1); background:var(--card-bg, #fff); border-radius:8px; padding:10px 12px; cursor:pointer; display:flex; flex-direction:column; gap:4px; transition:all 0.2s ease;">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <span style="font-size:12.5px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
                    <input type="radio" name="selected_gateway" value="XENDIT" onchange="LandingView.updateSelectedGateway('XENDIT', '${formattedPrice}')" style="accent-color:#10b981;">
                    Xendit
                  </span>
                  <span style="font-size:10px; background:var(--badge-bg, #e2e8f0); color:var(--text-secondary); padding:2px 6px; border-radius:4px; font-weight:700;">Alternatif</span>
                </div>
                <span style="font-size:10.5px; color:var(--text-muted); margin-left:18px;">
                  Invoice, Kartu Kredit/Debit & E-Wallet
                </span>
              </label>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
            <div>
              <label style="font-size:11.5px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">Nama Usaha / Toko *</label>
              <input id="sub-business-name" type="text" class="form-input" required value="Toko Grosir Beras Jaya" style="width:100%; font-size:12px; padding:8px 10px;">
            </div>
            <div>
              <label style="font-size:11.5px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">Subdomain Workspace *</label>
              <input id="sub-domain" type="text" class="form-input" required value="berasjaya" style="width:100%; font-size:12px; padding:8px 10px;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
            <div>
              <label style="font-size:11.5px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">Email Penanggung Jawab *</label>
              <input id="sub-email" type="email" class="form-input" required value="ashvin.labs@gmail.com" style="width:100%; font-size:12px; padding:8px 10px;">
            </div>
            <div>
              <label style="font-size:11.5px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">No. WhatsApp / HP *</label>
              <input id="sub-phone" type="tel" class="form-input" required value="08139506092" style="width:100%; font-size:12px; padding:8px 10px;">
            </div>
          </div>

          <div id="checkout-gateway-desc" style="background:rgba(2, 132, 199, 0.06); border:1px solid rgba(2, 132, 199, 0.2); border-radius:6px; padding:10px; margin-bottom:14px; font-size:11.5px; color:var(--text-secondary); line-height:1.4;">
            🛡️ <strong>Metode Pembayaran Resmi via iPaymu:</strong><br/>
            Mendukung QRIS Dinamis (Semua Bank & E-Wallet), Virtual Account Multi-Bank (BCA, Mandiri, BRI, BNI, Permata, BSI), Direct Debit, & Gerai Retail (Indomaret, Alfamart).
          </div>

          <div id="checkout-action-status" style="margin-bottom:12px; font-size:12px; display:none;"></div>

          <div style="display:flex; gap:10px;">
            <button type="button" class="btn btn-outline" style="flex:1; padding:10px;" onclick="LandingView.closeCheckoutModal()">
              Batal
            </button>
            <button id="btn-submit-sub-checkout" type="submit" class="btn btn-primary" style="flex:2; padding:10px; font-weight:800; background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border:none; display:flex; align-items:center; justify-content:center; gap:8px;">
              <span>🔷</span> Bayar via iPaymu (${formattedPrice})
            </button>
          </div>
        </form>
      </div>
    `;

    modalRoot.appendChild(wrapper);
  },

  closeCheckoutModal() {
    const modal = document.getElementById('modal-landing-checkout');
    if (modal) modal.remove();
  },

  async executeSubscriptionCheckout(tier, planName, price) {
    const statusEl = document.getElementById('checkout-action-status');
    const submitBtn = document.getElementById('btn-submit-sub-checkout');
    const businessName = document.getElementById('sub-business-name')?.value || 'Toko Grosir Beras Jaya';
    const tenantSubdomain = document.getElementById('sub-domain')?.value || 'berasjaya';
    const ownerEmail = document.getElementById('sub-email')?.value || 'ashvin.labs@gmail.com';
    const ownerPhone = document.getElementById('sub-phone')?.value || '08139506092';
    const selectedGateway = document.querySelector('input[name="selected_gateway"]:checked')?.value || 'IPAYMU';
    const isIpaymu = selectedGateway === 'IPAYMU';

    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.innerHTML = isIpaymu
        ? '<span style="color:#0284c7; font-weight:600;">⏳ Menghubungi API iPaymu untuk membuat sesi pembayaran resmi...</span>'
        : '<span style="color:#10b981; font-weight:600;">⏳ Menghubungi API Xendit untuk membuat sesi invoice resmi...</span>';
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = isIpaymu
        ? '<span>⏳</span> Memproses iPaymu...'
        : '<span>⏳</span> Memproses Xendit...';
    }

    try {
      const res = await fetch(`/api/v1/billing/subscription/checkout?gateway=${selectedGateway.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: selectedGateway,
          tier,
          billingPeriod: 'MONTHLY',
          businessName,
          tenantSubdomain,
          ownerEmail,
          ownerPhone,
          ownerName: 'Gabriel Fermy (Merchant SiDaya)'
        })
      });

      const json = await res.json();
      if (json && json.success && json.data?.checkoutUrl) {
        const url = json.data.checkoutUrl;
        const invNum = json.data.invoiceNumber || 'INV-001';
        const gatewayTitle = isIpaymu ? 'iPaymu' : 'Xendit';
        const btnBg = isIpaymu ? '#0284c7' : '#10B77F';

        if (statusEl) {
          statusEl.innerHTML = `
            <div style="background:${isIpaymu ? 'rgba(2,132,199,0.12)' : 'rgba(16,183,127,0.12)'}; border:1px solid ${isIpaymu ? '#0284c7' : '#10b981'}; border-radius:6px; padding:12px; color:${isIpaymu ? '#0369a1' : '#065f46'}; font-size:12px; margin-bottom:10px;">
              ✅ <strong>Sesi Pembayaran ${gatewayTitle} Terbit (${invNum})!</strong><br/>
              Mengalihkan Anda ke portal pembayaran resmi ${gatewayTitle}...
              <div style="margin-top:8px;">
                <a href="${url}" target="_blank" class="btn btn-primary btn-sm" style="display:inline-block; font-weight:700; text-decoration:none; padding:8px 14px; background:${btnBg}; color:#fff; border-radius:6px;">
                  🔗 Buka Portal Pembayaran ${gatewayTitle} (${invNum}) →
                </a>
              </div>
            </div>
          `;
        }
        setTimeout(() => {
          window.open(url, '_blank');
        }, 600);
      } else {
        throw new Error(json?.error?.message || 'Gagal membuat sesi pembayaran');
      }
    } catch (err) {
      const errMsg = err.message || 'Gagal memproses pembayaran';
      const isInvalidIp = errMsg.toLowerCase().includes('invalid ip');
      
      if (statusEl) {
        if (isIpaymu && isInvalidIp) {
          statusEl.innerHTML = `
            <div style="background:rgba(239, 68, 68, 0.08); border:1px solid #ef4444; border-radius:8px; padding:12px; font-size:11.5px; color:var(--text-primary); margin-bottom:10px;">
              <div style="font-weight:700; color:#ef4444; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                <span>⚠️</span> iPaymu Menolak: IP Server Belum Di-Whitelist
              </div>
              <p style="margin:0 0 8px 0; line-height:1.4; color:var(--text-secondary);">
                Server memerlukan whitelist IP di Dashboard iPaymu (<em>my.ipaymu.com → Integrasi → IP Terdaftar</em>) atau verifikasi akun merchant yang masih dalam peninjauan.
              </p>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button type="button" class="btn btn-sm" style="background:#10b981; color:#fff; font-weight:700; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;" onclick="document.querySelector('input[name=\\'selected_gateway\\'][value=\\'XENDIT\\']').click(); LandingView.executeSubscriptionCheckout('${tier}', '${planName}', ${price});">
                  ⚡ Bayar via Xendit (QRIS & VA Langsung Aktif) →
                </button>
              </div>
            </div>
          `;
        } else {
          statusEl.innerHTML = `<div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; border-radius:6px; padding:10px; color:#ef4444; font-weight:600; font-size:11.5px; margin-bottom:10px;">✕ Gagal: ${errMsg}</div>`;
        }
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>🚀</span> Coba Bayar Lagi (${isIpaymu ? 'iPaymu' : 'Xendit'})`;
      }
    }
  }
};
