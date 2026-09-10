import http from 'http';
import { PlatformAdminDomainService } from '../services/platform-admin.service';
import { AuthTenantDomainService } from '../services/auth-tenant.service';
import { sendJson } from '../middleware/cors.middleware';
import { parseRequestBody } from '../middleware/body-parser.middleware';
import { getOperatorContext, getBaseUrl } from '../middleware/operator-context.middleware';
import {
  PlatformOperatorRole,
  SubscriptionTier,
  InviteOperatorPayload,
  AcceptOperatorInvitePayload,
  StartImpersonationPayload,
  ExitImpersonationPayload,
} from '@sidaya/shared-types';
import { ImpersonationDomainService } from '../services/operator/impersonation.service.js';

export class OperatorController {
  constructor(
    private platformAdminService: PlatformAdminDomainService,
    private authTenantService: AuthTenantDomainService,
  ) {}

  public async login(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = await parseRequestBody(req);
    const email = body['email'] as string;
    const password = body['password'] as string | undefined;

    if (!email) {
      sendJson(res, 400, { success: false, error: { message: 'Email operator wajib diisi.' } });
      return;
    }

    try {
      const session = this.platformAdminService.loginOperator(email, password);
      sendJson(res, 200, { success: true, data: session });
    } catch (err: any) {
      sendJson(res, 401, { success: false, error: { message: err.message || 'Login operator gagal.' } });
    }
  }

  public async listTenants(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    _params: Record<string, string>,
    query: Record<string, string>,
  ): Promise<void> {
    const operator = getOperatorContext(req);
    const isBreakGlass = query['breakglass'] === 'true' || req.headers['x-breakglass-auth'] === 'true';

    try {
      const tenants = this.platformAdminService.listTenants(operator.role);
      const isPiiMasked = operator.role !== PlatformOperatorRole.SUPER_ADMIN && !isBreakGlass;

      sendJson(res, 200, {
        success: true,
        data: tenants,
        metadata: {
          count: tenants.length,
          piiMasked: isPiiMasked,
          requestingRole: operator.role,
        },
      });
    } catch (err: any) {
      sendJson(res, 403, { success: false, error: { message: err.message || 'Forbidden' } });
    }
  }

  public async updateTenantStatus(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    params: Record<string, string>,
  ): Promise<void> {
    const operator = getOperatorContext(req);
    const tenantId = params['tenantId'] || '';
    const body = await parseRequestBody(req);
    const tier = (body['subscriptionTier'] || SubscriptionTier.GROSIR_PRO) as SubscriptionTier;
    const status = (body['status'] || 'ACTIVE') as 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'GRACE_PERIOD';
    const reason = (body['reason'] || body['notes'] || 'Operator Lifecycle Update') as string;

    if (!tenantId) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'tenantId is required.' },
      });
      return;
    }

    try {
      const updated = this.platformAdminService.updateTenantSubscription(
        tenantId,
        tier,
        status,
        operator,
        reason,
      );
      sendJson(res, 200, { success: true, data: updated });
    } catch (err: any) {
      sendJson(res, 403, { success: false, error: { message: err.message || 'Action forbidden.' } });
    }
  }

  public async listOperators(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const operator = getOperatorContext(req);
    if (operator.role !== PlatformOperatorRole.SUPER_ADMIN) {
      sendJson(res, 403, {
        success: false,
        error: { message: 'Akses terbatas: Hanya SUPER_ADMIN yang dapat mengelola operator.' },
      });
      return;
    }
    try {
      const list = this.platformAdminService.listOperatorsAndInvitations();
      sendJson(res, 200, { success: true, data: list });
    } catch (err: any) {
      sendJson(res, 403, { success: false, error: { message: err.message } });
    }
  }

  public async inviteOperator(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const operator = getOperatorContext(req);
    const body = (await parseRequestBody(req)) as unknown as InviteOperatorPayload;

    if (!body.email || !body.fullName || !body.role) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Email, Nama Lengkap, dan Peran Operator wajib diisi.' },
      });
      return;
    }

    if (this.authTenantService.isEmailRegistered(body.email)) {
      sendJson(res, 409, {
        success: false,
        error: { message: `Email '${body.email}' sudah terdaftar sebagai Tenant Staff/Owner.` },
      });
      return;
    }

    try {
      const baseUrl = getBaseUrl(req);
      const invite = await this.platformAdminService.inviteOperator(body, operator, undefined, baseUrl);
      sendJson(res, 201, {
        success: true,
        data: invite,
      });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Gagal mengundang operator.' } });
    }
  }

  public async acceptOperatorInvite(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = (await parseRequestBody(req)) as unknown as AcceptOperatorInvitePayload;
    if (!body.token || !body.password) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Token dan Kata Sandi wajib diisi.' },
      });
      return;
    }

    try {
      const result = await this.platformAdminService.acceptOperatorInvite(body);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Gagal menerima undangan operator.' } });
    }
  }

  public async getAuditLogs(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const operator = getOperatorContext(req);
    if (operator.role === PlatformOperatorRole.DEV_ENGINEER) {
      sendJson(res, 403, { success: false, error: { message: 'Forbidden' } });
      return;
    }
    try {
      const logs = this.platformAdminService.getAuditLogs();
      sendJson(res, 200, { success: true, data: logs });
    } catch (err: any) {
      sendJson(res, 403, { success: false, error: { message: err.message } });
    }
  }

  public async getTelemetry(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const operator = getOperatorContext(req);
    if (operator.role === PlatformOperatorRole.OPS_SUPPORT) {
      sendJson(res, 403, {
        success: false,
        error: { message: 'Akses terbatas: OPS_SUPPORT tidak berwenang mengakses metrik telemetri sistem.' },
      });
      return;
    }
    try {
      const telemetry = this.platformAdminService.getPlatformTelemetry(operator.role);
      sendJson(res, 200, { success: true, data: telemetry });
    } catch (err: any) {
      sendJson(res, 403, { success: false, error: { message: err.message } });
    }
  }

  public async impersonateTenant(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    params: Record<string, string>,
  ): Promise<void> {
    const operator = getOperatorContext(req);
    const tenantId = params['tenantId'];

    if (!tenantId) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'tenantId parameter is required.', code: 'MISSING_TENANT_ID' },
      });
      return;
    }

    const body = (await parseRequestBody(req)) as unknown as StartImpersonationPayload;

    try {
      const baseUrl = req.headers.host || 'localhost:3333';
      const result = ImpersonationDomainService.getInstance().startImpersonation(
        operator,
        tenantId,
        body,
        baseUrl,
      );
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, {
        success: false,
        error: { message: err.message || 'Failed to start tenant impersonation.', code: 'IMPERSONATION_FAILED' },
      });
    }
  }

  public async exitImpersonation(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    _params: Record<string, string>,
  ): Promise<void> {
    const operator = getOperatorContext(req);
    const body = (await parseRequestBody(req)) as unknown as ExitImpersonationPayload;

    try {
      const baseUrl = getBaseUrl(req);
      const result = ImpersonationDomainService.getInstance().exitImpersonation(
        operator,
        body,
        baseUrl,
      );
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, {
        success: false,
        error: { message: err.message || 'Failed to exit tenant impersonation.', code: 'EXIT_IMPERSONATION_FAILED' },
      });
    }
  }
}
