import {
  PlatformOperatorRole,
  OperatorCapabilityKey,
  OPERATOR_ROLE_PRESETS,
  PlatformTenantSummary,
  PlatformTelemetry,
  OperatorAuditLog,
  OperatorSession,
  SubscriptionTier,
  InviteOperatorPayload,
  OperatorInvitationRecord,
  AcceptOperatorInvitePayload,
  validatePasswordStrength,
} from '@sidaya/shared-types';
import { EmailDispatchService } from './email-dispatch.service.js';

export interface OperatorRecord {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: PlatformOperatorRole;
  capabilities: OperatorCapabilityKey[];
  password?: string;
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
      phoneNumber: '+628111222333',
      role: PlatformOperatorRole.SUPER_ADMIN,
      capabilities: OPERATOR_ROLE_PRESETS[PlatformOperatorRole.SUPER_ADMIN],
      password: 'Password123!',
      isActive: true,
    },
    {
      id: 'a0000099-0001-0000-0000-000000000002',
      email: 'alex@ashvinlabs.com',
      fullName: 'Alex (Lead Developer)',
      phoneNumber: '+628111222334',
      role: PlatformOperatorRole.DEV_ENGINEER,
      capabilities: OPERATOR_ROLE_PRESETS[PlatformOperatorRole.DEV_ENGINEER],
      password: 'Password123!',
      isActive: true,
    },
    {
      id: 'a0000099-0001-0000-0000-000000000003',
      email: 'dina@ashvinlabs.com',
      fullName: 'Dina (Customer Operations)',
      phoneNumber: '+628111222335',
      role: PlatformOperatorRole.OPS_SUPPORT,
      capabilities: OPERATOR_ROLE_PRESETS[PlatformOperatorRole.OPS_SUPPORT],
      password: 'Password123!',
      isActive: true,
    },
  ];

  /**
   * Pending Operator Invitations
   */
  private operatorInvitations: OperatorInvitationRecord[] = [];

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
   * Helper: Check if email is already in operator catalog
   */
  isOperatorEmailRegistered(email: string): boolean {
    const target = email.trim().toLowerCase();
    return this.operators.some((o) => o.email.trim().toLowerCase() === target);
  }

  /**
   * Authenticate Ashvin Labs Operator
   */
  loginOperator(email: string, password?: string): OperatorSession {
    const operator = this.operators.find(
      (op) => op.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (!operator || !operator.isActive) {
      throw new Error(`Kredensial operator tidak valid untuk '${email}'.`);
    }

    if (password && operator.password && operator.password !== password) {
      throw new Error('Kata sandi operator tidak valid.');
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
   * Invite a new Platform Operator (Super Admin Only)
   */
  async inviteOperator(
    payload: InviteOperatorPayload,
    inviter: { id: string; email: string; role: PlatformOperatorRole },
    emailService?: EmailDispatchService,
    baseUrl?: string,
  ): Promise<OperatorInvitationRecord> {
    if (inviter.role !== PlatformOperatorRole.SUPER_ADMIN) {
      throw new Error('Hanya Super Admin yang berwenang mengirimkan undangan Operator Control Plane.');
    }

    const cleanEmail = payload.email.trim().toLowerCase();

    if (this.isOperatorEmailRegistered(cleanEmail)) {
      throw new Error(`Email operator '${payload.email}' sudah terdaftar.`);
    }

    const existingInvite = this.operatorInvitations.find(
      (i) => i.email.toLowerCase() === cleanEmail && !i.acceptedAt && new Date(i.expiresAt) > new Date(),
    );
    if (existingInvite) {
      throw new Error(`Undangan aktif untuk operator '${payload.email}' sudah ada.`);
    }

    const inviteToken = `inv_ops_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const record: OperatorInvitationRecord = {
      id: `inv_op_${Date.now()}`,
      email: cleanEmail,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
      token: inviteToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString(),
    };

    this.operatorInvitations.push(record);

    // Immutable audit log
    this.auditLogs.unshift({
      id: `a0000099-0002-${Date.now().toString().slice(-12)}`,
      operatorId: inviter.id,
      operatorEmail: inviter.email,
      operatorRole: inviter.role,
      action: 'OPERATOR_INVITED',
      ticketReference: 'OPS-INVITE',
      metadata: {
        invitedEmail: cleanEmail,
        invitedFullName: payload.fullName,
        assignedRole: payload.role,
      },
      timestamp: new Date(),
    });

    if (emailService) {
      const inviteDomain = baseUrl || 'http://ops.localhost:3333';
      const inviteUrl = `${inviteDomain}/accept-invite?token=${inviteToken}`;
      await emailService.sendOperatorInvitation(cleanEmail, payload.fullName, payload.role, inviteUrl);
    }

    return record;
  }

  /**
   * Accept Operator Invitation & Set Password
   */
  async acceptOperatorInvite(payload: AcceptOperatorInvitePayload): Promise<OperatorSession> {
    const invite = this.operatorInvitations.find((i) => i.token === payload.token);
    if (!invite || invite.acceptedAt) {
      throw new Error('Token undangan operator tidak valid atau telah diterima.');
    }

    if (new Date(invite.expiresAt) < new Date()) {
      throw new Error('Undangan operator telah kadaluarsa. Minta Super Admin mengirimkan undangan baru.');
    }

    const passwordCheck = validatePasswordStrength(payload.password);
    if (!passwordCheck.isValid) {
      throw new Error(`Kata sandi tidak memenuhi standar: ${passwordCheck.errors.join(', ')}`);
    }

    const newOperatorId = `a0000099-0001-${Date.now().toString().slice(-12)}`;
    const newOperator: OperatorRecord = {
      id: newOperatorId,
      email: invite.email,
      fullName: invite.fullName,
      phoneNumber: invite.phoneNumber,
      role: invite.role,
      capabilities: OPERATOR_ROLE_PRESETS[invite.role] || [],
      password: payload.password,
      isActive: true,
    };

    this.operators.push(newOperator);
    invite.acceptedAt = new Date().toISOString();

    // Immutable audit log
    this.auditLogs.unshift({
      id: `a0000099-0002-${Date.now().toString().slice(-12)}`,
      operatorId: newOperatorId,
      operatorEmail: invite.email,
      operatorRole: invite.role,
      action: 'OPERATOR_INVITATION_ACCEPTED',
      ticketReference: 'OPS-ONBOARD',
      metadata: { role: invite.role, fullName: invite.fullName },
      timestamp: new Date(),
    });

    return this.loginOperator(invite.email, payload.password);
  }

  /**
   * List Operators and Pending Invitations
   */
  listOperatorsAndInvitations() {
    const activeOperators = this.operators.map((o) => ({
      id: o.id,
      email: o.email,
      fullName: o.fullName,
      phoneNumber: o.phoneNumber,
      role: o.role,
      capabilities: o.capabilities,
      isActive: o.isActive,
    }));

    const pendingInvitations = this.operatorInvitations
      .filter((i) => !i.acceptedAt)
      .map((i) => ({
        id: i.id,
        email: i.email,
        fullName: i.fullName,
        phoneNumber: i.phoneNumber,
        role: i.role,
        token: i.token,
        expiresAt: i.expiresAt,
        status: 'PENDING_INVITATION',
      }));

    return {
      activeOperators,
      pendingInvitations,
    };
  }

  /**
   * List Tenant Fleet with Privacy Masking Guardrails
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
   * Break-Glass Diagnostic Session
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
