const crypto = require('crypto');

async function testIpaymu() {
  const va = '1179008214154585';
  const apiKey = '6FF0178B-A610-4CC8-857A-4AAA272A1931';
  const baseUrl = 'https://my.ipaymu.com';

  const payloadBody = {
    product: ['SiDaya Starter Plan (Subscription)'],
    qty: ['1'],
    price: ['149000'],
    amount: '149000',
    returnUrl: 'https://sidaya.biz.id/invoices?status=success',
    cancelUrl: 'https://sidaya.biz.id/invoices?status=cancelled',
    notifyUrl: 'https://sidaya.biz.id/api/v1/webhooks/payment/ipaymu',
    referenceId: `SIDAYA_SUB_TEST_${Date.now()}`,
    buyerName: 'Gabriel Fermy Aswinta',
    buyerEmail: 'ashvin.labs@gmail.com',
    buyerPhone: '08139506092',
  };

  const bodyJson = JSON.stringify(payloadBody);
  const bodyHash = crypto.createHash('sha256').update(bodyJson).digest('hex').toLowerCase();
  const stringToSign = `POST:${va}:${bodyHash}:${apiKey}`;
  const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

  console.log('Sending request to iPaymu API v2...');
  console.log('Base URL:', baseUrl);
  console.log('VA:', va);
  console.log('Signature:', signature);

  try {
    const res = await fetch(`${baseUrl}/api/v2/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        va,
        signature,
        timestamp,
      },
      body: bodyJson,
    });

    const text = await res.text();
    console.log('Status Code:', res.status);
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testIpaymu();
