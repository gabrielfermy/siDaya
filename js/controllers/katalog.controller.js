/**
 * @fileoverview Master SKU & Catalog Controller
 * @module Controller:Katalog
 * @description
 * Handles product SKU management, CSV bulk template export, CSV parsing with
 * real-time validation preview, and bulk import into the reactive state store.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

const KatalogController = {
  parsedCsvData: [],

  /**
   * Opens the CSV bulk import modal
   */
  openCsvImportModal() {
    this.parsedCsvData = [];
    const previewContainer = document.getElementById('csv-preview-wrap');
    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="empty-state-box" style="padding:20px; text-align:center; color:var(--text-muted); font-size:12px;">
          Pilih atau seret berkas CSV untuk memverifikasi data sebelum impor.
        </div>
      `;
    }
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput) fileInput.value = '';
    
    const commitBtn = document.getElementById('btn-commit-csv');
    if (commitBtn) commitBtn.disabled = true;

    openModal('modal-csv-import');
  },

  /**
   * Downloads a standardized CSV template for merchant SKU upload
   */
  downloadCsvTemplate() {
    const headers = 'SKU,Nama_Produk,Kategori,Satuan_Dasar,Harga_Jual,HPP_COGS,Stok_Awal,Barcode\n';
    const sampleRows = [
      'BRS-ROJO-50K,Beras Rojo Lele Super 50kg,BERAS,Karung,680000,610000,50,8991122334455',
      'MYK-SUN-2L,Minyak Goreng SunCo 2L,MINYAK,Pouch,34000,29500,120,8992233445566',
      'GLA-GMP-1K,Gula Pasir Gulaku Premium 1kg,GULA,KG,17000,14800,200,8993344556677',
      'TPG-CKR-1K,Tepung Terigu Cakra Kembar 1kg,TEPUNG,KG,13500,11200,150,8994455667788',
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + sampleRows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'sidaya_master_sku_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('📥 Mengunduh template master SKU (sidaya_master_sku_template.csv)');
  },

  /**
   * Handles CSV file selection & parsing
   */
  handleCsvFileChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      this.parseAndPreviewCsv(text);
    };
    reader.readAsText(file);
  },

  /**
   * Parses raw CSV text and renders preview table
   */
  parseAndPreviewCsv(csvText) {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      showToast('Berkas CSV kosong atau tidak memiliki baris data.', 'warning');
      return;
    }

    const rows = [];
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 5) {
        const sku = cols[0] || `SKU-${Date.now()}-${i}`;
        const name = cols[1] || 'Produk Tanpa Nama';
        const category = (cols[2] || 'GENERAL').toUpperCase();
        const unit = cols[3] || 'PCS';
        const price = parseInt(cols[4], 10) || 0;
        const cogs = parseInt(cols[5], 10) || Math.round(price * 0.85);
        const stock = parseInt(cols[6], 10) || 0;
        const barcode = cols[7] || sku;

        rows.push({
          id: `prod_csv_${Date.now()}_${i}`,
          sku,
          name,
          category,
          unit,
          price,
          cogs,
          stock,
          barcode,
        });
      }
    }

    this.parsedCsvData = rows;
    this.renderCsvPreview(rows);
  },

  /**
   * Renders the preview table in modal
   */
  renderCsvPreview(rows) {
    const previewWrap = document.getElementById('csv-preview-wrap');
    const commitBtn = document.getElementById('btn-commit-csv');
    if (!previewWrap) return;

    if (rows.length === 0) {
      previewWrap.innerHTML = `
        <div class="empty-state-box" style="padding:20px; text-align:center; color:var(--accent-rose);">
          Format CSV tidak valid. Pastikan kolom sesuai template.
        </div>
      `;
      if (commitBtn) commitBtn.disabled = true;
      return;
    }

    previewWrap.innerHTML = `
      <div style="max-height:220px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px;">
        <table class="data-table" style="font-size:11.5px; margin:0;">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama Komoditas</th>
              <th>Satuan</th>
              <th>Harga Grosir</th>
              <th>COGS</th>
              <th>Stok Awal</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><code>${r.sku}</code></td>
                <td><strong>${r.name}</strong></td>
                <td><span class="badge-tag">${r.unit}</span></td>
                <td>${formatRupiah(r.price)}</td>
                <td><span class="cogs-value">${formatRupiah(r.cogs)}</span></td>
                <td><strong>${r.stock}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="font-size:11px; color:var(--text-secondary); margin-top:8px;">
        ✅ Ditemukan <strong>${rows.length}</strong> produk valid siap diimpor ke sistem.
      </div>
    `;

    if (commitBtn) commitBtn.disabled = false;
  },

  /**
   * Commits parsed CSV items to store
   */
  commitCsvImport() {
    if (this.parsedCsvData.length === 0) {
      showToast('Tidak ada data produk yang siap diimpor.', 'warning');
      return;
    }

    store.dispatch('ADD_PRODUCTS_BULK', { products: this.parsedCsvData });
    closeModal();
    showToast(`🎉 Sukses mengimpor ${this.parsedCsvData.length} produk SKU baru ke katalog!`);
    
    // Refresh catalog view if active
    const container = document.getElementById('main-content');
    if (container && window.location.pathname.includes('/katalog')) {
      container.innerHTML = KatalogView.render(store.getState());
    }
  },

  /**
   * Opens single product addition modal
   */
  openAddProductModal() {
    openModal('modal-add-product');
  },

  /**
   * Handles single product submission
   */
  handleAddProductSubmit(event) {
    event.preventDefault();
    const sku = document.getElementById('new-prod-sku')?.value?.trim();
    const name = document.getElementById('new-prod-name')?.value?.trim();
    const unit = document.getElementById('new-prod-unit')?.value?.trim() || 'KG';
    const price = parseInt(document.getElementById('new-prod-price')?.value, 10) || 0;
    const cogs = parseInt(document.getElementById('new-prod-cogs')?.value, 10) || 0;
    const stock = parseInt(document.getElementById('new-prod-stock')?.value, 10) || 0;
    const category = document.getElementById('new-prod-category')?.value || 'BERAS';

    if (!sku || !name || price <= 0) {
      showToast('SKU, Nama Produk, dan Harga Jual wajib diisi.', 'warning');
      return;
    }

    const newProduct = {
      id: `prod_${Date.now()}`,
      sku,
      name,
      category,
      unit,
      price,
      cogs,
      stock,
      barcode: sku,
    };

    store.dispatch('ADD_PRODUCTS_BULK', { products: [newProduct] });
    closeModal();
    showToast(`✅ Produk SKU ${sku} berhasil ditambahkan ke katalog.`);

    const container = document.getElementById('main-content');
    if (container && window.location.pathname.includes('/katalog')) {
      container.innerHTML = KatalogView.render(store.getState());
    }
  },
};

// Global helper bindings
function openCsvImportModal() { KatalogController.openCsvImportModal(); }
function downloadCsvTemplate() { KatalogController.downloadCsvTemplate(); }
function handleCsvFileChange(e) { KatalogController.handleCsvFileChange(e); }
function commitCsvImport() { KatalogController.commitCsvImport(); }
function openAddProductModal() { KatalogController.openAddProductModal(); }
function handleAddProductSubmit(e) { KatalogController.handleAddProductSubmit(e); }
function editProduct(id) { showToast(`Edit produk SKU #${id} (Pilar 02)`); }
