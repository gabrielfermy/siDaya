/**
 * @sidaya/database
 * Core schema definitions, SQL migration constants, and tenancy session utilities.
 */

export const DATABASE_MIGRATIONS = [
  '00001_initial_schema.sql',
] as const;

export interface TenantSessionContext {
  tenantId: string;
  userId?: string | undefined;
  userRole?: string | undefined;
  userFullName?: string | undefined;
  vehiclePlate?: string | undefined;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROLE_REGEX = /^[A-Z0-9_]{1,32}$/i;

function sanitizeString(val: string): string {
  return val.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

/**
 * Builds SQL command to set PostgreSQL session variables for RLS evaluation.
 * Enforces strict UUID validation and parameterized sanitization to eliminate SQL injection.
 */
export function buildSetTenantSessionSQL(context: TenantSessionContext): string {
  if (!context.tenantId || !UUID_REGEX.test(context.tenantId.trim())) {
    throw new Error(`Security Exception: Invalid Tenant ID format '${context.tenantId}'. Must be a valid UUID.`);
  }

  const cleanTenantId = context.tenantId.trim().toLowerCase();
  const statements: string[] = [
    `SET LOCAL app.current_tenant_id = '${cleanTenantId}';`,
  ];

  if (context.userId) {
    if (!UUID_REGEX.test(context.userId.trim())) {
      throw new Error(`Security Exception: Invalid User ID format '${context.userId}'. Must be a valid UUID.`);
    }
    statements.push(`SET LOCAL app.current_user_id = '${context.userId.trim().toLowerCase()}';`);
  }

  if (context.userRole) {
    if (!ROLE_REGEX.test(context.userRole.trim())) {
      throw new Error(`Security Exception: Invalid User Role format '${context.userRole}'.`);
    }
    statements.push(`SET LOCAL app.current_user_role = '${context.userRole.trim().toUpperCase()}';`);
  }

  if (context.userFullName) {
    statements.push(`SET LOCAL app.current_user_full_name = '${sanitizeString(context.userFullName)}';`);
  }

  if (context.vehiclePlate) {
    statements.push(`SET LOCAL app.current_user_vehicle_plate = '${sanitizeString(context.vehiclePlate)}';`);
  }

  return statements.join('\n');
}

