/**
 * @fileoverview POS Checkout, Dynamic QRIS Simulator, and Thermal Receipt Controller
 * @module Controller:POS
 * @description
 * Manages fast-scan barcode input, commodity category filtering, cart state mutations,
 * interactive dynamic QRIS PayLink simulation, and 58mm/80mm ESC/POS thermal receipt printing.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

const PosController = {
  countdownTimer: null,
  lastCheckoutSnapshot: null,

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
    const container = document.getElementById('main-content');
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
    const state = store.getState();
    const cart = [...state.pilar5.cart];
    const subtotal = state.pilar5.cartSubtotal;
    const discount = state.pilar5.cartDiscount;
    const total = state.pilar5.cartTotal;

    this.lastCheckoutSnapshot = {
      cart,
      subtotal,
      discount,
      total,
      invNum: 'INV-20260910-' + Math.floor(100 + Math.random() * 900),
      timestamp: new Date(),
    };

    if (method === 'QRIS_PAYLINK') {
      closeModal();
      this.openQrisSimulator(total);
      return;
    }

    store.dispatch('POS_CHECKOUT', { method });
    closeModal();
    showToast(`✅ Transaksi berhasil diproses (${method})! Faktur & Surat Jalan diterbitkan.`);
    this.refreshCartView();
    this.renderThermalReceipt(this.lastCheckoutSnapshot, method);
    openModal('modal-thermal-receipt');
  },

  openQrisSimulator(total) {
    const nomEl = document.getElementById('qris-nominal');
    if (nomEl) nomEl.textContent = formatRupiah(total);

    let timeLeft = 14 * 60 + 59;
    const countEl = document.getElementById('qris-countdown');
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.countdownTimer = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(this.countdownTimer);
        return;
      }
      timeLeft--;
      const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const s = (timeLeft % 60).toString().padStart(2, '0');
      if (countEl) countEl.textContent = `${m}:${s}`;
    }, 1000);

    openModal('modal-qris-simulator');
  },

  simulateQrisSuccess() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    store.dispatch('POS_CHECKOUT', { method: 'QRIS_PAYLINK' });
    closeModal();
    showToast('⚡ Webhook Settlement Diterima: Pembayaran QRIS Berhasil Diverifikasi!');
    this.refreshCartView();

    if (this.lastCheckoutSnapshot) {
      this.renderThermalReceipt(this.lastCheckoutSnapshot, 'QRIS PAYLINK');
      openModal('modal-thermal-receipt');
    }
  },

  async createLiveXenditInvoice() {
    try {
      showToast('Menghubungi Xendit untuk menerbitkan invoice resmi...', 'info');
      const res = await fetch('/api/v1/billing/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'STARTER',
          businessName: 'Toko Beras Jaya (POS Kasir)',
          ownerEmail: 'ashvin.labs@gmail.com',
          ownerPhone: '08139506092',
          tenantSubdomain: 'berasjaya'
        })
      });
      const json = await res.json();
      if (json && json.success && json.data?.checkoutUrl) {
        window.open(json.data.checkoutUrl, '_blank');
        showToast('✅ Halaman pembayaran resmi Xendit berhasil dibuka di tab baru!', 'success');
      } else {
        throw new Error(json?.error?.message || 'Gagal membuat invoice');
      }
    } catch (e) {
      showToast('Gagal memuat invoice Xendit: ' + e.message, 'error');
    }
  },

  shareWhatsAppPayLink() {
    const total = this.lastCheckoutSnapshot?.total || 0;
    const inv = this.lastCheckoutSnapshot?.invNum || 'INV-001';
    const payBase = (typeof getSubdomainUrl === 'function') ? getSubdomainUrl('pay') : 'https://pay.sidaya.biz.id';
    const text = `Halo Pelanggan Toko Beras Jaya,\nBerikut tagihan resmi transaksi #${inv} senilai ${formatRupiah(total)}.\nSilakan bayar via QRIS di tautan resmi:\n${payBase}/p/${Date.now().toString(36)}\n\nTerima kasih!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  },

  renderThermalReceipt(snapshot, method) {
    if (!snapshot) return;
    const invEl = document.getElementById('rec-inv-num');
    const dateEl = document.getElementById('rec-date');
    const methodEl = document.getElementById('rec-method');
    const subtotalEl = document.getElementById('rec-subtotal');
    const discountEl = document.getElementById('rec-discount');
    const totalEl = document.getElementById('rec-grand-total');
    const itemsListEl = document.getElementById('rec-items-list');

    if (invEl) invEl.textContent = snapshot.invNum;
    if (dateEl) dateEl.textContent = snapshot.timestamp.toLocaleDateString('id-ID') + ' ' + snapshot.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (methodEl) methodEl.textContent = method;
    if (subtotalEl) subtotalEl.textContent = formatRupiah(snapshot.subtotal);
    if (discountEl) discountEl.textContent = snapshot.discount > 0 ? `- ${formatRupiah(snapshot.discount)}` : 'Rp 0';
    if (totalEl) totalEl.textContent = formatRupiah(snapshot.total);

    if (itemsListEl) {
      itemsListEl.innerHTML = snapshot.cart.map(item => `
        <div class="thermal-item-row">
          <div class="thermal-item-name">${item.name}</div>
          <div class="thermal-item-calc">
            <span>${item.qty} ${item.unit} x ${formatRupiah(item.price)}</span>
            <span>${formatRupiah(item.price * item.qty)}</span>
          </div>
        </div>
      `).join('');
    }
  },

  printThermalReceipt() {
    showToast('🖨️ Mengirim instruksi cetak ESC/POS ke printer Bluetooth kasir...');
  },

  shareWhatsAppReceipt() {
    const total = this.lastCheckoutSnapshot?.total || 0;
    const inv = this.lastCheckoutSnapshot?.invNum || 'INV-001';
    const text = `*TOKO GROSIR BERAS JAYA*\nStruk Resmi Transaksi: #${inv}\nTotal: ${formatRupiah(total)}\nStatus: LUNAS (PAID)\n\nTerima kasih atas kunjungan Anda!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
