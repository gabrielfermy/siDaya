import { describe, it, expect } from 'vitest';
import { wholesalePricingService } from '../src/services/wholesale-pricing.service.js';

describe('WholesalePricingDomainService', () => {
  it('should calculate retail price correctly for single item without discounts', () => {
    const result = wholesalePricingService.calculateItemPrice({
      productId: 'a0000002-0000-0000-0000-000000000001',
      sku: 'RJL-50KG',
      basePrice: 617500,
      costPrice: 560000,
      quantity: 2,
    });

    expect(result.appliedTierName).toBe('ECERAN');
    expect(result.unitBasePrice).toBe(617500);
    expect(result.grossSubtotal).toBe(1235000);
    expect(result.discountAmount).toBe(0);
    expect(result.netSubtotal).toBe(1235000);
    expect(result.cogsSubtotal).toBe(1120000);
    expect(result.estimatedMarginRupiah).toBe(115000);
    expect(result.estimatedMarginPct).toBe(9.31);
  });

  it('should activate wholesale tier when minimum quantity threshold is met', () => {
    const tiers = [
      { tierName: 'GROSIR_1', minQuantity: 6, unitPrice: 600000 },
      { tierName: 'GROSIR_2', minQuantity: 20, unitPrice: 585000 },
    ];

    const resultTier1 = wholesalePricingService.calculateItemPrice({
      productId: 'a0000002-0000-0000-0000-000000000001',
      sku: 'RJL-50KG',
      basePrice: 617500,
      costPrice: 560000,
      quantity: 10,
      tiers,
    });

    expect(resultTier1.appliedTierName).toBe('GROSIR_1');
    expect(resultTier1.unitBasePrice).toBe(600000);
    expect(resultTier1.grossSubtotal).toBe(6000000);

    const resultTier2 = wholesalePricingService.calculateItemPrice({
      productId: 'a0000002-0000-0000-0000-000000000001',
      sku: 'RJL-50KG',
      basePrice: 617500,
      costPrice: 560000,
      quantity: 25,
      tiers,
    });

    expect(resultTier2.appliedTierName).toBe('GROSIR_2');
    expect(resultTier2.unitBasePrice).toBe(585000);
    expect(resultTier2.grossSubtotal).toBe(14625000);
  });

  it('should accurately calculate compound discounts (5% + 2% + Rp 10.000)', () => {
    const result = wholesalePricingService.calculateItemPrice({
      productId: 'a0000002-0000-0000-0000-000000000001',
      sku: 'RJL-50KG',
      basePrice: 1000000,
      quantity: 1,
      discount: {
        percent1: 5,
        percent2: 2,
        fixedAmount: 10000,
      },
    });

    // 1.000.000 -> -5% (50.000) = 950.000 -> -2% (19.000) = 931.000 -> -10.000 = 921.000
    expect(result.grossSubtotal).toBe(1000000);
    expect(result.discountAmount).toBe(79000);
    expect(result.netSubtotal).toBe(921000);
    expect(result.effectiveUnitPrice).toBe(921000);
  });

  it('should calculate full cart summary with tax and cart-level discount', () => {
    const items = [
      {
        productId: 'p1',
        sku: 'RJL-50KG',
        basePrice: 600000,
        costPrice: 550000,
        quantity: 5,
      },
      {
        productId: 'p2',
        sku: 'MGO-2L',
        basePrice: 90000,
        costPrice: 80000,
        quantity: 10,
      },
    ];

    const cartResult = wholesalePricingService.calculateCartTotal(items, 11); // 11% PPN

    // Items gross: (5 * 600.000 = 3.000.000) + (10 * 90.000 = 900.000) = 3.900.000
    expect(cartResult.grossTotal).toBe(3900000);
    expect(cartResult.netBeforeTax).toBe(3900000);
    expect(cartResult.taxAmount).toBe(429000); // 11% of 3.900.000
    expect(cartResult.grandTotal).toBe(4329000);
    expect(cartResult.totalCogs).toBe(3550000); // (5 * 550.000) + (10 * 80.000) = 2.750.000 + 800.000 = 3.550.000
    expect(cartResult.grossProfitRupiah).toBe(350000);
  });
});
