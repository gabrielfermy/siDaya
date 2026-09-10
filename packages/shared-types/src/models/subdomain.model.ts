/**
 * @fileoverview Subdomain Management & Centralized Authentication Data Contracts
 * @module Models:Subdomain
 * @description
 * Types, interfaces, and validation structures for Subdomain self-service,
 * 30-day alias routing, reserved keyword protection, and tenant identity resolution.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

export const RESERVED_SUBDOMAINS_LIST = [
  'ops', 'admin', 'api', 'auth', 'app', 'www', 'billing', 'support',
  'status', 'mail', 'gateway', 'portal', 'staging', 'prod', 'dev', 'static', 'assets'
] as const;

export type ReservedSubdomain = typeof RESERVED_SUBDOMAINS_LIST[number];

export interface CheckSubdomainQuery {
  slug: string;
}

export interface CheckSubdomainResult {
  slug: string;
  isAvailable: boolean;
  isReserved: boolean;
  reason?: string;
}

export interface UpdateSubdomainPayload {
  newSubdomain: string;
}

export interface TenantSubdomainAliasRecord {
  id: string;
  tenantId: string;
  aliasSubdomain: string;
  expiresAt: string;
  createdAt: string;
}

export interface UpdateSubdomainResult {
  tenantId: string;
  activeSubdomain: string;
  aliasSubdomain?: string;
  aliasExpiresAt?: string;
  primaryUrl: string;
}

export interface ResolveTenantQuery {
  email: string;
}

export interface ResolveTenantResult {
  userId: string;
  tenantId: string;
  subdomain: string;
  businessName: string;
  targetUrl: string;
}

export interface CustomDomainConfig {
  tenantId: string;
  customDomain: string;
  status: 'PENDING_DNS' | 'ACTIVE' | 'FAILED';
  cnameTarget: string;
  sslActive: boolean;
  verifiedAt?: string;
}
