import { PaymentGatewayRegistry, NormalizedWebhookResult } from '@sidaya/payment-core';
import { OrderPaymentStatus } from '@sidaya/shared-types';

export interface WebhookHandlingResult {
  success: boolean;
  orderId: string;
  gatewayTransactionId: string;
  paymentStatus: OrderPaymentStatus;
  amountPaid: number;
  message: string;
  stockMovementLogged: boolean;
}

export interface PostPaymentDBClient {
  findOrderById(orderId: string): Promise<{
    id: string;
    tenantId: string;
    totalAmount: number;
    paymentStatus: OrderPaymentStatus;
    customerId?: string | undefined;
    items: Array<{ productId: string; quantity: number }>;
  } | null>;
  markOrderPaid(orderId: string, paidAt: Date, channel: string): Promise<void>;
  recordStockMovement(movement: {
    tenantId: string;
    productId: string;
    quantityDelta: number;
    movementType: 'SALE';
    referenceId: string;
  }): Promise<void>;
  decrementCustomerDebt?(customerId: string, amount: number): Promise<void>;
}

export class PaymentWebhookController {
  constructor(
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly db?: PostPaymentDBClient | undefined,
  ) {}

  /**
   * Processes inbound webhook from payment gateway (Midtrans, Xendit, Duitku)
   */
  async handleWebhook(
    providerId: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
  ): Promise<WebhookHandlingResult> {
    const provider = this.gatewayRegistry.get(providerId);

    // 1. Verify cryptographic HMAC / token signature
    const isSignatureValid = provider.verifyWebhookSignature(headers, body);
    if (!isSignatureValid) {
      throw new Error(`Invalid signature received for payment gateway '${providerId}'. Webhook rejected.`);
    }

    // 2. Parse and normalize gateway payload
    const normalized: NormalizedWebhookResult = provider.parseWebhook(body);

    let stockMovementLogged = false;
    let finalStatus = OrderPaymentStatus.UNPAID;

    // 3. If payment is SETTLED, execute atomic post-payment orchestration
    if (normalized.status === 'SETTLED') {
      finalStatus = OrderPaymentStatus.PAID;

      if (this.db) {
        const order = await this.db.findOrderById(normalized.orderId);
        if (order && order.paymentStatus !== OrderPaymentStatus.PAID) {
          // A. Mark order as paid
          await this.db.markOrderPaid(order.id, normalized.paidAt, String(normalized.paymentChannel));

          // B. Record immutable stock movements
          for (const item of order.items) {
            await this.db.recordStockMovement({
              tenantId: order.tenantId,
              productId: item.productId,
              quantityDelta: -item.quantity,
              movementType: 'SALE',
              referenceId: order.id,
            });
          }
          stockMovementLogged = true;

          // C. If order was associated with a credit customer, settle debt
          if (order.customerId && this.db.decrementCustomerDebt) {
            await this.db.decrementCustomerDebt(order.customerId, normalized.amountPaid);
          }
        }
      }
    } else if (normalized.status === 'EXPIRED') {
      finalStatus = OrderPaymentStatus.EXPIRED;
    }

    return {
      success: true,
      orderId: normalized.orderId,
      gatewayTransactionId: normalized.gatewayTransactionId,
      paymentStatus: finalStatus,
      amountPaid: normalized.amountPaid,
      message: `Webhook from ${providerId} processed successfully with status ${normalized.status}.`,
      stockMovementLogged,
    };
  }
}
