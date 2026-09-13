import {
  RegisterOwnerPayload,
  RegisterOwnerResult,
  InviteStaffPayload,
  UserInvitationRecord,
  AcceptStaffInvitePayload,
  ResetPasswordPayload,
} from '@sidaya/shared-types';
import {
  AuthenticatedUserSession,
} from './auth/auth-types';
import { StaffCatalogStore } from './auth/staff-catalog.store';
import { OwnerRegistrationService } from './auth/owner-registration.service';
import { StaffInviteService } from './auth/staff-invite.service';
import { PasswordResetService } from './auth/password-reset.service';
import { TokenAuthService } from './auth/token-auth.service';
import { EmailDispatchService } from './email-dispatch.service';

export * from './auth/auth-types';
export * from './auth/staff-catalog.store';
export * from './auth/owner-registration.service';
export * from './auth/staff-invite.service';
export * from './auth/password-reset.service';
export * from './auth/token-auth.service';

/**
 * Unified Facade for Auth & Multi-Tenant Domain Operations.
 * Decomposes authentication concerns into focused SRP domain services.
 */
export class AuthTenantDomainService {
  private store = StaffCatalogStore.getInstance();
  private ownerRegSvc: OwnerRegistrationService;
  private staffInviteSvc: StaffInviteService;
  private passwordResetSvc: PasswordResetService;
  private tokenAuthSvc: TokenAuthService;

  constructor(emailDispatch?: EmailDispatchService) {
    const emailSvc = emailDispatch || new EmailDispatchService();
    this.ownerRegSvc = new OwnerRegistrationService(this.store, emailSvc);
    this.staffInviteSvc = new StaffInviteService(this.store, emailSvc);
    this.passwordResetSvc = new PasswordResetService(this.store, emailSvc);
    this.tokenAuthSvc = new TokenAuthService(this.store);
  }

  public get staffCatalog() {
    return this.store.catalog;
  }

  public isEmailRegistered(email: string): boolean {
    return this.ownerRegSvc.isEmailRegistered(email);
  }

  public isSubdomainAvailable(subdomain: string): boolean {
    return this.ownerRegSvc.isSubdomainAvailable(subdomain);
  }

  public async login(identifier: string, credential?: string): Promise<AuthenticatedUserSession> {
    return this.tokenAuthSvc.login(identifier, credential);
  }

  public async registerOwner(payload: RegisterOwnerPayload, baseUrl?: string): Promise<RegisterOwnerResult> {
    return this.ownerRegSvc.registerOwner(payload, baseUrl);
  }

  public async inviteStaff(payload: InviteStaffPayload, baseUrl?: string): Promise<UserInvitationRecord> {
    return this.staffInviteSvc.inviteStaff(payload, baseUrl);
  }

  public async acceptStaffInvite(payload: AcceptStaffInvitePayload) {
    return this.staffInviteSvc.acceptStaffInvite(payload);
  }

  public async requestPasswordReset(
    email: string,
    userType: 'TENANT_USER' | 'PLATFORM_OPERATOR' = 'TENANT_USER',
    baseUrl?: string,
  ) {
    return this.passwordResetSvc.requestPasswordReset(email, userType, baseUrl);
  }

  public async confirmPasswordReset(payload: ResetPasswordPayload) {
    return this.passwordResetSvc.confirmPasswordReset(payload);
  }

  public verifyEmail(tokenOrOtp: string, email?: string) {
    return this.ownerRegSvc.verifyEmail(tokenOrOtp, email);
  }

  public getStaffByTenantId(tenantId: string) {
    return this.tokenAuthSvc.getStaffByTenantId(tenantId);
  }

  public setStaffPin(tenantId: string, staffId: string, pin: string) {
    return this.tokenAuthSvc.setStaffPin(tenantId, staffId, pin);
  }
}
