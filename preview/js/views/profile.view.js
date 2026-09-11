/**
 * @file profile.view.js
 * @description View renderer for User Profile modals (Tenant Staff/Owner & Platform Operator)
 * @module View:Profile
 */

const ProfileView = {
  /**
   * Renders the Merchant Tenant User Profile modal
   * @param {Object} state
   * @returns {string} HTML string
   */
  renderMerchantProfileModal(state) {
    const curUser = state?.auth?.merchantUser || { name: 'Budi Santoso', email: 'budi@berasjaya.com', role: 'Owner' };
    const staff = state?.pilar8?.staff?.find((s) => s.email === curUser.email) || {
      name: curUser.name,
      email: curUser.email,
      phone: '0812-3456-7890',
      role: curUser.role || 'Owner / Direktur',
      isOwner: true,
      pinConfigured: true,
      permissions: ['pos:checkout', 'inventory:inbound', 'finance:reports'],
    };

    const isOwner = !!staff.isOwner;
    const permissions = Array.isArray(staff.permissions) ? staff.permissions : [];

    const capMap = typeof STAFF_CAPABILITIES !== 'undefined'
      ? Object.fromEntries(STAFF_CAPABILITIES.map((c) => [c.key, c.label]))
      : {};

    return `
      <div id="modal-tenant-profile" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 520px;">
          <button class="modal-close-btn" onclick="ProfileView.closeModal('modal-tenant-profile')">✕</button>
          
          <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid var(--border-color);">
            <div style="width:52px; height:52px; border-radius:12px; background:linear-gradient(135deg, var(--color-primary, #6366f1), #4f46e5); color:#fff; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:800;">
              ${(staff.name ? staff.name[0] : 'U').toUpperCase()}
            </div>
            <div style="flex:1;">
              <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary); margin:0;">${staff.name}</h3>
              <div style="display:flex; align-items:center; gap:6px; margin-top:3px;">
                <span class="badge ${isOwner ? 'badge-primary' : 'badge-success'}" style="font-size:11px;">
                  ${isOwner ? '👑 PEMILIK TOKO (OWNER)' : '👔 STAF TOKO'}
                </span>
                <span style="font-size:12px; color:var(--text-muted); font-family:var(--font-mono, monospace);">${staff.email}</span>
              </div>
            </div>
          </div>

          <form id="tenant-self-profile-form" onsubmit="event.preventDefault(); ProfileView.saveProfile();">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div class="form-group">
                <label class="form-label">Nama Lengkap</label>
                <input id="self-profile-name" type="text" class="form-input" required value="${staff.name || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Nomor WhatsApp / HP</label>
                <input id="self-profile-phone" type="tel" class="form-input" required value="${staff.phone || ''}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" style="display:flex; justify-content:space-between;">
                <span>PIN Cepat Kasir POS (4 Digit)</span>
                <span style="font-size:11px; color:var(--text-muted);">${staff.pinConfigured ? '🟢 PIN Aktif' : '⚪ Belum Dikonfigurasi'}</span>
              </label>
              <input id="self-profile-pin" type="password" maxlength="4" pattern="[0-9]{4}" class="form-input" placeholder="Isi 4 angka untuk ubah PIN (misal: 1234)">
              <p style="font-size:11px; color:var(--text-muted); margin-top:3px;">Digunakan saat kasir POS login cepat di meja pembayaran.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Hak Akses Granular Anda:</label>
              <div style="display:flex; flex-wrap:wrap; gap:5px; max-height:100px; overflow-y:auto; padding:6px; background:var(--bg-hover); border-radius:8px; border:1px solid var(--border-color);">
                ${isOwner ? '<span class="badge badge-primary" style="font-size:11px;">⭐ AKSES PENUH TOKO (Semua Modul & COGS)</span>' : ''}
                ${permissions.map((p) => `
                  <span class="badge badge-outline" style="font-size:11px;">${capMap[p] || p}</span>
                `).join('')}
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
              <button type="button" class="btn btn-outline btn-sm" onclick="UsersController.sendPasswordReset('${staff.email}')">
                ✉️ Kirim Tautan Reset Sandi
              </button>
              <button type="submit" class="btn btn-primary btn-sm">
                💾 Simpan Perubahan
              </button>
            </div>
          </form>

          <!-- Zona Berbahaya: Self-Deletion -->
          <div style="margin-top:18px; padding-top:14px; border-top:1px dashed var(--border-color);">
            <div style="font-size:12px; font-weight:700; color:var(--accent-rose); margin-bottom:4px;">Zona Berbahaya: Hapus Akun</div>
            ${isOwner ? `
              <p style="font-size:11px; color:var(--text-muted); margin:0;">
                ⚠️ <strong>Akun Pemilik Utama Toko:</strong> Anda tidak dapat menghapus akun pemilik secara mandiri. Untuk menutup toko, gunakan menu <em>Hapus Workspace Tenant</em> pada Pengaturan Toko.
              </p>
            ` : `
              <p style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">
                Tindakan ini akan mencabut seluruh hak akses Anda ke toko grosir ini secara permanen.
              </p>
              <button type="button" class="btn btn-sm" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.3);" onclick="ProfileView.handleSelfDelete('${staff.email}')">
                🗑️ Hapus Akun Saya Mandiri
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renders the Platform Operator Profile modal
   * @param {Object} state
   * @returns {string} HTML string
   */
  renderOperatorProfileModal(state) {
    const curOp = state?.auth?.operatorUser || { name: 'Gabriel (CEO)', email: 'gabriel@ashvinlabs.com', role: 'SUPER_ADMIN' };
    return `
      <div id="modal-operator-profile" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 480px; border-color: rgba(124, 58, 237, 0.4);">
          <button class="modal-close-btn" onclick="ProfileView.closeModal('modal-operator-profile')">✕</button>
          
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <div style="width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg, #7C3AED, #4F46E5); color:#fff; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800;">
              ⚡
            </div>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary); margin:0;">${curOp.name || 'Platform Operator'}</h3>
              <div style="font-size:12px; color:#7c3aed; font-family:var(--font-mono, monospace);">${curOp.email}</div>
            </div>
          </div>

          <div style="background:rgba(124, 58, 237, 0.05); border:1px solid rgba(124, 58, 237, 0.2); border-radius:8px; padding:12px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="font-size:12px; color:var(--text-secondary);">Peran Keamanan Platform:</span>
              <span class="badge badge-primary" style="font-size:11px;">${curOp.role || 'SUPER_ADMIN'}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="font-size:12px; color:var(--text-secondary);">Status Sesi Kontrol:</span>
              <span class="badge badge-success" style="font-size:11px;">🟢 AKTIF (TTL 30 Menit)</span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <button class="btn btn-outline" onclick="OperatorController.sendPasswordReset('${curOp.email}')">
              ✉️ Kirim Tautan Reset Sandi Korporat
            </button>
            <button class="btn btn-primary" style="background:linear-gradient(135deg, #7C3AED, #4F46E5); border:none;" onclick="ProfileView.closeModal('modal-operator-profile')">
              ✓ Selesai
            </button>
          </div>
        </div>
      </div>
    `;
  },

  openMerchantProfileModal() {
    const root = document.getElementById('modal-root') || document.body;
    if (root) {
      let modal = document.getElementById('modal-tenant-profile');
      if (!modal) {
        root.insertAdjacentHTML('beforeend', this.renderMerchantProfileModal(store.getState()));
        modal = document.getElementById('modal-tenant-profile');
      } else {
        modal.outerHTML = this.renderMerchantProfileModal(store.getState());
        modal = document.getElementById('modal-tenant-profile');
      }
      if (modal) modal.classList.remove('hidden');
    }
  },

  openOperatorProfileModal() {
    const root = document.getElementById('modal-root') || document.body;
    if (root) {
      let modal = document.getElementById('modal-operator-profile');
      if (!modal) {
        root.insertAdjacentHTML('beforeend', this.renderOperatorProfileModal(store.getState()));
        modal = document.getElementById('modal-operator-profile');
      } else {
        modal.outerHTML = this.renderOperatorProfileModal(store.getState());
        modal = document.getElementById('modal-operator-profile');
      }
      if (modal) modal.classList.remove('hidden');
    }
  },

  closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
  },

  saveProfile() {
    const name = document.getElementById('self-profile-name')?.value.trim();
    const phone = document.getElementById('self-profile-phone')?.value.trim();
    const pin = document.getElementById('self-profile-pin')?.value.trim();

    store.dispatch('UPDATE_SELF_PROFILE', { name, phone, pin });
    this.closeModal('modal-tenant-profile');
    if (typeof showToast === 'function') showToast('✅ Profil akun Anda berhasil diperbarui.');
    if (typeof navigate === 'function') navigate(window.location.pathname, false);
  },

  handleSelfDelete(email) {
    if (!confirm('Apakah Anda yakin ingin menghapus akun Anda sendiri secara permanen? Sesi Anda akan langsung dihentikan.')) return;
    store.dispatch('SELF_DELETE_USER', { email });
    this.closeModal('modal-tenant-profile');
    if (typeof showToast === 'function') showToast('Akun Anda telah dihapus. Sesi diakhiri.');
    if (typeof handleLogout === 'function') handleLogout();
  },
};

function openStaffProfile() {
  const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const isOps = host.startsWith('ops.') || host === 'ops.localhost';
  if (isOps) ProfileView.openOperatorProfileModal();
  else ProfileView.openMerchantProfileModal();
}
