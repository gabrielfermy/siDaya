-- Migration: 00003_phase2_platform_operator_control_plane.sql
-- Description: Creates Platform Operators and Immutable Operator Audit Logs for Ashvin Labs Control Plane

-- 1. Create platform_operators table
CREATE TABLE IF NOT EXISTS platform_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'SUPER_ADMIN', 'DEV_ENGINEER', 'OPS_SUPPORT', 'AUDIT_COMPLIANCE'
    permissions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_operators_email ON platform_operators(email);
CREATE INDEX IF NOT EXISTS idx_platform_operators_role ON platform_operators(role);

-- 2. Create platform_operator_audit_logs table
CREATE TABLE IF NOT EXISTS platform_operator_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES platform_operators(id),
    operator_email VARCHAR(255) NOT NULL,
    operator_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g. 'TENANT_SUBSCRIPTION_UPDATE', 'BREAKGLASS_DIAGNOSTIC_SESSION', 'USER_PIN_RESET'
    target_tenant_id UUID REFERENCES tenants(id),
    ticket_reference VARCHAR(64),
    metadata JSONB NOT NULL DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operator_audit_target ON platform_operator_audit_logs(target_tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_audit_operator ON platform_operator_audit_logs(operator_id, created_at DESC);

-- 3. Seed initial Ashvin Labs Operator Accounts
INSERT INTO platform_operators (id, auth_user_id, full_name, email, role, permissions, is_active)
VALUES
    (
        'a0000099-0001-0000-0000-000000000001',
        'a0000099-0001-0000-0000-000000000001',
        'Gabriel (CEO)',
        'gabriel@ashvinlabs.com',
        'SUPER_ADMIN',
        '["tenants:view", "tenants:manage_subscription", "tenants:breakglass", "system:telemetry", "system:audit", "users:support_reset"]'::jsonb,
        true
    ),
    (
        'a0000099-0001-0000-0000-000000000002',
        'a0000099-0001-0000-0000-000000000002',
        'Alex (Lead Developer)',
        'alex@ashvinlabs.com',
        'DEV_ENGINEER',
        '["tenants:view", "tenants:breakglass", "system:telemetry", "system:audit"]'::jsonb,
        true
    ),
    (
        'a0000099-0001-0000-0000-000000000003',
        'a0000099-0001-0000-0000-000000000003',
        'Dina (Customer Operations)',
        'dina@ashvinlabs.com',
        'OPS_SUPPORT',
        '["tenants:view", "users:support_reset", "system:audit"]'::jsonb,
        true
    )
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- 4. Seed initial audit log event
INSERT INTO platform_operator_audit_logs (id, operator_id, operator_email, operator_role, action, target_tenant_id, ticket_reference, metadata, ip_address)
VALUES
    (
        'a0000099-0002-0000-0000-000000000001',
        'a0000099-0001-0000-0000-000000000001',
        'gabriel@ashvinlabs.com',
        'SUPER_ADMIN',
        'PLATFORM_INITIALIZATION',
        'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
        'INIT-0001',
        '{"note": "Initial Control Plane deployment and tenant baseline provisioning"}'::jsonb,
        '127.0.0.1'
    )
ON CONFLICT (id) DO NOTHING;
