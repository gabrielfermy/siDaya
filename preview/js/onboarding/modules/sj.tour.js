/**
 * @file sj.tour.js
 * @description Pluggable Tour Module for Pilar 06: Surat Jalan & Logistik Armada (POD)
 */

if (typeof OnboardingRegistry !== 'undefined') {
  OnboardingRegistry.registerModule({
    id: 'pilar_sj',
    moduleKey: 'sj',
    route: '/sj',
    title: 'Surat Jalan (POD) & Logistik',
    icon: '🚚',
    requiredPermissions: ['logistics:issue_surat_jalan', 'logistics:sign_pod'],
    isOwnerOnly: false,
    tier: 'STARTER_FREE',
    steps: [
      {
        id: 'sj_create_manifest',
        targetSelector: '#tour-sj-create-btn',
        title: 'Penerbitan Surat Jalan Armada Logistik',
        icon: '📝',
        requiredPermission: 'logistics:issue_surat_jalan',
        what: 'Formulir pembuatan manifest pengiriman barang keluar untuk supir armada pengantaran toko.',
        why: 'Menjamin supir membawa manifest resmi dengan nomor referensi pesanan dan alamat tujuan tanpa membeberkan harga modal finansial.',
        howWhere: 'Saat barang siap dikirim ke pembeli: Buka menu Surat Jalan (POD) (/sj) > klik "+ Buat Surat Jalan Baru" > masukkan nama supir, plat nomor kendaraan, tujuan toko, dan rincian muatan karung/bal.'
      },
      {
        id: 'sj_driver_manifest',
        targetSelector: '#tour-sj-table',
        title: 'Daftar Pengantaran & Rincian Muatan Supir',
        icon: '🚚',
        requiredPermission: 'logistics:sign_pod',
        what: 'Daftar tugas pengiriman barang yang ditugaskan kepada supir armada pada hari ini.',
        why: 'Memberikan panduan jelas mengenai rute pengantaran, nama penerima, dan jumlah karung/bal yang harus diantar.',
        howWhere: 'Buka menu Surat Jalan (POD) (/sj) di perangkat HP sebelum berangkat > periksa nama toko tujuan, no HP pelanggan, dan pastikan muatan di mobil cocok dengan manifest.'
      },
      {
        id: 'sj_pod_signature',
        targetSelector: '#tour-sj-sign-btn',
        title: 'Tanda Tangan Digital Proof of Delivery (POD)',
        icon: '✍️',
        requiredPermission: 'logistics:sign_pod',
        what: 'Kanvas tanda tangan digital pada layar HP untuk serah terima barang di lokasi toko pembeli.',
        why: 'Menjadi bukti hukum sah bahwa pesanan telah diterima lengkap oleh pelanggan tanpa perselisihan muatan kurang di kemudian hari.',
        howWhere: 'Saat tiba di toko pembeli dan barang telah diturunkan: Klik tombol "✍️ Tanda Tangani POD" pada baris surat jalan > minta pemilik/staf toko menandatangani di layar HP > klik "Simpan Serah Terima".'
      }
    ]
  });
}
