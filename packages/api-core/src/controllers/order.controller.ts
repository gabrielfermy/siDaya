import http from 'http';
import { OrderDomainService } from '../services/order.service';
import { sendJson } from '../middleware/cors.middleware';
import { parseRequestBody } from '../middleware/body-parser.middleware';
import { CheckoutOrderPayload } from '@sidaya/shared-types';
import { verifyJwtToken } from '../security/crypto-utils';

export class OrderController {
  constructor(private orderService: OrderDomainService) {}

  public async checkout(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    // 1. Extract tenantId from verified token or request context
    let tenantId = (req as any).tenantContext?.tenantId || (req as any).tenantUser?.tenantId;

    if (!tenantId) {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      const rawAuth = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      if (rawAuth && typeof rawAuth === 'string' && rawAuth.startsWith('Bearer ')) {
        try {
          const claims = verifyJwtToken(rawAuth.slice(7).trim());
          tenantId = claims.tenantId;
        } catch {
          // Token invalid
        }
      }
    }

    if (!tenantId) {
      const rawTenantHeader = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];
      tenantId = Array.isArray(rawTenantHeader) ? rawTenantHeader[0] : rawTenantHeader;
    }

    if (!tenantId || tenantId === 'default-tenant') {
      sendJson(res, 401, {
        success: false,
        error: { message: 'Akses ditolak: Tenant context atau autentikasi tidak valid.', code: 'UNAUTHORIZED' },
      });
      return;
    }

    let body: CheckoutOrderPayload;
    try {
      body = (await parseRequestBody(req)) as unknown as CheckoutOrderPayload;
    } catch {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Invalid JSON payload in request body.', code: 'MALFORMED_JSON' },
      });
      return;
    }

    if (!body || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Invalid payload: items array is required and cannot be empty.', code: 'INVALID_PAYLOAD' },
      });
      return;
    }

    // 2. Strict financial bounds and inventory quantity checks
    for (const item of body.items) {
      if (typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
        sendJson(res, 400, {
          success: false,
          error: {
            message: `Financial validation error: Item '${item.productId || item.productName}' quantity must be a positive number (> 0).`,
            code: 'INVALID_QUANTITY',
          },
        });
        return;
      }

      if (typeof item.unitPrice === 'number' && item.unitPrice < 0) {
        sendJson(res, 400, {
          success: false,
          error: {
            message: `Financial validation error: Item '${item.productId || item.productName}' price cannot be negative.`,
            code: 'NEGATIVE_PRICE',
          },
        });
        return;
      }
    }


    try {
      const order = await this.orderService.processCheckout(tenantId, body);
      sendJson(res, 201, { success: true, data: order });
    } catch (err: any) {
      sendJson(res, 500, { success: false, error: { message: err.message || 'Checkout failed.', code: 'CHECKOUT_FAILED' } });
    }
  }
}

