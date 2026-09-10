/**
 * @fileoverview Operator Tenant Impersonation Domain Service
 * @module Services:Operator:Impersonation
 * @description
 * Implements role-governed tenant impersonation ("Act as Tenant User"),
 * requiring break-glass ticket binding, reason audit logging,
 * and scoped session generation for support diagnostic workflows.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import {
  StartImpersonationPayload,
  StartImpersonationResult,
  ExitImpersonationPayload,
  ExitImpersonationResult,
  ImpersonationSessionContext,
  PlatformOperatorRole,
} from '@sidaya/shared-types';
import { StaffCatalogStore } from '../auth/staff-catalog.store.js';
import { SubdomainDomainService } from '../tenant/subdomain.service.js';
import { OperatorContext } from '../../middleware/operator-context.middleware.js';

export interface ImpersonationAuditLogEntry {
  id: string;
  operatorId: string;
  operatorEmail: string;
  operatorRole: PlatformOperatorRole;
  action: 'OPERATOR_IMPERSONATION_STARTED' | 'OPERATOR_IMPERSONATION_ENDED';
  targetTenantId: string;
  targetUserId: string;
  ticketReference: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export class ImpersonationDomainService {
  private static instance: ImpersonationDomainService;
  private staffStore = StaffCatalogStore.getInstance();
  private subdomainService = SubdomainDomainService.getInstance();

  private activeSessions: Map<string, ImpersonationSessionContext> = new Map();
  private auditLogs: ImpersonationAuditLogEntry[] = [];

  public static getInstance(): ImpersonationDomainService {
    if (!ImpersonationDomainService.instance) {
      ImpersonationDomainService.instance = new ImpersonationDomainService();
    }
    return ImpersonationDomainService.instance;
  }

  /**
   * Starts a ticket-bound impersonation session for a target tenant user
   */
  public startImpersonation(
    operator: OperatorContext,
    targetTenantId: string,
    payload: StartImpersonationPayload,
    baseUrl = 'localhost:3333',
  ): StartImpersonationResult {
    // 1. Validate Operator Capabilities
    if (
      operator.role !== PlatformOperatorRole.SUPER_ADMIN &&
      operator.role !== PlatformOperatorRole.DEV_ENGINEER &&
      operator.role !== PlatformOperatorRole.OPS_SUPPORT
    ) {
      throw new Error('Operator does not have permissions to initiate tenant impersonation.');
    }

    // 2. Validate Ticket Reference & Diagnostic Reason
    const ticket = (payload.ticketReference || '').trim();
    if (!ticket || ticket.length < 3) {
      throw new Error('A valid support ticket reference (e.g. #TICKET-8492) is required.');
    }

    const reason = (payload.reason || '').trim();
    if (!reason || reason.length < 8) {
      throw new Error('A diagnostic reason (minimum 8 characters) is required for compliance audit logging.');
    }

    // 3. Resolve Target Tenant User
    const tenantStaff = this.staffStore.catalog.filter((s) =>
      s.tenants.some((t) => t.tenantId === targetTenantId),
    );

    if (tenantStaff.length === 0) {
      throw new Error(`No staff or owner found for tenant ID '${targetTenantId}'.`);
    }

    let targetUser = tenantStaff.find((s) => s.userId === payload.targetUserId);
    if (!targetUser) {
      // Default to Tenant Owner if targetUserId not found or not provided
      targetUser = tenantStaff.find((s) => s.tenants.some((t) => t.role === 'OWNER')) || tenantStaff[0];
    }

    if (!targetUser) {
      throw new Error(`Target user could not be resolved for tenant '${targetTenantId}'.`);
    }

    // 4. Resolve Target Subdomain
    const subdomainState = (this.subdomainService as any).tenantSubdomains?.get(targetTenantId);
    const subdomain = subdomainState?.subdomain || 'berasjaya';

    // 5. Generate Scoped Impersonation Token & Session Context
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour TTL
    const impersonationToken = `tok_imp_${operator.id.slice(-6)}_${targetUser.userId.slice(-6)}_${Date.now()}`;
    const auditLogId = `a0000099-0002-${Date.now().toString().slice(-12)}`;

    const sessionContext: ImpersonationSessionContext = {
      active: true,
      operatorId: operator.id,
      operatorEmail: operator.email,
      operatorRole: operator.role,
      targetTenantId,
      targetUserId: targetUser.userId,
      targetUserEmail: targetUser.email,
      ticketReference: ticket,
      reason,
      startedAt: now.toISOString(),
      expiresAt,
    };

    this.activeSessions.set(impersonationToken, sessionContext);

    // 6. Record Immutable Audit Trail
    const logEntry: ImpersonationAuditLogEntry = {
      id: auditLogId,
      operatorId: operator.id,
      operatorEmail: operator.email,
      operatorRole: operator.role,
      action: 'OPERATOR_IMPERSONATION_STARTED',
      targetTenantId,
      targetUserId: targetUser.userId,
      ticketReference: ticket,
      metadata: {
        targetUserEmail: targetUser.email,
        targetUserFullName: targetUser.fullName,
        subdomain,
        reason,
        expiresAt,
      },
      timestamp: now.toISOString(),
    };
    this.auditLogs.unshift(logEntry);

    const proto = baseUrl.includes('localhost') ? 'http' : 'https';
    const redirectUrl = `${proto}://${subdomain}.${baseUrl}/dashboard?impersonate_token=${impersonationToken}`;

    return {
      impersonationToken,
      targetTenantId,
      targetSubdomain: subdomain,
      redirectUrl,
      auditLogId,
      sessionContext,
    };
  }

  /**
   * Terminates active impersonation session and returns operator return URL
   */
  public exitImpersonation(
    operator: OperatorContext,
    payload: ExitImpersonationPayload,
    operatorBaseUrl = 'http://ops.localhost:3333',
  ): ExitImpersonationResult {
    const token = payload.impersonationToken;
    let session = token ? this.activeSessions.get(token) : undefined;

    if (!session && payload.sessionContext) {
      session = payload.sessionContext as ImpersonationSessionContext;
    }

    if (token) {
      this.activeSessions.delete(token);
    }

    const auditLogId = `a0000099-0002-${Date.now().toString().slice(-12)}`;
    const now = new Date().toISOString();

    const logEntry: ImpersonationAuditLogEntry = {
      id: auditLogId,
      operatorId: session?.operatorId || operator.id,
      operatorEmail: session?.operatorEmail || operator.email,
      operatorRole: (session?.operatorRole as PlatformOperatorRole) || operator.role,
      action: 'OPERATOR_IMPERSONATION_ENDED',
      targetTenantId: session?.targetTenantId || '',
      targetUserId: session?.targetUserId || '',
      ticketReference: session?.ticketReference || 'TERMINATE',
      metadata: {
        reason: 'Operator terminated impersonation session',
        sessionDurationMs: session?.startedAt ? Date.now() - new Date(session.startedAt).getTime() : 0,
      },
      timestamp: now,
    };
    this.auditLogs.unshift(logEntry);

    return {
      terminated: true,
      operatorEmail: session?.operatorEmail || operator.email,
      returnUrl: `${operatorBaseUrl}/fleet`,
      auditLogId,
    };
  }

  /**
   * Validates active impersonation token
   */
  public validateImpersonationSession(token: string): ImpersonationSessionContext | null {
    if (!token) return null;
    const session = this.activeSessions.get(token);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.activeSessions.delete(token);
      return null;
    }

    return session;
  }

  /**
   * Retrieves all impersonation audit logs
   */
  public getAuditLogs(): ImpersonationAuditLogEntry[] {
    return [...this.auditLogs];
  }
}
