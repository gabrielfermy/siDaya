# SiDaya Documentation Suite
> **Next-Generation Mobile SaaS by Ashvin Labs for Wholesale Trade, Warehouse Inventory, Surat Jalan & Instant Payments**

Welcome to the central documentation repository for **SiDaya** (developed by **Ashvin Labs**). This project represents an institutional-grade, mobile-first SaaS platform designed to transform how small-to-medium businesses (SMBs / UMKMs), wholesale traders, and distributors manage inventory, process sales orders, dispatch logistics, and collect customer payments.

---

## 🧭 Documentation Navigation & Reading Paths

To accommodate both non-technical stakeholders (investors, business partners, product managers) and technical builders (software engineers, system architects, and autonomous AI coding agents), this documentation suite is partitioned into two dedicated tracks:

```
docs/
├── README.md                                # Master index and system orientation (You are here)
├── business/                                # Tier 1: Investor & Business Stakeholders (Layman-friendly)
│   ├── 01_EXECUTIVE_SUMMARY.md              # Vision, core problem, solution, and executive pitch
│   ├── 02_MARKET_AND_PROBLEM.md             # SMB landscape, competitor comparison (vs Canggih Software e-Nota, Moka)
│   ├── 03_PRODUCT_VALUE_PROPOSITION.md      # Feature parity (Grosir, Inbound FIFO, Surat Jalan) + PayLink & Supabase
│   ├── 04_BUSINESS_MODEL_AND_SAAS_METRICS.md# Modular subscription tiers, payment rake (MDR), unit economics
│   └── 05_GO_TO_MARKET_AND_ROADMAP.md       # Migration from legacy e-Nota, viral PayLink loop, acquisition channels
└── technical/                               # Tier 2: AI Agents & Software Engineers (Implementation-ready)
    ├── 01_SYSTEM_ARCHITECTURE.md            # Modular Monolith, Supabase Realtime CDC, Dynamic Feature Registry
    ├── 02_TECH_STACK_AND_DECISION_LOG.md    # ADRs: React Native/Expo, Supabase/PostgreSQL RLS, WatermelonDB
    ├── 03_OFFLINE_FIRST_AND_SYNC_ENGINE.md  # Local SQLite/WatermelonDB, sub-second Supabase sync, conflict resolution
    ├── 04_DATABASE_SCHEMA_AND_DATA_MODEL.md # Multi-tenant SQL schema, RBAC, shifts, grosir tiers, unit conversions
    ├── 05_API_SPECIFICATION.md              # REST/OpenAPI specs, PIN switch, shift lifecycle, module entitlements
    ├── 06_SECURITY_COMPLIANCE_AND_TENANCY.md# Supabase RLS isolation, cashier PINs, COGS masking, audit logs
    ├── 07_MODULAR_PAYLINK_AND_CHECKOUT.md   # Deep dive: Client PayLink lifecycle, checkout portal, auto-settlement
    └── 08_AI_AGENT_DEVELOPMENT_GUIDE.md     # Feature flags, tenant entitlement guards, and AI coding instructions
```

---

## 🎯 At a Glance: What Makes SiDaya Different?

| Feature Dimension | Traditional Paper / Bon Manual | Legacy POS (Moka, Majoo, Pawoon) | Canggih Software e-Nota | **SiDaya Mobile SaaS** |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Platform** | Paper receipt pads | Bulky Android tablet / Desktop | Android utility app | **Offline-First Native Mobile (iOS & Android) + Responsive Web Backoffice** |
| **Multi-Device Sync** | None (physical paper) | Local network or slow cloud | High latency; frequent sync delays | **Sub-second Supabase Realtime WebSocket engine** |
| **Inbound & Storage Tracking**| Paper supplier delivery slips | Basic inventory counts | Basic stock counter only | **Inbound POs, arrival dates, multi-bin storage (Warehouse/Zone/Bin) & RTV policy** |
| **Stock Rotation & Batch Planning**| Manual memory / spoiled stock | No batch or FIFO tracking | Manual inventory | **Automated FIFO / FEFO Batch Allocation (e.g. rice aging control)** |
| **Logistics & Driver Working Permit**| Handwritten paper Surat Jalan | Extra add-on module | None (manual export) | **Price-Masked Driver Working Permit (*Surat Jalan*) linked to Invoice** |
| **Wholesale & Retail Logic**| Manual mental calculation | Basic wholesale or locked | Eceran, Grosir, customer tiers, 5%+2% | **Native multi-tier pricing, unit conversion & compound discounts** |
| **Hardware Printing** | Pen & carbon paper | Expensive tablet, printer, stand | Bluetooth thermal, WiFi, Dot Matrix | **Bluetooth thermal (58/80mm), WiFi A4 & Dot Matrix ESC/P2** |
| **Tenant User & Shift Mgmt** | Single cashier | Basic employee PIN | Limited multi-cashier tracking | **Universal Multi-Tenant Login, Owner Checkbox Permission Matrix, PIN switch & X/Z shifts** |
| **Customer Payment Loop** | Cash or manual transfer check | Cash / Terminal at store register | Manual payment recording only | **Dynamic PayLink (QRIS, VA, E-Wallet) with auto-reconciliation** |
| **Accounts Receivable (Piutang)**| Manual handwriting in ledger | Complex or extra add-on | Basic unpaid nota list | **Automated Piutang Ledger with PayLink partial settlements** |
| **System Modularity & Plans** | None | Rigid monolithic tiers | Fixed monolithic app with ads | **Pluggable Feature Registry (runtime subscription toggling)** |
| *Operational Modes (Minimarket/Cafe)*| N/A | Included in expensive tiers | Basic toggle | *Deferred to Low-Priority Backlog (Focused on B2B Wholesale & Trade)* |

---

## 🚀 Recommended Reading Paths

### For Investors & Business Stakeholders
If you are evaluating the commercial viability, competitive defensibility, and financial potential of SiDaya:
1. Start with [01_EXECUTIVE_SUMMARY.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/business/01_EXECUTIVE_SUMMARY.md) for the strategic narrative.
2. Read [02_MARKET_AND_PROBLEM.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/business/02_MARKET_AND_PROBLEM.md) to understand market sizing and competitor positioning.
3. Review [03_PRODUCT_VALUE_PROPOSITION.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/business/03_PRODUCT_VALUE_PROPOSITION.md) to see how the user experience and the PayLink engine unlock merchant stickiness.
4. Inspect [04_BUSINESS_MODEL_AND_SAAS_METRICS.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/business/04_BUSINESS_MODEL_AND_SAAS_METRICS.md) for revenue streams, unit economics, and growth projections.
5. Finish with [05_GO_TO_MARKET_AND_ROADMAP.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/business/05_GO_TO_MARKET_AND_ROADMAP.md) for customer acquisition dynamics.

### For Autonomous AI Agents & Developers
If you are tasked with implementing features, database migrations, API endpoints, or mobile user interfaces:
1. Read [08_AI_AGENT_DEVELOPMENT_GUIDE.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/technical/08_AI_AGENT_DEVELOPMENT_GUIDE.md) first to understand structural constraints, coding conventions, and guardrails.
2. Study [01_SYSTEM_ARCHITECTURE.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/technical/01_SYSTEM_ARCHITECTURE.md) and [02_TECH_STACK_AND_DECISION_LOG.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/technical/02_TECH_STACK_AND_DECISION_LOG.md) to grasp the modular monolith topology.
3. Reference [04_DATABASE_SCHEMA_AND_DATA_MODEL.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/technical/04_DATABASE_SCHEMA_AND_DATA_MODEL.md) for canonical database structures and constraints.
4. Reference [07_MODULAR_PAYLINK_AND_CHECKOUT.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/technical/07_MODULAR_PAYLINK_AND_CHECKOUT.md) and [05_API_SPECIFICATION.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/technical/05_API_SPECIFICATION.md) for the end-to-end payment orchestration and API contracts.
5. Review [03_OFFLINE_FIRST_AND_SYNC_ENGINE.md](file:///k:/Personal/bikin%20duit/ashvin-book/docs/technical/03_OFFLINE_FIRST_AND_SYNC_ENGINE.md) before writing any client-side state or synchronization code.
