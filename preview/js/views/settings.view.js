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

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; max-width: 1100px;">
        
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
                  https://<span id="current-subdomain-display">${currentSubdomain}</span>.sidaya.biz.id
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
              <div style="display:flex; gap:8px;">
                <div style="position:relative; flex:1;">
                  <input id="settings-new-subdomain" type="text" class="form-input" value="${currentSubdomain}" 
                         placeholder="contoh: berasjayagrosir" 
                         oninput="SettingsController.handleSubdomainInput(this.value)"
                         style="padding-right:110px; font-family:var(--font-mono, monospace); font-weight:600;">
                  <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:12px; color:var(--text-muted); pointer-events:none;">
                    .sidaya.biz.id
                  </span>
                </div>
                <button class="btn btn-outline" onclick="SettingsController.handleChangeSubdomain()">
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
                      <strong>Alias Aktif:</strong> ${aliases.map(a => `<span class="badge badge-warning" style="margin-left:4px;">${a.alias}.sidaya.biz.id (s/d ${a.expiresAt})</span>`).join('')}
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

        <!-- Kolom 2: Identitas Toko & Hardware Printer -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <div class="card">
            <div class="card-title">🏪 Identitas Toko & Header Struk</div>
            <div class="form-group">
              <label class="form-label">Nama Usaha / Toko</label>
              <input id="settings-store-name" type="text" class="form-input" value="${s.storeName}">
            </div>
            <div class="form-group">
              <label class="form-label">Alamat Lengkap (Tercetak di Struk)</label>
              <textarea id="settings-store-address" class="form-input" rows="2" style="resize:vertical;">${s.storeAddress}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor WhatsApp Kasir / Helpdesk</label>
              <input id="settings-store-phone" type="tel" class="form-input" value="${s.storePhone}">
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

        </div>

      </div>
    `;
  },
};
