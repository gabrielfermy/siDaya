export type PaymentChannel =
  | 'QRIS'
  | 'BCA_VA'
  | 'BRI_VA'
  | 'BNI_VA'
  | 'MANDIRI_VA'
  | 'PERMATA_VA'
  | 'OVO'
  | 'GOPAY'
  | 'SHOPEEPAY'
  | 'DANA';

export type NormalizedPaymentStatus = 'SETTLED' | 'PENDING' | 'EXPIRED' | 'FAILED';

export interface PaymentCustomerDTO {
  name: string;
  phone: string;
  email?: string;
}

export interface PaymentItemDTO {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CreatePaymentSessionDTO {
  tenantId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  customer: PaymentCustomerDTO;
  items: PaymentItemDTO[];
  preferredChannel?: PaymentChannel | undefined;
  expiresInMinutes?: number | undefined;
  callbackUrl?: string | undefined;
}

export interface PaymentSessionResult {
  gatewayProvider: string;
  gatewayReferenceId: string;
  checkoutUrl: string;
  paymentToken: string;
  qrString?: string | undefined;
  vaNumber?: string | undefined;
  expiresAt: Date;
}

export interface NormalizedWebhookResult {
  isValid: boolean;
  orderId: string;
  gatewayTransactionId: string;
  status: NormalizedPaymentStatus;
  amountPaid: number;
  paymentChannel: PaymentChannel | string;
  paidAt: Date;
  rawPayload: Record<string, unknown>;
}

export interface IPaymentGatewayProvider {
  readonly providerId: string; // 'MIDTRANS' | 'XENDIT' | 'DUITKU'

  /**
   * Initializes a payment session for an order, producing a hosted checkout URL, QRIS payload, or VA number
   */
  createPaymentSession(dto: CreatePaymentSessionDTO): Promise<PaymentSessionResult>;

  /**
   * Verifies the cryptographic HMAC / SHA signature of an incoming webhook from the payment acquirer
   */
  verifyWebhookSignature(headers: Record<string, string>, body: Record<string, unknown>): boolean;

  /**
   * Normalizes gateway-specific webhook bodies into a canonical SiDaya format
   */
  parseWebhook(body: Record<string, unknown>): NormalizedWebhookResult;

  /**
   * Proactively checks transaction status with gateway API (fallback if webhook delayed)
   */
  checkStatus(gatewayReferenceId: string): Promise<NormalizedPaymentStatus>;
}
