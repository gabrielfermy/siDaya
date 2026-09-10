import { AppRouter } from './app-router';
import { OrderController } from '../controllers/order.controller';

export function registerOrderRoutes(router: AppRouter, orderController: OrderController): void {
  router.post('/api/v1/orders/checkout', (req, res) => orderController.checkout(req, res));
}
