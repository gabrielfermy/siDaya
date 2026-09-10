/**
 * @fileoverview Operator Tenant Impersonation Data Contracts
 * @module Models:Impersonation
 * @description
 * Types, interfaces, and token payload structures for role-governed tenant impersonation
 * ("Act as Tenant User"), break-glass ticket binding, and audit trail logging.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

export interface StartImpersonationPayload {
  targetUserId: string;
  ticketReference: string;
  reason: string;
}

export interface ImpersonationSessionContext {
  active: boolean;
  operatorId: string;
  operatorEmail: string;
  operatorRole: string;
  targetTenantId: string;
  targetUserId: string;
  targetUserEmail: string;
  ticketReference: string;
  reason: string;
  startedAt: string;
  expiresAt: string;
}

export interface StartImpersonationResult {
  impersonationToken: string;
  targetTenantId: string;
  targetSubdomain: string;
  redirectUrl: string;
  auditLogId: string;
  sessionContext: ImpersonationSessionContext;
}

export interface ExitImpersonationPayload {
  impersonationToken?: string;
  sessionContext?: Partial<ImpersonationSessionContext>;
}

export interface ExitImpersonationResult {
  terminated: boolean;
  operatorEmail: string;
  returnUrl: string;
  auditLogId: string;
}
