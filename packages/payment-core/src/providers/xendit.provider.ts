import {
  IPaymentGatewayProvider,
  CreatePaymentSessionDTO,
  PaymentSessionResult,
  NormalizedWebhookResult,
  NormalizedPaymentStatus,
} from '../interfaces/payment-provider.interface';

export interface XenditConfig {
  secretApiKey: string;
  webhookVerificationToken: string;
}

export class XenditPaymentProvider implements IPaymentGatewayProvider {
  readonly providerId = 'XENDIT';

  constructor(private readonly config: XenditConfig) {}

  async createPaymentSession(dto: CreatePaymentSessionDTO): Promise<PaymentSessionResult> {
    const expiresIn = dto.expiresInMinutes ?? 1440;
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
    const mockInvoiceId = `inv_${dto.orderId}_${Date.now()}`;

    return {
      gatewayProvider: this.providerId,
      gatewayReferenceId: mockInvoiceId,
      checkoutUrl: `https://checkout.xendit.co/web/${mockInvoiceId}`,
      paymentToken: mockInvoiceId,
      qrString: dto.preferredChannel === 'QRIS' ? `00020101021226580014ID.XENDIT.WWW01189360000201100000000215${dto.orderNumber}52045812` : undefined,
      vaNumber: dto.preferredChannel?.includes('VA') ? `8808${Math.floor(100000000 + Math.random() * 900000000)}` : undefined,
      expiresAt,
    };
  }

  verifyWebhookSignature(headers: Record<string, string>, _body: Record<string, unknown>): boolean {
    const callbackToken = headers['x-callback-token'] ?? headers['X-CALLBACK-TOKEN'];
    if (!callbackToken) {
      return false;
    }
    return callbackToken === this.config.webhookVerificationToken;
  }

  parseWebhook(body: Record<string, unknown>): NormalizedWebhookResult {
    const orderId = String(body['external_id'] ?? '');
    const statusStr = String(body['status'] ?? '');
    const paidAmount = Number(body['paid_amount'] ?? body['amount'] ?? 0);
    const paymentMethod = String(body['payment_method'] ?? 'QRIS');
    const invoiceId = String(body['id'] ?? '');

    let status: NormalizedPaymentStatus = 'PENDING';
    if (statusStr === 'PAID' || statusStr === 'SETTLED') {
      status = 'SETTLED';
    } else if (statusStr === 'EXPIRED') {
      status = 'EXPIRED';
    } else if (statusStr === 'FAILED') {
      status = 'FAILED';
    }

    return {
      isValid: true,
      orderId,
      gatewayTransactionId: invoiceId,
      status,
      amountPaid: paidAmount,
      paymentChannel: paymentMethod.toUpperCase(),
      paidAt: new Date(String(body['paid_at'] ?? Date.now())),
      rawPayload: body,
    };
  }

  async checkStatus(_gatewayReferenceId: string): Promise<NormalizedPaymentStatus> {
    return 'PENDING';
  }
}
