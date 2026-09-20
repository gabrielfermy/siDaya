/**
 * @fileoverview Tenant Subdomain & Domain Management Controller
 * @module Controllers:Tenant
 * @description
 * HTTP request handlers for tenant subdomain availability validation,
 * self-service subdomain migration with 30-day alias creation,
 * and custom domain provisioning (PRO tier).
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import http from 'http';
import { SubdomainDomainService } from '../services/tenant/subdomain.service.js';
import { sendJson } from '../middleware/cors.middleware.js';
import { parseRequestBody } from '../middleware/body-parser.middleware.js';
import {
  UpdateSubdomainPayload,
} from '@sidaya/shared-types';

export class TenantController {
  private subdomainService = SubdomainDomainService.getInstance();

  /**
   * GET /api/v1/tenants/check-subdomain?slug=:slug
   */
  public async checkSubdomain(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _params: Record<string, string>,
    query: Record<string, string>,
  ): Promise<void> {
    const slug = query['slug'] || query['subdomain'] || '';
    if (!slug) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Query parameter "slug" is required.', code: 'MISSING_SLUG' },
      });
      return;
    }

    try {
      const result = this.subdomainService.checkSubdomainAvailability(slug);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 500, {
        success: false,
        error: { message: err.message || 'Subdomain check failed.', code: 'CHECK_FAILED' },
      });
    }
  }

  /**
   * PUT /api/v1/tenants/:tenantId/subdomain
   */
  public async updateSubdomain(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    params: Record<string, string>,
  ): Promise<void> {
    const tenantId = params['tenantId'];
    if (!tenantId) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'tenantId parameter is required.', code: 'MISSING_TENANT_ID' },
      });
      return;
    }

    const body = (await parseRequestBody(req)) as unknown as UpdateSubdomainPayload;
    const newSubdomain = body.newSubdomain || (body as any).subdomain;

    if (!newSubdomain) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'newSubdomain field is required.', code: 'MISSING_SUBDOMAIN' },
      });
      return;
    }

    try {
      const host = ((req.headers['host'] as string) || '').toLowerCase();
      let baseDomain = 'sidaya.biz.id';
      if (host.includes('sidaya.test')) {
        baseDomain = 'sidaya.test';
      } else if (host.includes('sidaya.my.id')) {
        baseDomain = 'sidaya.my.id';
      } else if (host.includes('sidaya.biz.id')) {
        baseDomain = 'sidaya.biz.id';
      } else if (host.includes('localhost')) {
        baseDomain = host;
      }

      const result = this.subdomainService.updateSubdomain(tenantId, newSubdomain, baseDomain);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, {
        success: false,
        error: { message: err.message || 'Failed to update subdomain.', code: 'UPDATE_FAILED' },
      });
    }
  }

  /**
   * GET /api/v1/tenants/:tenantId/aliases
   */
  public async getAliases(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    params: Record<string, string>,
  ): Promise<void> {
    const tenantId = params['tenantId'];
    if (!tenantId) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'tenantId parameter is required.', code: 'MISSING_TENANT_ID' },
      });
      return;
    }

    try {
      const aliases = this.subdomainService.getAliases(tenantId);
      sendJson(res, 200, { success: true, data: aliases });
    } catch (err: any) {
      sendJson(res, 500, {
        success: false,
        error: { message: err.message || 'Failed to retrieve aliases.', code: 'FETCH_FAILED' },
      });
    }
  }

  /**
   * POST /api/v1/tenants/:tenantId/custom-domain
   */
  public async registerCustomDomain(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    params: Record<string, string>,
  ): Promise<void> {
    const tenantId = params['tenantId'];
    if (!tenantId) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'tenantId parameter is required.', code: 'MISSING_TENANT_ID' },
      });
      return;
    }

    const body = await parseRequestBody(req);
    const customDomain = body['customDomain'] as string;

    if (!customDomain) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'customDomain field is required.', code: 'MISSING_DOMAIN' },
      });
      return;
    }

    try {
      const result = this.subdomainService.registerCustomDomain(tenantId, customDomain);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, {
        success: false,
        error: { message: err.message || 'Failed to register custom domain.', code: 'REGISTRATION_FAILED' },
      });
    }
  }
}
