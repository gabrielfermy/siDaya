/**
 * @fileoverview Automated Verification Suite for OpenAPI 3.1.0 Specification
 * @module Test:VerifyOpenApiSpec
 * @description
 * Validates:
 * 1. OpenAPI 3.1.0 root schema validity (info, servers, components, paths)
 * 2. Security schemes definition (BearerAuth, TenantHeader, OperatorRoleHeader)
 * 3. Route coverage and response status code taxonomy
 * 4. Swagger UI HTML rendering engine
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import { OPENAPI_SPEC_V31, getSwaggerUiHtml } from '../src/docs/openapi-spec.js';

async function runOpenApiSuite(): Promise<void> {
  console.log('===============================================================');
  console.log('📐 RUNNING VERIFICATION: OpenAPI 3.1.0 Standard & Schemas');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string): void {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // --- TEST 1: Specification Metadata ---
  console.log('--- TEST 1: Root Metadata & Servers ---');
  assert(OPENAPI_SPEC_V31.openapi === '3.1.0', 'OpenAPI version is 3.1.0');
  assert(OPENAPI_SPEC_V31.info.title === 'SiDaya Enterprise OS API', 'API Title is set correctly');
  assert(Array.isArray(OPENAPI_SPEC_V31.servers) && OPENAPI_SPEC_V31.servers.length >= 3, 'Includes Production, Staging, and Local servers');

  // --- TEST 2: Security Schemes ---
  console.log('\n--- TEST 2: Security Schemes ---');
  const sec = OPENAPI_SPEC_V31.components.securitySchemes;
  assert(sec.BearerAuth.type === 'http' && sec.BearerAuth.scheme === 'bearer', 'BearerAuth JWT scheme defined');
  assert(sec.TenantHeader.type === 'apiKey' && sec.TenantHeader.name === 'X-Tenant-ID', 'TenantHeader X-Tenant-ID defined');
  assert(sec.OperatorRoleHeader.type === 'apiKey' && sec.OperatorRoleHeader.name === 'X-Operator-Role', 'OperatorRoleHeader X-Operator-Role defined');

  // --- TEST 3: Core Path Coverage ---
  console.log('\n--- TEST 3: Path Operations & Endpoints ---');
  const paths = OPENAPI_SPEC_V31.paths as Record<string, any>;
  
  // Auth & Subdomains
  assert(Boolean(paths['/auth/login']?.post), 'POST /auth/login operation mapped');
  assert(Boolean(paths['/auth/resolve-tenant']?.get), 'GET /auth/resolve-tenant operation mapped');
  assert(Boolean(paths['/auth/register-owner']?.post), 'POST /auth/register-owner operation mapped');
  assert(Boolean(paths['/tenants/check-subdomain']?.get), 'GET /tenants/check-subdomain operation mapped');
  assert(Boolean(paths['/tenants/{tenantId}/subdomain']?.put), 'PUT /tenants/{tenantId}/subdomain operation mapped');

  // Operator Control Plane
  assert(Boolean(paths['/admin/auth/login']?.post), 'POST /admin/auth/login operation mapped');
  assert(Boolean(paths['/admin/tenants/{tenantId}/impersonate']?.post), 'POST /admin/tenants/{tenantId}/impersonate operation mapped');
  assert(Boolean(paths['/admin/tenants/{tenantId}/impersonate/exit']?.post), 'POST /admin/tenants/{tenantId}/impersonate/exit operation mapped');

  // Logistics & Field Driver POD
  assert(Boolean(paths['/delivery/manifest/{doNumber}/masked']?.get), 'GET /delivery/manifest/{doNumber}/masked operation mapped');
  assert(Boolean(paths['/delivery/pod/submit']?.post), 'POST /delivery/pod/submit operation mapped');

  // --- TEST 4: Component Schemas & Standard Envelopes ---
  console.log('\n--- TEST 4: Component Schemas & Error Envelopes ---');
  const schemas = OPENAPI_SPEC_V31.components.schemas;
  assert(Boolean(schemas.StandardErrorResponse), 'StandardErrorResponse envelope defined');
  assert(Boolean(schemas.LoginRequest && schemas.LoginResponse), 'Login DTOs defined');
  assert(Boolean(schemas.ResolveTenantResponse), 'ResolveTenantResponse schema defined');
  assert(Boolean(schemas.StartImpersonationRequest && schemas.StartImpersonationResponse), 'Impersonation DTOs defined');
  assert(Boolean(schemas.SubmitPodRequest && schemas.SubmitPodResponse), 'POD DTOs defined');

  // --- TEST 5: Swagger UI HTML Renderer ---
  console.log('\n--- TEST 5: Interactive Swagger UI HTML Renderer ---');
  const html = getSwaggerUiHtml('/api/v1/openapi.json');
  assert(html.includes('<!DOCTYPE html>'), 'Renders valid HTML document');
  assert(html.includes('swagger-ui-bundle.js'), 'Includes Swagger UI bundle script');
  assert(html.includes('/api/v1/openapi.json'), 'Binds OpenAPI JSON endpoint to Swagger UI');

  console.log('\n===============================================================');
  console.log(`🏁 OPENAPI SUITE COMPLETE: ${passed} passed, ${failed} failed`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runOpenApiSuite().catch((err) => {
  console.error('Fatal OpenAPI suite failure:', err);
  process.exit(1);
});
