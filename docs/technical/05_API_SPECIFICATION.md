# API Specification & Contracts
> **RESTful OpenAPI Standards, Multi-Tenant Headers, Request/Response Payloads & Webhook Contracts**

---

## 1. Global API Standards & Conventions

* **Base URL**: `https://api.sidaya.id/api/v1`
* **Protocol**: HTTPS / TLS 1.3
* **Content Negotiation**: `Content-Type: application/json; charset=utf-8`
* **Standard Error Representation**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INSUFFICIENT_STOCK",
      "message": "Product 'Beras Rojolele' has only 2 units available.",
      "details": { "product_id": "prod_01JA98Z", "requested": 5, "available": 2 }
    }
  }
  ```

---

## 2. Global Request Headers

| Header | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | Yes (Private APIs) | String | `Bearer <JWT_ACCESS_TOKEN>` |
| `X-Tenant-ID` | Yes (Private APIs) | UUID | Tenant workspace context identifier |
| `Idempotency-Key` | Recommended (Mutations) | UUID | Unique client nonce to prevent duplicate charges or order creation |
| `X-Client-Version` | Optional | String | e.g., `sidaya-mobile/1.2.0 (android)` |

---

## 3. Core API Endpoints

---

### A. Authentication, Multi-Tenant Resolution & Staff Permissions

#### `POST /auth/login`
Universal credential login for Web Backoffice and Mobile Application.

```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "budi@berasjaya.com",
  "password": "PasswordRahasia123"
}
```

```json
{
  "success": true,
  "data": {
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u0000001-0000-0000-0000-000000000001",
      "full_name": "Budi Santoso",
      "email": "budi@berasjaya.com",
      "phone_number": "081298765432"
    },
    "tenants": [
      {
        "tenant_id": "a0000001-0000-0000-0000-000000000001",
        "business_name": "Toko Grosir Beras Jaya Bersama",
        "subdomain": "berasjaya",
        "role": "OWNER",
        "permissions": ["pos:checkout", "warehouse:inbound", "logistics:dispatch", "catalog:view_cogs", "finance:reports", "staff:manage"]
      }
    ],
    "active_tenant": {
      "tenant_id": "a0000001-0000-0000-0000-000000000001",
      "business_name": "Toko Grosir Beras Jaya Bersama",
      "role": "OWNER"
    }
  }
}
```

#### `GET /auth/me`
Retrieves current authenticated profile, active tenant workspace, and granted permission checkboxes.

```http
GET /api/v1/auth/me HTTP/1.1
Authorization: Bearer <JWT_ACCESS_TOKEN>
X-Tenant-ID: a0000001-0000-0000-0000-000000000001
```

```json
{
  "success": true,
  "data": {
    "user_id": "u0000001-0000-0000-0000-000000000001",
    "full_name": "Budi Santoso",
    "tenant_id": "a0000001-0000-0000-0000-000000000001",
    "role": "OWNER",
    "permissions": [
      "pos:checkout",
      "pos:void",
      "pos:apply_discount",
      "shifts:operate",
      "shifts:reconcile",
      "catalog:view",
      "catalog:manage",
      "catalog:view_cogs",
      "warehouse:inbound",
      "warehouse:adjust",
      "warehouse:fifo",
      "logistics:dispatch",
      "logistics:driver_view",
      "finance:piutang_view",
      "finance:piutang_settle",
      "finance:reports",
      "staff:manage",
      "settings:manage"
    ]
  }
}
```

#### `POST /auth/select-tenant`
Switches active tenant workspace for multi-store owners or managers.

```http
POST /api/v1/auth/select-tenant HTTP/1.1
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json

{
  "tenant_id": "a0000002-0000-0000-0000-000000000001"
}
```

```json
{
  "success": true,
  "data": {
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "active_tenant": {
      "tenant_id": "a0000002-0000-0000-0000-000000000001",
      "business_name": "CV Sembako Nusantara Makmur",
      "role": "OWNER",
      "permissions": ["*"]
    }
  }
}
```

#### `PUT /staff/:id/permissions`
Store owner updates an employee's capability checkboxes.

```http
PUT /api/v1/staff/u0000002-0000-0000-0000-000000000001/permissions HTTP/1.1
Authorization: Bearer <OWNER_JWT_TOKEN>
X-Tenant-ID: a0000001-0000-0000-0000-000000000001
Content-Type: application/json

{
  "permissions": [
    "pos:checkout",
    "pos:apply_discount",
    "shifts:operate",
    "catalog:view",
    "warehouse:inbound"
  ]
}
```

```json
{
  "success": true,
  "data": {
    "staff_id": "u0000002-0000-0000-0000-000000000001",
    "full_name": "Siti Rahma",
    "role": "CASHIER",
    "updated_permissions": [
      "pos:checkout",
      "pos:apply_discount",
      "shifts:operate",
      "catalog:view",
      "warehouse:inbound"
    ]
  }
}
```

#### `POST /auth/pin-switch`
High-speed station cashier switch on shared counter devices without entering full passwords.

```http
POST /api/v1/auth/pin-switch HTTP/1.1
Authorization: Bearer <STATION_DEVICE_TOKEN>
X-Tenant-ID: a0000001-0000-0000-0000-000000000001
Content-Type: application/json

{
  "pin": "2468",
  "device_uuid": "dev_pos_counter_01"
}
```

```json
{
  "success": true,
  "data": {
    "cashier_user": {
      "id": "u0000002-0000-0000-0000-000000000001",
      "full_name": "Siti Rahma",
      "role": "CASHIER",
      "permissions": ["pos:checkout", "shifts:operate", "catalog:view", "warehouse:inbound"]
    },
    "active_shift": {
      "id": "shf_01992",
      "status": "OPEN",
      "opening_float": 250000
    },
    "session_token": "eyJhbGciOiJIUz..."
  }
}
```

---

### B. Shift & Cash Drawer Lifecycle

#### `POST /shifts/open`
Opens a new cashier shift with opening cash float.

```json
{
  "branch_id": "brn_tanah_abang_01",
  "opening_float": 250000,
  "device_uuid": "dev_pos_counter_01",
  "notes": "Shift pagi lancar"
}
```

#### `POST /shifts/close`
Closes active shift, reconciles physical cash, and generates the immutable Z-Report.

```json
{
  "shift_id": "shf_01992",
  "actual_drawer_cash": 1845000,
  "notes": "Pecahan 50rb lengkap"
}
```

```json
{
  "success": true,
  "data": {
    "shift_id": "shf_01992",
    "opening_float": 250000,
    "cash_sales_total": 1600000,
    "digital_sales_total": 2450000,
    "cash_drops_total": 0,
    "expected_drawer_cash": 1850000,
    "actual_drawer_cash": 1845000,
    "cash_variance": -5000,
    "status": "CLOSED",
    "z_report_number": "ZR-20260908-001"
  }
}
```

---

### C. Tenant Feature Entitlements (Dynamic Modularity)

#### `GET /tenants/me/entitlements`
Returns active feature flags and operational limits for runtime UI toggles.

```json
{
  "success": true,
  "data": {
    "plan_tier": "GROSIR_PRO",
    "entitlements": {
      "core:pos": true,
      "fintech:paylink": true,
      "wholesale:multi_tier": true,
      "wholesale:compound_discounts": true,
      "wholesale:unit_conversions": true,
      "hardware:dot_matrix": true,
      "finance:piutang": true,
      "staff:rbac_shifts": true,
      "sync:supabase_realtime": true,
      "omnichannel:marketplace_sync": false,
      "hospitality:restaurant_mode": false
    },
    "limits": {
      "max_devices": 3,
      "max_staff": 10
    }
  }
}
```

---

### D. Wholesale Catalog, Tiers & Unit Conversions

#### `POST /products/:id/price-tiers`
Configures wholesale tiered pricing (*Eceran vs Grosir*).

```json
{
  "tier_name": "Grosir 1",
  "min_quantity": 12,
  "tier_price": 68000,
  "customer_type": "WHOLESALE"
}
```

#### `POST /products/:id/unit-conversions`
Sets up unit multipliers (e.g., 1 Dus = 12 Lusin = 144 PCS).

```json
{
  "unit_name": "DUS",
  "conversion_factor": 144,
  "barcode": "8992753001928",
  "unit_price": 792000
}
```

---

### E. Orders & Compound Discounts

#### `POST /orders`
Creates a new retail or wholesale sales order with compound discount calculation (`5% + 2% + Rp 1,000`).

```json
{
  "branch_id": "brn_tanah_abang_01",
  "customer_id": "cust_budi_01",
  "order_type": "GROSIR",
  "items": [
    {
      "product_id": "prod_01JA98Z",
      "selected_unit": "DUS",
      "quantity": 2,
      "unit_price": 792000
    }
  ],
  "compound_discount": {
    "percent_1": 5.0,
    "percent_2": 2.0,
    "fixed_amount": 10000
  },
  "payment_method": "PAYLINK_QRIS"
}
```

```json
{
  "success": true,
  "data": {
    "order_id": "ord_881920",
    "order_number": "INV/20260908/0001",
    "subtotal": 1584000,
    "discount_breakdown": {
      "step_1_percent_5": 79200,
      "step_2_percent_2": 30096,
      "step_3_fixed": 10000,
      "discount_total": 119296
    },
    "total_amount": 1464704,
    "payment_status": "UNPAID",
    "paylink_url": "https://pay.sidaya.id/p/inv_881920"
  }
}
```

---

### F. Accounts Receivable (Piutang & Kasbon)

#### `POST /piutang/:id/settle`
Records full or partial payment of customer debt, with instant PayLink generation if digital.

```json
{
  "amount_paid": 500000,
  "payment_method": "PAYLINK_QRIS",
  "notes": "Cicilan ke-1"
}
```

---

### G. Hardware Printers Profile

#### `POST /printers`
Registers a Bluetooth thermal printer or Dot Matrix Continuous Form printer.

```json
{
  "branch_id": "brn_tanah_abang_01",
  "printer_name": "Epson LX-310 Dot Matrix",
  "driver_type": "DOT_MATRIX_ESC_P2",
  "connection_type": "NETWORK_WIFI",
  "ip_address": "192.168.1.150",
  "paper_width_mm": 210,
  "is_default": true
}
```

---

### H. Inbound Procurement & Goods Receiving

#### `POST /inventory/receive`
Records the physical arrival of goods from a supplier, assigns them to a storage bin, records arrival/milling dates, and establishes the supplier return policy window (RTV).

```json
{
  "supplier_id": "sup_beras_makmur_01",
  "supplier_po_id": "po_in_0912",
  "carrier_name": "Truk Ekspedisi Jawa Logistik",
  "delivery_vehicle_plate": "B 9123 TX",
  "delivery_note_ref": "SJ-PABRIK-8812",
  "return_policy_days": 7,
  "return_policy_terms": "Maksimal retur 7 hari jika kemasan sobek atau kadar air tinggi / kutu",
  "items": [
    {
      "product_id": "prod_01JA98Z",
      "batch_lot_number": "LOT-ROJO-20260908-01",
      "storage_location_id": "loc_wh1_zone_rice_rack_b04",
      "harvest_or_milling_date": "2026-09-02",
      "quantity_received": 100,
      "received_unit": "KARUNG 50KG",
      "unit_cost_price": 620000
    }
  ]
}
```

```json
{
  "success": true,
  "data": {
    "shipment_id": "rcv_99210",
    "shipment_number": "RCV/20260908/001",
    "received_at": "2026-09-08T10:15:00Z",
    "batches_created": [
      {
        "batch_id": "bat_8820",
        "lot_number": "LOT-ROJO-20260908-01",
        "location": "Gudang Utama -> Zona Beras -> Rak B-04",
        "base_units_added": 100
      }
    ],
    "return_policy_deadline": "2026-09-15T23:59:59Z"
  }
}
```

---

### I. FIFO Batch Dispatch Planning

#### `GET /inventory/batches/suggest-allocation`
Suggests the exact batches and storage locations to pick from for an upcoming sales order, following strict **FIFO (First In, First Out)** rotation to ensure older grain/stock is dispatched first.

```http
GET /api/v1/inventory/batches/suggest-allocation?product_id=prod_01JA98Z&requested_quantity=20 HTTP/1.1
Authorization: Bearer <TOKEN>
X-Tenant-ID: c4b8e219-9831-482a-bc91-23a9cf8e12d4
```

```json
{
  "success": true,
  "data": {
    "product_id": "prod_01JA98Z",
    "requested_units": 20,
    "strategy": "FIFO",
    "pick_allocations": [
      {
        "batch_id": "bat_7701",
        "lot_number": "LOT-ROJO-20260825-01",
        "milling_date": "2026-08-25",
        "storage_location": "Gudang Utama -> Zona Beras -> Rak B-01",
        "quantity_to_pick": 15,
        "remaining_after_pick": 0
      },
      {
        "batch_id": "bat_8820",
        "lot_number": "LOT-ROJO-20260901-01",
        "milling_date": "2026-09-01",
        "storage_location": "Gudang Utama -> Zona Beras -> Rak B-04",
        "quantity_to_pick": 5,
        "remaining_after_pick": 95
      }
    ]
  }
}
```

---

### J. Outbound Logistics: Driver Working Permits (*Surat Jalan*)

#### `POST /logistics/surat-jalan`
Generates an official Driver Working Permit (*Surat Jalan* / Delivery Order) linked to the sales invoice.
> **Security & Privacy Guard**: All monetary amounts are stripped from the driver manifest to prevent profit margin leaks.

```json
{
  "order_id": "ord_881920",
  "driver_name": "Agus Santoso",
  "driver_phone": "+6281299887766",
  "vehicle_plate_number": "B 1234 KAA",
  "destination_address": "Jl. K.H. Mas Mansyur No. 42, Tanah Abang, Jakarta Pusat",
  "recipient_name": "Toko Beras Barokah (Ibu Haryati)",
  "recipient_phone": "+6281355443322",
  "delivery_instructions": "Kirim sebelum jam 14.00, masuk lewat pintu bongkar samping"
}
```

```json
{
  "success": true,
  "data": {
    "delivery_order_id": "do_0042",
    "do_number": "SJ/20260908/0042",
    "linked_invoice_number": "INV/20260908/0001",
    "driver_name": "Agus Santoso",
    "vehicle_plate": "B 1234 KAA",
    "qr_verification_token": "tok_sj_99812abc",
    "manifest": [
      {
        "product_name": "Beras Rojolele Super",
        "lot_number": "LOT-ROJO-20260825-01",
        "storage_bin": "Gudang Utama -> Rak B-01",
        "quantity": 15,
        "unit": "KARUNG 50KG"
      },
      {
        "product_name": "Beras Rojolele Super",
        "lot_number": "LOT-ROJO-20260901-01",
        "storage_bin": "Gudang Utama -> Rak B-04",
        "quantity": 5,
        "unit": "KARUNG 50KG"
      }
    ],
    "verification_url": "https://nota.sidaya.id/sj/tok_sj_99812abc",
    "note": "Monetary values strictly omitted from driver permit manifest for commercial security."
  }
}
```

---

### K. Control Plane Endpoints: Ashvin Labs Platform Operator & Fleet Telemetry

#### `POST /api/v1/admin/auth/login`
Authenticates an Ashvin Labs staff member (`@ashvinlabs.com`) and returns an operator session with granted administrative capabilities.

```json
{
  "email": "gabriel@ashvinlabs.com",
  "password": "operator_secure_pass"
}
```

```json
{
  "success": true,
  "data": {
    "operator_id": "op_001",
    "email": "gabriel@ashvinlabs.com",
    "full_name": "Gabriel (CEO)",
    "role": "SUPER_ADMIN",
    "capabilities": ["tenants:view", "tenants:manage_subscription", "tenants:breakglass", "system:telemetry", "system:audit"],
    "token": "tok_admin_sess_99812"
  }
}
```

#### `GET /api/v1/admin/tenants`
Lists all active, trialing, and suspended merchant tenants with subscription usage.
> **Privacy Masking**: If called by `OPS_SUPPORT`, customer contacts and commercial volumes are redacted.

```json
{
  "success": true,
  "data": [
    {
      "tenant_id": "c4b8e219-9831-482a-bc91-23a9cf8e12d4",
      "business_name": "Toko Grosir Beras Jaya Bersama",
      "owner_name": "Budi Santoso",
      "owner_phone": "+6281234567890",
      "subscription_tier": "PRO",
      "status": "ACTIVE",
      "active_users_count": 4,
      "storage_lots_count": 2,
      "monthly_gmv": 428500000,
      "created_at": "2026-08-01T00:00:00Z"
    }
  ]
}
```

#### `PUT /api/v1/admin/tenants/:id/subscription`
Updates a tenant's subscription tier or lifecycle status (`ACTIVE`, `SUSPENDED`, `GRACE_PERIOD`). Automatically creates an immutable audit log record.

```json
{
  "subscription_tier": "ENTERPRISE",
  "status": "ACTIVE",
  "reason": "Merchant upgraded to Enterprise tier for multi-warehouse routing"
}
```

#### `GET /api/v1/admin/telemetry`
Returns aggregated platform-wide telemetry: total GMV across all tenants, active merchant count, API p95 response time, and database connection pool health.

#### `POST /api/v1/admin/tenants/:id/breakglass`
Requests a temporary, time-bounded technical debug session on a specific tenant. Requires a valid support ticket reference and writes an un-deletable audit log under UU PDP compliance.

