import crypto from 'crypto';
import {
  IPaymentGatewayProvider,
  CreatePaymentSessionDTO,
  PaymentSessionResult,
  NormalizedWebhookResult,
  NormalizedPaymentStatus,
} from '../interfaces/payment-provider.interface';

export interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export class MidtransPaymentProvider implements IPaymentGatewayProvider {
  readonly providerId = 'MIDTRANS';

  constructor(private readonly config: MidtransConfig) {}

  async createPaymentSession(dto: CreatePaymentSessionDTO): Promise<PaymentSessionResult> {
    const expiresIn = dto.expiresInMinutes ?? 1440; // 24 hours default
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
    const mockToken = `midtrans_snap_${dto.orderId}_${Date.now()}`;
    const baseUrl = this.config.isProduction
      ? 'https://app.midtrans.com/snap/v2/vtweb/'
      : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/';

    return {
      gatewayProvider: this.providerId,
      gatewayReferenceId: dto.orderNumber,
      checkoutUrl: `${baseUrl}${mockToken}`,
      paymentToken: mockToken,
      qrString: dto.preferredChannel === 'QRIS' ? `00020101021226580014ID.LINKAJA.WWW01189360000201100000000215${dto.orderNumber}520458125303360540` : undefined,
      vaNumber: dto.preferredChannel?.includes('VA') ? `70012${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
      expiresAt,
    };
  }

  /**
   * Verifies Midtrans SHA512 signature:
   * SHA512(order_id + status_code + gross_amount + ServerKey)
   * Enforces constant-time comparison to prevent timing side-channel attacks.
   */
  verifyWebhookSignature(_headers: Record<string, string>, body: Record<string, unknown>): boolean {
    const signatureKey = body['signature_key'] as string | undefined;
    const orderId = body['order_id'] as string | undefined;
    const statusCode = body['status_code'] as string | undefined;
    const grossAmount = body['gross_amount'] as string | undefined;

    if (!signatureKey || !orderId || !statusCode || !grossAmount) {
      return false;
    }

    const payload = `${orderId}${statusCode}${grossAmount}${this.config.serverKey}`;
    const expectedSignature = crypto.createHash('sha512').update(payload).digest('hex').toLowerCase();
    const receivedSignature = signatureKey.toLowerCase().trim();

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
    const orderId = String(body['order_id'] ?? '');
    const transactionStatus = String(body['transaction_status'] ?? '');
    const fraudStatus = String(body['fraud_status'] ?? 'accept');
    const grossAmount = Number(body['gross_amount'] ?? 0);
    const paymentType = String(body['payment_type'] ?? 'qris');
    const transactionId = String(body['transaction_id'] ?? '');

    let status: NormalizedPaymentStatus = 'PENDING';

    if (transactionStatus === 'capture' && fraudStatus === 'accept') {
      status = 'SETTLED';
    } else if (transactionStatus === 'settlement') {
      status = 'SETTLED';
    } else if (transactionStatus === 'pending') {
      status = 'PENDING';
    } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
      status = transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED';
    }

    return {
      isValid: true,
      orderId,
      gatewayTransactionId: transactionId,
      status,
      amountPaid: grossAmount,
      paymentChannel: paymentType.toUpperCase(),
      paidAt: new Date(),
      rawPayload: body,
    };
  }

  async checkStatus(_gatewayReferenceId: string): Promise<NormalizedPaymentStatus> {
    return 'PENDING';
  }
}

