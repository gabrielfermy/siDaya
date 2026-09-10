import { z } from 'zod';

export const ApprovalRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventType: z.enum(['PO_CREATION', 'SALES_VOID', 'DISCOUNT_THRESHOLD', 'CREDIT_LIMIT_OVERRIDE']),
  thresholdAmount: z.number().optional(),
  requiredRole: z.enum(['OWNER', 'MANAGER']).default('OWNER'),
  isActive: z.boolean().default(true),
  createdAt: z.date().or(z.string()).optional(),
});

export type ApprovalRule = z.infer<typeof ApprovalRuleSchema>;

export const ApprovalRequestSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  ruleId: z.string().uuid(),
  requesterUserId: z.string().uuid(),
  approverUserId: z.string().uuid().optional(),
  entityName: z.string().min(1),
  entityId: z.string().uuid(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED']).default('PENDING'),
  justification: z.string().optional(),
  actionedAt: z.date().or(z.string()).optional(),
  createdAt: z.date().or(z.string()).optional(),
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export const TenantAuditLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  actorUserId: z.string().uuid().optional(),
  actorName: z.string().min(1),
  actorRole: z.string().min(1),
  actionType: z.string().min(1),
  entityName: z.string().min(1),
  entityId: z.string().uuid().optional(),
  oldState: z.record(z.any()).optional(),
  newState: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  rayId: z.string().optional(),
  createdAt: z.date().or(z.string()).optional(),
});

export type TenantAuditLog = z.infer<typeof TenantAuditLogSchema>;

export const ConsignmentContractSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  consignmentType: z.enum(['INBOUND', 'OUTBOUND']).default('INBOUND'),
  partnerId: z.string().uuid(),
  contractNumber: z.string().min(1),
  commissionRatePct: z.number().nonnegative().default(0),
  settlementPeriod: z.enum(['WEEKLY', 'BI_WEEKLY', 'MONTHLY']).default('MONTHLY'),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED']).default('ACTIVE'),
  createdAt: z.date().or(z.string()).optional(),
});

export type ConsignmentContract = z.infer<typeof ConsignmentContractSchema>;
