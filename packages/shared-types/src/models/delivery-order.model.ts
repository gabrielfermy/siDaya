import { z } from 'zod';

/**
 * Driver Working Permit Item (Surat Jalan Item)
 * STRICT SECURITY CONSTRAINT:
 * MUST NEVER include unit_price, subtotal, discount, or cost_price.
 * Protects merchant commercial margins and pricing secrets from drivers.
 */
export const DeliveryOrderItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string().min(1),
  productSku: z.string().min(1),
  lotNumber: z.string().optional(),
  storageLocationPath: z.string().optional(), // Pickup instructions (e.g. "Gudang Utama -> Rak B-01")
  quantity: z.number().positive(),
  unitName: z.string().min(1), // e.g. "KARUNG 50KG" or "KARTON"
});

export type DeliveryOrderItem = z.infer<typeof DeliveryOrderItemSchema>;

/**
 * Driver Working Permit (Surat Jalan / Delivery Order)
 * Generated from a confirmed sales order.
 * Strictly free of monetary values.
 */
export const DeliveryOrderManifestSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  salesOrderId: z.string().uuid(),
  deliveryOrderNumber: z.string().min(1), // e.g., "SJ-20260908-0042"
  orderNumber: z.string().min(1),         // Master invoice reference
  driverName: z.string().min(1),
  vehiclePlateNumber: z.string().min(1),
  dispatchTimestamp: z.date().or(z.string()),
  recipientName: z.string().min(1),
  recipientPhone: z.string().min(1),
  destinationAddress: z.string().min(1),
  items: z.array(DeliveryOrderItemSchema).min(1),
  verificationToken: z.string().min(1),
  verificationUrl: z.string().url(),     // e.g. "https://nota.sidaya.id/sj/:token"
  signatures: z.object({
    warehouseOfficerSignedAt: z.string().datetime().optional(),
    driverSignedAt: z.string().datetime().optional(),
    recipientSignedAt: z.string().datetime().optional(),
    recipientSignatureImage: z.string().optional(), // Base64 or CDN URL
  }).default({}),
  notes: z.string().optional(),
});

export type DeliveryOrderManifest = z.infer<typeof DeliveryOrderManifestSchema>;
