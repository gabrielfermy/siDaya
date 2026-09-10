import http from 'http';
import {
  OrderDomainService,
  ShiftDomainService,
  DeliveryOrderDomainService,
  AuthTenantDomainService,
  InboundFifoDomainService,
  PlatformAdminDomainService,
  PaymentWebhookController,
} from './index';
import {
  PaymentGatewayRegistry,
  XenditPaymentProvider,
  MidtransPaymentProvider,
  DuitkuPaymentProvider,
} from '@sidaya/payment-core';
import { AppRouter } from './routes/app-router';
import { AuthController } from './controllers/auth.controller';
import { OrderController } from './controllers/order.controller';
import { FifoController } from './controllers/fifo.controller';
import { DeliveryController } from './controllers/delivery.controller';
import { ShiftController } from './controllers/shift.controller';
import { OperatorController } from './controllers/operator.controller';
import { registerAuthRoutes } from './routes/auth.routes';
import { registerOrderRoutes } from './routes/order.routes';
import { registerFifoRoutes } from './routes/fifo.routes';
import { registerDeliveryRoutes } from './routes/delivery.routes';
import { registerShiftRoutes } from './routes/shift.routes';
import { registerOperatorRoutes } from './routes/operator.routes';
import { registerWebhookRoutes } from './routes/webhook.routes';
import { sendJson } from './middleware/cors.middleware';

const PORT = parseInt(process.env['API_PORT'] || '4000', 10);

// Setup Payment Gateways
const gatewayRegistry = new PaymentGatewayRegistry();
gatewayRegistry.register(
  new MidtransPaymentProvider({
    serverKey: process.env['MIDTRANS_SERVER_KEY'] || 'SB-Mid-server-DEV-TEST',
    clientKey: process.env['MIDTRANS_CLIENT_KEY'] || 'SB-Mid-client-DEV-TEST',
    isProduction: false,
  }),
);
gatewayRegistry.register(
  new XenditPaymentProvider({
    secretApiKey: process.env['XENDIT_SECRET_KEY'] || 'xnd_development_TEST',
    webhookVerificationToken: process.env['XENDIT_WEBHOOK_TOKEN'] || 'wh_token_dev_test',
  }),
);
gatewayRegistry.register(
  new DuitkuPaymentProvider({
    merchantCode: process.env['DUITKU_MERCHANT_CODE'] || 'D1000',
    merchantKey: process.env['DUITKU_MERCHANT_KEY'] || 'merchant_key_dev',
    isSandbox: true,
  }),
);

// Setup Domain Services
const orderDomainService = new OrderDomainService(gatewayRegistry.get('MIDTRANS'));
const shiftDomainService = new ShiftDomainService();
const deliveryOrderDomainService = new DeliveryOrderDomainService();
const authTenantDomainService = new AuthTenantDomainService();
const inboundFifoDomainService = new InboundFifoDomainService();
const platformAdminDomainService = new PlatformAdminDomainService();
const webhookController = new PaymentWebhookController(gatewayRegistry);

// Setup Controllers
const authController = new AuthController(authTenantDomainService, platformAdminDomainService);
const orderController = new OrderController(orderDomainService);
const fifoController = new FifoController(inboundFifoDomainService);
const deliveryController = new DeliveryController(deliveryOrderDomainService);
const shiftController = new ShiftController(shiftDomainService);
const operatorController = new OperatorController(platformAdminDomainService, authTenantDomainService);

// Setup App Router
const router = new AppRouter();

router.get('/health', (_req, res) => {
  sendJson(res, 200, {
    status: 'UP',
    service: 'SiDaya Core API (Phase 2 & Subdomain Auth)',
    timestamp: new Date().toISOString(),
    database: process.env['DATABASE_URL'] || 'postgresql://postgres:postgrespassword@localhost:54350/sidaya_dev',
    registeredPaymentGateways: gatewayRegistry.listRegistered(),
  });
});

registerAuthRoutes(router, authController);
registerOrderRoutes(router, orderController);
registerFifoRoutes(router, fifoController);
registerDeliveryRoutes(router, deliveryController);
registerShiftRoutes(router, shiftController);
registerOperatorRoutes(router, operatorController);
registerWebhookRoutes(router, webhookController);

const server = http.createServer((req, res) => router.handleRequest(req, res));

if (process.env['NODE_ENV'] !== 'test') {
  server.listen(PORT, () => {
    console.log(`SiDaya Core API running on http://localhost:${PORT}`);
  });
}

export default server;
