/**
 * @file settings.tour.js
 * @description Pluggable Tour Module for Pilar 09: Pengaturan Toko, Domain & Hardware
 */

if (typeof OnboardingRegistry !== 'undefined') {
  OnboardingRegistry.registerModule({
    id: 'pilar_settings',
    moduleKey: 'settings',
    route: '/settings',
    title: 'Pengaturan Toko & Hardware',
    icon: '⚙️',
    requiredPermissions: ['settings:manage'],
    isOwnerOnly: true,
    tier: 'STARTER_FREE',
    steps: [
      {
        id: 'settings_bank_identity',
        targetSelector: '#tour-settings-bank',
        title: 'Rekening Bank Resmi Kop Faktur & Usaha',
        icon: '🏦',
        what: 'Data rekening bank perusahaan (Bank, Nomor Rekening, Atas Nama) dan profil legalitas toko Anda.',
        why: 'Informasi ini otomatis dicetak pada bagian kop Faktur Penjualan, Invoice Kasbon, dan Surat Jalan sebagai rujukan transfer resmi pelanggan grosir.',
        howWhere: 'Buka menu Pengaturan Toko (/settings) > scroll ke bagian "Rekening Bank Resmi" > masukkan nama bank, no rekening, dan nama pemilik rekening > klik tombol "💾 Simpan Pengaturan".'
      },
      {
        id: 'settings_subdomain_domain',
        targetSelector: '#tour-settings-subdomain',
        title: 'Alamat Web Subdomain & Domain Kustom',
        icon: '🌐',
        what: 'Alamat link website mandiri toko Anda untuk akses staf dan tautan WhatsApp PayLink pelanggan.',
        why: 'Memberikan identitas branding profesional toko grosir Anda di hadapan para mitra dan pembeli.',
        howWhere: 'Anda dapat mengubah nama subdomain di menu Pengaturan Toko dengan proteksi alias 30 hari, atau menghubungkan domain kustom Anda sendiri (misal: pos.namatoko.com).'
      }
    ]
  });
}
