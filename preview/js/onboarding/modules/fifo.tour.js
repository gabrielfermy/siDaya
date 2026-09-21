/**
 * @file fifo.tour.js
 * @description Pluggable Tour Module for Pilar 02: Inbound Lot FIFO & Batch Tracking
 */

if (typeof OnboardingRegistry !== 'undefined') {
  OnboardingRegistry.registerModule({
    id: 'pilar_fifo',
    moduleKey: 'fifo',
    route: '/fifo',
    title: 'Gudang FIFO & Inbound Lot',
    icon: '📦',
    requiredPermissions: ['inventory:inbound', 'inventory:stock_opname'],
    isOwnerOnly: false,
    tier: 'STARTER_FREE',
    steps: [
      {
        id: 'fifo_inbound_receive',
        targetSelector: '#tour-fifo-inbound-btn',
        title: 'Penerimaan Muatan Inbound Lot & Rak',
        icon: '📥',
        what: 'Pencatatan kedatangan muatan barang dari distributor/supplier dengan nomor lot batch, tanggal masuk, dan alokasi rak bin gudang.',
        why: 'Menambah stok fisik toko secara resmi dan mengunci modal serta nomor batch untuk audit First-In First-Out (FIFO).',
        howWhere: 'Saat truk distributor tiba di gudang: Buka menu Inbound Lot FIFO (/fifo) > klik "📥 Terima Muatan Masuk" > pilih SKU barang > masukkan nomor surat jalan supplier, jumlah barang masuk, dan pilih lokasi rak gudang.'
      },
      {
        id: 'fifo_batch_table',
        targetSelector: '#tour-fifo-table',
        title: 'Tabel Monitoring Umur Lot & Sisa Stok Fisik',
        icon: '🏭',
        what: 'Daftar seluruh lot barang aktif di gudang beserta status kesegaran stok dan sisa kuantiti.',
        why: 'Memberikan visibilitas sisa karung/bal per tumpukan rak secara real-time untuk mencegah penumpukan barang lama di belakang.',
        howWhere: 'Pantau kolom "Sisa Stok" dan "Tgl Masuk" di tabel Inbound untuk menentukan tumpukan mana yang harus dipindahkan ke area depan kasir.'
      },
      {
        id: 'fifo_simulator',
        targetSelector: '#tour-fifo-simulator',
        title: 'Simulator Alokasi Otomatis FIFO',
        icon: '🧪',
        what: 'Mesin simulasi visual pengeluaran stok otomatis yang selalu memprioritaskan lot barang yang masuk paling awal.',
        why: 'Memberikan transparansi alokasi stok dan mencegah barang lama kadaluarsa atau rusak di gudang.',
        howWhere: 'Pilih komoditas di dropdown simulator > masukkan simulasi jumlah penjualan kasir > lihat bagaimana sistem secara otomatis memotong stok dari lot tertua terlebih dahulu.'
      }
    ]
  });
}
