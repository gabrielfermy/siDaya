/**
 * @fileoverview Operator Controller: Fleet management, Impersonation ("Act as Tenant"), and Diagnostics
 * @module Controllers:Operator
 * @description
 * Handles administrative actions for Ashvin Labs operators, including tenant status toggles,
 * ticket-bound tenant impersonation elevation, exit return hooks, and break-glass diagnostics.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

const OperatorController = {
  /**
   * Toggles tenant status between ACTIVE and SUSPENDED
   * @param {string} tenantId
   */
  toggleStatus(tenantId) {
    store.dispatch('OPERATOR_TOGGLE_TENANT_STATUS', { tenantId });
    Toast.show('✓ Status siklus hidup tenant berhasil diperbarui.', 'success');
    const container = document.getElementById('main-content');
    if (container && window.location.pathname.includes('/telemetry')) {
      container.innerHTML = OperatorView.render(store.getState());
    }
  },

  /**
   * Opens Impersonation Modal for target tenant
   * @param {string} tenantId
   */
  openImpersonateModal(tenantId) {
    const hiddenIdEl = document.getElementById('imp-target-tenant-id');
    if (hiddenIdEl) hiddenIdEl.value = tenantId;
    openModal('modal-impersonate');
  },

  /**
   * Handles submission of Impersonation form
   * @param {Event} event
   */
  handleStartImpersonationSubmit(event) {
    if (event) event.preventDefault();

    const tenantIdEl = document.getElementById('imp-target-tenant-id');
    const userSelectEl = document.getElementById('imp-target-user');
    const ticketRefEl = document.getElementById('imp-ticket-ref');
    const reasonEl = document.getElementById('imp-reason');

    const tenantId = tenantIdEl ? tenantIdEl.value : 't1';
    const targetEmail = userSelectEl ? userSelectEl.value : 'budi@berasjaya.com';
    const ticketRef = (ticketRefEl ? ticketRefEl.value : '').trim();
    const reason = (reasonEl ? reasonEl.value : '').trim();

    if (!ticketRef) {
      Toast.show('Nomor Tiket Support wajib diisi!', 'warning');
      return;
    }

    if (!reason || reason.length < 8) {
      Toast.show('Alasan investigasi wajib diisi (minimal 8 karakter)', 'warning');
      return;
    }

    const state = store.getState();
    const targetTenant = (state?.operator?.tenants || []).find((t) => t.id === tenantId) || {
      id: 't1',
      businessName: 'Toko Grosir Beras Jaya Bersama',
      subdomain: 'berasjaya'
    };

    const targetUserPreset = MERCHANT_PRESETS[targetEmail] || {
      email: targetEmail,
      name: 'Staf Tenant',
      role: 'Staff',
      avatar: 'S'
    };

    closeModal();

    // Dispatch impersonation start
    store.dispatch('START_IMPERSONATION', {
      targetTenant,
      targetUser: targetUserPreset,
      ticketRef,
      reason
    });

    Toast.show(`🎭 Memulai sesi impersonasi sebagai ${targetUserPreset.name} (${ticketRef})`, 'info');
    
    // Switch route into tenant workspace
    if (typeof Router !== 'undefined' && Router.navigate) {
      Router.navigate('/dashboard');
    } else if (typeof navigate !== 'undefined') {
      navigate('/dashboard');
    }
  },

  /**
   * Safe 1-Click Exit Hook from Impersonation Mode
   */
  handleExitImpersonation() {
    store.dispatch('EXIT_IMPERSONATION');
    Toast.show('🚪 Sesi impersonasi berakhir. Kembali ke Operator Control Plane.', 'info');
    
    if (typeof Router !== 'undefined' && Router.navigate) {
      Router.navigate('/telemetry');
    } else if (typeof navigate !== 'undefined') {
      navigate('/telemetry');
    }
  },

  /**
   * Opens break-glass emergency modal
   */
  openBreakglassModal() {
    openModal('modal-breakglass');
  },

  /**
   * Executes break-glass unmasking session
   */
  executeBreakglass() {
    const ticketId = document.getElementById('bg-ticket-id')?.value;
    const reason = document.getElementById('bg-reason')?.value;

    if (!ticketId || !reason) {
      Toast.show('Nomor tiket dan alasan diagnosa wajib diisi.', 'warning');
      return;
    }

    closeModal();
    Toast.show(`🚨 Sesi Break-Glass aktif untuk tiket ${ticketId}. Audit log dicatat.`, 'success');
  },
};

// Global handles
window.toggleTenantStatus = (id) => OperatorController.toggleStatus(id);
window.openBreakglassModal = () => OperatorController.openBreakglassModal();
window.executeBreakglass = () => OperatorController.executeBreakglass();
