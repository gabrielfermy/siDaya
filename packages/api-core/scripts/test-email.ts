/**
 * @file test-email.ts
 * @description CLI Test utility to verify live Resend API key and domain dispatch
 * @usage npx tsx scripts/test-email.ts [recipient_email]
 */

import { EmailDispatchService } from '../src/services/email-dispatch.service';

// Native environment loader for Node 20+
try {
  process.loadEnvFile?.('.env');
} catch {}

async function runEmailTest() {
  const targetEmail = process.argv[2] || process.env['TEST_RECIPIENT_EMAIL'] || 'test@sidaya.my.id';
  const apiKey = process.env['RESEND_API_KEY'] || '';
  const fromEmail = process.env['RESEND_FROM_EMAIL'] || 'SiDaya Platform <no-reply@sidaya.my.id>';

  console.log('====================================================');
  console.log('🚀 SiDaya Resend Email Dispatch Diagnostic');
  console.log('====================================================');
  console.log(`• Target Recipient : ${targetEmail}`);
  console.log(`• Sender From      : ${fromEmail}`);
  console.log(`• API Key Config   : ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.slice(-4) : '⚠️ MISSING'}`);
  console.log(`• Environment      : ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`• Mock Mode Active : ${process.env['MOCK_EMAIL_DISPATCH'] === 'true' ? 'YES (Mock)' : 'NO (Live Resend API)'}`);
  console.log('----------------------------------------------------');

  const emailService = new EmailDispatchService({ resendApiKey: apiKey, fromEmail });
  const sampleOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const sampleUrl = `http://localhost:3333/auth/verify-email?token=test_${Date.now()}`;

  console.log(`📤 Sending sample verification email with OTP [${sampleOtp}] to ${targetEmail}...`);

  const startTime = Date.now();
  const result = await emailService.sendEmailVerification(targetEmail, 'Mitra SiDaya', sampleUrl, sampleOtp);
  const elapsed = Date.now() - startTime;

  console.log('----------------------------------------------------');
  console.log(`• Dispatch Provider: ${result.provider}`);
  console.log(`• Dispatch Status  : ${result.status}`);
  console.log(`• Message / Ref ID : ${result.id}`);
  console.log(`• Latency          : ${elapsed}ms`);
  console.log('====================================================');

  if (result.provider === 'RESEND' && result.status === 'SENT') {
    console.log('✅ SUCCESS! Live email sent via Resend REST API.');
    console.log(`📩 Please check the inbox / spam folder of: ${targetEmail}`);
  } else {
    console.log('ℹ️ Dispatched via Mock / Fallback mode.');
  }
}

runEmailTest().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
