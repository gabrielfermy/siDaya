import {
  PricingCalculationInput,
  PricingCalculationResult,
  CompoundDiscount,
} from '@sidaya/shared-types';

export class WholesalePricingDomainService {
  /**
   * Calculate effective price, tiered bulk discount, compound discounts (e.g. 5% + 2% + Rp 10.000),
   * and projected gross margin / COGS profitability.
   */
  public calculateItemPrice(input: PricingCalculationInput): PricingCalculationResult {
    const {
      basePrice,
      costPrice,
      quantity,
      tiers = [],
      discount,
      unitMultiplier = 1,
    } = input;

    const normalizedQty = quantity * unitMultiplier;

    // 1. Resolve Tier Price
    let appliedTierName = 'ECERAN';
    let unitBasePrice = basePrice;

    if (tiers.length > 0) {
      // Sort tiers descending by minQuantity
      const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
      for (const tier of sortedTiers) {
        if (normalizedQty >= tier.minQuantity) {
          appliedTierName = tier.tierName;
          unitBasePrice = tier.unitPrice;
          break;
        }
      }
    }

    const grossSubtotal = unitBasePrice * quantity;

    // 2. Compound Discount Calculation (5% + 2% + Rp)
    let runningTotal = grossSubtotal;
    let discountAmount = 0;

    if (discount) {
      // Step 1: First Percentage Discount
      if (discount.percent1 > 0) {
        const d1 = (runningTotal * discount.percent1) / 100;
        runningTotal -= d1;
        discountAmount += d1;
      }

      // Step 2: Second Percentage Discount (compounded)
      if (discount.percent2 > 0) {
        const d2 = (runningTotal * discount.percent2) / 100;
        runningTotal -= d2;
        discountAmount += d2;
      }

      // Step 3: Fixed Nominal Rupiah
      if (discount.fixedAmount > 0) {
        const nominal = Math.min(runningTotal, discount.fixedAmount);
        runningTotal -= nominal;
        discountAmount += nominal;
      }
    }

    const netSubtotal = Math.max(0, Math.round(runningTotal));
    const effectiveUnitPrice = quantity > 0 ? Math.round(netSubtotal / quantity) : 0;

    // 3. Margin Calculation (if COGS costPrice provided)
    let cogsSubtotal: number | undefined;
    let estimatedMarginRupiah: number | undefined;
    let estimatedMarginPct: number | undefined;

    if (costPrice !== undefined && costPrice >= 0) {
      cogsSubtotal = costPrice * quantity;
      estimatedMarginRupiah = netSubtotal - cogsSubtotal;
      estimatedMarginPct = netSubtotal > 0
        ? Math.round((estimatedMarginRupiah / netSubtotal) * 10000) / 100
        : 0;
    }

    return {
      appliedTierName,
      unitBasePrice,
      effectiveUnitPrice,
      grossSubtotal,
      discountAmount: Math.round(discountAmount),
      netSubtotal,
      cogsSubtotal,
      estimatedMarginRupiah,
      estimatedMarginPct,
    };
  }

  /**
   * Bulk calculate entire cart of items with subtotal, tax, and grand total.
   */
  public calculateCartTotal(
    items: PricingCalculationInput[],
    taxRatePct: number = 0,
    cartDiscount?: CompoundDiscount
  ) {
    const itemResults = items.map(item => ({
      input: item,
      result: this.calculateItemPrice(item),
    }));

    const grossTotal = itemResults.reduce((sum, item) => sum + item.result.grossSubtotal, 0);
    const itemDiscountsTotal = itemResults.reduce((sum, item) => sum + item.result.discountAmount, 0);
    const itemsNetSubtotal = itemResults.reduce((sum, item) => sum + item.result.netSubtotal, 0);

    // Global Cart Discount (if any)
    let cartDiscountAmount = 0;
    let runningAfterCart = itemsNetSubtotal;

    if (cartDiscount) {
      if (cartDiscount.percent1 > 0) {
        const d1 = (runningAfterCart * cartDiscount.percent1) / 100;
        runningAfterCart -= d1;
        cartDiscountAmount += d1;
      }
      if (cartDiscount.percent2 > 0) {
        const d2 = (runningAfterCart * cartDiscount.percent2) / 100;
        runningAfterCart -= d2;
        cartDiscountAmount += d2;
      }
      if (cartDiscount.fixedAmount > 0) {
        const nominal = Math.min(runningAfterCart, cartDiscount.fixedAmount);
        runningAfterCart -= nominal;
        cartDiscountAmount += nominal;
      }
    }

    const netBeforeTax = Math.max(0, Math.round(runningAfterCart));
    const taxAmount = Math.round((netBeforeTax * taxRatePct) / 100);
    const grandTotal = netBeforeTax + taxAmount;

    const totalCogs = itemResults.reduce((sum, item) => sum + (item.result.cogsSubtotal || 0), 0);
    const grossProfitRupiah = netBeforeTax - totalCogs;
    const grossProfitMarginPct = netBeforeTax > 0
      ? Math.round((grossProfitRupiah / netBeforeTax) * 10000) / 100
      : 0;

    return {
      items: itemResults,
      grossTotal,
      itemDiscountsTotal,
      cartDiscountAmount: Math.round(cartDiscountAmount),
      netBeforeTax,
      taxAmount,
      grandTotal,
      totalCogs,
      grossProfitRupiah,
      grossProfitMarginPct,
    };
  }
}

export const wholesalePricingService = new WholesalePricingDomainService();
