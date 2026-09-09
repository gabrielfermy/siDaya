/**
 * ==========================================================================
 * PILAR 01: DASHBOARD & EXECUTIVE COMMAND CENTER
 * ==========================================================================
 */
function renderOwnerDashboardOverview(state) {
  const totalSales = state.sales.reduce((sum, s) => sum + s.totalAmount, 0) + 428500000;
  const totalLotsRemaining = state.inventoryLots.reduce((sum, l) => sum + l.qtyRemaining, 0);
  const totalPiutang = state.piutang.reduce((sum, p) => sum + p.remainingAmount, 0);

  const omzetEl = document.getElementById('kpi-omzet');
  const lotsEl = document.getElementById('kpi-total-lots');
  const sjEl = document.getElementById('kpi-total-sj');
  const piuEl = document.getElementById('kpi-total-piutang');

  if (omzetEl) omzetEl.textContent = formatRupiah(totalSales);
  if (lotsEl) lotsEl.textContent = `${totalLotsRemaining} Unit`;
  if (sjEl) sjEl.textContent = `${state.suratJalan.length} Pengiriman`;
  if (piuEl) piuEl.textContent = formatRupiah(totalPiutang);

  // Cash breakdown
  const cashEl = document.getElementById('dash-cash-total');
  const qrisEl = document.getElementById('dash-qris-total');
  const debtEl = document.getElementById('dash-debt-total');
  if (cashEl) cashEl.textContent = formatRupiah(totalSales - 12350000);
  if (qrisEl) qrisEl.textContent = formatRupiah(12350000);
  if (debtEl) debtEl.textContent = formatRupiah(totalPiutang);

  // FIFO preview
  const fifoPreviewEl = document.getElementById('dash-fifo-preview');
  if (fifoPreviewEl) {
    fifoPreviewEl.innerHTML = state.inventoryLots.slice(0, 3).map(l => {
      const p = state.catalog.find(c => c.sku === l.sku) || { name: l.sku, unit: 'Unit' };
      return `
        <div style="display:flex; justify-content:space-between; padding:6px 8px; background:var(--bg-surface-elevated); border-radius:var(--radius-sm); border:1px solid ${l.isOldest ? 'var(--accent-amber)' : 'var(--border-subtle)'};">
          <span>${l.isOldest ? '⭐ ' : ''}<strong>${l.id}</strong> (${p.name})</span>
          <strong style="color:var(--primary);">${l.qtyRemaining} ${p.unit}</strong>
        </div>
      `;
    }).join('');
  }

  // Recent sales
  const recentTbody = document.getElementById('dash-recent-sales-tbody');
  if (recentTbody) {
    recentTbody.innerHTML = state.sales.slice(0, 5).map(s => `
      <tr>
        <td><strong>${s.id}</strong></td>
        <td>${s.createdAt}</td>
        <td>${s.customer}</td>
        <td style="font-weight:800; color:var(--primary);">${formatRupiah(s.totalAmount)}</td>
        <td><span class="tier-badge ${s.paymentMethod === 'TUNAI' ? 'tier-grosir-pro' : 'tier-starter-free'}">${s.paymentMethod}</span></td>
        <td><span class="tier-badge" style="background:var(--accent-green-soft); color:var(--accent-green);">${s.status}</span></td>
      </tr>
    `).join('');
  }
}
