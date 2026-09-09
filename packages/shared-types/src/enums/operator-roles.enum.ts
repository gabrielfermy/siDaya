/**
 * Ashvin Labs Platform Operator Roles (Control Plane)
 * Distinct from Merchant Data Plane roles (OWNER, CASHIER, WAREHOUSE, DRIVER).
 */
export enum PlatformOperatorRole {
  SUPER_ADMIN = 'SUPER_ADMIN',       // CEO, Founders, CTO: Full platform oversight, subscriptions, break-glass
  DEV_ENGINEER = 'DEV_ENGINEER',     // Developers & Tech Leads: Telemetry, latency, pools, diagnostic mode
  OPS_SUPPORT = 'OPS_SUPPORT',       // Support & Ops: Tenant directory, reset staff PINs/passwords, masked PII
  AUDIT_COMPLIANCE = 'AUDIT_COMPLIANCE' // Compliance officers: Operator audit log monitoring, UU PDP enforcement
}

/**
 * Platform Operator Capabilities
 */
export enum OperatorCapabilityKey {
  TENANTS_VIEW = 'tenants:view',
  TENANTS_MANAGE_SUBSCRIPTION = 'tenants:manage_subscription',
  TENANTS_BREAKGLASS = 'tenants:breakglass',
  SYSTEM_TELEMETRY = 'system:telemetry',
  SYSTEM_AUDIT = 'system:audit',
  USERS_SUPPORT_RESET = 'users:support_reset',
}

export const OPERATOR_ROLE_PRESETS: Record<PlatformOperatorRole, OperatorCapabilityKey[]> = {
  [PlatformOperatorRole.SUPER_ADMIN]: [
    OperatorCapabilityKey.TENANTS_VIEW,
    OperatorCapabilityKey.TENANTS_MANAGE_SUBSCRIPTION,
    OperatorCapabilityKey.TENANTS_BREAKGLASS,
    OperatorCapabilityKey.SYSTEM_TELEMETRY,
    OperatorCapabilityKey.SYSTEM_AUDIT,
    OperatorCapabilityKey.USERS_SUPPORT_RESET,
  ],
  [PlatformOperatorRole.DEV_ENGINEER]: [
    OperatorCapabilityKey.TENANTS_VIEW,
    OperatorCapabilityKey.TENANTS_BREAKGLASS,
    OperatorCapabilityKey.SYSTEM_TELEMETRY,
    OperatorCapabilityKey.SYSTEM_AUDIT,
  ],
  [PlatformOperatorRole.OPS_SUPPORT]: [
    OperatorCapabilityKey.TENANTS_VIEW,
    OperatorCapabilityKey.USERS_SUPPORT_RESET,
    OperatorCapabilityKey.SYSTEM_AUDIT,
  ],
  [PlatformOperatorRole.AUDIT_COMPLIANCE]: [
    OperatorCapabilityKey.TENANTS_VIEW,
    OperatorCapabilityKey.SYSTEM_AUDIT,
  ],
};
