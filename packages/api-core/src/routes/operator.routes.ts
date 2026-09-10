import { AppRouter } from './app-router';
import { OperatorController } from '../controllers/operator.controller';

export function registerOperatorRoutes(router: AppRouter, operatorController: OperatorController): void {
  router.post('/api/v1/admin/auth/login', (req, res) => operatorController.login(req, res));
  router.get('/api/v1/admin/tenants', (req, res, params, query) =>
    operatorController.listTenants(req, res, params, query),
  );
  router.post('/api/v1/admin/tenants/:tenantId/status', (req, res, params) =>
    operatorController.updateTenantStatus(req, res, params),
  );
  router.post('/api/v1/admin/tenants/:tenantId/lifecycle', (req, res, params) =>
    operatorController.updateTenantStatus(req, res, params),
  );
  router.get('/api/v1/admin/operators', (req, res) => operatorController.listOperators(req, res));
  router.post('/api/v1/admin/operators/invite', (req, res) => operatorController.inviteOperator(req, res));
  router.post('/api/v1/admin/operators/accept-invite', (req, res) =>
    operatorController.acceptOperatorInvite(req, res),
  );
  router.get('/api/v1/admin/audit-logs', (req, res) => operatorController.getAuditLogs(req, res));
  router.get('/api/v1/admin/telemetry', (req, res) => operatorController.getTelemetry(req, res));
  router.post('/api/v1/admin/tenants/:tenantId/impersonate', (req, res, params) =>
    operatorController.impersonateTenant(req, res, params),
  );
  router.post('/api/v1/admin/tenants/:tenantId/impersonate/exit', (req, res, params) =>
    operatorController.exitImpersonation(req, res, params),
  );
}
