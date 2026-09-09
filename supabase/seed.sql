-- ==============================================================================
-- SiDaya Multi-Tenant & Multi-User Seed Data (Phase 2)
-- Strict Hex UUIDs with 2 Distinct Tenants, Multi-Role Staff, Bins & FIFO Batches
-- ==============================================================================

-- 1. Insert Demo Tenants
INSERT INTO tenants (id, business_name, subdomain, current_plan_tier, subscription_status)
VALUES 
    (
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'Toko Grosir Beras Jaya Bersama',
        'berasjaya',
        'GROSIR_PRO',
        'ACTIVE'
    ),
    (
        'd5c9f320-1942-493b-cd02-34b0df9f23e5',
        'CV Sembako Nusantara Makmur',
        'sembakonusantara',
        'RETAIL_STARTER',
        'ACTIVE'
    )
ON CONFLICT (id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    current_plan_tier = EXCLUDED.current_plan_tier;

-- 2. Insert Feature Entitlements
INSERT INTO tenant_feature_entitlements (tenant_id, feature_key, is_enabled, custom_limit)
VALUES 
    -- Tenant 1 (Grosir Pro Tier)
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'core:pos', TRUE, '{"max_devices": 10}'),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'fintech:paylink', TRUE, '{}'),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'wholesale:multi_tier', TRUE, '{}'),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'wholesale:compound_discounts', TRUE, '{}'),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'wholesale:unit_conversions', TRUE, '{}'),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'inbound:procurement', TRUE, '{}'),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'warehouse:storage_bins', TRUE, '{}'),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'logistics:surat_jalan', TRUE, '{}'),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'finance:piutang', TRUE, '{}'),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'hardware:dot_matrix', TRUE, '{}'),
    -- Tenant 2 (Retail Starter Tier)
    ('d5c9f320-1942-493b-cd02-34b0df9f23e5', 'core:pos', TRUE, '{"max_devices": 3}'),
    ('d5c9f320-1942-493b-cd02-34b0df9f23e5', 'fintech:paylink', TRUE, '{}')
ON CONFLICT (tenant_id, feature_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

-- 3. Insert Branches
INSERT INTO branches (id, tenant_id, branch_name, branch_code, address, phone_number, is_main_branch)
VALUES 
    (
        'b0000000-0000-0000-0000-000000000001',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'Pasar Induk Kramat Jati',
        'PIKJ-01',
        'Komp. Pasar Induk Kramat Jati Blok C No. 12-14, Jakarta Timur',
        '081234567890',
        TRUE
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'd5c9f320-1942-493b-cd02-34b0df9f23e5',
        'Gudang Distribusi Cipinang',
        'CIP-01',
        'Jl. Pisangan Timur No. 45, Cipinang, Jakarta Timur',
        '081398765432',
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Locations for Tenant 1
INSERT INTO storage_locations (id, tenant_id, branch_id, warehouse_name, zone_name, aisle, rack_bin, is_active)
VALUES 
    ('e0000001-0000-0000-0000-000000000001', 'c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'b0000000-0000-0000-0000-000000000001', 'Gudang Utama', 'Zona Beras', 'Aisle 1', 'Rak A-01 (Pallet 1)', TRUE),
    ('e0000001-0000-0000-0000-000000000002', 'c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'b0000000-0000-0000-0000-000000000001', 'Gudang Utama', 'Zona Beras', 'Aisle 1', 'Rak A-02 (Pallet 2)', TRUE),
    ('e0000001-0000-0000-0000-000000000003', 'c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'b0000000-0000-0000-0000-000000000001', 'Gudang Utama', 'Zona Minyak & Gula', 'Aisle 2', 'Rak B-01 (Shelf 1)', TRUE)
ON CONFLICT DO NOTHING;

-- 5. Insert Multi-Role Staff Users with Checkbox Permissions (Strict Hex UUIDs)
INSERT INTO tenant_users (id, tenant_id, default_branch_id, full_name, phone_number, email, role, permissions, pin_hash)
VALUES 
    -- Tenant 1: Owner (Budi Santoso - All Permissions)
    (
        'a0000001-0001-0000-0000-000000000001',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'b0000000-0000-0000-0000-000000000001',
        'Budi Santoso',
        '081234567890',
        'budi@berasjaya.com',
        'OWNER',
        '["pos:checkout", "pos:void", "pos:apply_discount", "shifts:operate", "shifts:reconcile", "catalog:view", "catalog:manage", "catalog:view_cogs", "warehouse:inbound", "warehouse:adjust", "warehouse:fifo", "logistics:dispatch", "logistics:driver_view", "finance:piutang_view", "finance:piutang_settle", "finance:reports", "staff:manage", "settings:manage"]'::JSONB,
        '1234'
    ),
    -- Tenant 1: Warehouse Manager (Agus Gudang - Inbound, FIFO & Surat Jalan)
    (
        'a0000001-0001-0000-0000-000000000002',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'b0000000-0000-0000-0000-000000000001',
        'Agus Gudang',
        '081234567892',
        'agus@berasjaya.com',
        'WAREHOUSE',
        '["catalog:view", "warehouse:inbound", "warehouse:adjust", "warehouse:fifo", "logistics:dispatch"]'::JSONB,
        '3344'
    ),
    -- Tenant 1: Counter Cashier (Siti Rahma - POS, Shifts, COGS MASKED)
    (
        'a0000001-0001-0000-0000-000000000003',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'b0000000-0000-0000-0000-000000000001',
        'Siti Rahma',
        '081234567891',
        'siti@berasjaya.com',
        'CASHIER',
        '["pos:checkout", "pos:apply_discount", "shifts:operate", "catalog:view", "finance:piutang_view"]'::JSONB,
        '2468'
    ),
    -- Tenant 1: Field Driver (Joko Supir - Price-Stripped Manifests & Proof of Delivery)
    (
        'a0000001-0001-0000-0000-000000000004',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'b0000000-0000-0000-0000-000000000001',
        'Joko Supir',
        '081234567893',
        'joko@berasjaya.com',
        'DRIVER',
        '["logistics:driver_view"]'::JSONB,
        '5566'
    ),
    -- Tenant 2: Owner (Hendro Makmur - Tenant 2 Isolated Workspace)
    (
        'a0000002-0001-0000-0000-000000000001',
        'd5c9f320-1942-493b-cd02-34b0df9f23e5',
        'b0000000-0000-0000-0000-000000000002',
        'Hendro Makmur',
        '081398765432',
        'hendro@sembakonusantara.com',
        'OWNER',
        '["pos:checkout", "pos:void", "pos:apply_discount", "shifts:operate", "shifts:reconcile", "catalog:view", "catalog:manage", "catalog:view_cogs", "finance:piutang_view", "finance:reports", "staff:manage"]'::JSONB,
        '9999'
    ),
    -- Cross-Tenant Consultant: Account in Tenant 1
    (
        'a0000003-0001-0000-0000-000000000001',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'b0000000-0000-0000-0000-000000000001',
        'Iwan Mitra',
        '081198765432',
        'investor@mitraretail.com',
        'STORE_MANAGER',
        '["catalog:view", "finance:reports"]'::JSONB,
        '7788'
    ),
    -- Cross-Tenant Consultant: Account in Tenant 2
    (
        'a0000003-0001-0000-0000-000000000002',
        'd5c9f320-1942-493b-cd02-34b0df9f23e5',
        'b0000000-0000-0000-0000-000000000002',
        'Iwan Mitra',
        '081198765432',
        'investor@mitraretail.com',
        'STORE_MANAGER',
        '["catalog:view", "finance:reports"]'::JSONB,
        '7788'
    )
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    permissions = EXCLUDED.permissions,
    role = EXCLUDED.role;

-- 6. Insert Customers
INSERT INTO customers (id, tenant_id, customer_name, phone_number, customer_type, credit_limit, total_receivable)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'Pak Haji Rahmat', '081298765432', 'WHOLESALE', 25000000.00, 0.00),
    ('a0000000-0000-0000-0000-000000000002', 'c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'Toko Sembako Berkah Ibu Ani', '081398765411', 'WHOLESALE', 15000000.00, 3500000.00),
    ('a0000000-0000-0000-0000-000000000003', 'd5c9f320-1942-493b-cd02-34b0df9f23e5', 'Warung Bu Dewi', '081898765422', 'REGULAR', 5000000.00, 0.00)
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Suppliers
INSERT INTO suppliers (id, tenant_id, supplier_name, contact_person, phone_number, email, address)
VALUES 
    (
        'b0000005-0000-0000-0000-000000000001',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'PT Lumbung Padi Solok Super',
        'Haji Mansyur',
        '08111223344',
        'sales@lumbungsolok.co.id',
        'Jl. Raya Solok - Padang KM 14, Sumatera Barat'
    ),
    (
        'b0000005-0000-0000-0000-000000000002',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'PT Bina Karya Minyak Sawit',
        'Ibu Lisa',
        '08115566778',
        'orders@binasawit.com',
        'Kawasan Industri Pulo Gadung, Jakarta Timur'
    )
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Wholesale Products for Tenant 1
INSERT INTO products (id, tenant_id, name, sku, barcode, price_retail, cost_price, base_unit, current_stock)
VALUES 
    ('a0000002-0000-0000-0000-000000000001', 'c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'Beras Rojolele Super Premium 50KG', 'RJL-50', '8991001000012', 650000.00, 580000.00, 'PCS', 140),
    ('a0000002-0000-0000-0000-000000000002', 'c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'Minyakita Bantal 1L', 'MK-01', '8991001000029', 14000.00, 12000.00, 'PCS', 1200),
    ('a0000002-0000-0000-0000-000000000003', 'c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'Gula Pasir Kristal Putih 50KG', 'GL-50', '8991001000036', 780000.00, 710000.00, 'PCS', 48),
    ('a0000002-0000-0000-0000-000000000004', 'c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'Tepung Terigu Segitiga Biru 25KG', 'TB-25', '8991001000043', 245000.00, 215000.00, 'PCS', 85)
ON CONFLICT (id) DO NOTHING;

-- 9. Insert FIFO Product Batches for Beras Rojolele (Testing Oldest First Allocation)
INSERT INTO product_batches (id, tenant_id, product_id, storage_location_id, batch_lot_number, inbound_cost_per_base_unit, initial_base_quantity, remaining_base_quantity, status, received_at)
VALUES 
    -- Batch 1: Arrived 10 days ago (Older - MUST be allocated FIRST under FIFO)
    (
        'f0000001-0000-0000-0000-000000000001',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'a0000002-0000-0000-0000-000000000001',
        'e0000001-0000-0000-0000-000000000001',
        'LOT-RJL-2026-0828',
        575000.00,
        60,
        40, -- 20 already sold, 40 remaining
        'ACTIVE',
        NOW() - INTERVAL '10 days'
    ),
    -- Batch 2: Arrived 2 days ago (Newer - Allocated after Batch 1 is depleted)
    (
        'f0000001-0000-0000-0000-000000000002',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'a0000002-0000-0000-0000-000000000001',
        'e0000001-0000-0000-0000-000000000002',
        'LOT-RJL-2026-0906',
        580000.00,
        100,
        100, -- Full 100 available
        'ACTIVE',
        NOW() - INTERVAL '2 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Wholesale Price Tiers
INSERT INTO product_price_tiers (tenant_id, product_id, tier_name, customer_type, min_quantity, tier_price)
VALUES 
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'a0000002-0000-0000-0000-000000000001', 'Grosir 1', 'WHOLESALE', 5, 617500.00),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'a0000002-0000-0000-0000-000000000001', 'Grosir 2', 'WHOLESALE', 20, 598000.00),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'a0000002-0000-0000-0000-000000000001', 'VIP Langganan', 'AGENT', 1, 572000.00)
ON CONFLICT DO NOTHING;

-- 11. Insert Packaging Unit Conversions
INSERT INTO product_unit_conversions (tenant_id, product_id, unit_name, conversion_factor, unit_price)
VALUES 
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'a0000002-0000-0000-0000-000000000001', 'KARUNG 50KG', 1, 650000.00),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'a0000002-0000-0000-0000-000000000002', 'DUS (12 BTL)', 12, 155000.00),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'a0000002-0000-0000-0000-000000000003', 'KARUNG 50KG', 1, 780000.00),
    ('c4b8e219-9831-482a-bc91-23a9cf8e12d4', 'a0000002-0000-0000-0000-000000000004', 'DUS (25 PACK)', 25, 295000.00)
ON CONFLICT DO NOTHING;

-- 12. Active Cashier Shift for Siti Rahma
INSERT INTO cashier_shifts (id, tenant_id, branch_id, cashier_user_id, device_uuid, opening_float, expected_drawer_cash, status)
VALUES (
    'a0000003-0000-0000-0000-000000000001',
    'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
    'b0000000-0000-0000-0000-000000000001',
    'a0000001-0001-0000-0000-000000000003',
    'dev_pos_counter_01',
    250000.00,
    250000.00,
    'OPEN'
) ON CONFLICT (id) DO NOTHING;
