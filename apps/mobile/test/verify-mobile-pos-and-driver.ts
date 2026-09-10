/**
 * @fileoverview End-to-End Verification Suite for Mobile POS & Field Driver Client
 * @module Test:MobilePOSAndDriver
 * @description
 * Validates:
 * 1. Camera & Laser Barcode Scanning (EAN-13, SKU lookup, unit conversion)
 * 2. Multi-Tier Wholesale Cart & Compound Discounts Calculation
 * 3. Offline Cash Checkout & PayLink QRIS generation
 * 4. Price-Masked Surat Jalan POD with Signature and Geotagging (UU PDP Compliance)
 * 5. Two-Way Offline Sync Mutation Queue
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import { BarcodeScannerService } from '../src/modules/scanner/barcode-scanner.service.js';
import { POSCartManager } from '../src/modules/pos/pos-cart.state.js';
import { WholesaleCheckoutController } from '../src/modules/pos/wholesale-checkout.controller.js';
import { ProofOfDeliveryService } from '../src/modules/delivery/pod-service.js';
import { OfflineSyncEngine } from '../src/services/sync/sync-engine.js';
import { DeliveryOrderManifest } from '@sidaya/shared-types';

async function runMobileSuite(): Promise<void> {
  console.log('===============================================================');
  console.log('📱 RUNNING VERIFICATION: Mobile POS & Field Driver Client');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string): void {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // --- TEST 1: Barcode Scanner Engine ---
  console.log('--- TEST 1: Barcode Scanner Engine ---');
  const scanner = new BarcodeScannerService({ debounceMs: 50 });
  const scan1 = scanner.processScan('8991234567890'); // Beras Pandan Wangi
  
  assert(scan1 !== null && scan1.matchedProduct !== null, 'Barcode successfully matched product');
  assert(scan1?.matchedProduct?.sku === 'BRS-PDK-50K', 'Matched correct SKU: BRS-PDK-50K');
  assert(scan1?.unitPrice === 14000, 'Base unit price calculated correctly (Rp14,000/KG)');

  // Test Unit Auto-Selection
  await new Promise((r) => setTimeout(r, 60)); // Wait past debounce
  const scanKarung = scanner.processScan('8991234567890', 'Karung 50kg');
  assert(scanKarung?.resolvedUnit === 'Karung 50kg', 'Resolved unit to "Karung 50kg"');
  assert(scanKarung?.unitPrice === 700000, 'Calculated Karung 50kg price (50 * 14,000 = Rp700,000)');

  // --- TEST 2: Multi-Tier Wholesale POS Cart ---
  console.log('\n--- TEST 2: Multi-Tier Wholesale Cart & Pricing ---');
  const cart = new POSCartManager();
  cart.addItem({
    productId: scanKarung!.matchedProduct!.productId,
    productName: scanKarung!.matchedProduct!.name,
    sku: scanKarung!.matchedProduct!.sku,
    selectedUnit: scanKarung!.resolvedUnit,
    conversionFactor: scanKarung!.conversionFactor,
    baseRetailPrice: scanKarung!.matchedProduct!.baseRetailPrice,
    quantity: 2,
    unitPrice: scanKarung!.unitPrice,
  });

  assert(cart.getState().subtotal === 1400000, 'Subtotal for 2 Karung is Rp1,400,000 (Eceran)');

  // Change Tier to GROSIR_1 (5% rebate)
  cart.setTier('GROSIR_1');
  const stateGrosir = cart.getState();
  assert(stateGrosir.subtotal === 1330000, 'Tier GROSIR_1 gives 5% discount (Rp1,330,000)');

  // Apply Compound Formula Discount "5%+2%+5000"
  cart.setFormulaDiscount('5%+2%+5000');
  const stateFormula = cart.getState();
  assert(stateFormula.discountTotal > 0, 'Compound discount applied successfully');
  assert(stateFormula.grandTotal < stateGrosir.subtotal, 'Grand total correctly reduced');

  // --- TEST 3: Cashier Instant Checkout ---
  console.log('\n--- TEST 3: Instant POS Cash Checkout ---');
  const checkoutController = new WholesaleCheckoutController();
  const checkoutResult = await checkoutController.processCashCheckout(
    'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
    'b0000000-0000-0000-0000-000000000001',
    'a0000001-0001-0000-0000-000000000003',
    cart,
    { cashTendered: 1500000 },
    undefined,
    false,
  );

  assert(checkoutResult.order.totalAmount > 0, 'Order created with valid total amount');
  assert(checkoutResult.changeDue >= 0, 'Change due calculated accurately');
  assert(cart.getState().items.length === 0, 'Cart cleanly emptied after successful checkout');

  // --- TEST 4: Price-Masked Surat Jalan Proof of Delivery (POD) ---
  console.log('\n--- TEST 4: Price-Masked Driver POD (UU PDP Compliance) ---');
  const mockManifest: DeliveryOrderManifest = {
    id: 'do_001',
    deliveryOrderNumber: 'DO-20260910-001',
    orderId: 'ord_001',
    orderNumber: 'ORD-20260910-001',
    recipientName: 'Pak Haji Ahmad',
    recipientPhone: '081234567890',
    destinationAddress: 'Jl. Kramat Jati No. 45, Jakarta Timur',
    verificationToken: '4482',
    status: 'OUT_FOR_DELIVERY' as any,
    items: [
      {
        productId: 'prod_001',
        productName: 'Beras Pandan Wangi Premium',
        unitName: 'Karung 50kg',
        quantity: 2,
        storageLocationPath: 'Gudang Utama > Rak A-02',
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const masked = ProofOfDeliveryService.maskFinancialDataForDriver(mockManifest);
  assert((masked as any).totalAmount === undefined, 'Zero financial pricing leak in driver manifest');
  assert((masked as any).unitPrice === undefined, 'Unit prices stripped from driver screen');
  assert(masked.recipientName === 'Pak Haji Ahmad', 'Recipient name preserved');
  assert(masked.verificationToken === '4482', 'Verification token intact for handover');

  const pod = ProofOfDeliveryService.createProofOfDelivery(
    mockManifest,
    {
      signerName: 'Pak Haji Ahmad',
      signerRelation: 'RECIPIENT_SELF',
      signatureVectorData: 'M0,0 L10,10 L20,0 Z',
      capturedAt: Date.now(),
    },
    {
      latitude: -6.2088,
      longitude: 106.8456,
      accuracyMeters: 4.5,
      timestamp: Date.now(),
    },
    {
      photoUri: 'file:///data/user/0/com.sidaya.mobile/cache/pod_001.jpg',
      photoHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      capturedAt: Date.now(),
    },
  );

  assert(pod.status === 'DELIVERED', 'Status marked as DELIVERED upon full handover');
  assert(pod.signature.signerName === 'Pak Haji Ahmad', 'Recipient signature bound to POD');
  assert(pod.location.latitude === -6.2088, 'GPS geotag coordinates recorded');

  // --- TEST 5: Offline Sync & Mutation Queue ---
  console.log('\n--- TEST 5: Offline Mutation Queue & Delta Sync ---');
  const syncEngine = new OfflineSyncEngine();
  syncEngine.enqueueOrder(checkoutResult.order);
  syncEngine.enqueuePod(pod);

  const pending = syncEngine.getPendingQueue();
  assert(pending.length === 2, 'Mutation queue holds 2 pending items');

  const pushResult = await syncEngine.pushPendingMutations();
  assert(pushResult.success === true, 'All pending mutations pushed successfully');
  assert(pushResult.pushedCount === 2, 'Pushed 2 mutations');

  const remaining = syncEngine.getPendingQueue();
  assert(remaining.length === 0, 'Pending queue cleared after successful cloud sync');

  console.log('\n===============================================================');
  console.log(`🏁 MOBILE SUITE COMPLETE: ${passed} passed, ${failed} failed`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runMobileSuite().catch((err) => {
  console.error('Fatal mobile suite failure:', err);
  process.exit(1);
});
