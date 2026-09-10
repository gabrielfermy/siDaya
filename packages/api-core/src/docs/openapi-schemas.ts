/**
 * @fileoverview Canonical OpenAPI 3.1.0 Component Schemas & Security Schemes
 * @module ApiCore:Docs:OpenAPISchemas
 * @description
 * Reusable DTO schemas, standard error envelopes, and security schemes for SiDaya OS.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

export const OPENAPI_SECURITY_SCHEMES = {
  BearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
  TenantHeader: {
    type: 'apiKey',
    in: 'header',
    name: 'X-Tenant-ID',
  },
  OperatorRoleHeader: {
    type: 'apiKey',
    in: 'header',
    name: 'X-Operator-Role',
  },
};

export const OPENAPI_RESPONSES = {
  BadRequestError: {
    description: 'Invalid request payload or validation failure',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } },
  },
  UnauthorizedError: {
    description: 'Authentication required or invalid session token',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } },
  },
  ForbiddenError: {
    description: 'Insufficient role permissions or tenant boundary violation',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } },
  },
  NotFoundError: {
    description: 'Requested entity or route not found',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } },
  },
};

export const OPENAPI_SCHEMAS = {
  StandardErrorResponse: {
    type: 'object',
    required: ['success', 'error'],
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', example: 'Subdomain is reserved' },
          code: { type: 'string', example: 'RESERVED_KEYWORD' },
          status: { type: 'integer', example: 400 },
        },
      },
    },
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'budi@berasjaya.com' },
      password: { type: 'string', format: 'password', example: 'Password123!' },
    },
  },
  LoginResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          email: { type: 'string' },
          sessionToken: { type: 'string' },
        },
      },
    },
  },
  ResolveTenantResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          tenantId: { type: 'string' },
          subdomain: { type: 'string', example: 'berasjaya' },
          businessName: { type: 'string', example: 'Toko Grosir Beras Jaya Bersama' },
          targetUrl: { type: 'string', example: 'https://berasjaya.sidaya.biz.id/dashboard' },
        },
      },
    },
  },
  RegisterOwnerRequest: {
    type: 'object',
    required: ['email', 'businessName', 'ownerName', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'hendro@berasmakmur.com' },
      businessName: { type: 'string', example: 'CV Beras Makmur Abadi' },
      ownerName: { type: 'string', example: 'H. Hendro Wijaya' },
      password: { type: 'string', format: 'password' },
    },
  },
  RegisterOwnerResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          subdomain: { type: 'string' },
          loginUrl: { type: 'string' },
        },
      },
    },
  },
  CheckSubdomainResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          isAvailable: { type: 'boolean' },
          isReserved: { type: 'boolean' },
        },
      },
    },
  },
  UpdateSubdomainRequest: {
    type: 'object',
    required: ['newSubdomain'],
    properties: {
      newSubdomain: { type: 'string', example: 'berasjayagrosir' },
    },
  },
  UpdateSubdomainResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          activeSubdomain: { type: 'string' },
          aliasSubdomain: { type: 'string' },
          aliasExpiresAt: { type: 'string' },
        },
      },
    },
  },
  OperatorLoginRequest: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email', example: 'gabriel@ashvinlabs.com' },
      password: { type: 'string', format: 'password' },
    },
  },
  OperatorLoginResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          operatorId: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
          sessionToken: { type: 'string' },
        },
      },
    },
  },
  StartImpersonationRequest: {
    type: 'object',
    required: ['ticketReference', 'reason'],
    properties: {
      targetUserId: { type: 'string' },
      ticketReference: { type: 'string', example: '#TICKET-8492' },
      reason: { type: 'string', example: 'Diagnosa selisih perhitungan alokasi FIFO' },
    },
  },
  StartImpersonationResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          impersonationToken: { type: 'string' },
          targetTenantId: { type: 'string' },
          targetSubdomain: { type: 'string' },
          redirectUrl: { type: 'string' },
        },
      },
    },
  },
  ExitImpersonationResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          terminated: { type: 'boolean', example: true },
          returnUrl: { type: 'string' },
        },
      },
    },
  },
  MaskedDriverManifestResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          deliveryOrderNumber: { type: 'string' },
          recipientName: { type: 'string' },
          verificationToken: { type: 'string' },
        },
      },
    },
  },
  SubmitPodRequest: {
    type: 'object',
    required: ['deliveryOrderId', 'signature', 'location'],
    properties: {
      deliveryOrderId: { type: 'string' },
      signature: {
        type: 'object',
        properties: { signerName: { type: 'string' }, signatureVectorData: { type: 'string' } },
      },
      location: {
        type: 'object',
        properties: { latitude: { type: 'number' }, longitude: { type: 'number' } },
      },
    },
  },
  SubmitPodResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          deliveryOrderId: { type: 'string' },
          status: { type: 'string', example: 'DELIVERED' },
        },
      },
    },
  },
};
