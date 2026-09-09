import { SubscriptionTier } from '../enums/subscription-tiers.enum.js';
import { UserRole } from '../enums/roles.enum.js';
import { PlatformOperatorRole } from '../enums/operator-roles.enum.js';

export interface RegisterOwnerPayload {
  businessName: string;
  subdomain: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address?: string;
  subscriptionTier?: SubscriptionTier;
}

export interface RegisterOwnerResult {
  tenantId: string;
  businessName: string;
  subdomain: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole.OWNER;
  isEmailVerified: boolean;
  verificationToken?: string;
  message: string;
}

export interface InviteStaffPayload {
  tenantId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  invitedByUserId: string;
}

export interface UserInvitationRecord {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface AcceptStaffInvitePayload {
  token: string;
  password: string;
  pin?: string;
}

export interface InviteOperatorPayload {
  email: string;
  fullName: string;
  phoneNumber: string;
  role: PlatformOperatorRole;
  invitedByOperatorId: string;
}

export interface OperatorInvitationRecord {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: PlatformOperatorRole;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface AcceptOperatorInvitePayload {
  token: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  token: string;
}

/**
 * Industry-standard password policy validator:
 * - At least 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[]; score: number } {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    errors.push('Kata sandi harus minimal 8 karakter.');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Kata sandi harus mengandung minimal 1 huruf besar (A-Z).');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Kata sandi harus mengandung minimal 1 huruf kecil (a-z).');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Kata sandi harus mengandung minimal 1 angka (0-9).');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Kata sandi harus mengandung minimal 1 karakter spesial (!@#$%^&* dll).');
  } else {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score, // 0 to 5
  };
}
