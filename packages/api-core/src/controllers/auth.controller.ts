import http from 'http';
import { AuthTenantDomainService } from '../services/auth-tenant.service';
import { PlatformAdminDomainService } from '../services/platform-admin.service';
import { sendJson } from '../middleware/cors.middleware';
import { parseRequestBody } from '../middleware/body-parser.middleware';
import { getBaseUrl } from '../middleware/operator-context.middleware';
import {
  RegisterOwnerPayload,
  InviteStaffPayload,
  AcceptStaffInvitePayload,
  ResetPasswordPayload,
} from '@sidaya/shared-types';
import { SubdomainDomainService } from '../services/tenant/subdomain.service.js';

export class AuthController {
  constructor(
    private authService: AuthTenantDomainService,
    private platformAdminService: PlatformAdminDomainService,
  ) {}

  public async login(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = await parseRequestBody(req);
    const identifier = (body['email'] || body['phoneNumber'] || body['identifier']) as string;
    const credential = body['password'] as string | undefined;

    if (!identifier) {
      sendJson(res, 400, { success: false, error: { message: 'Email atau Nomor HP harus diisi.' } });
      return;
    }

    try {
      const session = await this.authService.login(identifier, credential);
      sendJson(res, 200, { success: true, data: session });
    } catch (err: any) {
      sendJson(res, 401, { success: false, error: { message: err.message || 'Login gagal.' } });
    }
  }

  public async registerOwner(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = (await parseRequestBody(req)) as unknown as RegisterOwnerPayload;
    if (!body.email || !body.businessName || !body.ownerName || !body.password) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Nama Bisnis, Nama Pemilik, Email, dan Kata Sandi wajib diisi.' },
      });
      return;
    }

    if (this.platformAdminService.isOperatorEmailRegistered(body.email)) {
      sendJson(res, 409, {
        success: false,
        error: { message: `Email '${body.email}' sudah terdaftar sebagai Ashvin Labs Platform Operator.` },
      });
      return;
    }

    try {
      const baseUrl = getBaseUrl(req);
      const result = await this.authService.registerOwner(body, baseUrl);
      sendJson(res, 201, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Registrasi gagal.' } });
    }
  }

  public async inviteStaff(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = (await parseRequestBody(req)) as unknown as InviteStaffPayload;
    if (!body.tenantId || !body.email || !body.fullName || !body.role) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Tenant ID, Email, Nama Lengkap, dan Peran wajib diisi.' },
      });
      return;
    }

    try {
      const baseUrl = getBaseUrl(req);
      const invite = await this.authService.inviteStaff(body, baseUrl);
      sendJson(res, 201, {
        success: true,
        data: invite,
      });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Gagal mengundang staf.' } });
    }
  }

  public async acceptStaffInvite(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = (await parseRequestBody(req)) as unknown as AcceptStaffInvitePayload;
    if (!body.token || !body.password) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Token dan Kata Sandi wajib diisi.' },
      });
      return;
    }

    try {
      const result = await this.authService.acceptStaffInvite(body);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Gagal menerima undangan.' } });
    }
  }

  public async requestPasswordReset(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = await parseRequestBody(req);
    const email = body['email'] as string;
    const userType = (body['userType'] as 'TENANT_USER' | 'PLATFORM_OPERATOR') || 'TENANT_USER';

    if (!email) {
      sendJson(res, 400, { success: false, error: { message: 'Email wajib diisi.' } });
      return;
    }

    try {
      const baseUrl = getBaseUrl(req);
      const result = await this.authService.requestPasswordReset(email, userType, baseUrl);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Permintaan reset gagal.' } });
    }
  }

  public async confirmPasswordReset(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = (await parseRequestBody(req)) as unknown as ResetPasswordPayload;
    if (!body.token || !body.newPassword) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Token dan kata sandi baru wajib diisi.' },
      });
      return;
    }

    try {
      const result = await this.authService.confirmPasswordReset(body);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Konfirmasi reset gagal.' } });
    }
  }

  public async getTenantStaff(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    params: Record<string, string>,
  ): Promise<void> {
    const tenantId = params['tenantId'];
    if (!tenantId) {
      sendJson(res, 400, { success: false, error: { message: 'Tenant ID is required.' } });
      return;
    }
    const staff = this.authService.getStaffByTenantId(tenantId);
    sendJson(res, 200, { success: true, data: staff });
  }

  public async setStaffPin(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    params: Record<string, string>,
  ): Promise<void> {
    const tenantId = params['tenantId'];
    const staffId = params['staffId'];
    const body = await parseRequestBody(req);
    const pin = body['pin'] as string;

    if (!tenantId || !staffId || !pin) {
      sendJson(res, 400, { success: false, error: { message: 'Tenant ID, Staff ID, dan PIN wajib diisi.' } });
      return;
    }

    try {
      const result = this.authService.setStaffPin(tenantId, staffId, pin);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: { message: err.message || 'Gagal mengatur PIN.' } });
    }
  }

  public async resolveTenant(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    _params: Record<string, string>,
    query: Record<string, string>,
  ): Promise<void> {
    const email = query['email'] || '';
    if (!email) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'Query parameter "email" is required.', code: 'MISSING_EMAIL' },
      });
      return;
    }

    try {
      const result = SubdomainDomainService.getInstance().resolveTenantByEmail(email);
      sendJson(res, 200, { success: true, data: result });
    } catch (err: any) {
      sendJson(res, 404, {
        success: false,
        error: { message: err.message || 'Tenant resolution failed.', code: 'RESOLVE_FAILED' },
      });
    }
  }
}
