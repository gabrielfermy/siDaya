import http from 'http';
import { InboundFifoDomainService } from '../services/inbound-fifo.service';
import { sendJson } from '../middleware/cors.middleware';
import { parseRequestBody } from '../middleware/body-parser.middleware';

export class FifoController {
  constructor(private fifoService: InboundFifoDomainService) {}

  public async allocateLots(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
    const body = await parseRequestBody(req);
    const skuId = (body['skuId'] || body['productId']) as string;
    const requestedQty = Number(body['quantity'] || body['requestedQuantity'] || 0);

    if (!skuId || requestedQty <= 0) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'skuId dan quantity > 0 wajib diisi.' },
      });
      return;
    }

    try {
      const allocation = this.fifoService.allocateBatchesFIFO(tenantId, skuId, requestedQty);
      sendJson(res, 200, { success: true, data: allocation });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Alokasi FIFO gagal.' } });
    }
  }

  public async listBatches(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _params: Record<string, string>,
    query: Record<string, string>,
  ): Promise<void> {
    const tenantId = query['tenantId'] || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
    const batches = this.fifoService.getBatches(tenantId);
    sendJson(res, 200, { success: true, data: batches });
  }
}
