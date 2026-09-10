import { Product } from '@sidaya/shared-types';

export interface BarcodeLookupResult {
  found: boolean;
  product?: Product;
  matchedBarcode?: string;
  matchedPackagingUnit?: string;
  unitMultiplier: number;
  lookupLatencyMs: number;
}

export class BarcodeLookupDomainService {
  private barcodeIndex: Map<string, { product: Product; unit: string; multiplier: number }> = new Map();

  /**
   * Index catalog products and multi-packaging barcodes for O(1) fast lookup.
   */
  public indexProducts(products: Product[]): void {
    this.barcodeIndex.clear();

    for (const product of products) {
      // Primary SKU and Barcode
      if (product.barcode) {
        this.barcodeIndex.set(product.barcode.trim().toLowerCase(), {
          product,
          unit: product.baseUnit,
          multiplier: 1,
        });
      }

      this.barcodeIndex.set(product.sku.trim().toLowerCase(), {
        product,
        unit: product.baseUnit,
        multiplier: 1,
      });

      // Index multi-unit conversions (e.g. Karton / Dus barcodes)
      if (product.unitConversions) {
        for (const conv of product.unitConversions) {
          if (conv.barcode) {
            this.barcodeIndex.set(conv.barcode.trim().toLowerCase(), {
              product,
              unit: conv.unitName,
              multiplier: conv.conversionFactor,
            });
          }
        }
      }
    }
  }

  /**
   * Fast lookup barcode or SKU with sub-5ms target latency.
   */
  public scanBarcode(query: string): BarcodeLookupResult {
    const startTime = performance.now();
    const cleanQuery = (query || '').trim().toLowerCase();

    const match = this.barcodeIndex.get(cleanQuery);
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    if (!match) {
      return {
        found: false,
        unitMultiplier: 1,
        lookupLatencyMs: latencyMs,
      };
    }

    return {
      found: true,
      product: match.product,
      matchedBarcode: cleanQuery,
      matchedPackagingUnit: match.unit,
      unitMultiplier: match.multiplier,
      lookupLatencyMs: latencyMs,
    };
  }
}

export const barcodeLookupService = new BarcodeLookupDomainService();
