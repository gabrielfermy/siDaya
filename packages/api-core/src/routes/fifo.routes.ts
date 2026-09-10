import { AppRouter } from './app-router';
import { FifoController } from '../controllers/fifo.controller';

export function registerFifoRoutes(router: AppRouter, fifoController: FifoController): void {
  router.post('/api/v1/inventory/fifo/allocate', (req, res) => fifoController.allocateLots(req, res));
  router.get('/api/v1/inventory/batches', (req, res, params, query) => fifoController.listBatches(req, res, params, query));
}
