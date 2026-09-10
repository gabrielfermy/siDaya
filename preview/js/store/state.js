/**
 * @file state.js
 * @description Decoupled Reactive State Trees for SiDaya Enterprise OS Preview
 * @module Store:State
 */

// 1. Strictly Scoped Tenant (Merchant) State - Zero Operator Data Leakage
const INITIAL_TENANT_STATE = {
  version: 6,
  ui: {
    theme: 'light',
    portalMode: 'MERCHANT',
    activePath: '/dashboard',
    sidebarOpen: false,
    activeModal: null,
  },
  auth: {
    merchantUser: {
      email: 'budi@berasjaya.com',
      name: 'Budi Santoso',
      role: '👑 OWNER',
      avatar: 'B',
      tenant: 'Toko Grosir Beras Jaya Bersama',
      subdomain: 'berasjaya',
    },
    operatorUser: null,
    impersonation: {
      active: false,
      originalOperator: null,
      targetTenant: null,
      targetUser: null,
      ticketRef: null,
      reason: null,
      startedAt: null,
    },
  },

  // Pilar 01: Executive Dashboard State
  pilar1: {
    omsetToday: 42850000,
    grossMarginPercent: 12.8,
    grossMarginNominal: 5484800,
    totalPiutangOutstanding: 11925000,
    cashMixPercent: 65,
    recentOrders: [
      { orderNumber: 'ORD-20260909-001', time: '14:22', customer: 'Toko Barokah Jaya', method: 'CASH', total: 12350000, status: 'PAID' },
      { orderNumber: 'ORD-20260909-002', time: '13:45', customer: 'Warung Berkah Sembako', method: 'PAYLINK_QRIS', total: 4575000, status: 'PAID' },
      { orderNumber: 'ORD-20260909-003', time: '11:10', customer: 'Toko Sinar Terang', method: 'TEMPO_KASBON', total: 7350000, status: 'PENDING' },
      { orderNumber: 'ORD-20260909-004', time: '09:30', customer: 'Warung Rejeki', method: 'CASH', total: 2450000, status: 'PAID' },
    ],
  },

  // Pilar 02: Master SKU, Katalog & Batch FIFO
  pilar2: {
    products: [
      { id: 'p1', sku: 'RJL-50KG', barcode: '8991001001011', name: 'Beras Rojolele Super 50kg', unit: 'Karung', price: 617500, cogs: 560000, stock: 140 },
      { id: 'p2', sku: 'MGO-2L', barcode: '8992002002022', name: 'Minyak Goreng Sawit 2L', unit: 'Pouch', price: 91500, cogs: 82000, stock: 360 },
      { id: 'p3', sku: 'GUL-1KG', barcode: '8993003003033', name: 'Gula Pasir Kristal Putih 1kg', unit: 'Bungkus', price: 18500, cogs: 16200, stock: 250 },
      { id: 'p4', sku: 'TRG-25KG', barcode: '8994004004044', name: 'Tepung Terigu Segitiga 25kg', unit: 'Sak', price: 235000, cogs: 215000, stock: 80 },
    ],
    batches: [
      { id: 'b1', lotNumber: 'LOT-RJL-2026-0828', productName: 'Beras Rojolele Super 50kg', binLabel: 'GUDANG-A / RAK-01', receivedDate: '28 Agu 2026', cogsUnit: 560000, initialQty: 100, remainingQty: 40, status: 'ACTIVE' },
      { id: 'b2', lotNumber: 'LOT-RJL-2026-0906', productName: 'Beras Rojolele Super 50kg', binLabel: 'GUDANG-A / RAK-02', receivedDate: '06 Sep 2026', cogsUnit: 575000, initialQty: 100, remainingQty: 100, status: 'ACTIVE' },
      { id: 'b3', lotNumber: 'LOT-MGO-2026-0830', productName: 'Minyak Goreng Sawit 2L', binLabel: 'GUDANG-B / RAK-01', receivedDate: '30 Agu 2026', cogsUnit: 82000, initialQty: 400, remainingQty: 360, status: 'ACTIVE' },
      { id: 'b4', lotNumber: 'LOT-GUL-2026-0901', productName: 'Gula Pasir Kristal Putih 1kg', binLabel: 'GUDANG-B / RAK-02', receivedDate: '01 Sep 2026', cogsUnit: 16200, initialQty: 300, remainingQty: 250, status: 'ACTIVE' },
    ],
  },

  // Pilar 03: CRM & Credit Limits
  pilar3: {
    customers: [
      { id: 'c1', name: 'Pak Haji Rahmat', storeName: 'Toko Barokah Jaya', phone: '0812-9876-5432', type: 'GROSIR_PRIME', creditLimit: 25000000, usedCredit: 0, topDays: 14, status: 'ACTIVE' },
      { id: 'c2', name: 'Ibu Hj. Siti Aminah', storeName: 'Warung Berkah Sembako', phone: '0813-8877-6655', type: 'GROSIR_REGULER', creditLimit: 10000000, usedCredit: 4575000, topDays: 7, status: 'ACTIVE' },
      { id: 'c3', name: 'Pak Joni Pranata', storeName: 'Toko Sinar Terang', phone: '0812-8899-0011', type: 'GROSIR_REGULER', creditLimit: 15000000, usedCredit: 7350000, topDays: 14, status: 'ACTIVE' },
      { id: 'c4', name: 'Pak Dedi Mulyadi', storeName: 'Warung Rejeki', phone: '0811-2233-4455', type: 'WARUNG_TUNAI', creditLimit: 5000000, usedCredit: 0, topDays: 0, status: 'ACTIVE' },
    ],
  },

  // Pilar 05: POS Terminal, Cart & Invoices
  pilar5: {
    products: [
      { id: 'p1', sku: 'RJL-50KG', name: 'Beras Rojolele Super 50kg', price: 617500, unit: 'Karung', stock: 140 },
      { id: 'p2', sku: 'MGO-2L', name: 'Minyak Goreng Sawit 2L', price: 91500, unit: 'Pouch', stock: 360 },
      { id: 'p3', sku: 'GUL-1KG', name: 'Gula Pasir Kristal 1kg', price: 18500, unit: 'Bungkus', stock: 250 },
      { id: 'p4', sku: 'TRG-25KG', name: 'Tepung Terigu Segitiga 25kg', price: 235000, unit: 'Sak', stock: 80 },
    ],
    cart: [
      { id: 'p1', sku: 'RJL-50KG', name: 'Beras Rojolele Super 50kg', price: 617500, qty: 10, unit: 'Karung' },
    ],
    cartSubtotal: 6175000,
    cartDiscount: 75000,
    cartTotal: 6100000,
    invoices: [
      { invoiceNumber: 'INV-20260909-001', date: '09 Sep 2026 14:22', customerName: 'Toko Barokah Jaya', cashierName: 'Siti Rahma', paymentMethod: 'CASH', totalAmount: 12350000, status: 'PAID' },
      { invoiceNumber: 'INV-20260909-002', date: '09 Sep 2026 13:45', customerName: 'Warung Berkah Sembako', cashierName: 'Siti Rahma', paymentMethod: 'PAYLINK_QRIS', totalAmount: 4575000, status: 'PAID' },
      { invoiceNumber: 'INV-20260909-003', date: '09 Sep 2026 11:10', customerName: 'Toko Sinar Terang', cashierName: 'Siti Rahma', paymentMethod: 'TEMPO_KASBON', totalAmount: 7350000, status: 'PENDING' },
    ],
  },

  // Pilar 06: Surat Jalan & Logistics (POD)
  pilar6: {
    deliveryOrders: [
      { id: 'sj1', sjNumber: 'SJ-20260909-001', orderNumber: 'ORD-20260909-001', driverName: 'Joko Supir', plateNumber: 'B 9123 SDB', destination: 'Toko Barokah Jaya (Kramat Jati)', itemSummary: '20 Karung Beras Rojolele 50kg', status: 'DELIVERED' },
      { id: 'sj2', sjNumber: 'SJ-20260909-002', orderNumber: 'ORD-20260909-002', driverName: 'Joko Supir', plateNumber: 'B 9123 SDB', destination: 'Warung Berkah Sembako (Pasar Minggu)', itemSummary: '50 Pouch Minyak Goreng 2L', status: 'IN_TRANSIT' },
    ],
  },

  // Pilar 07: Buku Piutang & WA PayLink
  pilar7: {
    aging0to7: 7350000,
    aging8to14: 4575000,
    aging15to30: 0,
    agingOver30: 0,
    debts: [
      { invoiceNumber: 'INV-20260902-089', customerName: 'Warung Berkah Sembako', phone: '0813-8877-6655', dueDate: '09 Sep 2026', amount: 4575000, daysOverdue: 1 },
      { invoiceNumber: 'INV-20260906-112', customerName: 'Toko Sinar Terang', phone: '0812-8899-0011', dueDate: '20 Sep 2026', amount: 7350000, daysOverdue: 0 },
    ],
  },

  // Pilar 08: Staff Directory & RBAC Matrix
  pilar8: {
    staff: [
      { name: 'Budi Santoso', email: 'budi@berasjaya.com', phone: '0812-3456-7890', role: '👑 Owner / Billing POC', status: 'VERIFIED', pinConfigured: true },
      { name: 'Siti Rahma', email: 'siti@berasjaya.com', phone: '0812-8888-1111', role: '💳 Kasir Grosir (POS)', status: 'VERIFIED', pinConfigured: true },
      { name: 'Agus Santoso', email: 'agus@berasjaya.com', phone: '0812-8888-2222', role: '📦 Kepala Gudang & FIFO', status: 'VERIFIED', pinConfigured: true },
      { name: 'Joko Supir', email: 'joko@berasjaya.com', phone: '0812-8888-3333', role: '🚚 Supir Logistik (POD)', status: 'VERIFIED', pinConfigured: false },
    ],
    rbacMatrix: {
      OWNER: ['catalog:view_cogs', 'catalog:manage_prices', 'pos:checkout', 'pos:void_item', 'pos:open_cash_drawer', 'inventory:inbound', 'inventory:stock_opname', 'customers:manage_credit_limit', 'logistics:issue_surat_jalan', 'logistics:sign_pod', 'finance:reports', 'settings:manage'],
      MANAGER: ['catalog:manage_prices', 'pos:checkout', 'pos:void_item', 'inventory:inbound', 'inventory:stock_opname', 'customers:manage_credit_limit', 'logistics:issue_surat_jalan', 'finance:reports'],
      CASHIER: ['pos:checkout', 'pos:open_cash_drawer'],
      WAREHOUSE: ['inventory:inbound', 'inventory:stock_opname', 'logistics:issue_surat_jalan'],
      DRIVER: ['logistics:sign_pod'],
    },
  },

  // Pilar 09: Settings
  pilar9: {
    settings: {
      storeName: 'Toko Grosir Beras Jaya Bersama',
      storeAddress: 'Pasar Induk Cipinang Blok A No. 12, Jakarta Timur',
      storePhone: '+6281234567890',
      subdomain: 'berasjaya',
      subdomainAliases: [
        { alias: 'berasjaya-lama', expiresAt: '2026-10-10' }
      ],
      customDomain: '',
      printerType: 'USB',
      paperWidth: '80mm',
    },
  },
};

// 2. Operator Control Plane Domain Data (Telemetry, Tenants Directory, Operators, Audit)
const INITIAL_OPERATOR_DATA = {
  currentRole: null,
  telemetry: {
    totalGmv: 428500000,
    activeTenants: 12,
    latencyP95: 38,
    dbPoolPercent: 42,
  },
  tenants: [
    { id: 't1', businessName: 'Toko Grosir Beras Jaya', subdomain: 'berasjaya', ownerName: 'Budi Santoso', ownerPhone: '+6281234567890', tier: 'GROSIR_PRO', status: 'ACTIVE' },
    { id: 't2', businessName: 'CV Sembako Nusantara', subdomain: 'sembakonusantara', ownerName: 'Hendro Wijaya', ownerPhone: '+6281398765432', tier: 'STARTER_FREE', status: 'ACTIVE' },
  ],
  operators: [
    { name: 'Gabriel (CEO)', email: 'gabriel@ashvinlabs.com', role: 'SUPER_ADMIN', status: 'ACTIVE' },
    { name: 'Alex (Lead Developer)', email: 'alex@ashvinlabs.com', role: 'DEV_ENGINEER', status: 'ACTIVE' },
    { name: 'Dina (Customer Ops)', email: 'dina@ashvinlabs.com', role: 'OPS_SUPPORT', status: 'ACTIVE' },
  ],
  auditLogs: [
    { id: 'aud_001', time: '09 Sep 2026 10:15', operatorEmail: 'gabriel@ashvinlabs.com', action: 'TENANT_PROVISIONED', target: 'Toko Grosir Beras Jaya (berasjaya)', ticketRef: '#TICKET-8100', status: 'SUCCESS' },
    { id: 'aud_002', time: '09 Sep 2026 14:40', operatorEmail: 'alex@ashvinlabs.com', action: 'BREAKGLASS_DIAGNOSTIC', target: 'CV Sembako Nusantara (sembakonusantara)', ticketRef: '#INC-9482', status: 'SUCCESS' },
  ],
};

// 3. Strictly Scoped Operator Control Plane State Tree
const INITIAL_OPERATOR_STATE = {
  version: 6,
  ui: {
    theme: 'light',
    portalMode: 'OPS',
    activePath: '/telemetry',
    sidebarOpen: false,
    activeModal: null,
  },
  auth: {
    merchantUser: null,
    operatorUser: null,
    impersonation: {
      active: false,
      originalOperator: null,
      targetTenant: null,
      targetUser: null,
      ticketRef: null,
      reason: null,
      startedAt: null,
    },
  },
  operator: JSON.parse(JSON.stringify(INITIAL_OPERATOR_DATA)),
  // Workspace blueprints for operator impersonation sessions
  pilar1: JSON.parse(JSON.stringify(INITIAL_TENANT_STATE.pilar1)),
  pilar2: JSON.parse(JSON.stringify(INITIAL_TENANT_STATE.pilar2)),
  pilar3: JSON.parse(JSON.stringify(INITIAL_TENANT_STATE.pilar3)),
  pilar5: JSON.parse(JSON.stringify(INITIAL_TENANT_STATE.pilar5)),
  pilar6: JSON.parse(JSON.stringify(INITIAL_TENANT_STATE.pilar6)),
  pilar7: JSON.parse(JSON.stringify(INITIAL_TENANT_STATE.pilar7)),
  pilar8: JSON.parse(JSON.stringify(INITIAL_TENANT_STATE.pilar8)),
  pilar9: JSON.parse(JSON.stringify(INITIAL_TENANT_STATE.pilar9)),
};

// Canonical fallback: Safe default pointing strictly to Tenant State (sanitized from operator data)
const INITIAL_DEFAULT_STATE = INITIAL_TENANT_STATE;
