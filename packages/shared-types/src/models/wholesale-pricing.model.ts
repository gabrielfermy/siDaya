import { z } from 'zod';
import { CompoundDiscountSchema } from './product.model.js';

export const WholesalePriceTierSchema = z.object({
  tierName: z.string().min(1), // 'ECERAN', 'GROSIR_1', 'GROSIR_2', 'DISTRIBUTOR'
  minQuantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

export type WholesalePriceTier = z.infer<typeof WholesalePriceTierSchema>;

export const PricingCalculationInputSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1),
  basePrice: z.number().nonnegative(),
  costPrice: z.number().nonnegative().optional(),
  quantity: z.number().positive(),
  tiers: z.array(WholesalePriceTierSchema).optional(),
  discount: CompoundDiscountSchema.optional(),
  unitMultiplier: z.number().positive().default(1),
});

export type PricingCalculationInput = z.infer<typeof PricingCalculationInputSchema>;

export const PricingCalculationResultSchema = z.object({
  appliedTierName: z.string(),
  unitBasePrice: z.number(),
  effectiveUnitPrice: z.number(),
  grossSubtotal: z.number(),
  discountAmount: z.number(),
  netSubtotal: z.number(),
  cogsSubtotal: z.number().optional(),
  estimatedMarginRupiah: z.number().optional(),
  estimatedMarginPct: z.number().optional(),
});

export type PricingCalculationResult = z.infer<typeof PricingCalculationResultSchema>;
