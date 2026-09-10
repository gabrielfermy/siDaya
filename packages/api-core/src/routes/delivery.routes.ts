import { AppRouter } from './app-router';
import { DeliveryController } from '../controllers/delivery.controller';

export function registerDeliveryRoutes(router: AppRouter, deliveryController: DeliveryController): void {
  router.post('/api/v1/logistics/delivery-orders', (req, res) => deliveryController.createDeliveryOrder(req, res));
  router.post('/api/v1/logistics/delivery-orders/:id/pod', (req, res, params) =>
    deliveryController.completePod(req, res, params),
  );
}
