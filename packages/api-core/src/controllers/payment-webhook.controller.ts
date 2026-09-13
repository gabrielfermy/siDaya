import {
  PaymentGatewayRegistry,
  NormalizedWebhookResult,
  PlatformBillingService,
  MerchantPaymentRouterService,
} from '@sidaya/payment-core';
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
  private processedTransactions = new Set<string>();

  constructor(
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly db?: PostPaymentDBClient | undefined,
    private readonly platformBillingService?: PlatformBillingService | undefined,
    private readonly merchantPaymentRouter?: MerchantPaymentRouterService | undefined,
  ) {}

  /**
   * Path 1: Platform Subscription & Add-On Billing Webhook Handler
   * Handles SaaS tier payments from Tenant to Developer/Ashvin Labs
   */
  public async handlePlatformBillingWebhook(
    headers: Record<string, string>,
    body: Record<string, unknown>,
  ): Promise<{ success: boolean; invoiceId: string; status: string; message: string }> {
    if (!this.platformBillingService) {
      // Fallback: verify using platform master provider in registry
      const provider = this.gatewayRegistry.get('MIDTRANS');
      if (!provider.verifyWebhookSignature(headers, body)) {
        throw new Error('Platform billing webhook rejected: Invalid signature.');
      }
      const parsed = provider.parseWebhook(body);
      return {
        success: true,
        invoiceId: parsed.orderId,
        status: parsed.status,
        message: `Platform billing processed with status ${parsed.status}.`,
      };
    }

    const parsed = this.platformBillingService.verifyAndProcessPlatformWebhook(headers, body);
    return {
      success: true,
      invoiceId: parsed.orderId,
      status: parsed.status,
      message: `Platform subscription for invoice ${parsed.orderId} is now ${parsed.status}.`,
    };
  }

  /**
   * Path 2: Commercial POS & PayLink Webhook Handler (End-Customer -> Tenant)
   */
  async handleWebhook(
    providerId: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
    tenantId?: string,
  ): Promise<WebhookHandlingResult> {
    let normalized: NormalizedWebhookResult;

    if (tenantId && this.merchantPaymentRouter) {
      normalized = this.merchantPaymentRouter.verifyAndParseCommercialWebhook(tenantId, headers, body);
    } else {
      const provider = this.gatewayRegistry.get(providerId);
      const isSignatureValid = provider.verifyWebhookSignature(headers, body);
      if (!isSignatureValid) {
        throw new Error(`Invalid signature received for payment gateway '${providerId}'. Webhook rejected.`);
      }
      normalized = provider.parseWebhook(body);
    }

    // 2. Idempotency Check: Prevent duplicate inventory decrements
    const idempotencyKey = `${providerId}_${normalized.gatewayTransactionId}_${normalized.orderId}`;
    if (this.processedTransactions.has(idempotencyKey)) {
      return {
        success: true,
        orderId: normalized.orderId,
        gatewayTransactionId: normalized.gatewayTransactionId,
        paymentStatus: OrderPaymentStatus.PAID,
        amountPaid: normalized.amountPaid,
        message: `Idempotent duplicate webhook ignored for transaction ${normalized.gatewayTransactionId}.`,
        stockMovementLogged: false,
      };
    }

    let stockMovementLogged = false;
    let finalStatus = OrderPaymentStatus.UNPAID;

    // 3. If payment is SETTLED, execute atomic post-payment orchestration
    if (normalized.status === 'SETTLED') {
      finalStatus = OrderPaymentStatus.PAID;
      this.processedTransactions.add(idempotencyKey);

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

