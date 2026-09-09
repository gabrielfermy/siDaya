export interface StorageLocationDTO {
  id: string;
  tenantId: string;
  branchId: string;
  warehouseName: string;
  zoneName: string;
  rackBin: string;
  isActive: boolean;
}

export interface ProductBatchDTO {
  id: string;
  tenantId: string;
  productId: string;
  storageLocationId: string;
  storageBinLabel: string;
  batchLotNumber: string;
  inboundCostPerBaseUnit: number;
  initialBaseQuantity: number;
  remainingBaseQuantity: number;
  status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED' | 'RETURNED_TO_VENDOR';
  receivedAt: Date;
}

export interface AllocatedBatchItem {
  batchId: string;
  batchLotNumber: string;
  storageLocationId: string;
  storageBinLabel: string;
  quantityAllocated: number;
  remainingInBatchAfter: number;
}

export interface CreateInboundShipmentDTO {
  tenantId: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  storageLocationId: string;
  quantityReceived: number;
  inboundCostPerUnit: number;
  harvestOrMillingDate?: string;
  deliveryVehiclePlate?: string;
}

export class InboundFifoDomainService {
  private storageLocations: StorageLocationDTO[] = [
    {
      id: 'e0000001-0000-0000-0000-000000000001',
      tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
      branchId: 'b0000000-0000-0000-0000-000000000001',
      warehouseName: 'Gudang Utama',
      zoneName: 'Zona Beras',
      rackBin: 'Rak A-01 (Pallet 1)',
      isActive: true,
    },
    {
      id: 'e0000001-0000-0000-0000-000000000002',
      tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
      branchId: 'b0000000-0000-0000-0000-000000000001',
      warehouseName: 'Gudang Utama',
      zoneName: 'Zona Beras',
      rackBin: 'Rak A-02 (Pallet 2)',
      isActive: true,
    },
    {
      id: 'e0000001-0000-0000-0000-000000000003',
      tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
      branchId: 'b0000000-0000-0000-0000-000000000001',
      warehouseName: 'Gudang Utama',
      zoneName: 'Zona Minyak & Gula',
      rackBin: 'Rak B-01 (Shelf 1)',
      isActive: true,
    },
  ];

  // Initial Seed Batches (Batch 1: 10 days ago, Batch 2: 2 days ago)
  private batches: ProductBatchDTO[] = [
    {
      id: 'f0000001-0000-0000-0000-000000000001',
      tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
      productId: 'a0000002-0000-0000-0000-000000000001', // Beras Rojolele
      storageLocationId: 'e0000001-0000-0000-0000-000000000001',
      storageBinLabel: 'Zona Beras / Rak A-01 (Pallet 1)',
      batchLotNumber: 'LOT-RJL-2026-0828',
      inboundCostPerBaseUnit: 575000,
      initialBaseQuantity: 60,
      remainingBaseQuantity: 40,
      status: 'ACTIVE',
      receivedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      id: 'f0000001-0000-0000-0000-000000000002',
      tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
      productId: 'a0000002-0000-0000-0000-000000000001', // Beras Rojolele
      storageLocationId: 'e0000001-0000-0000-0000-000000000002',
      storageBinLabel: 'Zona Beras / Rak A-02 (Pallet 2)',
      batchLotNumber: 'LOT-RJL-2026-0906',
      inboundCostPerBaseUnit: 580000,
      initialBaseQuantity: 100,
      remainingBaseQuantity: 100,
      status: 'ACTIVE',
      receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  ];

  resetBatches(): void {
    this.batches = [
      {
        id: 'f0000001-0000-0000-0000-000000000001',
        tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        productId: 'a0000002-0000-0000-0000-000000000001', // Beras Rojolele
        storageLocationId: 'e0000001-0000-0000-0000-000000000001',
        storageBinLabel: 'Zona Beras / Rak A-01 (Pallet 1)',
        batchLotNumber: 'LOT-RJL-2026-0828',
        inboundCostPerBaseUnit: 575000,
        initialBaseQuantity: 60,
        remainingBaseQuantity: 40,
        status: 'ACTIVE',
        receivedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        id: 'f0000001-0000-0000-0000-000000000002',
        tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        productId: 'a0000002-0000-0000-0000-000000000001', // Beras Rojolele
        storageLocationId: 'e0000001-0000-0000-0000-000000000002',
        storageBinLabel: 'Zona Beras / Rak A-02 (Pallet 2)',
        batchLotNumber: 'LOT-RJL-2026-0906',
        inboundCostPerBaseUnit: 580000,
        initialBaseQuantity: 100,
        remainingBaseQuantity: 100,
        status: 'ACTIVE',
        receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ];
  }

  getStorageLocations(tenantId: string): StorageLocationDTO[] {
    return this.storageLocations.filter((l) => l.tenantId === tenantId);
  }

  getBatches(tenantId: string, productId?: string): ProductBatchDTO[] {
    return this.batches.filter(
      (b) => b.tenantId === tenantId && (!productId || b.productId === productId),
    );
  }

  /**
   * Receives inbound goods from supplier and allocates to storage bin.
   */
  receiveInboundShipment(dto: CreateInboundShipmentDTO): ProductBatchDTO {
    const bin = this.storageLocations.find((l) => l.id === dto.storageLocationId);
    const binLabel = bin ? `${bin.zoneName} / ${bin.rackBin}` : 'Gudang Utama / Default Bin';

    const batchNumber = `LOT-${dto.productName.substring(0, 3).toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newBatch: ProductBatchDTO = {
      id: `f0000001-0000-0000-0000-${Date.now().toString().slice(-12)}`,
      tenantId: dto.tenantId,
      productId: dto.productId,
      storageLocationId: dto.storageLocationId,
      storageBinLabel: binLabel,
      batchLotNumber: batchNumber,
      inboundCostPerBaseUnit: dto.inboundCostPerUnit,
      initialBaseQuantity: dto.quantityReceived,
      remainingBaseQuantity: dto.quantityReceived,
      status: 'ACTIVE',
      receivedAt: new Date(),
    };

    this.batches.push(newBatch);
    return newBatch;
  }

  /**
   * Automated FIFO Batch Allocation Engine:
   * Strictly allocates from the OLDEST active batch first (`receivedAt ASC`).
   */
  allocateBatchesFIFO(
    tenantId: string,
    productId: string,
    requestedQuantity: number,
  ): AllocatedBatchItem[] {
    if (requestedQuantity <= 0) {
      throw new Error('Jumlah pesanan alokasi batch harus lebih dari 0.');
    }

    // Sort active batches by receivedAt ASCENDING (Oldest first = FIFO)
    const activeBatches = this.batches
      .filter(
        (b) =>
          b.tenantId === tenantId &&
          b.productId === productId &&
          b.status === 'ACTIVE' &&
          b.remainingBaseQuantity > 0,
      )
      .sort((a, b) => a.receivedAt.getTime() - b.receivedAt.getTime());

    const totalAvailable = activeBatches.reduce((acc, b) => acc + b.remainingBaseQuantity, 0);
    if (totalAvailable < requestedQuantity) {
      throw new Error(
        `Stok batch FIFO tidak mencukupi untuk produk ID '${productId}'. Diminta: ${requestedQuantity}, Tersedia: ${totalAvailable}`,
      );
    }

    const allocations: AllocatedBatchItem[] = [];
    let needed = requestedQuantity;

    for (const batch of activeBatches) {
      if (needed <= 0) break;

      const take = Math.min(batch.remainingBaseQuantity, needed);
      batch.remainingBaseQuantity -= take;
      needed -= take;

      if (batch.remainingBaseQuantity === 0) {
        batch.status = 'DEPLETED';
      }

      allocations.push({
        batchId: batch.id,
        batchLotNumber: batch.batchLotNumber,
        storageLocationId: batch.storageLocationId,
        storageBinLabel: batch.storageBinLabel,
        quantityAllocated: take,
        remainingInBatchAfter: batch.remainingBaseQuantity,
      });
    }

    return allocations;
  }
}
