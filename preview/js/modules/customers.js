/**
 * ==========================================================================
 * PILAR 03: DIREKTORI PELANGGAN & CRM
 * ==========================================================================
 */
function renderCustomerTable(customers) {
  const tbody = document.getElementById('customers-master-tbody');
  const totalEl = document.getElementById('cust-kpi-total');
  const plafonEl = document.getElementById('cust-kpi-plafon');
  const debtEl = document.getElementById('cust-kpi-debt');
  const primeEl = document.getElementById('cust-kpi-prime');

  const totalPlafon = customers.reduce((sum, c) => sum + (c.creditLimit || 0), 0);
  const totalDebt = customers.reduce((sum, c) => sum + (c.currentDebt || 0), 0);
  const primeCount = customers.filter(c => c.tier === 'PRIME_WHOLESALE').length;
  const debtCount = customers.filter(c => (c.currentDebt || 0) > 0).length;

  if (totalEl) totalEl.textContent = `${customers.length} Toko`;
  if (plafonEl) plafonEl.textContent = formatRupiah(totalPlafon);
  if (debtEl) debtEl.textContent = formatRupiah(totalDebt);
  if (primeEl) primeEl.textContent = `${primeCount} Toko`;

  const debtSubEl = document.querySelector('#cust-kpi-debt + .kpi-sub');
  if (debtSubEl) debtSubEl.textContent = `${debtCount} Pelanggan Ada Tagihan`;

  if (!tbody) return;

  tbody.innerHTML = customers.map(c => `
    <tr>
      <td>
        <strong>${c.storeName}</strong>
        <div style="font-size:0.72rem; color:var(--text-muted);">PIC: ${c.name} • <code>${c.id}</code></div>
      </td>
      <td>
        <div>📱 <strong>${c.phone}</strong></div>
        <div style="font-size:0.72rem; color:var(--text-secondary); max-width:240px; white-space:normal;">${c.address}</div>
      </td>
      <td><strong>${formatRupiah(c.creditLimit)}</strong></td>
      <td style="font-weight:800; color:${c.currentDebt > 0 ? 'var(--accent-rose)' : 'var(--accent-green)'};">
        ${formatRupiah(c.currentDebt)}
        ${c.currentDebt > 0 ? `<div style="font-size:0.68rem; color:var(--accent-rose);">⚠️ Kasbon Aktif</div>` : `<div style="font-size:0.68rem; color:var(--accent-green);">Lunas</div>`}
      </td>
      <td>
        <div style="font-weight:700;">${formatRupiah(c.totalSpend)}</div>
        <div style="font-size:0.7rem; color:var(--text-muted);">${c.totalOrders} Transaksi</div>
      </td>
      <td>
        <span class="tier-badge ${c.tier === 'PRIME_WHOLESALE' ? 'tier-grosir-pro' : (c.tier === 'GROSIR_REGULER' ? 'tier-starter-free' : '')}" style="${c.tier === 'WARUNG_CASH' ? 'background:var(--bg-surface-elevated); color:var(--text-secondary); border:1px solid var(--border-medium);' : ''}">
          ${c.tier === 'PRIME_WHOLESALE' ? '⭐ PRIME' : (c.tier === 'GROSIR_REGULER' ? 'GROSIR' : 'WARUNG')}
        </span>
      </td>
      <td>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${c.currentDebt > 0 ? `
            <button class="save-matrix-btn" style="padding:4px 8px; font-size:0.7rem; background:#059669;" onclick="store.dispatch('PIUTANG_SEND_REMINDER', { id: '${c.id}', customer: '${c.storeName}', phone: '${c.phone}', remainingAmount: ${c.currentDebt} })">📱 WA PayLink</button>
          ` : ''}
          <button class="save-matrix-btn" style="padding:4px 8px; font-size:0.7rem; background:var(--bg-surface-elevated); color:var(--text-primary); border:1px solid var(--border-medium);" onclick="showToast('Riwayat transaksi ${c.storeName} dimuat', 'info')">📜 Riwayat</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function handleAddCustomerSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('cust-name').value;
  const storeName = document.getElementById('cust-store').value;
  const phone = document.getElementById('cust-phone').value;
  const tier = document.getElementById('cust-tier').value;
  const address = document.getElementById('cust-address').value;
  const creditLimit = parseInt(document.getElementById('cust-credit-limit').value, 10) || 0;

  store.dispatch('CUSTOMER_ADD', { name, storeName, phone, tier, address, creditLimit });
  store.dispatch('CLOSE_MODAL');
}
