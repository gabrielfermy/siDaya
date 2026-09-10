/**
 * @fileoverview Field Driver Proof of Delivery (POD) & Price-Masked Manifest Engine
 * @module Mobile:Modules:Delivery:POD
 * @description
 * Enforces UU PDP and commercial data privacy by masking all financial pricing from
 * field drivers, captures digital recipient signatures, verifies geotags, and
 * records delivery completion payloads for offline sync.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import { DeliveryOrderManifest } from '@sidaya/shared-types';

export interface GeoLocationCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  timestamp: number;
}

export interface PodSignatureData {
  signerName: string;
  signerRelation: 'RECIPIENT_SELF' | 'WAREHOUSE_STAFF' | 'STORE_MANAGER' | 'FAMILY_MEMBER';
  signatureVectorData: string; // Base64 or SVG vector path
  capturedAt: number;
}

export interface PodPhotoEvidence {
  photoUri: string;
  photoHash?: string;
  notes?: string;
  capturedAt: number;
}

export interface PodCompletionPayload {
  deliveryOrderId: string;
  deliveryOrderNumber: string;
  status: 'DELIVERED' | 'PARTIALLY_DELIVERED' | 'FAILED_DELIVERY';
  signature: PodSignatureData;
  location: GeoLocationCoordinates;
  photoEvidence?: PodPhotoEvidence | undefined;
  deliveredItems: Array<{
    productId: string;
    productName: string;
    unitName: string;
    quantityOrdered: number;
    quantityDelivered: number;
    returnReason?: string | undefined;
  }>;
  completedAt: string;
  syncStatus: 'PENDING_PUSH' | 'SYNCED';
}

export class ProofOfDeliveryService {
  /**
   * Sanitizes any DeliveryOrderManifest to remove ALL financial/pricing information
   * before sending to the mobile driver UI (Zero Financial Leak Guarantee).
   */
  public static maskFinancialDataForDriver(manifest: DeliveryOrderManifest): {
    deliveryOrderId: string;
    deliveryOrderNumber: string;
    orderNumber: string;
    recipientName: string;
    recipientPhone: string;
    destinationAddress: string;
    verificationToken: string;
    items: Array<{
      productName: string;
      unitName: string;
      quantity: number;
      storageLocation?: string | undefined;
    }>;
  } {
    return {
      deliveryOrderId: manifest.id,
      deliveryOrderNumber: manifest.deliveryOrderNumber,
      orderNumber: manifest.orderNumber,
      recipientName: manifest.recipientName,
      recipientPhone: manifest.recipientPhone,
      destinationAddress: manifest.destinationAddress,
      verificationToken: manifest.verificationToken,
      items: manifest.items.map((item) => ({
        productName: item.productName,
        unitName: item.unitName,
        quantity: item.quantity,
        storageLocation: item.storageLocationPath,
      })),
    };
  }

  /**
   * Validates and constructs the final signed POD completion payload
   */
  public static createProofOfDelivery(
    manifest: DeliveryOrderManifest,
    signature: PodSignatureData,
    location: GeoLocationCoordinates,
    photo?: PodPhotoEvidence | undefined,
    deliveredItemOverrides?: Array<{
      productId: string;
      productName: string;
      unitName: string;
      quantityOrdered: number;
      quantityDelivered: number;
      returnReason?: string | undefined;
    }>,
  ): PodCompletionPayload {
    // 1. Validate Signature
    if (!signature.signerName || signature.signerName.trim().length < 2) {
      throw new Error('Nama penerima wajib diisi untuk bukti serah terima.');
    }
    if (!signature.signatureVectorData || signature.signatureVectorData.length < 10) {
      throw new Error('Tanda tangan digital penerima wajib dibubuhkan.');
    }

    // 2. Validate Geolocation
    if (!location.latitude || !location.longitude) {
      throw new Error('Koordinat GPS wajib aktif saat konfirmasi pengiriman.');
    }

    // 3. Determine Final Delivery Status
    const items = deliveredItemOverrides || manifest.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      unitName: i.unitName,
      quantityOrdered: i.quantity,
      quantityDelivered: i.quantity,
    }));

    const isPartial = items.some((i) => i.quantityDelivered < i.quantityOrdered && i.quantityDelivered > 0);
    const isAllFailed = items.every((i) => i.quantityDelivered === 0);

    const status: PodCompletionPayload['status'] = isAllFailed
      ? 'FAILED_DELIVERY'
      : isPartial
      ? 'PARTIALLY_DELIVERED'
      : 'DELIVERED';

    const payload: PodCompletionPayload = {
      deliveryOrderId: manifest.id,
      deliveryOrderNumber: manifest.deliveryOrderNumber,
      status,
      signature,
      location,
      photoEvidence: photo,
      deliveredItems: items,
      completedAt: new Date().toISOString(),
      syncStatus: 'PENDING_PUSH',
    };

    return payload;
  }

  /**
   * Verifies recipient verification token / PIN
   */
  public static verifyRecipientToken(manifest: DeliveryOrderManifest, inputToken: string): boolean {
    const cleanExpected = (manifest.verificationToken || '').trim().toUpperCase();
    const cleanInput = (inputToken || '').trim().toUpperCase();
    return cleanExpected === cleanInput;
  }
}
