import { describe, it, expect, beforeEach } from 'vitest';
import { InboundFifoDomainService } from '../src/services/inbound-fifo.service.js';

describe('InboundFifoDomainService', () => {
  let fifoService: InboundFifoDomainService;
  const tenantId = 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
  const productId = 'a0000002-0000-0000-0000-000000000001';

  beforeEach(() => {
    fifoService = new InboundFifoDomainService();
    fifoService.resetBatches();
  });

  it('should allocate strictly from the oldest batch when requested quantity is less than batch 1', () => {
    // Initial: Batch 1 has 40 units (oldest), Batch 2 has 100 units
    const allocations = fifoService.allocateBatchesFIFO(tenantId, productId, 20);

    expect(allocations.length).toBe(1);
    expect(allocations[0].batchLotNumber).toBe('LOT-RJL-2026-0828');
    expect(allocations[0].quantityAllocated).toBe(20);
    expect(allocations[0].remainingInBatchAfter).toBe(20);

    const remainingBatches = fifoService.getBatches(tenantId, productId);
    expect(remainingBatches[0].remainingBaseQuantity).toBe(20);
    expect(remainingBatches[1].remainingBaseQuantity).toBe(100);
  });

  it('should split allocation across multiple batches when requested quantity exceeds the oldest batch', () => {
    // Initial: Batch 1 (40), Batch 2 (100). Requesting 60 units.
    const allocations = fifoService.allocateBatchesFIFO(tenantId, productId, 60);

    expect(allocations.length).toBe(2);
    // 1st allocation takes all 40 from oldest batch 1
    expect(allocations[0].batchLotNumber).toBe('LOT-RJL-2026-0828');
    expect(allocations[0].quantityAllocated).toBe(40);
    expect(allocations[0].remainingInBatchAfter).toBe(0);

    // 2nd allocation takes 20 from newer batch 2
    expect(allocations[1].batchLotNumber).toBe('LOT-RJL-2026-0906');
    expect(allocations[1].quantityAllocated).toBe(20);
    expect(allocations[1].remainingInBatchAfter).toBe(80);

    const remainingBatches = fifoService.getBatches(tenantId, productId);
    expect(remainingBatches[0].status).toBe('DEPLETED');
    expect(remainingBatches[0].remainingBaseQuantity).toBe(0);
    expect(remainingBatches[1].remainingBaseQuantity).toBe(80);
  });

  it('should throw an error when requested quantity exceeds total available stock across all batches', () => {
    expect(() => {
      fifoService.allocateBatchesFIFO(tenantId, productId, 200); // Only 140 available
    }).toThrow(/Stok batch FIFO tidak mencukupi/);
  });

  it('should successfully register a new inbound batch and assign bin location', () => {
    const newBatch = fifoService.receiveInboundShipment({
      tenantId,
      branchId: 'b0000000-0000-0000-0000-000000000001',
      supplierId: 's1',
      supplierName: 'PT Lumbung Padi',
      productId,
      productName: 'Beras Rojolele',
      storageLocationId: 'e0000001-0000-0000-0000-000000000001',
      quantityReceived: 50,
      inboundCostPerUnit: 585000,
    });

    expect(newBatch.initialBaseQuantity).toBe(50);
    expect(newBatch.remainingBaseQuantity).toBe(50);
    expect(newBatch.status).toBe('ACTIVE');

    const allBatches = fifoService.getBatches(tenantId, productId);
    expect(allBatches.length).toBe(3);
  });
});
