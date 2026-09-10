import http from 'http';
import { PlatformOperatorRole } from '@sidaya/shared-types';

export interface OperatorContext {
  id: string;
  email: string;
  role: PlatformOperatorRole;
}

export function getOperatorContext(req: http.IncomingMessage): OperatorContext {
  const roleHeader = ((req.headers['x-operator-role'] as string) || '').toUpperCase();
  const emailHeader = req.headers['x-operator-email'] as string;
  const idHeader = req.headers['x-operator-id'] as string;
  const authHeader = ((req.headers['authorization'] as string) || '').toLowerCase();

  let role: PlatformOperatorRole = PlatformOperatorRole.SUPER_ADMIN;
  let email = emailHeader || 'gabriel@ashvinlabs.com';
  let id = idHeader || 'a0000099-0001-0000-0000-000000000001';

  if (roleHeader && Object.values(PlatformOperatorRole).includes(roleHeader as PlatformOperatorRole)) {
    role = roleHeader as PlatformOperatorRole;
  } else if (authHeader) {
    if (authHeader.includes('ops_support')) {
      role = PlatformOperatorRole.OPS_SUPPORT;
      email = emailHeader || 'dina@ashvinlabs.com';
      id = idHeader || 'a0000099-0001-0000-0000-000000000003';
    } else if (authHeader.includes('dev_engineer')) {
      role = PlatformOperatorRole.DEV_ENGINEER;
      email = emailHeader || 'alex@ashvinlabs.com';
      id = idHeader || 'a0000099-0001-0000-0000-000000000002';
    }
  }

  return { id, email, role };
}

export function getBaseUrl(req: http.IncomingMessage, defaultPort = 3333): string {
  const host = req.headers['host'] || `localhost:${defaultPort}`;
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${host}`;
}
