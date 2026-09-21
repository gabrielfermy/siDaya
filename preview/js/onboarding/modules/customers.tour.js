/**
 * @file customers.tour.js
 * @description Pluggable Tour Module for Pilar 03: CRM & Limit Piutang Pelanggan
 */

if (typeof OnboardingRegistry !== 'undefined') {
  OnboardingRegistry.registerModule({
    id: 'pilar_customers',
    moduleKey: 'customers',
    route: '/customers',
    title: 'CRM & Limit Piutang',
    icon: '👥',
    requiredPermissions: ['customers:manage_credit_limit'],
    isOwnerOnly: false,
    tier: 'STARTER_FREE',
    steps: [
      {
        id: 'crm_add_customer',
        targetSelector: '#tour-crm-add-btn',
        title: 'Pendaftaran Mitra Toko & Warung Baru',
        icon: '👥',
        what: 'Formulir pendaftaran pelanggan grosir, warung binaan, dan restoran langganan toko Anda.',
        why: 'Membangun database pelanggan tetap dan mengaktifkan fitur pencatatan transaksi tempo secara terorganisir.',
        howWhere: 'Klik tombol "+ Tambah Pelanggan" di pojok kanan atas > masukkan nama toko, nama pemilik, nomor WhatsApp aktif, dan alamat pengiriman.'
      },
      {
        id: 'crm_credit_limit',
        targetSelector: '#tour-crm-limit',
        title: 'Plafon Kredit Kasbon & Syarat Pembayaran (TOP)',
        icon: '🛡️',
        what: 'Batas maksimal pinjaman kasbon (plafon kredit) dan batas waktu pembayaran (Term of Payment / TOP) per pelanggan.',
        why: 'Sistem kasir akan otomatis mencegah transaksi kasbon jika toko langganan telah melebihi limit, melindungi toko dari gagal bayar.',
        howWhere: 'Buka menu CRM & Limit Piutang (/customers) > klik tombol Edit pada baris pelanggan > masukkan nominal Plafon Kasbon (misal: Rp 15.000.000) dan Jangka Waktu TOP (misal: 14 hari).'
      }
    ]
  });
}
