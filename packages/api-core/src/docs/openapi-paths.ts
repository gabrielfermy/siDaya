/**
 * @fileoverview Canonical OpenAPI 3.1.0 Path Operations
 * @module ApiCore:Docs:OpenAPIPaths
 * @description
 * Complete endpoint path operation definitions for authentication, tenants, operator control plane, and POD.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

export const OPENAPI_PATHS = {
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'User Login',
      description: 'Authenticates merchant owner or staff credentials and returns session token with tenant context.',
      operationId: 'loginUser',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
        },
        '400': { $ref: '#/components/responses/BadRequestError' },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
      },
    },
  },
  '/auth/resolve-tenant': {
    get: {
      tags: ['Authentication'],
      summary: 'Centralized Gateway Tenant Resolution',
      description: 'Resolves tenant ID and target subdomain URL from user email for root domain redirect.',
      operationId: 'resolveTenantByEmail',
      parameters: [
        {
          name: 'email',
          in: 'query',
          required: true,
          description: 'Registered user email address',
          schema: { type: 'string', format: 'email', example: 'budi@berasjaya.com' },
        },
      ],
      responses: {
        '200': {
          description: 'Tenant resolved successfully',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResolveTenantResponse' } } },
        },
        '400': { $ref: '#/components/responses/BadRequestError' },
        '404': { $ref: '#/components/responses/NotFoundError' },
      },
    },
  },
  '/auth/register-owner': {
    post: {
      tags: ['Authentication'],
      summary: 'Owner Self-Service Registration',
      description: 'Registers a new business tenant, allocates primary subdomain, and creates owner credentials.',
      operationId: 'registerOwner',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/RegisterOwnerRequest' } },
        },
      },
      responses: {
        '201': {
          description: 'Tenant registered successfully',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterOwnerResponse' } } },
        },
        '400': { $ref: '#/components/responses/BadRequestError' },
      },
    },
  },
  '/tenants/check-subdomain': {
    get: {
      tags: ['Tenants'],
      summary: 'Validate Subdomain Availability',
      description: 'Checks if a subdomain slug is available, valid, and not blacklisted by system reserved keywords.',
      operationId: 'checkSubdomain',
      parameters: [
        {
          name: 'slug',
          in: 'query',
          required: true,
          schema: { type: 'string', example: 'berasjayagrosir' },
        },
      ],
      responses: {
        '200': {
          description: 'Subdomain availability status',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckSubdomainResponse' } } },
        },
      },
    },
  },
  '/tenants/{tenantId}/subdomain': {
    put: {
      tags: ['Tenants'],
      summary: 'Update Tenant Primary Subdomain',
      description: 'Migrates primary subdomain and registers old subdomain as a 30-day alias with HTTP 301 redirect.',
      operationId: 'updateTenantSubdomain',
      parameters: [
        { name: 'tenantId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/UpdateSubdomainRequest' } },
        },
      },
      responses: {
        '200': {
          description: 'Subdomain updated with 30-day alias',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateSubdomainResponse' } } },
        },
        '400': { $ref: '#/components/responses/BadRequestError' },
      },
    },
  },
  '/admin/auth/login': {
    post: {
      tags: ['Operator Control Plane'],
      summary: 'Operator Portal Login',
      description: 'Authenticates Ashvin Labs platform operator on ops.sidaya.biz.id.',
      operationId: 'loginOperator',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/OperatorLoginRequest' } },
        },
      },
      responses: {
        '200': {
          description: 'Operator session created',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OperatorLoginResponse' } } },
        },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
      },
    },
  },
  '/admin/tenants/{tenantId}/impersonate': {
    post: {
      tags: ['Operator Control Plane'],
      summary: 'Start Ticket-Bound Tenant Impersonation',
      description: 'Issues a scoped token to impersonate a tenant user for customer support diagnostics.',
      operationId: 'startImpersonation',
      parameters: [
        { name: 'tenantId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/StartImpersonationRequest' } },
        },
      },
      responses: {
        '200': {
          description: 'Impersonation session established',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/StartImpersonationResponse' } } },
        },
        '400': { $ref: '#/components/responses/BadRequestError' },
      },
    },
  },
  '/admin/tenants/{tenantId}/impersonate/exit': {
    post: {
      tags: ['Operator Control Plane'],
      summary: 'Exit Tenant Impersonation Session',
      description: 'Safely terminates impersonation session, records audit trail, and returns operator portal URL.',
      operationId: 'exitImpersonation',
      parameters: [
        { name: 'tenantId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        '200': {
          description: 'Session terminated',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ExitImpersonationResponse' } } },
        },
      },
    },
  },
  '/delivery/manifest/{doNumber}/masked': {
    get: {
      tags: ['Delivery & Logistics'],
      summary: 'Get Price-Masked Driver Manifest',
      description: 'Retrieves sanitized delivery manifest with zero financial leaks for field drivers (UU PDP).',
      operationId: 'getMaskedDriverManifest',
      parameters: [
        { name: 'doNumber', in: 'path', required: true, schema: { type: 'string', example: 'DO-20260910-001' } },
      ],
      responses: {
        '200': {
          description: 'Price-masked manifest',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MaskedDriverManifestResponse' } } },
        },
      },
    },
  },
  '/delivery/pod/submit': {
    post: {
      tags: ['Delivery & Logistics'],
      summary: 'Submit Signed Proof of Delivery (POD)',
      description: 'Submits digital recipient signature, GPS geotags, and delivery completion status.',
      operationId: 'submitProofOfDelivery',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/SubmitPodRequest' } },
        },
      },
      responses: {
        '200': {
          description: 'POD verified and registered',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitPodResponse' } } },
        },
        '400': { $ref: '#/components/responses/BadRequestError' },
      },
    },
  },
};
