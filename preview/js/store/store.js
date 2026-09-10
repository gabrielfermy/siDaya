/**
 * @file store.js
 * @description Reactive State Management Store (Zustand Pattern) for Multi-Tenant Workspace
 * @module Store:Store
 * @implements {StoreInterface}
 * @dependencies Store:State (INITIAL_DEFAULT_STATE)
 */

class SiDayaStateStore {
  constructor() {
    this.subscribers = new Set();
    this.state = this.loadState();
  }

  /**
   * Resolves initial portal mode from hostname or URL path
   * @returns {'MERCHANT'|'OPS'}
   */
  getInitialPortalMode() {
    const hostname = window.location.hostname.toLowerCase();
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (hostname.startsWith('ops.') || path === 'telemetry' || path === 'fleet' || path === 'operators' || path === 'audit') {
      return 'OPS';
    }
    return 'MERCHANT';
  }

  /**
   * Resolves initial active route path
   * @param {'MERCHANT'|'OPS'} portalMode
   * @returns {string}
   */
  getInitialPath(portalMode) {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (path && path !== '') return '/' + path;
    return portalMode === 'OPS' ? '/telemetry' : '/dashboard';
  }

  /**
    * Loads persisted state from localStorage with safe deep migration
   * @returns {Object} Complete reactive state tree
   */
  loadState() {
    const portalMode = this.getInitialPortalMode();
    const activePath = this.getInitialPath(portalMode);
    const defaultState = JSON.parse(JSON.stringify(INITIAL_DEFAULT_STATE));

    let stored = null;
    try {
      // Purge legacy storage versions
      localStorage.removeItem('sidaya_store_v1');
      localStorage.removeItem('sidaya_store_v2');
      localStorage.removeItem('sidaya_store_v3');
      localStorage.removeItem('sidaya_store_v4');
      const raw = localStorage.getItem('sidaya_store_v5');
      if (raw) stored = JSON.parse(raw);
    } catch (e) {
      console.warn('[Store] LocalStorage read error, resetting to default state:', e);
    }

    // Version & Deep Schema Guard
    if (!stored || stored.version !== 5 || !stored.pilar1 || !stored.pilar1.omsetToday || !stored.pilar2 || !Array.isArray(stored.pilar2.products)) {
      stored = defaultState;
    } else {
      // Deep merge missing properties safely
      stored = this._deepMergeDefaults(stored, defaultState);
    }

    stored.version = 5;
    stored.ui = stored.ui || {};
    stored.ui.portalMode = portalMode;
    stored.ui.activePath = activePath;
    stored.ui.theme = localStorage.getItem('sidaya_theme') || stored.ui.theme || 'light';
    stored.ui.sidebarOpen = false;
    stored.ui.activeModal = null;

    return stored;
  }

  /**
   * Internal recursive deep merge helper
   * @private
   */
  _deepMergeDefaults(target, source) {
    if (!target || typeof target !== 'object') return JSON.parse(JSON.stringify(source));
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
          target[key] = {};
        }
        this._deepMergeDefaults(target[key], source[key]);
      } else if (target[key] === undefined || target[key] === null) {
        target[key] = JSON.parse(JSON.stringify(source[key]));
      }
    }
    return target;
  }

  /**
   * Persists current state tree to localStorage
   */
  saveState() {
    try {
      this.state.version = 5;
      localStorage.setItem('sidaya_store_v5', JSON.stringify(this.state));
      localStorage.setItem('sidaya_theme', this.state.ui.theme);
      if (this.state.auth && this.state.auth.merchantUser) {
        localStorage.setItem('sidaya_merchant_session', JSON.stringify(this.state.auth.merchantUser));
      }
      if (this.state.auth && this.state.auth.operatorUser) {
        localStorage.setItem('sidaya_operator_session', JSON.stringify(this.state.auth.operatorUser));
      }
    } catch (e) {
      console.warn('[Store] LocalStorage write error:', e);
    }
  }

  /**
   * Returns current state snapshot
   * @returns {Object}
   */
  getState() {
    return this.state;
  }

  /**
   * Registers a subscriber callback
   * @param {Function} fn - Subscriber listener
   * @returns {Function} Unsubscribe handle
   */
  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  /**
   * Notifies all registered subscribers of state change
   */
  notify() {
    this.saveState();
    this.subscribers.forEach((sub) => sub(this.state));
  }

  /**
   * Dispatches an action to mutate state
   * @param {string} action - Action type
   * @param {*} [payload] - Action payload
   */
  dispatch(action, payload) {
    switch (action) {
      case 'NAVIGATE': {
        const raw = (payload || '').replace(/^\/+|\/+$/g, '').toLowerCase();
        this.state.ui.activePath = '/' + (raw || (this.state.ui.portalMode === 'OPS' ? 'telemetry' : 'dashboard'));
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

      /* POS & Cart Actions */
      case 'POS_ADD_TO_CART': {
        const productId = payload && payload.productId ? payload.productId : payload;
        const p = this.state.pilar5.products.find((prod) => prod.id === productId || prod.sku === productId);
        if (p) {
          const existing = this.state.pilar5.cart.find((c) => c.id === p.id);
          if (existing) {
            existing.qty += 1;
          } else {
            this.state.pilar5.cart.push({
              id: p.id,
              sku: p.sku,
              name: p.name,
              price: p.price,
              qty: 1,
              unit: p.unit,
            });
          }
          this._recalculateCart();
        }
        break;
      }
      case 'POS_UPDATE_CART_QTY':
      case 'POS_UPDATE_QTY': {
        const productId = payload.productId || payload.id || payload.sku;
        const delta = payload.delta || 0;
        const idx = this.state.pilar5.cart.findIndex((c) => c.id === productId || c.sku === productId);
        if (idx !== -1) {
          this.state.pilar5.cart[idx].qty += delta;
          if (this.state.pilar5.cart[idx].qty <= 0) {
            this.state.pilar5.cart.splice(idx, 1);
          }
          this._recalculateCart();
        }
        break;
      }
      case 'POS_CLEAR_CART': {
        this.state.pilar5.cart = [];
        this._recalculateCart();
        break;
      }
      case 'POS_CHECKOUT': {
        const method = (payload && payload.method) || 'CASH';
        const total = this.state.pilar5.cartTotal;
        const invNum = 'INV-20260909-' + Math.floor(100 + Math.random() * 900);
        const newInv = {
          invoiceNumber: invNum,
          date: '09 Sep 2026 ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          customerName: 'Pelanggan Tunai / Kasir',
          cashierName: 'Siti Rahma',
          paymentMethod: method,
          totalAmount: total,
          status: 'PAID',
        };
        this.state.pilar5.invoices.unshift(newInv);
        this.state.pilar1.omsetToday += total;
        this.state.pilar1.recentOrders.unshift({
          orderNumber: 'ORD-' + invNum.replace('INV-', ''),
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          customer: 'Pelanggan Kasir',
          method,
          total,
          status: 'PAID',
        });
        this.state.pilar5.cart = [];
        this._recalculateCart();
        break;
      }

      /* Inbound FIFO Actions */
      case 'FIFO_RECEIVE_INBOUND': {
        const batch = payload;
        this.state.pilar2.batches.unshift(batch);
        const prod = this.state.pilar2.products.find((p) => p.sku === batch.sku);
        if (prod) prod.stock += batch.initialQty;
        break;
      }

      /* Master SKU & Catalog Bulk Import */
      case 'ADD_PRODUCTS_BULK': {
        const newItems = payload.products || [];
        for (const item of newItems) {
          const idx2 = this.state.pilar2.products.findIndex((p) => p.sku === item.sku);
          if (idx2 !== -1) {
            Object.assign(this.state.pilar2.products[idx2], item);
          } else {
            this.state.pilar2.products.push(item);
          }

          const idx5 = this.state.pilar5.products.findIndex((p) => p.sku === item.sku);
          if (idx5 !== -1) {
            Object.assign(this.state.pilar5.products[idx5], item);
          } else {
            this.state.pilar5.products.push(item);
          }
        }
        break;
      }

      /* Logistics & Surat Jalan */
      case 'SJ_SIGN_POD': {
        const { sjId, signature } = payload;
        const sj = this.state.pilar6.deliveryOrders.find((s) => s.id === sjId || s.sjNumber === sjId);
        if (sj) {
          sj.status = 'DELIVERED';
          sj.signedBy = signature;
        }
        break;
      }

      /* Operator Fleet Actions */
      case 'OPERATOR_TOGGLE_TENANT_STATUS': {
        const { tenantId } = payload;
        const t = this.state.operator.tenants.find((item) => item.id === tenantId);
        if (t) {
          t.status = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        }
        break;
      }

      /* Settings & Subdomain Management */
      case 'UPDATE_SUBDOMAIN': {
        const { newSubdomain } = payload;
        const oldSubdomain = this.state.pilar9.settings.subdomain || 'berasjaya';
        if (newSubdomain && newSubdomain !== oldSubdomain) {
          if (!Array.isArray(this.state.pilar9.settings.subdomainAliases)) {
            this.state.pilar9.settings.subdomainAliases = [];
          }
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          this.state.pilar9.settings.subdomainAliases.unshift({
            alias: oldSubdomain,
            expiresAt: expiry.toISOString().split('T')[0]
          });
          this.state.pilar9.settings.subdomain = newSubdomain;
          if (this.state.auth && this.state.auth.merchantUser) {
            this.state.auth.merchantUser.subdomain = newSubdomain;
          }
          const t1 = this.state.operator.tenants.find((t) => t.id === 't1');
          if (t1) t1.subdomain = newSubdomain;
        }
        break;
      }

      /* Operator Impersonation Actions */
      case 'START_IMPERSONATION': {
        const { targetTenant, targetUser, ticketRef, reason } = payload;
        const originalOp = JSON.parse(JSON.stringify(this.state.auth.operatorUser || {}));
        this.state.auth.impersonation = {
          active: true,
          originalOperator: originalOp,
          targetTenant,
          targetUser,
          ticketRef: ticketRef || '#TICKET-8492',
          reason: reason || 'Investigasi laporan issue teknis',
          startedAt: new Date().toISOString()
        };
        this.state.auth.merchantUser = {
          email: targetUser.email,
          name: targetUser.name,
          role: targetUser.role,
          avatar: targetUser.avatar || (targetUser.name ? targetUser.name[0] : 'U'),
          tenant: targetTenant.businessName,
          subdomain: targetTenant.subdomain
        };
        this.state.ui.portalMode = 'MERCHANT';
        this.state.ui.activePath = '/dashboard';
        
        if (!Array.isArray(this.state.operator.auditLogs)) {
          this.state.operator.auditLogs = [];
        }
        this.state.operator.auditLogs.unshift({
          id: 'aud_' + Date.now(),
          time: 'Hari ini ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          operatorEmail: originalOp.email || 'operator@ashvinlabs.com',
          action: 'OPERATOR_IMPERSONATION_STARTED',
          target: targetTenant.businessName + ' (' + targetUser.email + ')',
          ticketRef: ticketRef || '#TICKET-8492',
          status: 'SUCCESS'
        });
        break;
      }

      case 'EXIT_IMPERSONATION': {
        const originalOp = this.state.auth.impersonation && this.state.auth.impersonation.originalOperator;
        const targetTenant = this.state.auth.impersonation && this.state.auth.impersonation.targetTenant;
        const targetUser = this.state.auth.impersonation && this.state.auth.impersonation.targetUser;
        const ticketRef = this.state.auth.impersonation && this.state.auth.impersonation.ticketRef;

        if (originalOp) {
          this.state.auth.operatorUser = originalOp;
        }
        
        if (!Array.isArray(this.state.operator.auditLogs)) {
          this.state.operator.auditLogs = [];
        }
        this.state.operator.auditLogs.unshift({
          id: 'aud_' + Date.now(),
          time: 'Hari ini ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          operatorEmail: (originalOp && originalOp.email) || 'operator@ashvinlabs.com',
          action: 'OPERATOR_IMPERSONATION_ENDED',
          target: (targetTenant ? targetTenant.businessName : 'Tenant') + ' (' + (targetUser ? targetUser.email : 'User') + ')',
          ticketRef: ticketRef || '#TICKET-8492',
          status: 'SUCCESS'
        });

        this.state.auth.impersonation = {
          active: false,
          originalOperator: null,
          targetTenant: null,
          targetUser: null,
          ticketRef: null,
          reason: null,
          startedAt: null
        };
        this.state.ui.portalMode = 'OPS';
        this.state.ui.activePath = '/telemetry';
        break;
      }

      /* Reset State */
      case 'RESET_STATE': {
        this.state = JSON.parse(JSON.stringify(INITIAL_DEFAULT_STATE));
        break;
      }
    }

    this.notify();
  }

  /**
   * Internal helper to recalculate cart subtotals and discounts
   * @private
   */
  _recalculateCart() {
    const subtotal = this.state.pilar5.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = subtotal >= 5000000 ? Math.round(subtotal * 0.015) : 0;
    this.state.pilar5.cartSubtotal = subtotal;
    this.state.pilar5.cartDiscount = discount;
    this.state.pilar5.cartTotal = subtotal - discount;
  }
}

// Global Store Singleton
const store = new SiDayaStateStore();

/**
 * Emergency recovery helper to reset state and reload
 */
function resetAndReloadState() {
  localStorage.removeItem('sidaya_store_v1');
  localStorage.removeItem('sidaya_store_v2');
  localStorage.removeItem('sidaya_store_v3');
  localStorage.removeItem('sidaya_store_v4');
  localStorage.removeItem('sidaya_store_v5');
  store.dispatch('RESET_STATE');
  window.location.reload();
}
