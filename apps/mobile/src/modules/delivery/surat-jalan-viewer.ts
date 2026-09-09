import { DeliveryOrderManifest } from '@sidaya/shared-types';

export class SuratJalanViewer {
  /**
   * Sanitizes and verifies that no financial leaks exist before rendering to driver screen
   */
  static renderDriverManifestSummary(manifest: DeliveryOrderManifest): {
    doNumber: string;
    recipientName: string;
    recipientPhone: string;
    destinationAddress: string;
    itemCount: number;
    items: Array<{
      productName: string;
      quantity: number;
      unitName: string;
      storageLocation?: string | undefined;
    }>;
  } {
    return {
      doNumber: manifest.deliveryOrderNumber,
      recipientName: manifest.recipientName,
      recipientPhone: manifest.recipientPhone,
      destinationAddress: manifest.destinationAddress,
      itemCount: manifest.items.length,
      items: manifest.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitName: i.unitName,
        storageLocation: i.storageLocationPath,
      })),
    };
  }
}
