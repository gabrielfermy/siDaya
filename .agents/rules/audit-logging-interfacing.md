# Mandatory Audit Interfacing & Dual-Plane Audit Format Rule

## 1. Universal Invariant
Every newly created or modified module, feature, controller, or domain service in SiDaya **MUST** incorporate structured audit logging for all mutating, sensitive, or governance-critical actions. No state-mutating action (financial transactions, inventory adjustments, user access changes, pricing overrides, system configurations) may be committed without a corresponding audit event.

## 2. Dual-Plane Audit Separation Architecture
SiDaya operates with strict dual-plane isolation. Audit events must be explicitly routed to either the **Tenant Plane** or the **Operator Control Plane**:

### A. Tenant Plane Audit (`pilar8.auditLogs` / `TenantAuditLog`)
- **Scope**: Strictly sandboxed to the active tenant workspace (`tenantId`). Visible only to the store Owner and authorized Managers.
- **Purpose**: Internal business forensics, cashier accountability, FIFO batch tracking, staff access changes, and customer credit ledger adjustments.
- **Allowed Content**: May record internal operational details such as SKU prices, invoice numbers, cashier PIN changes, staff permissions, and credit limit overrides.

### B. Operator Control Plane Audit (`operator.auditLogs` / `OperatorAuditLog`)
- **Scope**: Platform-level global logs for Ashvin Labs platform engineers, customer support, and compliance officers.
- **Purpose**: Telemetry monitoring, tenant lifecycle, platform-level security, ticket-bound impersonation, and operator team management.
- **Strict Anti-Leak Guardrail (UU PDP Compliance)**:
  - **ZERO BUSINESS SECRETS**: Operator logs MUST NEVER contain confidential tenant trade data (e.g., supplier purchase prices, itemized FIFO COGS, gross wholesale profit margins, customer debtor names/phone lists).
  - Only capture operational metadata (e.g., `TENANT_OFFBOARDED`, `OPERATOR_IMPERSONATION_STARTED`, `QUOTA_EXCEEDED`, `OPERATOR_INVITED`).
  - Impersonation and break-glass diagnostics **MANDATE** a support ticket reference (`ticketRef`) and formal justification (`reason`).

---

## 3. Standardized Audit Payload Schema

### Tenant Audit Event Format
```typescript
interface TenantAuditEntry {
  id: string;                      // e.g. "aud_t_1789085123456"
  timestamp: string;               // Locale short formatted or ISO 8601
  actor: {
    userId?: string;               // UUID of staff member (if authenticated)
    name: string;                  // e.g. "Budi Santoso", "Dewi (Kasir)"
    role: string;                  // e.g. "OWNER", "MANAGER", "CASHIER", "SYSTEM"
    sessionType?: 'WEB' | 'POS_PIN' | 'API';
  };
  domain: string;                  // e.g. "INVENTORY", "POS", "SALES", "CRM", "STAFF", "SETTINGS"
  action: string;                  // Format: <DOMAIN>_<VERB> (e.g. "FIFO_LOT_RECEIVED", "CREDIT_OVERRIDDEN")
  target: {
    entityType: string;            // e.g. "PRODUCT", "INVOICE", "CUSTOMER", "STAFF", "WORKSPACE"
    entityId?: string;             // UUID or slug (e.g. "sku_beras_rojo", "stf_8492")
    identifier: string;            // Human-readable identifier (e.g. "Beras Rojolele 25kg", "Siti Rahma")
  };
  diff?: {
    before?: Record<string, any>;  // Previous state values (optional)
    after?: Record<string, any>;   // New state values (optional)
  };
  reason?: string;                 // Mandatory for overrides, deletions, and exceptions
  status: 'SUCCESS' | 'FAILED' | 'REJECTED';
}
```

### Operator Audit Event Format
```typescript
interface OperatorAuditEntry {
  id: string;                      // e.g. "aud_ops_1789085123456"
  timestamp: string;               // Locale short formatted or ISO 8601
  operatorEmail: string;           // e.g. "gabriel@ashvinlabs.com"
  operatorRole: 'SUPER_ADMIN' | 'DEV_ENGINEER' | 'OPS_SUPPORT' | 'AUDIT_LEGAL';
  action: string;                  // Format: OPERATOR_<ACTION> (e.g. "OPERATOR_IMPERSONATION_STARTED")
  target: string;                  // e.g. "Toko Beras Jaya (t1)", "rahmat@ashvinlabs.com"
  ticketRef: string;               // Mandatory support ticket ref (e.g. "#TICKET-8492")
  reason: string;                  // Forensic justification (min 8 chars)
  status: 'SUCCESS' | 'BLOCKED';
  privacyClearance: 'UU_PDP_COMPLIANT';
}
```

---

## 4. Plug-and-Play Interfacing Pattern (`AuditEmitter`)
To make auditing seamless and uniform across all modules, every controller, service, and store action connects through the global `AuditEmitter`:

```javascript
// Example in any Controller or Action:
AuditEmitter.logTenant({
  domain: 'INVENTORY',
  action: 'FIFO_LOT_ADJUSTED',
  target: { entityType: 'LOT', identifier: 'LOT-2026-09-01 (Beras Rojolele)' },
  diff: { before: { qty: 50 }, after: { qty: 45 } },
  reason: 'Susut timbangan / karung sobek di gudang',
});

// Example for Operator action:
AuditEmitter.logOperator({
  action: 'OPERATOR_TENANT_STATUS_TOGGLED',
  target: 'Toko Beras Makmur (t2)',
  ticketRef: '#TICKET-9921',
  reason: 'Permintaan suspend sementara oleh pemilik toko',
});
```

---

## 5. Developer & Agent Checklist for New / Modified Modules
Before marking any module or feature complete, verify:
- [ ] Are all state mutations, overrides, and governance actions audited?
- [ ] Does the audit event use the standardized `<DOMAIN>_<ACTION>` naming convention?
- [ ] Is an audit reason prompted/required for sensitive actions (deletions, credit limit overrides, manual stock write-offs)?
- [ ] Is plane separation strictly respected (no tenant confidential data in operator logs)?
- [ ] Are both client store (`store.js`) and persistent forensic logs compatible with the audit schema?
