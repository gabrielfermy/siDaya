-- ==============================================================================
-- SiDaya: Enterprise Wholesale & Retail POS / Inventory Multi-Tenant Schema
-- Migration 00005: Complete 9-Pilar Canonical Schema & Enterprise Modules
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Multi-Barcode Support per SKU (Pilar 02: Inventori)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_barcodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    barcode VARCHAR(64) NOT NULL,
    barcode_type VARCHAR(32) NOT NULL DEFAULT 'EAN_13', -- 'EAN_13', 'CODE_128', 'QR_CODE', 'INTERNAL_SKU'
    packaging_unit VARCHAR(32) NOT NULL DEFAULT 'PCS', -- 'PCS', 'PACK', 'DUS', 'KARTON'
    unit_multiplier NUMERIC(10,2) NOT NULL DEFAULT 1.00, -- e.g., 1 DUS = 24 PCS
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_barcode UNIQUE (tenant_id, barcode)
);
CREATE INDEX IF NOT EXISTS idx_product_barcodes_lookup ON product_barcodes(tenant_id, barcode);
CREATE INDEX IF NOT EXISTS idx_product_barcodes_prod ON product_barcodes(product_id);

-- ------------------------------------------------------------------------------
-- 2. Multi-Warehouse & Inter-Branch Stock Transfers (Pilar 02: Inventori)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouse_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transfer_number VARCHAR(64) UNIQUE NOT NULL,
    source_branch_id UUID NOT NULL REFERENCES branches(id),
    destination_branch_id UUID NOT NULL REFERENCES branches(id),
    requested_by_user_id UUID NOT NULL REFERENCES tenant_users(id),
    approved_by_user_id UUID REFERENCES tenant_users(id),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING_APPROVAL', 'IN_TRANSIT', 'RECEIVED', 'REJECTED'
    driver_name VARCHAR(128),
    vehicle_plate VARCHAR(32),
    notes TEXT,
    shipped_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_warehouse_transfers_tenant ON warehouse_transfers(tenant_id, status);

CREATE TABLE IF NOT EXISTS warehouse_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transfer_id UUID NOT NULL REFERENCES warehouse_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    batch_id UUID REFERENCES product_batches(id),
    qty_shipped NUMERIC(10,2) NOT NULL,
    qty_received NUMERIC(10,2) DEFAULT 0,
    unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'IN_TRANSIT', -- 'IN_TRANSIT', 'RECEIVED_FULL', 'DISCREPANCY'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer ON warehouse_transfer_items(transfer_id);

-- ------------------------------------------------------------------------------
-- 3. Stock Opname & Physical Inventory Audits (Pilar 02: Inventori)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_opname_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id),
    session_number VARCHAR(64) UNIQUE NOT NULL,
    lead_auditor_id UUID NOT NULL REFERENCES tenant_users(id),
    status VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'PENDING_APPROVAL', 'ADJUSTED_AND_CLOSED', 'CANCELLED'
    total_variance_qty NUMERIC(10,2) DEFAULT 0,
    total_variance_value NUMERIC(14,2) DEFAULT 0,
    notes TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stock_opname_tenant ON stock_opname_sessions(tenant_id, status);

CREATE TABLE IF NOT EXISTS stock_opname_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES stock_opname_sessions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    batch_id UUID REFERENCES product_batches(id),
    system_qty NUMERIC(10,2) NOT NULL,
    counted_qty NUMERIC(10,2) NOT NULL,
    variance_qty NUMERIC(10,2) GENERATED ALWAYS AS (counted_qty - system_qty) STORED,
    unit_cost NUMERIC(14,2) NOT NULL,
    variance_value NUMERIC(14,2) GENERATED ALWAYS AS ((counted_qty - system_qty) * unit_cost) STORED,
    scanner_user_id UUID REFERENCES tenant_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_opname_items_session ON stock_opname_items(session_id);

-- ------------------------------------------------------------------------------
-- 4. Stock Adjustments / Penyesuaian Stok (Pilar 02: Inventori)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id),
    adjustment_number VARCHAR(64) UNIQUE NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    batch_id UUID REFERENCES product_batches(id),
    reason_code VARCHAR(32) NOT NULL, -- 'DAMAGED_EXPIRED', 'THEFT_LOSS', 'OPNAME_RECONCILIATION', 'INTERNAL_USAGE'
    qty_delta NUMERIC(10,2) NOT NULL, -- Positive (Found/Addition) or Negative (Loss/Deduction)
    unit_cost NUMERIC(14,2) NOT NULL,
    total_value_impact NUMERIC(14,2) NOT NULL,
    authorized_by_user_id UUID NOT NULL REFERENCES tenant_users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stock_adj_tenant ON stock_adjustments(tenant_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. Sales Returns & Credit Notes (Pilar 05: Penjualan & Kasir)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    return_number VARCHAR(64) UNIQUE NOT NULL,
    credit_note_number VARCHAR(64) UNIQUE,
    total_refund_amount NUMERIC(14,2) NOT NULL,
    settlement_type VARCHAR(32) NOT NULL DEFAULT 'CREDIT_NOTE', -- 'CASH_REFUND', 'CREDIT_NOTE', 'DEDUCT_PIUTANG', 'REPLACEMENT_GOODS'
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL', -- 'PENDING_APPROVAL', 'APPROVED_AND_RESTOCKED', 'REJECTED'
    approved_by_user_id UUID REFERENCES tenant_users(id),
    created_by_user_id UUID NOT NULL REFERENCES tenant_users(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_returns_tenant ON sales_returns(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_returns_order ON sales_returns(order_id);

CREATE TABLE IF NOT EXISTS sales_return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    return_id UUID NOT NULL REFERENCES sales_returns(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id),
    product_id UUID NOT NULL REFERENCES products(id),
    batch_id UUID REFERENCES product_batches(id),
    qty_returned NUMERIC(10,2) NOT NULL,
    unit_selling_price NUMERIC(14,2) NOT NULL,
    refund_subtotal NUMERIC(14,2) NOT NULL,
    restock_to_inventory BOOLEAN NOT NULL DEFAULT TRUE,
    condition_status VARCHAR(32) NOT NULL DEFAULT 'SELLABLE', -- 'SELLABLE', 'DAMAGED_WRITE_OFF', 'DEFECTIVE_RTV'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_return_items_return ON sales_return_items(return_id);

-- ------------------------------------------------------------------------------
-- 6. Multi-Account Cash & Bank Management (Pilar 07: Keuangan & Kas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cash_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_code VARCHAR(32) NOT NULL, -- e.g., '1111-KASIR-01', '1112-BCA-GIRO'
    account_name VARCHAR(128) NOT NULL,
    account_type VARCHAR(32) NOT NULL, -- 'CASH_DRAWER', 'PETTY_CASH', 'BANK_ACCOUNT', 'PAYMENT_GATEWAY_ESCROW'
    bank_name VARCHAR(64), -- 'BCA', 'MANDIRI', 'BRI', 'BNI'
    bank_account_number VARCHAR(64),
    account_holder_name VARCHAR(128),
    current_balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_account_code UNIQUE (tenant_id, account_code)
);
CREATE INDEX IF NOT EXISTS idx_cash_bank_tenant ON cash_bank_accounts(tenant_id);

CREATE TABLE IF NOT EXISTS cash_bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES cash_bank_accounts(id),
    transaction_number VARCHAR(64) UNIQUE NOT NULL,
    transaction_type VARCHAR(32) NOT NULL, -- 'INFLOW_SALES', 'INFLOW_PIUTANG', 'OUTFLOW_PURCHASE', 'OUTFLOW_EXPENSE', 'TRANSFER_INTER_ACCOUNT'
    amount NUMERIC(14,2) NOT NULL,
    balance_after NUMERIC(14,2) NOT NULL,
    reference_type VARCHAR(32), -- 'orders', 'piutang_payments', 'supplier_purchase_orders', 'petty_cash_voucher'
    reference_id UUID,
    description TEXT NOT NULL,
    operator_user_id UUID NOT NULL REFERENCES tenant_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cash_bank_tx_account ON cash_bank_transactions(account_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. Fixed Assets & Automatic Depreciation (Pilar 07: Keuangan & Kas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fixed_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    asset_code VARCHAR(32) NOT NULL,
    asset_name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'VEHICLE', 'POS_HARDWARE', 'WAREHOUSE_EQUIPMENT', 'BUILDING_RENOVATION'
    acquisition_date DATE NOT NULL,
    acquisition_cost NUMERIC(14,2) NOT NULL,
    salvage_value NUMERIC(14,2) NOT NULL DEFAULT 0,
    useful_life_months INT NOT NULL,
    depreciation_method VARCHAR(32) NOT NULL DEFAULT 'STRAIGHT_LINE', -- 'STRAIGHT_LINE', 'DOUBLE_DECLINING'
    accumulated_depreciation NUMERIC(14,2) NOT NULL DEFAULT 0,
    book_value NUMERIC(14,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'DISPOSED', 'WRITTEN_OFF'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_asset_code UNIQUE (tenant_id, asset_code)
);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_tenant ON fixed_assets(tenant_id);

CREATE TABLE IF NOT EXISTS fixed_asset_depreciations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES fixed_assets(id) ON DELETE CASCADE,
    fiscal_period VARCHAR(7) NOT NULL, -- '2026-09'
    depreciation_amount NUMERIC(14,2) NOT NULL,
    accumulated_after NUMERIC(14,2) NOT NULL,
    book_value_after NUMERIC(14,2) NOT NULL,
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_asset_period UNIQUE (asset_id, fiscal_period)
);

-- ------------------------------------------------------------------------------
-- 8. Approval Workflows Engine (Pilar 09: Tata Kelola & Sistem)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL, -- 'PO_CREATION', 'SALES_VOID', 'DISCOUNT_THRESHOLD', 'CREDIT_LIMIT_OVERRIDE'
    threshold_amount NUMERIC(14,2),
    required_role VARCHAR(32) NOT NULL DEFAULT 'OWNER', -- 'OWNER', 'MANAGER'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approval_rules_tenant ON approval_rules(tenant_id, event_type);

CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES approval_rules(id),
    requester_user_id UUID NOT NULL REFERENCES tenant_users(id),
    approver_user_id UUID REFERENCES tenant_users(id),
    entity_name VARCHAR(64) NOT NULL, -- 'orders', 'supplier_purchase_orders', 'sales_returns'
    entity_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'
    justification TEXT,
    actioned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approval_requests_tenant ON approval_requests(tenant_id, status);

-- ------------------------------------------------------------------------------
-- 9. Immutable Tenant Activity Audit Log (Pilar 09: Tata Kelola & Sistem)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenant_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES tenant_users(id),
    actor_name VARCHAR(128) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action_type VARCHAR(64) NOT NULL, -- 'PRICE_OVERRIDE', 'VOID_ORDER', 'STAFF_INVITE', 'RBAC_UPDATE', 'STOCK_ADJUST'
    entity_name VARCHAR(64) NOT NULL, -- 'orders', 'products', 'tenant_users', 'sales_returns'
    entity_id UUID,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    ray_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs ON tenant_audit_logs(tenant_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 10. Consignment Management / Konsinyasi (Pilar 04 & 05)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consignment_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    consignment_type VARCHAR(32) NOT NULL DEFAULT 'INBOUND', -- 'INBOUND' (dari Supplier), 'OUTBOUND' (ke Mitra)
    partner_id UUID NOT NULL,
    contract_number VARCHAR(64) UNIQUE NOT NULL,
    commission_rate_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    settlement_period VARCHAR(32) NOT NULL DEFAULT 'MONTHLY',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consignment_tenant ON consignment_contracts(tenant_id, status);

-- ------------------------------------------------------------------------------
-- 11. Row-Level Security (RLS) Policies on New Tables
-- ------------------------------------------------------------------------------
ALTER TABLE product_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_opname_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_opname_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_asset_depreciations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_product_barcodes ON product_barcodes FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_warehouse_transfers ON warehouse_transfers FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_transfer_items ON warehouse_transfer_items FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_stock_opname ON stock_opname_sessions FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_opname_items ON stock_opname_items FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_stock_adj ON stock_adjustments FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_sales_returns ON sales_returns FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_return_items ON sales_return_items FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_cash_bank ON cash_bank_accounts FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_cash_bank_tx ON cash_bank_transactions FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_fixed_assets ON fixed_assets FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_asset_depr ON fixed_asset_depreciations FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_approval_rules ON approval_rules FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_approval_requests ON approval_requests FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_tenant_audit ON tenant_audit_logs FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
CREATE POLICY tenant_isolation_consignment ON consignment_contracts FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
