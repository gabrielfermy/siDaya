/**
 * @file store.js
 * @description Reactive State Store (Zustand Pattern) with Strict Plane Decoupling
 * @module Store:Store
 * @dependencies Store:State (INITIAL_TENANT_STATE, INITIAL_OPERATOR_STATE)
 */

class SiDayaStateStore {
  constructor() {
    this.subscribers = new Set();
    this.state = this.loadState();
  }

  /**
   * Resolves initial portal mode strictly from hostname subdomain
   * @returns {'MERCHANT'|'OPS'}
   */
  getInitialPortalMode() {
    const h = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
    return (h.startsWith('ops.') || h === 'ops.localhost') ? 'OPS' : 'MERCHANT';
  }

  /**
   * Resolves initial active route path
   * @param {'MERCHANT'|'OPS'} portalMode
   * @returns {string}
   */
  getInitialPath(portalMode) {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (portalMode === 'OPS') {
      return path === 'fleet' ? '/fleet' : '/telemetry';
    }
    if (path === 'telemetry' || path === 'fleet' || path === 'operators' || path === 'audit') {
      return '/dashboard';
    }
    return (path && path !== '') ? '/' + path : '/dashboard';
  }

  /**
   * Returns storage key for the specified portal plane
   * @param {'MERCHANT'|'OPS'} portalMode
   * @returns {string}
   */
  getStorageKey(portalMode) {
    return portalMode === 'OPS' ? 'sidaya_store_operator' : 'sidaya_store_tenant';
  }

  /**
   * Loads persisted state from localStorage with plane isolation
   * @returns {Object} Reactive state tree
   */
  loadState() {
    const portalMode = this.getInitialPortalMode();
    const activePath = this.getInitialPath(portalMode);
    const storageKey = this.getStorageKey(portalMode);
    const defaultTemplate = portalMode === 'OPS' ? INITIAL_OPERATOR_STATE : INITIAL_TENANT_STATE;
    const defaultState = JSON.parse(JSON.stringify(defaultTemplate));

    let stored = null;
    try {
      // Purge legacy contaminated single-store keys
      ['sidaya_store_v1', 'sidaya_store_v2', 'sidaya_store_v3', 'sidaya_store_v4', 'sidaya_store_v5'].forEach((k) => localStorage.removeItem(k));
      const raw = localStorage.getItem(storageKey);
      if (raw) stored = JSON.parse(raw);
    } catch (e) {
      console.warn('[Store] LocalStorage read error:', e);
    }

    // Version & Schema Validation Guard
    if (!stored || stored.version !== 6 || !stored.pilar1 || !stored.pilar2 || !Array.isArray(stored.pilar2.products)) {
      stored = defaultState;
    } else {
      stored = this._deepMergeDefaults(stored, defaultState);
    }

    stored.version = 6;
    stored.ui = stored.ui || {};
    stored.ui.portalMode = portalMode;
    stored.ui.activePath = activePath;
    stored.ui.theme = localStorage.getItem('sidaya_theme') || stored.ui.theme || 'light';
    stored.ui.sidebarOpen = false;
    stored.ui.activeModal = null;

    // Strict Plane Boundary & Session Authentication Enforcement
    if (portalMode !== 'OPS') {
      delete stored.operator;
      stored.auth = { ...(stored.auth || {}), operatorUser: null, merchantUser: this._loadSession('sidaya_merchant_session') };
    } else {
      const opsSession = this._loadSession('sidaya_operator_session');
      stored.auth = { ...(stored.auth || {}), operatorUser: opsSession };
      if (stored.operator) stored.operator.currentRole = opsSession?.role || 'SUPER_ADMIN';
    }
    return stored;
  }

  _loadSession(key) {
    try {
      const p = JSON.parse(localStorage.getItem(key) || 'null');
      if (p && p.expiresAt && p.expiresAt > Date.now()) {
        if (p.name === 'Pengguna Toko' || !p.email) { localStorage.removeItem(key); return null; }
        return p;
      }
      localStorage.removeItem(key);
    } catch (e) { localStorage.removeItem(key); }
    return null;
  }

  _deepMergeDefaults(target, source) {
    if (!target || typeof target !== 'object') return JSON.parse(JSON.stringify(source));
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) target[key] = {};
        this._deepMergeDefaults(target[key], source[key]);
      } else if (target[key] === undefined || target[key] === null) {
        target[key] = JSON.parse(JSON.stringify(source[key]));
      }
    }
    return target;
  }

  saveState() {
    try {
      const isOpsHost = this.getInitialPortalMode() === 'OPS';
      const key = this.getStorageKey(isOpsHost ? 'OPS' : 'MERCHANT');
      if (!isOpsHost) { delete this.state.operator; if (this.state.auth) this.state.auth.operatorUser = null; }
      this.state.version = 6;
      localStorage.setItem(key, JSON.stringify(this.state));
      if (!isOpsHost && this.state.auth?.merchantUser) localStorage.setItem('sidaya_merchant_session', JSON.stringify(this.state.auth.merchantUser));
      else if (!isOpsHost) localStorage.removeItem('sidaya_merchant_session');
      if (isOpsHost && this.state.auth?.operatorUser) localStorage.setItem('sidaya_operator_session', JSON.stringify(this.state.auth.operatorUser));
      else localStorage.removeItem('sidaya_operator_session');
    } catch (e) { console.warn('[Store] LocalStorage write error:', e); }
  }

  getState() { return this.state; }
  subscribe(fn) { this.subscribers.add(fn); return () => this.subscribers.delete(fn); }
  notify() { this.saveState(); this.subscribers.forEach((sub) => sub(this.state)); }

  dispatch(action, payload) {
    switch (action) {
      case 'NAVIGATE': {
        const raw = (payload || '').replace(/^\/+|\/+$/g, '').toLowerCase();
        this.state.ui.activePath = '/' + (raw || (this.state.ui.portalMode === 'OPS' ? 'telemetry' : 'dashboard'));
        this.state.ui.sidebarOpen = false;
        break;
      }
      case 'TOGGLE_THEME': this.state.ui.theme = this.state.ui.theme === 'light' ? 'dark' : 'light'; break;
      case 'TOGGLE_SIDEBAR': this.state.ui.sidebarOpen = !this.state.ui.sidebarOpen; break;
      case 'CLOSE_SIDEBAR': this.state.ui.sidebarOpen = false; break;
      case 'OPEN_MODAL': this.state.ui.activeModal = payload; break;
      case 'CLOSE_MODAL': this.state.ui.activeModal = null; break;
      case 'POS_CLEAR_CART': this.state.pilar5.cart = []; this._recalculateCart(); break;
      case 'POS_ADD_TO_CART': {
        const pid = payload?.productId || payload, p = this.state.pilar5.products.find((prod) => prod.id === pid || prod.sku === pid);
        if (p) {
          const item = this.state.pilar5.cart.find((c) => c.id === p.id);
          if (item) item.qty += 1; else this.state.pilar5.cart.push({ id: p.id, sku: p.sku, name: p.name, price: p.price, qty: 1, unit: p.unit });
          this._recalculateCart();
        }
        break;
      }
      case 'POS_UPDATE_CART_QTY':
      case 'POS_UPDATE_QTY': {
        const pid = payload?.productId || payload?.id || payload?.sku, delta = payload?.delta || 0;
        const idx = this.state.pilar5.cart.findIndex((c) => c.id === pid || c.sku === pid);
        if (idx !== -1) {
          this.state.pilar5.cart[idx].qty += delta;
          if (this.state.pilar5.cart[idx].qty <= 0) this.state.pilar5.cart.splice(idx, 1);
          this._recalculateCart();
        }
        break;
      }

      case 'POS_CHECKOUT': {
        const method = payload?.method || 'CASH', total = this.state.pilar5.cartTotal;
        const invNum = 'INV-20260909-' + Math.floor(100 + Math.random() * 900);
        const dateStr = '09 Sep 2026 ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        this.state.pilar5.invoices.unshift({ invoiceNumber: invNum, date: dateStr, customerName: 'Pelanggan Tunai / Kasir', cashierName: 'Siti Rahma', paymentMethod: method, totalAmount: total, status: 'PAID' });
        this.state.pilar1.omsetToday += total;
        this.state.pilar1.recentOrders.unshift({ orderNumber: 'ORD-' + invNum.replace('INV-', ''), time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), customer: 'Pelanggan Kasir', method, total, status: 'PAID' });
        this.state.pilar5.cart = [];
        this._recalculateCart();
        break;
      }
      case 'FIFO_RECEIVE_INBOUND': {
        this.state.pilar2.batches.unshift(payload);
        const prod = this.state.pilar2.products.find((p) => p.sku === payload.sku);
        if (prod) prod.stock += payload.initialQty;
        break;
      }
      case 'ADD_PRODUCTS_BULK': {
        (payload.products || []).forEach((item) => {
          [this.state.pilar2.products, this.state.pilar5.products].forEach(list => {
            const idx = list.findIndex(p => p.sku === item.sku);
            if (idx !== -1) Object.assign(list[idx], item); else list.push(item);
          });
        });
        break;
      }
      case 'SJ_SIGN_POD': {
        const sj = this.state.pilar6.deliveryOrders.find((s) => s.id === payload.sjId || s.sjNumber === payload.sjId);
        if (sj) { sj.status = 'DELIVERED'; sj.signedBy = payload.signature; }
        break;
      }
      case 'OPERATOR_TOGGLE_TENANT_STATUS': {
        const t = this.state.operator?.tenants?.find((item) => item.id === payload.tenantId);
        if (t) t.status = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        break;
      }
      case 'UPDATE_SUBDOMAIN': {
        const { newSubdomain } = payload, oldSub = this.state.pilar9.settings.subdomain || 'berasjaya';
        if (newSubdomain && newSubdomain !== oldSub) {
          if (!Array.isArray(this.state.pilar9.settings.subdomainAliases)) this.state.pilar9.settings.subdomainAliases = [];
          const expiry = new Date(); expiry.setDate(expiry.getDate() + 30);
          this.state.pilar9.settings.subdomainAliases.unshift({ alias: oldSub, expiresAt: expiry.toISOString().split('T')[0] });
          this.state.pilar9.settings.subdomain = newSubdomain;
          if (this.state.auth?.merchantUser) this.state.auth.merchantUser.subdomain = newSubdomain;
          const t1 = this.state.operator?.tenants?.find((t) => t.id === 't1');
          if (t1) t1.subdomain = newSubdomain;
        }
        break;
      }
      /* Operator Impersonation Lifecycle */
      case 'START_IMPERSONATION': {
        const { targetTenant, targetUser, ticketRef, reason } = payload;
        const originalOp = JSON.parse(JSON.stringify(this.state.auth?.operatorUser || {}));
        this.state.auth.impersonation = {
          active: true, originalOperator: originalOp, targetTenant, targetUser,
          ticketRef: ticketRef || '#TICKET-8492', reason: reason || 'Investigasi teknis', startedAt: new Date().toISOString()
        };
        this.state.auth.merchantUser = {
          email: targetUser.email, name: targetUser.name, role: targetUser.role,
          avatar: targetUser.avatar || (targetUser.name ? targetUser.name[0] : 'U'),
          tenant: targetTenant.businessName, subdomain: targetTenant.subdomain
        };
        this.state.ui.portalMode = 'MERCHANT';
        this.state.ui.activePath = '/dashboard';
        this._logOperatorAudit('OPERATOR_IMPERSONATION_STARTED', `${targetTenant.businessName} (${targetUser.email})`, ticketRef, reason);
        break;
      }

      case 'EXIT_IMPERSONATION': {
        const { originalOperator: origOp, targetTenant, targetUser, ticketRef } = this.state.auth?.impersonation || {};
        if (origOp) this.state.auth.operatorUser = origOp;
        this._logOperatorAudit('OPERATOR_IMPERSONATION_ENDED', `${targetTenant?.businessName || 'Tenant'} (${targetUser?.email || 'User'})`, ticketRef, 'Selesai investigasi');
        this.state.auth.impersonation = { active: false, originalOperator: null, targetTenant: null, targetUser: null, ticketRef: null, reason: null, startedAt: null };
        this.state.ui.portalMode = 'OPS';
        this.state.ui.activePath = '/telemetry';
        break;
      }

      /* Session Termination */
      case 'LOGOUT': {
        if (this.state.auth) {
          this.state.auth.merchantUser = null;
          this.state.auth.operatorUser = null;
          this.state.auth.impersonation = { active: false, originalOperator: null, targetTenant: null, targetUser: null, ticketRef: null, reason: null, startedAt: null };
        }
        if (this.state.operator) this.state.operator.currentRole = null;
        break;
      }

      /* Staff Management & Direct User Permissions */
      case 'INVITE_STAFF': {
        if (!Array.isArray(this.state.pilar8?.staff)) this.state.pilar8.staff = [];
        this.state.pilar8.staff.push(payload);
        this._logTenantAudit('STAFF_INVITED', payload.name || payload.email, 'Undang staf baru');
        break;
      }
      case 'UPDATE_STAFF': {
        const staff = this.state.pilar8?.staff?.find((s) => s.email === payload.email || (payload.id && s.id === payload.id));
        if (staff) { Object.assign(staff, payload); this._logTenantAudit('STAFF_UPDATED', staff.name || staff.email, 'Ubah hak akses staf'); }
        break;
      }
      case 'DELETE_STAFF': {
        const staff = this.state.pilar8?.staff?.find((s) => s.email === payload.email || (payload.id && s.id === payload.id));
        if (staff && !staff.isOwner && Array.isArray(this.state.pilar8?.staff)) {
          this.state.pilar8.staff = this.state.pilar8.staff.filter((s) => s.email !== staff.email && s.id !== staff.id);
          this._logTenantAudit('STAFF_DELETED', `${staff.name} (${staff.email})`, payload.reason || 'Pencabutan akun staf');
        }
        break;
      }
      case 'RESET_STAFF_PIN': {
        const staff = this.state.pilar8?.staff?.find((s) => s.email === payload.email || (payload.id && s.id === payload.id));
        if (staff) { staff.pinConfigured = true; staff.lastPinResetAt = staff.pinResetAt = new Date().toISOString(); this._logTenantAudit('PIN_RESET', staff.name, 'Reset PIN kasir'); }
        break;
      }
      case 'SEND_STAFF_PASSWORD_RESET': {
        const staff = this.state.pilar8?.staff?.find((s) => s.email === payload.email || (payload.id && s.id === payload.id));
        if (staff) {
          staff.lastPasswordResetSentAt = staff.passwordResetSentAt = new Date().toISOString();
          staff.passwordResetLink = `https://${this.state.pilar9?.settings?.subdomain || 'berasjaya'}.sidaya.id/reset-password?token=rst_${Date.now()}`;
          this._logTenantAudit('PASSWORD_RESET_DISPATCHED', staff.email, 'Pengiriman tautan atur ulang sandi');
        }
        break;
      }

      /* Self-Profile & Self-Deletion */
      case 'UPDATE_SELF_PROFILE': {
        const { name, phone, pin } = payload, cur = this.state.auth?.merchantUser;
        if (cur) {
          if (name) cur.name = name; if (phone) cur.phone = phone;
          localStorage.setItem('sidaya_merchant_session', JSON.stringify(cur));
          const st = this.state.pilar8?.staff?.find((s) => s.email === cur.email);
          if (st) { if (name) st.name = name; if (phone) st.phone = phone; if (pin) { st.pinConfigured = true; st.fastPin = pin; st.pinResetAt = new Date().toISOString(); } }
          this._logTenantAudit('PROFILE_UPDATED', cur.email, 'Pembaruan profil mandiri');
        }
        break;
      }
      case 'SELF_DELETE_USER': {
        const em = payload?.email || this.state.auth?.merchantUser?.email, st = this.state.pilar8?.staff?.find((s) => s.email === em);
        if (em && (!st || !st.isOwner)) {
          this._logTenantAudit('USER_SELF_DELETED', em, 'Pengguna menghapus akun mandiri');
          if (Array.isArray(this.state.pilar8?.staff)) this.state.pilar8.staff = this.state.pilar8.staff.filter((s) => s.email !== em);
          this.state.auth.merchantUser = null; localStorage.removeItem('sidaya_merchant_session');
        }
        break;
      }

      /* Business Profile & Tenant Deletion */
      case 'UPDATE_BUSINESS_PROFILE': {
        if (!this.state.pilar9) this.state.pilar9 = { settings: {} };
        if (payload.storeName) this.state.pilar9.settings.storeName = payload.storeName;
        if (payload.storeAddress) this.state.pilar9.settings.storeAddress = payload.storeAddress;
        if (payload.storePhone) this.state.pilar9.settings.storePhone = payload.storePhone;
        this.state.pilar9.settings.businessProfile = { ...(this.state.pilar9.settings.businessProfile || {}), ...payload };
        this._logTenantAudit('BUSINESS_PROFILE_UPDATED', this.state.pilar9.settings.storeName, 'Pembaruan profil bisnis & bank');
        break;
      }
      case 'DELETE_TENANT': {
        const sName = this.state.pilar9?.settings?.storeName || 'Tenant Workspace', sub = this.state.pilar9?.settings?.subdomain || 'berasjaya';
        this._logTenantAudit('TENANT_DELETED', sName, 'Penutupan dan penghapusan workspace');
        this._logOperatorAudit('TENANT_OFFBOARDED', `${sName} (${sub})`, payload?.ticketRef || '#TICKET-OFFBOARD', 'Tenant workspace deleted');
        localStorage.removeItem('sidaya_merchant_session'); localStorage.removeItem('sidaya_store_tenant');
        this.state = JSON.parse(JSON.stringify(INITIAL_TENANT_STATE));
        break;
      }
      case 'REGISTER_OWNER': {
        const { bizName, subdomain, ownerName, email, phone, password, legalEntity, isVerified = false } = payload;
        const curDomain = payload.baseDomain || (typeof getBaseDomain === 'function' ? getBaseDomain() : 'sidaya.biz.id');
        this.state = JSON.parse(JSON.stringify(INITIAL_TENANT_STATE));
        this.state.pilar9.settings.storeName = bizName; this.state.pilar9.settings.subdomain = subdomain; this.state.pilar9.settings.baseDomain = curDomain; this.state.pilar9.settings.storePhone = phone;
        if (legalEntity && this.state.pilar9.settings.businessProfile) this.state.pilar9.settings.businessProfile.legalEntity = legalEntity;
        this.state.pilar8.staff = [{ id: 'stf_owner_' + Date.now(), name: ownerName, email, phone, password: password || 'Password123!', role: 'Owner / Direktur Utama', isOwner: true, status: isVerified ? 'VERIFIED' : 'UNVERIFIED', isEmailVerified: !!isVerified, pinConfigured: false, permissions: (typeof STAFF_CAPABILITIES !== 'undefined' ? STAFF_CAPABILITIES.map(c => c.key) : []) }];
        const session = { name: ownerName, email, role: 'Owner', tenantName: bizName, subdomain, baseDomain: curDomain, isEmailVerified: !!isVerified, expiresAt: Date.now() + 1800000 };
        this.state.auth.merchantUser = session; localStorage.setItem('sidaya_merchant_session', JSON.stringify(session));
        this._logTenantAudit('WORKSPACE_INITIALIZED', bizName, `Inisialisasi toko baru (${subdomain}.${curDomain})`);
        this._logOperatorAudit('TENANT_REGISTERED', `${bizName} (${subdomain}.${curDomain})`, '#REG-SELF', 'Pendaftaran mandiri owner');
        break;
      }
      case 'VERIFY_EMAIL': {
        const em = payload?.email || this.state.auth?.merchantUser?.email;
        if (this.state.pilar8?.staff) {
          const o = this.state.pilar8.staff.find((s) => s.email === em || s.isOwner);
          if (o) { o.status = 'VERIFIED'; o.isEmailVerified = true; }
        }
        if (this.state.auth?.merchantUser) {
          this.state.auth.merchantUser.isEmailVerified = true; this.state.auth.merchantUser.status = 'VERIFIED';
          localStorage.setItem('sidaya_merchant_session', JSON.stringify(this.state.auth.merchantUser));
        }
        this._logTenantAudit('EMAIL_VERIFIED', em || 'Owner', 'Verifikasi kode OTP email berhasil');
        this._logOperatorAudit('TENANT_EMAIL_VERIFIED', em || 'Owner', '#VERIFY-EMAIL', 'Email owner terverifikasi');
        break;
      }

      /* Platform Operator Team Management */
      case 'INVITE_OPERATOR': {
        if (!this.state.operator) this.state.operator = {};
        if (!Array.isArray(this.state.operator.operators)) this.state.operator.operators = [];
        this.state.operator.operators.push({ id: 'op_' + Date.now(), name: payload.name, email: payload.email, role: payload.role || 'OPS_SUPPORT', status: 'ACTIVE', joinedAt: new Date().toISOString().split('T')[0], lastActive: 'Baru diundang', isPrimary: false });
        this._logOperatorAudit('OPERATOR_INVITED', `${payload.name} (${payload.email})`, payload.ticketRef || '#TICKET-TEAM', 'Undang operator platform');
        break;
      }
      case 'UPDATE_OPERATOR': {
        const op = this.state.operator?.operators?.find((o) => o.email === payload.email || o.id === payload.id);
        if (op) { Object.assign(op, payload); this._logOperatorAudit('OPERATOR_UPDATED', op.email, payload.ticketRef || '#TICKET-TEAM', 'Pembaruan peran operator'); }
        break;
      }
      case 'TOGGLE_OPERATOR_STATUS': {
        const op = this.state.operator?.operators?.find((o) => o.email === payload.email || o.id === payload.id);
        if (op && !op.isPrimary) { op.status = op.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'; this._logOperatorAudit('OPERATOR_STATUS_CHANGED', `${op.email} -> ${op.status}`, '#TICKET-TEAM', 'Ubah status operasional'); }
        break;
      }
      case 'DELETE_OPERATOR': {
        const op = this.state.operator?.operators?.find((o) => o.email === payload.email || o.id === payload.id);
        if (op && !op.isPrimary && Array.isArray(this.state.operator?.operators)) {
          this.state.operator.operators = this.state.operator.operators.filter((o) => o.email !== op.email);
          this._logOperatorAudit('OPERATOR_REVOKED', op.email, payload.ticketRef || '#TICKET-SEC', payload.reason || 'Pencabutan akses operator');
        }
        break;
      }
      case 'RESET_STATE': {
        const isOps = this.getInitialPortalMode() === 'OPS';
        this.state = JSON.parse(JSON.stringify(isOps ? INITIAL_OPERATOR_STATE : INITIAL_TENANT_STATE));
        break;
      }
    }

    this.notify();
  }

  _logTenantAudit(action, target, reason = 'Aktivitas pengguna') {
    if (!this.state.pilar8) this.state.pilar8 = {};
    if (!Array.isArray(this.state.pilar8.auditLogs)) this.state.pilar8.auditLogs = [];
    const actor = this.state.auth?.merchantUser?.name || 'Owner / Sistem';
    this.state.pilar8.auditLogs.unshift({ id: 'aud_t_' + Date.now(), time: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }), actor, action, target, reason, status: 'SUCCESS' });
  }

  _logOperatorAudit(action, target, ticketRef = '#TICKET-OPS', reason = 'Platform operations') {
    if (!this.state.operator) return;
    if (!Array.isArray(this.state.operator.auditLogs)) this.state.operator.auditLogs = [];
    const opEmail = this.state.auth?.operatorUser?.email || 'operator@ashvinlabs.com';
    this.state.operator.auditLogs.unshift({ id: 'aud_ops_' + Date.now(), time: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }), operatorEmail: opEmail, action, target, ticketRef, reason, status: 'SUCCESS' });
  }

  _recalculateCart() {
    const sub = this.state.pilar5.cart.reduce((s, i) => s + i.price * i.qty, 0), disc = sub >= 5000000 ? Math.round(sub * 0.015) : 0;
    this.state.pilar5.cartSubtotal = sub; this.state.pilar5.cartDiscount = disc; this.state.pilar5.cartTotal = sub - disc;
  }
}

// Global Store Singleton
const store = new SiDayaStateStore();

function resetAndReloadState() {
  ['sidaya_store_v1', 'sidaya_store_v2', 'sidaya_store_v3', 'sidaya_store_v4', 'sidaya_store_v5', 'sidaya_store_tenant', 'sidaya_store_operator', 'sidaya_merchant_session', 'sidaya_operator_session'].forEach((k) => localStorage.removeItem(k));
  store.dispatch('RESET_STATE');
  window.location.reload();
}
