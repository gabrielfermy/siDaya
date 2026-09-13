/**
 * @fileoverview Settings & Hardware Configuration View (Pilar 09)
 * @module Views:Settings
 * @description
 * Renders merchant business identity, subdomain self-service manager (Solution A: 30-day alias),
 * custom domain CNAME support (Solution B: Pro Tier), and ESC/POS thermal printer pairing.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

const SettingsView = {
  /**
   * Renders Settings and Subdomain Management View
   * @param {Object} state - Global State Tree
   * @returns {string} HTML string
   */
  render(state) {
    const s = state?.pilar9?.settings || {
      storeName: 'Toko Grosir Beras Jaya Bersama',
      storeAddress: 'Pasar Induk Cipinang Blok A No. 12, Jakarta Timur',
      storePhone: '+6281234567890',
      subdomain: 'berasjaya',
      subdomainAliases: [{ alias: 'berasjaya-lama', expiresAt: '2026-10-10' }],
      customDomain: '',
      printerType: 'USB',
      paperWidth: '80mm',
    };

    const currentSubdomain = s.subdomain || 'berasjaya';
    const aliases = Array.isArray(s.subdomainAliases) ? s.subdomainAliases : [];
    const baseDomain = (typeof getBaseDomain === 'function') ? getBaseDomain() : 'sidaya.biz.id';
    const proto = (typeof getAppProtocol === 'function') ? getAppProtocol() : 'https:';

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Pengaturan Toko & Domain</h1>
          <p class="view-subtitle">Kelola alamat web subdomain, domain kustom, identitas toko, dan integrasi hardware.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="SettingsController.saveStoreSettings()">💾 Simpan Pengaturan</button>
        </div>
      </div>

      <div class="settings-grid">
        
        <!-- Kolom 1: Subdomain & Domain Management -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <!-- Card 1: Subdomain Self-Service (Solution A) -->
          <div class="card">
            <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
              <span>🌐 Subdomain & Alamat Web Workspace</span>
              <span class="badge badge-success">Live Active</span>
            </div>
            <p style="font-size:13px; color:var(--text-secondary); margin-bottom:14px; line-height:1.5;">
              Alamat unik toko Anda untuk akses kasir POS dan tautan WhatsApp PayLink pelanggan.
            </p>

            <div style="background:var(--bg-card-hover, rgba(0,0,0,0.03)); border:1px solid var(--border-color); border-radius:10px; padding:14px; margin-bottom:16px;">
              <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px; font-weight:600;">URL UTAMA AKTIF:</div>
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-family:var(--font-mono, monospace); font-size:15px; font-weight:700; color:var(--color-primary, #6366f1);">
                  ${proto}//<span id="current-subdomain-display">${currentSubdomain}</span>.${baseDomain}
                </span>
                <button class="btn btn-sm btn-outline" onclick="SettingsController.copyStoreUrl('${currentSubdomain}')" title="Salin URL">
                  📋 Salin
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" style="display:flex; justify-content:space-between;">
                <span>Ubah Subdomain Toko</span>
                <span id="subdomain-check-status" style="font-size:12px; font-weight:600; color:var(--color-success, #10b981);">Tersedia</span>
              </label>
              <div class="subdomain-input-group">
                <div class="subdomain-input-wrap">
                  <input id="settings-new-subdomain" type="text" class="form-input subdomain-input" value="${currentSubdomain}" 
                         placeholder="contoh: berasjayagrosir" 
                         oninput="SettingsController.handleSubdomainInput(this.value)">
                  <span class="subdomain-suffix">
                    .${baseDomain}
                  </span>
                </div>
                <button class="btn btn-outline subdomain-apply-btn" onclick="SettingsController.handleChangeSubdomain()">
                  Terapkan
                </button>
              </div>
              <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">
                Hanya huruf kecil, angka, dan tanda hubung (-). Dilarang menggunakan nama sistem khusus.
              </p>
            </div>

            <!-- 30-Day Alias Protection Callout (Solution A) -->
            <div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:10px; padding:12px; margin-top:10px;">
              <div style="display:flex; align-items:flex-start; gap:8px;">
                <span style="font-size:16px;">🛡️</span>
                <div>
                  <div style="font-size:12px; font-weight:700; color:#d97706;">Proteksi Alias 30 Hari (HTTP 301 Auto-Redirect)</div>
                  <div style="font-size:11.5px; color:var(--text-secondary); margin-top:3px; line-height:1.4;">
                    Ketika Anda mengubah subdomain, subdomain lama tetap aktif selama 30 hari dan otomatis mengarahkan pelanggan ke alamat baru tanpa memutus WhatsApp PayLink lama.
                  </div>
                  ${aliases.length > 0 ? `
                    <div style="margin-top:8px; font-size:11px; font-family:var(--font-mono, monospace); background:rgba(0,0,0,0.03); padding:6px 8px; border-radius:6px;">
                      <strong>Alias Aktif:</strong> ${aliases.map(a => `<span class="badge badge-warning" style="margin-left:4px;">${a.alias}.${baseDomain} (s/d ${a.expiresAt})</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>

          </div>

          <!-- Card 2: Custom Domain Support (Solution B - Pro Tier) -->
          <div class="card" style="border-left: 4px solid var(--color-primary, #6366f1);">
            <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
              <span>⭐ Domain Kustom (Custom Domain)</span>
              <span class="badge badge-primary">PRO / ENTERPRISE</span>
            </div>
            <p style="font-size:13px; color:var(--text-secondary); margin-bottom:14px; line-height:1.5;">
              Gunakan domain pribadi bisnis Anda sendiri (misal: <code>pos.berasjaya.com</code>) dengan SSL otomatis gratis.
            </p>

            <div class="form-group">
              <label class="form-label">Domain Kustom Anda</label>
              <div style="display:flex; gap:8px;">
                <input id="settings-custom-domain" type="text" class="form-input" 
                       placeholder="pos.namatokoanda.com" 
                       value="${s.customDomain || ''}">
                <button class="btn btn-outline" onclick="SettingsController.handleSaveCustomDomain()">
                  Verifikasi CNAME
                </button>
              </div>
            </div>

            <div style="background:var(--bg-card-hover, rgba(0,0,0,0.02)); border:1px dashed var(--border-color); border-radius:8px; padding:10px 12px; font-size:11.5px; color:var(--text-secondary);">
              <strong>Panduan DNS:</strong> Buat CNAME record di DNS Manager Anda:<br>
              <code>CNAME pos.berasjaya.com &rarr; cname.sidaya.biz.id</code>
            </div>
          </div>

        </div>

        <!-- Kolom 2: Profil Bisnis, Bank & Hardware Printer -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <div class="card">
            <div class="card-title">🏪 Profil Bisnis & Identitas Perusahaan</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label class="form-label">Nama Usaha / Merk Toko</label>
                <input id="settings-store-name" type="text" class="form-input" value="${s.storeName}">
              </div>
              <div class="form-group">
                <label class="form-label">Bentuk Badan Usaha</label>
                <select id="settings-legal-entity" class="form-select">
                  <option value="CV" ${(s.businessProfile?.legalEntity === 'CV') ? 'selected' : ''}>CV (Persekutuan Komanditer)</option>
                  <option value="PT" ${(s.businessProfile?.legalEntity === 'PT') ? 'selected' : ''}>PT (Perseroan Terbatas)</option>
                  <option value="UD" ${(s.businessProfile?.legalEntity === 'UD') ? 'selected' : ''}>UD / Usaha Dagang</option>
                  <option value="PERORANGAN" ${(s.businessProfile?.legalEntity === 'PERORANGAN') ? 'selected' : ''}>Toko Perorangan</option>
                </select>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label class="form-label">NPWP Perusahaan / Pemilik</label>
                <input id="settings-npwp" type="text" class="form-input" value="${s.businessProfile?.npwp || '01.234.567.8-012.000'}">
              </div>
              <div class="form-group">
                <label class="form-label">Nomor Induk Berusaha (NIB)</label>
                <input id="settings-nib" type="text" class="form-input" value="${s.businessProfile?.nib || '9120001234567'}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Alamat Lengkap Toko & Gudang</label>
              <textarea id="settings-store-address" class="form-input" rows="2" style="resize:vertical;">${s.storeAddress}</textarea>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label class="form-label">WhatsApp Resmi Toko</label>
                <input id="settings-store-phone" type="tel" class="form-input" value="${s.storePhone}">
              </div>
              <div class="form-group">
                <label class="form-label">Email Kontak Bisnis</label>
                <input id="settings-contact-email" type="email" class="form-input" value="${s.businessProfile?.contactEmail || 'kontak@berasjaya.com'}">
              </div>
            </div>

            <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border-color);">
              <label class="form-label" style="font-weight:700;">🏦 Rekening Bank Resmi (Tercetak pada Faktur Grosir)</label>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label class="form-label">Nama Bank</label>
                  <input id="settings-bank-name" type="text" class="form-input" value="${s.businessProfile?.bankAccount?.bank || 'BCA'}">
                </div>
                <div class="form-group">
                  <label class="form-label">Nomor Rekening</label>
                  <input id="settings-bank-number" type="text" class="form-input" value="${s.businessProfile?.bankAccount?.accountNumber || '8492-019-283'}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Nama Pemilik Rekening (A/N)</label>
                <input id="settings-bank-holder" type="text" class="form-input" value="${s.businessProfile?.bankAccount?.accountHolder || 'CV Beras Jaya Bersama'}">
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">🖨️ Printer Thermal Kasir (ESC/POS)</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Koneksi Printer</label>
                <select id="settings-printer-type" class="form-select">
                  <option value="USB" ${s.printerType === 'USB' ? 'selected' : ''}>USB Direct Thermal</option>
                  <option value="BLUETOOTH" ${s.printerType === 'BLUETOOTH' ? 'selected' : ''}>Bluetooth Mobile POS</option>
                  <option value="NETWORK" ${s.printerType === 'NETWORK' ? 'selected' : ''}>LAN / IP Printer</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Lebar Kertas</label>
                <select id="settings-paper-width" class="form-select">
                  <option value="80mm" ${s.paperWidth === '80mm' ? 'selected' : ''}>80mm (Standar Grosir)</option>
                  <option value="58mm" ${s.paperWidth === '58mm' ? 'selected' : ''}>58mm (Mini POS)</option>
                </select>
              </div>
            </div>

            <button class="btn btn-outline" style="margin-top:8px; width:100%; justify-content:center;" onclick="SettingsController.testThermalPrinter()">
              🖨️ Uji Cetak Struk Sampel ESC/POS
            </button>
          </div>

          <!-- DANGER ZONE: TENANT DELETION -->
          <div class="card" style="border: 2px solid #E11D48; background: rgba(225, 29, 72, 0.02);">
            <div class="card-title" style="color:#E11D48; display:flex; justify-content:space-between; align-items:center;">
              <span>🚨 Zona Berbahaya: Hapus Workspace Toko</span>
              <span class="badge" style="background:#E11D48; color:#fff; font-size:10px;">KHUSUS OWNER</span>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">
              Menutup dan menghapus permanen toko ini, termasuk seluruh master SKU, catatan batch FIFO, riwayat faktur, dan buku kasbon. Aksi ini tidak dapat dibatalkan (Kepatuhan UU PDP Hak Penghapusan).
            </p>
            <button class="btn btn-outline" style="border-color:#E11D48; color:#E11D48; font-weight:700;" onclick="SettingsController.openDeleteTenantModal()">
              🗑️ Hapus Permanen Workspace Toko Ini...
            </button>
          </div>

        </div>

      </div>

      <!-- MODAL: DELETE TENANT CONFIRMATION -->
      <div id="modal-delete-tenant" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 480px; border: 2px solid #E11D48;">
          <button class="modal-close-btn" onclick="SettingsController.closeDeleteTenantModal()">✕</button>
          <div style="margin-bottom: 14px;">
            <div style="font-size:24px; margin-bottom:6px;">⚠️</div>
            <h3 style="font-size:1.15rem; font-weight:800; color:#E11D48; margin:0;">Konfirmasi Penghapusan Toko</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
              Tindakan ini akan menghapus seluruh data toko <strong>"${s.storeName}"</strong> secara permanen.
            </p>
          </div>
          <div class="form-group">
            <label class="form-label">Ketik nama toko untuk mengonfirmasi: <code style="font-weight:700; color:#E11D48;">${s.storeName}</code></label>
            <input id="delete-tenant-confirm-input" type="text" class="form-input" placeholder="Ketik nama toko persis">
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:14px;">
            <button type="button" class="btn btn-outline" onclick="SettingsController.closeDeleteTenantModal()">Batal</button>
            <button type="button" class="btn btn-primary" style="background:#E11D48; border-color:#E11D48;" onclick="SettingsController.handleDeleteTenantSubmit('${s.storeName}')">
              Ya, Hapus Toko Sekarang
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
