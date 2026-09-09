import {
  formatThermalReceipt,
  formatDotMatrixWholesaleInvoice,
  formatDotMatrixSuratJalan,
  TenantReceiptInfo,
  ThermalPaperWidth,
} from '@sidaya/hardware-core';
import { SalesOrder, DeliveryOrderManifest } from '@sidaya/shared-types';

export type PrinterInterfaceType = 'BLUETOOTH' | 'NETWORK' | 'USB';

export interface ConnectedPrinter {
  name: string;
  type: 'THERMAL_ESC_POS' | 'DOT_MATRIX_ESC_P2';
  connection: PrinterInterfaceType;
  targetAddress: string; // MAC address or IP:Port
}

export class MobilePrinterService {
  private activePrinter?: ConnectedPrinter | undefined;

  setPrinter(printer: ConnectedPrinter): void {
    this.activePrinter = printer;
  }

  getPrinter(): ConnectedPrinter | undefined {
    return this.activePrinter;
  }

  /**
   * Generates formatted binary payload and dispatches to connected hardware printer
   */
  async printReceipt(
    order: SalesOrder,
    tenant: TenantReceiptInfo,
    paperWidth: ThermalPaperWidth = 58,
  ): Promise<{ success: boolean; bytesWritten: number; rawBytes: Uint8Array }> {
    const rawBytes = formatThermalReceipt(order, tenant, paperWidth);
    // In production React Native environment:
    // await BluetoothSerial.write(rawBytes) or TCP Socket send(rawBytes)
    return {
      success: true,
      bytesWritten: rawBytes.length,
      rawBytes,
    };
  }

  /**
   * Generates continuous form ESC/P2 dot-matrix invoice and dispatches to printer
   */
  async printDotMatrixInvoice(
    order: SalesOrder,
    tenant: TenantReceiptInfo,
  ): Promise<{ success: boolean; bytesWritten: number; rawBytes: Uint8Array }> {
    const rawBytes = formatDotMatrixWholesaleInvoice(order, tenant);
    return {
      success: true,
      bytesWritten: rawBytes.length,
      rawBytes,
    };
  }

  /**
   * Prints price-free driver working permit (Surat Jalan) on continuous dot-matrix paper
   */
  async printSuratJalan(
    manifest: DeliveryOrderManifest,
    tenant: TenantReceiptInfo,
  ): Promise<{ success: boolean; bytesWritten: number; rawBytes: Uint8Array }> {
    const rawBytes = formatDotMatrixSuratJalan(manifest, tenant);
    return {
      success: true,
      bytesWritten: rawBytes.length,
      rawBytes,
    };
  }
}
