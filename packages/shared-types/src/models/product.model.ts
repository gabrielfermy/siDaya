import { z } from 'zod';

/**
 * Packaging unit conversion schema (e.g., 1 Dus = 12 Lusin = 144 PCS)
 */
export const ProductUnitConversionSchema = z.object({
  id: z.string().uuid(),
  unitName: z.string().min(1), // e.g., "KARTON", "DUS", "LUSIN", "KARUNG 50KG"
  conversionFactor: z.number().positive(), // Multiplier to base unit (e.g. 144)
  price: z.number().nonnegative(),
  barcode: z.string().optional(),
});

export type ProductUnitConversion = z.infer<typeof ProductUnitConversionSchema>;

/**
 * Compound wholesale discount breakdown
 * Sequential calculation: Subtotal -> Step 1 (-P1%) -> Step 2 (-P2%) -> Step 3 (-Fixed)
 */
export const CompoundDiscountSchema = z.object({
  percent1: z.number().min(0).max(100).default(0),
  percent2: z.number().min(0).max(100).default(0),
  fixedAmount: z.number().min(0).default(0),
});

export type CompoundDiscount = z.infer<typeof CompoundDiscountSchema>;

export function calculateCompoundDiscount(
  subtotal: number,
  discount: CompoundDiscount
): {
  step1Amount: number;
  step2Amount: number;
  fixedAmount: number;
  totalDiscount: number;
  finalAmount: number;
} {
  const step1 = Math.round(subtotal * (discount.percent1 / 100));
  const rem1 = subtotal - step1;
  const step2 = Math.round(rem1 * (discount.percent2 / 100));
  const fixed = discount.fixedAmount;
  const total = step1 + step2 + fixed;
  const final = Math.max(0, subtotal - total);

  return {
    step1Amount: step1,
    step2Amount: step2,
    fixedAmount: fixed,
    totalDiscount: total,
    finalAmount: final,
  };
}

/**
 * Canonical Product Schema
 */
export const ProductSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  barcode: z.string().optional(),
  category: z.string().default('General'),
  baseUnit: z.string().default('PCS'), // Base tracking unit (e.g. PCS, KG)
  currentStock: z.number().default(0),
  minStockAlert: z.number().default(5),
  costPrice: z.number().nonnegative().optional(), // Masked from cashier roles by RLS
  retailPrice: z.number().nonnegative(),
  wholesalePriceTier1: z.number().nonnegative().optional(),
  wholesalePriceTier2: z.number().nonnegative().optional(),
  wholesaleMinQtyTier1: z.number().positive().optional(),
  wholesaleMinQtyTier2: z.number().positive().optional(),
  unitConversions: z.array(ProductUnitConversionSchema).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type Product = z.infer<typeof ProductSchema>;
