import http from 'http';
import { PlatformBillingService, PLATFORM_PLANS, PaymentGatewayRegistry, IPaymentGatewayProvider } from '@sidaya/payment-core';
import { SubscriptionTier } from '@sidaya/shared-types';
import { sendJson } from '../middleware/cors.middleware';
import { parseRequestBody } from '../middleware/body-parser.middleware';

export class BillingController {
  constructor(
    private readonly platformBillingService: PlatformBillingService,
    private readonly gatewayRegistry?: PaymentGatewayRegistry,
  ) {}

  /**
   * Returns list of available subscription plans and pricing
   */
  public async getPlans(_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    sendJson(res, 200, {
      success: true,
      currency: 'IDR',
      data: Object.values(PLATFORM_PLANS),
      supportedPaymentMethods: [
        'iPaymu (QRIS, VA Mandiri/BCA/BRI/BNI, Alfamart, Indomaret)',
        'Xendit (QRIS, Virtual Account, Credit/Debit Card)',
      ],
      registeredGateways: this.gatewayRegistry ? this.gatewayRegistry.listRegistered() : ['XENDIT', 'IPAYMU'],
    });
  }

  /**
   * Creates a live platform subscription invoice checkout session (supports iPaymu & Xendit)
   */
  public async checkoutSubscription(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    let body: any = {};
    try {
      body = await parseRequestBody(req);
    } catch {
      body = {};
    }

    // Determine target gateway (default to IPAYMU for sidaya.biz.id verification, or XENDIT if specified)
    const reqUrl = (req.url || '').toLowerCase();
    const explicitGateway = String(body.gateway || body.provider || '').toLowerCase();
    const isXendit = reqUrl.includes('gateway=xendit') || explicitGateway === 'xendit';
    const isIpaymu = reqUrl.includes('gateway=ipaymu') || explicitGateway === 'ipaymu' || !isXendit;

    let providerOverride: IPaymentGatewayProvider | undefined = undefined;
    if (this.gatewayRegistry) {
      if (isIpaymu && this.gatewayRegistry.has('IPAYMU')) {
        providerOverride = this.gatewayRegistry.get('IPAYMU');
      } else if (isXendit && this.gatewayRegistry.has('XENDIT')) {
        providerOverride = this.gatewayRegistry.get('XENDIT');
      }
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
      const session = await this.platformBillingService.createSubscriptionSession(
        {
          tenantId: `tenant_${tenantSubdomain || 'demo'}`,
          tenantSubdomain: tenantSubdomain || 'demo',
          ownerEmail,
          ownerName: `${ownerName} - ${businessName}`,
          ownerPhone,
          tier,
          billingPeriod,
        },
        providerOverride,
      );

      sendJson(res, 200, {
        success: true,
        data: {
          invoiceNumber: session.invoiceNumber,
          tier: session.tier,
          amount: session.amount,
          billingPeriod: session.billingPeriod,
          gatewayProvider: session.gatewayProvider || (isIpaymu ? 'IPAYMU' : 'XENDIT'),
          checkoutUrl: session.checkoutUrl,
          paymentToken: session.paymentToken,
          qrString: session.qrString,
          vaNumber: session.vaNumber,
          expiresAt: session.expiresAt,
          merchantName: isIpaymu ? 'siDaya (iPaymu)' : 'Ashvin Labs (Xendit)',
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
