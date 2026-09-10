/**
 * ==========================================================================
 * PILAR 05: FAKTUR PENJUALAN & NOTA DAGANG
 * ==========================================================================
 */
function renderInvoicesTable(sales) {
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody) return;

  tbody.innerHTML = sales.map(s => `
    <tr>
      <td><strong>${s.id}</strong></td>
      <td>${s.createdAt}</td>
      <td><strong>${s.customer}</strong></td>
      <td style="font-weight:800; color:var(--primary);">${formatRupiah(s.totalAmount)}</td>
      <td><span class="tier-badge ${s.paymentMethod === 'TUNAI' ? 'tier-grosir-pro' : 'tier-starter-free'}">${s.paymentMethod}</span></td>
      <td><span class="tier-badge" style="background:var(--accent-green-soft); color:var(--accent-green);">${s.status}</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="save-matrix-btn" style="padding:4px 8px; font-size:0.7rem;" onclick="store.dispatch('OPEN_MODAL', 'receipt'); renderReceiptModal('${s.id}', ${s.totalAmount}, '${s.paymentMethod}', ${JSON.stringify(s.allocations || []).replace(/"/g, '&quot;')})">🖨️ Cetak Nota</button>
          <button class="save-matrix-btn" style="padding:4px 8px; font-size:0.7rem; background:var(--bg-surface-elevated); color:var(--text-primary); border:1px solid var(--border-medium);" onclick="switchModule('sj')">🚚 Surat Jalan</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderReceiptModal(invId, total, method, allocations) {
  document.getElementById('receipt-invoice-no').textContent = `No. Faktur: ${invId} • Metode: ${method}`;
  const el = document.getElementById('receipt-fifo-breakdown');
  if (!el) return;
  el.innerHTML = `
    <div style="font-weight:800; margin-bottom:6px; color:var(--text-primary);">Total Dibayar: ${formatRupiah(total)}</div>
    <div style="font-size:0.72rem; font-weight:700; color:var(--accent-green); margin-bottom:6px;">📦 Rincian Alokasi Lot FIFO:</div>
    ${allocations.map(a => `
      <div style="margin-bottom:2px; font-size:0.72rem;">
        • ${a.productName || 'Komoditas'}: <strong>${a.qtyDeducted} unit</strong> diambil dari <code>${a.lotId}</code> (Sisa: ${a.qtyRemaining})
      </div>
    `).join('')}
  `;
}
