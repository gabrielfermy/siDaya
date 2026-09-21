/**
 * POS View (Pilar 05): Split-Screen Cashier, Barcode Action Bar, Product Grid, and Cart Drawer
 */
const PosView = {
  render(state) {
    const p5 = state?.pilar5 || (typeof INITIAL_DEFAULT_STATE !== 'undefined' ? INITIAL_DEFAULT_STATE.pilar5 : {});
    const products = p5.products || [];
    const cart = p5.cart || [];
    const customers = state?.pilar3?.customers || (typeof INITIAL_DEFAULT_STATE !== 'undefined' ? INITIAL_DEFAULT_STATE.pilar3.customers : []);
    const cartSubtotal = p5.cartSubtotal || 0;
    const cartDiscount = p5.cartDiscount || 0;
    const cartTotal = p5.cartTotal || 0;
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Kasir POS Grosir & Fast-Scan</h1>
          <p class="view-subtitle">Transaksi cepat multi-kemasan (Karung/Bal/Pcs) dengan alokasi FIFO otomatis.</p>
        </div>
        <div class="view-actions">
          <button id="tour-pos-shift-btn" class="btn btn-outline" onclick="openShiftCloseModal()">🔒 Tutup Shift Kasir</button>
        </div>
      </div>

      <!-- BARCODE FAST SCAN BAR -->
      <div id="tour-pos-scan" class="barcode-action-bar">
        <span class="barcode-icon">📷</span>
        <input id="pos-barcode-input" type="text" class="barcode-input" placeholder="Scan barcode / ketik SKU (lalu Enter)..." autofocus onkeypress="handlePosBarcodeKey(event)">
        <button class="btn btn-primary" onclick="handlePosBarcodeScanSubmit()">⚡ Tambah Cepat</button>
      </div>

      <div class="pos-layout">
        <!-- LEFT: PRODUCT CATALOG GRID -->
        <div id="tour-pos-grid" class="pos-products-col">
          <div class="pos-filter-bar">
            <button class="filter-pill active" onclick="filterPosCategory('ALL', this)">Semua Komoditas</button>
            <button class="filter-pill" onclick="filterPosCategory('BERAS', this)">Beras</button>
            <button class="filter-pill" onclick="filterPosCategory('MINYAK', this)">Minyak Goreng</button>
            <button class="filter-pill" onclick="filterPosCategory('GULA', this)">Gula Pasir</button>
            <button class="filter-pill" onclick="filterPosCategory('TEPUNG', this)">Tepung Terigu</button>
          </div>

          ${products.length > 0 ? `
            <div class="product-grid" id="pos-product-grid">
              ${products.map(p => `
                <div class="product-card" onclick="addToPosCart('${p.id}')">
                  <div class="product-card-body">
                    <div class="product-sku">${p.sku}</div>
                    <div class="product-name">${p.name}</div>
                    <div class="product-price">${formatRupiah(p.price)} <span class="product-unit">/${p.unit}</span></div>
                    <div class="product-stock-tag ${p.stock > 10 ? 'in-stock' : 'low-stock'}">
                      Stok: ${p.stock} ${p.unit}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="padding:48px 20px; text-align:center; background:var(--bg-card); border:1px dashed var(--border-color); border-radius:12px; margin-top:12px;">
              <div style="font-size:2.5rem; margin-bottom:10px;">📦</div>
              <div style="font-weight:700; font-size:1.05rem; color:var(--text-primary); margin-bottom:6px;">Katalog Kasir Belum Tersedia</div>
              <p style="font-size:0.8rem; color:var(--text-secondary); max-width:440px; margin:0 auto 16px auto; line-height:1.5;">
                Anda belum mendaftarkan komoditas ke Master SKU. Tambahkan produk pertama toko Anda agar kasir dapat melakukan scan barcode, menambah ke keranjang, dan mencetak struk thermal.
              </p>
              <div style="display:inline-flex; gap:8px;">
                <button class="btn btn-primary" onclick="openAddProductModal()">+ Tambah Produk SKU</button>
                <button class="btn btn-outline" onclick="navigate('/katalog')">🏷️ Buka Master SKU</button>
              </div>
            </div>
          `}
        </div>

        <!-- RIGHT: CART DRAWER & PAYMENT DISPATCH -->
        <div id="tour-pos-cart" class="pos-cart-col">
          <div class="card" style="height: 100%; display:flex; flex-direction:column;">
            <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
              <span>🛒 Keranjang Belanja</span>
              <button class="btn btn-outline" style="padding:2px 8px; font-size:0.7rem;" onclick="clearPosCart()">Kosongkan</button>
            </div>

            <!-- CUSTOMER SELECTION -->
            <div class="form-group" style="margin-top:10px;">
              <label class="form-label" style="font-size:0.75rem;">Pelanggan / Toko Pembeli</label>
              <select id="pos-customer-select" class="form-select" onchange="handlePosCustomerChange(this.value)">
                <option value="CASH_CUSTOMER">-- Pelanggan Umum (Tunai) --</option>
                ${customers.map(c => `
                  <option value="${c.id}">${c.name} (Plafon: ${formatRupiah(c.creditLimit - c.usedCredit)})</option>
                `).join('')}
              </select>
            </div>

            <!-- CART ITEMS LIST -->
            <div class="pos-cart-items-wrap" id="pos-cart-items">
              ${cart.length === 0 ? `
                <div class="empty-cart-state">
                  <span style="font-size:2rem;">🛒</span>
                  <p>Keranjang kosong. Scan barcode atau klik produk di sebelah kiri.</p>
                </div>
              ` : cart.map(item => `
                <div class="cart-item-row">
                  <div class="cart-item-top">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-subtotal">${formatRupiah(item.price * item.qty)}</div>
                  </div>
                  <div class="cart-item-bottom">
                    <div class="cart-item-price">${formatRupiah(item.price)} <span class="product-unit">/${item.unit}</span></div>
                    <div class="cart-item-controls">
                      <button class="qty-btn" onclick="updatePosCartQty('${item.id}', -1)" title="Kurang">-</button>
                      <span class="qty-label">${item.qty}</span>
                      <button class="qty-btn" onclick="updatePosCartQty('${item.id}', 1)" title="Tambah">+</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- CART SUMMARY & CHECKOUT BUTTON -->
            <div class="pos-cart-summary">
              <div class="summary-line">
                <span>Subtotal</span>
                <span id="pos-subtotal">${formatRupiah(cartSubtotal)}</span>
              </div>
              <div class="summary-line">
                <span>Diskon Grosir Bertingkat</span>
                <span id="pos-discount" style="color:var(--accent-green);">- ${formatRupiah(cartDiscount)}</span>
              </div>
              <div class="summary-line total-line">
                <span>Total Bayar</span>
                <span id="pos-total">${formatRupiah(cartTotal)}</span>
              </div>

              <button class="checkout-btn" ${cart.length === 0 ? 'disabled' : ''} onclick="openPosCheckoutModal()">
                <span>⚡</span> Bayar Sekarang (${formatRupiah(cartTotal)})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MOBILE STICKY CART JUMP BAR -->
      ${cart.length > 0 ? `
        <div class="pos-mobile-cart-bar" onclick="document.querySelector('.pos-cart-col')?.scrollIntoView({ behavior: 'smooth' })">
          <div class="pos-mobile-cart-summary">
            <span class="pos-mobile-cart-count">🛒 ${cart.reduce((sum, item) => sum + item.qty, 0)} Item</span>
            <span class="pos-mobile-cart-total">${formatRupiah(cartTotal)}</span>
          </div>
          <button class="pos-mobile-cart-btn" onclick="event.stopPropagation(); openPosCheckoutModal()">
            Bayar ⚡
          </button>
        </div>
      ` : ''}
    `;
  },
};
