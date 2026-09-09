import { z } from 'zod';

export const WarehouseTransferItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  transferId: z.string().uuid(),
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  qtyShipped: z.number().positive(),
  qtyReceived: z.number().nonnegative().default(0),
  unitCost: z.number().nonnegative().default(0),
  status: z.enum(['IN_TRANSIT', 'RECEIVED_FULL', 'DISCREPANCY']).default('IN_TRANSIT'),
  notes: z.string().optional(),
});

export type WarehouseTransferItem = z.infer<typeof WarehouseTransferItemSchema>;

export const WarehouseTransferSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  transferNumber: z.string().min(1),
  sourceBranchId: z.string().uuid(),
  destinationBranchId: z.string().uuid(),
  requestedByUserId: z.string().uuid(),
  approvedByUserId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'IN_TRANSIT', 'RECEIVED', 'REJECTED']).default('DRAFT'),
  driverName: z.string().optional(),
  vehiclePlate: z.string().optional(),
  notes: z.string().optional(),
  shippedAt: z.date().or(z.string()).optional(),
  receivedAt: z.date().or(z.string()).optional(),
  items: z.array(WarehouseTransferItemSchema).optional(),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

export type WarehouseTransfer = z.infer<typeof WarehouseTransferSchema>;

export const StockOpnameItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sessionId: z.string().uuid(),
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  systemQty: z.number().nonnegative(),
  countedQty: z.number().nonnegative(),
  varianceQty: z.number(),
  unitCost: z.number().nonnegative(),
  varianceValue: z.number(),
  scannerUserId: z.string().uuid().optional(),
});

export type StockOpnameItem = z.infer<typeof StockOpnameItemSchema>;

export const StockOpnameSessionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  branchId: z.string().uuid(),
  sessionNumber: z.string().min(1),
  leadAuditorId: z.string().uuid(),
  status: z.enum(['IN_PROGRESS', 'PENDING_APPROVAL', 'ADJUSTED_AND_CLOSED', 'CANCELLED']).default('IN_PROGRESS'),
  totalVarianceQty: z.number().default(0),
  totalVarianceValue: z.number().default(0),
  notes: z.string().optional(),
  startedAt: z.date().or(z.string()).optional(),
  closedAt: z.date().or(z.string()).optional(),
  items: z.array(StockOpnameItemSchema).optional(),
});

export type StockOpnameSession = z.infer<typeof StockOpnameSessionSchema>;

export const StockAdjustmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  branchId: z.string().uuid(),
  adjustmentNumber: z.string().min(1),
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  reasonCode: z.enum(['DAMAGED_EXPIRED', 'THEFT_LOSS', 'OPNAME_RECONCILIATION', 'INTERNAL_USAGE']),
  qtyDelta: z.number(),
  unitCost: z.number().nonnegative(),
  totalValueImpact: z.number(),
  authorizedByUserId: z.string().uuid(),
  notes: z.string().optional(),
  createdAt: z.date().or(z.string()).optional(),
});

export type StockAdjustment = z.infer<typeof StockAdjustmentSchema>;
