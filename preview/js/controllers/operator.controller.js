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

  /**
   * Opens modal by ID
   * @param {string} modalId
   */
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('hidden');
  },

  /**
   * Closes modal by ID or all modal overlays
   * @param {string} [modalId]
   */
  closeModal(modalId) {
    if (modalId) {
      const el = document.getElementById(modalId);
      if (el) el.classList.add('hidden');
    } else {
      document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.add('hidden'));
    }
  },

  /**
   * Opens Invite Operator modal
   */
  openInviteOperatorModal() {
    const nameInput = document.getElementById('inv-op-name');
    const emailInput = document.getElementById('inv-op-email');
    const roleInput = document.getElementById('inv-op-role');
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (roleInput) roleInput.value = 'OPS_SUPPORT';
    this.openModal('modal-invite-operator');
  },

  /**
   * Handles submission of operator invitation form
   */
  handleInviteSubmit() {
    const name = (document.getElementById('inv-op-name')?.value || '').trim();
    const email = (document.getElementById('inv-op-email')?.value || '').trim().toLowerCase();
    const role = document.getElementById('inv-op-role')?.value || 'OPS_SUPPORT';

    if (!name || !email) {
      Toast.show('Nama dan email korporat operator wajib diisi!', 'warning');
      return;
    }
    if (!email.endsWith('@ashvinlabs.com')) {
      Toast.show('Email operator harus menggunakan domain korporat @ashvinlabs.com!', 'warning');
      return;
    }

    const state = store.getState();
    const existing = state?.operator?.operators?.find((o) => o.email === email);
    if (existing) {
      Toast.show('Operator dengan email tersebut sudah terdaftar!', 'warning');
      return;
    }

    store.dispatch('INVITE_OPERATOR', { name, email, role, ticketRef: '#OP-INVITE-' + Date.now().toString().slice(-4) });
    this.closeModal('modal-invite-operator');
    Toast.show(`✉️ Undangan operator platform berhasil dikirimkan ke ${email}`, 'success');

    const container = document.getElementById('main-content');
    if (container && (window.location.pathname.includes('/telemetry') || window.location.pathname.includes('/fleet') || window.location.pathname === '/')) {
      container.innerHTML = OperatorView.render(store.getState());
    }
  },

  /**
   * Opens Edit Operator modal
   * @param {string} email
   */
  openEditOperatorModal(email) {
    const state = store.getState();
    const op = (state?.operator?.operators || []).find((o) => o.email === email);
    if (!op) return;

    const emailEl = document.getElementById('edit-op-email');
    const nameEl = document.getElementById('edit-op-name');
    const roleEl = document.getElementById('edit-op-role');

    if (emailEl) emailEl.value = op.email;
    if (nameEl) nameEl.value = op.name;
    if (roleEl) roleEl.value = op.role;

    this.openModal('modal-edit-operator');
  },

  /**
   * Handles submission of Edit Operator form
   */
  handleEditSubmit() {
    const email = document.getElementById('edit-op-email')?.value;
    const name = (document.getElementById('edit-op-name')?.value || '').trim();
    const role = document.getElementById('edit-op-role')?.value;

    if (!email || !name) {
      Toast.show('Nama operator wajib diisi!', 'warning');
      return;
    }

    store.dispatch('UPDATE_OPERATOR', { email, name, role, ticketRef: '#OP-EDIT-' + Date.now().toString().slice(-4) });
    this.closeModal('modal-edit-operator');
    Toast.show(`✓ Data operator ${name} berhasil diperbarui.`, 'success');

    const container = document.getElementById('main-content');
    if (container && (window.location.pathname.includes('/telemetry') || window.location.pathname.includes('/fleet') || window.location.pathname === '/')) {
      container.innerHTML = OperatorView.render(store.getState());
    }
  },

  /**
   * Toggles operator status between ACTIVE and SUSPENDED
   * @param {string} email
   */
  toggleOperatorStatus(email) {
    store.dispatch('TOGGLE_OPERATOR_STATUS', { email });
    Toast.show(`✓ Status operasional ${email} berhasil diubah.`, 'info');

    const container = document.getElementById('main-content');
    if (container && (window.location.pathname.includes('/telemetry') || window.location.pathname.includes('/fleet') || window.location.pathname === '/')) {
      container.innerHTML = OperatorView.render(store.getState());
    }
  },

  /**
   * Opens Delete Operator Confirmation Modal
   * @param {string} email
   */
  openDeleteOperatorModal(email) {
    const state = store.getState();
    const op = (state?.operator?.operators || []).find((o) => o.email === email);
    if (!op) return;

    const emailEl = document.getElementById('del-op-email');
    const displayEl = document.getElementById('del-op-display');
    const ticketEl = document.getElementById('del-op-ticket');
    const reasonEl = document.getElementById('del-op-reason');

    if (emailEl) emailEl.value = op.email;
    if (displayEl) displayEl.value = `${op.name} (${op.email})`;
    if (ticketEl) ticketEl.value = '#SEC-REVOKE-' + Date.now().toString().slice(-4);
    if (reasonEl) reasonEl.value = 'Pencabutan akses operasional platform';

    this.openModal('modal-delete-operator');
  },

  /**
   * Handles deletion of operator
   */
  handleDeleteSubmit() {
    const email = document.getElementById('del-op-email')?.value;
    const ticketRef = (document.getElementById('del-op-ticket')?.value || '').trim();
    const reason = (document.getElementById('del-op-reason')?.value || '').trim();

    if (!email) return;
    if (!ticketRef || !reason) {
      Toast.show('Nomor tiket dan alasan pencabutan akses wajib diisi!', 'warning');
      return;
    }

    store.dispatch('DELETE_OPERATOR', { email, ticketRef, reason });
    this.closeModal('modal-delete-operator');
    Toast.show(`🗑️ Akses operator ${email} telah dicabut secara permanen.`, 'success');

    const container = document.getElementById('main-content');
    if (container && (window.location.pathname.includes('/telemetry') || window.location.pathname.includes('/fleet') || window.location.pathname === '/')) {
      container.innerHTML = OperatorView.render(store.getState());
    }
  },

  /**
   * Sends password reset email link to operator
   * @param {string} email
   */
  sendPasswordReset(email) {
    Toast.show(`✉️ Tautan reset kata sandi korporat telah dikirimkan ke ${email}.`, 'info');
  },

  /**
   * Resets onboarding progress for a target tenant
   * @param {string} subdomain
   */
  resetTenantOnboarding(subdomain) {
    if (!subdomain) return;
    if (typeof OnboardingService !== 'undefined') {
      OnboardingService.resetTenantOnboarding(subdomain);
      Toast.show(`🔄 Panduan kilat untuk tenant '${subdomain}' berhasil di-reset.`, 'success');
    }
  },

  /**
   * Toggles a tour module active/disabled state
   * @param {string} moduleId
   */
  toggleTourModule(moduleId) {
    if (typeof OnboardingRegistry === 'undefined') return;
    const newState = OnboardingRegistry.toggleModule(moduleId);
    Toast.show(`Modul '${moduleId}' ${newState ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = OperatorView.render(store.getState());
    }
  },

  /**
   * Runs an interactive onboarding tour simulation for a specific role
   * @param {'OWNER'|'KASIR'|'GUDANG'|'SUPIR'|'FINANCE'} role
   */
  simulateRoleTour(role) {
    if (typeof OnboardingRegistry === 'undefined' || typeof OnboardingService === 'undefined') {
      Toast.show('Modul Onboarding belum termuat.', 'warning');
      return;
    }

    let mockUser = { isOwner: true, permissions: ['*'], role: 'Owner' };
    if (role === 'KASIR') {
      mockUser = { isOwner: false, role: 'Kasir', permissions: ['pos:checkout', 'invoices:read', 'catalog:read'] };
    } else if (role === 'GUDANG') {
      mockUser = { isOwner: false, role: 'Gudang', permissions: ['inventory:inbound', 'inventory:transfer', 'sj:read', 'sj:sign'] };
    } else if (role === 'SUPIR') {
      mockUser = { isOwner: false, role: 'Supir', permissions: ['sj:read', 'sj:sign'] };
    } else if (role === 'FINANCE') {
      mockUser = { isOwner: false, role: 'Finance', permissions: ['reports:read', 'catalog:view_cogs', 'piutang:read', 'piutang:paylink', 'invoices:read', 'invoices:export'] };
    }

    const steps = OnboardingRegistry.resolveStepsForUser(mockUser, 'GROSIR_PRO');
    if (steps.length === 0) {
      Toast.show(`Tidak ada langkah tur untuk simulasi peran ${role}`, 'warning');
      return;
    }

    Toast.show(`🎮 Memulai simulasi tur untuk peran ${role} (${steps.length} langkah)`, 'info');
    OnboardingService.startTour(steps, true);
  },

  /**
   * Opens modal to edit tour step text
   * @param {string} moduleId
   */
  openEditTourModuleModal(moduleId) {
    if (typeof OnboardingRegistry === 'undefined') return;
    const mod = OnboardingRegistry.getModule(moduleId);
    if (!mod) return;

    const modIdEl = document.getElementById('edit-tour-mod-id');
    const subtitleEl = document.getElementById('edit-tour-module-subtitle');
    const stepSelectEl = document.getElementById('edit-tour-step-select');

    if (modIdEl) modIdEl.value = mod.id;
    if (subtitleEl) subtitleEl.textContent = `Mengedit modul: ${mod.icon || '📌'} ${mod.title} (${mod.steps.length} langkah)`;

    if (stepSelectEl) {
      stepSelectEl.innerHTML = mod.steps.map((s, idx) => `
        <option value="${s.id}">Langkah ${idx + 1}: ${s.title} (${s.id})</option>
      `).join('');

      if (mod.steps.length > 0) {
        this.handleTourStepSelectChange(mod.steps[0].id);
      }
    }

    this.openModal('modal-edit-tour-module');
  },

  /**
   * Updates textarea inputs when a step is selected in editor
   * @param {string} stepId
   */
  handleTourStepSelectChange(stepId) {
    const modId = document.getElementById('edit-tour-mod-id')?.value;
    if (!modId || !stepId || typeof OnboardingRegistry === 'undefined') return;

    const mod = OnboardingRegistry.getModule(modId);
    if (!mod) return;
    const step = mod.steps.find(s => s.id === stepId);
    if (!step) return;

    const whatEl = document.getElementById('edit-tour-step-what');
    const whyEl = document.getElementById('edit-tour-step-why');
    const howEl = document.getElementById('edit-tour-step-how');

    if (whatEl) whatEl.value = step.what || '';
    if (whyEl) whyEl.value = step.why || '';
    if (howEl) howEl.value = step.howWhere || '';
  },

  /**
   * Saves updated step text back to OnboardingRegistry
   */
  handleSaveTourStep() {
    const modId = document.getElementById('edit-tour-mod-id')?.value;
    const stepId = document.getElementById('edit-tour-step-select')?.value;
    const what = document.getElementById('edit-tour-step-what')?.value || '';
    const why = document.getElementById('edit-tour-step-why')?.value || '';
    const howWhere = document.getElementById('edit-tour-step-how')?.value || '';

    if (!modId || !stepId) return;

    if (typeof OnboardingRegistry !== 'undefined') {
      OnboardingRegistry.updateStepContent(modId, stepId, { what, why, howWhere });
      Toast.show('💾 Narasi langkah panduan berhasil disimpan.', 'success');
      this.closeModal('modal-edit-tour-module');
    }
  },
};

// Global handles
window.OperatorController = OperatorController;
window.toggleTenantStatus = (id) => OperatorController.toggleStatus(id);
window.openBreakglassModal = () => OperatorController.openBreakglassModal();
window.executeBreakglass = () => OperatorController.executeBreakglass();
window.openInviteOperatorModal = () => OperatorController.openInviteOperatorModal();
window.closeModal = (id) => OperatorController.closeModal(id);
window.openModal = (id) => OperatorController.openModal(id);
