import { z } from 'zod';

/**
 * Cashier Shift Model
 * Supports Opening Float, Mid-shift Cash Drops, and End-of-Shift Reconciliation
 */
export const CashierShiftSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  storeId: z.string().uuid(),
  stationId: z.string().min(1), // Physical counter station UUID
  userId: z.string().uuid(),    // Cashier user id
  cashierName: z.string().min(1),
  openedAt: z.date().or(z.string()),
  closedAt: z.date().or(z.string()).optional(),
  openingCashFloat: z.number().nonnegative(),
  totalCashSales: z.number().nonnegative().default(0),
  totalPaylinkSales: z.number().nonnegative().default(0),
  totalCashDrops: z.number().nonnegative().default(0),
  expectedCashInDrawer: z.number().nonnegative().default(0),
  actualCashCounted: z.number().nonnegative().optional(),
  cashVariance: z.number().optional(), // difference between expected & actual
  status: z.enum(['OPEN', 'CLOSED']).default('OPEN'),
  zReportNumber: z.string().optional(),
});

export type CashierShift = z.infer<typeof CashierShiftSchema>;

/**
 * Cashier Quick Station PIN Switch Payload
 */
export const PinSwitchPayloadSchema = z.object({
  stationId: z.string().min(1),
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be between 4 and 6 digits'),
});

export type PinSwitchPayload = z.infer<typeof PinSwitchPayloadSchema>;
