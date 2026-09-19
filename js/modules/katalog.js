/**
 * ==========================================================================
 * PILAR 02: MASTER KATALOG SKU & BARCODE EAN-13
 * ==========================================================================
 */
function renderKatalogMasterTable(catalog, lots, isOwner) {
  const tbody = document.getElementById('katalog-master-tbody');
  if (!tbody) return;
  tbody.innerHTML = catalog.map(p => {
    const stock = lots.filter(l => l.sku === p.sku).reduce((sum, l) => sum + l.qtyRemaining, 0);
    return `
      <tr>
        <td><code>${p.barcode}</code></td>
        <td><strong>${p.name}</strong> <span style="font-size:0.7rem; color:var(--text-muted);">(${p.sku})</span></td>
        <td><span class="tier-badge tier-starter-free">${p.category}</span></td>
        <td>${p.unit}</td>
        <td><strong>${isOwner ? formatRupiah(p.costPrice) : '🔒 Masked (Owner Only)'}</strong></td>
        <td style="font-weight:800; color:var(--primary);">${formatRupiah(p.price)}</td>
        <td style="font-weight:800; color:var(--accent-green);">${stock} ${p.unit}</td>
      </tr>
    `;
  }).join('');
}

function handleAddProductSubmit(e) {
  e.preventDefault();
  const sku = document.getElementById('prod-sku').value;
  const barcode = document.getElementById('prod-barcode').value;
  const name = document.getElementById('prod-name').value;
  const category = document.getElementById('prod-cat').value;
  const unit = document.getElementById('prod-unit').value;
  const costPrice = parseInt(document.getElementById('prod-cost').value, 10);
  const price = parseInt(document.getElementById('prod-price').value, 10);

  store.dispatch('KATALOG_ADD_PRODUCT', {
    sku, barcode, name, category, unit, costPrice, price, icon: '📦'
  });
  store.dispatch('CLOSE_MODAL');
}
