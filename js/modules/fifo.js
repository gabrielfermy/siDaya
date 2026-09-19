/**
 * ==========================================================================
 * PILAR 02: INBOUND & GUDANG BATCH FIFO (FIRST-IN, FIRST-OUT)
 * ==========================================================================
 */
function renderFifoTimeline(catalog, lots) {
  const container = document.getElementById('lot-timeline-container');
  if (!container) return;

  container.innerHTML = lots.map(l => {
    const product = catalog.find(c => c.sku === l.sku) || { name: l.sku, unit: 'Unit' };
    const percent = Math.round((l.qtyRemaining / l.qtyInitial) * 100);
    return `
      <div style="background:var(--bg-surface-elevated); padding:12px 14px; border-radius:var(--radius-sm); border:1px solid ${l.isOldest ? 'var(--accent-amber)' : 'var(--border-subtle)'};">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="tier-badge" style="background:${l.isOldest ? 'var(--accent-amber-soft)' : 'var(--primary-soft)'}; color:${l.isOldest ? 'var(--accent-amber)' : 'var(--primary)'};">
              ${l.isOldest ? '⭐ LOT TERTUA (FIFO PRIORITAS 1)' : 'LOT BATCH STANDBY'}
            </span>
            <strong style="font-size:0.85rem;">${l.id}</strong>
            <span style="font-size:0.75rem; color:var(--text-secondary);">(${product.name})</span>
          </div>
          <div style="font-size:0.78rem; font-weight:700;">
            Sisa: <span style="color:var(--primary); font-size:0.9rem;">${l.qtyRemaining}</span> / ${l.qtyInitial} ${product.unit} (${percent}%)
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted); margin-top:6px;">
          <span>Supplier: <strong>${l.supplier}</strong> • Masuk: ${l.receivedDate}</span>
          <span>Modal Beli: <strong>${formatRupiah(l.unitCost)}</strong> / ${product.unit}</span>
        </div>
      </div>
    `;
  }).join('');
}

function runFifoSimulation() {
  const qtyInput = document.getElementById('fifo-sim-input');
  const requested = parseInt(qtyInput?.value || '50', 10);
  const resBox = document.getElementById('fifo-sim-result');
  if (!resBox) return;

  const lots = store.getState().inventoryLots.filter(l => l.sku === 'RJL-50KG' && l.qtyRemaining > 0);
  let needed = requested;
  const breakdown = [];

  for (const lot of lots) {
    if (needed <= 0) break;
    const take = Math.min(needed, lot.qtyRemaining);
    const remainingAfter = lot.qtyRemaining - take;
    needed -= take;
    breakdown.push({
      lotId: lot.id,
      take,
      remainingAfter,
      status: remainingAfter === 0 ? 'Habis (0)' : `Sisa ${remainingAfter}`
    });
  }

  resBox.style.display = 'block';
  resBox.innerHTML = `
    <div style="font-weight:800; color:var(--primary); margin-bottom:6px;">Hasil Simulasi Alokasi FIFO (${requested} Karung):</div>
    ${breakdown.map((b, i) => `
      <div style="margin-bottom:3px;">
        ${i + 1}. <strong>${b.lotId}</strong>: Alokasi <strong>${b.take} Karung</strong> (${b.status}).
      </div>
    `).join('')}
    ${needed > 0 ? `<div style="color:var(--accent-rose); font-weight:700; margin-top:4px;">⚠️ Stok tidak cukup untuk ${needed} karung lagi.</div>` : `<div style="color:var(--accent-green); font-weight:700; margin-top:4px;">✅ Urutan batch tertua dieksekusi secara otomatis!</div>`}
  `;
}

function handleInboundLotSubmit(e) {
  e.preventDefault();
  const sku = document.getElementById('inbound-sku').value;
  const supplier = document.getElementById('inbound-supplier').value;
  const qty = parseInt(document.getElementById('inbound-qty').value, 10);
  const unitCost = parseInt(document.getElementById('inbound-cost').value, 10);

  store.dispatch('FIFO_ADD_INBOUND_LOT', { sku, supplier, qty, unitCost });
  store.dispatch('CLOSE_MODAL');
}
