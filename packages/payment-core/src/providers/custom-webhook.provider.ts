import crypto from 'crypto';
import {
  IPaymentGatewayProvider,
  CreatePaymentSessionDTO,
  PaymentSessionResult,
  NormalizedWebhookResult,
  NormalizedPaymentStatus,
} from '../interfaces/payment-provider.interface';

export interface CustomWebhookConfig {
  sharedHmacSecret: string;
  externalProviderName?: string;
}

/**
 * Open Payment Adapter Protocol (OPAP) Provider
 * Allows tenants to connect their own external payment systems, ERPs, or proprietary EDC terminals.
 * Enforces HMAC-SHA256 signature verification on incoming callbacks.
 */
export class CustomWebhookPaymentProvider implements IPaymentGatewayProvider {
  readonly providerId: string;

  constructor(private readonly config: CustomWebhookConfig) {
    this.providerId = (config.externalProviderName || 'CUSTOM_GATEWAY').toUpperCase();
  }

  async createPaymentSession(dto: CreatePaymentSessionDTO): Promise<PaymentSessionResult> {
    const expiresIn = dto.expiresInMinutes ?? 1440;
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
    const token = `custom_pay_${dto.orderId}_${Date.now()}`;

    return {
      gatewayProvider: this.providerId,
      gatewayReferenceId: dto.orderNumber,
      checkoutUrl: dto.callbackUrl ? `${dto.callbackUrl}?token=${token}` : `https://pay.sidaya.biz.id/p/${token}`,
      paymentToken: token,
      qrString: dto.preferredChannel === 'QRIS' ? `00020101021226580014ID.CUSTOM.WWW01189360000201100000000215${dto.orderNumber}52045812` : undefined,
      vaNumber: undefined,
      expiresAt,
    };
  }

  /**
   * Verifies HMAC-SHA256 signature passed in 'x-custom-signature' or 'x-signature' header.
   * Expected: HMAC-SHA256(raw_payload_string, sharedHmacSecret)
   */
  verifyWebhookSignature(headers: Record<string, string>, body: Record<string, unknown>): boolean {
    const receivedSignature = headers['x-custom-signature'] ?? headers['x-signature'] ?? (body['signature'] as string);
    if (!receivedSignature || !this.config.sharedHmacSecret) {
      return false;
    }

    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', this.config.sharedHmacSecret)
      .update(payload)
      .digest('hex')
      .toLowerCase();

    const cleanReceived = String(receivedSignature).toLowerCase().trim();

    if (expectedSignature.length !== cleanReceived.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(cleanReceived, 'utf8'),
      );
    } catch {
      return false;
    }
  }

  parseWebhook(body: Record<string, unknown>): NormalizedWebhookResult {
    const orderId = String(body['orderId'] ?? body['order_id'] ?? body['externalId'] ?? '');
    const transactionId = String(body['transactionId'] ?? body['reference'] ?? `tx_${Date.now()}`);
    const amount = Number(body['amount'] ?? body['grossAmount'] ?? body['amountPaid'] ?? 0);
    const rawStatus = String(body['status'] ?? 'SETTLED').toUpperCase();
    const paymentChannel = String(body['channel'] ?? body['paymentMethod'] ?? 'EXTERNAL').toUpperCase();

    let status: NormalizedPaymentStatus = 'PENDING';
    if (rawStatus === 'SETTLED' || rawStatus === 'PAID' || rawStatus === 'SUCCESS') {
      status = 'SETTLED';
    } else if (rawStatus === 'EXPIRED') {
      status = 'EXPIRED';
    } else if (rawStatus === 'FAILED' || rawStatus === 'CANCELLED') {
      status = 'FAILED';
    }

    return {
      isValid: true,
      orderId,
      gatewayTransactionId: transactionId,
      status,
      amountPaid: amount,
      paymentChannel,
      paidAt: new Date(),
      rawPayload: body,
    };
  }

  async checkStatus(_gatewayReferenceId: string): Promise<NormalizedPaymentStatus> {
    return 'PENDING';
  }
}
