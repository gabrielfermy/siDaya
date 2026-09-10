# Technology Stack & Architecture Decision Records (ADR)
> **Comprehensive Technology Selection Rationale for SiDaya (by Ashvin Labs): Trade-Off Analyses, Architecture Decisions, and Lifecycle Constraints**

---

## 1. Complete Technology Stack Matrix

| Tier / Layer | Technology Selected | Rationale & Trade-Offs |
| :--- | :--- | :--- |
| **Mobile Client** | **React Native (Expo SDK 51+)** | Unified iOS & Android codebase, native 60fps performance, rapid OTA updates via EAS, mature barcode & Bluetooth printer ecosystem. |
| **Mobile State & Local DB** | **WatermelonDB + OP-SQLite (JSI)** | True offline-first relational database on mobile. Direct C++ JSI bindings allow querying 10,000 products in < 16ms without bridging lag. |
| **Realtime Sync Backbone** | **Supabase Realtime (WebSockets CDC)** | Sub-second Change Data Capture (CDC) streaming changes from PostgreSQL WAL directly to all tenant stations, eliminating legacy sync lag. |
| **Client PayLink Web Portal** | **Next.js (App Router) + Tailwind CSS** | Server-side rendered (SSR) lightweight checkout page. Zero-install for buyers, instant initial load (< 800ms) on 3G cellular. |
| **Merchant Web Backoffice** | **Next.js (App Router) + Responsive CSS** | Zero-install desktop and tablet backoffice for owners and warehouse managers (Supabase Auth, Tenant Switcher, Inbound POs, Surat Jalan, Checkbox Permissions). |
| **Backend Core** | **Node.js (LTS) + TypeScript + Fastify** | High-throughput, low-overhead event-loop server. Fastify provides schema-based JSON serialization 2x faster than Express. |
| **Primary Database** | **PostgreSQL 16 (Supabase Stack + RLS)** | ACID transactional integrity for financial ledgers and stock counts; native Row-Level Security (RLS) for tenant isolation and COGS privacy masking. |
| **Cache & Queue Broker** | **Redis 7 + BullMQ** | Ultra-fast queue management for background PDF rendering, WhatsApp dispatch, webhook retries, and in-memory rate limiting. |
| **Hardware Printer Drivers** | **ESC/POS & Epson ESC/P2 Drivers** | Native Bluetooth thermal printing (58mm/80mm) + Continuous Form Dot Matrix printing for Indonesian B2B grosir carbon-copy invoices. |
| **Payment Gateway Rails** | **Unified Payment Adapter (Midtrans / Xendit)** | Aggregates National QRIS, Virtual Accounts (BCA, Mandiri, BRI, BNI), and E-Wallets (GoPay, OVO, ShopeePay) under a single API contract. |
| **Object Storage** | **Cloudflare R2 / AWS S3** | S3-compatible, zero-egress fee storage for generated PDF invoices, merchant logos, and digital receipt snapshots. |

---

## 2. Architecture Decision Records (ADRs)

---

### ADR-01: React Native (Expo) for Mobile Client Application

* **Status**: Approved
* **Context**:
  SMB merchants require an application that runs natively on low-to-mid tier Android smartphones (e.g., Xiaomi, Samsung Galaxy A-series) and iPhones. The app must interface directly with hardware peripherals (camera for barcode scanning, Bluetooth for 58mm thermal receipt printers).
* **Decision**:
  Adopt **React Native with Expo** (Managed Workflow with Custom Config Plugins).
* **Consequences**:
  * *Pros*: Single codebase for iOS and Android; hot-reloading accelerates development; EAS Build provides reliable cloud builds.
  * *Critical Lifecycle Constraints*:
    > [!IMPORTANT]
    > **Expo OTA Updates vs. Fast Refresh Lifecycle Constraint**:
    > When diagnosing unexpected double-mounts, app restarts, or animation loops, developers and AI agents must verify if testing a standalone build (EAS) vs. Expo Go. If testing a standalone build, `expo-updates` background downloads apply an OTA update that reboots the JavaScript context and remounts the root layout. Do not dismiss restarts as dev environment quirks if `expo-updates` is active in `app.json`.

---

### ADR-02: Offline-First Local Database (WatermelonDB + OP-SQLite via JSI)

* **Status**: Approved
* **Context**:
  Traditional mobile apps query a remote REST API on every screen tap. In developing markets, retail merchants experience frequent signal drops, cellular throttling, or store basements with zero reception. If checkout freezes, customers walk away.
* **Decision**:
  Implement an **offline-first local database** on the mobile client using **WatermelonDB** backed by **OP-SQLite** (using JavaScript Interface / JSI).
* **Consequences**:
  * *Pros*: Zero latency: Reading and writing products, orders, and local stock counts occurs directly against local SQLite. Queries are observable via RxJS.
  * *Cons*: Requires an explicit delta synchronization engine to reconcile local mutations with the PostgreSQL cloud backend.

---

### ADR-03: Supabase Realtime CDC over Persistent WebSockets for Multi-Station Sync

* **Status**: Approved
* **Context**:
  The #1 complaint against incumbent tools like Canggih Software's e-Nota is severe multi-device synchronization latency: creating an invoice on Register A takes minutes to appear on Register B or the warehouse tablet, causing duplicate receipts and stock discrepancies.
* **Decision**:
  Deploy **Supabase Realtime** connected to PostgreSQL logical replication (`pgoutput`).
* **Consequences**:
  * *Pros*:
    * Whenever an order, payment, or stock movement is committed to PostgreSQL, a CDC event streams over WebSockets to all subscribed devices for that `tenant_id` in < 200ms.
    * Devices automatically re-sync their local SQLite state upon reconnection without polling.
  * *Cons*: Requires maintaining active WebSocket connections and handling heartbeat reconnection logic on mobile.

---

### ADR-04: Pluggable Feature Registry & Dynamic Tenant Entitlement Engine

* **Status**: Approved
* **Context**:
  The product must remain blazing fast and unbloated for solo retail merchants, while offering wholesale multi-tier pricing, dot matrix continuous form drivers, and restaurant table management to higher-tier subscribers. When a tenant upgrades or downgrades their plan, features must enable or disable instantly without requiring an app store update or code redeployment.
* **Decision**:
  Implement a central **Tenant Entitlement Service** and canonical `FeatureKey` enum.
* **Consequences**:
  * *Backend*: Guarded by `@RequireEntitlement(FeatureKey)` decorators.
  * *Frontend*: Guarded by `useFeatureEntitlement(FeatureKey)` hook that dynamically renders or suppresses UI views and workflows.
  * *Plan Upgrades*: Handled in real time via Supabase Realtime broadcast to the merchant app.

---

### ADR-05: Cashier Shift Management, Quick PIN Switching & COGS Data Masking

* **Status**: Approved
* **Context**:
  In Indonesian wholesale and retail shops, counter cashiers frequently share a single tablet or phone across shifts. Store owners demand strict drawer cash float reconciliation (opening float, cash drops, end-of-day X/Z reports) and insist that employees must never see business profit margins or cost-of-goods-sold (*harga modal*).
* **Decision**:
  Implement a dedicated **Shift Management & Quick PIN Switch Service** combined with PostgreSQL Row-Level Security (RLS) data masking.
* **Consequences**:
  * *Pros*: Cashiers switch in 3 seconds by tapping a 4-digit PIN. Cash variance is recorded on close.
  * *Security*: PostgreSQL RLS ensures cashiers cannot query `cost_price` on catalog products.

---

### ADR-06: Domain-Driven Modular Monolith on Backend

* **Status**: Approved
* **Context**:
  The system must be highly modular so features (e.g., PayLink, Multi-Tier Pricing, Hardware Drivers, Marketplace Sync) can be added or refactored independently without breaking core POS and checkout reliability. Full microservices would introduce excessive operational overhead during early stages.
* **Decision**:
  Architect the backend as a **Domain-Driven Modular Monolith** within a single deployable unit, enforcing strict logical boundaries.
* **Consequences**:
  * Each module has its own internal folder, services, and repositories.
  * Modules cannot import internal files from other modules.
  * Cross-module communication occurs strictly through public interfaces or the Asynchronous Domain Event Bus.

---

### ADR-07: Unified Payment Gateway Adapter Pattern

* **Status**: Approved
* **Context**:
  To support the user's primary differentiator—the Client PayLink Backend—the platform must issue payment links and accept automated callbacks from payment rails.
* **Decision**:
  Implement a provider-agnostic **Payment Gateway Adapter Pattern** (`IPaymentGatewayProvider`).
* **Consequences**:
  * Switching or adding payment providers (Midtrans, Xendit, Doku) requires only authoring a new adapter class. Core order and inventory workflows remain untouched.

---

### ADR-08: Hybrid WhatsApp Communication Architecture

* **Status**: Approved
* **Context**:
  In Indonesia and Southeast Asia, WhatsApp is the default customer channel. However, sending official WhatsApp Business API messages costs money per message, which is unviable for free-tier users.
* **Decision**:
  Adopt a **Two-Tier Hybrid WhatsApp Delivery Engine**:
  * **Tier 1 (Free / Starter Tier)**: *Native Device Dispatch* via `whatsapp://send` deep-links. Zero platform cost.
  * **Tier 2 (Pro / Enterprise Tier)**: *Cloud Automated Dispatch* via official Meta WhatsApp Cloud API with interactive buttons and verified business branding.

---

### ADR-09: Complete Inbound Logistics, FIFO/FEFO Batch Allocation & Price-Masked Driver Working Permits (*Surat Jalan*)

* **Status**: Approved
* **Context**:
  Commodity wholesale merchants (such as bulk rice dealers and FMCG distributors) struggle with stock spoilage and aging when orders are fulfilled randomly without batch rotation. Furthermore, dispatching delivery drivers with full invoices leaks sensitive commercial profit margins, wholesale pricing, and invites client renegotiation or courier security risks.
* **Decision**:
  1. Implement an **Inbound Procurement & Storage Location Engine**: track supplier POs, arrival dates, and physical multi-tier binning (`storage_locations`: Warehouse $\rightarrow$ Zone $\rightarrow$ Rack $\rightarrow$ Bin) with supplier return policies (RTV terms).
  2. Implement an **Automated FIFO / FEFO Batch Allocation Algorithm**: sales orders automatically reserve and allocate stock from the oldest active batch first (FIFO) to preserve freshness and prevent degradation of grains/perishables.
  3. Implement **Price-Masked Driver Working Permits (*Surat Jalan* / Delivery Orders)**: generated directly from sales orders, containing warehouse pick instructions, recipient details, and items/units, but strictly stripping all monetary values (`unit_price`, `subtotal`, `discount`, `total`). A secure verification QR code and reference links back to the master digital invoice for audit and payment reconciliation.
* **Consequences**:
  * Eliminates rice aging, weevil infestation, and inventory write-offs.
  * Protects merchant gross margins and commercial secrecy from drivers, transport contractors, and third parties.
  * Provides triple-sign Proof of Delivery (Warehouse Release, Driver Custody, Customer Acceptance).

---

### ADR-10: Multi-Tenant Web Backoffice & Granular Checkbox Permission Matrix

* **Status**: Approved
* **Context**:
  Store owners and warehouse managers need to manage catalog pricing, inbound supplier POs, and Surat Jalan dispatch from desktop browsers, while field staff use smartphones. Furthermore, store owners reject rigid, pre-defined employee roles (e.g., a cashier who also receives warehouse deliveries, or a driver who also collects kasbon).
* **Decision**:
  1. Deploy a dedicated **Merchant Web Backoffice Portal** (`apps/web-portal`, port 3100 / `app.sidaya.id`) built with Next.js App Router and mobile-first responsive styling, decoupled from the lightweight buyer PayLink portal (`apps/paylink-web`).
  2. Implement a **Granular Checkbox Permission Matrix** stored on `tenant_users.permissions` (`JSONB` / `TEXT[]`). Pre-populate standard role archetypes (`OWNER`, `MANAGER`, `CASHIER`, `WAREHOUSE`, `SALESMAN`, `DRIVER`) as starter presets, but allow tenant owners to toggle any individual module capability checkbox (`pos:checkout`, `warehouse:inbound`, `logistics:dispatch`, `catalog:view_cogs`, `finance:reports`) per employee.
  3. Enforce access using a **Two-Tier Gate**: `TenantSubscriptionEntitlement(feature) AND UserPermission(checkbox)`.
* **Consequences**:
  * Eliminates code fragility caused by branching on arbitrary role strings.
  * Preserves strict wholesale commercial privacy: the critical `catalog:view_cogs` checkbox ensures cashier and driver roles are physically barred from querying `cost_price` via PostgreSQL RLS.
  * The mobile and web frontends dynamically adapt their navigation tabs to render only the tools each employee is authorized to use.

---

### ADR-11: Platform Control Plane Architecture, Operator RBAC & Privacy-Preserving Break-Glass Protocol

* **Status**: Approved
* **Context**:
  Ashvin Labs management (CEO, Developers, Support Officers) requires global oversight across all merchant tenants: monitoring fleet health, global GMV telemetry, managing subscription plan overrides, investigating technical bugs, and assisting merchant onboarding. However, granting unconstrained access risks violating Indonesian Personal Data Protection regulations (UU PDP) and compromising merchant commercial secrecy (customer phone books, supplier purchase pricing, gross profit margins).
* **Decision**:
  1. Establish a strict **Dual-Plane Separation**:
     * **Merchant Data Plane (`app.sidaya.id` / Mobile POS)**: Strictly sandboxed per store tenant via PostgreSQL RLS.
     * **Ashvin Labs Control Plane (`admin.sidaya.id`)**: Accessible exclusively by `@ashvinlabs.com` operator credentials with its own dedicated RBAC hierarchy (`SUPER_ADMIN`, `DEV_ENGINEER`, `OPS_SUPPORT`, `AUDIT_COMPLIANCE`).
  2. Implement **Privacy-Preserving Data Masking for Operational Staff**:
     * Support officers can view tenant metadata, active user counts, subscription quotas, and system activity logs, but merchant proprietary secrets (customer phone numbers, COGS/supplier purchase costs, and exact profit margins) are physically redacted (`Pak H*** R*** (0812-****-5432)`).
  3. Implement **Immutable Break-Glass Diagnostic Mode for Super Admins & Developers**:
     * Accessing specific tenant transaction details for bug resolution requires an explicit ticket reference, mandatory reason, and writes an un-deletable record to `platform_operator_audit_logs`.
* **Consequences**:
  * Gives Ashvin Labs leadership real-time commercial telemetry (total GMV, active stores, MRR, churn risk).
  * Gives developers deep diagnostic tools (API latency p95, database connection pools, webhook delivery metrics) without exposing sensitive tenant data.
  * Protects merchant trust by preventing internal data scraping or leakages.

---

### ADR-12: Subdomain-Strict Multi-Tenancy, Wildcard DNS, and Centralized Authentication Engine

* **Status**: Approved
* **Context**:
  Merchants need distinct web branding and easy cashier tablet access (e.g. `berasjaya.sidaya.biz.id` in production or `berasjaya.sidaya.my.id` in staging). Furthermore, merchants and staff frequently arrive at the root domain (`sidaya.biz.id`) without knowing their exact subdomain URL.
* **Decision**:
  1. Configure **Wildcard DNS (`*.sidaya.biz.id` / `*.sidaya.my.id`)** with automated SSL edge termination on Cloudflare/Traefik.
  2. Implement **Centralized Authentication with Automatic Redirection**:
     * Visiting the main gateway (`sidaya.biz.id`) presents a universal login.
     * The system verifies user credentials, resolves the single corresponding `tenant_id` and `subdomain`, and immediately issues an HTTP 302 redirect to `https://[subdomain].sidaya.biz.id/dashboard`.
     * Direct visits to `https://[subdomain].sidaya.biz.id` check client session validity (30m TTL). If active, dashboard loads directly; if expired, prompts store-branded login.
* **Consequences**:
  * Clean merchant branding and isolated cookies/local storage per subdomain.
  * Frictionless login for staff regardless of whether they navigate to the root domain or their specific store URL.

---

### ADR-13: 30-Day Subdomain Alias Grace Period (HTTP 301 Redirect) & Custom Domain CNAME Architecture

* **Status**: Approved
* **Context**:
  Store owners can modify their store name and subdomain in `/settings` (e.g., changing from `berasjaya` to `berasjayagrosir`). Abruptly disabling the old subdomain would break existing WhatsApp PayLinks sent to customers, print receipts with old QR codes, and bookmarked cashier tablets. Furthermore, enterprise/pro merchants demand custom domains (e.g. `pos.berasjaya.com`).
* **Decision**:
  1. **Solution A (30-Day Subdomain Alias)**: When an owner modifies their subdomain, the previous subdomain is retained in `tenant_subdomain_aliases` for a 30-day grace period. Edge routing issues an HTTP 301 (Permanent Redirect) preserving path and query strings (e.g. `/p/paylink-token`).
  2. **Solution B (Custom Domain Support - PRO Tier)**: Allow Pro/Enterprise tier tenants to configure custom hostnames via Cloudflare for SaaS CNAME proxying with automatic SSL certificate issuance.
* **Consequences**:
  * Guarantees zero payment failures or broken customer paylinks during business rebranding.
  * Reserved platform keywords (`ops`, `admin`, `api`, `auth`, `app`, `www`, `billing`, `support`, `status`, `mail`) are strictly prohibited from being claimed as tenant subdomains.

---

### ADR-14: Ticket-Bound Operator Impersonation (Tenant Shadowing) Protocol

* **Status**: Approved
* **Context**:
  When a merchant opens a support ticket regarding a bug in their inventory FIFO calculations or invoice formatting, Ashvin Labs customer support or developer engineers need to inspect the issue within the merchant's exact view without asking for merchant passwords or exposing operator controls to the merchant.
* **Decision**:
  1. Implement **Role-Governed Impersonation ("Act as Tenant User")** accessible only by authorized operator roles (`SUPER_ADMIN`, `DEV_ENGINEER`, `OPS_SUPPORT`).
  2. Require a **Mandatory Ticket Reference** (e.g. `#TICKET-8492`) and justified reason before session elevation.
  3. Emit an immutable record to `platform_operator_audit_logs` (`OPERATOR_IMPERSONATION_STARTED`).
  4. Render a **High-Visibility Persistent Floating Top Banner** in the shadowed tenant workspace (`[🛡️ Operator Impersonation Active: #TICKET-8492] [🚪 Exit Impersonation]`).
  5. Provide a 1-click safe return hook that terminates the impersonation session, emits `OPERATOR_IMPERSONATION_ENDED`, and returns the operator directly to the Operator Control Plane (`/telemetry`).
* **Consequences**:
  * Zero operator UI elements or login paths exist in standard merchant views.
  * Strict compliance with UU PDP and enterprise auditability standards.

---

### ADR-15: Client-Side Session TTL, Inactivity Expiry, and Intended Return Path Redirection

* **Status**: Approved
* **Context**:
  SiDaya handles sensitive financial, stock, and credit data. Leaving open browser tabs logged in indefinitely on shared desktop computers or tablet cashiers poses severe security risks.
* **Decision**:
  1. Implement a **Rolling Session TTL of 30 Minutes** (`SESSION_TTL_MS = 30 * 60 * 1000`).
  2. Every meaningful user action (navigation, barcode scan, order creation) refreshes `lastActivityTimestamp`.
  3. Pre-paint synchronous route guards validate session expiry before rendering UI (preventing FOUC - Flash of Unauthenticated Content).
  4. Upon session expiration, store the user's intended target route in `sessionStorage` (`intendedRoute`) and redirect to the login view. Upon re-authentication, immediately restore navigation to the intended target route.
* **Consequences**:
  * Prevents unauthorized access on abandoned shared registers.
  * Preserves frictionless user workflow after quick re-login.

---

### ADR-16: Decoupled Multi-Store Tenant Membership Architecture (Future Roadmap Baseline)

* **Status**: Approved (Backlog & Infrastructure Baseline)
* **Context**:
  In future roadmap phases, enterprise merchants operating multiple branch stores (e.g., `berasjaya1.sidaya.biz.id` and `berasjaya2.sidaya.biz.id`) will require individual users (e.g., `siti@berasjaya.com`) to have access across multiple stores with varying or identical roles (e.g., Admin on Store 1 & 2, while warehouse staff are restricted to a single store), while keeping inventory, FIFO COGS, POS registers, and piutang ledgers 100% isolated per store.
* **Decision**:
  1. Decouple global user identity (`users` table) from store-level permissions via an associative `tenant_memberships` table (`user_id`, `tenant_id`, `role`, `status`, `permissions_override`).
  2. In Phase 1 (current), enforce 1-Email-to-1-Tenant mapping in business logic.
  3. In Phase 2+ (backlog execution), enable multi-membership queries at the Universal Gateway to support the Multi-Store Switcher modal.
  4. Authorize every API request by matching `(user_id, target_subdomain_tenant_id)` against `tenant_memberships`.
* **Consequences**:
  * Zero destructive database schema migration required when activating multi-store capabilities in future roadmap phases.
  * Clean, multi-entity RBAC isolation supporting complex corporate hierarchies.

