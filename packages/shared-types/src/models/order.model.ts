import { z } from 'zod';
import { OrderFulfillmentStatus, OrderPaymentStatus, PaymentMethodType } from '../enums/order-status.enum.js';
import { CompoundDiscountSchema } from './product.model.js';

/**
 * Line item in a Sales Order
 */
export const OrderLineItemSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  productName: z.string().min(1),
  productSku: z.string().min(1),
  selectedUnit: z.string().default('PCS'),
  conversionFactor: z.number().positive().default(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  itemDiscount: CompoundDiscountSchema.optional(),
  subtotal: z.number().nonnegative(),
  allocatedBatchId: z.string().uuid().optional(), // Inbound batch allocated via FIFO
});

export type OrderLineItem = z.infer<typeof OrderLineItemSchema>;

/**
 * Checkout Order Request Payload
 */
export const CheckoutOrderPayloadSchema = z.object({
  storeId: z.string().uuid(),
  cashierUserId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(), // Required for WhatsApp PayLink dispatch
  items: z.array(OrderLineItemSchema).min(1),
  orderDiscount: CompoundDiscountSchema.optional(),
  paymentMethod: z.nativeEnum(PaymentMethodType),
  cashTendered: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export type CheckoutOrderPayload = z.infer<typeof CheckoutOrderPayloadSchema>;

/**
 * Sales Order Record
 */
export const SalesOrderSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  storeId: z.string().uuid(),
  orderNumber: z.string().min(1), // e.g., "ORD-20260908-0081"
  cashierUserId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(OrderLineItemSchema),
  subtotalAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  paymentStatus: z.nativeEnum(OrderPaymentStatus),
  fulfillmentStatus: z.nativeEnum(OrderFulfillmentStatus),
  paymentMethod: z.nativeEnum(PaymentMethodType),
  paylinkUrl: z.string().url().optional(), // Dynamic hosted checkout URL
  receiptUrl: z.string().url().optional(),
  paidAt: z.date().or(z.string()).optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type SalesOrder = z.infer<typeof SalesOrderSchema>;
