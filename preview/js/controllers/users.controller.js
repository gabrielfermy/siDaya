/**
 * @file users.controller.js
 * @description Controller for Staff Management, Direct User Permissions, and Password Reset Link Dispatch
 * @module Controller:Users
 */

const UsersController = {
  /**
   * Opens the Invite Staff Modal and initializes default preset
   */
  openInviteModal() {
    const modal = document.getElementById('modal-invite-staff');
    if (!modal) return;

    // Reset inputs
    const nameInput = document.getElementById('invite-staff-name');
    const emailInput = document.getElementById('invite-staff-email');
    const phoneInput = document.getElementById('invite-staff-phone');
    const titleInput = document.getElementById('invite-staff-title');

    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (titleInput) titleInput.value = 'Kasir Toko';

    // Default to Cashier preset
    this.applyPreset('CASHIER', 'invite');

    modal.classList.remove('hidden');
  },

  /**
   * Closes the Invite Staff Modal
   */
  closeInviteModal() {
    const modal = document.getElementById('modal-invite-staff');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * Applies permission template preset to checkboxes
   * @param {string} presetKey - CASHIER | WAREHOUSE | DRIVER | MANAGER | CUSTOM
   * @param {'invite'|'edit'} formPrefix - Target form context
   */
  applyPreset(presetKey, formPrefix) {
    const preset = typeof STAFF_PRESETS !== 'undefined' ? STAFF_PRESETS[presetKey] : null;
    const allowed = preset ? preset.permissions : [];

    const checkboxes = document.querySelectorAll(`input[name="${formPrefix}-perm-key"]`);
    checkboxes.forEach((cb) => {
      cb.checked = allowed.includes(cb.value);
    });

    // Update preset pills active state
    document.querySelectorAll(`.${formPrefix}-preset-pill`).forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-preset') === presetKey);
    });
  },

  /**
   * Handles new staff member invitation submission
   * @param {Event} e
   */
  handleInviteSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const name = document.getElementById('invite-staff-name')?.value.trim();
    const email = document.getElementById('invite-staff-email')?.value.trim();
    const phone = document.getElementById('invite-staff-phone')?.value.trim() || '-';
    const role = document.getElementById('invite-staff-title')?.value.trim() || 'Staf Toko';

    if (!name || !email) {
      if (typeof showToast === 'function') showToast('Nama dan email wajib diisi!');
      return;
    }

    const state = store.getState();
    const existing = state?.pilar8?.staff?.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (typeof showToast === 'function') showToast('Email staf sudah terdaftar!');
      return;
    }

    // Collect checked direct permissions
    const checkedPerms = [];
    document.querySelectorAll('input[name="invite-perm-key"]:checked').forEach((cb) => {
      checkedPerms.push(cb.value);
    });

    const newStaff = {
      id: 'stf_' + Date.now(),
      name,
      email,
      phone,
      role,
      isOwner: false,
      status: 'INVITED',
      pinConfigured: false,
      permissions: checkedPerms,
      invitedAt: new Date().toISOString().split('T')[0],
      lastPasswordResetSentAt: new Date().toISOString(),
    };

    store.dispatch('INVITE_STAFF', newStaff);
    this.closeInviteModal();

    if (typeof showToast === 'function') {
      showToast(`✉️ Undangan & tautan aktivasi kata sandi telah dikirimkan ke ${email}`);
    }

    // Refresh view
    if (typeof navigate === 'function') navigate('/users', false);
  },

  /**
   * Opens the Edit Staff Modal and loads current permissions
   * @param {string} email
   */
  openEditModal(email) {
    const state = store.getState();
    const staff = state?.pilar8?.staff?.find((s) => s.email === email);
    if (!staff) return;

    const modal = document.getElementById('modal-edit-staff');
    if (!modal) return;

    document.getElementById('edit-staff-id').value = staff.id || '';
    document.getElementById('edit-staff-email').value = staff.email;
    document.getElementById('edit-staff-name').value = staff.name;
    document.getElementById('edit-staff-phone').value = staff.phone || '';
    document.getElementById('edit-staff-title').value = staff.role || '';

    const ownerNotice = document.getElementById('edit-owner-locked-notice');
    const isOwner = !!staff.isOwner;

    if (ownerNotice) {
      ownerNotice.style.display = isOwner ? 'block' : 'none';
    }

    // Check user's direct permissions
    const userPerms = staff.permissions || [];
    const checkboxes = document.querySelectorAll('input[name="edit-perm-key"]');
    checkboxes.forEach((cb) => {
      cb.checked = isOwner || userPerms.includes(cb.value);
      cb.disabled = isOwner; // Owner permissions cannot be revoked
    });

    // Preset pills disabled for owner
    document.querySelectorAll('.edit-preset-pill').forEach((btn) => {
      btn.style.pointerEvents = isOwner ? 'none' : 'auto';
      btn.style.opacity = isOwner ? '0.5' : '1';
    });

    modal.classList.remove('hidden');
  },

  /**
   * Closes the Edit Staff Modal
   */
  closeEditModal() {
    const modal = document.getElementById('modal-edit-staff');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * Handles saving edited staff member data and updated direct permissions
   * @param {Event} e
   */
  handleEditSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const email = document.getElementById('edit-staff-email')?.value;
    const name = document.getElementById('edit-staff-name')?.value.trim();
    const phone = document.getElementById('edit-staff-phone')?.value.trim();
    const role = document.getElementById('edit-staff-title')?.value.trim();

    const state = store.getState();
    const staff = state?.pilar8?.staff?.find((s) => s.email === email);
    if (!staff) return;

    let permissions = staff.permissions || [];
    if (!staff.isOwner) {
      permissions = [];
      document.querySelectorAll('input[name="edit-perm-key"]:checked').forEach((cb) => {
        permissions.push(cb.value);
      });
    }

    store.dispatch('UPDATE_STAFF', {
      email,
      name,
      phone,
      role,
      permissions,
      updatedAt: new Date().toISOString()
    });

    this.closeEditModal();

    if (typeof showToast === 'function') {
      showToast(`✅ Hak akses staf ${name} berhasil disimpan.`);
    }

    if (typeof navigate === 'function') navigate('/users', false);
  },

  /**
   * Sends password reset email link to staff (mirrors forgot password flow)
   * @param {string} email
   */
  sendPasswordReset(email) {
    store.dispatch('SEND_STAFF_PASSWORD_RESET', { email });

    if (typeof showToast === 'function') {
      showToast(`✉️ Tautan atur ulang kata sandi (berlaku 1 jam) telah dikirimkan ke ${email}`);
    }
  },

  /**
   * Resets cashier fast PIN to temporary HMAC code
   * @param {string} email
   */
  resetStaffPin(email) {
    store.dispatch('RESET_STAFF_PIN', { email });

    if (typeof showToast === 'function') {
      showToast(`🔑 PIN kasir untuk ${email} berhasil direset (PIN Sementara: 8492).`);
    }

    if (typeof navigate === 'function') navigate('/users', false);
  },

  /**
   * Deletes a staff member from the workspace (owner protected)
   * @param {string} email
   */
  deleteStaff(email) {
    const state = store.getState();
    const staff = state?.pilar8?.staff?.find((s) => s.email === email);
    if (!staff) return;

    if (staff.isOwner) {
      if (typeof showToast === 'function') showToast('Akun Pemilik Toko (Owner) tidak dapat dihapus.');
      return;
    }

    const confirmMsg = `Yakin ingin menghapus staf "${staff.name}" (${staff.email}) dari toko? Akses akan langsung dicabut.`;
    if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) {
      return;
    }

    store.dispatch('DELETE_STAFF', { email });

    if (typeof showToast === 'function') {
      showToast(`🗑️ Staf ${staff.name} berhasil dihapus.`);
    }

    if (typeof navigate === 'function') navigate('/users', false);
  },
};

// Global bindings for inline HTML onclick attributes
function openInviteStaffModal() { UsersController.openInviteModal(); }
function closeInviteStaffModal() { UsersController.closeInviteModal(); }
function handleInviteStaffSubmit(e) { UsersController.handleInviteSubmit(e); }
function openEditStaffModal(email) { UsersController.openEditModal(email); }
function closeEditStaffModal() { UsersController.closeEditModal(); }
function handleEditStaffSubmit(e) { UsersController.handleEditSubmit(e); }
function sendStaffPasswordReset(email) { UsersController.sendPasswordReset(email); }
function handleResetStaffPin(email) { UsersController.resetStaffPin(email); }
function handleDeleteStaff(email) { UsersController.deleteStaff(email); }
function applyStaffPreset(preset, form) { UsersController.applyPreset(preset, form); }
