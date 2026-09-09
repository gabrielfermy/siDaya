import { SalesOrder, DeliveryOrderManifest } from '@sidaya/shared-types';
import { EscPosBuilder, ThermalPaperWidth } from '../escpos/escpos-builder';
import { EscP2Builder } from '../escp2/escp2-builder';

export interface TenantReceiptInfo {
  businessName: string;
  branchName: string;
  address?: string | undefined;
  phoneNumber?: string | undefined;
  footerNote?: string | undefined;
}

/**
 * Formats a sales order into a standard ESC/POS 58mm or 80mm thermal receipt stream
 */
export function formatThermalReceipt(
  order: SalesOrder,
  tenant: TenantReceiptInfo,
  paperWidth: ThermalPaperWidth = 58,
): Uint8Array {
  const p = new EscPosBuilder(paperWidth);

  // Header
  p.align('center').bold(true).textLine(tenant.businessName).bold(false);
  p.textLine(tenant.branchName);
  if (tenant.address) p.textLine(tenant.address);
  if (tenant.phoneNumber) p.textLine(`Telp: ${tenant.phoneNumber}`);
  p.divider('=');

  // Metadata
  p.align('left');
  p.row('No. Nota:', order.orderNumber);
  p.row('Tanggal:', new Date(order.createdAt).toLocaleDateString('id-ID'));
  if (order.customerName) {
    p.row('Pelanggan:', order.customerName);
  }
  p.divider('-');

  // Line items
  for (const item of order.items) {
    p.textLine(item.productName);
    const qtyStr = `${item.quantity} ${item.selectedUnit} x Rp${item.unitPrice.toLocaleString('id-ID')}`;
    const subStr = `Rp${item.subtotal.toLocaleString('id-ID')}`;
    p.row(`  ${qtyStr}`, subStr);
  }

  p.divider('-');

  // Financial totals
  p.row('Subtotal:', `Rp${order.subtotalAmount.toLocaleString('id-ID')}`);
  if (order.discountAmount > 0) {
    p.row('Diskon Grosir:', `-Rp${order.discountAmount.toLocaleString('id-ID')}`);
  }
  p.bold(true).row('TOTAL:', `Rp${order.totalAmount.toLocaleString('id-ID')}`).bold(false);
  p.row('Pembayaran:', order.paymentMethod);
  p.row('Status:', order.paymentStatus);

  p.divider('=');

  // Footer & PayLink QR prompt if applicable
  p.align('center');
  if (order.paylinkUrl) {
    p.textLine('Scan QR Bayar / Verifikasi:');
    p.qrCode(order.paylinkUrl, paperWidth === 58 ? 5 : 6);
    p.textLine(order.paylinkUrl);
    p.feed(1);
  }
  p.textLine(tenant.footerNote ?? 'Terima Kasih Atas Kunjungan Anda');
  p.textLine('Powered by SiDaya (Ashvin Labs)');

  p.cut();
  return p.toBytes();
}

/**
 * Returns raw ESC/POS byte sequence to kick open cash drawer via RJ-11 port
 */
export function formatCashDrawerKick(pin: 2 | 5 = 2): Uint8Array {
  return new EscPosBuilder().cashDrawerKick(pin).toBytes();
}

/**
 * Formats a wholesale order into an Epson ESC/P2 Dot Matrix continuous form invoice
 */
export function formatDotMatrixWholesaleInvoice(
  order: SalesOrder,
  tenant: TenantReceiptInfo,
): Uint8Array {
  const p = new EscP2Builder(true); // Condensed 132-column mode

  p.bold(true).textLine(`NOTA PENJUALAN GROSIR - ${tenant.businessName}`).bold(false);
  p.textLine(`Cabang: ${tenant.branchName} | Telp: ${tenant.phoneNumber ?? '-'}`);
  p.divider('=');

  p.row(`No. Faktur: ${order.orderNumber}`, `Tanggal: ${new Date(order.createdAt).toLocaleString('id-ID')}`);
  p.row(`Pelanggan : ${order.customerName ?? 'Umum / Tunai'}`, `Kasir/Sales: ${order.cashierUserId}`);
  p.divider('-');

  // Header Table
  const hName = 'Nama Barang'.padEnd(45);
  const hUnit = 'Satuan'.padEnd(12);
  const hQty = 'Jumlah'.padStart(8);
  const hPrice = 'Harga Satuan'.padStart(16);
  const hSub = 'Subtotal (Rp)'.padStart(18);
  p.textLine(`${hName} ${hUnit} ${hQty} ${hPrice} ${hSub}`);
  p.divider('-');

  for (const item of order.items) {
    const colName = item.productName.substring(0, 44).padEnd(45);
    const colUnit = item.selectedUnit.substring(0, 11).padEnd(12);
    const colQty = String(item.quantity).padStart(8);
    const colPrice = `Rp${item.unitPrice.toLocaleString('id-ID')}`.padStart(16);
    const colSub = `Rp${item.subtotal.toLocaleString('id-ID')}`.padStart(18);
    p.textLine(`${colName} ${colUnit} ${colQty} ${colPrice} ${colSub}`);
  }

  p.divider('-');
  p.row(' ', `Total Barang: Rp${order.subtotalAmount.toLocaleString('id-ID')}`);
  if (order.discountAmount > 0) {
    p.row(' ', `Potongan Bertingkat: -Rp${order.discountAmount.toLocaleString('id-ID')}`);
  }
  p.bold(true).row(' ', `TOTAL AKHIR : Rp${order.totalAmount.toLocaleString('id-ID')}`).bold(false);
  p.row(`Metode: ${order.paymentMethod} | Status: ${order.paymentStatus}`, ' ');

  p.feed(2);
  // Signature blocks
  const sig1 = '    Tanda Terima Pelanggan              Hormat Kami, Gudang / Kasir';
  const sig2 = '( ........................... )      ( ........................... )';
  p.textLine(sig1);
  p.feed(3);
  p.textLine(sig2);

  p.formFeed(); // Continuous paper perforation eject
  return p.toBytes();
}

/**
 * Formats a driver Surat Jalan into an Epson ESC/P2 Dot Matrix stream.
 * STRICT SECURITY GUARANTEE: NEVER PRINT FINANCIAL VALUES ON SURAT JALAN!
 */
export function formatDotMatrixSuratJalan(
  manifest: DeliveryOrderManifest,
  tenant: TenantReceiptInfo,
): Uint8Array {
  const p = new EscP2Builder(true);

  p.bold(true).textLine(`SURAT JALAN & IZIN ANGKUT BARANG - ${tenant.businessName}`).bold(false);
  p.textLine('DOKUMEN LOGISTIK & ANGKUTAN RESMI - TIDAK MENAMPILKAN HARGA BARANG');
  p.divider('=');

  p.row(`No. Surat Jalan : ${manifest.deliveryOrderNumber}`, `No. Faktur Ref: ${manifest.orderNumber}`);
  p.row(`Pengemudi/Driver: ${manifest.driverName} (${manifest.vehiclePlateNumber})`, `Waktu Kirim : ${new Date(manifest.dispatchTimestamp).toLocaleString('id-ID')}`);
  p.row(`Penerima / Toko : ${manifest.recipientName} (${manifest.recipientPhone})`, `Verifikasi Token: ${manifest.verificationToken}`);
  p.textLine(`Alamat Tujuan   : ${manifest.destinationAddress}`);
  p.divider('-');

  const hName = 'Nama Barang Yang Dikirim'.padEnd(55);
  const hUnit = 'Kemasan / Satuan'.padEnd(20);
  const hQty = 'Qty Muat'.padStart(10);
  const hLoc = 'Lokasi Rak / Bin'.padEnd(25);
  p.textLine(`${hName} ${hUnit} ${hQty} ${hLoc}`);
  p.divider('-');

  for (const item of manifest.items) {
    const colName = item.productName.substring(0, 54).padEnd(55);
    const colUnit = item.unitName.substring(0, 19).padEnd(20);
    const colQty = String(item.quantity).padStart(10);
    const colLoc = (item.storageLocationPath ?? 'Gudang Utama').substring(0, 24).padEnd(25);
    // FINANCIAL COLUMNS STRICTLY EXCLUDED
    p.textLine(`${colName} ${colUnit} ${colQty} ${colLoc}`);
  }

  p.divider('-');
  if (manifest.notes) {
    p.textLine(`Instruksi Pengiriman: ${manifest.notes}`);
  }

  p.feed(2);
  p.textLine('   Petugas Dispatcher              Sopir / Pengangkut              Penerima Barang');
  p.feed(3);
  p.textLine('( .................... )        ( .................... )        ( .................... )');

  p.formFeed();
  return p.toBytes();
}
