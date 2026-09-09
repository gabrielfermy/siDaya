import { PayLinkPortalSession } from '../types/paylink-session';
import { OrderPaymentStatus, PaymentMethodType } from '@sidaya/shared-types';

export interface VirtualAccountOption {
  bankCode: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI';
  bankName: string;
  vaNumber: string;
  instructions: string[];
}

export interface IPayLinkClientService {
  loadSession(token: string): Promise<PayLinkPortalSession>;
  getVirtualAccountDetails(token: string, bank: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI'): Promise<VirtualAccountOption>;
  listenForPaymentSuccess(token: string, onPaid: () => void): () => void;
}

export class PayLinkClientService implements IPayLinkClientService {
  constructor(private readonly apiBaseUrl: string = 'https://api.sidaya.id/api/v1/public/paylink') {}

  async loadSession(token: string): Promise<PayLinkPortalSession> {
    void this.apiBaseUrl;

    return {
      token,
      orderNumber: 'ORD-20260908-0081',
      merchantName: 'Toko Beras Jaya Bersama',
      recipientName: 'Pak Haji Rahmat',
      recipientPhone: '081298765432',
      items: [
        {
          productName: 'Beras Rojolele Super Premium',
          quantity: 10,
          unitName: 'KARUNG 50KG',
          unitPrice: 650000,
          subtotal: 6500000,
        },
        {
          productName: 'Minyakita Bantal 1L (Dus 12x)',
          quantity: 5,
          unitName: 'DUS',
          unitPrice: 155000,
          subtotal: 775000,
        },
      ],
      subtotalAmount: 7275000,
      discountAmount: 180000, // Compound discount breakdown (5% + 2% + Rp5.000)
      totalAmount: 7095000,
      paymentStatus: OrderPaymentStatus.UNPAID,
      selectedMethod: PaymentMethodType.PAYLINK_QRIS,
      qrString: '00020101021226580014ID.LINKAJA.WWW01189360000201100000000215ORD202609080081520458125303360540',
      vaNumber: '7001298129381290',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  async getVirtualAccountDetails(token: string, bank: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI'): Promise<VirtualAccountOption> {
    void token;
    const vaPrefix: Record<string, string> = {
      BCA: '70012',
      MANDIRI: '88701',
      BRI: '01298',
      BNI: '98801',
    };

    return {
      bankCode: bank,
      bankName: `Bank ${bank}`,
      vaNumber: `${vaPrefix[bank]}081298765432`,
      instructions: [
        `Buka aplikasi Mobile Banking ${bank} atau ATM terdekat`,
        `Pilih menu Transfer > Virtual Account`,
        `Masukkan nomor VA dan konfirmasi nominal tepat`,
        `Simpan bukti pembayaran, transaksi Anda diverifikasi otomatis oleh SiDaya`,
      ],
    };
  }

  listenForPaymentSuccess(_token: string, onPaid: () => void): () => void {
    // If browser supports EventSource, listen to SSE stream:
    // const sse = new EventSource(`${this.apiBaseUrl}/${_token}/stream`);
    // sse.addEventListener('PAID', () => onPaid());

    // Simulated fallback polling
    const interval = setInterval(() => {
      // Periodic check
    }, 3000);

    return () => {
      clearInterval(interval);
      void onPaid;
    };
  }
}
