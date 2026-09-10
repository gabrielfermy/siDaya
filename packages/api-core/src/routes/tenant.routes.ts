/**
 * @fileoverview Tenant Subdomain and Domain Routing
 * @module Routes:Tenant
 * @description
 * Declares endpoints for subdomain validation, 30-day alias registration,
 * and custom domain configuration.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import { AppRouter } from './app-router.js';
import { TenantController } from '../controllers/tenant.controller.js';

export function registerTenantRoutes(router: AppRouter, tenantController: TenantController): void {
  router.get('/api/v1/tenants/check-subdomain', (req, res, params, query) =>
    tenantController.checkSubdomain(req, res, params, query),
  );
  router.put('/api/v1/tenants/:tenantId/subdomain', (req, res, params) =>
    tenantController.updateSubdomain(req, res, params),
  );
  router.get('/api/v1/tenants/:tenantId/aliases', (req, res, params) =>
    tenantController.getAliases(req, res, params),
  );
  router.post('/api/v1/tenants/:tenantId/custom-domain', (req, res, params) =>
    tenantController.registerCustomDomain(req, res, params),
  );
}
