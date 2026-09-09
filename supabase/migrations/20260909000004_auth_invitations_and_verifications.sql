-- Migration: 20260909000004_auth_invitations_and_verifications.sql
-- Description: Establishes Global Unique Identity, Owner Self-Registration, Invitation Lifecycles, and Password Resets

-- 1. Enhance tenant_users with password authentication & email verification
ALTER TABLE tenant_users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Deduplicate any legacy seed entries to strictly enforce global 1-email-1-account invariant
UPDATE tenant_users 
SET email = 'investor+sembako@mitraretail.com' 
WHERE id = 'a0000003-0001-0000-0000-000000000002' AND email = 'investor@mitraretail.com';

-- Ensure email uniqueness within tenant_users
CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_tenant_users_lower_email 
ON tenant_users (LOWER(email)) 
WHERE email IS NOT NULL;

-- Ensure email uniqueness within platform_operators
CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_platform_operators_lower_email 
ON platform_operators (LOWER(email));

-- 2. Cross-Table Unique Email Invariant Trigger
CREATE OR REPLACE FUNCTION check_global_email_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'tenant_users' THEN
        IF NEW.email IS NOT NULL AND EXISTS (
            SELECT 1 FROM platform_operators WHERE LOWER(email) = LOWER(NEW.email)
        ) THEN
            RAISE EXCEPTION 'Email % is already registered as an Ashvin Labs Platform Operator. Global unique email invariant violated.', NEW.email;
        END IF;
    ELSIF TG_TABLE_NAME = 'platform_operators' THEN
        IF EXISTS (
            SELECT 1 FROM tenant_users WHERE LOWER(email) = LOWER(NEW.email)
        ) THEN
            RAISE EXCEPTION 'Email % is already registered as a Merchant Tenant User. Global unique email invariant violated.', NEW.email;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tenant_users_global_email ON tenant_users;
CREATE TRIGGER trg_tenant_users_global_email
BEFORE INSERT OR UPDATE OF email ON tenant_users
FOR EACH ROW EXECUTE FUNCTION check_global_email_uniqueness();

DROP TRIGGER IF EXISTS trg_platform_operators_global_email ON platform_operators;
CREATE TRIGGER trg_platform_operators_global_email
BEFORE INSERT OR UPDATE OF email ON platform_operators
FOR EACH ROW EXECUTE FUNCTION check_global_email_uniqueness();

-- 3. Tenant User Invitations (Staff Onboarding: Kasir, Gudang, Driver)
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    role VARCHAR(32) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES tenant_users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_invitations_tenant ON user_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(LOWER(email));

-- 4. Operator Invitations (Ashvin Labs Management Plane Onboarding)
CREATE TABLE IF NOT EXISTS operator_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    role VARCHAR(50) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES platform_operators(id),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operator_invitations_token ON operator_invitations(token);
CREATE INDEX IF NOT EXISTS idx_operator_invitations_email ON operator_invitations(LOWER(email));

-- 5. Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    user_type VARCHAR(32) NOT NULL, -- 'TENANT_USER' or 'PLATFORM_OPERATOR'
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_reset_tokens(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_reset_tokens(token_hash);

-- 6. Email Verifications
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    user_type VARCHAR(32) NOT NULL, -- 'TENANT_USER' or 'PLATFORM_OPERATOR'
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(LOWER(email));
