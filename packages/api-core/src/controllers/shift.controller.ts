import http from 'http';
import { ShiftDomainService } from '../services/shift.service';
import { sendJson } from '../middleware/cors.middleware';
import { parseRequestBody } from '../middleware/body-parser.middleware';

export class ShiftController {
  constructor(private shiftService: ShiftDomainService) {}

  public async startShift(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const body = await parseRequestBody(req);
    const cashierId = (body['cashierId'] || body['userId'] || 'cashier-1') as string;
    const storeId = (body['storeId'] || 'store-1') as string;
    const stationId = (body['stationId'] || 'pos-1') as string;
    const cashierName = (body['cashierName'] || 'Kasir Default') as string;
    const openingCashFloat = Number(body['initialCash'] || body['openingCashFloat'] || 0);

    try {
      const shift = this.shiftService.openShift(tenantId, cashierId, {
        storeId,
        stationId,
        cashierName,
        openingCashFloat,
      });
      sendJson(res, 201, { success: true, data: shift });
    } catch (err: any) {
      sendJson(res, 500, { success: false, error: { message: err.message || 'Start shift failed.' } });
    }
  }

  public async closeShift(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const body = await parseRequestBody(req);
    const shiftId = (body['shiftId'] || 'shift-1') as string;
    const actualCashCounted = Number(body['actualCash'] || body['actualCashCounted'] || 0);

    try {
      const activeShift = this.shiftService.openShift(tenantId, 'temp', {
        storeId: 'store-1',
        stationId: 'pos-1',
        cashierName: 'Kasir',
        openingCashFloat: 0,
      });
      activeShift.id = shiftId;
      const closed = this.shiftService.closeShift(activeShift, { actualCashCounted });
      sendJson(res, 200, { success: true, data: closed });
    } catch (err: any) {
      sendJson(res, 500, { success: false, error: { message: err.message || 'Close shift failed.' } });
    }
  }
}
