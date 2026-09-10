/**
 * @fileoverview Canonical OpenAPI 3.1.0 Specification Object & Swagger UI Template
 * @module ApiCore:Docs:OpenAPI
 * @description
 * Machine-readable OpenAPI 3.1.0 metadata and zero-dependency Swagger UI HTML renderer
 * for interactive developer exploration on GET /api/v1/docs.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import { OPENAPI_PATHS } from './openapi-paths';
import { OPENAPI_RESPONSES, OPENAPI_SCHEMAS, OPENAPI_SECURITY_SCHEMES } from './openapi-schemas';

export const OPENAPI_SPEC_V31 = {
  openapi: '3.1.0',
  info: {
    title: 'SiDaya Enterprise OS API',
    version: '1.0.0',
    description:
      'Canonical RESTful OpenAPI 3.1.0 Specification for SiDaya Enterprise Wholesale ERP, Multi-Tenant Subdomain Gateway, POS Fast-Scan, Inbound FIFO Allocation, Field Driver POD, and Ashvin Labs Operator Control Plane.',
    contact: {
      name: 'Ashvin Labs API Engineering',
      email: 'api@ashvinlabs.com',
      url: 'https://ashvinlabs.com',
    },
    license: {
      name: 'Proprietary - SiDaya',
      url: 'https://sidaya.biz.id/terms',
    },
  },
  servers: [
    {
      url: 'https://{subdomain}.sidaya.biz.id/api/v1',
      description: 'Production Multi-Tenant Workspace Gateway',
      variables: {
        subdomain: {
          default: 'berasjaya',
          description: 'Unique tenant workspace subdomain',
        },
      },
    },
    {
      url: 'https://ops.sidaya.biz.id/api/v1',
      description: 'Production Platform Operator Control Plane',
    },
    {
      url: 'https://{subdomain}.sidaya.my.id/api/v1',
      description: 'Staging Multi-Tenant Workspace Gateway',
      variables: {
        subdomain: {
          default: 'berasjaya',
          description: 'Staging tenant subdomain',
        },
      },
    },
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Local Development API Server',
    },
  ],
  paths: OPENAPI_PATHS,
  components: {
    securitySchemes: OPENAPI_SECURITY_SCHEMES,
    responses: OPENAPI_RESPONSES,
    schemas: OPENAPI_SCHEMAS,
  },
};

/**
 * Generates standalone Swagger UI HTML explorer page
 */
export function getSwaggerUiHtml(specJsonUrl = '/api/v1/openapi.json'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SiDaya Enterprise OS API - OpenAPI 3.1 Explorer</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .topbar { display: none !important; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
    .swagger-ui .info { margin: 20px 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "${specJsonUrl}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
}
