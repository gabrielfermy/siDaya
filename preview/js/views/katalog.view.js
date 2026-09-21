const KatalogView = {
  render(state) {
    const products = state?.pilar2?.products || [];
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Master SKU & Harga Grosir</h1>
          <p class="view-subtitle">Kelola kode barcode SKU, satuan bertingkat (Karung/Bal/Pcs), dan proteksi HPP (COGS).</p>
        </div>
        <div id="tour-catalog-actions" class="view-actions" style="display:flex; gap:8px;">
          <button class="btn btn-outline" onclick="downloadCsvTemplate()">📄 Unduh Template CSV</button>
          <button class="btn btn-outline" onclick="openCsvImportModal()">📥 Impor Massal CSV</button>
          <button class="btn btn-primary" onclick="openAddProductModal()">+ Tambah Produk SKU</button>
        </div>
      </div>

      <!-- SETUP REMINDER IF PRODUCTS EMPTY -->
      ${products.length === 0 ? `
        <div class="card" style="margin-bottom:20px; border-left: 4px solid var(--primary); background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:flex-start; gap:12px;">
              <div style="font-size:2rem;">📦</div>
              <div>
                <div class="card-title" style="margin:0 0 4px 0;">Katalog Produk Masih Kosong</div>
                <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5; max-width:600px; margin:0;">
                  Tambahkan komoditas barang dagangan, kode barcode, satuan jual dasar, dan modal beli (COGS). Produk yang Anda daftarkan di sini akan langsung tersedia di terminal <strong>Kasir POS</strong> dan modul <strong>Inbound Gudang FIFO</strong>.
                </p>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-primary" onclick="openAddProductModal()">+ Tambah SKU Pertama</button>
              <button class="btn btn-outline" onclick="openCsvImportModal()">📥 Impor Massal CSV</button>
            </div>
          </div>
        </div>
      ` : ''}

      <div id="tour-catalog-table" class="card">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>Daftar Produk & Inventaris Aktif</span>
          ${products.length > 0 ? `<span class="badge badge-outline" style="font-size:11px;">${products.length} SKU</span>` : ''}
        </div>

        ${products.length > 0 ? `
          <div class="table-scroll-hint"><span>⇄</span> Geser ke samping untuk melihat harga & stok</div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kode SKU / Barcode</th>
                  <th>Nama Komoditas</th>
                  <th>Satuan Dasar</th>
                  <th>Harga Jual Grosir</th>
                  <th id="tour-catalog-cogs">Harga Pokok (COGS)</th>
                  <th>Total Stok</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="catalog-tbody">
                ${products.map(p => `
                  <tr>
                    <td><code>${p.sku}</code></td>
                    <td><strong>${p.name}</strong></td>
                    <td><span class="badge-tag">${p.unit}</span></td>
                    <td>${formatRupiah(p.price)}</td>
                    <td>
                      <span class="cogs-value">${formatRupiah(p.cogs)}</span>
                      <span class="cogs-privacy-tag" title="Hanya terlihat oleh Owner / Finance">🔒 Private</span>
                    </td>
                    <td><strong>${p.stock} ${p.unit}</strong></td>
                    <td>
                      <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="editProduct('${p.id}')">Edit</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div style="padding:32px 16px; text-align:center; background:var(--bg-surface); border:1px dashed var(--border-color); border-radius:10px; margin-top:10px;">
            <div style="font-size:2rem; margin-bottom:8px;">🏷️</div>
            <div style="font-weight:700; font-size:0.95rem; color:var(--text-primary); margin-bottom:4px;">Belum Ada Produk Terdaftar</div>
            <p style="font-size:0.78rem; color:var(--text-secondary); max-width:420px; margin:0 auto 14px auto;">
              Klik tombol di bawah untuk menambahkan komoditas satu per satu atau unduh template untuk impor massal ratusan produk sekaligus via CSV/Excel.
            </p>
            <div style="display:inline-flex; gap:8px;">
              <button class="btn btn-primary" onclick="openAddProductModal()">+ Tambah Produk SKU</button>
              <button class="btn btn-outline" onclick="downloadCsvTemplate()">📄 Unduh Template</button>
            </div>
          </div>
        `}
      </div>
    `;
  },
};

