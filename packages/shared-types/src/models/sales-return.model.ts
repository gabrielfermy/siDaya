import { z } from 'zod';

export const SalesReturnItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  returnId: z.string().uuid(),
  orderItemId: z.string().uuid(),
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  qtyReturned: z.number().positive(),
  unitSellingPrice: z.number().nonnegative(),
  refundSubtotal: z.number().nonnegative(),
  restockToInventory: z.boolean().default(true),
  conditionStatus: z.enum(['SELLABLE', 'DAMAGED_WRITE_OFF', 'DEFECTIVE_RTV']).default('SELLABLE'),
  createdAt: z.date().or(z.string()).optional(),
});

export type SalesReturnItem = z.infer<typeof SalesReturnItemSchema>;

export const SalesReturnSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  branchId: z.string().uuid(),
  orderId: z.string().uuid(),
  customerId: z.string().uuid(),
  returnNumber: z.string().min(1),
  creditNoteNumber: z.string().optional(),
  totalRefundAmount: z.number().nonnegative(),
  settlementType: z.enum(['CASH_REFUND', 'CREDIT_NOTE', 'DEDUCT_PIUTANG', 'REPLACEMENT_GOODS']).default('CREDIT_NOTE'),
  status: z.enum(['PENDING_APPROVAL', 'APPROVED_AND_RESTOCKED', 'REJECTED']).default('PENDING_APPROVAL'),
  approvedByUserId: z.string().uuid().optional(),
  createdByUserId: z.string().uuid(),
  reason: z.string().min(1),
  items: z.array(SalesReturnItemSchema).optional(),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

export type SalesReturn = z.infer<typeof SalesReturnSchema>;

export const CreateSalesReturnDTOSchema = z.object({
  orderId: z.string().uuid(),
  settlementType: z.enum(['CASH_REFUND', 'CREDIT_NOTE', 'DEDUCT_PIUTANG', 'REPLACEMENT_GOODS']).default('CREDIT_NOTE'),
  reason: z.string().min(1),
  items: z.array(z.object({
    orderItemId: z.string().uuid(),
    qtyReturned: z.number().positive(),
    restockToInventory: z.boolean().default(true),
    conditionStatus: z.enum(['SELLABLE', 'DAMAGED_WRITE_OFF', 'DEFECTIVE_RTV']).default('SELLABLE'),
  })).min(1),
});

export type CreateSalesReturnDTO = z.infer<typeof CreateSalesReturnDTOSchema>;
