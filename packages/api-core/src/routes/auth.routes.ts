import { AppRouter } from './app-router';
import { AuthController } from '../controllers/auth.controller';

export function registerAuthRoutes(router: AppRouter, authController: AuthController): void {
  router.post('/api/v1/auth/login', (req, res) => authController.login(req, res));
  router.post('/api/v1/auth/register-owner', (req, res) => authController.registerOwner(req, res));
  router.post('/api/v1/auth/staff/invite', (req, res) => authController.inviteStaff(req, res));
  router.post('/api/v1/auth/staff/accept-invite', (req, res) => authController.acceptStaffInvite(req, res));
  router.post('/api/v1/auth/password/reset-request', (req, res) => authController.requestPasswordReset(req, res));
  router.post('/api/v1/auth/password/reset-confirm', (req, res) => authController.confirmPasswordReset(req, res));
  router.get('/api/v1/tenants/:tenantId/staff', (req, res, params) => authController.getTenantStaff(req, res, params));
  router.post('/api/v1/tenants/:tenantId/staff/:staffId/pin', (req, res, params) =>
    authController.setStaffPin(req, res, params),
  );
}
