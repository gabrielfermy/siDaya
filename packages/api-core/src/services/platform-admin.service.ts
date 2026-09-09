import {
  PlatformOperatorRole,
  OperatorCapabilityKey,
  OPERATOR_ROLE_PRESETS,
  PlatformTenantSummary,
  PlatformTelemetry,
  OperatorAuditLog,
  OperatorSession,
  SubscriptionTier,
} from '@sidaya/shared-types';

export interface OperatorRecord {
  id: string;
  email: string;
  fullName: string;
  role: PlatformOperatorRole;
  capabilities: OperatorCapabilityKey[];
  isActive: boolean;
}

export class PlatformAdminDomainService {
  /**
   * Seeded operator catalog aligned with database
   */
  private operators: OperatorRecord[] = [
    {
      id: 'a0000099-0001-0000-0000-000000000001',
      email: 'gabriel@ashvinlabs.com',
      fullName: 'Gabriel (CEO)',
      role: PlatformOperatorRole.SUPER_ADMIN,
      capabilities: OPERATOR_ROLE_PRESETS[PlatformOperatorRole.SUPER_ADMIN],
      isActive: true,
    },
    {
      id: 'a0000099-0001-0000-0000-000000000002',
      email: 'alex@ashvinlabs.com',
      fullName: 'Alex (Lead Developer)',
      role: PlatformOperatorRole.DEV_ENGINEER,
      capabilities: OPERATOR_ROLE_PRESETS[PlatformOperatorRole.DEV_ENGINEER],
      isActive: true,
    },
    {
      id: 'a0000099-0001-0000-0000-000000000003',
      email: 'dina@ashvinlabs.com',
      fullName: 'Dina (Customer Operations)',
      role: PlatformOperatorRole.OPS_SUPPORT,
      capabilities: OPERATOR_ROLE_PRESETS[PlatformOperatorRole.OPS_SUPPORT],
      isActive: true,
    },
  ];

  /**
   * Mock in-memory tenant fleet synchronized with Phase 2 seeds
   */
  private tenantFleet: PlatformTenantSummary[] = [
    {
      tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
      businessName: 'Toko Grosir Beras Jaya Bersama',
      subdomain: 'berasjaya',
      ownerName: 'Budi Santoso',
      ownerPhone: '+6281234567890',
      subscriptionTier: SubscriptionTier.GROSIR_PRO,
      status: 'ACTIVE',
      activeUsersCount: 4,
      storageLotsCount: 2,
      monthlyGmv: 428500000,
      quotaUsagePercent: 68,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      tenantId: 'd5c9f320-1942-493b-cd02-34b0df9f23e5',
      businessName: 'CV Sembako Nusantara Makmur',
      subdomain: 'sembakonusantara',
      ownerName: 'Hendro Wijaya',
      ownerPhone: '+6281398765432',
      subscriptionTier: SubscriptionTier.STARTER_FREE,
      status: 'ACTIVE',
      activeUsersCount: 2,
      storageLotsCount: 1,
      monthlyGmv: 184200000,
      quotaUsagePercent: 42,
      createdAt: '2026-08-15T00:00:00Z',
    },
  ];

  /**
   * Immutable Operator Audit Logs
   */
  private auditLogs: OperatorAuditLog[] = [
    {
      id: 'a0000099-0002-0000-0000-000000000001',
      operatorId: 'a0000099-0001-0000-0000-000000000001',
      operatorEmail: 'gabriel@ashvinlabs.com',
      operatorRole: PlatformOperatorRole.SUPER_ADMIN,
      action: 'PLATFORM_INITIALIZATION',
      targetTenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
      targetTenantName: 'Toko Grosir Beras Jaya Bersama',
      ticketReference: 'INIT-0001',
      metadata: { note: 'Initial Control Plane baseline deployment' },
      timestamp: new Date(),
    },
  ];

  /**
   * Authenticate Ashvin Labs Operator
   */
  loginOperator(email: string, _password?: string): OperatorSession {
    const operator = this.operators.find(
      (op) => op.email.toLowerCase() === email.toLowerCase(),
    );

    if (!operator || !operator.isActive) {
      throw new Error(`Kredensial operator tidak valid untuk '${email}'.`);
    }

    return {
      operatorId: operator.id,
      email: operator.email,
      fullName: operator.fullName,
      role: operator.role,
      capabilities: operator.capabilities,
      sessionToken: `tok_admin_${operator.role.toLowerCase()}_${Date.now()}`,
    };
  }

  /**
   * List Tenant Fleet with Privacy Masking Guardrails:
   * If operator is OPS_SUPPORT, proprietary customer contact details and exact margins are masked.
   */
  listTenants(operatorRole: PlatformOperatorRole): PlatformTenantSummary[] {
    const isOpsSupport = operatorRole === PlatformOperatorRole.OPS_SUPPORT;

    return this.tenantFleet.map((t) => {
      if (isOpsSupport) {
        // Redact PII under UU PDP
        return {
          ...t,
          ownerPhone: t.ownerPhone.replace(/(\+\d{4})\d+(\d{4})/, '$1****$2'),
          ownerName: t.ownerName.split(' ').map((w) => w[0] + '***').join(' '),
        };
      }
      return { ...t };
    });
  }

  /**
   * Get specific tenant details
   */
  getTenantDetail(tenantId: string, operatorRole: PlatformOperatorRole): PlatformTenantSummary {
    const tenants = this.listTenants(operatorRole);
    const tenant = tenants.find((t) => t.tenantId === tenantId);
    if (!tenant) {
      throw new Error(`Tenant dengan ID '${tenantId}' tidak ditemukan di sistem.`);
    }
    return tenant;
  }

  /**
   * Update Tenant Subscription Tier (Creates immutable audit log)
   */
  updateTenantSubscription(
    tenantId: string,
    newTier: SubscriptionTier,
    newStatus: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'GRACE_PERIOD',
    operator: { id: string; email: string; role: PlatformOperatorRole },
    reason?: string,
  ): PlatformTenantSummary {
    const tenant = this.tenantFleet.find((t) => t.tenantId === tenantId);
    if (!tenant) {
      throw new Error(`Tenant '${tenantId}' tidak ditemukan.`);
    }

    const previousTier = tenant.subscriptionTier;
    const previousStatus = tenant.status;

    tenant.subscriptionTier = newTier;
    tenant.status = newStatus;

    // Log immutable audit trail
    this.auditLogs.unshift({
      id: `a0000099-0002-${Date.now().toString().slice(-12)}`,
      operatorId: operator.id,
      operatorEmail: operator.email,
      operatorRole: operator.role,
      action: 'TENANT_SUBSCRIPTION_UPDATE',
      targetTenantId: tenantId,
      targetTenantName: tenant.businessName,
      ticketReference: reason || 'MANUAL_OVERRIDE',
      metadata: {
        previousTier,
        newTier,
        previousStatus,
        newStatus,
        reason: reason || 'Updated via Ashvin Labs Operator Portal',
      },
      timestamp: new Date(),
    });

    return tenant;
  }

  /**
   * Aggregated Platform Telemetry
   */
  getPlatformTelemetry(_operatorRole: PlatformOperatorRole): PlatformTelemetry {
    const totalGmv = this.tenantFleet.reduce((sum, t) => sum + t.monthlyGmv, 0);
    const totalUsers = this.tenantFleet.reduce((sum, t) => sum + t.activeUsersCount, 0);

    return {
      totalPlatformGmvMonth: totalGmv,
      activeTenantsCount: this.tenantFleet.length,
      totalOrdersCount: 1420,
      activeUsersCount: totalUsers,
      apiLatencyP95Ms: 14.8,
      apiErrorRatePercent: 0.02,
      dbConnectionPoolUsagePercent: 24,
      healthyServicesCount: 4,
      totalServicesCount: 4,
      timestamp: new Date(),
    };
  }

  /**
   * Retrieve Audit Logs
   */
  getAuditLogs(): OperatorAuditLog[] {
    return [...this.auditLogs];
  }

  /**
   * Break-Glass Diagnostic Session:
   * Used by Super Admins & Developers for technical incident resolution.
   */
  requestBreakglassDiagnostic(
    operator: { id: string; email: string; role: PlatformOperatorRole },
    tenantId: string,
    ticketReference: string,
    reason: string,
  ): { diagnosticToken: string; expiresAt: string; auditLogId: string } {
    if (!ticketReference || !reason) {
      throw new Error('Tiket referensi dan alasan wajib disertakan untuk sesi break-glass.');
    }

    const tenant = this.tenantFleet.find((t) => t.tenantId === tenantId);
    const auditLogId = `a0000099-0002-${Date.now().toString().slice(-12)}`;

    this.auditLogs.unshift({
      id: auditLogId,
      operatorId: operator.id,
      operatorEmail: operator.email,
      operatorRole: operator.role,
      action: 'BREAKGLASS_DIAGNOSTIC_SESSION',
      targetTenantId: tenantId,
      targetTenantName: tenant?.businessName || 'Unknown Tenant',
      ticketReference,
      metadata: { reason, scope: 'READ_ONLY_DIAGNOSTIC' },
      timestamp: new Date(),
    });

    return {
      diagnosticToken: `tok_bg_${operator.role.toLowerCase()}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour validity
      auditLogId,
    };
  }
}
