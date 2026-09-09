-- ==============================================================================
-- SiDaya: Enterprise Wholesale & Retail POS / Inventory Multi-Tenant Schema
-- Migration 00001: Initial Canonical Schema & Row-Level Security Policies
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Tenancy & Workspaces
-- ------------------------------------------------------------------------------
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(63) UNIQUE,
    current_plan_tier VARCHAR(32) NOT NULL DEFAULT 'FREE_STARTER', -- 'FREE_STARTER', 'RETAIL_STARTER', 'GROSIR_PRO', 'ENTERPRISE'
    subscription_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAST_DUE', 'CANCELED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_name VARCHAR(128) NOT NULL,
    branch_code VARCHAR(32) NOT NULL,
    address TEXT,
    phone_number VARCHAR(32),
    is_main_branch BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_branch_code UNIQUE (tenant_id, branch_code)
);
CREATE INDEX idx_branches_tenant ON branches(tenant_id);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    customer_type VARCHAR(32) NOT NULL DEFAULT 'REGULAR', -- 'REGULAR', 'WHOLESALE', 'VIP_MEMBER'
    credit_limit NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_receivable NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_customer_phone UNIQUE (tenant_id, phone_number)
);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);

-- ------------------------------------------------------------------------------
-- 2. Pluggable Feature Entitlements
-- ------------------------------------------------------------------------------
CREATE TABLE tenant_feature_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feature_key VARCHAR(64) NOT NULL, -- e.g., 'wholesale:multi_tier', 'hardware:dot_matrix', 'finance:piutang'
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    custom_limit JSONB DEFAULT '{}'::JSONB, -- e.g., {"max_devices": 3, "max_staff": 5}
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT uq_tenant_feature UNIQUE (tenant_id, feature_key)
);
CREATE INDEX idx_entitlements_tenant ON tenant_feature_entitlements(tenant_id, is_enabled);

-- ------------------------------------------------------------------------------
-- 3. Staff Users & Shifts
-- ------------------------------------------------------------------------------
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    default_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    full_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(32) NOT NULL, -- 'OWNER', 'MANAGER', 'CASHIER', 'SALESMAN', 'WAREHOUSE'
    pin_hash VARCHAR(255) NOT NULL, -- Argon2 / bcrypt hash of numeric PIN
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_user_phone UNIQUE (tenant_id, phone_number)
);
CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);

CREATE TABLE cashier_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    cashier_user_id UUID NOT NULL REFERENCES tenant_users(id),
    device_uuid VARCHAR(128) NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    opening_float NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    cash_sales_total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    digital_sales_total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    cash_drops_total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    expected_drawer_cash NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    actual_drawer_cash NUMERIC(14,2),
    cash_variance NUMERIC(14,2),
    status VARCHAR(16) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'CLOSED'
    notes TEXT
);
CREATE INDEX idx_shifts_tenant_branch ON cashier_shifts(tenant_id, branch_id, status);

CREATE TABLE shift_cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES cashier_shifts(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    movement_type VARCHAR(32) NOT NULL, -- 'CASH_DROP', 'PETTY_CASH_EXPENSE', 'FLOAT_ADJUSTMENT'
    amount NUMERIC(14,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    authorized_by_user_id UUID REFERENCES tenant_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. Products, Wholesale Price Tiers & UOM Conversions
-- ------------------------------------------------------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(64) NOT NULL,
    barcode VARCHAR(64),
    price_retail NUMERIC(14,2) NOT NULL,
    cost_price NUMERIC(14,2), -- COGS / Modal
    base_unit VARCHAR(16) NOT NULL DEFAULT 'PCS',
    current_stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_sku UNIQUE (tenant_id, sku)
);
CREATE INDEX idx_products_tenant_barcode ON products(tenant_id, barcode);

CREATE TABLE product_price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tier_name VARCHAR(64) NOT NULL,
    customer_type VARCHAR(32),
    min_quantity INTEGER NOT NULL DEFAULT 1,
    tier_price NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_tier UNIQUE (product_id, tier_name, min_quantity)
);
CREATE INDEX idx_price_tiers_lookup ON product_price_tiers(product_id, min_quantity);

CREATE TABLE product_unit_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    unit_name VARCHAR(32) NOT NULL,
    conversion_factor INTEGER NOT NULL,
    barcode VARCHAR(64),
    unit_price NUMERIC(14,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_unit UNIQUE (product_id, unit_name)
);

-- ------------------------------------------------------------------------------
-- 5. Orders & Invoicing
-- ------------------------------------------------------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES cashier_shifts(id) ON DELETE SET NULL,
    cashier_user_id UUID REFERENCES tenant_users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number VARCHAR(64) NOT NULL,
    order_type VARCHAR(32) NOT NULL DEFAULT 'RETAIL', -- 'RETAIL', 'GROSIR', 'CAFE_TABLE'
    subtotal NUMERIC(14,2) NOT NULL,
    discount_compound_formula VARCHAR(64), -- e.g. '5%+2%+1000'
    discount_total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(14,2) NOT NULL,
    payment_status VARCHAR(32) NOT NULL DEFAULT 'UNPAID', -- 'PAID', 'PARTIAL', 'UNPAID'
    payment_method VARCHAR(32), -- 'CASH', 'PAYLINK_QRIS', 'PAYLINK_VA', 'PIUTANG_TEMPO'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_order_number UNIQUE (tenant_id, order_number)
);
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, payment_status);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    selected_unit VARCHAR(32) NOT NULL DEFAULT 'PCS',
    unit_conversion_factor INTEGER NOT NULL DEFAULT 1,
    quantity INTEGER NOT NULL,
    base_unit_quantity INTEGER NOT NULL,
    unit_price NUMERIC(14,2) NOT NULL,
    subtotal NUMERIC(14,2) NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------------------------
-- 6. PayLinks & Multi-Gateway Transactions
-- ------------------------------------------------------------------------------
CREATE TABLE paylinks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAID', 'EXPIRED', 'CANCELED'
    checkout_url TEXT NOT NULL,
    qr_string TEXT,
    va_number VARCHAR(64),
    payment_gateway VARCHAR(32) NOT NULL, -- 'MIDTRANS', 'XENDIT', 'DUITKU'
    gateway_reference_id VARCHAR(128),
    expires_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_paylinks_token ON paylinks(token);
CREATE INDEX idx_paylinks_order ON paylinks(order_id);

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    paylink_id UUID REFERENCES paylinks(id) ON DELETE SET NULL,
    gateway_provider VARCHAR(32) NOT NULL,
    gateway_transaction_id VARCHAR(128) NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    amount NUMERIC(14,2) NOT NULL,
    channel VARCHAR(32) NOT NULL, -- 'QRIS', 'BCA_VA', 'BRI_VA', etc.
    status VARCHAR(32) NOT NULL, -- 'SETTLED', 'PENDING', 'EXPIRED', 'FAILED'
    raw_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transactions_order ON payment_transactions(order_id);
CREATE INDEX idx_transactions_gateway_id ON payment_transactions(gateway_provider, gateway_transaction_id);

-- ------------------------------------------------------------------------------
-- 7. Accounts Receivable (Piutang & Kasbon Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE piutang_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    total_debt NUMERIC(14,2) NOT NULL,
    amount_settled NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    remaining_balance NUMERIC(14,2) NOT NULL,
    due_date DATE,
    status VARCHAR(16) NOT NULL DEFAULT 'UNPAID', -- 'UNPAID', 'PARTIAL', 'SETTLED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_piutang_customer ON piutang_records(tenant_id, customer_id, status);

CREATE TABLE piutang_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    piutang_id UUID NOT NULL REFERENCES piutang_records(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    amount_paid NUMERIC(14,2) NOT NULL,
    payment_method VARCHAR(32) NOT NULL, -- 'CASH', 'PAYLINK_QRIS', 'BANK_TRANSFER'
    paylink_id UUID REFERENCES paylinks(id) ON DELETE SET NULL,
    recorded_by_user_id UUID REFERENCES tenant_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. Hardware Printer Profiles
-- ------------------------------------------------------------------------------
CREATE TABLE printer_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    printer_name VARCHAR(64) NOT NULL,
    driver_type VARCHAR(32) NOT NULL, -- 'ESC_POS_THERMAL', 'DOT_MATRIX_ESC_P2', 'WIFI_A4'
    connection_type VARCHAR(32) NOT NULL, -- 'BLUETOOTH', 'NETWORK_WIFI', 'USB'
    mac_address VARCHAR(32),
    ip_address VARCHAR(45),
    paper_width_mm INTEGER NOT NULL DEFAULT 58,
    auto_cut BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. Suppliers, Purchase Orders & Inbound Shipments
-- ------------------------------------------------------------------------------
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(128),
    phone_number VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    bank_account_info TEXT,
    default_return_policy_days INTEGER DEFAULT 7,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_suppliers_tenant ON suppliers(tenant_id);

CREATE TABLE supplier_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    po_number VARCHAR(64) NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ORDERED', -- 'DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED'
    notes TEXT,
    created_by_user_id UUID REFERENCES tenant_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_supplier_po UNIQUE (tenant_id, po_number)
);

CREATE TABLE supplier_po_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_po_id UUID NOT NULL REFERENCES supplier_purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    ordered_unit VARCHAR(32) NOT NULL DEFAULT 'PCS',
    conversion_factor INTEGER NOT NULL DEFAULT 1,
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER NOT NULL DEFAULT 0,
    unit_cost_price NUMERIC(14,2) NOT NULL,
    subtotal NUMERIC(14,2) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 10. Warehousing, Storage Locations & FIFO Batches
-- ------------------------------------------------------------------------------
CREATE TABLE storage_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    warehouse_name VARCHAR(64) NOT NULL,
    zone_name VARCHAR(64) NOT NULL,
    aisle VARCHAR(32),
    rack_bin VARCHAR(32) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_bin_location UNIQUE (tenant_id, branch_id, warehouse_name, zone_name, rack_bin)
);

CREATE TABLE inbound_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    supplier_po_id UUID REFERENCES supplier_purchase_orders(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    shipment_number VARCHAR(64) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    carrier_name VARCHAR(128),
    delivery_vehicle_plate VARCHAR(32),
    delivery_note_ref VARCHAR(64),
    return_policy_days INTEGER NOT NULL DEFAULT 7,
    return_policy_terms TEXT,
    received_by_user_id UUID REFERENCES tenant_users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_shipment UNIQUE (tenant_id, shipment_number)
);

CREATE TABLE product_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    inbound_shipment_id UUID REFERENCES inbound_shipments(id) ON DELETE SET NULL,
    storage_location_id UUID REFERENCES storage_locations(id) ON DELETE SET NULL,
    batch_lot_number VARCHAR(64) NOT NULL,
    harvest_or_milling_date DATE,
    expiry_date DATE,
    inbound_cost_per_base_unit NUMERIC(14,2) NOT NULL,
    initial_base_quantity INTEGER NOT NULL,
    remaining_base_quantity INTEGER NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'DEPLETED', 'EXPIRED', 'RETURNED_TO_VENDOR'
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_batch UNIQUE (tenant_id, product_id, batch_lot_number)
);
CREATE INDEX idx_batches_fifo_lookup ON product_batches(tenant_id, product_id, received_at) WHERE remaining_base_quantity > 0;

-- ------------------------------------------------------------------------------
-- 11. Outbound Logistics: Surat Jalan (Driver Working Permits) - STRICTLY NO PRICES
-- ------------------------------------------------------------------------------
CREATE TABLE delivery_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    do_number VARCHAR(64) NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    driver_name VARCHAR(128) NOT NULL,
    driver_phone VARCHAR(32),
    vehicle_plate_number VARCHAR(32) NOT NULL,
    destination_address TEXT NOT NULL,
    recipient_name VARCHAR(128) NOT NULL,
    recipient_phone VARCHAR(32) NOT NULL,
    delivery_instructions TEXT,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    warehouse_dispatcher_id UUID REFERENCES tenant_users(id) ON DELETE SET NULL,
    qr_verification_token VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_PICKUP', -- 'PENDING_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'FAILED_RETURNED'
    proof_of_delivery_signature TEXT,
    recipient_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_do UNIQUE (tenant_id, do_number)
);

-- Note: delivery_order_items strictly omits price, discount, or invoice total columns
CREATE TABLE delivery_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL,
    storage_location_id UUID REFERENCES storage_locations(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    selected_unit VARCHAR(32) NOT NULL,
    unit_conversion_factor INTEGER NOT NULL DEFAULT 1,
    quantity INTEGER NOT NULL,
    storage_bin_display VARCHAR(128),
    is_picked BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE TABLE supplier_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    inbound_shipment_id UUID REFERENCES inbound_shipments(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_returned INTEGER NOT NULL,
    return_unit VARCHAR(32) NOT NULL DEFAULT 'PCS',
    reason VARCHAR(255) NOT NULL,
    return_policy_clause VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'REQUESTED', -- 'REQUESTED', 'APPROVED_BY_SUPPLIER', 'REPLACED', 'REFUNDED_CREDIT_NOTE'
    credit_note_amount NUMERIC(14,2),
    created_by_user_id UUID REFERENCES tenant_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. Stock Movements Ledger (Immutable Inventory Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL,
    movement_type VARCHAR(32) NOT NULL, -- 'SALE', 'INBOUND_PURCHASE', 'RETURN_TO_VENDOR', 'ADJUSTMENT', 'TRANSFER'
    quantity_delta INTEGER NOT NULL,
    reference_id UUID, -- order_id or inbound_shipment_id
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_stock_movements_product ON stock_movements(tenant_id, product_id, created_at);

-- ==============================================================================
-- 13. Row-Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS across all business entities
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_feature_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashier_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_unit_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE paylinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE piutang_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE piutang_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- 1. General Tenant Isolation Policy macro for each table
CREATE POLICY tenant_isolation_branches ON branches FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_customers ON customers FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_entitlements ON tenant_feature_entitlements FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_users ON tenant_users FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_orders ON orders FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_paylinks ON paylinks FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_transactions ON payment_transactions FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_piutang ON piutang_records FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_suppliers ON suppliers FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_batches ON product_batches FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_stock_movements ON stock_movements FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- 2. Role-Based Security: Cashier cannot read cost_price (Modal)
CREATE POLICY cashier_hide_cogs_policy ON products
  FOR SELECT
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    AND (
      NULLIF(current_setting('app.current_user_role', true), '') NOT IN ('CASHIER', 'SALESMAN')
      OR cost_price IS NULL
    )
  );

CREATE POLICY manager_products_all ON products
  FOR ALL
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    AND NULLIF(current_setting('app.current_user_role', true), '') IN ('OWNER', 'MANAGER', 'WAREHOUSE')
  );

-- 3. Delivery / Driver Privacy: Drivers can only view delivery_orders manifests (NEVER orders table)
CREATE POLICY driver_delivery_order_policy ON delivery_orders
  FOR SELECT
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    AND (
      NULLIF(current_setting('app.current_user_role', true), '') IN ('OWNER', 'MANAGER', 'WAREHOUSE')
      OR vehicle_plate_number = NULLIF(current_setting('app.current_user_vehicle_plate', true), '')
      OR driver_name = NULLIF(current_setting('app.current_user_full_name', true), '')
    )
  );

-- 4. Shifts Isolation: Cashiers can only update their own open shift
CREATE POLICY cashier_shift_policy ON cashier_shifts
  FOR ALL
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    AND (
      NULLIF(current_setting('app.current_user_role', true), '') IN ('OWNER', 'MANAGER')
      OR cashier_user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
    )
  );
