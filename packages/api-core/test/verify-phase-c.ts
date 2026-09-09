import assert from 'assert';
import { pinAuthService } from '../src/services/pin-auth.service.js';
import { pdpMaskingService } from '../src/services/pdp-masking.service.js';

async function runPhaseCVerification() {
  console.log('===============================================================');
  console.log('🧪 SIDAYA PHASE C VERIFICATION: PIN AUTH & PDP MASKING GUARD');
  console.log('===============================================================\n');

  // 1. Test Fast Cashier PIN Hashing & Timing-Safe Verification
  console.log('1️⃣ Testing Fast Cashier PIN Hashing & Verification (Argon2 / HMAC)...');
  const cashierPin = '2468';
  const salt = 'tenant_berasjaya_salt_99';
  const hashedPin = pinAuthService.hashPin(cashierPin, salt);

  assert.strictEqual(typeof hashedPin, 'string', 'Hashed PIN should be a hex string');
  assert.ok(pinAuthService.verifyPin(cashierPin, hashedPin, salt), 'PIN verification should pass with correct input');
  assert.ok(!pinAuthService.verifyPin('1234', hashedPin, salt), 'PIN verification must fail with incorrect PIN');
  console.log('   ✅ PIN Hashing & timing-safe verification verified.');

  // 2. Test Ephemeral Station Session Creation
  console.log('\n2️⃣ Testing Ephemeral Station Session Generation...');
  const session = pinAuthService.createStationSession(
    'u001',
    't001',
    'Siti Rahma',
    'CASHIER',
    ['pos:checkout', 'shifts:operate']
  );
  assert.strictEqual(session.fullName, 'Siti Rahma');
  assert.ok(session.sessionToken.startsWith('ses_pin_'), 'Session token should have valid prefix');
  assert.deepStrictEqual(session.permissions, ['pos:checkout', 'shifts:operate']);
  console.log('   ✅ Station session created for fast cashier switch:', session.sessionToken);

  // 3. Test UU PDP No. 27/2022 PII Dynamic Masking
  console.log('\n3️⃣ Testing UU PDP No. 27/2022 PII Dynamic Masking...');
  const rawName = 'Budi Santoso';
  const rawPhone = '+6281234567890';
  const rawEmail = 'budi@berasjaya.com';

  const maskedName = pdpMaskingService.maskFullName(rawName);
  const maskedPhone = pdpMaskingService.maskPhoneNumber(rawPhone);
  const maskedEmail = pdpMaskingService.maskEmail(rawEmail);

  assert.strictEqual(maskedName, 'B*** S***', 'Name should be masked as B*** S***');
  assert.strictEqual(maskedPhone, '+6281****7890', 'Phone should be masked as +6281****7890');
  assert.strictEqual(maskedEmail, 'b***@berasjaya.com', 'Email should be masked as b***@berasjaya.com');
  console.log(`   ✅ PII Masking verified: Name=${maskedName}, Phone=${maskedPhone}, Email=${maskedEmail}`);

  // 4. Test Break-Glass Emergency Unmasking Protocol
  console.log('\n4️⃣ Testing Break-Glass Emergency Session Generation...');
  const bgSession = pdpMaskingService.createBreakGlassSession(
    'op_gabriel_01',
    'INC-9482',
    'Emergency database diagnostic after hardware outage'
  );

  assert.ok(bgSession.token.startsWith('tok_bg_'), 'Break-glass token should have valid prefix');
  assert.strictEqual(bgSession.ticketNumber, 'INC-9482');
  assert.ok(pdpMaskingService.isBreakGlassActive(bgSession.token), 'Break-glass session should be active');

  // Test failure without ticket number
  assert.throws(() => {
    pdpMaskingService.createBreakGlassSession('op_gabriel_01', '', 'No ticket');
  }, /Nomor tiket darurat/);
  console.log('   ✅ Break-Glass emergency authorization with ticket requirement confirmed.');

  console.log('\n===============================================================');
  console.log('🎉 ALL PHASE C AUTH & PRIVACY CHECKS PASSED WITH FLYING COLORS!');
  console.log('===============================================================');
}

runPhaseCVerification().catch((err) => {
  console.error('\n❌ Phase C Verification Failed:', err);
  process.exit(1);
});
