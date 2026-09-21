const FifoView = {
  render(state) {
    const batches = state?.pilar2?.batches || [];
    const products = state?.pilar2?.products || [];
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Inbound Lot FIFO & Batch Tracking</h1>
          <p class="view-subtitle">Audit alokasi stok tertua masuk pertama keluar (FIFO) untuk proteksi margin dan kesegaran stok.</p>
        </div>
        <div class="view-actions">
          <button id="tour-fifo-inbound-btn" class="btn btn-primary" onclick="openReceiveInboundModal()">📥 Terima Muatan Masuk (Inbound)</button>
        </div>
      </div>

      <!-- SETUP REMINDER IF BATCHES EMPTY -->
      ${batches.length === 0 ? `
        <div class="card" style="margin-bottom:20px; border-left: 4px solid var(--primary); background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:flex-start; gap:12px;">
              <div style="font-size:2rem;">🏭</div>
              <div>
                <div class="card-title" style="margin:0 0 4px 0;">Belum Ada Lot FIFO Tercatat</div>
                <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5; max-width:600px; margin:0;">
                  ${products.length === 0 
                    ? 'Anda belum memiliki Master SKU produk. Daftarkan komoditas terlebih dahulu di Master SKU agar dapat memilih produk saat mencatat penerimaan muatan barang masuk.'
                    : 'Catat penerimaan muatan barang masuk dari supplier dengan nomor batch dan tanggal terima untuk mengaktifkan audit FIFO dan perlindungan harga modal otomatis.'
                  }
                </p>
              </div>
            </div>
            <div>
              ${products.length === 0 
                ? `<button class="btn btn-primary" onclick="navigate('/katalog')">🏷️ Buka Master SKU</button>`
                : `<button class="btn btn-primary" onclick="openReceiveInboundModal()">📥 Terima Muatan Masuk</button>`
              }
            </div>
          </div>
        </div>
      ` : ''}

      <!-- INTERACTIVE FIFO ALLOCATION SIMULATOR -->
      <div id="tour-fifo-simulator" class="card" style="margin-bottom:16px; background: linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);">
        <div class="card-title">🧪 Simulator Alokasi Otomatis FIFO</div>
        <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px;">
          Uji coba mesin alokasi pesanan secara otomatis mengambil dari lot terlama (receivedAt ASC).
        </p>
        <div class="fifo-sim-controls">
          <div class="form-group fifo-sim-field-product">
            <label class="form-label" style="font-size:0.75rem;">Produk</label>
            <select id="fifo-sim-product" class="form-select">
              ${products.length > 0 
                ? products.map(p => `<option value="${p.sku}">${p.name} (${p.sku})</option>`).join('')
                : '<option value="" disabled selected>-- Belum ada produk --</option>'
              }
            </select>
          </div>
          <div class="form-group fifo-sim-field-qty">
            <label class="form-label" style="font-size:0.75rem;">Qty Pesanan</label>
            <input id="fifo-sim-qty" type="number" class="form-input" value="65" min="1">
          </div>
          <button class="btn btn-primary fifo-sim-btn" onclick="runFifoSimulation()">⚡ Jalankan Simulasi</button>
        </div>
        <div id="fifo-simulation-result" style="margin-top:12px;"></div>
      </div>

      <!-- BATCH TIMELINE TABLE -->
      <div id="tour-fifo-table" class="card">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>📦 Daftar Batch & Lot Inventaris Aktif</span>
          ${batches.length > 0 ? `<span class="badge badge-outline" style="font-size:11px;">${batches.length} Batch</span>` : ''}
        </div>

        ${batches.length > 0 ? `
          <div class="table-scroll-hint"><span>⇄</span> Geser ke samping untuk melihat detail lot & HPP</div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nomor Lot Batch</th>
                  <th>Komoditas</th>
                  <th>Lokasi Bin / Rak</th>
                  <th>Tgl Masuk (FIFO Rank)</th>
                  <th>HPP Masuk / Unit</th>
                  <th>Sisa Stok / Awal</th>
                  <th>Status Lot</th>
                </tr>
              </thead>
              <tbody id="fifo-batches-tbody">
                ${batches.map(b => `
                  <tr>
                    <td><code>${b.lotNumber}</code></td>
                    <td><strong>${b.productName}</strong></td>
                    <td><span class="badge-tag">${b.binLabel}</span></td>
                    <td>${b.receivedDate}</td>
                    <td>${formatRupiah(b.cogsUnit)}</td>
                    <td><strong>${b.remainingQty} / ${b.initialQty} Unit</strong></td>
                    <td>
                      <span class="tier-badge ${b.status === 'ACTIVE' ? 'tier-grosir-pro' : 'tier-starter-free'}">${b.status}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div style="padding:32px 16px; text-align:center; background:var(--bg-surface); border:1px dashed var(--border-color); border-radius:10px; margin-top:10px;">
            <div style="font-size:2rem; margin-bottom:8px;">📦</div>
            <div style="font-weight:700; font-size:0.95rem; color:var(--text-primary); margin-bottom:4px;">Belum Ada Lot Batch Tercatat</div>
            <p style="font-size:0.78rem; color:var(--text-secondary); max-width:420px; margin:0 auto 14px auto;">
              Catat penerimaan barang masuk pertama Anda untuk mulai melacak umur simpan dan mengamankan HPP grosir secara otomatis.
            </p>
            <button class="btn btn-primary" onclick="openReceiveInboundModal()">
              📥 Terima Muatan Masuk Pertama
            </button>
          </div>
        `}
      </div>
    `;
  },
};

