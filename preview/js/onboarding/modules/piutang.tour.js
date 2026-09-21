/**
 * @file piutang.tour.js
 * @description Pluggable Tour Module for Pilar 07: Buku Piutang & Penagihan WhatsApp PayLink
 */

if (typeof OnboardingRegistry !== 'undefined') {
  OnboardingRegistry.registerModule({
    id: 'pilar_piutang',
    moduleKey: 'piutang',
    route: '/piutang',
    title: 'Buku Piutang & WA PayLink',
    icon: '💬',
    requiredPermissions: ['finance:reports'],
    isOwnerOnly: false,
    tier: 'STARTER_FREE',
    steps: [
      {
        id: 'piutang_aging_buckets',
        targetSelector: '#tour-piutang-aging',
        title: 'Kelompok Umur Piutang (Aging Buckets)',
        icon: '📊',
        what: 'Klasifikasi penuaan tagihan kasbon: 0-7 hari (Lancar), 8-14 hari (Jatuh Tempo), 15-30 hari (Menunggak), dan >30 hari (Macet).',
        why: 'Memetakan risiko kredit macet sedini mungkin agar arus kas dan likuiditas modal kerja toko tetap sehat.',
        howWhere: 'Pantau kotak kuning (8-14 hari) dan merah (>15 hari) secara rutin untuk memprioritaskan toko mana yang harus segera ditagih.'
      },
      {
        id: 'piutang_wa_paylink',
        targetSelector: '#tour-piutang-wa-btn',
        title: 'Penagihan Cepat via WhatsApp PayLink',
        icon: '💬',
        what: 'Pengiriman pesan penagihan otomatis ke WhatsApp pelanggan berisikan rincian faktur resmi & tautan bayar online QRIS / Virtual Account.',
        why: 'Pelanggan dapat langsung membayar lewat HP tanpa perlu kasir menagih secara manual dan berulang kali.',
        howWhere: 'Buka menu Buku Piutang & WA (/piutang) > cari tagihan pelanggan > klik tombol hijau "💬 Kirim WA PayLink" > pesan WhatsApp terisi otomatis lengkap dengan rincian total dan link bayar.'
      },
      {
        id: 'invoices_csv_export',
        targetSelector: '#tour-piutang-export-btn',
        title: 'Ekspor Rekapitulasi Kasbon & Pembukuan CSV',
        icon: '📥',
        what: 'Fitur pengunduhan seluruh riwayat piutang kasbon ke dalam file format spreadsheet CSV/Excel.',
        why: 'Memudahkan akuntan atau pemilik toko melakukan rekonsiliasi kas masuk bulanan di Microsoft Excel.',
        howWhere: 'Klik tombol "📥 Export Rekap Kasbon" di sudut kanan atas menu Buku Piutang untuk mengunduh rekapitulasi data.'
      }
    ]
  });
}
