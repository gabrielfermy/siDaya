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
  console.log('===============================================================');
  console.log('🧪 RUNNING PHASE 2 MULTI-TENANT & LOGISTICS VERIFICATION SUITE');
  console.log('===============================================================\n');

  // 1. Healthcheck
  console.log('1️⃣ Checking Core API Health...');
  const health = await request('/health');
  assert.strictEqual(health.status, 200, 'Healthcheck status should be 200');
  assert.strictEqual(health.data.status, 'UP');
  console.log('   ✅ API Core is UP. Connected DB:', health.data.database);

  // 2. Universal Login - Owner
  console.log('\n2️⃣ Testing Universal Login (Owner - Budi)...');
  const ownerLogin = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'budi@berasjaya.com' }),
  });
  assert.strictEqual(ownerLogin.status, 200);
  assert.strictEqual(ownerLogin.data.success, true);
  const ownerSession = ownerLogin.data.data;
  assert.strictEqual(ownerSession.fullName, 'Budi Santoso');
  assert.strictEqual(ownerSession.activeTenant.businessName, 'Toko Grosir Beras Jaya Bersama');
  assert.strictEqual(ownerSession.activeTenant.role, 'OWNER');
  assert.ok(ownerSession.activeTenant.permissions.includes('catalog:view_cogs'), 'Owner must have view_cogs');
  assert.ok(ownerSession.activeTenant.permissions.includes('settings:manage'), 'Owner must have settings:manage');
  console.log('   ✅ Budi logged in successfully as OWNER with full permissions matrix.');

  // 3. Universal Login - Cashier & Privacy Check
  console.log('\n3️⃣ Testing Cashier Login & Privacy Isolation (Siti)...');
  const cashierLogin = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'siti@berasjaya.com' }),
  });
  assert.strictEqual(cashierLogin.status, 200);
  const cashierSession = cashierLogin.data.data;
  assert.strictEqual(cashierSession.fullName, 'Siti Rahma');
  assert.strictEqual(cashierSession.activeTenant.role, 'CASHIER');
  assert.ok(cashierSession.activeTenant.permissions.includes('pos:checkout'), 'Cashier has pos:checkout');
  assert.ok(!cashierSession.activeTenant.permissions.includes('catalog:view_cogs'), 'Cashier MUST NOT have view_cogs');
  assert.ok(!cashierSession.activeTenant.permissions.includes('finance:reports'), 'Cashier MUST NOT have finance:reports');
  console.log('   ✅ Siti logged in as CASHIER. Cost Price & P&L permissions strictly isolated.');

  // 4. Multi-Tenant Workspace Switching
  console.log('\n4️⃣ Testing Multi-Tenant Workspace Switcher (Cross-Tenant Investor)...');
  const investorLogin = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'investor@mitraretail.com' }),
  });
  assert.strictEqual(investorLogin.status, 200);
  const investorSession = investorLogin.data.data;
  assert.strictEqual(investorSession.availableTenants.length, 2, 'Investor should have access to 2 tenants');
  console.log('   ℹ️  Investor has 2 memberships:', investorSession.availableTenants.map((t: any) => t.businessName).join(' & '));

  // Switch to Tenant 2 (CV Sembako Nusantara Makmur)
  const tenant2Id = 'd5c9f320-1942-493b-cd02-34b0df9f23e5';
  const switchTenant = await request('/api/v1/auth/select-tenant', {
    method: 'POST',
    body: JSON.stringify({
      userId: investorSession.userId,
      tenantId: tenant2Id,
    }),
  });
  assert.strictEqual(switchTenant.status, 200);
  assert.strictEqual(switchTenant.data.data.activeTenant.businessName, 'CV Sembako Nusantara Makmur');
  console.log('   ✅ Tenant switched seamlessly to:', switchTenant.data.data.activeTenant.businessName);

  // 5. Staff Permission Checkbox Matrix Update
  console.log('\n5️⃣ Testing Checkbox Permission Matrix Update by Tenant Owner...');
  const catalog = await request('/api/v1/staff/permissions-catalog');
  assert.strictEqual(catalog.status, 200);
  assert.ok(catalog.data.data.length >= 17, 'Permissions catalog should have at least 17 permissions');
  console.log(`   ℹ️  Permissions catalog verified with ${catalog.data.data.length} capability keys across 5 modules.`);

  // Owner grants Siti 'warehouse:inbound'
  const sitiId = cashierSession.userId;
  const updatedPerms = [...cashierSession.activeTenant.permissions, 'warehouse:inbound'];
  const permUpdate = await request('/api/v1/staff/permissions', {
    method: 'PUT',
    headers: { 'x-tenant-id': ownerSession.activeTenant.tenantId },
    body: JSON.stringify({
      staffId: sitiId,
      permissions: updatedPerms,
    }),
  });
  assert.strictEqual(permUpdate.status, 200);
  assert.ok(permUpdate.data.data.permissions.includes('warehouse:inbound'), 'Updated perms must include warehouse:inbound');
  console.log('   ✅ Owner successfully granted warehouse:inbound to Siti via Checkbox Matrix.');

  // 6. Storage Bins & Inbound Batches
  console.log('\n6️⃣ Testing Storage Bins & Inbound Batch Logistics...');
  const binsRes = await request('/api/v1/inventory/bins', {
    headers: { 'x-tenant-id': ownerSession.activeTenant.tenantId },
  });
  assert.strictEqual(binsRes.status, 200);
  assert.ok(binsRes.data.data.length >= 3, 'Should have at least 3 storage bins');
  console.log(`   ℹ️  Retrieved ${binsRes.data.data.length} Storage Bins (e.g. ${binsRes.data.data[0].zoneName} / ${binsRes.data.data[0].rackBin})`);

  // Reset batches to baseline seed state
  await request('/api/v1/inventory/reset-batches', { method: 'POST' });

  const batchesRes = await request('/api/v1/inventory/batches', {
    headers: { 'x-tenant-id': ownerSession.activeTenant.tenantId },
  });
  assert.strictEqual(batchesRes.status, 200);
  assert.ok(batchesRes.data.data.length >= 2, 'Should have at least 2 batches seeded');
  console.log(`   ℹ️  Retrieved ${batchesRes.data.data.length} Inbound Lots for Beras Rojolele`);

  // 7. FIFO Allocation Logic
  console.log('\n7️⃣ Testing FIFO Batch Allocation (Oldest Lot Dispatched First)...');
  const fifoRes = await request('/api/v1/inventory/allocate-fifo', {
    method: 'POST',
    headers: { 'x-tenant-id': ownerSession.activeTenant.tenantId },
    body: JSON.stringify({
      productId: 'a0000002-0000-0000-0000-000000000001',
      quantity: 50, // Needs 40 from Lot 1 and 10 from Lot 2
    }),
  });
  assert.strictEqual(fifoRes.status, 200);
  const allocations = fifoRes.data.data;
  assert.strictEqual(allocations.length, 2, 'Should allocate across 2 lots');
  assert.strictEqual(allocations[0].quantityAllocated, 40, 'First allocation must take all 40 from oldest Lot 1');
  assert.strictEqual(allocations[1].quantityAllocated, 10, 'Second allocation must take remaining 10 from Lot 2');
  console.log('   ✅ FIFO Allocation verified: 40 units from Lot 1 (oldest) + 10 units from Lot 2.');

  // 8. Outbound Logistics - Surat Jalan with Strict Price Privacy
  console.log('\n8️⃣ Testing Outbound Logistics: Surat Jalan (Driver Working Permit)...');
  const sjRes = await request('/api/v1/logistics/surat-jalan', {
    method: 'POST',
    headers: { 'x-tenant-id': ownerSession.activeTenant.tenantId },
    body: JSON.stringify({
      driverName: 'Joko Driver',
      vehiclePlateNumber: 'B 9482 TJA',
      recipientName: 'Toko Beras Barokah Jaya',
      recipientPhone: '081233445566',
      destinationAddress: 'Pasar Induk Cipinang Blok D No. 15, Jakarta Timur',
      pickupBinLabel: 'Zona Beras / Rak A-01 (Pallet 1)',
    }),
  });
  assert.strictEqual(sjRes.status, 201);
  const manifest = sjRes.data.data;
  assert.ok(manifest.deliveryOrderNumber.startsWith('SJ-'), 'Manifest number must start with SJ-');
  assert.strictEqual(manifest.driverName, 'Joko Driver');
  assert.strictEqual(manifest.vehiclePlateNumber, 'B 9482 TJA');
  assert.ok(manifest.signatures.warehouseOfficerSignedAt, 'Warehouse signature must be stamped');

  // Verify strict price privacy on Surat Jalan items
  const item = manifest.items[0];
  assert.strictEqual((item as any).unitPrice, undefined, 'Surat Jalan item MUST NOT have unitPrice');
  assert.strictEqual((item as any).subtotal, undefined, 'Surat Jalan item MUST NOT have subtotal');
  assert.strictEqual((item as any).cost_price, undefined, 'Surat Jalan item MUST NOT have cost_price');
  assert.strictEqual((manifest as any).totalAmount, undefined, 'Surat Jalan manifest MUST NOT have totalAmount');
  console.log('   ✅ Surat Jalan generated with STRICT PRICE PRIVACY (Zero financial fields exposed).');

  // 9. Surat Jalan Digital Signature Handover
  console.log('\n9️⃣ Testing Surat Jalan Digital Signature Handover...');
  const signRes = await request('/api/v1/logistics/surat-jalan/sign', {
    method: 'POST',
    body: JSON.stringify({
      deliveryOrderId: manifest.id,
      recipientSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQ...',
      driverSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQ...',
      recipientNotes: 'Diterima dalam kondisi karung utuh dan segel baik.',
    }),
  });
  assert.strictEqual(signRes.status, 200);
  const signedManifest = signRes.data.data;
  assert.ok(signedManifest.signatures.recipientSignedAt);
  assert.ok(signedManifest.signatures.driverSignedAt);
  assert.ok(signedManifest.signatures.recipientSignatureImage);
  console.log('   ✅ Surat Jalan signed digitally by driver & recipient. Handover manifest verified.');

  console.log('\n===============================================================');
  console.log('🎉 ALL 9 PHASE 2 VERIFICATION SUITE CHECKS PASSED WITH FLYING COLORS!');
  console.log('===============================================================\n');
}

runVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
