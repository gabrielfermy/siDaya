import { AppRouter } from './app-router';
import { ShiftController } from '../controllers/shift.controller';

export function registerShiftRoutes(router: AppRouter, shiftController: ShiftController): void {
  router.post('/api/v1/pos/shifts/start', (req, res) => shiftController.startShift(req, res));
  router.post('/api/v1/pos/shifts/close', (req, res) => shiftController.closeShift(req, res));
}
