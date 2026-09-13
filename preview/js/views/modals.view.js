/**
 * @fileoverview Modals View: Shared overlay dialogs for Owner Registration, Checkout, Impersonation, and Diagnostics
 * @module View:Modals
 * @description
 * Pure modal templates for Owner Onboarding, Fast POS Checkout, Operator Impersonation with Ticket Binding,
 * and Break-Glass Forensic Diagnostics under UU PDP compliance.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

const ModalsView = {
  renderAllModals() {
    return `
      <!-- MODAL: FORGOT PASSWORD -->
      <div id="modal-forgot-password" class="modal-overlay hidden">
        <div class="modal-card">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">🔑 Lupa Kata Sandi Akun</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Instruksi tautan reset berbatas waktu (1 jam) akan dikirimkan ke email terdaftar Anda.
            </p>
          </div>
          <form id="forgot-password-form" onsubmit="handleForgotPasswordSubmit(event)">
            <div class="form-group">
              <label class="form-label">Alamat Email Akun Terdaftar</label>
              <input id="forgot-email" type="email" class="form-input" required placeholder="budi@berasjaya.com">
            </div>
            <button type="submit" class="login-btn">
              <span>✉️</span> Kirim Tautan Reset Kata Sandi
            </button>
          </form>
        </div>
      </div>

      <!-- MODAL: OPERATOR IMPERSONATION ("ACT AS TENANT USER") -->
      <div id="modal-impersonate" class="modal-overlay hidden">
        <div class="modal-card" style="border: 2px solid #7c3aed; max-width: 480px;">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(124, 58, 237, 0.1); color:#7c3aed; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:700; margin-bottom:6px;">
              <span>🎭</span> Operator Tenant Shadowing
            </div>
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">Masuk sebagai Pengguna Tenant</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Investigasi tiket support langsung dalam tampilan persis staf tenant.
            </p>
          </div>

          <form id="impersonation-form" onsubmit="OperatorController.handleStartImpersonationSubmit(event)">
            <input type="hidden" id="imp-target-tenant-id" value="t1">
            
            <div class="form-group">
              <label class="form-label">Pilih Akun Staf Tenant yang Dituju</label>
              <select id="imp-target-user" class="form-select" required>
                <option value="budi@berasjaya.com" selected>Budi Santoso — 👑 Owner (Akses Penuh)</option>
                <option value="siti@berasjaya.com">Siti Rahma — 💳 Kasir Grosir (POS)</option>
                <option value="agus@berasjaya.com">Agus Santoso — 📦 Kepala Gudang & FIFO</option>
                <option value="joko@berasjaya.com">Joko Supir — 🚚 Supir Logistik (POD)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Nomor Tiket Support (Wajib)*</label>
              <input id="imp-ticket-ref" type="text" class="form-input" required placeholder="#TICKET-8492 / #INC-9012" value="#TICKET-8492">
            </div>

            <div class="form-group">
              <label class="form-label">Alasan & Cakupan Investigasi (Wajib)*</label>
              <textarea id="imp-reason" class="form-input" rows="2" required placeholder="Contoh: Investigasi selisih hitungan FIFO pada faktur nomor INV-089">Investigasi selisih alokasi FIFO batch Agustus</textarea>
            </div>

            <div style="background:rgba(124, 58, 237, 0.06); border:1px solid rgba(124, 58, 237, 0.2); border-radius:8px; padding:10px 12px; font-size:11.5px; color:var(--text-secondary); margin-bottom:14px;">
              🔒 <strong>Kepatuhan UU PDP:</strong> Sesi impersonasi ini dicatat permanen dalam <code>platform_operator_audit_logs</code>. Banner peringatan akan tampil di bagian atas layar.
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; background:linear-gradient(135deg, #7c3aed, #4f46e5); border:none; padding:10px; font-weight:700;">
              🚀 Mulai Sesi Impersonasi (Masuk Workspace)
            </button>
          </form>
        </div>
      </div>

      <!-- MODAL: POS CHECKOUT -->
      <div id="modal-checkout" class="modal-overlay hidden">
        <div class="modal-card">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">💳 Pilih Metode Pembayaran</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Pilih metode penyelesaian transaksi POS grosir.
            </p>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px;">
            <button class="btn btn-primary" style="padding:16px; flex-direction:column; gap:6px;" onclick="executePosCheckout('TUNAI')">
              <span style="font-size:1.5rem;">💵</span>
              <strong>Kas Tunai (Cash)</strong>
            </button>
            <button class="btn btn-outline" style="padding:16px; flex-direction:column; gap:6px; border-color:var(--primary);" onclick="executePosCheckout('QRIS_PAYLINK')">
              <span style="font-size:1.5rem;">📱</span>
              <strong>PayLink QRIS / VA</strong>
            </button>
            <button class="btn btn-outline" style="padding:16px; flex-direction:column; gap:6px;" onclick="executePosCheckout('TEMPO_KASBON')">
              <span style="font-size:1.5rem;">📋</span>
              <strong>Tempo / Kasbon (TOP)</strong>
            </button>
            <button class="btn btn-outline" style="padding:16px; flex-direction:column; gap:6px;" onclick="executePosCheckout('TRANSFER_BANK')">
              <span style="font-size:1.5rem;">🏦</span>
              <strong>Transfer Bank Manual</strong>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL: BREAKGLASS DIAGNOSTIC -->
      <div id="modal-breakglass" class="modal-overlay hidden">
        <div class="modal-card" style="border-color:var(--accent-rose);">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--accent-rose);">🚨 Break-Glass Emergency Diagnostic</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Akses darurat untuk membuka proteksi PII dan audit log kepatuhan UU PDP.
            </p>
          </div>
          <div class="form-group">
            <label class="form-label">Nomor Tiket Support / Emergency Incident</label>
            <input id="bg-ticket-id" type="text" class="form-input" value="INC-2026-0909-01">
          </div>
          <div class="form-group">
            <label class="form-label">Alasan & Cakupan Investigasi</label>
            <textarea id="bg-reason" class="form-input" rows="3">Investigasi mismatch transaksi webhook payment gateway toko Beras Jaya</textarea>
          </div>
          <button class="btn btn-primary" style="width:100%; background:var(--accent-rose); border-color:var(--accent-rose);" onclick="executeBreakglass()">
            ⚠️ Aktifkan Sesi Break-Glass (Dicatat di Audit Trail)
          </button>
        </div>
      </div>

      <!-- MODAL: CSV BULK IMPORT -->
      <div id="modal-csv-import" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 560px;">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 14px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">📥 Impor Massal Master SKU (CSV)</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Unggah berkas CSV untuk memperbarui atau menambahkan data SKU komoditas secara instan.
            </p>
          </div>
          <div style="border: 2px dashed var(--border-color); border-radius:8px; padding: 18px; text-align:center; background: var(--bg-hover); margin-bottom:12px;">
            <span style="font-size: 2rem;">📄</span>
            <p style="font-size:12px; font-weight:600; margin:6px 0 2px 0;">Pilih Berkas CSV dari Perangkat</p>
            <p style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">Format yang didukung: .csv (UTF-8)</p>
            <input id="csv-file-input" type="file" accept=".csv" class="form-input" style="max-width:280px; margin:0 auto; font-size:11.5px;" onchange="handleCsvFileChange(event)">
          </div>
          <div id="csv-preview-wrap">
            <div style="padding:15px; text-align:center; color:var(--text-muted); font-size:12px;">
              Pilih berkas CSV di atas untuk melihat pratinjau verifikasi data.
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; gap:8px;">
            <button type="button" class="btn btn-outline" style="font-size:12px;" onclick="downloadCsvTemplate()">📄 Unduh Template</button>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-outline" style="font-size:12px;" onclick="closeModal()">Batal</button>
              <button id="btn-commit-csv" type="button" class="btn btn-primary" style="font-size:12px;" disabled onclick="commitCsvImport()">🚀 Impor ke Katalog</button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: ADD SINGLE PRODUCT -->
      <div id="modal-add-product" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 480px;">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 14px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">+ Tambah Produk SKU Baru</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Daftarkan produk baru ke katalog master dan modul kasir POS.
            </p>
          </div>
          <form id="add-product-form" onsubmit="handleAddProductSubmit(event)">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label class="form-label">Kode SKU (Unik)*</label>
                <input id="new-prod-sku" type="text" class="form-input" required placeholder="BRS-PDK-50K">
              </div>
              <div class="form-group">
                <label class="form-label">Kategori</label>
                <select id="new-prod-category" class="form-select">
                  <option value="BERAS">Beras</option>
                  <option value="MINYAK">Minyak Goreng</option>
                  <option value="GULA">Gula Pasir</option>
                  <option value="TEPUNG">Tepung Terigu</option>
                  <option value="GENERAL">Lainnya</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Nama Komoditas / Produk*</label>
              <input id="new-prod-name" type="text" class="form-input" required placeholder="Beras Pandan Wangi Premium">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label class="form-label">Satuan Dasar*</label>
                <input id="new-prod-unit" type="text" class="form-input" required placeholder="KG / Karung / Pcs" value="KG">
              </div>
              <div class="form-group">
                <label class="form-label">Stok Awal Fisik</label>
                <input id="new-prod-stock" type="number" class="form-input" required value="100">
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label class="form-label">Harga Jual Grosir (Rp)*</label>
                <input id="new-prod-price" type="number" class="form-input" required placeholder="14000">
              </div>
              <div class="form-group">
                <label class="form-label">Harga Pokok / COGS (Rp)</label>
                <input id="new-prod-cogs" type="number" class="form-input" required placeholder="12000">
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:8px;">💾 Simpan ke Master Katalog</button>
          </form>
        </div>
      </div>

      <!-- MODAL: DYNAMIC QRIS SIMULATOR -->
      <div id="modal-qris-simulator" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 420px; text-align:center;">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 12px;">
            <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(16, 185, 129, 0.1); color:var(--accent-green); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700; margin-bottom:6px;">
              <span>📱</span> QRIS Dinamis SiDaya PayLink
            </div>
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">Pindai untuk Membayar</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
              Toko Grosir Beras Jaya Bersama (NMID: ID102030405060)
            </p>
          </div>

          <!-- DYNAMIC QR CODE DISPLAY -->
          <div style="background:#fff; padding:16px; border-radius:12px; border:2px solid var(--border-color); display:inline-block; margin:8px auto; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
            <svg width="180" height="180" viewBox="0 0 180 180" style="display:block;">
              <rect width="180" height="180" fill="#ffffff" />
              <rect x="15" y="15" width="45" height="45" fill="#0f172a" rx="4"/>
              <rect x="23" y="23" width="29" height="29" fill="#ffffff" rx="2"/>
              <rect x="29" y="29" width="17" height="17" fill="#0f172a" rx="2"/>
              <rect x="120" y="15" width="45" height="45" fill="#0f172a" rx="4"/>
              <rect x="128" y="23" width="29" height="29" fill="#ffffff" rx="2"/>
              <rect x="134" y="29" width="17" height="17" fill="#0f172a" rx="2"/>
              <rect x="15" y="120" width="45" height="45" fill="#0f172a" rx="4"/>
              <rect x="23" y="128" width="29" height="29" fill="#ffffff" rx="2"/>
              <rect x="29" y="134" width="17" height="17" fill="#0f172a" rx="2"/>
              <rect x="70" y="20" width="12" height="12" fill="#0f172a"/>
              <rect x="90" y="20" width="12" height="12" fill="#0f172a"/>
              <rect x="75" y="45" width="30" height="12" fill="#0f172a"/>
              <rect x="20" y="75" width="140" height="10" fill="#0f172a"/>
              <rect x="75" y="95" width="15" height="30" fill="#0f172a"/>
              <rect x="100" y="95" width="25" height="15" fill="#0f172a"/>
              <rect x="130" y="95" width="30" height="15" fill="#0f172a"/>
              <rect x="75" y="135" width="35" height="25" fill="#0f172a"/>
              <rect x="120" y="120" width="40" height="40" fill="#0f172a"/>
            </svg>
          </div>

          <div style="margin-top:6px;">
            <div style="font-size:11px; color:var(--text-muted);">Total Nominal Tagihan:</div>
            <div id="qris-nominal" style="font-size:1.4rem; font-weight:800; color:var(--accent-green); letter-spacing:-0.5px;">Rp 0</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
              ⏱️ Berlaku hingga: <span id="qris-countdown" style="font-weight:700; color:var(--accent-rose);">14:59</span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
            <button class="btn btn-primary" style="background:linear-gradient(135deg, #10b981, #059669); border:none; padding:10px; font-weight:700;" onclick="PosController.simulateQrisSuccess()">
              ⚡ Simulasikan Pembayaran Pelanggan (Webhook Auto-Settlement)
            </button>
            <button class="btn btn-outline" style="font-size:12px;" onclick="PosController.shareWhatsAppPayLink()">
              📲 Bagikan Tautan Bayar via WhatsApp
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL: THERMAL RECEIPT PRINT SIMULATOR -->
      <div id="modal-thermal-receipt" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 400px; background:#f8fafc;">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="margin-bottom: 12px; text-align:center;">
            <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(37, 99, 235, 0.1); color:var(--primary); padding:3px 8px; border-radius:6px; font-size:11.5px; font-weight:700;">
              <span>🖨️</span> Simulator Struk Termal ESC/POS (58mm/80mm)
            </div>
          </div>

          <!-- THERMAL PAPER SLIP -->
          <div id="thermal-receipt-slip" class="thermal-paper">
            <div class="thermal-header">
              <div class="thermal-brand">TOKO GROSIR BERAS JAYA</div>
              <div class="thermal-sub">Pasar Induk Kramat Jati, Jakarta Timur</div>
              <div class="thermal-sub">Telp: 0812-3456-7890 | berasjaya.${(typeof getBaseDomain === 'function') ? getBaseDomain() : 'sidaya.biz.id'}</div>
              <div class="thermal-divider">================================</div>
            </div>
            <div class="thermal-meta">
              <div>No. Trans : <span id="rec-inv-num">INV-20260910-001</span></div>
              <div>Tanggal   : <span id="rec-date">10/09/2026 12:30</span></div>
              <div>Kasir     : <span id="rec-cashier">Siti Rahma (K01)</span></div>
              <div>Metode    : <span id="rec-method">QRIS PAYLINK</span></div>
              <div class="thermal-divider">--------------------------------</div>
            </div>
            <div id="rec-items-list" class="thermal-items">
              <!-- Rendered lines -->
            </div>
            <div class="thermal-divider">--------------------------------</div>
            <div class="thermal-totals">
              <div class="rec-row"><span>Subtotal</span><span id="rec-subtotal">Rp 0</span></div>
              <div class="rec-row"><span>Diskon Grosir</span><span id="rec-discount">Rp 0</span></div>
              <div class="rec-row thermal-bold"><span>TOTAL BAYAR</span><span id="rec-grand-total">Rp 0</span></div>
              <div class="rec-row"><span>Diterima / Ref</span><span id="rec-tendered">QRIS-SETTLED</span></div>
              <div class="rec-row"><span>Kembalian</span><span id="rec-change">Rp 0</span></div>
              <div class="thermal-divider">================================</div>
            </div>
            <div class="thermal-footer">
              <div style="font-size:10px; font-weight:700; margin-bottom:4px;">TERIMA KASIH ATAS KUNJUNGAN ANDA</div>
              <div style="font-size:9px; color:#475569;">Barang yang sudah dibeli tidak dapat ditukar kecuali perjanjian retur resmi.</div>
              <div style="font-family:monospace; letter-spacing:2px; font-size:14px; margin-top:6px;">||||| | |||| |||||| ||||</div>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button class="btn btn-primary" style="flex:1; font-size:12px;" onclick="PosController.printThermalReceipt()">
              🖨️ Cetak Struk
            </button>
            <button class="btn btn-outline" style="flex:1; font-size:12px;" onclick="PosController.shareWhatsAppReceipt()">
              📲 WhatsApp
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL: GOOGLE SIGN-IN PICKER -->
      <div id="modal-google-auth" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 420px; border-radius: 16px; padding: 22px;">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="text-align:center; margin-bottom: 16px;">
            <svg style="width:34px; height:34px; margin: 0 auto 8px auto; display:block;" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-primary);">Pilih Akun Google</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">Simulasi Google OAuth 2.0 untuk SiDaya Workspace</p>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${(typeof GOOGLE_PRESET_ACCOUNTS !== 'undefined' ? GOOGLE_PRESET_ACCOUNTS : []).map(a => `
              <div onclick="AuthController.selectGoogleAccount('${a.email}', '${a.name}', '${a.avatar}')" 
                   style="display:flex; align-items:center; gap:10px; padding:8px 12px; border:1px solid var(--border-color); border-radius:8px; cursor:pointer; text-align:left;"
                   onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
                <div style="width:32px; height:32px; border-radius:50%; background:#2563EB; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px;">${a.avatar}</div>
                <div style="flex:1; min-width:0;">
                  <div style="font-size:12.5px; font-weight:700; color:var(--text-primary);">${a.name}</div>
                  <div style="font-size:11px; color:var(--text-secondary);">${a.googleEmail}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border-color); text-align:center;">
            <button class="btn btn-outline btn-sm" onclick="AuthController.promptCustomGoogleAccount()" style="width:100%; font-size:11.5px;">
              ➕ Gunakan Akun Google Lainnya...
            </button>
          </div>
        </div>
      </div>
    `;
  },
};

/**
 * Auto-generates subdomain slug from business name input and updates live preview
 */
function handleRegNameChange(val) {
  const subInput = document.getElementById('reg-biz-subdomain');
  const preview = document.getElementById('reg-subdomain-preview');
  if (subInput && val) {
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    subInput.value = slug;
    if (preview) preview.textContent = slug || 'subdomain';
  }
}

/**
 * Live updates subdomain preview when typing in subdomain field
 */
function handleRegSubdomainChange(val) {
  const preview = document.getElementById('reg-subdomain-preview');
  if (preview) {
    const slug = (val || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    preview.textContent = slug || 'subdomain';
  }
}
