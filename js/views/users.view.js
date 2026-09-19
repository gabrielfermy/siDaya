/**
 * @file users.view.js
 * @description View renderer for Staff Management, Direct User Permissions, and Secure Password Reset
 * @module View:Users
 */

const UsersView = {
  /**
   * Renders the complete staff management workspace with direct user permissions
   * @param {Object} state - Global state tree
   * @returns {string} HTML markup
   */
  render(state) {
    const staffList = state?.pilar8?.staff || [];
    const totalStaff = staffList.length;
    const cashierCount = staffList.filter((s) => s.permissions?.includes('pos:checkout')).length;
    const warehouseCount = staffList.filter((s) => s.permissions?.includes('inventory:inbound')).length;
    const cogsProtectedCount = staffList.filter((s) => !s.permissions?.includes('catalog:view_cogs')).length;

    const capabilities = typeof STAFF_CAPABILITIES !== 'undefined' ? STAFF_CAPABILITIES : [];

    return `
      <!-- VIEW HEADER -->
      <div class="view-header">
        <div>
          <h1 class="view-title">Manajemen Staf & Hak Akses</h1>
          <p class="view-subtitle">
            Atur izin operasional (kasir, gudang, logistik) langsung per pengguna tanpa kerumitan matriks grup. Reset kata sandi via email aman.
          </p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="openInviteStaffModal()">
            <span>➕</span> Undang Staf Baru
          </button>
        </div>
      </div>

      <!-- KPI METRICS SUMMARY -->
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 20px;">
        <div class="kpi-card">
          <div class="kpi-label">Total Staf Terdaftar</div>
          <div class="kpi-value" style="color:var(--text-primary);">${totalStaff} Orang</div>
          <div class="kpi-sub">Anggota tim aktif di workspace toko</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Akses Kasir POS</div>
          <div class="kpi-value" style="color:#059669;">${cashierCount} Staf</div>
          <div class="kpi-sub">Diberi wewenang transaksi kasir</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Akses Gudang & Logistik</div>
          <div class="kpi-value" style="color:#4F46E5;">${warehouseCount} Staf</div>
          <div class="kpi-sub">Wewenang terima FIFO & Surat Jalan</div>
        </div>
        <div class="kpi-card" style="border-left: 4px solid #E11D48;">
          <div class="kpi-label">Privasi Modal (COGS) Terlindungi</div>
          <div class="kpi-value" style="color:#E11D48;">${cogsProtectedCount} Staf Dibatasi</div>
          <div class="kpi-sub">🔒 Tidak dapat melihat harga modal supplier</div>
        </div>
      </div>

      <!-- STAFF DIRECTORY CARD -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <div>
            <div class="card-title" style="margin-bottom:2px;">Direktori Staf & Batasan Hak Akses Langsung</div>
            <p style="font-size:0.75rem; color:var(--text-secondary);">Setiap staf memiliki izin individual yang dapat ditinjau dan diubah sewaktu-waktu oleh Owner.</p>
          </div>
        </div>

        <div class="table-scroll-hint"><span>⇄</span> Geser tabel untuk melihat seluruh rincian hak akses & tombol aksi</div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="min-width:200px;">Staf & Posisi</th>
                <th>Kontak Login & WhatsApp</th>
                <th style="min-width:250px;">Ringkasan Izin Operasional Langsung</th>
                <th>Keamanan PIN Kasir</th>
                <th style="text-align:right; min-width:210px;">Aksi Keamanan & Akses</th>
              </tr>
            </thead>
            <tbody>
              ${staffList.map((s) => {
                const perms = s.permissions || [];
                const isOwner = !!s.isOwner;
                const canCogs = perms.includes('catalog:view_cogs');
                const canPos = perms.includes('pos:checkout');
                const canWh = perms.includes('inventory:inbound');
                const canPod = perms.includes('logistics:sign_pod');
                const canFin = perms.includes('finance:reports');

                return `
                  <tr>
                    <td>
                      <div style="display:flex; align-items:center; gap:10px;">
                        <span class="user-avatar" style="width:34px; height:34px; border-radius:8px; font-size:14px; background:${isOwner ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'}; color:#FFF; display:flex; align-items:center; justify-content:center; font-weight:700;">
                          ${s.name ? s.name.charAt(0) : 'S'}
                        </span>
                        <div>
                          <strong style="color:var(--text-primary);">${s.name}</strong>
                          <div style="font-size:0.72rem; color:var(--text-secondary); display:flex; align-items:center; gap:4px; margin-top:2px;">
                            ${isOwner ? '<span class="tier-badge tier-grosir-pro" style="padding:1px 5px; font-size:9px;">👑 OWNER</span>' : ''}
                            <span>${s.role || 'Staf Toko'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style="font-size:0.8rem; color:var(--text-primary); font-family:var(--font-mono);">${s.email}</div>
                      <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">📱 ${s.phone || '-'}</div>
                    </td>
                    <td>
                      <div style="display:flex; flex-wrap:wrap; gap:4px;">
                        ${canPos ? '<span class="tier-badge" style="background:rgba(5, 150, 105, 0.12); color:#059669; font-size:10px;">🛒 Kasir POS</span>' : ''}
                        ${canWh ? '<span class="tier-badge" style="background:rgba(79, 70, 229, 0.12); color:#4F46E5; font-size:10px;">📦 Gudang FIFO</span>' : ''}
                        ${canPod ? '<span class="tier-badge" style="background:rgba(217, 119, 6, 0.12); color:#D97706; font-size:10px;">🚚 Supir POD</span>' : ''}
                        ${canFin ? '<span class="tier-badge" style="background:rgba(124, 58, 237, 0.12); color:#7C3AED; font-size:10px;">📊 Laba Rugi</span>' : ''}
                        ${isOwner 
                          ? '<span class="tier-badge" style="background:rgba(245, 158, 11, 0.15); color:#D97706; font-size:10px;">⭐ AKSES PENUH</span>' 
                          : (canCogs 
                            ? '<span class="tier-badge" style="background:rgba(225, 29, 72, 0.15); color:#E11D48; font-size:10px;">⚠️ LIHAT MODAL</span>' 
                            : '<span class="tier-badge" style="background:rgba(16, 185, 129, 0.1); color:#059669; font-size:10px;">🔒 MODAL DILINDUNGI</span>'
                          )
                        }
                      </div>
                    </td>
                    <td>
                      <span class="tier-badge" style="background:${s.pinConfigured ? 'var(--accent-green-soft)' : 'var(--accent-amber-soft)'}; color:${s.pinConfigured ? 'var(--accent-green)' : 'var(--accent-amber)'}; font-size:10px;">
                        ${s.pinConfigured ? '🔒 PIN AKTIF (HMAC)' : '⚠️ BELUM ADA PIN'}
                      </span>
                    </td>
                    <td style="text-align:right;">
                      <div style="display:flex; justify-content:flex-end; gap:5px; flex-wrap:wrap;">
                        <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="openEditStaffModal('${s.email}')" title="Ubah izin akses staf ini">
                          ✏️ Edit Akses
                        </button>
                        <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="sendStaffPasswordReset('${s.email}')" title="Kirim tautan atur ulang kata sandi ke email staf">
                          ✉️ Reset Sandi
                        </button>
                        <button class="btn btn-outline" style="padding:4px 6px; font-size:0.75rem;" onclick="handleResetStaffPin('${s.email}')" title="Reset PIN cepat kasir">
                          🔑 PIN
                        </button>
                        ${!isOwner ? `
                          <button class="btn btn-outline" style="padding:4px 6px; font-size:0.75rem; color:#E11D48; border-color:rgba(225,29,72,0.3);" onclick="handleDeleteStaff('${s.email}')" title="Hapus staf dari toko">
                            🗑️
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- TENANT AUDIT TRAIL LOGS -->
      <div class="card" style="margin-top:20px;">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>📋 Log Audit Akses & Keamanan Staf Toko</span>
          <span class="badge badge-outline" style="font-size:11px;">TERISOLASI DI LEVEL TENANT</span>
        </div>
        <p style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:12px;">
          Catatan riwayat aktivitas operasional akun staf (undang, ubah izin, reset PIN, dan pencabutan akses).
        </p>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pelaku</th>
                <th>Aksi</th>
                <th>Target & Deskripsi</th>
                <th>Alasan / Catatan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${(state?.pilar8?.auditLogs || []).map(log => `
                <tr>
                  <td style="font-size:12px; color:var(--text-secondary);">${log.time}</td>
                  <td><strong>${log.actor}</strong></td>
                  <td><span class="badge ${log.action.includes('DELETED') ? 'badge-danger' : log.action.includes('INVITED') ? 'badge-primary' : 'badge-warning'}">${log.action}</span></td>
                  <td>${log.target}</td>
                  <td style="font-size:12px; color:var(--text-secondary);">${log.reason}</td>
                  <td><span class="badge badge-success">${log.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODALS CONTAINER -->
      ${this.renderInviteModal(capabilities)}
      ${this.renderEditModal(capabilities)}
    `;
  },

  /**
   * Renders Modal for Inviting New Staff with Direct Permissions Selection
   * @param {Array<Object>} capabilities
   * @returns {string}
   */
  renderInviteModal(capabilities) {
    return `
      <div id="modal-invite-staff" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 620px; max-height: 90vh; overflow-y: auto;">
          <button class="modal-close-btn" onclick="closeInviteStaffModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">✉️ Undang Staf Baru & Tentukan Izin</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Pilih langsung apa yang <strong>boleh</strong> dan <strong>tidak boleh</strong> dilakukan oleh staf baru ini di toko Anda. Tautan pembuatan kata sandi akan dikirim langsung ke email staf.
            </p>
          </div>

          <form id="invite-staff-form" onsubmit="handleInviteStaffSubmit(event)">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div class="form-group">
                <label class="form-label">Nama Lengkap Staf</label>
                <input id="invite-staff-name" type="text" class="form-input" required placeholder="contoh: Rina Handayani">
              </div>
              <div class="form-group">
                <label class="form-label">Posisi / Jabatan</label>
                <input id="invite-staff-title" type="text" class="form-input" required placeholder="contoh: Kasir Shift Pagi">
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div class="form-group">
                <label class="form-label">Alamat Email Staf (Wajib untuk Akun)</label>
                <input id="invite-staff-email" type="email" class="form-input" required placeholder="rina@berasjaya.com">
              </div>
              <div class="form-group">
                <label class="form-label">No. WhatsApp / Telepon</label>
                <input id="invite-staff-phone" type="tel" class="form-input" placeholder="0812-xxxx-xxxx">
              </div>
            </div>

            <!-- PRESET SHORTCUTS -->
            <div style="margin-top:10px; margin-bottom:12px; background:var(--bg-surface); padding:10px 12px; border-radius:10px; border:1px solid var(--border-color);">
              <label class="form-label" style="margin-bottom:6px; font-weight:700;">Template Izin Cepat:</label>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button type="button" class="btn btn-outline invite-preset-pill active" data-preset="CASHIER" onclick="applyStaffPreset('CASHIER', 'invite')">💳 Kasir POS</button>
                <button type="button" class="btn btn-outline invite-preset-pill" data-preset="WAREHOUSE" onclick="applyStaffPreset('WAREHOUSE', 'invite')">📦 Staf Gudang</button>
                <button type="button" class="btn btn-outline invite-preset-pill" data-preset="DRIVER" onclick="applyStaffPreset('DRIVER', 'invite')">🚚 Supir Logistik</button>
                <button type="button" class="btn btn-outline invite-preset-pill" data-preset="MANAGER" onclick="applyStaffPreset('MANAGER', 'invite')">👔 Manajer Toko</button>
                <button type="button" class="btn btn-outline invite-preset-pill" data-preset="CUSTOM" onclick="applyStaffPreset('CUSTOM', 'invite')">⚙️ Kustom</button>
              </div>
            </div>

            <!-- DIRECT PERMISSION CHECKLIST -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; margin-bottom:8px;">Daftar Checklist Izin Staf (Centang yang Diizinkan):</label>
              <div style="display:flex; flex-direction:column; gap:8px; max-height:240px; overflow-y:auto; padding:8px 10px; border:1px solid var(--border-color); border-radius:10px; background:var(--bg-body);">
                ${capabilities.map((cap) => `
                  <label style="display:flex; align-items:flex-start; gap:10px; padding:6px 8px; border-radius:6px; background:var(--card-bg); border:1px solid var(--border-color); cursor:pointer;">
                    <input type="checkbox" name="invite-perm-key" value="${cap.key}" style="margin-top:3px;">
                    <div>
                      <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
                        ${cap.label}
                        ${cap.key === 'catalog:view_cogs' ? '<span class="tier-badge" style="background:rgba(225,29,72,0.15); color:#E11D48; font-size:9px;">⚠️ SANGAT SENSITIF</span>' : ''}
                      </div>
                      <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px;">${cap.desc}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>

            <div style="background:rgba(79, 70, 229, 0.08); border-left:3px solid #4F46E5; padding:8px 12px; border-radius:6px; margin:12px 0; font-size:0.75rem; color:var(--text-secondary);">
              🔒 <strong>Keamanan Kata Sandi:</strong> Owner tidak dapat membuat kata sandi manual. Tautan aktivasi akun berbatas waktu (1 jam) akan dikirimkan langsung ke email staf yang bersangkutan.
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
              <button type="button" class="btn btn-outline" onclick="closeInviteStaffModal()">Batal</button>
              <button type="submit" class="btn btn-primary">✉️ Kirim Undangan Staf</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  /**
   * Renders Modal for Editing Staff Direct Permissions and Sending Password Reset
   * @param {Array<Object>} capabilities
   * @returns {string}
   */
  renderEditModal(capabilities) {
    return `
      <div id="modal-edit-staff" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 620px; max-height: 90vh; overflow-y: auto;">
          <button class="modal-close-btn" onclick="closeEditStaffModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">✏️ Edit Data Staf & Hak Akses</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Sesuaikan batasan operasional untuk staf ini. Perubahan hak akses akan langsung aktif pada sesi berikutnya.
            </p>
          </div>

          <div id="edit-owner-locked-notice" style="display:none; background:rgba(245, 158, 11, 0.15); border-left:4px solid #D97706; padding:10px 12px; border-radius:8px; margin-bottom:14px; font-size:0.8rem; color:#D97706;">
            👑 <strong>Akun Pemilik Toko (Owner):</strong> Memiliki seluruh hak akses secara permanen untuk menjamin kontinuitas bisnis. Izin tidak dapat dikurangi.
          </div>

          <form id="edit-staff-form" onsubmit="handleEditStaffSubmit(event)">
            <input type="hidden" id="edit-staff-id">
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div class="form-group">
                <label class="form-label">Nama Lengkap Staf</label>
                <input id="edit-staff-name" type="text" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Posisi / Jabatan</label>
                <input id="edit-staff-title" type="text" class="form-input" required>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div class="form-group">
                <label class="form-label">Alamat Email (Akun)</label>
                <input id="edit-staff-email" type="email" class="form-input" readonly style="background:var(--bg-surface); opacity:0.8;">
              </div>
              <div class="form-group">
                <label class="form-label">No. WhatsApp</label>
                <input id="edit-staff-phone" type="tel" class="form-input">
              </div>
            </div>

            <!-- PRESET SHORTCUTS -->
            <div style="margin-top:10px; margin-bottom:12px; background:var(--bg-surface); padding:10px 12px; border-radius:10px; border:1px solid var(--border-color);">
              <label class="form-label" style="margin-bottom:6px; font-weight:700;">Terapkan Template Cepat:</label>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button type="button" class="btn btn-outline edit-preset-pill" data-preset="CASHIER" onclick="applyStaffPreset('CASHIER', 'edit')">💳 Kasir POS</button>
                <button type="button" class="btn btn-outline edit-preset-pill" data-preset="WAREHOUSE" onclick="applyStaffPreset('WAREHOUSE', 'edit')">📦 Staf Gudang</button>
                <button type="button" class="btn btn-outline edit-preset-pill" data-preset="DRIVER" onclick="applyStaffPreset('DRIVER', 'edit')">🚚 Supir</button>
                <button type="button" class="btn btn-outline edit-preset-pill" data-preset="MANAGER" onclick="applyStaffPreset('MANAGER', 'edit')">👔 Manajer</button>
                <button type="button" class="btn btn-outline edit-preset-pill" data-preset="CUSTOM" onclick="applyStaffPreset('CUSTOM', 'edit')">⚙️ Kustom</button>
              </div>
            </div>

            <!-- DIRECT PERMISSION CHECKLIST -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; margin-bottom:8px;">Hak Akses Operasional:</label>
              <div style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding:8px 10px; border:1px solid var(--border-color); border-radius:10px; background:var(--bg-body);">
                ${capabilities.map((cap) => `
                  <label style="display:flex; align-items:flex-start; gap:10px; padding:6px 8px; border-radius:6px; background:var(--card-bg); border:1px solid var(--border-color); cursor:pointer;">
                    <input type="checkbox" name="edit-perm-key" value="${cap.key}" style="margin-top:3px;">
                    <div>
                      <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
                        ${cap.label}
                        ${cap.key === 'catalog:view_cogs' ? '<span class="tier-badge" style="background:rgba(225,29,72,0.15); color:#E11D48; font-size:9px;">⚠️ SANGAT SENSITIF</span>' : ''}
                      </div>
                      <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px;">${cap.desc}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- SECURE PASSWORD RESET ACTION -->
            <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:12px; border-radius:10px; margin:14px 0;">
              <div style="font-size:0.82rem; font-weight:700; color:var(--text-primary); margin-bottom:3px;">🔑 Pengaturan Kata Sandi Staf</div>
              <p style="font-size:0.72rem; color:var(--text-secondary); margin-bottom:8px;">
                Demi kepatuhan privasi, pemilik toko tidak dapat mengganti kata sandi secara manual. Kirim tautan reset kata sandi langsung ke email staf.
              </p>
              <button type="button" class="btn btn-outline" style="font-size:0.75rem;" onclick="sendStaffPasswordReset(document.getElementById('edit-staff-email').value)">
                ✉️ Kirim Tautan Atur Ulang Kata Sandi ke Email Staf
              </button>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
              <button type="button" class="btn btn-outline" onclick="closeEditStaffModal()">Batal</button>
              <button type="submit" class="btn btn-primary">💾 Simpan Perubahan Akses</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },
};
