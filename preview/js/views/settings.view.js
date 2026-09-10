/**
 * Settings & Hardware Configuration View (Pilar 09)
 */
const SettingsView = {
  render(state) {
    const s = state?.pilar9?.settings || (typeof INITIAL_DEFAULT_STATE !== 'undefined' ? INITIAL_DEFAULT_STATE.pilar9.settings : {
      storeName: 'Toko Grosir Beras Jaya Bersama',
      storeAddress: 'Pasar Induk Cipinang Blok A No. 12, Jakarta Timur',
      storePhone: '+6281234567890',
      printerType: 'USB',
      paperWidth: '80mm',
    });
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Pengaturan Toko & Integrasi Hardware</h1>
          <p class="view-subtitle">Konfigurasi printer thermal ESC/POS, barcode scanner, dan webhook pembayaran.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="saveStoreSettings()">💾 Simpan Pengaturan</button>
        </div>
      </div>

      <div class="card" style="max-width:800px;">
        <div class="card-title">🏪 Identitas Toko & Header Struk</div>
        <div class="form-group">
          <label class="form-label">Nama Usaha / Toko</label>
          <input id="settings-store-name" type="text" class="form-input" value="${s.storeName}">
        </div>
        <div class="form-group">
          <label class="form-label">Alamat Lengkap</label>
          <input id="settings-store-address" type="text" class="form-input" value="${s.storeAddress}">
        </div>
        <div class="form-group">
          <label class="form-label">Nomor WhatsApp Kasir</label>
          <input id="settings-store-phone" type="tel" class="form-input" value="${s.storePhone}">
        </div>

        <div class="card-title" style="margin-top:24px;">🖨️ Printer Thermal Kasir (ESC/POS)</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Tipe Koneksi Printer</label>
            <select id="settings-printer-type" class="form-select">
              <option value="USB" ${s.printerType === 'USB' ? 'selected' : ''}>USB Direct Thermal</option>
              <option value="BLUETOOTH" ${s.printerType === 'BLUETOOTH' ? 'selected' : ''}>Bluetooth Mobile POS</option>
              <option value="NETWORK" ${s.printerType === 'NETWORK' ? 'selected' : ''}>LAN / Ethernet IP Printer</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Lebar Kertas</label>
            <select id="settings-paper-width" class="form-select">
              <option value="80mm" ${s.paperWidth === '80mm' ? 'selected' : ''}>80mm (Standar Grosir)</option>
              <option value="58mm" ${s.paperWidth === '58mm' ? 'selected' : ''}>58mm (Mobile POS)</option>
            </select>
          </div>
        </div>

        <button class="btn btn-outline" style="margin-top:8px;" onclick="testThermalPrinter()">
          🖨️ Uji Cetak Struk Sampel ESC/POS
        </button>
      </div>
    `;
  },
};
