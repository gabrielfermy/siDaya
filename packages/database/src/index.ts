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

/**
 * Builds SQL command to set PostgreSQL session variables for RLS evaluation
 */
export function buildSetTenantSessionSQL(context: TenantSessionContext): string {
  const statements: string[] = [
    `SET LOCAL app.current_tenant_id = '${context.tenantId}';`,
  ];

  if (context.userId) {
    statements.push(`SET LOCAL app.current_user_id = '${context.userId}';`);
  }
  if (context.userRole) {
    statements.push(`SET LOCAL app.current_user_role = '${context.userRole}';`);
  }
  if (context.userFullName) {
    statements.push(`SET LOCAL app.current_user_full_name = '${context.userFullName.replace(/'/g, "''")}';`);
  }
  if (context.vehiclePlate) {
    statements.push(`SET LOCAL app.current_user_vehicle_plate = '${context.vehiclePlate.replace(/'/g, "''")}';`);
  }

  return statements.join('\n');
}
