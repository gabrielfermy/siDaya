/**
 * ==========================================================================
 * REACTIVE STATE MANAGEMENT ENGINE (ZUSTAND PATTERN)
 * ==========================================================================
 */
class SiDayaStateStore {
  constructor() {
    this.subscribers = new Set();
    this.state = this.loadState();
  }

  getInitialPortalMode() {
    const hostname = window.location.hostname.toLowerCase();
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (hostname.startsWith('ops.') || path.startsWith('ops') || path === 'telemetry' || path === 'fleet' || path === 'operators' || path === 'audit') {
      return 'OPS';
    }
    return 'MERCHANT';
  }

  getInitialPath(portalMode) {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (path && path !== '') return path;
    return portalMode === 'OPS' ? 'telemetry' : 'dashboard';
  }

  loadState() {
    const portalMode = this.getInitialPortalMode();
    const activePath = this.getInitialPath(portalMode);
    
    let stored = null;
    try {
      const raw = localStorage.getItem('sidaya_store_v3');
      if (raw) stored = JSON.parse(raw);
    } catch (e) {}

    const merged = stored && stored.version === 3 ? stored : JSON.parse(JSON.stringify(INITIAL_DEFAULT_STATE));

    merged.ui.portalMode = portalMode;
    merged.ui.activePath = activePath;
    merged.ui.theme = localStorage.getItem('sidaya_theme') || merged.ui.theme || 'light';
    merged.ui.sidebarOpen = false;
    merged.ui.activeModal = null;

    return merged;
  }

  saveState() {
    try {
      localStorage.setItem('sidaya_store_v3', JSON.stringify(this.state));
      localStorage.setItem('sidaya_theme', this.state.ui.theme);
      if (this.state.auth.merchantUser) {
        localStorage.setItem('sidaya_merchant_session', JSON.stringify(this.state.auth.merchantUser));
      } else {
        localStorage.removeItem('sidaya_merchant_session');
      }
      if (this.state.auth.operatorUser) {
        localStorage.setItem('sidaya_operator_session', JSON.stringify(this.state.auth.operatorUser));
      } else {
        localStorage.removeItem('sidaya_operator_session');
      }
    } catch (e) {}
  }

  getState() {
    return this.state;
  }

  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  notify() {
    this.saveState();
    this.subscribers.forEach(sub => sub(this.state));
  }

  dispatch(action, payload) {
    switch (action) {
      case 'NAVIGATE': {
        const raw = (payload || '').replace(/^\/+|\/+$/g, '').toLowerCase();
        this.state.ui.activePath = raw || (this.state.ui.portalMode === 'OPS' ? 'telemetry' : 'dashboard');
        this.state.ui.sidebarOpen = false;
        break;
      }
      case 'TOGGLE_THEME': {
        this.state.ui.theme = this.state.ui.theme === 'light' ? 'dark' : 'light';
        break;
      }
      case 'TOGGLE_SIDEBAR': {
        this.state.ui.sidebarOpen = !this.state.ui.sidebarOpen;
        break;
      }
      case 'CLOSE_SIDEBAR': {
        this.state.ui.sidebarOpen = false;
        break;
      }
      case 'OPEN_MODAL': {
        this.state.ui.activeModal = payload;
        break;
      }
      case 'CLOSE_MODAL': {
        this.state.ui.activeModal = null;
        break;
      }
      case 'LOGIN_MERCHANT': {
        this.state.auth.merchantUser = payload;
        this.state.ui.activePath = 'dashboard';
        showToast(`Selamat datang, ${payload.name}!`, 'success');
        break;
      }
      case 'LOGIN_OPERATOR': {
        this.state.auth.operatorUser = payload;
        this.state.ui.activePath = 'telemetry';
        showToast(`Operator ${payload.name} terautentikasi.`, 'success');
        break;
      }
      case 'LOGOUT': {
        if (this.state.ui.portalMode === 'OPS') {
          this.state.auth.operatorUser = null;
        } else {
          this.state.auth.merchantUser = null;
        }
        this.state.ui.activePath = 'login';
        this.state.ui.sidebarOpen = false;
        showToast('Anda telah keluar.', 'info');
        break;
      }
      
      /* POS & Barcode Actions */
      case 'POS_ADD_TO_CART': {
        const product = payload;
        const existing = this.state.cart.find(c => c.sku === product.sku);
        if (existing) {
          existing.qty += 1;
          existing.subtotal = existing.qty * existing.unitPrice;
        } else {
          this.state.cart.push({
            sku: product.sku,
            name: product.name,
            unitPrice: product.price,
            qty: 1,
            subtotal: product.price
          });
        }
        showToast(`🛒 Ditambahkan: ${product.name}`, 'info');
        break;
      }
      case 'POS_SCAN_BARCODE': {
        const query = (payload || '').trim().toLowerCase();
        const product = this.state.catalog.find(c => c.barcode === query || c.sku.toLowerCase() === query || c.name.toLowerCase().includes(query));
        if (product) {
          this.dispatch('POS_ADD_TO_CART', product);
          showToast(`⚡ Barcode Ditemukan: ${product.name}`, 'success');
        } else {
          showToast(`❌ Barcode ${query} tidak ditemukan dalam katalog!`, 'error');
        }
        break;
      }
      case 'POS_UPDATE_QTY': {
        const { sku, delta } = payload;
        const idx = this.state.cart.findIndex(c => c.sku === sku);
        if (idx !== -1) {
          this.state.cart[idx].qty += delta;
          if (this.state.cart[idx].qty <= 0) {
            this.state.cart.splice(idx, 1);
          } else {
            this.state.cart[idx].subtotal = this.state.cart[idx].qty * this.state.cart[idx].unitPrice;
          }
        }
        break;
      }
      case 'POS_CLEAR_CART': {
        this.state.cart = [];
        showToast('Keranjang dikosongkan.', 'info');
        break;
      }
      case 'POS_CHECKOUT': {
        if (this.state.cart.length === 0) {
          showToast('Keranjang kasir masih kosong!', 'error');
          return;
        }
        const paymentMethod = payload;
        const grandTotal = this.state.cart.reduce((sum, item) => sum + item.subtotal, 0);
        const invId = 'INV-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(100 + Math.random() * 900);

        // FIFO Automatic Inventory Lot Deduction
        const allocations = [];
        this.state.cart.forEach(cartItem => {
          let qtyNeeded = cartItem.qty;
          const matchingLots = this.state.inventoryLots
            .filter(l => l.sku === cartItem.sku && l.qtyRemaining > 0)
            .sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate));

          for (const lot of matchingLots) {
            if (qtyNeeded <= 0) break;
            const deduct = Math.min(lot.qtyRemaining, qtyNeeded);
            lot.qtyRemaining -= deduct;
            qtyNeeded -= deduct;
            allocations.push({
              sku: cartItem.sku,
              productName: cartItem.name,
              lotId: lot.id,
              qtyDeducted: deduct,
              qtyRemaining: lot.qtyRemaining
            });
          }
        });

        // Add to sales
        this.state.sales.unshift({
          id: invId,
          createdAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          customer: 'Pelanggan Grosir Tunai',
          totalAmount: grandTotal,
          paymentMethod,
          status: 'SELESAI',
          items: [...this.state.cart],
          allocations
        });

        // Create Surat Jalan
        const sjId = 'SJ-' + invId.replace('INV-', '');
        this.state.suratJalan.unshift({
          id: sjId,
          invoiceId: invId,
          driverName: 'Joko Supir',
          recipientName: 'Pelanggan Grosir (' + invId + ')',
          address: 'Ambil di Toko / Armada Pengiriman',
          items: this.state.cart.map(i => `${i.qty} ${i.name}`).join(', '),
          status: 'SIAP_DIKIRIM',
          createdAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        });

        // Clear Cart
        this.state.cart = [];
        this.state.ui.activeModal = 'receipt';

        renderReceiptModal(invId, grandTotal, paymentMethod, allocations);
        showToast(`🎉 Pembayaran ${paymentMethod} berhasil! Faktur: ${invId}`, 'success');
        break;
      }

      /* Catalog & Inbound Actions */
      case 'KATALOG_ADD_PRODUCT': {
        this.state.catalog.push(payload);
        showToast(`Produk ${payload.name} terdaftar di katalog.`, 'success');
        break;
      }
      case 'FIFO_ADD_INBOUND_LOT': {
        const lotId = `LOT-${payload.sku}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
        this.state.inventoryLots.unshift({
          id: lotId,
          sku: payload.sku,
          qtyInitial: payload.qty,
          qtyRemaining: payload.qty,
          unitCost: payload.unitCost,
          receivedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          supplier: payload.supplier,
          isOldest: false
        });
        showToast(`📦 Lot ${lotId} berhasil dicatat ke gudang!`, 'success');
        break;
      }
      case 'SJ_UPDATE_STATUS': {
        const { sjId, status } = payload;
        const sj = this.state.suratJalan.find(s => s.id === sjId);
        if (sj) {
          sj.status = status;
          showToast(`Surat Jalan ${sjId} diperbarui: ${status}`, 'success');
        }
        break;
      }
      case 'PIUTANG_SEND_REMINDER': {
        const { customer, phone, remainingAmount } = payload;
        const payUrl = `http://pay.localhost:3333/pay/${payload.id}`;
        showToast(`📱 WA PayLink terkirim ke ${customer} (${phone}): ${formatRupiah(remainingAmount)}`, 'success');
        break;
      }
      case 'PIUTANG_SETTLE': {
        const p = this.state.piutang.find(item => item.id === payload.id);
        if (p) {
          p.remainingAmount = 0;
          p.status = 'LUNAS';
          showToast(`✅ Kasbon ${p.invoiceId} (${p.customer}) telah LUNAS.`, 'success');
        }
        break;
      }

      /* Operator Actions */
      case 'OPS_TOGGLE_PII_MASK': {
        this.state.operator.isPiiMasked = !this.state.operator.isPiiMasked;
        showToast(this.state.operator.isPiiMasked ? '🛡️ Sensor PII UU PDP Aktif' : '🔓 Mode Break-Glass Terbuka', 'info');
        break;
      }
      case 'OPS_INVITE_OPERATOR': {
        this.state.operator.operators.push({
          name: payload.fullName,
          email: payload.email,
          role: payload.role,
          status: 'ACTIVE'
        });
        showToast(`Operator ${payload.fullName} berhasil diundang!`, 'success');
        break;
      }

      /* CRM & Staff Actions */
      case 'CUSTOMER_ADD': {
        const custId = 'CUST-' + String(this.state.customers.length + 1).padStart(3, '0');
        this.state.customers.unshift({
          id: custId,
          name: payload.name,
          storeName: payload.storeName,
          phone: payload.phone,
          address: payload.address,
          creditLimit: payload.creditLimit,
          currentDebt: 0,
          totalOrders: 0,
          totalSpend: 0,
          tier: payload.tier || 'GROSIR_REGULER',
          status: 'ACTIVE'
        });
        showToast(`👥 Pelanggan ${payload.storeName} (${payload.name}) berhasil didaftarkan!`, 'success');
        break;
      }
      case 'STAFF_INVITE': {
        this.state.staff.push({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: payload.role,
          status: 'VERIFIED',
          pinConfigured: false
        });
        showToast(`✉️ Undangan staf dikirim ke ${payload.email}`, 'success');
        break;
      }
      case 'STAFF_RESET_PIN': {
        const st = this.state.staff.find(s => s.email === payload.email);
        if (st) {
          st.pinConfigured = true;
          showToast(`🔑 PIN cepat staf ${st.name} berhasil diatur ulang (HMAC timing-safe).`, 'success');
        }
        break;
      }
      case 'ROLE_MATRIX_SAVE': {
        this.state.rolePermissions = payload;
        showToast('🛡️ Matriks otoritas RBAC berhasil disimpan ke workspace!', 'success');
        break;
      }
    }

    this.notify();
  }
}

// Global Singleton
const store = new SiDayaStateStore();
