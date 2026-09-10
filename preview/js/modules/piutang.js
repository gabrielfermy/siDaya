/**
 * ==========================================================================
 * PILAR 07: BUKU PIUTANG & KASBON DAGANG
 * ==========================================================================
 */
function renderPiutangTable(piutangList) {
  const tbody = document.getElementById('piutang-tbody');
  if (!tbody) return;
  tbody.innerHTML = piutangList.map(p => `
    <tr>
      <td><strong>${p.invoiceId}</strong></td>
      <td>${p.customer} (${p.phone})</td>
      <td>${formatRupiah(p.totalAmount)}</td>
      <td style="font-weight:800; color:${p.remainingAmount > 0 ? 'var(--accent-rose)' : 'var(--accent-green)'};">${formatRupiah(p.remainingAmount)}</td>
      <td>${p.dueDate}</td>
      <td>
        <span class="tier-badge" style="background:${p.status === 'LUNAS' ? 'var(--accent-green-soft)' : (p.status === 'JATUH_TEMPO' ? 'var(--accent-rose-soft)' : 'var(--accent-amber-soft)')}; color:${p.status === 'LUNAS' ? 'var(--accent-green)' : (p.status === 'JATUH_TEMPO' ? 'var(--accent-rose)' : 'var(--accent-amber)')};">
          ${p.status}
        </span>
      </td>
      <td>
        <div style="display:flex; gap:6px;">
          ${p.remainingAmount > 0 ? `
            <button class="save-matrix-btn" style="padding:4px 8px; font-size:0.7rem; background:#059669;" onclick="store.dispatch('PIUTANG_SEND_REMINDER', { id: '${p.id}', customer: '${p.customer}', phone: '${p.phone}', remainingAmount: ${p.remainingAmount} })">📱 WA PayLink</button>
            <button class="save-matrix-btn" style="padding:4px 8px; font-size:0.7rem; background:var(--primary);" onclick="store.dispatch('PIUTANG_SETTLE', { id: '${p.id}' })">✅ Lunaskan</button>
          ` : `<span style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">- Terbayar -</span>`}
        </div>
      </td>
    </tr>
  `).join('');
}
