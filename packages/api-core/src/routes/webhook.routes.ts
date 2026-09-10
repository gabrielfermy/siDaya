import { AppRouter } from './app-router';
import { PaymentWebhookController } from '../controllers/payment-webhook.controller';
import { parseRequestBody } from '../middleware/body-parser.middleware';
import { sendJson } from '../middleware/cors.middleware';

function normalizeHeaders(rawHeaders: Record<string, string | string[] | undefined>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else if (Array.isArray(value)) {
      normalized[key] = value.join(', ');
    }
  }
  return normalized;
}

export function registerWebhookRoutes(
  router: AppRouter,
  webhookController: PaymentWebhookController,
): void {
  router.post('/api/v1/webhooks/payment/midtrans', async (req, res) => {
    try {
      const body = await parseRequestBody(req);
      const headers = normalizeHeaders(req.headers);
      const result = await webhookController.handleWebhook('MIDTRANS', headers, body);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Webhook failed' } });
    }
  });

  router.post('/api/v1/webhooks/payment/xendit', async (req, res) => {
    try {
      const body = await parseRequestBody(req);
      const headers = normalizeHeaders(req.headers);
      const result = await webhookController.handleWebhook('XENDIT', headers, body);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Webhook failed' } });
    }
  });

  router.post('/api/v1/webhooks/payment/duitku', async (req, res) => {
    try {
      const body = await parseRequestBody(req);
      const headers = normalizeHeaders(req.headers);
      const result = await webhookController.handleWebhook('DUITKU', headers, body);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Webhook failed' } });
    }
  });
}
