import assert from 'assert';
import { wholesalePricingService } from '../src/services/wholesale-pricing.service.js';
import { InboundFifoDomainService } from '../src/services/inbound-fifo.service.js';

async function runCoreEnginesVerification() {
  console.log('===============================================================');
  console.log('🧪 SIDAYA CORE ENGINES VERIFICATION: FIFO & WHOLESALE PRICING');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: WHOLESALE PRICING - RETAIL BASELINE
  // --------------------------------------------------------------------------
  console.log('1️⃣ Testing Retail Price Baseline (No Discount)...');
  const retailResult = wholesalePricingService.calculateItemPrice({
    productId: 'a0000002-0000-0000-0000-000000000001',
    sku: 'RJL-50KG',
    basePrice: 617500,
    costPrice: 560000,
    quantity: 2,
  });

  assert.strictEqual(retailResult.appliedTierName, 'ECERAN', 'Should use ECERAN tier');
  assert.strictEqual(retailResult.unitBasePrice, 617500, 'Unit price should be Rp 617.500');
  assert.strictEqual(retailResult.grossSubtotal, 1235000, 'Gross subtotal should be Rp 1.235.000');
  assert.strictEqual(retailResult.discountAmount, 0, 'Discount should be 0');
  assert.strictEqual(retailResult.netSubtotal, 1235000, 'Net subtotal should be Rp 1.235.000');
  assert.strictEqual(retailResult.cogsSubtotal, 1120000, 'COGS should be Rp 1.120.000');
  assert.strictEqual(retailResult.estimatedMarginRupiah, 115000, 'Gross margin should be Rp 115.000');
  console.log('   ✅ Retail baseline calculation verified.');

  // --------------------------------------------------------------------------
  // TEST 2: WHOLESALE PRICING - BULK TIERS
  // --------------------------------------------------------------------------
  console.log('\n2️⃣ Testing Multi-Tier Wholesale Price Resolution...');
  const tiers = [
    { tierName: 'GROSIR_1', minQuantity: 6, unitPrice: 600000 },
    { tierName: 'GROSIR_2', minQuantity: 20, unitPrice: 585000 },
  ];

  const tier1Result = wholesalePricingService.calculateItemPrice({
    productId: 'a0000002-0000-0000-0000-000000000001',
    sku: 'RJL-50KG',
    basePrice: 617500,
    costPrice: 560000,
    quantity: 10,
    tiers,
  });
  assert.strictEqual(tier1Result.appliedTierName, 'GROSIR_1', 'Quantity 10 should trigger GROSIR_1');
  assert.strictEqual(tier1Result.unitBasePrice, 600000, 'Tier 1 unit price should be Rp 600.000');
  assert.strictEqual(tier1Result.grossSubtotal, 6000000, 'Gross should be Rp 6.000.000');

  const tier2Result = wholesalePricingService.calculateItemPrice({
    productId: 'a0000002-0000-0000-0000-000000000001',
    sku: 'RJL-50KG',
    basePrice: 617500,
    costPrice: 560000,
    quantity: 25,
    tiers,
  });
  assert.strictEqual(tier2Result.appliedTierName, 'GROSIR_2', 'Quantity 25 should trigger GROSIR_2');
  assert.strictEqual(tier2Result.unitBasePrice, 585000, 'Tier 2 unit price should be Rp 585.000');
  assert.strictEqual(tier2Result.grossSubtotal, 14625000, 'Gross should be Rp 14.625.000');
  console.log('   ✅ Wholesale tiers dynamically resolved.');

  // --------------------------------------------------------------------------
  // TEST 3: COMPOUND DISCOUNT (5% + 2% + Rp 10.000)
  // --------------------------------------------------------------------------
  console.log('\n3️⃣ Testing Compound Discount Calculation (5% + 2% + Rp 10.000)...');
  const compoundResult = wholesalePricingService.calculateItemPrice({
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
  assert.strictEqual(compoundResult.grossSubtotal, 1000000);
  assert.strictEqual(compoundResult.discountAmount, 79000);
  assert.strictEqual(compoundResult.netSubtotal, 921000);
  console.log('   ✅ Compound discount formula verified: Gross Rp 1.000.000 -> Discount Rp 79.000 -> Net Rp 921.000.');

  // --------------------------------------------------------------------------
  // TEST 4: FULL CART SUMMARY WITH PPN 11% & MARGINS
  // --------------------------------------------------------------------------
  console.log('\n4️⃣ Testing Full Cart Summary with PPN 11% & COGS Margins...');
  const cartSummary = wholesalePricingService.calculateCartTotal(
    [
      { productId: 'p1', sku: 'RJL-50KG', basePrice: 600000, costPrice: 550000, quantity: 5 },
      { productId: 'p2', sku: 'MGO-2L', basePrice: 90000, costPrice: 80000, quantity: 10 },
    ],
    11 // 11% Tax
  );
  assert.strictEqual(cartSummary.grossTotal, 3900000);
  assert.strictEqual(cartSummary.netBeforeTax, 3900000);
  assert.strictEqual(cartSummary.taxAmount, 429000);
  assert.strictEqual(cartSummary.grandTotal, 4329000);
  assert.strictEqual(cartSummary.totalCogs, 3550000);
  assert.strictEqual(cartSummary.grossProfitRupiah, 350000);
  console.log('   ✅ Cart totals & profit margins verified (Grand Total: Rp 4.329.000, Profit: Rp 350.000).');

  // --------------------------------------------------------------------------
  // TEST 5: FIFO LOT DEPLETION & MULTI-BATCH ALLOCATION
  // --------------------------------------------------------------------------
  console.log('\n5️⃣ Testing FIFO Allocation (Oldest Batch First)...');
  const fifo = new InboundFifoDomainService();
  fifo.resetBatches();
  const tenantId = 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
  const productId = 'a0000002-0000-0000-0000-000000000001';

  // Requesting 60 units (Batch 1 has 40, Batch 2 has 100)
  const allocations = fifo.allocateBatchesFIFO(tenantId, productId, 60);
  assert.strictEqual(allocations.length, 2, 'Should allocate across 2 batches');
  assert.strictEqual(allocations[0].batchLotNumber, 'LOT-RJL-2026-0828', 'Batch 1 must be allocated first');
  assert.strictEqual(allocations[0].quantityAllocated, 40, 'Batch 1 should be fully depleted (40 units)');
  assert.strictEqual(allocations[0].remainingInBatchAfter, 0);

  assert.strictEqual(allocations[1].batchLotNumber, 'LOT-RJL-2026-0906', 'Batch 2 must be allocated next');
  assert.strictEqual(allocations[1].quantityAllocated, 20, 'Batch 2 should supply remaining 20 units');
  assert.strictEqual(allocations[1].remainingInBatchAfter, 80);
  console.log('   ✅ FIFO batch split allocation strictly confirmed (Batch 1 [40] + Batch 2 [20]).');

  console.log('\n===============================================================');
  console.log('🎉 ALL SIDAYA CORE ENGINES PASSED ZERO-DEFECT VERIFICATION!');
  console.log('===============================================================');
}

runCoreEnginesVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
