/**
 * @file pos.tour.js
 * @description Pluggable Tour Module for Pilar 05: Kasir POS Grosir & Fast-Scan
 */

if (typeof OnboardingRegistry !== 'undefined') {
  OnboardingRegistry.registerModule({
    id: 'pilar_pos',
    moduleKey: 'pos',
    route: '/pos',
    title: 'Kasir POS Grosir',
    icon: '🛒',
    requiredPermissions: ['pos:checkout'],
    isOwnerOnly: false,
    tier: 'STARTER_FREE',
    steps: [
      {
        id: 'pos_barcode_scan',
        targetSelector: '#pos-barcode-input',
        title: 'Fast-Scan Barcode & Pencarian SKU',
        icon: '📷',
        what: 'Kolom pemindaian barcode fisik/kamera dan pencarian cepat kode SKU barang dagangan.',
        why: 'Memungkinkan kasir melayani antrean pembeli grosir dengan kilat tanpa perlu mencari satu per satu di daftar panjang.',
        howWhere: 'Arahkan kursor ke kolom ini > tembak barcode produk dengan scanner fisik, atau ketik nama komoditas (misal: "Rojolele") lalu tekan Enter pada keyboard untuk langsung memasukkan 1 satuan ke keranjang.'
      },
      {
        id: 'pos_packaging_units',
        targetSelector: '#pos-product-grid',
        title: 'Pilihan Satuan Bertingkat (Karung / Bal / Pcs)',
        icon: '📦',
        what: 'Pilihan varian kemasan jual grosir dengan harga yang otomatis terkonversi sesuai satuan yang dipilih.',
        why: 'Kasir dapat menjual 1 Karung (50kg) atau eceran per Bal/Pcs tanpa repot menghitung manual harga eceran.',
        howWhere: 'Klik kartu komoditas di katalog produk > pilih varian satuan yang diminta pembeli sebelum memasukkan ke keranjang belanja.'
      },
      {
        id: 'pos_cart_discount',
        targetSelector: '#tour-pos-cart',
        title: 'Keranjang Belanja & Diskon Grosir Otomatis',
        icon: '🛒',
        what: 'Panel rincian belanja pelanggan, penghitungan diskon volume pembelian besar, dan pemilihan metode pembayaran.',
        why: 'Menghindari salah hitung nominal diskon kuantiti dan memastikan total akhir faktur akurat.',
        howWhere: 'Atur jumlah kuantiti barang di keranjang > periksa potongan diskon volume yang otomatis terpotong pada subtotal belanja.'
      },
      {
        id: 'pos_tempo_credit',
        targetSelector: '#pos-customer-select',
        title: 'Pembayaran Kasbon & Verifikasi Plafon Kredit',
        icon: '💳',
        what: 'Pemilihan toko langganan terdaftar untuk transaksi bertipe Kasbon / Tempo.',
        why: 'Memverifikasi sisa limit plafon kredit toko langganan secara otomatis agar toko tidak kecolongan piutang melebihi batas.',
        howWhere: 'Pilih nama toko langganan di dropdown CRM > jika pembeli ingin kasbon, pilih metode "Tempo / Kasbon" > klik "Selesaikan Transaksi" untuk cetak struk kasir.'
      },
      {
        id: 'pos_shift_close',
        targetSelector: '#tour-pos-shift-btn',
        title: 'Penutupan Shift Kasir & Rekonsiliasi Kas',
        icon: '🔒',
        what: 'Tombol "🔒 Tutup Shift Kasir" untuk merekap uang fisik di laci kasir vs total transaksi sistem.',
        why: 'Mencegah selisih uang kas kasir saat pergantian shift pagi/sore antar karyawan.',
        howWhere: 'Di akhir jam kerja kasir: Klik tombol "Tutup Shift Kasir" di kanan atas POS > masukkan hitungan uang fisik tunai > cetak laporan serah terima shift.'
      },
      {
        id: 'invoices_history_reprint',
        targetSelector: '#tour-invoices-table',
        route: '/invoices',
        title: 'Faktur Penjualan & Cetak Ulang Struk',
        icon: '🧾',
        what: 'Daftar seluruh faktur transaksi yang berhasil diproses pada shift kerja Anda.',
        why: 'Memberikan bukti transaksi resmi jika pembeli meminta cetak ulang struk atau ingin memeriksa nomor faktur pembelian.',
        howWhere: 'Buka menu Faktur & Penjualan (/invoices) > cari no. faktur pembeli > klik tombol "🧾 Struk POS" di kolom kanan untuk membuka dan mencetak ulang struk thermal.'
      }
    ]
  });
}
