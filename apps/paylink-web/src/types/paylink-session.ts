import { OrderPaymentStatus, PaymentMethodType } from '@sidaya/shared-types';

export interface PayLinkItemSummary {
  productName: string;
  quantity: number;
  unitName: string;
  unitPrice: number;
  subtotal: number;
}

export interface PayLinkPortalSession {
  token: string;
  orderNumber: string;
  merchantName: string;
  recipientName: string;
  recipientPhone: string;
  items: PayLinkItemSummary[];
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: OrderPaymentStatus;
  selectedMethod: PaymentMethodType;
  qrString?: string | undefined;
  vaNumber?: string | undefined;
  expiresAt: Date | string;
}
