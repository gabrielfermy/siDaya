import type { IncomingMessage, ServerResponse } from 'http';
import { router } from '../packages/api-core/src/server';

/**
 * Vercel Serverless Function Handler for SiDaya Core API & Webhook Engine
 * Routes all /api/* requests (including Xendit/Midtrans/Duitku webhooks)
 * through the unified AppRouter.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await router.handleRequest(req, res);
}
