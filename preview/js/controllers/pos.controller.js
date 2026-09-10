/**
 * POS Controller: Barcode scanner, cart manipulation, checkout, and receipt printing
 */
const PosController = {
  handleBarcodeKey(e) {
    if (e.key === 'Enter') {
      this.handleBarcodeScanSubmit();
    }
  },

  handleBarcodeScanSubmit() {
    const input = document.getElementById('pos-barcode-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    const state = store.getState();
    const product = state.pilar5.products.find(
      p => p.sku.toLowerCase() === query.toLowerCase() || p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (product) {
      this.addToCart(product.id);
      input.value = '';
      showToast(`⚡ Berhasil menambahkan 1 ${product.unit} ${product.name}`);
    } else {
      showToast(`SKU '${query}' tidak ditemukan di katalog toko.`, 'warning');
    }
  },

  addToCart(productId) {
    store.dispatch('POS_ADD_TO_CART', { productId });
    this.refreshCartView();
  },

  updateCartQty(productId, delta) {
    store.dispatch('POS_UPDATE_CART_QTY', { productId, delta });
    this.refreshCartView();
  },

  clearCart() {
    store.dispatch('POS_CLEAR_CART');
    this.refreshCartView();
  },

  refreshCartView() {
    const container = document.getElementById('main-viewport');
    if (container && window.location.pathname.includes('/pos')) {
      container.innerHTML = PosView.render(store.getState());
    }
  },

  filterCategory(cat, btn) {
    document.querySelectorAll('.pos-filter-bar .filter-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const grid = document.getElementById('pos-product-grid');
    if (!grid) return;

    const products = store.getState().pilar5.products;
    const filtered = cat === 'ALL' ? products : products.filter(p => p.category === cat || p.name.toUpperCase().includes(cat));

    grid.innerHTML = filtered.map(p => `
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
    `).join('');
  },

  openCheckoutModal() {
    const state = store.getState();
    if (state.pilar5.cart.length === 0) {
      showToast('Keranjang masih kosong.', 'warning');
      return;
    }
    openModal('modal-checkout');
  },

  executeCheckout(method) {
    store.dispatch('POS_CHECKOUT', { method });
    closeModal();
    showToast(`✅ Transaksi berhasil diproses (${method})! Faktur & Surat Jalan diterbitkan.`);
    this.refreshCartView();
  },
};

// Global helper bindings
function handlePosBarcodeKey(e) { PosController.handleBarcodeKey(e); }
function handlePosBarcodeScanSubmit() { PosController.handleBarcodeScanSubmit(); }
function addToPosCart(id) { PosController.addToCart(id); }
function updatePosCartQty(id, delta) { PosController.updateCartQty(id, delta); }
function clearPosCart() { PosController.clearCart(); }
function filterPosCategory(cat, btn) { PosController.filterCategory(cat, btn); }
function openPosCheckoutModal() { PosController.openCheckoutModal(); }
function executePosCheckout(method) { PosController.executeCheckout(method); }
