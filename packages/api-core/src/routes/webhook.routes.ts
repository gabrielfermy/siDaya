import { AppRouter } from './app-router';
import { PaymentWebhookController } from '../controllers/payment-webhook.controller';
import { parseRequestBody } from '../middleware/body-parser.middleware';
import { sendJson } from '../middleware/cors.middleware';

function normalizeHeaders(rawHeaders: Record<string, string | string[] | undefined>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (typeof value === 'string') {
      normalized[key.toLowerCase()] = value;
    } else if (Array.isArray(value)) {
      normalized[key.toLowerCase()] = value.join(', ');
    }
  }
  return normalized;
}

export function registerWebhookRoutes(
  router: AppRouter,
  webhookController: PaymentWebhookController,
): void {
  // Path 1: Platform Subscription & Add-on Billing Webhook (Tenant -> Platform Developer)
  router.post('/api/v1/webhooks/billing/platform', async (req, res) => {
    try {
      const body = await parseRequestBody(req);
      const headers = normalizeHeaders(req.headers);
      const result = await webhookController.handlePlatformBillingWebhook(headers, body);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Platform billing webhook failed.' } });
    }
  });

  // Path 2: Commercial Invoicing & POS PayLink Webhooks (Customer -> Tenant)
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

  router.post('/api/v1/webhooks/payment/ipaymu', async (req, res) => {
    try {
      const body = await parseRequestBody(req);
      const headers = normalizeHeaders(req.headers);
      const result = await webhookController.handleWebhook('IPAYMU', headers, body);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Webhook failed' } });
    }
  });

  // Path 2 (Tier 3): Open Payment Adapter Protocol (OPAP) for custom tenant payment systems
  router.post('/api/v1/webhooks/payment/custom/:tenantId', async (req, res, params) => {
    try {
      const tenantId = params['tenantId'];
      const body = await parseRequestBody(req);
      const headers = normalizeHeaders(req.headers);
      const result = await webhookController.handleWebhook('CUSTOM_GATEWAY', headers, body, tenantId);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Custom payment webhook failed' } });
    }
  });
}

