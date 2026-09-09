/**
 * ==========================================================================
 * ROADMAP METADATA (PHASE 2, 3 & 4 ROADMAP MODULES)
 * ==========================================================================
 */
const ROADMAP_METADATA = {
  // Pilar 2: Inventori & Multi-Gudang
  'multi-gudang': {
    icon: '🏬',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Multi-Gudang & Transfer Antar Cabang',
    desc: 'Kelola alokasi stok di berbagai titik gudang fisik, buffer stock regional, dan surat jalan mutasi stok otomatis.',
    features: [
      { icon: '🗺️', title: 'Routing Multi-Lokasi', desc: 'Penentuan gudang terdekat dari armada pengiriman pelanggan.' },
      { icon: '🔄', title: 'Surat Jalan Mutasi', desc: 'Otorisasi serah terima transfer barang antar cabang bisnis.' },
      { icon: '📊', title: 'Konsolidasi Saldo', desc: 'Pemantauan total stok gabungan seluruh lokasi secara tersentral.' }
    ]
  },
  'stock-opname': {
    icon: '📋',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Stock Opname Fisik & Audit Selisih',
    desc: 'Audit stok berkala menggunakan mobile scanner dengan rekonsiliasi selisih dan penyesuaian jurnal penyesuaian otomatis.',
    features: [
      { icon: '📱', title: 'Scan Seluler Buta', desc: 'Staf gudang menghitung fisik tanpa melihat estimasi sistem (Blind Count).' },
      { icon: '⚖️', title: 'Laporan Varian & Selisih', desc: 'Deteksi otomatis kehilangan barang, expired, atau penyusutan.' },
      { icon: '🔐', title: 'Approval Penyesuaian', desc: 'Hanya Owner yang dapat menyetujui mutasi penyesuaian nilai buku.' }
    ]
  },
  'barcode-print': {
    icon: '🖨️',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Cetak Label Barcode & QR Code Massal',
    desc: 'Generate dan cetak label barcode EAN-13, Code 128, dan QR Tag untuk komoditas repack dan rak gudang.',
    features: [
      { icon: '🏷️', title: 'Format Kertas Fleksibel', desc: 'Dukungan printer thermal label 58mm, 80mm, dan stiker Tom & Jerry.' },
      { icon: '⚡', title: 'Cetak Batch SKU', desc: 'Cetak ratusan label sekaligus berdasarkan lot penerimaan barang.' },
      { icon: '📦', title: 'Tag Lokasi Rak', desc: 'Label QR Code untuk identifikasi rak penyimpanan gudang.' }
    ]
  },

  // Pilar 3: Supplier SRM
  'suppliers': {
    icon: '🏭',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Direktori Pemasok & Termin Pembayaran (TOP)',
    desc: 'Pusat data produsen, distributor utama, riwayat pasokan beras/sembako, dan terms of payment (TOP 30/60 hari).',
    features: [
      { icon: '🤝', title: 'Profil Vendor Lengkap', desc: 'Kontak PIC supplier, rekening bank pembayaran, dan SLA pengiriman.' },
      { icon: '📅', title: 'Manajemen Termin TOP', desc: 'Pantau tagihan jatuh tempo pembelian untuk menjaga kelancaran pasokan.' },
      { icon: '⭐', title: 'Scorecard Kualitas', desc: 'Penilaian stabilitas harga, kualitas beras, dan ketepatan waktu vendor.' }
    ]
  },

  // Pilar 4: Procurement
  'po': {
    icon: '📝',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Surat Pesanan Pembelian (Purchase Order)',
    desc: 'Alur penerbitan PO resmi ke pabrik/produsen dengan approval hierarkis dan pelacakan pemenuhan pesanan parsial.',
    features: [
      { icon: '📄', title: 'Generate PO Otomatis', desc: 'Penerbitan PO PDF bertanda tangan digital siap kirim WhatsApp.' },
      { icon: '🧩', title: 'Penerimaan Parsial', desc: 'Cocokkan PO dengan Surat Jalan inbound bertahap dari supplier.' },
      { icon: '💰', title: 'Penguncian Harga Kontrak', desc: 'Kunci harga komoditas grosir saat pemesanan diterbitkan.' }
    ]
  },
  'rtv': {
    icon: '↩️',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Retur Pembelian ke Pemasok (Return-to-Vendor)',
    desc: 'Pencatatan barang rusak (reject), kemasan bocor, atau mutu tidak sesuai standar saat proses inbound dock.',
    features: [
      { icon: '📸', title: 'Bukti Foto Kerusakan', desc: 'Unggah dokumentasi kondisi barang reject untuk klaim kompensasi.' },
      { icon: '💳', title: 'Kredit Nota Vendor', desc: 'Pengurangan otomatis terhadap saldo hutang usaha ke supplier terkait.' },
      { icon: '📦', title: 'Karantina Fisik', desc: 'Pemisahan stok reject agar tidak teralokasi ke transaksi kasir POS.' }
    ]
  },
  'planning': {
    icon: '📈',
    phase: 'PHASE 3 ROADMAP • TARGET Q1 2027',
    title: 'Perencanaan Stok Min/Max & Reorder Point',
    desc: 'Formula otomatis penentuan batas minimum restock komoditas berdasarkan laju penjualan harian dan lead time vendor.',
    features: [
      { icon: '🔔', title: 'Peringatan Stok Kritis', desc: 'Notifikasi proaktif saat persediaan mendekati Safety Stock.' },
      { icon: '🧮', title: 'Saran Kuantitas Pesan', desc: 'Kalkulasi Economic Order Quantity (EOQ) untuk efisiensi modal kerja.' },
      { icon: '⏳', title: 'Lead-Time Tracking', desc: 'Analisis durasi pengiriman tiap supplier dari PO hingga barang tiba.' }
    ]
  },

  // Pilar 5: Penjualan
  'sales-returns': {
    icon: '🔄',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Retur Penjualan & Nota Kredit Pelanggan',
    desc: 'Penanganan pengembalian barang dari pelanggan grosir dengan opsi tukar barang atau pengembalian dana/pemotongan kasbon.',
    features: [
      { icon: '🧾', title: 'Validasi Nota Penjualan', desc: 'Pengecekan barcode nota asli untuk mencegah retur fiktif.' },
      { icon: '✂️', title: 'Koreksi Kasbon Otomatis', desc: 'Nilai retur otomatis memotong saldo kasbon berjalan pelanggan.' },
      { icon: '🔍', title: 'Restorasi Stok FIFO', desc: 'Pengembalian kuantitas ke batch lot yang sesuai secara akurat.' }
    ]
  },
  'shifts': {
    icon: '💳',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Manajemen Shift Kasir & Tutup Kas (X/Z Report)',
    desc: 'Kontrol modal kas awal laci kasir, serah terima shift staf, dan rekonsiliasi selisih fisik tunai vs rekap sistem.',
    features: [
      { icon: '💵', title: 'Modal Kas Awal (Float)', desc: 'Pencatatan uang kembalian sebelum shift kasir dibuka.' },
      { icon: '📊', title: 'Laporan Tutup Kas Z', desc: 'Cetak slip audit penutupan shift ke printer thermal bluetooth.' },
      { icon: '🛡️', title: 'Deteksi Varian Kas', desc: 'Pencatatan selisih kas lebih/kurang untuk transparansi kerja kasir.' }
    ]
  },
  'pricing': {
    icon: '🏷️',
    phase: 'PHASE 3 ROADMAP • TARGET Q1 2027',
    title: 'Skema Multi-Tier Harga Grosir & Promo Partai',
    desc: 'Daftar harga bertingkat berdasarkan volume pembelian (Tier Warung, Grosir Kecil, Grosir Partai Besar, Kontrak Khusus).',
    features: [
      { icon: '🪜', title: 'Tiering Kuantitas', desc: 'Harga otomatis turun jika pembelian melebihi ambang batas (cth: >50 karung).' },
      { icon: '🏷️', title: 'Diskon Khusus Member', desc: 'Pemberian margin khusus untuk pelanggan prime terverifikasi.' },
      { icon: '⏰', title: 'Promo Periode Terbatas', desc: 'Diskon kilat musiman (cth: Ramadhan, Panen Raya) dengan kuota promo.' }
    ]
  },

  // Pilar 6: Logistik
  'tracking': {
    icon: '📍',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Pelacakan Armada Live & Bukti Digital (POD)',
    desc: 'Tanda tangan digital penerima barang, foto serah terima barang di lokasi toko, dan geotagging koordinat GPS armada.',
    features: [
      { icon: '✍️', title: 'Tanda Tangan Digital', desc: 'Pelanggan menandatangani penerimaan langsung di layar ponsel driver.' },
      { icon: '📷', title: 'Foto Titik Bongkar', desc: 'Dokumentasi visual tumpukan karung komoditas di gudang pembeli.' },
      { icon: '🌍', title: 'Verifikasi Lokasi GPS', desc: 'Validasi koordinat pengantaran armada untuk mencegah rute fiktif.' }
    ]
  },

  // Pilar 7: Keuangan
  'hutang': {
    icon: '📉',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Buku Hutang Usaha Supplier & Jadwal Pelunasan',
    desc: 'Monitoring jadwal jatuh tempo pembayaran ke pabrik/produsen untuk menjaga skor kredit dan stabilitas pasokan.',
    features: [
      { icon: '🗓️', title: 'Kalender Jatuh Tempo', desc: 'Daftar urut tagihan vendor berdasarkan prioritas waktu jatuh tempo.' },
      { icon: '🏦', title: 'Batch Pembayaran Bank', desc: 'Ekspor file transfer massal siap upload ke internet banking bisnis.' },
      { icon: '🧾', title: 'Arsip Bukti Bayar', desc: 'Penyimpanan bukti transfer bank terhubung ke nomor faktur supplier.' }
    ]
  },
  'cash-bank': {
    icon: '🏦',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Rekonsiliasi Kas & Rekening Bank Toko',
    desc: 'Pencatatan mutasi kas kecil, transfer antar rekening giro, dan rekonsiliasi settlement otomatis dari QRIS/Payment Gateway.',
    features: [
      { icon: '💳', title: 'Rekonsiliasi QRIS H+0', desc: 'Pengecekan otomatis dana masuk dari Midtrans/BCA ke buku kas.' },
      { icon: '💸', title: 'Buku Kas Kecil (Petty Cash)', desc: 'Pencatatan pengeluaran operasional harian toko (bensin, makan staf).' },
      { icon: '🏦', title: 'Multi-Rekening Usaha', desc: 'Pantau saldo terpisah untuk BCA, Mandiri, BRI, dan Brankas Tunai.' }
    ]
  },
  'laporan': {
    icon: '📊',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Laporan Laba Rugi Realtime & COGS FIFO',
    desc: 'Perhitungan profitabilitas bersih, laba kotor per jenis komoditas, dan beban operasional dengan akurasi FIFO ketat.',
    features: [
      { icon: '📈', title: 'Laba Kotor Per Komoditas', desc: 'Ketahui margin keuntungan pasti beras rojolele, minyak, dan gula.' },
      { icon: '📉', title: 'Beban Operasional Toko', desc: 'Kalkulasi rasio biaya sewa gudang, gaji, listrik terhadap omzet.' },
      { icon: '📥', title: 'Ekspor Excel & PDF', desc: 'Laporan keuangan siap cetak untuk pengajuan kredit modal perbankan.' }
    ]
  },
  'forecast': {
    icon: '📈',
    phase: 'PHASE 3 ROADMAP • TARGET Q1 2027',
    title: 'Peramalan Arus Kas & Runway Finansial',
    desc: 'Proyeksi saldo kas 30-90 hari ke depan dengan mengkombinasikan jadwal penagihan piutang dan jatuh tempo hutang.',
    features: [
      { icon: '🔮', title: 'Simulasi Defisit Kas', desc: 'Deteksi dini potensi kekurangan likuiditas sebelum terjadi.' },
      { icon: '📊', title: 'Tingkat Kolektibilitas', desc: 'Estimasi penerimaan kas berdasarkan riwayat ketepatan bayar pelanggan.' },
      { icon: '💡', title: 'Rekomendasi Alokasi Dana', desc: 'Saran prioritas pembayaran vendor untuk optimasi diskon pelunasan cepat.' }
    ]
  },
  'assets': {
    icon: '🏢',
    phase: 'PHASE 3 ROADMAP • TARGET Q1 2027',
    title: 'Inventarisasi Aset Tetap & Depresiasi',
    desc: 'Pencatatan armada truk logistik, mesin forklift, timbangan digital, printer dot matrix, dan penyusutan nilai buku.',
    features: [
      { icon: '🚚', title: 'Kartu Inventaris Aset', desc: 'Data nomor mesin, tahun beli, dan masa manfaat kendaraan operasional.' },
      { icon: '📉', title: 'Penyusutan Garis Lurus', desc: 'Perhitungan amortisasi aset otomatis setiap akhir bulan pembukuan.' },
      { icon: '🔧', title: 'Jadwal Servis Berkala', desc: 'Pengingat servis armada dan kalibrasi timbangan digital gudang.' }
    ]
  },

  // Pilar 9: Sistem & Tata Kelola
  'approvals': {
    icon: '⚡',
    phase: 'PHASE 3 ROADMAP • TARGET Q1 2027',
    title: 'Hierarki Alur Persetujuan (Approval Workflows)',
    desc: 'Otorisasi multi-level untuk transaksi khusus seperti perubahan limit piutang, diskon di atas 5%, dan write-off stok rusak.',
    features: [
      { icon: '📱', title: 'Push Notif WhatsApp ke Owner', desc: 'Owner dapat menyetujui permintaan diskon kasir langsung dari WA.' },
      { icon: '🪜', title: 'Batas Otoritas Nominal', desc: 'Kasir max Rp 50rb, Supervisor max Rp 500rb, Owner tanpa batas.' },
      { icon: '📜', title: 'Audit Trail Keputusan', desc: 'Log siapa yang memberi izin dan alasan persetujuan diberikan.' }
    ]
  },
  'integrasi': {
    icon: '🔌',
    phase: 'PHASE 3 ROADMAP • TARGET Q1 2027',
    title: 'Integrasi Omnichannel Marketplace & API Eksternal',
    desc: 'Sinkronisasi inventori live dengan Tokopedia, Shopee, TikTok Shop, dan sistem ERP eksternal (SAP/Accurate).',
    features: [
      { icon: '🔄', title: 'Stok Terpusat Realtime', desc: 'Penjualan di Shopee otomatis memotong kuantitas stok di toko fisik.' },
      { icon: '🌐', title: 'Open REST API & Webhooks', desc: 'Koneksikan data transaksi ke aplikasi akuntansi pihak ketiga.' },
      { icon: '📦', title: 'Katalog Massal Sync', desc: 'Update harga komoditas sekali klik ke semua channel penjualan.' }
    ]
  },
  'ai-forecasting': {
    icon: '🤖',
    phase: 'PHASE 3 ROADMAP • TARGET Q1 2027',
    title: 'AI Demand Forecast & Anomaly Detection',
    desc: 'Machine learning untuk memprediksi lonjakan permintaan komoditas beras jelang hari besar dan mendeteksi anomali fraud.',
    features: [
      { icon: '🧠', title: 'Prediksi Musim & Hari Besar', desc: 'Saran stok ekstra beras ketan dan minyak jelang Idul Fitri.' },
      { icon: '🛡️', title: 'Deteksi Transaksi Mencurigakan', desc: 'Alert bila ada void kasir tidak wajar atau mutasi stok mencurigakan.' },
      { icon: '🎯', title: 'Rekomendasi Reorder Pintar', desc: 'Optimasi modal kerja agar tidak terjadi over-stock atau dead-stock.' }
    ]
  },
  'pajak': {
    icon: '🧾',
    phase: 'PHASE 4 ROADMAP • TARGET Q2 2027',
    title: 'Kepatuhan Pajak, PPN 11% & e-Faktur Pajak',
    desc: 'Perhitungan PPN otomatis, pembuatan faktur pajak standar, dan integrasi DJP (Direktorat Jenderal Pajak).',
    features: [
      { icon: '🏛️', title: 'Kalkulasi PPN/PPh Otomatis', desc: 'Penyesuaian tarif pajak untuk komoditas kena pajak vs non-BKP.' },
      { icon: '📄', title: 'Generate e-Faktur CSV/XML', desc: 'Format siap impor ke aplikasi e-Faktur resmi DJP.' },
      { icon: '📑', title: 'Laporan SPT Masa PPN', desc: 'Rekap pajak keluaran dan masukan untuk pelaporan bulanan akuntan.' }
    ]
  },

  // Operator Modul Roadmap
  'billing': {
    icon: '💳',
    phase: 'PHASE 2 ROADMAP • TARGET Q4 2026',
    title: 'Automated SaaS Billing & Dunning Engine',
    desc: 'Manajemen siklus tagihan langganan tenant, dunning grace period, dan penyesuaian kuota database secara otomatis.',
    features: [
      { icon: '🔄', title: 'Auto-Recurring Invoice', desc: 'Penerbitan invoice langganan bulanan GROSIR_PRO otomatis.' },
      { icon: '⏳', title: 'Dunning Grace Period', desc: 'Pemberian kelonggaran 7 hari sebelum tenant masuk mode read-only.' },
      { icon: '📊', title: 'MRR & ARR Analytics', desc: 'Pemantauan Monthly Recurring Revenue agregat platform.' }
    ]
  },
  'infra': {
    icon: '🗄️',
    phase: 'PHASE 3 ROADMAP • TARGET Q1 2027',
    title: 'PostgreSQL Database Sharding Telemetry',
    desc: 'Monitoring ukuran storage per tenant cluster, auto-partitioning skema database, dan replikasi multi-region.',
    features: [
      { icon: '📈', title: 'Tenant Disk Quota', desc: 'Monitoring kapasitas gigabyte database masing-masing tenant.' },
      { icon: '⚡', title: 'Read-Replica Balancer', desc: 'Distribusi beban query berat kasir ke node replika Postgres.' },
      { icon: '🛡️', title: 'Zero-Downtime Migration', desc: 'Migrasi data skema tanpa mengganggu operasional kasir toko.' }
    ]
  },
  'security': {
    icon: '🛡️',
    phase: 'PHASE 3 ROADMAP • TARGET Q1 2027',
    title: 'Threat Detection & Cloudflare WAF Platform',
    desc: 'Pendeteksian serangan brute force login PIN, mitigasi DDoS distributed layer 7, dan enkripsi field UU PDP.',
    features: [
      { icon: '🚨', title: 'Brute Force PIN Blocker', desc: 'Karantina otomatis IP bila kasir salah PIN 5x berturut-turut.' },
      { icon: '🌐', title: 'Cloudflare Edge Rules', desc: 'Proteksi domain tenant dari bot scraping dan traffic berbahaya.' },
      { icon: '🔐', title: 'KMS Key Rotation', desc: 'Rotasi berkala kunci enkripsi field identitas pelanggan UU PDP.' }
    ]
  }
};
