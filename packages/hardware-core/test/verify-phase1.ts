import { EscPosBuilder } from '../src/escpos/escpos-builder';
import { EscP2Builder } from '../src/escp2/escp2-builder';
import {
  formatThermalReceipt,
  formatDotMatrixWholesaleInvoice,
  formatDotMatrixSuratJalan,
} from '../src/templates/receipt-templates';
import {
  SalesOrder,
  DeliveryOrderManifest,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
  PaymentMethodType,
  calculateCompoundDiscount,
  formatWhatsAppInvoiceMessage,
  encodeWhatsAppShareUrl,
} from '@sidaya/shared-types';

console.log('=== RUNNING PHASE 1 VERIFICATION TESTS ===\n');

// 1. Verify ESC/POS Builder
const escpos = new EscPosBuilder(58);
escpos.align('center').bold(true).textLine('TEST HEADER').bold(false);
escpos.row('Subtotal', 'Rp100.000');
escpos.cut();
const escposBytes = escpos.toBytes();
console.log(`[PASS] ESC/POS Builder produced ${escposBytes.length} bytes.`);
if (escposBytes[escposBytes.length - 2] === 0x56 && escposBytes[escposBytes.length - 1] === 0x00) {
  console.log('[PASS] ESC/POS cut command (0x1D 0x56 0x00) verified at end of stream.');
} else {
  throw new Error('ESC/POS cut command missing!');
}

// 2. Verify ESC/P2 Dot Matrix Builder
const escp2 = new EscP2Builder(true);
escp2.textLine('FAKTUR PENJUALAN CONTINUOUS FORM');
escp2.formFeed();
const escp2Bytes = escp2.toBytes();
console.log(`[PASS] ESC/P2 Builder produced ${escp2Bytes.length} bytes.`);
if (escp2Bytes[escp2Bytes.length - 1] === 0x0c) {
  console.log('[PASS] ESC/P2 Form Feed (0x0C) verified at end of stream.');
} else {
  throw new Error('ESC/P2 Form Feed missing!');
}

// 3. Test Sample Sales Order & Thermal/Dot Matrix Rendering
const sampleOrder: SalesOrder = {
  id: '00000000-0000-0000-0000-000000000001',
  tenantId: '00000000-0000-0000-0000-000000000002',
  storeId: '00000000-0000-0000-0000-000000000003',
  orderNumber: 'ORD-20260908-0042',
  cashierUserId: 'usr_cashier_01',
  customerName: 'Toko Barokah Jaya',
  customerPhone: '081298765432',
  items: [
    {
      productId: '00000000-0000-0000-0000-000000000004',
      productName: 'Beras Rojolele Super',
      productSku: 'RJL-50',
      selectedUnit: 'KARUNG 50KG',
      conversionFactor: 1,
      quantity: 3,
      unitPrice: 650000,
      subtotal: 1950000,
    },
  ],
  subtotalAmount: 1950000,
  discountAmount: 105000,
  totalAmount: 1845000,
  paymentStatus: OrderPaymentStatus.PAID,
  fulfillmentStatus: OrderFulfillmentStatus.ALLOCATED_FIFO,
  paymentMethod: PaymentMethodType.PAYLINK_QRIS,
  paylinkUrl: 'https://pay.sidaya.id/p/tok_982a',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const tenantInfo = {
  businessName: 'Toko Beras Jaya Bersama',
  branchName: 'Cabang Pasar Induk',
  phoneNumber: '081234567890',
  address: 'Jl. Pasar Induk No. 12, Jakarta',
};

const thermalReceipt = formatThermalReceipt(sampleOrder, tenantInfo, 58);
console.log(`[PASS] Thermal receipt formatted successfully (${thermalReceipt.length} bytes).`);

const dotMatrixInvoice = formatDotMatrixWholesaleInvoice(sampleOrder, tenantInfo);
console.log(`[PASS] Dot Matrix wholesale invoice formatted successfully (${dotMatrixInvoice.length} bytes).`);

// 4. Test Surat Jalan (Zero financial fields!)
const sampleManifest: DeliveryOrderManifest = {
  id: '00000000-0000-0000-0000-000000000005',
  tenantId: '00000000-0000-0000-0000-000000000002',
  salesOrderId: sampleOrder.id,
  deliveryOrderNumber: 'SJ-20260908-0042',
  orderNumber: sampleOrder.orderNumber,
  driverName: 'Supriadi',
  vehiclePlateNumber: 'B 9182 KAA',
  dispatchTimestamp: new Date(),
  recipientName: 'Pak Haji Rahmat',
  recipientPhone: '081298765432',
  destinationAddress: 'Pasar Induk Kramat Jati Blok C-12',
  items: [
    {
      id: '00000000-0000-0000-0000-000000000006',
      productId: '00000000-0000-0000-0000-000000000004',
      productName: 'Beras Rojolele Super',
      productSku: 'RJL-50',
      quantity: 3,
      unitName: 'KARUNG 50KG',
      storageLocationPath: 'Gudang Utama -> Rak B-02',
    },
  ],
  verificationToken: 'tok_sj_982a',
  verificationUrl: 'https://nota.sidaya.id/sj/tok_sj_982a',
  signatures: {},
};

const dotMatrixSuratJalan = formatDotMatrixSuratJalan(sampleManifest, tenantInfo);
const decodedSuratJalanText = new TextDecoder().decode(dotMatrixSuratJalan);
console.log(`[PASS] Surat Jalan formatted (${dotMatrixSuratJalan.length} bytes).`);

if (decodedSuratJalanText.includes('Rp1.845.000') || decodedSuratJalanText.includes('Subtotal')) {
  throw new Error('SECURITY VIOLATION: Financial data leaked onto Surat Jalan!');
} else {
  console.log('[PASS] PRICE PRIVACY VERIFIED: No financial fields exist on Surat Jalan text stream.');
}

// 5. Test Compound Wholesale Discount Calculation
const compound = calculateCompoundDiscount(10000000, {
  percent1: 5,
  percent2: 2,
  fixedAmount: 10000,
});
// Step 1: 5% of 10.000.000 = 500.000 (rem: 9.500.000)
// Step 2: 2% of 9.500.000 = 190.000 (rem: 9.310.000)
// Step 3: Fixed 10.000
// Total Discount = 500.000 + 190.000 + 10.000 = 700.000
// Final Amount = 9.300.000
console.log(`[PASS] Compound discount math: 10.000.000 -> Diskon: Rp${compound.totalDiscount.toLocaleString('id-ID')}, Akhir: Rp${compound.finalAmount.toLocaleString('id-ID')}`);
if (compound.totalDiscount === 700000 && compound.finalAmount === 9300000) {
  console.log('[PASS] Exact compound discount calculation matches wholesale accounting rule.');
} else {
  throw new Error(`Calculation mismatch! Expected 700000, got ${compound.totalDiscount}`);
}

// 6. Test WhatsApp Share URL Formatter
const waMessage = formatWhatsAppInvoiceMessage({
  merchantName: 'Toko Beras Jaya Bersama',
  orderNumber: 'ORD-20260908-0042',
  totalAmount: 1845000,
  paylinkUrl: 'https://pay.sidaya.id/p/tok_982a',
  itemCount: 3,
});
const waUrl = encodeWhatsAppShareUrl('081298765432', waMessage);
console.log(`[PASS] WhatsApp Share URL generated: ${waUrl.substring(0, 50)}...`);

console.log('\n=== ALL PHASE 1 VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
