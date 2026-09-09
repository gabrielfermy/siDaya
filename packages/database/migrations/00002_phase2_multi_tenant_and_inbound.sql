-- ==============================================================================
-- Migration: 00002_phase2_multi_tenant_and_inbound.sql
-- Phase 2: Multi-Tenant Staff Permissions, Inbound Logistics & COGS Security RLS
-- ==============================================================================

-- 0. Ensure 'authenticated' role exists for local PostgreSQL development
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN 
    CREATE ROLE authenticated NOLOGIN; 
  END IF; 
END $$;

-- 1. Extend tenant_users with auth_user_id and granular permissions JSONB
ALTER TABLE tenant_users ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE tenant_users ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]'::JSONB;

CREATE INDEX IF NOT EXISTS idx_tenant_users_auth ON tenant_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);

-- 2. Enhanced RLS Policy for COGS Masking based on Granular Checkbox Permission
-- Cashiers/Drivers cannot query cost_price unless catalog:view_cogs permission is granted
DROP POLICY IF EXISTS cashier_mask_cogs ON products;
DROP POLICY IF EXISTS mask_cost_price ON products;

CREATE POLICY mask_cost_price ON products
  FOR SELECT
  TO public
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    AND (
      NULLIF(current_setting('app.current_user_role', true), '') = 'OWNER'
      OR current_setting('app.current_user_permissions', true) LIKE '%catalog:view_cogs%'
      OR cost_price IS NULL
    )
  );
