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
  <link rel="icon" type="image/svg+xml" href="/brand/icon-transparent.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --brand-midnight: #090D1B;
      --brand-dark-knight: #12182B;
      --brand-masquerade: #262E4B;
      --brand-warm-blue: #5048E5;
      --brand-secret-mana: #3660FF;
      --brand-orchid: #828DF8;
      --brand-fennel: #10B77F;
      --brand-envy-love: #36D399;
      --brand-dr-white: #F8FAFC;
      --brand-ephemeral: #CBD5E1;
      --card-bg: #FFFFFF;
      --border: #E2E8F0;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--brand-midnight);
      background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
      background-size: 28px 28px;
      color: #0F172A;
      margin: 0;
      padding: 20px 16px 40px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      width: 100%;
      max-width: 440px;
      background: var(--card-bg);
      border-radius: 20px;
      box-shadow: 0 16px 40px -10px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1);
      padding: 24px;
      position: relative;
      overflow: hidden;
    }
    .container::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, var(--brand-warm-blue), var(--brand-secret-mana), var(--brand-fennel));
    }
    .header { text-align: center; border-bottom: 1px dashed var(--border); padding-bottom: 18px; }
    .merchant-name { font-weight: 800; font-size: 1.25rem; color: var(--brand-midnight); letter-spacing: -0.3px; }
    .order-ref { color: #64748B; font-size: 0.82rem; margin-top: 4px; font-weight: 600; }
    .status-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(16,183,127,0.1); color: var(--brand-fennel); font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-top: 8px; }
    
    .total-box {
      background: linear-gradient(135deg, rgba(54,96,255,0.06) 0%, rgba(80,72,229,0.06) 100%);
      border: 1px solid rgba(54,96,255,0.15);
      border-radius: 14px;
      padding: 18px;
      text-align: center;
      margin: 20px 0;
    }
    .total-label { font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.6px; }
    .total-val { font-size: 1.85rem; font-weight: 900; color: var(--brand-midnight); margin-top: 4px; letter-spacing: -0.5px; }
    
    .line-items { margin: 16px 0; max-height: 220px; overflow-y: auto; }
    .line-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 0.88rem; }
    .item-name { font-weight: 700; color: #1E293B; }
    .item-meta { font-size: 0.76rem; color: #64748B; margin-top: 2px; }
    .item-subtotal { font-weight: 700; color: var(--brand-midnight); }
    
    .qris-box { text-align: center; margin-top: 20px; }
    .qris-btn {
      width: 100%;
      background: linear-gradient(135deg, #10B77F 0%, #059669 100%);
      color: #fff;
      padding: 14px 20px;
      border-radius: 12px;
      border: none;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(16,183,127,0.35);
      transition: all 0.2s ease;
    }
    .qris-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,183,127,0.45); }
    
    .footer-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 20px;
      font-size: 0.72rem;
      color: var(--brand-ephemeral);
      font-weight: 600;
    }
    .footer-brand img { width: 16px; height: 16px; }
    .footer-brand span.bold { font-weight: 800; color: #F8FAFC; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="merchant-name">${session.merchantName}</div>
      <div class="order-ref">Tagihan Transaksi #${session.orderNumber}</div>
      <div class="status-badge">⚡ QRIS & Virtual Account Siap Bayar</div>
    </div>
    
    <div class="total-box">
      <div class="total-label">Total Pembayaran</div>
      <div class="total-val">${formattedTotal}</div>
    </div>
    
    <div class="line-items">
      ${itemsHtml}
    </div>
    
    <div class="qris-box">
      <button class="qris-btn" onclick="alert('Membuka gateway QRIS / Virtual Account...')">
        <span>📲</span> Bayar Instan (QRIS / VA)
      </button>
    </div>
  </div>

  <div class="footer-brand">
    <img src="/brand/icon-transparent.svg" alt="siDaya">
    <span>Terenkripsi & Terverifikasi oleh <span class="bold">siDaya</span> · <span style="color:#10B77F;">By</span> Ashvin Labs Idn</span>
  </div>
</body>
</html>`;
  }
}
