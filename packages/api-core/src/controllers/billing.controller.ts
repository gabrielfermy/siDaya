import http from 'http';
import { PlatformBillingService, PLATFORM_PLANS } from '@sidaya/payment-core';
import { SubscriptionTier } from '@sidaya/shared-types';
import { sendJson } from '../middleware/cors.middleware';
import { parseRequestBody } from '../middleware/body-parser.middleware';

export class BillingController {
  constructor(private readonly platformBillingService: PlatformBillingService) {}

  /**
   * Returns list of available subscription plans and pricing
   */
  public async getPlans(_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    sendJson(res, 200, {
      success: true,
      currency: 'IDR',
      data: Object.values(PLATFORM_PLANS),
      supportedPaymentMethods: [
        'QRIS (All Bank & E-Wallet)',
        'Virtual Account (BCA, Mandiri, BRI, BNI, Permata, BSI)',
        'Credit / Debit Card (Visa, Mastercard, JCB)',
        'Retail Outlets (Indomaret, Alfamart)',
      ],
    });
  }

  /**
   * Creates a live platform subscription invoice checkout session (via Xendit)
   */
  public async checkoutSubscription(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    let body: any = {};
    try {
      body = await parseRequestBody(req);
    } catch {
      body = {};
    }

    // Normalize plan tier
    let tier: SubscriptionTier = SubscriptionTier.RETAIL_STARTER;
    const rawTier = String(body.tier || '').toUpperCase();
    if (rawTier === 'STARTER' || rawTier === 'RETAIL_STARTER') {
      tier = SubscriptionTier.RETAIL_STARTER;
    } else if (rawTier === 'PRO' || rawTier === 'GROSIR_PRO') {
      tier = SubscriptionTier.GROSIR_PRO;
    } else if (rawTier === 'ENTERPRISE' || rawTier === 'OMNICHANNEL_ENTERPRISE') {
      tier = SubscriptionTier.OMNICHANNEL_ENTERPRISE;
    } else if (rawTier === 'FREE' || rawTier === 'STARTER_FREE') {
      tier = SubscriptionTier.STARTER_FREE;
    }

    const billingPeriod = body.billingPeriod === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
    const businessName = String(body.businessName || body.storeName || 'Toko Grosir Beras Jaya').trim();
    const ownerName = String(body.ownerName || body.name || 'Gabriel Fermy (Merchant SiDaya)').trim();
    const ownerEmail = String(body.ownerEmail || body.email || 'ashvin.labs@gmail.com').trim();
    const ownerPhone = String(body.ownerPhone || body.phone || '08139506092').trim();
    const tenantSubdomain = String(body.tenantSubdomain || body.subdomain || 'berasjaya')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    try {
      const session = await this.platformBillingService.createSubscriptionSession({
        tenantId: `tenant_${tenantSubdomain || 'demo'}`,
        tenantSubdomain: tenantSubdomain || 'demo',
        ownerEmail,
        ownerName: `${ownerName} - ${businessName}`,
        ownerPhone,
        tier,
        billingPeriod,
      });

      sendJson(res, 200, {
        success: true,
        data: {
          invoiceNumber: session.invoiceNumber,
          tier: session.tier,
          amount: session.amount,
          billingPeriod: session.billingPeriod,
          checkoutUrl: session.checkoutUrl,
          paymentToken: session.paymentToken,
          qrString: session.qrString,
          vaNumber: session.vaNumber,
          expiresAt: session.expiresAt,
          merchantName: 'Ashvin Labs (SiDaya)',
          currency: 'IDR',
        },
      });
    } catch (err: any) {
      sendJson(res, 500, {
        success: false,
        error: {
          message: err.message || 'Gagal membuat sesi pembayaran tagihan.',
          code: 'BILLING_CHECKOUT_FAILED',
        },
      });
    }
  }
}
