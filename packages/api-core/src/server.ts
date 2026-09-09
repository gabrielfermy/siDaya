import http from 'http';
import {
  OrderDomainService,
  ShiftDomainService,
  DeliveryOrderDomainService,
  AuthTenantDomainService,
  InboundFifoDomainService,
  PlatformAdminDomainService,
  EmailDispatchService,
  PaymentWebhookController,
} from './index';
import {
  PaymentGatewayRegistry,
  XenditPaymentProvider,
  MidtransPaymentProvider,
  DuitkuPaymentProvider,
} from '@sidaya/payment-core';
import {
  CheckoutOrderPayload,
  PaymentMethodType,
  SalesOrder,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
  PlatformOperatorRole,
  SubscriptionTier,
  RegisterOwnerPayload,
  InviteStaffPayload,
  AcceptStaffInvitePayload,
  InviteOperatorPayload,
  AcceptOperatorInvitePayload,
  ResetPasswordPayload,
} from '@sidaya/shared-types';

const PORT = parseInt(process.env['API_PORT'] || '4000', 10);

// Setup Payment Gateway Registry with development sandbox credentials
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

const orderDomainService = new OrderDomainService(gatewayRegistry.get('MIDTRANS'));
const shiftDomainService = new ShiftDomainService();
const deliveryOrderDomainService = new DeliveryOrderDomainService();
const authTenantDomainService = new AuthTenantDomainService();
const inboundFifoDomainService = new InboundFifoDomainService();
const platformAdminDomainService = new PlatformAdminDomainService();
const emailDispatchService = new EmailDispatchService();
const webhookController = new PaymentWebhookController(gatewayRegistry);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID, Idempotency-Key, X-Operator-Role, X-Operator-Email, X-Operator-Id',
};

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...CORS_HEADERS,
  });
  res.end(JSON.stringify(data));
}

async function parseBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: Buffer | string) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function getOperatorContext(req: http.IncomingMessage): { id: string; email: string; role: PlatformOperatorRole } {
  const roleHeader = (req.headers['x-operator-role'] as string || '').toUpperCase();
  const emailHeader = req.headers['x-operator-email'] as string;
  const idHeader = req.headers['x-operator-id'] as string;
  const authHeader = (req.headers['authorization'] as string || '').toLowerCase();

  let role: PlatformOperatorRole = PlatformOperatorRole.SUPER_ADMIN;
  let email = emailHeader || 'gabriel@ashvinlabs.com';
  let id = idHeader || 'a0000099-0001-0000-0000-000000000001';

  if (roleHeader && Object.values(PlatformOperatorRole).includes(roleHeader as PlatformOperatorRole)) {
    role = roleHeader as PlatformOperatorRole;
  } else if (authHeader) {
    if (authHeader.includes('ops_support')) {
      role = PlatformOperatorRole.OPS_SUPPORT;
      email = emailHeader || 'dina@ashvinlabs.com';
      id = idHeader || 'a0000099-0001-0000-0000-000000000003';
    } else if (authHeader.includes('dev_engineer')) {
      role = PlatformOperatorRole.DEV_ENGINEER;
      email = emailHeader || 'alex@ashvinlabs.com';
      id = idHeader || 'a0000099-0001-0000-0000-000000000002';
    }
  }

  return { id, email, role };
}

function getBaseUrl(req: http.IncomingMessage, defaultPort = 3333): string {
  const host = req.headers['host'] || `localhost:${defaultPort}`;
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${host}`;
}

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const url = req.url || '';
  const pathname: string = url.split('?')[0] || '';
  const method = req.method || 'GET';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  try {
    // 1. Healthcheck
    if (url === '/health' && method === 'GET') {
      sendJson(res, 200, {
        status: 'UP',
        service: 'SiDaya Core API (Phase 2 & Subdomain Auth)',
        timestamp: new Date().toISOString(),
        database: process.env['DATABASE_URL'] || 'postgresql://postgres:postgrespassword@localhost:54350/sidaya_dev',
        registeredPaymentGateways: gatewayRegistry.listRegistered(),
      });
      return;
    }

    // ===========================================================================
    // AUTH & MULTI-TENANT WORKSPACE ENDPOINTS
    // ===========================================================================

    // POST /api/v1/auth/login
    if (url === '/api/v1/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const identifier = (body['email'] || body['phoneNumber'] || body['identifier']) as string;
      const credential = body['password'] as string | undefined;

      if (!identifier) {
        sendJson(res, 400, { success: false, error: { message: 'Email atau Nomor HP harus diisi.' } });
        return;
      }

      try {
        const session = await authTenantDomainService.login(identifier, credential);
        sendJson(res, 200, { success: true, data: session });
      } catch (err: any) {
        sendJson(res, 401, { success: false, error: { message: err.message || 'Login gagal.' } });
      }
      return;
    }

    // POST /api/v1/auth/register-owner
    if (pathname === '/api/v1/auth/register-owner' && method === 'POST') {
      const body = (await parseBody(req)) as unknown as RegisterOwnerPayload;
      if (!body.email || !body.businessName || !body.ownerName || !body.password) {
        sendJson(res, 400, {
          success: false,
          error: { message: 'Nama Bisnis, Nama Pemilik, Email, dan Kata Sandi wajib diisi.' },
        });
        return;
      }

      // Check global email invariant across operators too
      if (platformAdminDomainService.isOperatorEmailRegistered(body.email)) {
        sendJson(res, 409, {
          success: false,
          error: { message: `Email '${body.email}' sudah terdaftar sebagai Ashvin Labs Platform Operator.` },
        });
        return;
      }

      try {
        const baseUrl = getBaseUrl(req);
        const result = await authTenantDomainService.registerOwner(body, emailDispatchService, baseUrl);
        sendJson(res, 201, { success: true, data: result });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // POST /api/v1/auth/verify-email
    if (pathname === '/api/v1/auth/verify-email' && method === 'POST') {
      const body = await parseBody(req);
      const token = body['token'] as string;
      if (!token) {
        sendJson(res, 400, { success: false, error: { message: 'Token verifikasi wajib disertakan.' } });
        return;
      }

      try {
        const result = await authTenantDomainService.verifyEmail(token);
        sendJson(res, 200, { success: true, data: result });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // POST /api/v1/auth/forgot-password
    if (pathname === '/api/v1/auth/forgot-password' && method === 'POST') {
      const body = await parseBody(req);
      const email = body['email'] as string;
      if (!email) {
        sendJson(res, 400, { success: false, error: { message: 'Email wajib diisi.' } });
        return;
      }

      try {
        const baseUrl = getBaseUrl(req);
        const result = await authTenantDomainService.requestPasswordReset(email, emailDispatchService, baseUrl);
        sendJson(res, 200, { success: true, data: result });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // POST /api/v1/auth/reset-password
    if (pathname === '/api/v1/auth/reset-password' && method === 'POST') {
      const body = (await parseBody(req)) as unknown as ResetPasswordPayload;
      if (!body.token || !body.newPassword) {
        sendJson(res, 400, { success: false, error: { message: 'Token dan kata sandi baru wajib disertakan.' } });
        return;
      }

      try {
        const result = await authTenantDomainService.resetPassword(body);
        sendJson(res, 200, { success: true, data: result });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // GET /api/v1/auth/me
    if (url === '/api/v1/auth/me' && method === 'GET') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      const userId = 'a0000001-0001-0000-0000-000000000001'; // default demo
      const activeTenant = authTenantDomainService.selectTenant(userId, tenantId);
      sendJson(res, 200, {
        success: true,
        data: {
          userId,
          activeTenant,
        },
      });
      return;
    }

    // POST /api/v1/auth/select-tenant
    if (url === '/api/v1/auth/select-tenant' && method === 'POST') {
      const body = await parseBody(req);
      const userId = (body['userId'] as string) || 'a0000003-0001-0000-0000-000000000001';
      const targetTenantId = body['tenantId'] as string;

      if (!targetTenantId) {
        sendJson(res, 400, { success: false, error: { message: 'Target tenantId harus diberikan.' } });
        return;
      }

      const membership = authTenantDomainService.selectTenant(userId, targetTenantId);
      sendJson(res, 200, {
        success: true,
        data: {
          activeTenant: membership,
          sessionToken: `tok_sess_${userId.slice(-8)}_${Date.now()}`,
        },
      });
      return;
    }

    // GET /api/v1/staff/permissions-catalog
    if (url === '/api/v1/staff/permissions-catalog' && method === 'GET') {
      sendJson(res, 200, {
        success: true,
        data: authTenantDomainService.getPermissionsCatalog(),
      });
      return;
    }

    // PUT /api/v1/staff/permissions
    if (url === '/api/v1/staff/permissions' && method === 'PUT') {
      const body = await parseBody(req);
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      const staffId = body['staffId'] as string;
      const permissions = body['permissions'] as any[];

      if (!staffId || !Array.isArray(permissions)) {
        sendJson(res, 400, { success: false, error: { message: 'staffId dan permissions array wajib diberikan.' } });
        return;
      }

      const updated = authTenantDomainService.updateStaffPermissions(staffId, tenantId, permissions);
      sendJson(res, 200, { success: true, data: updated });
      return;
    }

    // ===========================================================================
    // TENANT STAFF INVITATIONS (Kasir, Gudang, Driver)
    // ===========================================================================

    // POST /api/v1/tenant/staff/invite
    if (pathname === '/api/v1/tenant/staff/invite' && method === 'POST') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      const body = (await parseBody(req)) as unknown as InviteStaffPayload;
      body.tenantId = body.tenantId || tenantId;

      if (!body.email || !body.fullName || !body.role) {
        sendJson(res, 400, {
          success: false,
          error: { message: 'Email, Nama Lengkap, dan Peran staff wajib diisi.' },
        });
        return;
      }

      if (platformAdminDomainService.isOperatorEmailRegistered(body.email)) {
        sendJson(res, 409, {
          success: false,
          error: { message: `Email '${body.email}' sudah terdaftar sebagai Operator Platform.` },
        });
        return;
      }

      try {
        const baseUrl = getBaseUrl(req);
        const invitation = await authTenantDomainService.inviteStaff(body, emailDispatchService, baseUrl);
        sendJson(res, 201, { success: true, data: invitation });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // POST /api/v1/tenant/staff/accept-invite
    if (pathname === '/api/v1/tenant/staff/accept-invite' && method === 'POST') {
      const body = (await parseBody(req)) as unknown as AcceptStaffInvitePayload;
      if (!body.token || !body.password) {
        sendJson(res, 400, { success: false, error: { message: 'Token undangan dan kata sandi baru wajib diisi.' } });
        return;
      }

      try {
        const session = await authTenantDomainService.acceptStaffInvite(body);
        sendJson(res, 200, { success: true, data: session });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // GET /api/v1/tenant/staff
    if (pathname === '/api/v1/tenant/staff' && method === 'GET') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      const staffList = authTenantDomainService.listTenantStaff(tenantId);
      sendJson(res, 200, { success: true, data: staffList });
      return;
    }

    // ===========================================================================
    // ASHVIN LABS PLATFORM OPERATOR & SUPER ADMIN CONTROL PLANE ENDPOINTS
    // ===========================================================================

    // POST /api/v1/admin/auth/login
    if (pathname === '/api/v1/admin/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const email = (body['email'] as string) || '';
      const password = body['password'] as string | undefined;

      if (!email) {
        sendJson(res, 400, { success: false, error: { message: 'Operator email wajib diisi.' } });
        return;
      }

      try {
        const session = platformAdminDomainService.loginOperator(email, password);
        sendJson(res, 200, { success: true, data: session });
      } catch (err: any) {
        sendJson(res, 401, { success: false, error: { message: err.message || 'Login operator gagal.' } });
      }
      return;
    }

    // POST /api/v1/admin/operators/invite
    if (pathname === '/api/v1/admin/operators/invite' && method === 'POST') {
      const operator = getOperatorContext(req);
      const body = (await parseBody(req)) as unknown as InviteOperatorPayload;

      if (!body.email || !body.fullName || !body.role) {
        sendJson(res, 400, {
          success: false,
          error: { message: 'Email, Nama Lengkap, dan Peran Operator wajib diisi.' },
        });
        return;
      }

      // Check global uniqueness against tenant users
      if (authTenantDomainService.isEmailRegistered(body.email)) {
        sendJson(res, 409, {
          success: false,
          error: { message: `Email '${body.email}' sudah terdaftar sebagai Merchant / Tenant User.` },
        });
        return;
      }

      try {
        const baseUrl = getBaseUrl(req);
        const invitation = await platformAdminDomainService.inviteOperator(
          body,
          operator,
          emailDispatchService,
          baseUrl,
        );
        sendJson(res, 201, { success: true, data: invitation });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // POST /api/v1/admin/operators/accept-invite
    if (pathname === '/api/v1/admin/operators/accept-invite' && method === 'POST') {
      const body = (await parseBody(req)) as unknown as AcceptOperatorInvitePayload;
      if (!body.token || !body.password) {
        sendJson(res, 400, {
          success: false,
          error: { message: 'Token undangan operator dan kata sandi baru wajib disertakan.' },
        });
        return;
      }

      try {
        const session = await platformAdminDomainService.acceptOperatorInvite(body);
        sendJson(res, 200, { success: true, data: session });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // GET /api/v1/admin/operators
    if (pathname === '/api/v1/admin/operators' && method === 'GET') {
      const operators = platformAdminDomainService.listOperatorsAndInvitations();
      sendJson(res, 200, { success: true, data: operators });
      return;
    }

    // GET /api/v1/admin/telemetry
    if (pathname === '/api/v1/admin/telemetry' && method === 'GET') {
      const operator = getOperatorContext(req);
      const telemetry = platformAdminDomainService.getPlatformTelemetry(operator.role);
      sendJson(res, 200, { success: true, data: telemetry });
      return;
    }

    // GET /api/v1/admin/audit-logs
    if (pathname === '/api/v1/admin/audit-logs' && method === 'GET') {
      const logs = platformAdminDomainService.getAuditLogs();
      sendJson(res, 200, { success: true, data: logs });
      return;
    }

    // GET /api/v1/admin/tenants
    if (pathname === '/api/v1/admin/tenants' && method === 'GET') {
      const operator = getOperatorContext(req);
      const tenants = platformAdminDomainService.listTenants(operator.role);
      sendJson(res, 200, {
        success: true,
        data: tenants,
        metadata: {
          operatorRole: operator.role,
          piiMasked: operator.role === PlatformOperatorRole.OPS_SUPPORT,
        },
      });
      return;
    }

    // PUT /api/v1/admin/tenants/:id/subscription
    if (pathname.startsWith('/api/v1/admin/tenants/') && pathname.endsWith('/subscription') && method === 'PUT') {
      const parts = pathname.split('/');
      const tenantId = parts[5] || '';
      const body = await parseBody(req);
      const operator = getOperatorContext(req);
      try {
        const updated = platformAdminDomainService.updateTenantSubscription(
          tenantId,
          body['tier'] as SubscriptionTier,
          body['status'] as any || 'ACTIVE',
          operator,
          body['reason'] as string,
        );
        sendJson(res, 200, { success: true, data: updated });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // POST /api/v1/admin/tenants/:id/breakglass
    if (pathname.startsWith('/api/v1/admin/tenants/') && pathname.endsWith('/breakglass') && method === 'POST') {
      const parts = pathname.split('/');
      const tenantId = parts[5] || '';
      const body = await parseBody(req);
      const operator = getOperatorContext(req);
      try {
        const session = platformAdminDomainService.requestBreakglassDiagnostic(
          operator,
          tenantId,
          (body['ticketReference'] as string) || 'INC-LIVE',
          (body['reason'] as string) || 'Diagnostic verification',
        );
        sendJson(res, 200, { success: true, data: session });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: { message: err.message } });
      }
      return;
    }

    // GET /api/v1/admin/tenants/:id
    if (
      pathname.startsWith('/api/v1/admin/tenants/') &&
      !pathname.includes('/subscription') &&
      !pathname.includes('/breakglass') &&
      method === 'GET'
    ) {
      const parts = pathname.split('/');
      const tenantId = parts[5] || '';
      const operator = getOperatorContext(req);
      try {
        const tenant = platformAdminDomainService.getTenantDetail(tenantId, operator.role);
        sendJson(res, 200, { success: true, data: tenant });
      } catch (err: any) {
        sendJson(res, 404, { success: false, error: { message: err.message } });
      }
      return;
    }

    // ===========================================================================
    // INBOUND SUPPLY, STORAGE BINS & FIFO BATCH ALLOCATION
    // ===========================================================================

    // GET /api/v1/inventory/bins
    if (url === '/api/v1/inventory/bins' && method === 'GET') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      sendJson(res, 200, {
        success: true,
        data: inboundFifoDomainService.getStorageLocations(tenantId),
      });
      return;
    }

    // GET /api/v1/inventory/batches
    if (url.startsWith('/api/v1/inventory/batches') && method === 'GET') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      sendJson(res, 200, {
        success: true,
        data: inboundFifoDomainService.getBatches(tenantId),
      });
      return;
    }

    // POST /api/v1/inventory/inbound/receive
    if (url === '/api/v1/inventory/inbound/receive' && method === 'POST') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      const body = await parseBody(req);

      const newBatch = inboundFifoDomainService.receiveInboundShipment({
        tenantId,
        branchId: (body['branchId'] as string) || 'b0000000-0000-0000-0000-000000000001',
        supplierId: (body['supplierId'] as string) || 'b0000005-0000-0000-0000-000000000001',
        supplierName: (body['supplierName'] as string) || 'PT Lumbung Padi Solok Super',
        productId: (body['productId'] as string) || 'a0000002-0000-0000-0000-000000000001',
        productName: (body['productName'] as string) || 'Beras Rojolele Super Premium 50KG',
        storageLocationId: (body['storageLocationId'] as string) || 'e0000001-0000-0000-0000-000000000001',
        quantityReceived: Number(body['quantityReceived'] || 50),
        inboundCostPerUnit: Number(body['inboundCostPerUnit'] || 580000),
      });

      sendJson(res, 201, { success: true, data: newBatch });
      return;
    }

    // POST /api/v1/inventory/allocate-fifo
    if (url === '/api/v1/inventory/allocate-fifo' && method === 'POST') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      const body = await parseBody(req);
      const productId = (body['productId'] as string) || 'a0000002-0000-0000-0000-000000000001';
      const quantity = Number(body['quantity'] || 1);

      const allocations = inboundFifoDomainService.allocateBatchesFIFO(tenantId, productId, quantity);
      sendJson(res, 200, { success: true, data: allocations });
      return;
    }

    // POST /api/v1/inventory/reset-batches (Used by tests & demos to restore seed batch state)
    if (url === '/api/v1/inventory/reset-batches' && method === 'POST') {
      inboundFifoDomainService.resetBatches();
      sendJson(res, 200, { success: true, message: 'Batches reset to seed baseline.' });
      return;
    }

    // ===========================================================================
    // OUTBOUND LOGISTICS: SURAT JALAN (DRIVER WORKING PERMITS - NO FINANCIALS)
    // ===========================================================================

    // POST /api/v1/logistics/surat-jalan
    if (url === '/api/v1/logistics/surat-jalan' && method === 'POST') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      const body = await parseBody(req);

      const dummySalesOrder: SalesOrder = {
        id: (body['orderId'] as string) || 'a0000003-0000-0000-0000-000000000001',
        tenantId,
        storeId: 'b0000000-0000-0000-0000-000000000001',
        cashierUserId: 'a0000001-0001-0000-0000-000000000003',
        orderNumber: (body['orderNumber'] as string) || 'ORD-20260908-0129',
        customerName: (body['recipientName'] as string) || 'Pak Haji Rahmat',
        customerPhone: (body['recipientPhone'] as string) || '081298765432',
        paymentMethod: PaymentMethodType.CASH,
        subtotalAmount: 13000000,
        discountAmount: 250000,
        totalAmount: 12750000,
        paymentStatus: OrderPaymentStatus.PAID,
        fulfillmentStatus: OrderFulfillmentStatus.ALLOCATED_FIFO,
        items: [
          {
            id: 'a0000004-0000-0000-0000-000000000001',
            productId: 'a0000002-0000-0000-0000-000000000001',
            productName: 'Beras Rojolele Super Premium 50KG',
            productSku: 'RJL-50',
            selectedUnit: 'KARUNG 50KG',
            conversionFactor: 1,
            quantity: 20,
            unitPrice: 650000,
            subtotal: 13000000,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const manifest = deliveryOrderDomainService.createDeliveryManifest(dummySalesOrder, {
        driverName: (body['driverName'] as string) || 'Joko Supir',
        vehiclePlateNumber: (body['vehiclePlateNumber'] as string) || 'B 9482 TJA',
        recipientName: (body['recipientName'] as string) || 'Pak Haji Rahmat',
        recipientPhone: (body['recipientPhone'] as string) || '081298765432',
        destinationAddress: (body['destinationAddress'] as string) || 'Jl. Raya Bogor KM 22, Kramat Jati, Jakarta Timur',
        pickupBinLabel: (body['pickupBinLabel'] as string) || 'Zona Beras / Rak A-01 (Pallet 1)',
        notes: body['notes'] as string | undefined,
      });

      sendJson(res, 201, { success: true, data: manifest });
      return;
    }

    // POST /api/v1/logistics/surat-jalan/sign
    if (url === '/api/v1/logistics/surat-jalan/sign' && method === 'POST') {
      const body = await parseBody(req);
      const manifest = deliveryOrderDomainService.signDeliveryManifest({
        deliveryOrderId: body['deliveryOrderId'] as string,
        recipientSignature: (body['recipientSignature'] as string) || 'SIG_RECIPIENT_BASE64_VERIFIED',
        ...(typeof body['driverSignature'] === 'string' ? { driverSignature: body['driverSignature'] } : {}),
        ...(typeof body['recipientNotes'] === 'string' ? { recipientNotes: body['recipientNotes'] } : {}),
      });
      sendJson(res, 200, { success: true, data: manifest });
      return;
    }

    // ===========================================================================
    // CORE SALES ORDERS, SHIFTS & PAYLINKS
    // ===========================================================================

    // Wholesale Checkout Endpoint
    if (url === '/api/v1/orders/checkout' && method === 'POST') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      const body = await parseBody(req);

      const checkoutPayload: CheckoutOrderPayload = {
        storeId: (body['storeId'] as string) || 'b0000000-0000-0000-0000-000000000001',
        cashierUserId: (body['cashierUserId'] as string) || 'a0000001-0001-0000-0000-000000000003',
        customerName: body['customerName'] as string | undefined,
        customerPhone: body['customerPhone'] as string | undefined,
        paymentMethod: (body['paymentMethod'] as PaymentMethodType) || PaymentMethodType.PAYLINK_QRIS,
        items: (body['items'] as any) || [
          {
            productId: 'a0000002-0000-0000-0000-000000000001',
            productName: 'Beras Rojolele Super Premium 50KG',
            productSku: 'RJL-50',
            selectedUnit: 'KARUNG 50KG',
            conversionFactor: 1,
            quantity: 5,
            unitPrice: 617500, // Grosir 1 tier price
            subtotal: 3087500,
          },
        ],
        orderDiscount: (body['orderDiscount'] as any) || { percent1: 5, percent2: 2, fixedAmount: 5000 },
      };

      const result = await orderDomainService.processCheckout(tenantId, checkoutPayload);
      sendJson(res, 201, {
        success: true,
        data: result,
      });
      return;
    }

    // Shift Open
    if (url === '/api/v1/shifts/open' && method === 'POST') {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
      const body = await parseBody(req);
      const shift = shiftDomainService.openShift(tenantId, 'a0000001-0001-0000-0000-000000000003', {
        storeId: (body['storeId'] as string) || 'b0000000-0000-0000-0000-000000000001',
        stationId: (body['stationId'] as string) || 'dev_pos_counter_01',
        openingCashFloat: Number(body['openingCashFloat'] || 250000),
        cashierName: (body['cashierName'] as string) || 'Siti Rahma',
      });
      sendJson(res, 201, { success: true, data: shift });
      return;
    }

    // Public PayLink Metadata (Used by Customer Web Portal)
    if (url.startsWith('/api/v1/public/paylink/') && method === 'GET') {
      const token = url.split('/').pop() || '';
      sendJson(res, 200, {
        success: true,
        data: {
          token,
          orderNumber: 'ORD-20260908-0081',
          merchantName: 'Toko Grosir Beras Jaya Bersama',
          totalAmount: 1845000,
          discountAmount: 105000,
          paymentStatus: 'UNPAID',
          qrString: '00020101021226580014ID.LINKAJA.WWW01189360000201100000000215ORD202609080081520458125303360540',
          vaNumber: '70012081298765432',
          items: [
            {
              productName: 'Beras Rojolele Super Premium 50KG',
              quantity: 3,
              unitName: 'KARUNG 50KG',
              unitPrice: 650000,
              subtotal: 1950000,
            },
          ],
        },
      });
      return;
    }

    // Inbound Payment Webhooks (Midtrans / Xendit / Duitku)
    if (url.startsWith('/api/v1/webhooks/payment/') && method === 'POST') {
      const provider = url.split('/').pop()?.toUpperCase() || 'MIDTRANS';
      const body = await parseBody(req);
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') headers[k] = v;
      }

      const result = await webhookController.handleWebhook(provider, headers, body);
      sendJson(res, 200, { success: true, data: result });
      return;
    }

    // Default 404
    sendJson(res, 404, {
      success: false,
      error: { code: 'NOT_FOUND', message: `Route ${method} ${url} does not exist on SiDaya Core API.` },
    });
  } catch (error: any) {
    sendJson(res, 500, {
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'An unexpected error occurred.' },
    });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SiDaya Core API] Server listening at http://localhost:${PORT}`);
});
