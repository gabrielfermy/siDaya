import { AppRouter } from './app-router';
import { BillingController } from '../controllers/billing.controller';

export function registerBillingRoutes(router: AppRouter, billingController: BillingController): void {
  // Public pricing catalog route for compliance and pricing transparency
  router.get('/api/v1/billing/plans', (req, res) => billingController.getPlans(req, res));
  router.get('/api/billing/plans', (req, res) => billingController.getPlans(req, res));

  // Live Xendit invoice creation routes for plan subscription & integration audit
  router.post('/api/v1/billing/subscription/checkout', (req, res) =>
    billingController.checkoutSubscription(req, res),
  );
  router.post('/api/v1/billing/checkout', (req, res) =>
    billingController.checkoutSubscription(req, res),
  );
  router.post('/api/billing/checkout', (req, res) =>
    billingController.checkoutSubscription(req, res),
  );
}
