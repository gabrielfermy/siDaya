/**
 * @fileoverview End-to-End Verification Suite for Subdomain Routing & Operator Impersonation
 * @module Test:VerifySubdomainAndImpersonation
 * @description
 * Validates:
 * 1. Subdomain availability checking (reserved keywords, collision prevention)
 * 2. 30-Day alias creation and primary domain migration (Solution A)
 * 3. Centralized Gateway identity lookup and tenant redirection
 * 4. Ticket-bound operator tenant impersonation and audit logging
 * 5. Clean session termination and operator fleet return hook
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

import http from 'http';
import { SubdomainDomainService } from '../src/services/tenant/subdomain.service.js';
import { ImpersonationDomainService } from '../src/services/operator/impersonation.service.js';
import { PlatformOperatorRole } from '@sidaya/shared-types';

async function runSuite(): Promise<void> {
  console.log('===============================================================');
  console.log('🧪 RUNNING VERIFICATION: Subdomain Resolution & Impersonation');
  console.log('===============================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string): void {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failedTests++;
    }
  }

  const subdomainService = SubdomainDomainService.getInstance();
  const impersonationService = ImpersonationDomainService.getInstance();

  // Test 1: Reserved Subdomain Keyword Check
  console.log('--- TEST 1: Subdomain Validation & Reserved Keywords ---');
  const checkOps = subdomainService.checkSubdomainAvailability('ops');
  assert(checkOps.isReserved === true && checkOps.isAvailable === false, 'Keyword "ops" is strictly reserved');

  const checkAdmin = subdomainService.checkSubdomainAvailability('admin');
  assert(checkAdmin.isReserved === true && checkAdmin.isAvailable === false, 'Keyword "admin" is strictly reserved');

  const checkExisting = subdomainService.checkSubdomainAvailability('berasjaya');
  assert(checkExisting.isReserved === false && checkExisting.isAvailable === false, 'Existing subdomain "berasjaya" is unavailable');

  const checkAvailable = subdomainService.checkSubdomainAvailability('berasjuara');
  assert(checkAvailable.isReserved === false && checkAvailable.isAvailable === true, 'Subdomain "berasjuara" is available');

  // Test 2: Subdomain Update with 30-Day Alias (Solution A)
  console.log('\n--- TEST 2: Subdomain Migration & 30-Day Alias ---');
  const tenantId = 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
  const migrationResult = subdomainService.updateSubdomain(tenantId, 'berasjayabaru', 'sidaya.biz.id');
  
  assert(migrationResult.activeSubdomain === 'berasjayabaru', 'Primary subdomain updated to "berasjayabaru"');
  assert(migrationResult.aliasSubdomain === 'berasjaya', 'Old subdomain "berasjaya" retained as 30-day alias');
  assert(new Date(migrationResult.aliasExpiresAt) > new Date(), 'Alias expiration date set 30 days in future');

  const aliases = subdomainService.getAliases(tenantId);
  assert(aliases.some((a) => a.aliasSubdomain === 'berasjaya'), 'Alias list contains old subdomain');

  // Test 3: Centralized Gateway Identity Resolution
  console.log('\n--- TEST 3: Centralized Gateway Identity Lookup ---');
  const resolveResult = subdomainService.resolveTenantByEmail('budi@berasjaya.com', 'sidaya.biz.id');
  assert(resolveResult.tenantId === tenantId, 'Email resolved to correct tenantId');
  assert(resolveResult.subdomain === 'berasjayabaru', 'Resolved to active primary subdomain');
  assert(resolveResult.targetUrl === 'https://berasjayabaru.sidaya.biz.id/dashboard', 'Target URL points to tenant dashboard');

  // Test 4: Operator Tenant Impersonation (Break-Glass Ticket Binding)
  console.log('\n--- TEST 4: Ticket-Bound Impersonation & Audit Log ---');
  const operator = {
    id: 'a0000099-0001-0000-0000-000000000003',
    email: 'dina@ashvinlabs.com',
    role: PlatformOperatorRole.OPS_SUPPORT,
  };

  try {
    impersonationService.startImpersonation(operator, tenantId, {
      targetUserId: 'a0000001-0001-0000-0000-000000000001',
      ticketReference: '', // Missing ticket
      reason: 'Testing impersonation',
    });
    assert(false, 'Should reject impersonation without ticket');
  } catch (err: any) {
    assert(true, 'Rejected impersonation without ticket', err.message);
  }

  const impSession = impersonationService.startImpersonation(
    operator,
    tenantId,
    {
      targetUserId: 'a0000001-0001-0000-0000-000000000001',
      ticketReference: '#TICKET-8492',
      reason: 'Diagnosing stock reconciliation discrepancies in warehouse',
    },
    'localhost:3333',
  );

  assert(Boolean(impSession.impersonationToken), 'Generated valid scoped impersonation token');
  assert(impSession.sessionContext.operatorEmail === 'dina@ashvinlabs.com', 'Session context bound to operator');
  assert(impSession.sessionContext.ticketReference === '#TICKET-8492', 'Session context bound to support ticket');
  assert(impSession.redirectUrl.includes('impersonate_token='), 'Redirect URL includes impersonation token parameter');

  // Test 5: Validate Active Impersonation Session
  console.log('\n--- TEST 5: Impersonation Validation & Exit ---');
  const validated = impersonationService.validateImpersonationSession(impSession.impersonationToken);
  assert(validated !== null && validated.active === true, 'Session token successfully validated');

  const exitResult = impersonationService.exitImpersonation(operator, {
    impersonationToken: impSession.impersonationToken,
  });
  assert(exitResult.terminated === true, 'Impersonation session cleanly terminated');
  assert(exitResult.returnUrl.includes('/fleet'), 'Return URL directs operator back to Fleet view');

  const postExit = impersonationService.validateImpersonationSession(impSession.impersonationToken);
  assert(postExit === null, 'Terminated token cannot be re-used');

  const auditLogs = impersonationService.getAuditLogs();
  assert(auditLogs.some((l) => l.action === 'OPERATOR_IMPERSONATION_STARTED'), 'Audit log contains START event');
  assert(auditLogs.some((l) => l.action === 'OPERATOR_IMPERSONATION_ENDED'), 'Audit log contains END event');

  console.log('\n===============================================================');
  console.log(`🏁 SUITE COMPLETE: ${passedTests} passed, ${failedTests} failed`);
  console.log('===============================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal suite failure:', err);
  process.exit(1);
});
