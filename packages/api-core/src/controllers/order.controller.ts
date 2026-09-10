import http from 'http';
import { OrderDomainService } from '../services/order.service';
import { sendJson } from '../middleware/cors.middleware';
import { parseRequestBody } from '../middleware/body-parser.middleware';
import { CheckoutOrderPayload } from '@sidaya/shared-types';

export class OrderController {
  constructor(private orderService: OrderDomainService) {}

  public async checkout(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const body = (await parseRequestBody(req)) as unknown as CheckoutOrderPayload;

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Invalid payload: items array is required and cannot be empty.' },
      });
      return;
    }

    try {
      const order = await this.orderService.processCheckout(tenantId, body);
      sendJson(res, 201, { success: true, data: order });
    } catch (err: any) {
      sendJson(res, 500, { success: false, error: { message: err.message || 'Checkout failed.' } });
    }
  }
}
