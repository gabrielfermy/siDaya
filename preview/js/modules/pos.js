/**
 * ==========================================================================
 * PILAR 05: KASIR GROSIR & BARCODE FAST-SCAN (POS)
 * ==========================================================================
 */
function renderPosCatalog(catalog, lots) {
  const grid = document.getElementById('pos-catalog-grid');
  if (!grid) return;
  grid.innerHTML = catalog.map(p => {
    const availableStock = lots.filter(l => l.sku === p.sku).reduce((sum, l) => sum + l.qtyRemaining, 0);
    return `
      <div class="product-card" onclick="store.dispatch('POS_ADD_TO_CART', ${JSON.stringify(p).replace(/"/g, '&quot;')})">
        <div>
          <div style="font-size:1.8rem; margin-bottom:4px;">${p.icon}</div>
          <strong style="font-size:0.86rem; color:var(--text-primary);">${p.name}</strong>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">Barcode: <code>${p.barcode}</code></div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">Stok FIFO: <strong>${availableStock} ${p.unit}</strong></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
          <span style="font-weight:800; color:var(--primary); font-size:0.92rem;">${formatRupiah(p.price)}</span>
          <button class="save-matrix-btn" style="padding:4px 8px; font-size:0.7rem;">+ Tambah</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderPosCart(cart) {
  const el = document.getElementById('pos-cart-list');
  const qtyEl = document.getElementById('pos-cart-qty');
  const grandEl = document.getElementById('pos-grand-total');

  if (!el) return;

  if (cart.length === 0) {
    el.innerHTML = `<div style="text-align:center; padding:24px 0; color:var(--text-muted); font-size:0.78rem;">Keranjang belanja kasir kosong.</div>`;
    if (qtyEl) qtyEl.textContent = '0 Unit';
    if (grandEl) grandEl.textContent = 'Rp 0';
    return;
  }

  let totalQty = 0;
  let grandTotal = 0;

  el.innerHTML = cart.map(item => {
    totalQty += item.qty;
    grandTotal += item.subtotal;
    return `
      <div style="background:var(--bg-surface-elevated); padding:8px 10px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; font-size:0.8rem;">${item.name}</div>
          <div style="font-size:0.7rem; color:var(--text-muted);">${formatRupiah(item.unitPrice)} / unit</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button class="qty-btn" onclick="store.dispatch('POS_UPDATE_QTY', { sku: '${item.sku}', delta: -1 })">-</button>
          <span style="font-weight:800; font-size:0.82rem; min-width:18px; text-align:center;">${item.qty}</span>
          <button class="qty-btn" onclick="store.dispatch('POS_UPDATE_QTY', { sku: '${item.sku}', delta: 1 })">+</button>
          <strong style="font-size:0.84rem; min-width:85px; text-align:right; margin-left:4px;">${formatRupiah(item.subtotal)}</strong>
        </div>
      </div>
    `;
  }).join('');

  if (qtyEl) qtyEl.textContent = `${totalQty} Unit`;
  if (grandEl) grandEl.textContent = formatRupiah(grandTotal);
}

function handlePosCheckout(method) {
  store.dispatch('POS_CHECKOUT', method);
}

function handleBarcodeKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = e.target.value;
    store.dispatch('POS_SCAN_BARCODE', val);
    e.target.value = '';
  }
}

function handleScanBarcodeManual() {
  const input = document.getElementById('pos-barcode-input');
  if (input && input.value) {
    store.dispatch('POS_SCAN_BARCODE', input.value);
    input.value = '';
  } else {
    const catalog = store.getState().catalog;
    const rand = catalog[Math.floor(Math.random() * catalog.length)];
    store.dispatch('POS_SCAN_BARCODE', rand.barcode);
  }
}
