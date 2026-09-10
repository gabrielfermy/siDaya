/**
 * @fileoverview Subdomain Management & Centralized Identity Resolution Service
 * @module Services:Tenant:Subdomain
 * @description
 * Handles real-time subdomain slug validation, reserved keyword filtering,
 * 30-day alias registration (Solution A: HTTP 301 Permanent Redirect),
 * and centralized login identity lookup for root domain routing.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import {
  CheckSubdomainResult,
  UpdateSubdomainResult,
  ResolveTenantResult,
  TenantSubdomainAliasRecord,
  CustomDomainConfig,
  RESERVED_SUBDOMAINS_LIST,
} from '@sidaya/shared-types';
import { StaffCatalogStore } from '../auth/staff-catalog.store.js';

export interface TenantSubdomainState {
  tenantId: string;
  businessName: string;
  subdomain: string;
  customDomain?: string;
  aliases: TenantSubdomainAliasRecord[];
}

export class SubdomainDomainService {
  private static instance: SubdomainDomainService;
  private staffStore = StaffCatalogStore.getInstance();

  private tenantSubdomains: Map<string, TenantSubdomainState> = new Map([
    [
      'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
      {
        tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        businessName: 'Toko Grosir Beras Jaya Bersama',
        subdomain: 'berasjaya',
        aliases: [
          {
            id: 'alias_001',
            tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
            aliasSubdomain: 'berasjaya-lama',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ],
    [
      'd5c9f320-1942-493b-cd02-34b0df9f23e5',
      {
        tenantId: 'd5c9f320-1942-493b-cd02-34b0df9f23e5',
        businessName: 'CV Sembako Nusantara Makmur',
        subdomain: 'sembakonusantara',
        aliases: [],
      },
    ],
  ]);

  public static getInstance(): SubdomainDomainService {
    if (!SubdomainDomainService.instance) {
      SubdomainDomainService.instance = new SubdomainDomainService();
    }
    return SubdomainDomainService.instance;
  }

  /**
   * Checks whether a proposed subdomain slug is valid, available, and not reserved
   */
  public checkSubdomainAvailability(rawSlug: string): CheckSubdomainResult {
    const slug = (rawSlug || '').trim().toLowerCase();

    if (!slug || slug.length < 3) {
      return {
        slug,
        isAvailable: false,
        isReserved: false,
        reason: 'Subdomain must be at least 3 characters long',
      };
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return {
        slug,
        isAvailable: false,
        isReserved: false,
        reason: 'Subdomain can only contain lowercase alphanumeric characters and hyphens',
      };
    }

    if (RESERVED_SUBDOMAINS_LIST.includes(slug as any)) {
      return {
        slug,
        isAvailable: false,
        isReserved: true,
        reason: `Subdomain "${slug}" is a reserved system keyword and cannot be claimed.`,
      };
    }

    // Check active tenant subdomains
    for (const record of this.tenantSubdomains.values()) {
      if (record.subdomain.toLowerCase() === slug) {
        return {
          slug,
          isAvailable: false,
          isReserved: false,
          reason: `Subdomain "${slug}" is already registered to an active workspace.`,
        };
      }
      // Check aliases
      if (record.aliases.some((a) => a.aliasSubdomain.toLowerCase() === slug && new Date(a.expiresAt) > new Date())) {
        return {
          slug,
          isAvailable: false,
          isReserved: false,
          reason: `Subdomain "${slug}" is currently reserved under an active 30-day alias.`,
        };
      }
    }

    return {
      slug,
      isAvailable: true,
      isReserved: false,
    };
  }

  /**
   * Updates tenant primary subdomain and creates 30-day alias for old subdomain
   */
  public updateSubdomain(tenantId: string, rawNewSubdomain: string, baseUrl = 'sidaya.biz.id'): UpdateSubdomainResult {
    const check = this.checkSubdomainAvailability(rawNewSubdomain);
    if (!check.isAvailable) {
      throw new Error(check.reason || 'Requested subdomain is unavailable.');
    }

    const state = this.tenantSubdomains.get(tenantId);
    if (!state) {
      throw new Error(`Tenant with ID ${tenantId} not found.`);
    }

    const oldSubdomain = state.subdomain;
    const newSubdomain = rawNewSubdomain.trim().toLowerCase();
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Register 30-day alias for old subdomain
    state.aliases.unshift({
      id: `alias_${Date.now()}`,
      tenantId,
      aliasSubdomain: oldSubdomain,
      expiresAt: expiryDate,
      createdAt: new Date().toISOString(),
    });

    state.subdomain = newSubdomain;

    return {
      tenantId,
      activeSubdomain: newSubdomain,
      aliasSubdomain: oldSubdomain,
      aliasExpiresAt: expiryDate,
      primaryUrl: `https://${newSubdomain}.${baseUrl}`,
    };
  }

  /**
   * Resolves tenant information and subdomain for user email at Centralized Gateway Login
   */
  public resolveTenantByEmail(email: string, baseUrl = 'sidaya.biz.id'): ResolveTenantResult {
    const cleanEmail = (email || '').trim().toLowerCase();
    const staffUser = this.staffStore.catalog.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!staffUser) {
      throw new Error(`No account found registered with email ${cleanEmail}.`);
    }

    const tenantId = staffUser.tenants[0]?.tenantId || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
    const state = this.tenantSubdomains.get(tenantId) || {
      tenantId,
      businessName: staffUser.tenants[0]?.businessName || 'Toko Grosir Beras Jaya Bersama',
      subdomain: staffUser.tenants[0]?.subdomain || 'berasjaya',
      aliases: [],
    };

    return {
      userId: staffUser.userId,
      tenantId,
      subdomain: state.subdomain,
      businessName: state.businessName,
      targetUrl: `https://${state.subdomain}.${baseUrl}/dashboard`,
    };
  }

  /**
   * Retrieves active aliases for tenant
   */
  public getAliases(tenantId: string): TenantSubdomainAliasRecord[] {
    const state = this.tenantSubdomains.get(tenantId);
    return state ? state.aliases : [];
  }

  /**
   * Registers custom domain (Solution B - PRO Tier)
   */
  public registerCustomDomain(tenantId: string, customDomain: string): CustomDomainConfig {
    const cleanDomain = customDomain.trim().toLowerCase();
    const state = this.tenantSubdomains.get(tenantId);
    if (!state) {
      throw new Error(`Tenant with ID ${tenantId} not found.`);
    }

    state.customDomain = cleanDomain;

    return {
      tenantId,
      customDomain: cleanDomain,
      status: 'ACTIVE',
      cnameTarget: 'cname.sidaya.biz.id',
      sslActive: true,
      verifiedAt: new Date().toISOString(),
    };
  }
}
