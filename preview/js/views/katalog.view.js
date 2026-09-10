/**
 * Master SKU & Catalog View (Pilar 02)
 */
const KatalogView = {
  render(state) {
    const products = state.pilar2.products;
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Master SKU & Harga Grosir</h1>
          <p class="view-subtitle">Kelola kode barcode SKU, satuan bertingkat (Karung/Bal/Pcs), dan proteksi HPP (COGS).</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="openAddProductModal()">+ Tambah Produk SKU</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Daftar Produk & Inventaris Aktif</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode SKU / Barcode</th>
              <th>Nama Komoditas</th>
              <th>Satuan Dasar</th>
              <th>Harga Jual Grosir</th>
              <th>Harga Pokok (COGS)</th>
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
    `;
  },
};
