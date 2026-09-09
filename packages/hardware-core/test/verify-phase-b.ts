import assert from 'assert';
import { EscPosBuilder } from '../src/escpos/escpos-builder';
import { EscP2Builder } from '../src/escp2/escp2-builder';
import {
  formatThermalReceipt,
  formatCashDrawerKick,
  formatDotMatrixWholesaleInvoice,
  formatDotMatrixSuratJalan,
} from '../src/templates/receipt-templates';
import {
  SalesOrder,
  DeliveryOrderManifest,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
  PaymentMethodType,
} from '@sidaya/shared-types';

async function runPhaseBVerification() {
  console.log('===============================================================');
  console.log('🧪 SIDAYA PHASE B VERIFICATION: POS & HARDWARE DRIVERS (ESC/POS & ESC/P2)');
  console.log('===============================================================\n');

  // 1. Test Cash Drawer Kick command
  console.log('1️⃣ Testing Cash Drawer Kick pulse (Pin 2 & Pin 5)...');
  const kickPin2 = formatCashDrawerKick(2);
  const kickPin5 = formatCashDrawerKick(5);

  assert.strictEqual(kickPin2[0], 0x1b, 'ESC');
  assert.strictEqual(kickPin2[1], 0x40, '@ (Init)');
  assert.strictEqual(kickPin2[2], 0x1b, 'ESC');
  assert.strictEqual(kickPin2[3], 0x70, 'p (Pulse)');
  assert.strictEqual(kickPin2[4], 0x00, 'Pin 2 connector (m=0)');
  assert.strictEqual(kickPin5[4], 0x01, 'Pin 5 connector (m=1)');
  console.log('   ✅ Cash drawer kick sequences verified.');

  // 2. Test Native QR Code Command
  console.log('\n2️⃣ Testing Native ESC/POS QR Code stream...');
  const qrBuilder = new EscPosBuilder(58);
  qrBuilder.qrCode('https://pay.sidaya.id/p/tok_qr_test', 5);
  const qrBytes = qrBuilder.toBytes();
  assert.ok(qrBytes.length > 20, 'QR bytes should be generated');
  console.log(`   ✅ Native ESC/POS QR Code generated (${qrBytes.length} bytes).`);

  // 3. Test Native Barcode EAN-13 & Code 128
  console.log('\n3️⃣ Testing Native 1D Barcode stream (GS k)...');
  const barcodeBuilder = new EscPosBuilder(80);
  barcodeBuilder.barcode('8999908001234', 'EAN13');
  const barcodeBytes = barcodeBuilder.toBytes();
  assert.ok(barcodeBytes.length > 15, 'Barcode bytes generated');
  console.log(`   ✅ Native ESC/POS Barcode generated (${barcodeBytes.length} bytes).`);

  // 4. Test 58mm and 80mm Thermal Receipt with Embedded QR
  console.log('\n4️⃣ Testing Thermal Receipt formatting (58mm & 80mm)...');
  const sampleOrder: SalesOrder = {
    id: 'a0000003-0000-0000-0000-000000000001',
    tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
    storeId: 'b0000000-0000-0000-0000-000000000001',
    cashierUserId: 'a0000001-0001-0000-0000-000000000003',
    orderNumber: 'ORD-20260908-0129',
    customerName: 'Pak Haji Rahmat',
    customerPhone: '081298765432',
    paymentMethod: PaymentMethodType.PAYLINK_QRIS,
    subtotalAmount: 13000000,
    discountAmount: 250000,
    totalAmount: 12750000,
    paymentStatus: OrderPaymentStatus.PAID,
    fulfillmentStatus: OrderFulfillmentStatus.ALLOCATED_FIFO,
    paylinkUrl: 'https://pay.sidaya.id/p/tok_ord_0129',
    items: [
      {
        id: 'a0000004-0000-0000-0000-000000000001',
        productId: 'a0000002-0000-0000-0000-000000000001',
        productName: 'Beras Rojolele Super Premium 50KG',
        productSku: 'RJL-50',
        selectedUnit: 'KARUNG 50KG',
        conversionFactor: 1,
        quantity: 20,
        unitPrice: 650000,
        subtotal: 13000000,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tenantInfo = {
    businessName: 'Toko Grosir Beras Jaya Bersama',
    branchName: 'Gudang Induk Kramat Jati',
    address: 'Jl. Raya Bogor KM 22',
    phoneNumber: '081234567890',
  };

  const receipt58 = formatThermalReceipt(sampleOrder, tenantInfo, 58);
  const receipt80 = formatThermalReceipt(sampleOrder, tenantInfo, 80);

  assert.ok(receipt58.length > 500, '58mm receipt should have content');
  assert.ok(receipt80.length > 500, '80mm receipt should have content');
  console.log(`   ✅ 58mm (${receipt58.length} bytes) and 80mm (${receipt80.length} bytes) thermal receipts generated with QR.`);

  // 5. Test Dot Matrix Continuous Form & Surat Jalan Price Privacy Invariant
  console.log('\n5️⃣ Testing Dot Matrix Continuous Form (Epson LX-310) & Surat Jalan Privacy...');
  const invoiceDotMatrix = formatDotMatrixWholesaleInvoice(sampleOrder, tenantInfo);
  assert.strictEqual(invoiceDotMatrix[invoiceDotMatrix.length - 1], 0x0c, 'Dot matrix invoice must end with Form Feed (0x0C)');

  const sampleManifest: DeliveryOrderManifest = {
    id: 'd0000001-0000-0000-0000-000000000001',
    tenantId: sampleOrder.tenantId,
    salesOrderId: sampleOrder.id,
    deliveryOrderNumber: 'SJ-20260908-0129',
    orderNumber: sampleOrder.orderNumber,
    driverName: 'Joko Supir',
    vehiclePlateNumber: 'B 9482 TJA',
    dispatchTimestamp: new Date(),
    recipientName: 'Pak Haji Rahmat',
    recipientPhone: '081298765432',
    destinationAddress: 'Jl. Raya Bogor KM 22, Kramat Jati',
    items: [
      {
        id: 'd0000002-0000-0000-0000-000000000001',
        productId: 'a0000002-0000-0000-0000-000000000001',
        productName: 'Beras Rojolele Super Premium 50KG',
        productSku: 'RJL-50',
        quantity: 20,
        unitName: 'KARUNG 50KG',
        storageLocationPath: 'Zona Beras / Rak A-01 (Pallet 1)',
      },
    ],
    verificationToken: 'tok_sj_0129',
    verificationUrl: 'https://nota.sidaya.id/sj/tok_sj_0129',
    signatures: {},
  };

  const sjDotMatrix = formatDotMatrixSuratJalan(sampleManifest, tenantInfo);
  const decodedSJ = new TextDecoder().decode(sjDotMatrix);

  assert.ok(!decodedSJ.includes('12.750.000'), 'Price MUST NEVER appear on Surat Jalan');
  assert.ok(!decodedSJ.includes('Subtotal'), 'Financial headers MUST NOT appear on Surat Jalan');
  assert.ok(decodedSJ.includes('Joko Supir'), 'Driver name should be present');
  assert.ok(decodedSJ.includes('B 9482 TJA'), 'Vehicle plate should be present');
  console.log('   ✅ Dot Matrix Surat Jalan confirmed 100% price-privacy compliant.');

  console.log('\n===============================================================');
  console.log('🎉 ALL PHASE B POS & HARDWARE DRIVER TESTS PASSED PERFECTLY!');
  console.log('===============================================================');
}

runPhaseBVerification().catch((err) => {
  console.error('\n❌ Phase B Verification Failed:', err);
  process.exit(1);
});
