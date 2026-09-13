import crypto from 'crypto';
import {
  IPaymentGatewayProvider,
  CreatePaymentSessionDTO,
  PaymentSessionResult,
  NormalizedWebhookResult,
  NormalizedPaymentStatus,
} from '../interfaces/payment-provider.interface';

export interface DuitkuConfig {
  merchantCode: string;
  merchantKey: string;
  isSandbox: boolean;
}

export class DuitkuPaymentProvider implements IPaymentGatewayProvider {
  readonly providerId = 'DUITKU';

  constructor(private readonly config: DuitkuConfig) {}

  async createPaymentSession(dto: CreatePaymentSessionDTO): Promise<PaymentSessionResult> {
    const expiresIn = dto.expiresInMinutes ?? 1440;
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
    const mockReference = `duitku_ref_${dto.orderId}_${Date.now()}`;
    const baseUrl = this.config.isSandbox
      ? 'https://sandbox.duitku.com/web/checkout/'
      : 'https://payment.duitku.com/web/checkout/';

    return {
      gatewayProvider: this.providerId,
      gatewayReferenceId: mockReference,
      checkoutUrl: `${baseUrl}${mockReference}`,
      paymentToken: mockReference,
      qrString: dto.preferredChannel === 'QRIS' ? `00020101021226580014ID.DUITKU.WWW01189360000201100000000215${dto.orderNumber}52045812` : undefined,
      vaNumber: dto.preferredChannel?.includes('VA') ? `013${Math.floor(100000000 + Math.random() * 900000000)}` : undefined,
      expiresAt,
    };
  }

  /**
   * Verifies Duitku MD5 signature:
   * MD5(merchantCode + amount + merchantOrderId + merchantKey)
   * Uses constant-time comparison to prevent timing attacks.
   */
  verifyWebhookSignature(_headers: Record<string, string>, body: Record<string, unknown>): boolean {
    const signature = body['signature'] as string | undefined;
    const merchantCode = body['merchantCode'] as string | undefined;
    const amount = body['amount'] as string | number | undefined;
    const merchantOrderId = body['merchantOrderId'] as string | undefined;

    if (!signature || !merchantCode || amount === undefined || !merchantOrderId) {
      return false;
    }

    const payload = `${merchantCode}${amount}${merchantOrderId}${this.config.merchantKey}`;
    const expectedSignature = crypto.createHash('md5').update(payload).digest('hex').toLowerCase();
    const receivedSignature = signature.toLowerCase().trim();

    if (expectedSignature.length !== receivedSignature.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(receivedSignature, 'utf8'),
      );
    } catch {
      return false;
    }
  }

  parseWebhook(body: Record<string, unknown>): NormalizedWebhookResult {
    const orderId = String(body['merchantOrderId'] ?? '');
    const resultCode = String(body['resultCode'] ?? '');
    const amount = Number(body['amount'] ?? 0);
    const reference = String(body['reference'] ?? '');
    const paymentCode = String(body['paymentCode'] ?? 'QRIS');

    let status: NormalizedPaymentStatus = 'PENDING';
    if (resultCode === '00') {
      status = 'SETTLED';
    } else if (resultCode === '01') {
      status = 'PENDING';
    } else {
      status = 'FAILED';
    }

    return {
      isValid: true,
      orderId,
      gatewayTransactionId: reference,
      status,
      amountPaid: amount,
      paymentChannel: paymentCode.toUpperCase(),
      paidAt: new Date(),
      rawPayload: body,
    };
  }

  async checkStatus(_gatewayReferenceId: string): Promise<NormalizedPaymentStatus> {
    return 'PENDING';
  }
}

