/**
 * @fileoverview OpenAPI Specification & Interactive Documentation Routes
 * @module Routes:OpenAPI
 * @description
 * Exposes OpenAPI 3.1.0 JSON metadata and interactive Swagger UI developer explorer.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import { AppRouter } from './app-router.js';
import { OPENAPI_SPEC_V31, getSwaggerUiHtml } from '../docs/openapi-spec.js';
import { sendJson } from '../middleware/cors.middleware.js';

export function registerOpenApiRoutes(router: AppRouter): void {
  // GET /api/v1/openapi.json
  router.get('/api/v1/openapi.json', (_req, res) => {
    sendJson(res, 200, OPENAPI_SPEC_V31);
  });

  // GET /api/v1/docs
  router.get('/api/v1/docs', (_req, res) => {
    const html = getSwaggerUiHtml('/api/v1/openapi.json');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': Buffer.byteLength(html),
    });
    res.end(html);
  });
}
