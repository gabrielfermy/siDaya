/**
 * @file katalog.tour.js
 * @description Pluggable Tour Module for Pilar 02: Master SKU, Katalog & HPP Protection
 */

if (typeof OnboardingRegistry !== 'undefined') {
  OnboardingRegistry.registerModule({
    id: 'pilar_katalog',
    moduleKey: 'katalog',
    route: '/katalog',
    title: 'Master SKU & Harga Grosir',
    icon: '🏷️',
    requiredPermissions: ['catalog:view_cogs', 'catalog:manage_prices', 'inventory:inbound'],
    isOwnerOnly: false,
    tier: 'STARTER_FREE',
    steps: [
      {
        id: 'catalog_actions_import',
        targetSelector: '#tour-catalog-actions',
        title: 'Pendaftaran SKU & Impor Massal CSV',
        icon: '📥',
        requiredPermission: 'catalog:manage_prices',
        what: 'Pusat pendaftaran komoditas barang dagangan, kode barcode, dan satuan jual dasar (Karung/Bal/Pcs).',
        why: 'Menjadi basis data utama yang otomatis muncul di terminal Kasir POS dan modul FIFO Gudang.',
        howWhere: 'Untuk memasukkan banyak barang sekaligus: Klik tombol "Unduh Template CSV" > isi daftar barang di Excel > klik "Impor Massal CSV". Untuk input satu per satu: Klik tombol "+ Tambah Produk SKU".'
      },
      {
        id: 'catalog_table_browse',
        targetSelector: '#tour-catalog-table',
        title: 'Direktori Stok & Mutasi Master SKU',
        icon: '📋',
        what: 'Daftar seluruh komoditas terdaftar lengkap dengan kode barcode, satuan, harga jual, dan sisa stok fisik.',
        why: 'Memudahkan pengecekan ketersediaan stok fisik sebelum barang dipindahkan atau ditawarkan ke pembeli.',
        howWhere: 'Gunakan kolom pencarian SKU di tabel untuk mencari barang berdasarkan barcode atau nama. Klik tombol "Edit" di baris barang untuk mengubah harga jual grosir.'
      },
      {
        id: 'catalog_cogs_guard',
        targetSelector: '#tour-catalog-cogs',
        title: 'Proteksi Modal COGS (HPP Private)',
        icon: '🔒',
        requiredPermission: 'catalog:view_cogs',
        what: 'Kolom harga modal supplier yang dilindungi dengan tanda gembok privasi ("🔒 Private").',
        why: 'Staf kasir atau gudang tidak dapat melihat harga modal supplier Anda saat bertransaksi di POS, menjaga kerahasiaan margin toko.',
        howWhere: 'Masukkan modal HPP riil saat tambah produk agar margin laba terhitung akurat. Untuk memverifikasi batasan akses staf: Buka menu Staf & Hak Akses (/users) > pastikan izin "Lihat COGS" tidak dicentang untuk akun kasir biasa.'
      }
    ]
  });
}
