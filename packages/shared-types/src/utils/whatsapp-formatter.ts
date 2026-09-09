export interface WhatsAppInvoicePayload {
  customerName?: string | undefined;
  customerPhone?: string | undefined;
  merchantName: string;
  orderNumber: string;
  totalAmount: number;
  paylinkUrl: string;
  itemCount: number;
  dueDate?: string | undefined;
}

/**
 * Formats a professional and polite Indonesian WhatsApp invoice notification
 */
export function formatWhatsAppInvoiceMessage(payload: WhatsAppInvoicePayload): string {
  const greeting = payload.customerName ? `Halo Bapak/Ibu ${payload.customerName},` : 'Halo Pelanggan yang Terhormat,';
  const totalFormatted = `Rp${Math.round(payload.totalAmount).toLocaleString('id-ID')}`;

  const lines = [
    greeting,
    '',
    `Terima kasih telah berbelanja di *${payload.merchantName}*.`,
    `Berikut rincian tagihan pesanan Anda:`,
    `• No. Faktur : *#${payload.orderNumber}*`,
    `• Jumlah Item: ${payload.itemCount} barang`,
    `• Total Bayar: *${totalFormatted}*`,
  ];

  if (payload.dueDate) {
    lines.push(`• Jatuh Tempo: ${payload.dueDate}`);
  }

  lines.push(
    '',
    `Silakan selesaikan pembayaran melalui tautan portal resmi SiDaya berikut:`,
    `${payload.paylinkUrl}`,
    '',
    `_Tautan di atas mendukung pembayaran instan via QRIS (BCA, GoPay, OVO, ShopeePay) & Virtual Account._`,
    `_Nota dan status pembayaran akan terverifikasi otomatis._`,
  );

  return lines.join('\n');
}

/**
 * Generates direct wa.me link with encoded text
 */
export function encodeWhatsAppShareUrl(phoneNumber: string | undefined, messageText: string): string {
  const cleanPhone = (phoneNumber ?? '')
    .replace(/[^0-9]/g, '')
    .replace(/^0/, '62');

  const encodedText = encodeURIComponent(messageText);

  if (cleanPhone.length >= 8) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
