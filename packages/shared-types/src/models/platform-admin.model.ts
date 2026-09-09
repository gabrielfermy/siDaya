import { z } from 'zod';
import { PlatformOperatorRole, OperatorCapabilityKey } from '../enums/operator-roles.enum.js';
import { SubscriptionTier } from '../enums/subscription-tiers.enum.js';

export const PlatformTenantSummarySchema = z.object({
  tenantId: z.string().uuid(),
  businessName: z.string().min(1),
  subdomain: z.string().min(1),
  ownerName: z.string().min(1),
  ownerPhone: z.string().min(1),
  subscriptionTier: z.nativeEnum(SubscriptionTier),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'TRIAL', 'GRACE_PERIOD']),
  activeUsersCount: z.number().int().nonnegative(),
  storageLotsCount: z.number().int().nonnegative(),
  monthlyGmv: z.number().nonnegative(),
  quotaUsagePercent: z.number().min(0).max(100),
  createdAt: z.date().or(z.string()),
});

export type PlatformTenantSummary = z.infer<typeof PlatformTenantSummarySchema>;

export const PlatformTelemetrySchema = z.object({
  totalPlatformGmvMonth: z.number().nonnegative(),
  activeTenantsCount: z.number().int().nonnegative(),
  totalOrdersCount: z.number().int().nonnegative(),
  activeUsersCount: z.number().int().nonnegative(),
  apiLatencyP95Ms: z.number().nonnegative(),
  apiErrorRatePercent: z.number().min(0).max(100),
  dbConnectionPoolUsagePercent: z.number().min(0).max(100),
  healthyServicesCount: z.number().int().nonnegative(),
  totalServicesCount: z.number().int().nonnegative(),
  timestamp: z.date().or(z.string()),
});

export type PlatformTelemetry = z.infer<typeof PlatformTelemetrySchema>;

export const OperatorAuditLogSchema = z.object({
  id: z.string().uuid(),
  operatorId: z.string().uuid(),
  operatorEmail: z.string().email(),
  operatorRole: z.nativeEnum(PlatformOperatorRole),
  action: z.string().min(1),
  targetTenantId: z.string().uuid().optional(),
  targetTenantName: z.string().optional(),
  ticketReference: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  timestamp: z.date().or(z.string()),
});

export type OperatorAuditLog = z.infer<typeof OperatorAuditLogSchema>;

export const OperatorSessionSchema = z.object({
  operatorId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.nativeEnum(PlatformOperatorRole),
  capabilities: z.array(z.nativeEnum(OperatorCapabilityKey)),
  sessionToken: z.string().min(1),
});

export type OperatorSession = z.infer<typeof OperatorSessionSchema>;
