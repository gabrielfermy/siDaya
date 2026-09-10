import http from 'http';
import { DeliveryOrderDomainService } from '../services/delivery-order.service';
import { sendJson } from '../middleware/cors.middleware';
import { parseRequestBody } from '../middleware/body-parser.middleware';
import { SalesOrder, OrderPaymentStatus, OrderFulfillmentStatus, PaymentMethodType } from '@sidaya/shared-types';

export class DeliveryController {
  constructor(private deliveryService: DeliveryOrderDomainService) {}

  public async createDeliveryOrder(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'c4b8e219-9831-482a-bc91-23a9cf8e12d4';
    const body = await parseRequestBody(req);
    const orderId = (body['orderId'] || '00000000-0000-0000-0000-000000000001') as string;
    const recipientName = (body['recipientName'] || 'Penerima') as string;
    const recipientPhone = (body['recipientPhone'] || '+628123456789') as string;
    const destinationAddress = (body['destinationAddress'] || body['address'] || 'Alamat Toko') as string;
    const driverName = (body['driverName'] || 'Supir Logistik') as string;
    const vehiclePlateNumber = (body['vehiclePlateNumber'] || body['plate'] || 'B 1234 ABC') as string;

    const mockOrder: SalesOrder = {
      id: orderId,
      tenantId,
      storeId: '00000000-0000-0000-0000-000000000002',
      cashierUserId: '00000000-0000-0000-0000-000000000003',
      orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
      paymentMethod: PaymentMethodType.CASH,
      paymentStatus: OrderPaymentStatus.PAID,
      fulfillmentStatus: OrderFulfillmentStatus.PENDING_ALLOCATION,
      totalAmount: Number(body['totalAmount'] || 0),
      subtotalAmount: Number(body['subtotalAmount'] || 0),
      discountAmount: 0,
      items: (body['items'] as any[]) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const doRecord = this.deliveryService.createDeliveryManifest(mockOrder, {
        driverName,
        vehiclePlateNumber,
        recipientName,
        recipientPhone,
        destinationAddress,
        pickupBinLabel: body['pickupBinLabel'] as string | undefined,
        notes: body['notes'] as string | undefined,
      });
      sendJson(res, 201, { success: true, data: doRecord });
    } catch (err: any) {
      sendJson(res, 500, { success: false, error: { message: err.message || 'Create delivery order failed.' } });
    }
  }

  public async completePod(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    params: Record<string, string>,
  ): Promise<void> {
    const doId = params['id'] || '';
    const body = await parseRequestBody(req);
    const recipientSignature = body['recipientSignature'] as string;

    if (!doId || !recipientSignature) {
      sendJson(res, 400, {
        success: false,
        error: { message: 'doId and recipientSignature are required.' },
      });
      return;
    }

    try {
      const completed = this.deliveryService.signDeliveryManifest({
        deliveryOrderId: doId,
        recipientSignature,
        driverSignature: body['driverSignature'] as string | undefined,
        recipientNotes: body['recipientNotes'] as string | undefined,
      });
      sendJson(res, 200, { success: true, data: completed });
    } catch (err: any) {
      sendJson(res, 500, { success: false, error: { message: err.message || 'Complete POD failed.' } });
    }
  }
}
