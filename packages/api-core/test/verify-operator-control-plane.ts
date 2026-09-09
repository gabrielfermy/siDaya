import assert from 'assert';

const API_BASE = 'http://localhost:4000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runVerification() {
  console.log('======================================================================');
  console.log('⚡ RUNNING ASHVIN LABS OPERATOR CONTROL PLANE & RBAC VERIFICATION SUITE');
  console.log('======================================================================\n');

  // 1. Healthcheck
  console.log('1️⃣ Checking API Core Server Health...');
  const health = await request('/health');
  assert.strictEqual(health.status, 200);
  assert.strictEqual(health.data.status, 'UP');
  console.log('   ✅ API Core is UP on port 4000.\n');

  // 2. Operator Login - Super Admin (Gabriel)
  console.log('2️⃣ Testing Operator Login: Gabriel (CEO / SUPER_ADMIN)...');
  const gabrielLogin = await request('/api/v1/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'gabriel@ashvinlabs.com' }),
  });
  assert.strictEqual(gabrielLogin.status, 200, 'Gabriel login must succeed');
  assert.strictEqual(gabrielLogin.data.success, true);
  const gabrielSession = gabrielLogin.data.data;
  assert.strictEqual(gabrielSession.role, 'SUPER_ADMIN');
  assert.strictEqual(gabrielSession.fullName, 'Gabriel (CEO)');
  assert.ok(gabrielSession.capabilities.includes('system:telemetry'));
  assert.ok(gabrielSession.capabilities.includes('tenants:breakglass'));
  assert.ok(gabrielSession.capabilities.includes('tenants:manage_subscription'));
  assert.ok(gabrielSession.sessionToken.startsWith('tok_admin_super_admin_'));
  console.log('   ✅ Gabriel authenticated with full SUPER_ADMIN control plane capabilities.\n');

  // 3. Operator Login - Customer Ops Support (Dina) & RBAC Isolation
  console.log('3️⃣ Testing Operator Login: Dina (OPS_SUPPORT) & Permission Boundaries...');
  const dinaLogin = await request('/api/v1/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dina@ashvinlabs.com' }),
  });
  assert.strictEqual(dinaLogin.status, 200, 'Dina login must succeed');
  const dinaSession = dinaLogin.data.data;
  assert.strictEqual(dinaSession.role, 'OPS_SUPPORT');
  assert.ok(dinaSession.capabilities.includes('tenants:view'));
  assert.ok(dinaSession.capabilities.includes('system:audit'));
  assert.ok(!dinaSession.capabilities.includes('tenants:breakglass'), 'OPS_SUPPORT must NOT have break-glass access');
  assert.ok(!dinaSession.capabilities.includes('system:telemetry'), 'OPS_SUPPORT must NOT access system telemetry');
  assert.ok(!dinaSession.capabilities.includes('tenants:manage_subscription'), 'OPS_SUPPORT must NOT modify subscriptions');
  console.log('   ✅ Dina authenticated with strict OPS_SUPPORT RBAC limits (no break-glass / deep metrics).\n');

  // 4. Platform Telemetry Endpoint
  console.log('4️⃣ Testing Aggregated Platform Telemetry (/api/v1/admin/telemetry)...');
  const telemetryRes = await request('/api/v1/admin/telemetry', {
    headers: {
      'X-Operator-Role': 'SUPER_ADMIN',
      'X-Operator-Email': 'gabriel@ashvinlabs.com',
    },
  });
  assert.strictEqual(telemetryRes.status, 200);
  const telemetry = telemetryRes.data.data;
  assert.ok(telemetry.totalPlatformGmvMonth > 0, 'Platform monthly GMV must be computed');
  assert.strictEqual(telemetry.activeTenantsCount, 2);
  assert.ok(telemetry.apiLatencyP95Ms < 50, 'p95 API latency must be healthy');
  assert.ok(telemetry.apiErrorRatePercent < 1.0, 'API error rate must be < 1%');
  assert.strictEqual(telemetry.healthyServicesCount, 4);
  console.log(`   ✅ Telemetry OK: GMV = Rp ${telemetry.totalPlatformGmvMonth.toLocaleString('id-ID')}, Latency = ${telemetry.apiLatencyP95Ms}ms, DB Pool = ${telemetry.dbConnectionPoolUsagePercent}%\n`);

  // 5. Tenant Fleet & Privacy Guardrail (UU PDP PII Redaction)
  console.log('5️⃣ Testing Tenant Fleet PII Masking: Super Admin vs Ops Support (UU PDP Guardrails)...');
  
  // 5a. Gabriel (SUPER_ADMIN) sees unmasked data
  const adminTenantsRes = await request('/api/v1/admin/tenants', {
    headers: {
      'X-Operator-Role': 'SUPER_ADMIN',
      'X-Operator-Email': 'gabriel@ashvinlabs.com',
    },
  });
  assert.strictEqual(adminTenantsRes.status, 200);
  assert.strictEqual(adminTenantsRes.data.metadata.piiMasked, false);
  const adminTenants = adminTenantsRes.data.data;
  const adminBerasJaya = adminTenants.find((t: any) => t.subdomain === 'berasjaya');
  assert.strictEqual(adminBerasJaya.ownerPhone, '+6281234567890', 'Super admin must see full phone');
  assert.strictEqual(adminBerasJaya.ownerName, 'Budi Santoso', 'Super admin must see full owner name');

  // 5b. Dina (OPS_SUPPORT) receives masked PII
  const opsTenantsRes = await request('/api/v1/admin/tenants', {
    headers: {
      'X-Operator-Role': 'OPS_SUPPORT',
      'X-Operator-Email': 'dina@ashvinlabs.com',
    },
  });
  assert.strictEqual(opsTenantsRes.status, 200);
  assert.strictEqual(opsTenantsRes.data.metadata.piiMasked, true, 'Metadata must flag PII as masked');
  const opsTenants = opsTenantsRes.data.data;
  const opsBerasJaya = opsTenants.find((t: any) => t.subdomain === 'berasjaya');
  assert.strictEqual(opsBerasJaya.ownerPhone, '+6281****7890', 'Customer contact phone MUST be masked for OPS_SUPPORT');
  assert.strictEqual(opsBerasJaya.ownerName, 'B*** S***', 'Owner name MUST be masked for OPS_SUPPORT');
  console.log('   ✅ PII Masking Verified: Super Admin gets full contact; Ops Support receives masked phone (+6281****7890) & masked name (B*** S***).\n');

  // 6. Tenant Subscription Tier Override & Audit Logging
  console.log('6️⃣ Testing Tenant Subscription Tier Override & Immutable Audit Logging...');
  const targetTenantId = 'd5c9f320-1942-493b-cd02-34b0df9f23e5'; // CV Sembako Nusantara Makmur
  const updateRes = await request(`/api/v1/admin/tenants/${targetTenantId}/subscription`, {
    method: 'PUT',
    headers: {
      'X-Operator-Role': 'SUPER_ADMIN',
      'X-Operator-Email': 'gabriel@ashvinlabs.com',
      'X-Operator-Id': 'a0000099-0001-0000-0000-000000000001',
    },
    body: JSON.stringify({
      tier: 'GROSIR_PRO',
      status: 'ACTIVE',
      reason: 'UPGRADE_ANNUAL_CONTRACT_AC-2026-09',
    }),
  });
  assert.strictEqual(updateRes.status, 200);
  const updatedTenant = updateRes.data.data;
  assert.strictEqual(updatedTenant.subscriptionTier, 'GROSIR_PRO');
  console.log(`   ✅ CV Sembako Nusantara Makmur successfully upgraded to GROSIR_PRO.`);

  // 7. Verify Audit Log was generated
  console.log('7️⃣ Verifying Immutable Operator Audit Logs (/api/v1/admin/audit-logs)...');
  const auditRes = await request('/api/v1/admin/audit-logs');
  assert.strictEqual(auditRes.status, 200);
  const auditLogs = auditRes.data.data;
  assert.ok(auditLogs.length >= 2, 'Must have at least initial log and subscription update log');
  const subUpdateLog = auditLogs.find((l: any) => l.action === 'TENANT_SUBSCRIPTION_UPDATE');
  assert.ok(subUpdateLog, 'Subscription update audit record must exist');
  assert.strictEqual(subUpdateLog.operatorEmail, 'gabriel@ashvinlabs.com');
  assert.strictEqual(subUpdateLog.targetTenantId, targetTenantId);
  assert.ok(['STARTER_FREE', 'GROSIR_PRO'].includes(subUpdateLog.metadata.previousTier), 'Previous tier must be STARTER_FREE or GROSIR_PRO');
  assert.strictEqual(subUpdateLog.metadata.newTier, 'GROSIR_PRO');
  console.log(`   ✅ Audit log confirmed: Action=${subUpdateLog.action} by ${subUpdateLog.operatorEmail} (Ticket: ${subUpdateLog.ticketReference}).\n`);

  // 8. Break-Glass Diagnostic Session
  console.log('8️⃣ Testing Break-Glass Diagnostic Session (UU PDP Compliance & Ticket Linking)...');
  const breakglassRes = await request(`/api/v1/admin/tenants/${targetTenantId}/breakglass`, {
    method: 'POST',
    headers: {
      'X-Operator-Role': 'SUPER_ADMIN',
      'X-Operator-Email': 'gabriel@ashvinlabs.com',
      'X-Operator-Id': 'a0000099-0001-0000-0000-000000000001',
    },
    body: JSON.stringify({
      ticketReference: 'INC-9482',
      reason: 'Investigate FIFO lot allocation synchronization lag reported by warehouse supervisor',
    }),
  });
  assert.strictEqual(breakglassRes.status, 200);
  const bgData = breakglassRes.data.data;
  assert.ok(bgData.diagnosticToken.startsWith('tok_bg_super_admin_'));
  assert.ok(bgData.expiresAt);
  assert.ok(bgData.auditLogId);

  // Check audit log for breakglass session
  const postBgAuditRes = await request('/api/v1/admin/audit-logs');
  const latestLog = postBgAuditRes.data.data[0];
  assert.strictEqual(latestLog.action, 'BREAKGLASS_DIAGNOSTIC_SESSION');
  assert.strictEqual(latestLog.ticketReference, 'INC-9482');
  assert.strictEqual(latestLog.metadata.reason, 'Investigate FIFO lot allocation synchronization lag reported by warehouse supervisor');
  console.log(`   ✅ Break-glass token generated: ${bgData.diagnosticToken}. Logged to audit trail (Ticket: INC-9482).\n`);

  console.log('======================================================================');
  console.log('🎉 ALL 8 OPERATOR CONTROL PLANE & SUPER ADMIN TESTS PASSED PERFECTLY!');
  console.log('======================================================================\n');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
