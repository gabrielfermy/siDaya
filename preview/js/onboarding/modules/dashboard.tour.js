/**
 * @file dashboard.tour.js
 * @description Pluggable Tour Module for Pilar 01: Executive Dashboard
 */

if (typeof OnboardingRegistry !== 'undefined') {
  OnboardingRegistry.registerModule({
    id: 'pilar_dashboard',
    moduleKey: 'dashboard',
    route: '/dashboard',
    title: 'Executive Dashboard & Omset',
    icon: '📊',
    requiredPermissions: ['finance:reports'],
    isOwnerOnly: false,
    tier: 'STARTER_FREE',
    steps: [
      {
        id: 'kpi_omset',
        targetSelector: '#tour-kpi-omset',
        title: 'Total Omset Penjualan Harian',
        icon: '💵',
        what: 'Akumulasi seluruh nilai transaksi penjualan kotor yang dibukukan oleh terminal kasir POS dan faktur tempo hari ini.',
        why: 'Menjadi tolok ukur utama pergerakan omset harian dan kesehatan likuiditas toko Anda secara real-time.',
        howWhere: 'Transaksi kasir POS otomatis memperbarui angka ini. Untuk mengunduh rekap laporan penjualan harian, klik tombol "Unduh Rekap CSV" di kanan atas Dashboard atau buka menu Faktur & Penjualan (/invoices).'
      },
      {
        id: 'kpi_margin',
        targetSelector: '#tour-kpi-margin',
        title: 'Estimasi Margin & Laba Kotor Toko',
        icon: '📈',
        what: 'Selisih nominal dan persentase keuntungan antara harga jual grosir dengan harga pokok pembelian (HPP/COGS) dari supplier.',
        why: 'Memastikan bisnis Anda untung sehat secara riil, bukan sekadar omset tinggi namun modal bocor tergerus diskon berlebih.',
        howWhere: 'Dihitung otomatis dari (Harga Jual - Modal HPP). Untuk mengatur margin keuntungan & diskon kuantiti bertingkat: Buka menu Master SKU & Harga (/katalog) > pilih produk > klik Edit > sesuaikan harga jual atau diskon kuantiti.'
      },
      {
        id: 'kpi_piutang',
        targetSelector: '#tour-kpi-piutang',
        title: 'Total Piutang Toko Belum Lunas',
        icon: '⏳',
        what: 'Akumulasi total saldo kasbon/tempo milik seluruh warung dan toko langganan binaan yang belum dibayarkan.',
        why: 'Menjaga arus kas operasional toko agar modal tidak macet tertahan terlalu lama di mitra grosir.',
        howWhere: 'Untuk melihat daftar toko yang menunggak dan menagih secara instan: Buka menu Buku Piutang & WA (/piutang) > klik tombol hijau "💬 Kirim WA PayLink" pada baris tagihan pelanggan.'
      },
      {
        id: 'dashboard_checklist',
        targetSelector: '#tour-dashboard-checklist',
        title: 'Panduan Penyiapan Sistem Toko',
        icon: '🚀',
        what: 'Checklist 4 langkah terarah untuk memastikan seluruh fitur kasir, FIFO gudang, CRM, dan rekening bank toko siap beroperasi 100%.',
        why: 'Membantu pemilik toko baru mengonfigurasi data master tanpa kebingungan alur kerja.',
        howWhere: 'Selesaikan 4 langkah berurutan dengan mengeklik tombol CTA: (1) SKU > Menu Katalog, (2) Inbound FIFO > Menu Gudang, (3) CRM > Menu Pelanggan, (4) Rekening Bank > Menu Pengaturan Toko.'
      }
    ]
  });
}
