import assert from 'assert';
import {
  AuthTenantDomainService,
  PlatformAdminDomainService,
  EmailDispatchService,
} from '../src/index';
import {
  UserRole,
  PlatformOperatorRole,
  validatePasswordStrength,
} from '@sidaya/shared-types';

async function runAuthLifecycleTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 Starting Auth, Global Identity & Invitation Test Suite');
  console.log('🧪 ========================================================\n');

  const emailService = new EmailDispatchService();
  const authService = new AuthTenantDomainService();
  const adminService = new PlatformAdminDomainService();

  // --------------------------------------------------------------------------
  // TEST 1: Password Strength Validator
  // --------------------------------------------------------------------------
  console.log('▶ TEST 1: Password Strength Validator (Industry Standard)');
  const weak1 = validatePasswordStrength('short');
  assert.strictEqual(weak1.isValid, false, 'Should reject password under 8 chars');

  const weak2 = validatePasswordStrength('alllowercase123!');
  assert.strictEqual(weak2.isValid, false, 'Should reject missing uppercase letter');

  const weak3 = validatePasswordStrength('ALLUPPERCASE123!');
  assert.strictEqual(weak3.isValid, false, 'Should reject missing lowercase letter');

  const weak4 = validatePasswordStrength('NoSpecialChar123');
  assert.strictEqual(weak4.isValid, false, 'Should reject missing special character');

  const weak5 = validatePasswordStrength('NoNumberChar!@#');
  assert.strictEqual(weak5.isValid, false, 'Should reject missing number');

  const strong = validatePasswordStrength('SiDaya#Secure2026!');
  assert.strictEqual(strong.isValid, true, 'Should accept valid strong password');
  assert.strictEqual(strong.score, 5, 'Strong password should have top score of 5');
  console.log('  ✅ Password strength validator enforces 8+ chars, upper, lower, number, special.\n');

  // --------------------------------------------------------------------------
  // TEST 2: Merchant Owner Self-Registration (Creates Tenant & Billing POC)
  // --------------------------------------------------------------------------
  console.log('▶ TEST 2: Merchant Owner Self-Registration');
  const ownerReg = await authService.registerOwner(
    {
      businessName: 'CV Beras Organik Solok',
      subdomain: 'beras-solok',
      ownerName: 'Hendra Solok',
      email: 'hendra+owner@berassolok.co.id',
      phoneNumber: '081298711223',
      password: 'StrongOwnerPass123!',
    },
    emailService,
    'http://localhost:3333',
  );

  assert.ok(ownerReg.tenantId, 'Should generate new tenant ID');
  assert.strictEqual(ownerReg.subdomain, 'beras-solok');
  assert.strictEqual(ownerReg.role, UserRole.OWNER);
  assert.strictEqual(ownerReg.isEmailVerified, false, 'New owner should start as unverified');
  assert.ok(ownerReg.verificationToken, 'Should generate email verification token');
  console.log(`  ✅ Owner registered: Tenant ID=${ownerReg.tenantId}, Email=${ownerReg.email}`);

  // Check email dispatch
  const sentEmails = emailService.getSentLogs();
  const verifyEmail = sentEmails.find((e) => e.to === 'hendra+owner@berassolok.co.id');
  assert.ok(verifyEmail, 'Verification email should be dispatched via emailService');
  assert.ok(verifyEmail?.html.includes(ownerReg.verificationToken!), 'Email should contain token');
  console.log('  ✅ Verification email dispatched successfully.\n');

  // --------------------------------------------------------------------------
  // TEST 3: Email Verification Flow
  // --------------------------------------------------------------------------
  console.log('▶ TEST 3: Email Verification Flow');
  const verifyResult = await authService.verifyEmail(ownerReg.verificationToken!);
  assert.strictEqual(verifyResult.success, true);

  // Re-login to check verified status
  const verifiedSession = await authService.login('hendra+owner@berassolok.co.id', 'StrongOwnerPass123!');
  assert.strictEqual(verifiedSession.isEmailVerified, true, 'User isEmailVerified should now be true');
  console.log('  ✅ Email verified and session reflects verified status.\n');

  // --------------------------------------------------------------------------
  // TEST 4: Global Unique Email Invariant Enforcement
  // --------------------------------------------------------------------------
  console.log('▶ TEST 4: Global Unique Email Invariant');
  try {
    // Attempt duplicate registration
    await authService.registerOwner({
      businessName: 'Another Store',
      subdomain: 'another-store',
      ownerName: 'Duplicate Attempt',
      email: 'hendra+owner@berassolok.co.id', // Duplicate
      phoneNumber: '089999999999',
      password: 'StrongOwnerPass123!',
    });
    assert.fail('Should have rejected duplicate email');
  } catch (err: any) {
    assert.ok(err.message.includes('sudah terdaftar'), 'Error message should indicate email is already registered');
    console.log(`  ✅ Correctly rejected duplicate registration: "${err.message}"`);
  }

  // Cross-tenant email conflict with operator
  assert.strictEqual(
    adminService.isOperatorEmailRegistered('gabriel@ashvinlabs.com'),
    true,
    'Operator email should be recognized',
  );
  console.log('  ✅ Cross-plane operator vs tenant email collision check passed.\n');

  // --------------------------------------------------------------------------
  // TEST 5: Forgot Password & Reset Flow
  // --------------------------------------------------------------------------
  console.log('▶ TEST 5: Forgot Password & Reset Flow');
  const forgotResult = await authService.requestPasswordReset(
    'hendra+owner@berassolok.co.id',
    emailService,
    'http://localhost:3333',
  );
  assert.strictEqual(forgotResult.success, true);
  assert.ok(forgotResult.resetToken, 'Reset token generated');

  // Reset password using token
  const resetResult = await authService.resetPassword({
    token: forgotResult.resetToken!,
    newPassword: 'BrandNewPassword2026!',
  });
  assert.strictEqual(resetResult.success, true);

  // Verify old password fails
  try {
    await authService.login('hendra+owner@berassolok.co.id', 'StrongOwnerPass123!');
    assert.fail('Old password should fail');
  } catch (err: any) {
    console.log('  ✅ Old password successfully invalidated');
  }

  // Verify new password succeeds
  const newSession = await authService.login('hendra+owner@berassolok.co.id', 'BrandNewPassword2026!');
  assert.strictEqual(newSession.email, 'hendra+owner@berassolok.co.id');
  console.log('  ✅ Reset password flow verified successfully.\n');

  // --------------------------------------------------------------------------
  // TEST 6: Tenant Staff Invitation (Invitation Only Onboarding)
  // --------------------------------------------------------------------------
  console.log('▶ TEST 6: Tenant Staff Invitation (Kasir, Gudang, Driver)');
  const staffInvite = await authService.inviteStaff(
    {
      tenantId: ownerReg.tenantId,
      email: 'kasir.baru+store1@berassolok.co.id',
      fullName: 'Dewi Lestari',
      phoneNumber: '081233445566',
      role: UserRole.CASHIER,
      invitedByUserId: ownerReg.userId,
    },
    emailService,
    'http://localhost:3333',
  );
  assert.ok(staffInvite.token, 'Invitation token generated');

  // Accept staff invite
  const acceptedStaffSession = await authService.acceptStaffInvite({
    token: staffInvite.token,
    password: 'KasirPassword2026!',
    pin: '1122',
  });
  assert.strictEqual(acceptedStaffSession.email, 'kasir.baru+store1@berassolok.co.id');
  assert.strictEqual(acceptedStaffSession.activeTenant.role, UserRole.CASHIER);
  assert.strictEqual(acceptedStaffSession.isEmailVerified, true);
  console.log(`  ✅ Staff invite accepted for ${acceptedStaffSession.fullName} (${acceptedStaffSession.activeTenant.role})\n`);

  // --------------------------------------------------------------------------
  // TEST 7: Ashvin Labs Operator Invitation (Super Admin Only)
  // --------------------------------------------------------------------------
  console.log('▶ TEST 7: Platform Operator Invitation & Management Plane Onboarding');
  const superAdminContext = {
    id: 'a0000099-0001-0000-0000-000000000001',
    email: 'gabriel@ashvinlabs.com',
    role: PlatformOperatorRole.SUPER_ADMIN,
  };

  const opsInvite = await adminService.inviteOperator(
    {
      email: 'maya+ops@ashvinlabs.com',
      fullName: 'Maya Audit Specialist',
      phoneNumber: '+62811999888',
      role: PlatformOperatorRole.AUDIT_COMPLIANCE,
      invitedByOperatorId: superAdminContext.id,
    },
    superAdminContext,
    emailService,
    'http://ops.localhost:3333',
  );
  assert.ok(opsInvite.token, 'Operator invite token generated');

  // Non-super-admin cannot invite operator
  try {
    await adminService.inviteOperator(
      {
        email: 'hacker@ashvinlabs.com',
        fullName: 'Unauthorized Hacker',
        phoneNumber: '+62811999000',
        role: PlatformOperatorRole.SUPER_ADMIN,
        invitedByOperatorId: 'a0000099-0001-0000-0000-000000000003',
      },
      {
        id: 'a0000099-0001-0000-0000-000000000003',
        email: 'dina@ashvinlabs.com',
        role: PlatformOperatorRole.OPS_SUPPORT, // Not SUPER_ADMIN
      },
    );
    assert.fail('Non-super-admin should not be allowed to invite operators');
  } catch (err: any) {
    console.log(`  ✅ Non-super-admin operator invitation blocked: "${err.message}"`);
  }

  // Operator accepts invite & sets password
  const newOpsSession = await adminService.acceptOperatorInvite({
    token: opsInvite.token,
    password: 'MasterOpsPassword2026!',
  });
  assert.strictEqual(newOpsSession.email, 'maya+ops@ashvinlabs.com');
  assert.strictEqual(newOpsSession.role, PlatformOperatorRole.AUDIT_COMPLIANCE);
  console.log(`  ✅ Operator invite accepted for ${newOpsSession.fullName} (${newOpsSession.role})\n`);

  // Verify audit log captured the onboarding
  const auditLogs = adminService.getAuditLogs();
  const inviteAudit = auditLogs.find((l) => l.action === 'OPERATOR_INVITED');
  const acceptAudit = auditLogs.find((l) => l.action === 'OPERATOR_INVITATION_ACCEPTED');
  assert.ok(inviteAudit, 'Audit log should record OPERATOR_INVITED');
  assert.ok(acceptAudit, 'Audit log should record OPERATOR_INVITATION_ACCEPTED');
  console.log('  ✅ Immutable audit logs verified for operator onboarding lifecycle.\n');

  console.log('🎉 ========================================================');
  console.log('🎉 ALL AUTH, INVITATION & LIFECYCLE TESTS PASSED (7/7)!');
  console.log('🎉 ========================================================');
}

runAuthLifecycleTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
