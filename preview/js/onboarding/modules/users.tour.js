/**
 * @file users.tour.js
 * @description Pluggable Tour Module for Pilar 08: Manajemen Staf, Hak Akses Langsung & Keamanan PIN
 */

if (typeof OnboardingRegistry !== 'undefined') {
  OnboardingRegistry.registerModule({
    id: 'pilar_users',
    moduleKey: 'users',
    route: '/users',
    title: 'Manajemen Staf & Hak Akses',
    icon: '👤',
    requiredPermissions: ['settings:manage'],
    isOwnerOnly: true,
    tier: 'STARTER_FREE',
    steps: [
      {
        id: 'users_invite_staff',
        targetSelector: '#tour-users-invite-btn',
        title: 'Undangan Staf Baru & Template Izin Cepat',
        icon: '✉️',
        what: 'Formulir penambahan anggota tim kerja toko (Kasir, Bagian Gudang, Supir, Manajer) dengan aktivasi email aman.',
        why: 'Memberikan akses kerja resmi ke karyawan toko Anda tanpa membongkar kata sandi manual.',
        howWhere: 'Klik tombol "➕ Undang Staf Baru" > masukkan nama, jabatan, email > pilih template preset cepat (Kasir POS / Staf Gudang / Supir Logistik / Manajer) > klik Kirim Undangan.'
      },
      {
        id: 'users_direct_permissions',
        targetSelector: '#tour-users-directory',
        title: 'Direktori Staf, Hak Akses Langsung & PIN',
        icon: '🔑',
        what: 'Pengaturan izin individual per staf dan pengaturan PIN kasir untuk otorisasi cepat di POS.',
        why: 'Membatasi wewenang staf (misal: kasir tidak bisa melihat harga modal COGS atau laporan laba rugi) untuk melindungi rahasia bisnis Anda.',
        howWhere: 'Klik tombol "✏️ Edit Akses" di samping nama staf untuk menambah/mengurangi izin secara langsung, atau klik tombol "🔑 PIN" untuk mereset PIN transaksi cepat kasir.'
      }
    ]
  });
}
