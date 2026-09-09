import { z } from 'zod';

/**
 * Multi-Tier Physical Storage Location
 * Hierarchy: Warehouse -> Zone -> Rack -> Bin
 */
export const StorageLocationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  warehouseName: z.string().min(1), // e.g. "Gudang Utama"
  zoneName: z.string().optional(), // e.g. "Zona Beras / Cold Room"
  rackName: z.string().optional(), // e.g. "Rak B-02"
  binName: z.string().optional(),  // e.g. "Palet 14"
  fullLocationPath: z.string(),   // e.g. "Gudang Utama -> Zona Beras -> Rak B-02"
});

export type StorageLocation = z.infer<typeof StorageLocationSchema>;

/**
 * Inbound Product Batch (FIFO / FEFO Tracking)
 */
export const ProductBatchSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  productId: z.string().uuid(),
  storageLocationId: z.string().uuid().optional(),
  lotNumber: z.string().min(1), // e.g. "LOT-ROJO-20260901-01"
  inboundDate: z.date().or(z.string()),
  harvestOrMillingDate: z.date().or(z.string()).optional(),
  expiryDate: z.date().or(z.string()).optional(),
  initialQuantity: z.number().positive(),
  remainingQuantity: z.number().nonnegative(),
  unitCostPrice: z.number().nonnegative().optional(), // Masked from cashier
  isActive: z.boolean().default(true),
});

export type ProductBatch = z.infer<typeof ProductBatchSchema>;

/**
 * Supplier Profile with Default Return Policies (RTV)
 */
export const SupplierSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().optional(),
  paymentTermsDays: z.number().nonnegative().default(30),
  returnPolicyDays: z.number().nonnegative().default(7),
  returnPolicyTerms: z.string().optional(), // e.g., "Kutu atau kemasan robek dapat diretur dalam 7 hari"
});

export type Supplier = z.infer<typeof SupplierSchema>;

/**
 * Inbound Receiving Payload DTO
 */
export const ReceiveInboundShipmentDTOSchema = z.object({
  supplierId: z.string().uuid(),
  supplierPoNumber: z.string().optional(),
  carrierName: z.string().optional(),
  driverName: z.string().optional(),
  vehicleNumberPlate: z.string().optional(),
  receivedDate: z.string().datetime().or(z.string()),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantityReceived: z.number().positive(),
      unitName: z.string().min(1),
      unitCostPrice: z.number().nonnegative(),
      lotNumber: z.string().min(1),
      harvestOrMillingDate: z.string().optional(),
      expiryDate: z.string().optional(),
      storageLocationId: z.string().uuid().optional(),
    })
  ).min(1),
  returnPolicyNotes: z.string().optional(),
});

export type ReceiveInboundShipmentDTO = z.infer<typeof ReceiveInboundShipmentDTOSchema>;
