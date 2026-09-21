<div align="center">

# ⚡ SiDaya
### Institutional-Grade Mobile SaaS & ERP for Wholesale Distribution & Trade

[![CI](https://github.com/gabrielfermy/siDaya/actions/workflows/ci.yml/badge.svg)](https://github.com/gabrielfermy/siDaya/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange.svg?logo=pnpm)](https://pnpm.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![Security VAPT Grade A+](https://img.shields.io/badge/VAPT_Security-Grade_A%2B_(100%25)-emerald.svg)](reports/security/latest.md)
[![UU PDP Compliant](https://img.shields.io/badge/UU_PDP-No._27%2F2022-emerald.svg)](docs/technical/06_SECURITY_COMPLIANCE_AND_TENANCY.md)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

<p align="center">
  <strong>SiDaya</strong> (by <strong>Ashvin Labs</strong>) is a next-generation, mobile-first SaaS operating system designed specifically for Indonesian wholesale merchants (<em>grosir sembako, beras, bahan bangunan, distributor FMCG</em>) and distribution fleets.
</p>

[Explore Documentation](docs/README.md) •
[Package Manifest](docs/technical/12_PACKAGE_AND_MODULE_MANIFEST.md) •
[Security & VAPT Report](reports/security/latest.md) •
[Dual Payment Engine](docs/technical/09_DUAL_PATH_AND_PLUGGABLE_PAYMENT_ENGINE.md) •
[API Specification](docs/technical/05_API_SPECIFICATION.md)

</div>

---

## 🌐 3-Tier Operating Environments

SiDaya operates across 3 strictly separated tiers with automated HTTPS domain resolution:

| Tier / Environment | Merchant Plane (Tenants) | Operator Control Plane | PayLink Checkout Portal | Core API Endpoint | Infrastructure & Data Invariants |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Local (Dev)** | `https://sidaya.test`<br>`https://[tenant].sidaya.test` | `https://ops.sidaya.test` | `https://pay.sidaya.test` | `https://api.sidaya.test`<br>(Backend `:4000`) | **100% UI/UX, Security & Architecture Parity with Production**. Standard port 443 with internal TLS via Caddy. Cash transactions use simulated/sandbox providers with full dual-topology backend readiness. HMR instant refresh. |
| **Staging** | `https://sidaya.my.id`<br>`https://[tenant].sidaya.my.id` | `https://ops.sidaya.my.id` | `https://pay.sidaya.my.id` | `https://api.sidaya.my.id` | **100% Workflow & Security Rehearsal**. Data is destructible/resettable, with the exact same database schema, RLS policies, and invariant checks as production. |
| **Production** | `https://sidaya.biz.id`<br>`https://[tenant].sidaya.biz.id` | `https://ops.sidaya.biz.id` | `https://pay.sidaya.biz.id` | `https://api.sidaya.biz.id` | **100% User-Ready, Bug-Free Live System**. Live settlement via iPaymu, Midtrans, and Xendit; multi-tenant RLS PostgreSQL data isolation; zero demo credentials in UI. |

---

## 🔐 Internal & Test Credentials Matrix (Zero-Leak UI)

> [!IMPORTANT]
> **Production Hardening Notice**: To prevent unauthorized access and adhere to institutional security standards, all demo accounts and quick-login helpers are strictly removed from the user interface. Use the verified credentials below for local development, QA testing, and security audits:

### 1. Merchant Workspace Plane (`https://berasjaya.sidaya.test` / `https://sidaya.test/login`)
| Role / Station | Account Name | Email / Identifier | Password | Fast Station PIN | Permissions & Capabilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **👑 Toko Owner** | Budi Santoso | `budi@berasjaya.com` | `Password123!` | `1234` | Full workspace access, billing, team management, custom pricing tiers. |
| **💳 Kasir Utama (POS)** | Siti Rahma | `siti@berasjaya.com` | `Password123!` | `1234` | POS Grosir, barcode lookup, invoice printing, WhatsApp PayLink sharing, shift close. |
| **📦 Kepala Gudang** | Agus Santoso | `agus@berasjaya.com` | `Password123!` | `1234` | Inbound receiving, Lot FIFO indexing, expiry alerts, stock opname adjustments. |
| **🚚 Supir Logistik** | Joko Supir | `joko@berasjaya.com` | `Password123!` | `1234` | Surat Jalan execution, digital signature capture, GPS geotagged photo proof (POD). |

### 2. Platform Operator Control Plane (`https://ops.sidaya.test` / `https://ops.sidaya.biz.id`)
| Role | Operator Name | Corporate Email | Password | Capabilities & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **⚡ SUPER_ADMIN** | Gabriel (CEO) | `gabriel@ashvinlabs.com` | `Password123!` | Fleet-wide telemetry, subscription overrides, break-glass forensic audit. |
| **🛠️ DEV_ENGINEER** | Alex (Lead Dev) | `alex@ashvinlabs.com` | `Password123!` | System metrics (p95 latency, DB pool), API route inspection, error logs. |
| **🎧 OPS_SUPPORT** | Dina (Customer Ops) | `dina@ashvinlabs.com` | `Password123!` | Tenant directory inspection with UU PDP PII masking (`+6281****7890`). |

---

## 💎 SaaS Subscription Pricing Matrix

| Feature Dimension | 🟢 Perintis (Supplier Mandiri) | 🔵 Starter (Toko & Agen) | 🟣 Grosir Pro (Distributor & Agen) <br>*(Paling Diminati)* | 🟡 Enterprise Fleet (Jaringan Distribusi) |
| :--- | :--- | :--- | :--- | :--- |
| **Monthly Pricing** | **Rp 0** / Gratis Selamanya | **Rp 149.000** / bln | **Rp 399.000** / bln | **Rp 899.000** / bln |
| **Cabang / Gudang** | 1 Lokasi Usaha Mandiri | 1 Lokasi Usaha | Hingga 3 Cabang / Gudang | **Unlimited Cabang & Multi-Gudang** |
| **Akun Staf** | 1 Akun Pemilik (Solo) | 3 Akun Staf (Owner + 2 Kasir) | **Unlimited Akun Staf** | **Unlimited Akun Staf** |
| **POS & Nota** | POS Cepat & Struk WhatsApp PDF | POS Kasir & Rekap Shift | POS Grosir & Barcode Scanner | Custom Multi-Station POS |
| **Harga Grosir** | Harga Satuan Standar | Multi-Tier (Ecer/Grosir) & Dus/Pcs | Multi-Tier Dinamis per Segmen | Custom Pricing Matrix ERP |
| **Inbound FIFO & Expiry**| Stok Sederhana | Stok Minimum & Reorder Alert | **✓ Inbound Lot FIFO & Expiry Alerts** | **✓ Multi-Gudang FIFO & Transfer Batch**|
| **Surat Jalan & POD** | — | — | **✓ Digital POD + Foto GPS & TTD** | **✓ Fleet Route Dispatch & Manifests** |
| **Fintech PayLink** | **Managed PayLink** (QRIS/VA) | **Managed PayLink** (QRIS/VA) | **Bebas: Managed ATAU BYOK Gateway** | **Dedicated Gateway BYOK + Multi-VA** |
| **Subdomain Toko** | `[toko].sidaya.biz.id` | `[toko].sidaya.biz.id` | `[toko].sidaya.biz.id` + SSL | **Custom Domain Sendiri** (`pos.namatoko.com`) |
| **Open API & Webhooks** | — | — | — | **✓ Full Webhook & ERP Integration** |
| **SLA & Support** | Komunitas & Panduan Mandiri | Standar Jam Kerja | Prioritas WhatsApp | **Dedicated 24/7 Account Manager (99.9%)**|

---

## 🚀 Local HTTPS Zero-Port Setup

Run the full platform locally on standard port 443 without any port numbers in the URL:

### 1. Add Local Domain Mappings (`hosts` file)
Edit `C:\Windows\System32\drivers\etc\hosts` (Windows) or `/etc/hosts` (macOS/Linux) and add:
```
127.0.0.1  sidaya.test ops.sidaya.test pay.sidaya.test api.sidaya.test berasjaya.sidaya.test sembakonusantara.sidaya.test
```

### 2. Start Services
```bash
# Terminal 1: Core API & Payment Engine (Port 4000)
pnpm run dev:api

# Terminal 2: Customer PayLink Web Portal (Port 3000)
pnpm run dev:web

# Terminal 3: Modular Prototype Server with Live Reload (Port 3333)
pnpm run dev:preview

# Terminal 4: Caddy Local HTTPS Reverse Proxy (Port 443)
caddy run
```

Access locally via browser:
- Public Landing Page: `https://sidaya.test`
- Workspace Login: `https://sidaya.test/login`
- Tenant Workspace: `https://berasjaya.sidaya.test`
- Operator Control Plane: `https://ops.sidaya.test`
- PayLink Checkout: `https://pay.sidaya.test/p/tok_demo_01`

---

## 🧪 Automated Continuous Security (VAPT)

Run the continuous security and cryptographic verification test suite:

```bash
pnpm run test:security
```

**Scorecard (Grade A+ 100% - 14/14 Invariants Verified)**:
- `[SEC-PAY-01]` Midtrans HMAC-SHA512 Webhook Signature Verification
- `[SEC-PAY-02]` Duitku MD5 Signature & Constant-Time Comparison
- `[SEC-PAY-05]` iPaymu API v2 HMAC-SHA256 Webhook Verification & Normalization
- `[SEC-PAY-03]` Open Payment Adapter Protocol (OPAP) Tenant Signature Check
- `[SEC-PAY-04]` Dual-Topology Payment Separation (Path 1 Platform vs Path 2 Merchant)
- `[SEC-TENANT-01]` Tenant Isolation & Anti-IDOR Boundary Enforcement
- `[SEC-RBAC-01]` Zero-Trust RBAC Header Injection Resistance
- `[SEC-DB-01]` Database RLS Session Context SQLi & Sanitization Resistance
- `[SEC-AUTH-01]` Salted Scrypt Password Hashing & NIST SP 800-63B Compliance
- `[SEC-AUTH-02]` High-Speed Cashier Station PIN Cryptographic Hashing
- `[SEC-AUTH-03]` Cryptographic JWT Signing & Payload Tampering Detection
- `[SEC-FIN-01]` Constant-Time Cryptographic Comparison (`timingSafeEqual`)
- `[SEC-CRYPTO-01]` Tenant BYOK Payment Key Encryption at Rest (AES-256-GCM)
- `[SEC-PRIVACY-01]` Logistics Driver Manifest Commercial Margin Shielding (UU PDP)

---

## 🏛️ Monorepo Package Topology

```
siDaya/
├── apps/
│   ├── mobile/                    # Native iOS & Android POS & Logistics client (React Native / Expo)
│   └── paylink-web/               # Customer-facing dynamic PayLink portal (QRIS, VA, E-Wallet)
├── packages/
│   ├── shared-types/              # Zero-dependency TypeScript models, DTOs, feature keys & RBAC enums
│   ├── database/                  # PostgreSQL migrations, schema DDL, RLS policies & seed scripts
│   ├── hardware-core/             # ESC/POS thermal & ESC/P2 dot-matrix multi-ply invoice printing
│   ├── payment-core/              # iPaymu, Midtrans, Xendit, and Duitku payment gateway integrations
│   └── api-core/                  # Core domain services (Orders, Shifts, FIFO, Surat Jalan, Admin API)
├── preview/                       # Interactive prototype with zero-leak UI & Public Landing Page
├── reports/security/              # VAPT audit logs and cryptographic assessment scorecards
└── Caddyfile                      # Local HTTPS zero-port reverse proxy configuration
```

---

## 👥 Contributors & Ownership

- **Lead Architecture & Engineering**: Ashvin Labs Core Team ([@gabrielfermy](https://github.com/gabrielfermy))
- **Product & Commercial Direction**: Ashvin Labs Enterprise Solutions
- **Repository**: [github.com/gabrielfermy/siDaya](https://github.com/gabrielfermy/siDaya)

<div align="center">
  <sub>Built with precision by Ashvin Labs for Indonesian Commerce. Copyright © 2026 Ashvin Labs. All Rights Reserved.</sub>
</div>
