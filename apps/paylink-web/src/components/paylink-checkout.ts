import { PayLinkPortalSession } from '../types/paylink-session';

export class PayLinkCheckoutRenderer {
  /**
   * Generates a lightweight, responsive checkout markup for mobile browsers
   */
  static renderHTML(session: PayLinkPortalSession): string {
    const formattedTotal = `Rp${session.totalAmount.toLocaleString('id-ID')}`;
    const itemsHtml = session.items
      .map(
        (item) => `
        <div class="line-item">
          <div class="item-name">${item.productName}</div>
          <div class="item-meta">${item.quantity} ${item.unitName} &times; Rp${item.unitPrice.toLocaleString('id-ID')}</div>
          <div class="item-subtotal">Rp${item.subtotal.toLocaleString('id-ID')}</div>
        </div>
      `,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pembayaran ${session.orderNumber} - ${session.merchantName}</title>
  <style>
    :root {
      --primary: #2563EB;
      --bg: #F8FAFC;
      --card: #FFFFFF;
      --text: #0F172A;
      --muted: #64748B;
      --border: #E2E8F0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    .container {
      width: 100%;
      max-width: 480px;
      background: var(--card);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      padding: 24px;
    }
    .header { text-align: center; border-bottom: 1px dashed var(--border); padding-bottom: 16px; }
    .merchant-name { font-weight: 700; font-size: 1.15rem; }
    .order-ref { color: var(--muted); font-size: 0.85rem; margin-top: 4px; }
    .total-box { background: #EFF6FF; border-radius: 12px; padding: 16px; text-align: center; margin: 16px 0; }
    .total-label { font-size: 0.85rem; color: var(--muted); }
    .total-val { font-size: 1.6rem; font-weight: 800; color: var(--primary); margin-top: 4px; }
    .line-items { margin: 16px 0; }
    .line-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
    .qris-box { text-align: center; padding: 16px 0; }
    .qris-btn { background: #16A34A; color: #fff; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="merchant-name">${session.merchantName}</div>
      <div class="order-ref">Tagihan Pesanan #${session.orderNumber}</div>
    </div>
    <div class="total-box">
      <div class="total-label">Total Tagihan</div>
      <div class="total-val">${formattedTotal}</div>
    </div>
    <div class="line-items">
      ${itemsHtml}
    </div>
    <div class="qris-box">
      <button class="qris-btn">Buka Aplikasi E-Wallet / Bayar QRIS</button>
    </div>
  </div>
</body>
</html>`;
  }
}
