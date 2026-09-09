import { z } from 'zod';
import { PaymentMethodType } from '../enums/order-status.enum.js';

/**
 * Customer Kasbon / Piutang Record
 */
export const PiutangRecordSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  customerId: z.string().uuid(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  orderId: z.string().uuid(),
  orderNumber: z.string().min(1),
  initialDebtAmount: z.number().positive(),
  remainingBalance: z.number().nonnegative(),
  dueDate: z.date().or(z.string()).optional(),
  status: z.enum(['UNPAID', 'PARTIALLY_SETTLED', 'SETTLED', 'DEFAULTED']),
  lastPaymentDate: z.date().or(z.string()).optional(),
  createdAt: z.date().or(z.string()),
});

export type PiutangRecord = z.infer<typeof PiutangRecordSchema>;

/**
 * Settle Piutang Payload
 */
export const SettlePiutangPayloadSchema = z.object({
  piutangId: z.string().uuid(),
  amountPaid: z.number().positive(),
  paymentMethod: z.nativeEnum(PaymentMethodType),
  cashierUserId: z.string().uuid(),
  notes: z.string().optional(),
});

export type SettlePiutangPayload = z.infer<typeof SettlePiutangPayloadSchema>;
