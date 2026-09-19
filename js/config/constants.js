/**
 * @file constants.js
 * @description Global presets, session security thresholds, and account presets
 * @module Config:Constants
 */

const SESSION_CONFIG = {
  /** Session Time-To-Live in milliseconds (30 minutes) */
  SESSION_TTL_MS: 30 * 60 * 1000,
  /** Inactivity poll check frequency (15 seconds) */
  IDLE_CHECK_INTERVAL_MS: 15 * 1000,
  /** Storage keys */
  KEY_MERCHANT_SESSION: 'sidaya_merchant_session',
  KEY_OPERATOR_SESSION: 'sidaya_operator_session',
  KEY_INTENDED_PATH: 'sidaya_intended_path',
  KEY_SESSION_EXPIRED_FLAG: 'sidaya_session_expired_flag',
  KEY_IMPERSONATION_SESSION: 'sidaya_impersonation_session',
};

const RESERVED_SUBDOMAINS = [
  'ops', 'admin', 'api', 'auth', 'app', 'www', 'billing', 'support',
  'status', 'mail', 'gateway', 'portal', 'staging', 'prod', 'dev', 'static', 'assets'
];

const MERCHANT_ACCOUNTS = {
  'budi@berasjaya.com': { email: 'budi@berasjaya.com', password: 'Password123!', name: 'Budi Santoso', role: '👑 OWNER', roleLabel: 'Owner / Billing POC', avatar: 'B', tenantName: 'Toko Grosir Beras Jaya Bersama', subdomain: 'berasjaya' },
  'siti@berasjaya.com': { email: 'siti@berasjaya.com', password: 'Password123!', name: 'Siti Rahma', role: '💳 KASIR (POS)', roleLabel: 'Kasir Grosir (POS)', avatar: 'S', tenantName: 'Toko Grosir Beras Jaya Bersama', subdomain: 'berasjaya' },
  'agus@berasjaya.com': { email: 'agus@berasjaya.com', password: 'Password123!', name: 'Agus Santoso', role: '📦 GUDANG (FIFO)', roleLabel: 'Gudang & Batch FIFO', avatar: 'A', tenantName: 'Toko Grosir Beras Jaya Bersama', subdomain: 'berasjaya' },
  'joko@berasjaya.com': { email: 'joko@berasjaya.com', password: 'Password123!', name: 'Joko Supir', role: '🚚 DRIVER', roleLabel: 'Driver Logistik (POD)', avatar: 'J', tenantName: 'Toko Grosir Beras Jaya Bersama', subdomain: 'berasjaya' },
};

const OPERATOR_ACCOUNTS = {
  'gabriel@ashvinlabs.com': { email: 'gabriel@ashvinlabs.com', password: 'Password123!', name: 'Gabriel (CEO)', role: 'SUPER_ADMIN', roleName: 'Super Admin', badgeClass: 'role-super-admin' },
  'alex@ashvinlabs.com': { email: 'alex@ashvinlabs.com', password: 'Password123!', name: 'Alex (Lead Developer)', role: 'DEV_ENGINEER', roleName: 'Dev Engineer', badgeClass: 'role-dev-engineer' },
  'dina@ashvinlabs.com': { email: 'dina@ashvinlabs.com', password: 'Password123!', name: 'Dina (Customer Ops)', role: 'OPS_SUPPORT', roleName: 'Ops Support', badgeClass: 'role-ops-support' },
};

const MERCHANT_PRESETS = MERCHANT_ACCOUNTS;
const OPERATOR_PRESETS = OPERATOR_ACCOUNTS;

const GOOGLE_PRESET_ACCOUNTS = [
  { name: 'Budi Santoso', email: 'budi@berasjaya.com', avatar: 'B', googleEmail: 'budi.santoso@gmail.com', desc: 'Pemilik Toko Grosir Beras Jaya (Terdaftar)' },
  { name: 'Siti Rahma', email: 'siti@berasjaya.com', avatar: 'S', googleEmail: 'siti.rahma99@gmail.com', desc: 'Kasir Beras Jaya (Terdaftar)' },
  { name: 'Hendro Purnomo', email: 'hendro@berasmakmur.com', avatar: 'H', googleEmail: 'hendro.purnomo@gmail.com', desc: 'Calon Mitra Baru (Belum Terdaftar)' },
];

const STAFF_CAPABILITIES = [
  { group: 'Kasir & Transaksi POS', key: 'pos:checkout', label: 'Eksekusi Checkout Kasir POS', desc: 'Membuka transaksi penjualan dan menerima kasir' },
  { group: 'Kasir & Transaksi POS', key: 'pos:void_item', label: 'Batalkan / Void Transaksi', desc: 'Menghapus barang dari transaksi yang sudah dicetak' },
  { group: 'Kasir & Transaksi POS', key: 'pos:open_cash_drawer', label: 'Buka Laci Kasir Manual (No-Sale)', desc: 'Memicu pembuka laci kasir tanpa transaksi' },
  { group: 'Katalog & Harga (Sensitif)', key: 'catalog:view_cogs', label: 'Lihat Harga Pokok Modal (COGS)', desc: 'Privasi modal beli asli dari supplier (Sangat Rahasia)' },
  { group: 'Katalog & Harga (Sensitif)', key: 'catalog:manage_prices', label: 'Ubah Harga Jual & Diskon Grosir', desc: 'Menetapkan harga bertingkat grosir per SKU' },
  { group: 'Gudang & Inventori FIFO', key: 'inventory:inbound', label: 'Terima Muatan Masuk Gudang (Inbound FIFO)', desc: 'Mencatat lot masuk dan mencetak label pallet' },
  { group: 'Gudang & Inventori FIFO', key: 'inventory:stock_opname', label: 'Penyesuaian & Opname Stok Gudang', desc: 'Mengubah kuantitas fisik inventaris gudang' },
  { group: 'Pelanggan & Piutang', key: 'customers:manage_credit_limit', label: 'Atur Plafon & Tempo Kasbon Pelanggan', desc: 'Menetapkan batas piutang dan syarat tempo (TOP)' },
  { group: 'Logistik & Surat Jalan', key: 'logistics:issue_surat_jalan', label: 'Terbitkan Surat Jalan (SJ)', desc: 'Menerbitkan manifest kirim armada logistik' },
  { group: 'Logistik & Surat Jalan', key: 'logistics:sign_pod', label: 'Tanda Tangani Bukti Serah Terima (POD)', desc: 'Mengonfirmasi serah terima barang (POD digital)' },
  { group: 'Keuangan & Pengaturan', key: 'finance:reports', label: 'Akses Laporan Laba Rugi (P&L)', desc: 'Melihat kalkulasi laba kotor & omset global' },
  { group: 'Keuangan & Pengaturan', key: 'settings:manage', label: 'Konfigurasi Toko & Hardware', desc: 'Mengubah identitas toko dan printer thermal' },
];

const STAFF_PRESETS = {
  CASHIER: {
    label: 'Kasir Toko (POS)',
    permissions: ['pos:checkout', 'pos:open_cash_drawer'],
  },
  WAREHOUSE: {
    label: 'Kepala Gudang & FIFO',
    permissions: ['inventory:inbound', 'inventory:stock_opname', 'logistics:issue_surat_jalan'],
  },
  DRIVER: {
    label: 'Supir Logistik (POD)',
    permissions: ['logistics:sign_pod'],
  },
  MANAGER: {
    label: 'Manajer Operasional',
    permissions: ['pos:checkout', 'pos:void_item', 'catalog:manage_prices', 'inventory:inbound', 'inventory:stock_opname', 'customers:manage_credit_limit', 'logistics:issue_surat_jalan', 'finance:reports'],
  },
  CUSTOM: {
    label: 'Kustom (Pilih Bebas)',
    permissions: [],
  }
};

