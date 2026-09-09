import {
  SalesOrder,
  OrderLineItem,
  CheckoutOrderPayload,
  calculateCompoundDiscount,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
} from '@sidaya/shared-types';
import { IPaymentGatewayProvider } from '@sidaya/payment-core';

export interface CheckoutResult {
  order: SalesOrder;
  paylink?: {
    checkoutUrl: string;
    qrString?: string | undefined;
    vaNumber?: string | undefined;
    expiresAt: Date;
  } | undefined;
}

export class OrderDomainService {
  constructor(private readonly paymentProvider?: IPaymentGatewayProvider | undefined) {}

  /**
   * Processes wholesale/retail order checkout, computes compound discounts and unit conversions
   */
  async processCheckout(
    tenantId: string,
    dto: CheckoutOrderPayload,
  ): Promise<CheckoutResult> {
    const orderId = `00000000-0000-0000-0000-${Math.floor(Date.now() / 1000).toString().padStart(12, '0')}`;
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    let subtotalAmount = 0;
    const items: OrderLineItem[] = dto.items.map((item, idx) => {
      const conversionFactor = item.conversionFactor ?? 1;
      const lineSubtotal = item.quantity * item.unitPrice;
      subtotalAmount += lineSubtotal;

      return {
        id: item.id ?? `00000000-0000-0000-0001-${(idx + 1).toString().padStart(12, '0')}`,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        selectedUnit: item.selectedUnit ?? 'PCS',
        conversionFactor,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: lineSubtotal,
        allocatedBatchId: item.allocatedBatchId,
        itemDiscount: item.itemDiscount,
      };
    });

    let discountAmount = 0;
    if (dto.orderDiscount) {
      const breakdown = calculateCompoundDiscount(subtotalAmount, dto.orderDiscount);
      discountAmount = breakdown.totalDiscount;
    }

    const totalAmount = Math.max(0, subtotalAmount - discountAmount);
    const now = new Date();

    const order: SalesOrder = {
      id: orderId,
      tenantId,
      storeId: dto.storeId,
      orderNumber,
      cashierUserId: dto.cashierUserId,
      customerId: dto.customerId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      items,
      subtotalAmount,
      discountAmount,
      totalAmount,
      paymentStatus: OrderPaymentStatus.UNPAID,
      fulfillmentStatus: OrderFulfillmentStatus.PENDING_ALLOCATION,
      paymentMethod: dto.paymentMethod,
      createdAt: now,
      updatedAt: now,
    };

    let paylinkResult: CheckoutResult['paylink'] = undefined;

    if (dto.paymentMethod.startsWith('PAYLINK') && this.paymentProvider) {
      const session = await this.paymentProvider.createPaymentSession({
        tenantId,
        orderId,
        orderNumber,
        amount: totalAmount,
        customer: {
          name: dto.customerName ?? 'General Buyer',
          phone: dto.customerPhone ?? '081234567890',
        },
        items: items.map((i) => ({
          id: i.productId,
          name: i.productName,
          price: i.unitPrice,
          quantity: i.quantity,
        })),
        preferredChannel: dto.paymentMethod === 'PAYLINK_QRIS' ? 'QRIS' : undefined,
      });

      order.paylinkUrl = session.checkoutUrl;

      paylinkResult = {
        checkoutUrl: session.checkoutUrl,
        qrString: session.qrString,
        vaNumber: session.vaNumber,
        expiresAt: session.expiresAt,
      };
    }

    return {
      order,
      paylink: paylinkResult,
    };
  }
}
