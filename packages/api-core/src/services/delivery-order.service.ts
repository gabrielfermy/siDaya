import {
  DeliveryOrderManifest,
  DeliveryOrderItem,
  SalesOrder,
} from '@sidaya/shared-types';

export interface CreateDeliveryOrderDTO {
  driverName: string;
  vehiclePlateNumber: string;
  recipientName: string;
  recipientPhone: string;
  destinationAddress: string;
  pickupBinLabel?: string | undefined;
  notes?: string | undefined;
}

export interface SignDeliveryOrderDTO {
  deliveryOrderId: string;
  recipientSignature: string; // Base64 signature
  driverSignature?: string | undefined;
  recipientNotes?: string | undefined;
}

export class DeliveryOrderDomainService {
  private manifests: DeliveryOrderManifest[] = [];

  /**
   * Generates a Delivery Order (Surat Jalan) from a confirmed Sales Order.
   * STRICT SECURITY CONSTRAINT:
   * Drivers and third-party transporters MUST NEVER see product unit prices,
   * invoice subtotals, or profit margins.
   */
  createDeliveryManifest(
    order: SalesOrder,
    dto: CreateDeliveryOrderDTO,
  ): DeliveryOrderManifest {
    const doId = `00000000-0000-0000-0003-${Math.floor(Date.now() / 1000).toString().padStart(12, '0')}`;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const doNumber = `SJ-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationToken = `tok_sj_${doId.slice(-8)}_${Math.random().toString(36).substring(2, 8)}`;
    const verificationUrl = `https://nota.sidaya.id/sj/${verificationToken}`;

    const items: DeliveryOrderItem[] = order.items.map((item, idx) => ({
      id: `00000000-0000-0000-0004-${(idx + 1).toString().padStart(12, '0')}`,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitName: item.selectedUnit,
      storageLocationPath: dto.pickupBinLabel,
      // FINANCIAL FIELDS (price, subtotal, discount, total) ARE STRICTLY OMITTED
    }));

    const manifest: DeliveryOrderManifest = {
      id: doId,
      tenantId: order.tenantId,
      salesOrderId: order.id,
      deliveryOrderNumber: doNumber,
      orderNumber: order.orderNumber,
      driverName: dto.driverName,
      vehiclePlateNumber: dto.vehiclePlateNumber,
      dispatchTimestamp: new Date(),
      recipientName: dto.recipientName,
      recipientPhone: dto.recipientPhone,
      destinationAddress: dto.destinationAddress,
      items,
      verificationToken,
      verificationUrl,
      signatures: {
        warehouseOfficerSignedAt: new Date().toISOString(),
      },
      notes: dto.notes ? `${dto.notes}${dto.pickupBinLabel ? ` (Pickup: ${dto.pickupBinLabel})` : ''}` : dto.pickupBinLabel ? `Pickup: ${dto.pickupBinLabel}` : undefined,
    };

    this.manifests.push(manifest);
    return manifest;
  }

  getManifestById(doId: string): DeliveryOrderManifest | undefined {
    return this.manifests.find((m) => m.id === doId || m.verificationToken === doId);
  }

  getManifestsByTenant(tenantId: string): DeliveryOrderManifest[] {
    return this.manifests.filter((m) => m.tenantId === tenantId);
  }

  signDeliveryManifest(dto: SignDeliveryOrderDTO): DeliveryOrderManifest {
    const manifest = this.manifests.find((m) => m.id === dto.deliveryOrderId);
    if (!manifest) {
      throw new Error(`Surat Jalan dengan ID '${dto.deliveryOrderId}' tidak ditemukan.`);
    }

    manifest.signatures = {
      ...manifest.signatures,
      recipientSignedAt: new Date().toISOString(),
      recipientSignatureImage: dto.recipientSignature,
      ...(dto.driverSignature ? { driverSignedAt: new Date().toISOString() } : {}),
    };

    if (dto.recipientNotes) {
      manifest.notes = manifest.notes ? `${manifest.notes} | Penerima: ${dto.recipientNotes}` : dto.recipientNotes;
    }

    return manifest;
  }
}
