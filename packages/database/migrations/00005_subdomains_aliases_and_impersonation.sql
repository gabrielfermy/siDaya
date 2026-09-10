-- Migration: 00005_subdomains_aliases_and_impersonation.sql
-- Description: Subdomain Multi-Tenancy, 30-Day Alias Routing, Reserved Keyword Enforcement, and Impersonation Audit Enhancements

-- 1. Enhance tenants with subdomain and custom_domain
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS subdomain VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) UNIQUE;

-- Backfill default subdomains for seeded tenants
UPDATE tenants SET subdomain = 'berasjaya' WHERE id = 'a0000001-0000-0000-0000-000000000001' AND subdomain IS NULL;
UPDATE tenants SET subdomain = 'tanahabang' WHERE id = 'a0000002-0000-0000-0000-000000000001' AND subdomain IS NULL;
UPDATE tenants SET subdomain = 'sembakonusantara' WHERE id = 'a0000003-0000-0000-0000-000000000001' AND subdomain IS NULL;

-- Index lower-cased subdomains
CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_tenants_lower_subdomain ON tenants (LOWER(subdomain)) WHERE subdomain IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_tenants_lower_custom_domain ON tenants (LOWER(custom_domain)) WHERE custom_domain IS NOT NULL;

-- 2. 30-Day Subdomain Aliases Table (Solution A: HTTP 301 Permanent Redirect)
CREATE TABLE IF NOT EXISTS tenant_subdomain_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    alias_subdomain VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_subdomain_aliases_lower ON tenant_subdomain_aliases (LOWER(alias_subdomain));
CREATE INDEX IF NOT EXISTS idx_subdomain_aliases_tenant ON tenant_subdomain_aliases (tenant_id, expires_at);

-- 3. Reserved Subdomain Keywords Check Trigger
CREATE OR REPLACE FUNCTION check_reserved_subdomains()
RETURNS TRIGGER AS $$
DECLARE
    reserved_list TEXT[] := ARRAY[
        'ops', 'admin', 'api', 'auth', 'app', 'www', 'billing', 'support',
        'status', 'mail', 'gateway', 'portal', 'staging', 'prod', 'dev', 'static', 'assets'
    ];
BEGIN
    IF LOWER(NEW.subdomain) = ANY(reserved_list) THEN
        RAISE EXCEPTION 'Subdomain "%" is a reserved platform keyword and cannot be claimed.', NEW.subdomain;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tenants_reserved_subdomain ON tenants;
CREATE TRIGGER trg_tenants_reserved_subdomain
BEFORE INSERT OR UPDATE OF subdomain ON tenants
FOR EACH ROW EXECUTE FUNCTION check_reserved_subdomains();

DROP TRIGGER IF EXISTS trg_subdomain_aliases_reserved ON tenant_subdomain_aliases;
CREATE TRIGGER trg_subdomain_aliases_reserved
BEFORE INSERT OR UPDATE OF alias_subdomain ON tenant_subdomain_aliases
FOR EACH ROW EXECUTE FUNCTION check_reserved_subdomains();

-- 4. Impersonation Audit Columns on platform_operator_audit_logs
ALTER TABLE platform_operator_audit_logs
ADD COLUMN IF NOT EXISTS impersonated_user_id UUID REFERENCES tenant_users(id),
ADD COLUMN IF NOT EXISTS reason TEXT;

-- 5. Future Multi-Store Baseline: Decoupled Tenant Memberships Table (ADR-16)
CREATE TABLE IF NOT EXISTS tenant_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tenant_users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_tenant_membership UNIQUE (user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user ON tenant_memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant ON tenant_memberships (tenant_id);

-- Seed initial memberships from tenant_users
INSERT INTO tenant_memberships (user_id, tenant_id, role, status, permissions)
SELECT id, tenant_id, role, 'ACTIVE', permissions
FROM tenant_users
ON CONFLICT (user_id, tenant_id) DO NOTHING;
