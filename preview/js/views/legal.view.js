/**
 * @file legal.view.js
 * @description Public Legal & Merchant Payment Gateway Compliance View (FAQ, Terms, Refund Policy, Privacy, Contact)
 * @module View:Legal
 * @implements {LegalViewInterface}
 */

const LegalView = {
  /**
   * Renders the master legal portal wrapper and navigates tabs
   * @param {'faq'|'terms'|'refund'|'privacy'|'contact'} [activeTab='faq']
   * @returns {string} HTML string
   */
  renderPortal(activeTab = 'faq') {
    const tabs = [
      { id: 'faq', label: '❓ FAQ & Bantuan', route: '/faq' },
      { id: 'terms', label: '📜 Syarat & Ketentuan', route: '/terms-and-conditions' },
      { id: 'refund', label: '🔄 Kebijakan Refund', route: '/refund-policy' },
      { id: 'privacy', label: '🔒 Kebijakan Privasi', route: '/privacy-policy' },
      { id: 'contact', label: '📞 Kontak Usaha', route: '/contact' }
    ];

    let contentHtml = '';
    let pageTitle = 'Pusat Informasi Legal & Layanan';

    switch (activeTab) {
      case 'terms':
        contentHtml = this.renderTerms();
        pageTitle = 'Syarat & Ketentuan Layanan';
        break;
      case 'refund':
        contentHtml = this.renderRefund();
        pageTitle = 'Kebijakan Pengembalian Dana (Refund Policy)';
        break;
      case 'privacy':
        contentHtml = this.renderPrivacy();
        pageTitle = 'Kebijakan Privasi & Perlindungan Data';
        break;
      case 'contact':
        contentHtml = this.renderContact();
        pageTitle = 'Kontak & Informasi Resmi Perusahaan';
        break;
      case 'faq':
      default:
        contentHtml = this.renderFaq();
        pageTitle = 'Pusat Bantuan & FAQ Transaksi';
        break;
    }

    const hasSession = (typeof AuthController !== 'undefined' && (AuthController.getSession('merchant') || AuthController.getSession('operator')));

    return `
      <div class="legal-portal-wrapper">
        <!-- STANDALONE PORTAL HEADER -->
        <header class="legal-portal-header">
          <div class="legal-brand-block" onclick="navigate('/')" role="button" aria-label="siDaya by Ashvin Labs IDN" style="cursor:pointer; display:flex; align-items:center;">
            <img src="/assets/brand/logo-horizontal-dark.svg" alt="siDaya By Ashvin Labs Idn" height="44" class="brand-logo-horizontal dark-theme-logo" style="height:44px; width:auto; max-width:220px; object-fit:contain;">
            <img src="/assets/brand/logo-horizontal-transparent.svg" alt="siDaya By Ashvin Labs Idn" height="44" class="brand-logo-horizontal light-theme-logo" style="height:44px; width:auto; max-width:220px; object-fit:contain;">
          </div>

          <div class="legal-header-actions">
            ${(typeof ThemeManager !== 'undefined') ? ThemeManager.renderDropdown({ id: 'legal-theme-dropdown', showLabel: false }) : ''}
            ${hasSession ? `
              <button class="btn btn-primary btn-sm" onclick="navigate('/dashboard')" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
                <span>←</span> Kembali ke Dashboard
              </button>
            ` : `
              <button class="btn btn-outline btn-sm" onclick="AuthController.showLoginScreen()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
                <span>←</span> Kembali ke Login
              </button>
              <button class="btn btn-primary btn-sm" onclick="AuthController.showRegisterScreen()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
                <span>🚀</span> Daftar Toko Baru
              </button>
            `}
          </div>
        </header>

        <!-- SUBNAV NAVIGATION TABS -->
        <nav class="legal-nav-tabs">
          ${tabs.map(t => `
            <button class="legal-nav-tab ${activeTab === t.id ? 'active' : ''}" 
                    onclick="navigate('${t.route}')">
              ${t.label}
            </button>
          `).join('')}
        </nav>

        <!-- RENDERED CONTENT CARD -->
        <div class="legal-content-card">
          ${contentHtml}
        </div>

        <!-- PORTAL FOOTER WITH OFFICIAL REGISTRATION DETAILS -->
        <footer class="legal-portal-footer">
          <div>
            <div style="font-weight:800; color:var(--text-primary); margin-bottom:4px;">Ashvin Labs Indonesia (SiDaya)</div>
            <div>Alamat Operasional: Griya Sari Semail • Email: ashvin.labs@gmail.com • Telp/WA: 08139506092</div>
            <div style="margin-top:4px; font-size:11.5px;">© 2026 Ashvin Labs Indonesia. Hak Cipta Dilindungi Undang-Undang Republik Indonesia.</div>
          </div>

          <div class="legal-footer-links">
            <a onclick="navigate('/faq')">FAQ</a>
            <a onclick="navigate('/terms-and-conditions')">Syarat & Ketentuan</a>
            <a onclick="navigate('/refund-policy')">Kebijakan Refund</a>
            <a onclick="navigate('/privacy-policy')">Privasi (UU PDP)</a>
            <a onclick="navigate('/contact')">Kontak Kami</a>
            <a onclick="AuthController.showLoginScreen()" style="color:var(--brand-warm-blue, #5048e5); font-weight:700; cursor:pointer;">Masuk Akun →</a>
          </div>
        </footer>
      </div>
    `;
  },

  /**
   * Renders FAQ (Frequently Asked Questions) view
   * @returns {string}
   */
  renderFaq() {
    const faqs = [
      {
        q: 'Apa itu SiDaya?',
        a: 'SiDaya (oleh Ashvin Labs) adalah sistem operasi perangkat lunak berbasis langganan (SaaS) yang dirancang khusus untuk pedagang grosir sembako, beras, bahan bangunan, dan distributor FMCG di Indonesia. SiDaya menyatukan kasir POS grosir, konversi satuan multi-tier (Karung/Sak/Kg), penataan lot inventori FIFO/FEFO, penerbitan Surat Jalan dengan proteksi privasi margin, dan pembayaran digital otomatis.'
      },
      {
        q: 'Metode pembayaran apa saja yang didukung oleh SiDaya?',
        a: 'Melalui integrasi resmi dengan Payment Gateway berlisensi Bank Indonesia (termasuk iPaymu, Midtrans, dan Xendit), SiDaya mendukung pembayaran via QRIS Dinamis (BCA, GoPay, OVO, DANA, ShopeePay, LinkAja), Virtual Account Bank (BCA, Mandiri, BNI, BRI, Permata, BSI, CIMB Niaga), transfer bank langsung, dan gerai retail ritel.'
      },
      {
        q: 'Kapan langganan SaaS atau pesanan saya aktif setelah pembayaran berhasil?',
        a: 'Seluruh pembayaran diproses secara otomatis dan instan (real-time). Begitu notifikasi webhook terkonfirmasi dari payment gateway, kuota langganan workspace Anda langsung aktif dan faktur lunas otomatis diterbitkan tanpa perlu konfirmasi manual.'
      },
      {
        q: 'Apakah SiDaya mengenakan biaya tersembunyi selain biaya paket langganan?',
        a: 'Tidak ada biaya tersembunyi. Biaya langganan SaaS ditagihkan sesuai tier yang dipilih (Starter, Pro, Enterprise). Untuk pemrosesan pembayaran PayLink pelanggan, biaya transaksi mengikuti tarif resmi MDR Bank Indonesia dan payment gateway rekanan yang tertera transparan.'
      },
      {
        q: 'Bagaimana keamanan data pribadi dan rahasia dagang harga modal (HPP) saya?',
        a: 'SiDaya menerapkan enkripsi standar militer AES-256-GCM pada database dan mematuhi Undang-Undang Pelindungan Data Pribadi (UU PDP No. 27/2022). Data harga modal (HPP/COGS) dan margin profit dilindungi secara ketat dan disembunyikan dari layar kasir, supir pengantaran, maupun agen customer service pihak ketiga.'
      },
      {
        q: 'Bagaimana jika terjadi kegagalan transaksi atau saldo terpotong dua kali?',
        a: 'Jika terjadi kendala pemrosesan transaksi atau pembayaran ganda, sistem rekonsiliasi kami akan mencatat kelebihan pembayaran. Anda juga dapat mengajukan klaim refund dalam waktu 3x24 jam melalui menu Bantuan atau email billing@sidaya.id dengan melampirkan nomor referensi transaksi.'
      },
      {
        q: 'Bagaimana cara menghubungi tim bantuan pelanggan (Customer Support)?',
        a: 'Tim bantuan operasional Ashvin Labs Indonesia siap melayani Anda melalui WhatsApp resmi di 08139506092 (+62 813-9506-092) atau email ashvin.labs@gmail.com pada hari kerja Senin - Sabtu pukul 08.00 - 18.00 WIB.'
      }
    ];

    return `
      <div class="legal-hero-banner">
        <div class="legal-hero-text">
          <h1>❓ Pusat Bantuan & FAQ</h1>
          <p>Pertanyaan umum mengenai layanan SaaS SiDaya, integrasi pembayaran, dan keamanan akun.</p>
        </div>
        <div class="legal-compliance-pills">
          <span class="compliance-pill">⚡ Real-time Settlement</span>
          <span class="compliance-pill">🛡️ BI QRIS Verified</span>
          <span class="compliance-pill">🔒 UU PDP Compliant</span>
        </div>
      </div>

      <div class="faq-search-box">
        <span class="faq-search-icon">🔍</span>
        <input type="text" class="faq-search-input" id="faq-search-input" 
               placeholder="Cari pertanyaan (misal: pembayaran, langganan, keamanan, refund)..." 
               oninput="LegalController.filterFaq(this.value)">
      </div>

      <div class="faq-list" id="faq-accordion-list">
        ${faqs.map((f, idx) => `
          <div class="faq-item ${idx === 0 ? 'active' : ''}" id="faq-item-${idx}">
            <div class="faq-question" onclick="LegalController.toggleFaq(${idx})">
              <span>${f.q}</span>
              <span class="faq-toggle-icon">▼</span>
            </div>
            <div class="faq-answer">
              ${f.a}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="legal-alert-box alert-info" style="margin-top:28px;">
        <div class="legal-alert-title">Butuh bantuan lebih lanjut atau onboarding khusus?</div>
        <div class="legal-alert-text">
          Hubungi tim konsultasi operasional kami melalui WhatsApp di <strong>08139506092</strong> atau email ke <strong>ashvin.labs@gmail.com</strong>.
        </div>
      </div>
    `;
  },

  /**
   * Renders Terms & Conditions (Syarat dan Ketentuan) view
   * @returns {string}
   */
  renderTerms() {
    return `
      <div class="legal-hero-banner">
        <div class="legal-hero-text">
          <h1>📜 Syarat & Ketentuan Layanan</h1>
          <p>Terakhir diperbarui: 19 September 2026 • Berlaku efektif untuk seluruh pengguna SiDaya.</p>
        </div>
        <div class="legal-compliance-pills">
          <span class="compliance-pill">⚖️ Hukum Republik Indonesia</span>
          <span class="compliance-pill">🏢 B2B SaaS Agreement</span>
        </div>
      </div>

      <div class="legal-section">
        <h2>1. Ketentuan Umum & Definisi</h2>
        <p>Selamat datang di <strong>SiDaya</strong>, platform sistem operasi dan perangkat lunak berbasis langganan (SaaS) yang dikembangkan dan dikelola oleh <strong>Ashvin Labs</strong> ("Kami").</p>
        <p>Dengan mendaftar, mengakses, atau menggunakan layanan SiDaya (termasuk portal web, POS kasir, sistem manajemen inventori, dan modul PayLink), Pengguna ("Anda", "Merchant", atau "Tenant") menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan ini.</p>
        <ul>
          <li><strong>Platform</strong> merujuk pada rangkaian aplikasi web, mobile, API, dan infrastruktur komputasi awan SiDaya.</li>
          <li><strong>Merchant / Tenant</strong> merujuk pada badan usaha, perorangan, toko grosir, atau distributor yang berlangganan akun SiDaya.</li>
          <li><strong>Payment Gateway</strong> merujuk pada mitra pemroses pembayaran berizin resmi dari Bank Indonesia (seperti iPaymu, Midtrans, Xendit).</li>
        </ul>
      </div>

      <div class="legal-section">
        <h2>2. Registrasi Akun & Keamanan Akses</h2>
        <ol>
          <li>Pengguna wajib memberikan data yang akurat, lengkap, dan sah (termasuk nama bisnis, email aktif, nomor WhatsApp, dan alamat operasional).</li>
          <li>Pengguna bertanggung jawab penuh atas kerahasiaan kredensial login (kata sandi, PIN stasiun kasir, token API) dan seluruh aktivitas yang terjadi di bawah akun workspace terkait.</li>
          <li>Pengguna wajib segera memberitahukan kepada SiDaya apabila mengetahui adanya indikasi peretasan atau akses tanpa hak.</li>
        </ol>
      </div>

      <div class="legal-section">
        <h2>3. Paket Layanan, Skema Langganan & Pemrosesan Pembayaran (PayLink)</h2>
        <ol>
          <li><strong>Pilihan Paket:</strong> SiDaya menyediakan paket <em>Perintis</em> (Rp 0 / Gratis Selamanya untuk Pemasok Mandiri/Usaha Mikro) serta paket berbayar bertingkat (<em>Starter</em>, <em>Grosir Pro</em>, <em>Enterprise Fleet</em>) dengan kuota dan kapabilitas fitur yang disesuaikan untuk skala usaha Merchant.</li>
          <li><strong>Paket Perintis (Gratis Selamanya):</strong> Diberikan tanpa biaya langganan software bulanan untuk mendukung pemberdayaan dan digitalisasi pemasok mandiri serta UMKM perorangan di Indonesia.</li>
          <li><strong>Pemrosesan Pembayaran PayLink (Managed Gateway):</strong> Untuk memudahkan transaksi penjualan tanpa keharusan membuat badan usaha (PT/CV) atau integrasi payment gateway mandiri, Pengguna dapat menggunakan infrastruktur PayLink bawaan SiDaya. Biaya pemrosesan transaksi (MDR QRIS standar Bank Indonesia serta biaya administrasi Virtual Account dan biaya pencairan dana) dicantumkan secara transparan sebelum transaksi diselesaikan.</li>
          <li><strong>Ketentuan Integrasi Mandiri (BYOK - Bring Your Own Key):</strong> Merchant pada paket <em>Grosir Pro</em> dan <em>Enterprise Fleet</em> berhak mengintegrasikan kredensial akun Payment Gateway terdaftar milik sendiri (seperti iPaymu, Midtrans, Xendit), di mana tarif MDR dan alur pencairan dana berlaku langsung antara Merchant dan penyedia Payment Gateway terkait.</li>
          <li><strong>Pembayaran Langganan SaaS:</strong> Seluruh transaksi pembayaran biaya langganan berbayar SaaS diproses secara aman melalui gerbang pembayaran mitra resmi. Tagihan diterbitkan otomatis sebelum masa aktif berakhir dengan periode tenggang (*grace period*) 7 hari kalender.</li>
        </ol>
      </div>

      <div class="legal-section">
        <h2>4. Batasan Penggunaan & Kepatuhan Hukum</h2>
        <p>Pengguna dilarang keras menggunakan platform SiDaya untuk:</p>
        <ul>
          <li>Aktivitas perdagangan barang terlarang, narkotika, zat adiktif, senjata api, atau produk yang melanggar hukum di Republik Indonesia.</li>
          <li>Pencucian uang (*Money Laundering*), pendanaan terorisme, atau transaksi penipuan keuangan lainnya.</li>
          <li>Melakukan upaya rekayasa balik (*reverse engineering*), dekompilasi kode sumber, atau serangan siber ke infrastruktur SiDaya.</li>
        </ul>
      </div>

      <div class="legal-section">
        <h2>5. Ketersediaan Layanan (SLA) & Pemeliharaan</h2>
        <p>Kami berkomitmen menjaga tingkat ketersediaan layanan (*uptime*) minimum sebesar <strong>99.5%</strong> setiap bulannya, di luar pemeliharaan terjadwal (*scheduled maintenance*) yang akan diberitahukan minimal 24 jam sebelumnya melalui dashboard atau email.</p>
      </div>

      <div class="legal-section">
        <h2>6. Hukum yang Berlaku & Penyelesaian Sengketa</h2>
        <p>Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul akan diupayakan diselesaikan terlebih dahulu melalui musyawarah untuk mufakat dalam waktu 30 (tiga puluh) hari kalender sebelum diteruskan ke yurisdiksi Pengadilan Negeri yang berwenang.</p>
      </div>
    `;
  },

  /**
   * Renders Refund Policy (Kebijakan Pengembalian Dana) view
   * @returns {string}
   */
  renderRefund() {
    return `
      <div class="legal-hero-banner">
        <div class="legal-hero-text">
          <h1>🔄 Kebijakan Pengembalian Dana (Refund Policy)</h1>
          <p>Panduan transparansi pembatalan paket, kelebihan debit, dan pengajuan klaim dana.</p>
        </div>
        <div class="legal-compliance-pills">
          <span class="compliance-pill">⏱️ SLA 3x24 Jam</span>
          <span class="compliance-pill">🛡️ Jaminan Transaksi Aman</span>
        </div>
      </div>

      <div class="legal-section">
        <h2>1. Sifat Layanan Digital & Langganan SaaS</h2>
        <p>Layanan SiDaya merupakan produk perangkat lunak berbasis cloud (Software-as-a-Service). Akses dan infrastruktur workspace server dialokasikan secara instan begitu pembayaran terverifikasi.</p>
        <p>Oleh karena itu, biaya paket langganan yang telah dibayarkan pada prinsipnya bersifat <strong>tidak dapat dikembalikan (*non-refundable*)</strong> untuk periode langganan yang sedang berjalan.</p>
      </div>

      <div class="legal-section">
        <h2>2. Syarat & Kondisi Pengembalian Dana yang Memenuhi Syarat</h2>
        <p>Pengembalian dana (refund) hanya dapat disetujui dalam kondisi-kondisi khusus berikut:</p>
        <ol>
          <li><strong>Pembayaran Ganda / Duplikasi Terbukti:</strong> Pengguna terdebit lebih dari 1 (satu) kali untuk invoice tagihan langganan atau kode transaksi yang sama akibat kegagalan sinkronisasi perbankan/gateway.</li>
          <li><strong>Kegagalan Aktivasi Sistem Permanen:</strong> Pembayaran telah berhasil didebit oleh payment gateway (iPaymu / VA / QRIS), namun sistem SiDaya gagal mengaktifkan fitur/kuota akun dalam waktu lebih dari 2x24 jam kerja dan tim teknis kami tidak dapat memulihkan kendala tersebut.</li>
          <li><strong>Kelebihan Pembayaran Transfer:</strong> Pengguna mentransfer nominal yang melebihi jumlah tagihan faktur terverifikasi.</li>
        </ol>
      </div>

      <div class="legal-section">
        <h2>3. Prosedur & Tata Cara Pengajuan Refund</h2>
        <p>Untuk mengajukan permohonan pengembalian dana, Pengguna wajib mengikuti langkah-langkah berikut:</p>
        <ol>
          <li>Kirimkan email resmi ke <strong>ashvin.labs@gmail.com</strong> (atau <strong>billing@sidaya.id</strong>) atau hubungi WhatsApp Support di <strong>08139506092</strong> (+62 813-9506-092) dengan subjek: <code>[Pengajuan Refund] - Nomor Transaksi / Invoice</code>.</li>
          <li>Lampirkan bukti transaksi resmi berupa:
            <ul>
              <li>Struk/mutasi transfer bank atau tangkapan layar pembayaran e-Wallet/QRIS.</li>
              <li>Nomor referensi pembayaran iPaymu / Invoice ID SiDaya.</li>
              <li>Nama akun bank dan nomor rekening tujuan pengembalian dana (harus atas nama yang sama dengan pendaftar akun).</li>
            </ul>
          </li>
          <li>Batas waktu maksimal pengajuan klaim adalah <strong>3x24 jam</strong> kalender sejak tanggal dan waktu transaksi terjadi.</li>
        </ol>
      </div>

      <div class="legal-section">
        <h2>4. Proses Verifikasi & Jangka Waktu Pencairan</h2>
        <div class="legal-alert-box alert-info">
          <div class="legal-alert-title">Proses Pengembalian Dana: 3 hingga 7 Hari Kerja</div>
          <div class="legal-alert-text">
            Setelah verifikasi berkas disetujui oleh tim finance Ashvin Labs dan mitra payment gateway, dana akan dikembalikan ke metode pembayaran asal (rekening bank/e-Wallet pemohon) dalam jangka waktu 3 - 7 hari kerja.
          </div>
        </div>
      </div>

      <div class="legal-section">
        <h2>5. Pembatalan Perpanjangan Otomatis</h2>
        <p>Pengguna dapat membatalkan perpanjangan langganan kapan saja melalui menu <em>Pengaturan Workspace → Langganan & Tagihan</em>. Setelah dibatalkan, akun akan tetap dapat digunakan hingga akhir periode tagihan yang telah dibayar dan tidak akan ditagih pada siklus berikutnya.</p>
      </div>
    `;
  },

  /**
   * Renders Privacy Policy (Kebijakan Privasi & UU PDP) view
   * @returns {string}
   */
  renderPrivacy() {
    return `
      <div class="legal-hero-banner">
        <div class="legal-hero-text">
          <h1>🔒 Kebijakan Privasi (Privacy Policy)</h1>
          <p>Kepatuhan Penuh terhadap Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).</p>
        </div>
        <div class="legal-compliance-pills">
          <span class="compliance-pill">🛡️ UU PDP No. 27/2022</span>
          <span class="compliance-pill">🔐 AES-256-GCM Encryption</span>
        </div>
      </div>

      <div class="legal-section">
        <h2>1. Komitmen Pelindungan Data Pribadi</h2>
        <p>SiDaya (Ashvin Labs) berkomitmen penuh melindungi hak privasi dan kerahasiaan data pribadi maupun data komersial setiap Pengguna. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, memproses, menyimpan, dan menjaga keamanan informasi Anda sesuai regulasi yang berlaku di Republik Indonesia.</p>
      </div>

      <div class="legal-section">
        <h2>2. Data yang Kami Kumpulkan</h2>
        <ul>
          <li><strong>Informasi Pendaftaran:</strong> Nama pemilik usaha, nama toko/perusahaan, alamat email, nomor telepon/WhatsApp, dan alamat fisik toko.</li>
          <li><strong>Data Transaksi & Finansial:</strong> Nilai transaksi, status pembayaran, catatan piutang, dan riwayat faktur. <em>Catatan: Kami tidak pernah menyimpan nomor kartu kredit atau PIN perbankan Anda secara langsung. Seluruh pembayaran diproses oleh payment gateway tersertifikasi PCI-DSS (seperti iPaymu).</em></li>
          <li><strong>Data Inventori & Operasional:</strong> SKU produk, jumlah stok, pergerakan batch FIFO, dan manifest pengiriman Surat Jalan.</li>
        </ul>
      </div>

      <div class="legal-section">
        <h2>3. Perlindungan Rahasia Dagang & Harga Modal (COGS / HPP)</h2>
        <p>Kami memahami bahwa harga modal (*Cost of Goods Sold*) dan margin keuntungan grosir adalah rahasia dagang paling vital. SiDaya menerapkan isolasi data ketat (*Multi-Tenant Isolation*) dan menyembunyikan nilai HPP dari antarmuka kasir dan supir pengantaran guna melindungi bisnis Anda dari kebocoran informasi komersial.</p>
      </div>

      <div class="legal-section">
        <h2>4. Penggunaan & Pembagian Data</h2>
        <p>Kami <strong>tidak akan pernah menjual, menyewakan, atau memperjualbelikan</strong> data Pengguna kepada pihak ketiga mana pun untuk tujuan pemasaran. Data hanya dibagikan kepada mitra resmi pemroses pembayaran berizin (Payment Gateway) semata-mata untuk memvalidasi penyelesaian transaksi.</p>
      </div>

      <div class="legal-section">
        <h2>5. Hak Subjek Data</h2>
        <p>Sesuai UU PDP No. 27 Tahun 2022, Pengguna berhak:</p>
        <ol>
          <li>Mengakses dan memperbarui data profil toko yang terdaftar.</li>
          <li>Meminta penghapusan data akun (*Right to be Forgotten*) saat berhenti berlangganan secara permanen.</li>
          <li>Mendapatkan konfirmasi tertulis mengenai pemrosesan data pribadi.</li>
        </ol>
      </div>
    `;
  },

  /**
   * Renders Contact (Kontak Resmi Usaha) view
   * @returns {string}
   */
  renderContact() {
    return `
      <div class="legal-hero-banner">
        <div class="legal-hero-text">
          <h1>📞 Kontak Resmi & Informasi Usaha</h1>
          <p>Informasi operasional resmi pengelola platform SiDaya untuk verifikasi perbankan & layanan pelanggan.</p>
        </div>
        <div class="legal-compliance-pills">
          <span class="compliance-pill">🏢 Merchant Terverifikasi iPaymu</span>
          <span class="compliance-pill">💬 Fast Response WhatsApp</span>
        </div>
      </div>

      <div class="contact-grid">
        <!-- CONTACT INFO CARD -->
        <div class="contact-card-info">
          <div class="contact-detail-row">
            <div class="contact-icon-bubble">🏢</div>
            <div style="flex:1;">
              <div class="contact-meta-label">Nama Usaha / Badan Usaha</div>
              <div class="contact-meta-val">Ashvin Labs Indonesia</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Penanggung Jawab: Gabriel Fermy Aswinta</div>
              <div style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">Kategori: Computer Programming, Data Processing & Integrated Systems Design</div>
            </div>
          </div>

          <div class="contact-detail-row">
            <div class="contact-icon-bubble">📧</div>
            <div style="flex:1;">
              <div class="contact-meta-label">Email Resmi Perusahaan / Merchant</div>
              <div class="contact-meta-val">ashvin.labs@gmail.com</div>
              <div class="contact-meta-val" style="font-size:13px; color:var(--text-secondary); margin-top:2px;">support@sidaya.id • billing@sidaya.id</div>
              <button class="contact-copy-btn" onclick="LegalController.copyContactInfo('Email', 'ashvin.labs@gmail.com')">
                📋 Salin Email
              </button>
            </div>
          </div>

          <div class="contact-detail-row">
            <div class="contact-icon-bubble">📱</div>
            <div style="flex:1;">
              <div class="contact-meta-label">Nomor Telepon Bisnis / WhatsApp Resmi</div>
              <div class="contact-meta-val">08139506092</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">(+62 813-9506-092) Layanan Bantuan & Transaksi</div>
              <button class="contact-copy-btn" onclick="LegalController.copyContactInfo('Telepon', '08139506092')">
                📋 Salin Nomor Telepon
              </button>
            </div>
          </div>

          <div class="contact-detail-row">
            <div class="contact-icon-bubble">📍</div>
            <div style="flex:1;">
              <div class="contact-meta-label">Alamat Bisnis / Usaha (Kantor Operasional)</div>
              <div class="contact-meta-val">
                Griya Sari Semail
              </div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Indonesia</div>
              <button class="contact-copy-btn" onclick="LegalController.copyContactInfo('Alamat', 'Griya Sari Semail')">
                📋 Salin Alamat
              </button>
            </div>
          </div>

          <div class="contact-detail-row">
            <div class="contact-icon-bubble">⏰</div>
            <div style="flex:1;">
              <div class="contact-meta-label">Jam Layanan Operasional</div>
              <div class="contact-meta-val">Senin – Jumat: 08.00 – 18.00 WIB</div>
              <div class="contact-meta-val" style="font-size:13px; color:var(--text-secondary);">Sabtu: 08.00 – 15.00 WIB (Hari Minggu/Libur Nasional Tutup)</div>
            </div>
          </div>
        </div>

        <!-- CONTACT INTERACTIVE INQUIRY FORM -->
        <div class="contact-form-card">
          <h3>✉️ Kirim Pesan / Permintaan Bantuan</h3>
          <form onsubmit="LegalController.handleContactSubmit(event)">
            <div class="form-group" style="margin-bottom:14px;">
              <label class="form-label" style="font-size:12px; font-weight:700;">Nama Lengkap / Nama Bisnis *</label>
              <input type="text" class="form-input" id="contact-name" required placeholder="Contoh: Budi Santoso (Toko Grosir Beras Jaya)">
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label class="form-label" style="font-size:12px; font-weight:700;">Alamat Email Aktif *</label>
              <input type="email" class="form-input" id="contact-email" required placeholder="nama@email.com">
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label class="form-label" style="font-size:12px; font-weight:700;">Nomor WhatsApp *</label>
              <input type="tel" class="form-input" id="contact-phone" required placeholder="08123456789">
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label class="form-label" style="font-size:12px; font-weight:700;">Perihal Pesan *</label>
              <select class="form-input" id="contact-subject" style="cursor:pointer;">
                <option value="verifikasi_gateway">Verifikasi Merchant & Payment Gateway</option>
                <option value="pertanyaan_langganan">Pertanyaan Paket Langganan SaaS</option>
                <option value="kendala_transaksi">Kendala Pembayaran / Klaim Refund</option>
                <option value="demo_onboarding">Permintaan Onboarding & Demo Khusus</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom:18px;">
              <label class="form-label" style="font-size:12px; font-weight:700;">Isi Pesan / Keterangan *</label>
              <textarea class="form-input" id="contact-message" rows="4" required placeholder="Tuliskan pertanyaan atau detail kebutuhan Anda di sini..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; font-weight:800; display:flex; justify-content:center; align-items:center; gap:8px;">
              <span>🚀</span> Kirim Pesan Sekarang
            </button>
          </form>
        </div>
      </div>
    `;
  }
};
