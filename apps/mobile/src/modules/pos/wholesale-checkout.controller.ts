import {
  SalesOrder,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
  PaymentMethodType,
} from '@sidaya/shared-types';
import { POSCartManager } from './pos-cart.state';
import { MobilePrinterService } from '../hardware/printer-service';
import { TenantReceiptInfo } from '@sidaya/hardware-core';

export interface CashPaymentDTO {
  cashTendered: number;
}

export interface CheckoutExecutionResult {
  order: SalesOrder;
  changeDue: number;
  whatsAppShareUrl?: string | undefined;
  whatsAppMessageText?: string | undefined;
  printStatus?: { success: boolean; bytesWritten: number } | undefined;
}

export class WholesaleCheckoutController {
  constructor(
    private readonly printerService?: MobilePrinterService | undefined,
  ) {}

  /**
   * Executes local instant checkout from cart state
   */
  async processCashCheckout(
    tenantId: string,
    storeId: string,
    cashierUserId: string,
    cartManager: POSCartManager,
    payment: CashPaymentDTO,
    tenantInfo?: TenantReceiptInfo | undefined,
    autoPrint: boolean = true,
  ): Promise<CheckoutExecutionResult> {
    const cart = cartManager.getState();
    if (cart.items.length === 0) {
      throw new Error('Keranjang belanja kosong. Tambahkan produk sebelum checkout.');
    }

    if (payment.cashTendered < cart.grandTotal) {
      throw new Error(
        `Uang tunai kurang: Diterima Rp${payment.cashTendered.toLocaleString('id-ID')}, Total Tagihan Rp${cart.grandTotal.toLocaleString('id-ID')}`,
      );
    }

    const changeDue = payment.cashTendered - cart.grandTotal;
    const now = new Date();
    const orderNumber = `ORD-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `00000000-0000-0000-0005-${Math.floor(Date.now() / 1000).toString().padStart(12, '0')}`;

    const order: SalesOrder = {
      id: orderId,
      tenantId,
      storeId,
      orderNumber,
      cashierUserId,
      customerId: cart.customer?.id,
      customerName: cart.customer?.name,
      customerPhone: cart.customer?.phone,
      items: cart.items,
      subtotalAmount: cart.subtotal,
      discountAmount: cart.discountTotal,
      totalAmount: cart.grandTotal,
      paymentStatus: OrderPaymentStatus.PAID,
      fulfillmentStatus: OrderFulfillmentStatus.PENDING_ALLOCATION,
      paymentMethod: PaymentMethodType.CASH,
      paidAt: now,
      createdAt: now,
      updatedAt: now,
    };

    let printStatus: CheckoutExecutionResult['printStatus'] = undefined;
    if (autoPrint && this.printerService && tenantInfo) {
      printStatus = await this.printerService.printReceipt(order, tenantInfo);
    }

    cartManager.clear();

    return {
      order,
      changeDue,
      printStatus,
    };
  }

  /**
   * Executes PayLink WhatsApp checkout
   */
  async processPayLinkCheckout(
    tenantId: string,
    storeId: string,
    cashierUserId: string,
    cartManager: POSCartManager,
    paylinkBaseUrl: string = 'https://pay.sidaya.id/p',
  ): Promise<CheckoutExecutionResult> {
    const cart = cartManager.getState();
    if (cart.items.length === 0) {
      throw new Error('Keranjang belanja kosong.');
    }

    const now = new Date();
    const token = `tok_${Date.now().toString(36)}`;
    const paylinkUrl = `${paylinkBaseUrl}/${token}`;
    const orderNumber = `ORD-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `00000000-0000-0000-0005-${Math.floor(Date.now() / 1000).toString().padStart(12, '0')}`;

    const order: SalesOrder = {
      id: orderId,
      tenantId,
      storeId,
      orderNumber,
      cashierUserId,
      customerId: cart.customer?.id,
      customerName: cart.customer?.name,
      customerPhone: cart.customer?.phone,
      items: cart.items,
      subtotalAmount: cart.subtotal,
      discountAmount: cart.discountTotal,
      totalAmount: cart.grandTotal,
      paymentStatus: OrderPaymentStatus.UNPAID,
      fulfillmentStatus: OrderFulfillmentStatus.PENDING_ALLOCATION,
      paymentMethod: PaymentMethodType.PAYLINK_QRIS,
      paylinkUrl,
      createdAt: now,
      updatedAt: now,
    };

    const customerName = cart.customer?.name ?? 'Bapak / Ibu Pelanggan';
    const whatsAppMessageText = `Halo ${customerName},\nBerikut tagihan resmi pesanan #${orderNumber} senilai Rp${cart.grandTotal.toLocaleString('id-ID')}.\nSilakan selesaikan pembayaran via QRIS / Virtual Account di tautan resmi SiDaya:\n${paylinkUrl}\n\nTerima kasih!`;

    const phone = cart.customer?.phone ? cart.customer.phone.replace(/^0/, '62') : '';
    const whatsAppShareUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsAppMessageText)}`
      : `https://wa.me/?text=${encodeURIComponent(whatsAppMessageText)}`;

    cartManager.clear();

    return {
      order,
      changeDue: 0,
      whatsAppShareUrl,
      whatsAppMessageText,
    };
  }
}
