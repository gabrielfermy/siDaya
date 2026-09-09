/**
 * ==========================================================================
 * INITIAL STATE DEFINITION (ENTERPRISE MULTI-TENANT OS)
 * ==========================================================================
 */
const INITIAL_DEFAULT_STATE = {
  version: 3,
  ui: {
    theme: 'light',
    portalMode: 'MERCHANT',
    activePath: 'dashboard',
    sidebarOpen: false,
    activeModal: null,
  },
  auth: {
    merchantUser: {
      email: 'budi@berasjaya.com',
      name: 'Budi Santoso',
      role: '👑 OWNER',
      avatar: 'B',
      tenant: 'Toko Grosir Beras Jaya Bersama'
    },
    operatorUser: {
      email: 'gabriel@ashvinlabs.com',
      name: 'Gabriel (CEO)',
      role: 'SUPER_ADMIN',
      badgeClass: 'role-super-admin'
    }
  },
  catalog: [
    { sku: 'RJL-50KG', barcode: '8991001001011', name: 'Beras Rojolele 50KG', category: 'Beras', unit: 'Karung', costPrice: 560000, price: 617500, icon: '🌾' },
    { sku: 'MGO-2L', barcode: '8992002002022', name: 'Minyak Goreng 2L', category: 'Minyak', unit: 'Pouch', costPrice: 82000, price: 91500, icon: '🌻' },
    { sku: 'GUL-1KG', barcode: '8993003003033', name: 'Gula Pasir Kristal 1KG', category: 'Gula', unit: 'Bungkus', costPrice: 16200, price: 18500, icon: '🍚' },
    { sku: 'TRG-25KG', barcode: '8994004004044', name: 'Tepung Terigu Segitiga 25KG', category: 'Tepung', unit: 'Sak', costPrice: 215000, price: 235000, icon: '🍞' }
  ],
  inventoryLots: [
    { id: 'LOT-RJL-2026-0828', sku: 'RJL-50KG', qtyInitial: 40, qtyRemaining: 40, unitCost: 560000, receivedDate: '28 Agu 2026', supplier: 'PT Lumbung Padi Soloraya', isOldest: true },
    { id: 'LOT-RJL-2026-0906', sku: 'RJL-50KG', qtyInitial: 100, qtyRemaining: 100, unitCost: 575000, receivedDate: '06 Sep 2026', supplier: 'Koperasi Tani Makmur', isOldest: false },
    { id: 'LOT-MGO-2026-0830', sku: 'MGO-2L', qtyInitial: 360, qtyRemaining: 360, unitCost: 82000, receivedDate: '30 Agu 2026', supplier: 'PT Wilmar Agro', isOldest: true },
    { id: 'LOT-GUL-2026-0901', sku: 'GUL-1KG', qtyInitial: 250, qtyRemaining: 250, unitCost: 16200, receivedDate: '01 Sep 2026', supplier: 'PG Madukismo', isOldest: true },
    { id: 'LOT-TRG-2026-0902', sku: 'TRG-25KG', qtyInitial: 80, qtyRemaining: 80, unitCost: 215000, receivedDate: '02 Sep 2026', supplier: 'PT Bogasari Flour Mills', isOldest: true }
  ],
  cart: [
    { sku: 'RJL-50KG', name: 'Beras Rojolele 50KG', unitPrice: 617500, qty: 20, subtotal: 12350000 }
  ],
  sales: [
    {
      id: 'INV-20260908-001',
      createdAt: '08 Sep 2026 14:30',
      customer: 'Pak Haji Rahmat',
      totalAmount: 12350000,
      paymentMethod: 'TUNAI',
      status: 'SELESAI',
      items: [{ sku: 'RJL-50KG', name: 'Beras Rojolele 50KG', qty: 20, unitPrice: 617500 }],
      allocations: [{ lotId: 'LOT-RJL-2026-0828', qty: 20, productName: 'Beras Rojolele 50KG', qtyDeducted: 20, qtyRemaining: 20 }]
    }
  ],
  suratJalan: [
    {
      id: 'SJ-20260908-0129',
      invoiceId: 'INV-20260908-001',
      driverName: 'Joko Supir',
      recipientName: 'Pak Haji Rahmat (0812-9876-5432)',
      address: 'Jl. Raya Bogor KM 22, Kramat Jati, Jakarta Timur',
      items: '20 Karung Beras Rojolele 50KG',
      status: 'SIAP_DIKIRIM',
      createdAt: '08 Sep 2026 14:35'
    }
  ],
  piutang: [
    { id: 'PIU-01', invoiceId: 'INV-20260908-001', customer: 'Toko Barokah Jaya', phone: '081298765432', totalAmount: 12350000, remainingAmount: 7350000, dueDate: '15 Sep 2026', status: 'BELUM_LUNAS' },
    { id: 'PIU-02', invoiceId: 'INV-20260906-089', customer: 'Warung Berkah Sembako', phone: '081388776655', totalAmount: 4575000, remainingAmount: 4575000, dueDate: '10 Sep 2026', status: 'JATUH_TEMPO' }
  ],
  customers: [
    { id: 'CUST-001', name: 'Pak Haji Rahmat', storeName: 'Toko Barokah Jaya', phone: '081298765432', address: 'Pasar Kramat Jati Blok C-12, Jakarta Timur', creditLimit: 25000000, currentDebt: 0, totalOrders: 14, totalSpend: 142500000, tier: 'PRIME_WHOLESALE', status: 'ACTIVE' },
    { id: 'CUST-002', name: 'Ibu Hj. Siti Aminah', storeName: 'Warung Berkah Sembako', phone: '081388776655', address: 'Jl. Raya Pasar Minggu No. 45, Jakarta Selatan', creditLimit: 10000000, currentDebt: 4575000, totalOrders: 8, totalSpend: 68200000, tier: 'GROSIR_REGULER', status: 'ACTIVE' },
    { id: 'CUST-003', name: 'Pak Joni Pranata', storeName: 'Toko Sinar Terang', phone: '081288990011', address: 'Pasar Jatinegara Lantai Dasar No. 18, Jakarta Timur', creditLimit: 15000000, currentDebt: 7350000, totalOrders: 11, totalSpend: 95800000, tier: 'GROSIR_REGULER', status: 'ACTIVE' },
    { id: 'CUST-004', name: 'Pak Dedi Mulyadi', storeName: 'Warung Kelontong Rejeki', phone: '081122334455', address: 'Jl. Lapangan Tembak No. 9, Cibubur', creditLimit: 5000000, currentDebt: 0, totalOrders: 5, totalSpend: 31400000, tier: 'WARUNG_CASH', status: 'ACTIVE' }
  ],
  staff: [
    { name: 'Budi Santoso', email: 'budi@berasjaya.com', phone: '081234567890', role: '👑 Owner / Billing POC', status: 'VERIFIED', pinConfigured: true },
    { name: 'Siti Rahma', email: 'siti@berasjaya.com', phone: '081288881111', role: '💳 Kasir Grosir (POS)', status: 'VERIFIED', pinConfigured: true },
    { name: 'Agus Santoso', email: 'agus@berasjaya.com', phone: '081288882222', role: '📦 Gudang & FIFO', status: 'VERIFIED', pinConfigured: true },
    { name: 'Joko Supir', email: 'joko@berasjaya.com', phone: '081288883333', role: '🚚 Driver Logistik', status: 'VERIFIED', pinConfigured: false }
  ],
  rolePermissions: {
    OWNER: ['all'],
    KASIR: ['pos:view_catalog', 'pos:checkout', 'pos:apply_discount', 'shifts:operate', 'shifts:close_z'],
    GUDANG: ['inventory:view_stock', 'inventory:inbound_receive', 'inventory:adjust', 'inventory:opname', 'logistics:dispatch'],
    DRIVER: ['logistics:view_sj', 'logistics:dispatch', 'logistics:sign_pod']
  },
  operator: {
    isPiiMasked: true,
    tenants: [
      { name: 'Toko Grosir Beras Jaya', subdomain: 'berasjaya', rawOwner: 'Budi Santoso (+6281234567890)', maskedOwner: 'B*** S*** (+6281****7890)', tier: 'GROSIR_PRO', status: 'ACTIVE', gmv: 428500000 },
      { name: 'CV Sembako Nusantara', subdomain: 'sembakonusantara', rawOwner: 'Hendro Wijaya (+6281398765432)', maskedOwner: 'H*** W*** (+6281****5432)', tier: 'STARTER_FREE', status: 'ACTIVE', gmv: 184200000 }
    ],
    operators: [
      { name: 'Gabriel (CEO)', email: 'gabriel@ashvinlabs.com', role: 'SUPER_ADMIN', status: 'ACTIVE' },
      { name: 'Alex (Lead Developer)', email: 'alex@ashvinlabs.com', role: 'DEV_ENGINEER', status: 'ACTIVE' },
      { name: 'Dina (Customer Ops)', email: 'dina@ashvinlabs.com', role: 'OPS_SUPPORT', status: 'ACTIVE' }
    ],
    auditLogs: [
      { id: 1, action: 'PLATFORM_INITIALIZATION', actor: 'gabriel@ashvinlabs.com', details: 'Operator initialized multi-tenant clusters', time: '08 Sep 2026 09:00' },
      { id: 2, action: 'TENANT_SUBSCRIPTION_UPDATE', actor: 'gabriel@ashvinlabs.com', details: 'Tenant berasjaya upgraded to GROSIR_PRO', time: '08 Sep 2026 10:15' },
      { id: 3, action: 'OPERATOR_INVITED', actor: 'gabriel@ashvinlabs.com', details: 'Invited maya@ashvinlabs.com (AUDIT_COMPLIANCE)', time: '09 Sep 2026 08:30' }
    ]
  }
};
