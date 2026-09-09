/**
 * Canonical Permission Keys for SiDaya Platform
 * Used for granular staff access control via the Owner Checkbox Matrix.
 */
export enum PermissionKey {
  // Point of Sale (POS)
  POS_CHECKOUT = 'pos:checkout',
  POS_VOID = 'pos:void',
  POS_APPLY_DISCOUNT = 'pos:apply_discount',

  // Shifts & Cash Drawer
  SHIFTS_OPERATE = 'shifts:operate',
  SHIFTS_RECONCILE = 'shifts:reconcile',

  // Catalog & Pricing
  CATALOG_VIEW = 'catalog:view',
  CATALOG_MANAGE = 'catalog:manage',
  CATALOG_VIEW_COGS = 'catalog:view_cogs', // Critical: controls visibility of cost_price & profit margins

  // Warehouse & Stock
  WAREHOUSE_INBOUND = 'warehouse:inbound',
  WAREHOUSE_ADJUST = 'warehouse:adjust',
  WAREHOUSE_FIFO = 'warehouse:fifo',

  // Logistics & Surat Jalan
  LOGISTICS_DISPATCH = 'logistics:dispatch',
  LOGISTICS_DRIVER_VIEW = 'logistics:driver_view',

  // Finance & Kasbon
  FINANCE_PIUTANG_VIEW = 'finance:piutang_view',
  FINANCE_PIUTANG_SETTLE = 'finance:piutang_settle',
  FINANCE_REPORTS = 'finance:reports',

  // Staff & Settings
  STAFF_MANAGE = 'staff:manage',
  SETTINGS_MANAGE = 'settings:manage',
}

/**
 * Human-readable metadata for rendering the Owner Checkbox Matrix UI
 */
export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  module: string;
  isSecurityCritical?: boolean;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Point of Sale (POS)
  {
    key: PermissionKey.POS_CHECKOUT,
    label: 'Transaksi Penjualan & Kasir',
    description: 'Memproses order penjualan, scan barcode, hitung diskon grosir, dan kirim PayLink',
    module: 'Point of Sale (POS)',
  },
  {
    key: PermissionKey.POS_VOID,
    label: 'Batal / Void Transaksi',
    description: 'Membatalkan nota atau pesanan yang sudah dibayar',
    module: 'Point of Sale (POS)',
    isSecurityCritical: true,
  },
  {
    key: PermissionKey.POS_APPLY_DISCOUNT,
    label: 'Diskon Manual / Potongan Khusus',
    description: 'Memberikan potongan harga manual di luar tier grosir otomatis',
    module: 'Point of Sale (POS)',
  },

  // Shifts & Cash Drawer
  {
    key: PermissionKey.SHIFTS_OPERATE,
    label: 'Buka / Tutup Kasir (Shift Float)',
    description: 'Memasukkan modal awal laci kasir dan mencatat kas keluar (cash drop)',
    module: 'Shift & Laci Kas',
  },
  {
    key: PermissionKey.SHIFTS_RECONCILE,
    label: 'Rekonsiliasi Kas (Laporan Z)',
    description: 'Menghitung fisik uang laci dan mencetak laporan penutupan shift (Z-Report)',
    module: 'Shift & Laci Kas',
    isSecurityCritical: true,
  },

  // Catalog & Pricing
  {
    key: PermissionKey.CATALOG_VIEW,
    label: 'Lihat Daftar Produk & Harga Jual',
    description: 'Melihat katalog barang, stok berjalan, dan harga eceran/grosir',
    module: 'Katalog & Harga',
  },
  {
    key: PermissionKey.CATALOG_MANAGE,
    label: 'Tambah / Edit Produk & Harga Grosir',
    description: 'Menambah barang baru, mengubah harga grosir, dan mengatur konversi satuan',
    module: 'Katalog & Harga',
  },
  {
    key: PermissionKey.CATALOG_VIEW_COGS,
    label: 'LIHAT HARGA MODAL (COGS / Margin)',
    description: 'Melihat harga beli supplier dan estimasi margin keuntungan toko',
    module: 'Katalog & Harga',
    isSecurityCritical: true,
  },

  // Warehouse & Stock
  {
    key: PermissionKey.WAREHOUSE_INBOUND,
    label: 'Penerimaan Barang Masuk (Inbound PO)',
    description: 'Menerima pasokan dari supplier truk, cek quantity fisik, dan alokasi rak/bin',
    module: 'Gudang & Stok',
  },
  {
    key: PermissionKey.WAREHOUSE_ADJUST,
    label: 'Penyesuaian Stok / Opname Fisik',
    description: 'Menyesuaikan selisih stok fisik vs sistem (Stock Opname)',
    module: 'Gudang & Stok',
    isSecurityCritical: true,
  },
  {
    key: PermissionKey.WAREHOUSE_FIFO,
    label: 'Manajemen Lot / Batch FIFO Kadaluarsa',
    description: 'Mengatur alokasi batch tertua dan memantau usia barang komoditas',
    module: 'Gudang & Stok',
  },

  // Logistics & Surat Jalan
  {
    key: PermissionKey.LOGISTICS_DISPATCH,
    label: 'Buat & Cetak Surat Jalan (Dot Matrix/PDF)',
    description: 'Menerbitkan delivery order untuk supir dan armada pengiriman',
    module: 'Logistik & Pengiriman',
  },
  {
    key: PermissionKey.LOGISTICS_DRIVER_VIEW,
    label: 'Akses Kurir / Supir (Manifest Tanpa Harga)',
    description: 'Melihat daftar muatan yang harus diantar dan minta tanda tangan penerima',
    module: 'Logistik & Pengiriman',
  },

  // Finance & Kasbon
  {
    key: PermissionKey.FINANCE_PIUTANG_VIEW,
    label: 'Lihat Buku Piutang & Kasbon Pelanggan',
    description: 'Melihat daftar hutang pelanggan dan jatuh tempo tagihan',
    module: 'Keuangan & Piutang',
  },
  {
    key: PermissionKey.FINANCE_PIUTANG_SETTLE,
    label: 'Catat Pembayaran Cicilan / Pelunasan',
    description: 'Menerima pembayaran tunai/transfer untuk pelunasan nota kasbon',
    module: 'Keuangan & Piutang',
  },
  {
    key: PermissionKey.FINANCE_REPORTS,
    label: 'Laporan Omzet, Keuangan & Laba Rugi',
    description: 'Melihat grafik pendapatan harian, rekapitulasi penjualan, dan performa cabang',
    module: 'Keuangan & Piutang',
    isSecurityCritical: true,
  },

  // Staff & Settings
  {
    key: PermissionKey.STAFF_MANAGE,
    label: 'Kelola Staf & Atur Hak Akses',
    description: 'Menambah kasir, mengubah PIN karyawan, dan mencentang checkbox hak akses',
    module: 'Pengaturan & Staf',
    isSecurityCritical: true,
  },
  {
    key: PermissionKey.SETTINGS_MANAGE,
    label: 'Pengaturan Toko & Printer',
    description: 'Mengatur printer thermal/dot matrix, profil usaha, dan cabang',
    module: 'Pengaturan & Staf',
  },
];

/**
 * Default Checkbox Presets for Standard Roles
 */
export const DEFAULT_ROLE_PERMISSION_PRESETS: Record<string, PermissionKey[]> = {
  OWNER: Object.values(PermissionKey), // 100% permissions
  STORE_MANAGER: [
    PermissionKey.POS_CHECKOUT,
    PermissionKey.POS_VOID,
    PermissionKey.POS_APPLY_DISCOUNT,
    PermissionKey.SHIFTS_OPERATE,
    PermissionKey.SHIFTS_RECONCILE,
    PermissionKey.CATALOG_VIEW,
    PermissionKey.CATALOG_MANAGE,
    PermissionKey.CATALOG_VIEW_COGS,
    PermissionKey.WAREHOUSE_INBOUND,
    PermissionKey.WAREHOUSE_ADJUST,
    PermissionKey.WAREHOUSE_FIFO,
    PermissionKey.LOGISTICS_DISPATCH,
    PermissionKey.FINANCE_PIUTANG_VIEW,
    PermissionKey.FINANCE_PIUTANG_SETTLE,
    PermissionKey.FINANCE_REPORTS,
    PermissionKey.SETTINGS_MANAGE,
  ],
  CASHIER: [
    PermissionKey.POS_CHECKOUT,
    PermissionKey.POS_APPLY_DISCOUNT,
    PermissionKey.SHIFTS_OPERATE,
    PermissionKey.CATALOG_VIEW,
    PermissionKey.FINANCE_PIUTANG_VIEW,
  ],
  WAREHOUSE: [
    PermissionKey.CATALOG_VIEW,
    PermissionKey.WAREHOUSE_INBOUND,
    PermissionKey.WAREHOUSE_ADJUST,
    PermissionKey.WAREHOUSE_FIFO,
    PermissionKey.LOGISTICS_DISPATCH,
  ],
  SALESMAN: [
    PermissionKey.POS_CHECKOUT,
    PermissionKey.CATALOG_VIEW,
    PermissionKey.FINANCE_PIUTANG_VIEW,
  ],
  DRIVER: [
    PermissionKey.LOGISTICS_DRIVER_VIEW,
  ],
};
