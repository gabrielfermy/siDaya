/**
 * Inbound Lot FIFO View (Pilar 02)
 */
const FifoView = {
  render(state) {
    const batches = state?.pilar2?.batches || (typeof INITIAL_DEFAULT_STATE !== 'undefined' ? INITIAL_DEFAULT_STATE.pilar2.batches : []);
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Inbound Lot FIFO & Batch Tracking</h1>
          <p class="view-subtitle">Audit alokasi stok tertua masuk pertama keluar (FIFO) untuk proteksi margin dan kesegaran stok.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="openReceiveInboundModal()">📥 Terima Muatan Masuk (Inbound)</button>
        </div>
      </div>

      <!-- INTERACTIVE FIFO ALLOCATION SIMULATOR -->
      <div class="card" style="margin-bottom:16px; background: linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);">
        <div class="card-title">🧪 Simulator Alokasi Otomatis FIFO</div>
        <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px;">
          Uji coba mesin alokasi pesanan secara otomatis mengambil dari lot terlama (receivedAt ASC).
        </p>
        <div class="fifo-sim-controls">
          <div class="form-group fifo-sim-field-product">
            <label class="form-label" style="font-size:0.75rem;">Produk</label>
            <select id="fifo-sim-product" class="form-select">
              <option value="a0000002-0000-0000-0000-000000000001">Beras Rojolele Super 50kg</option>
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
      <div class="card">
        <div class="card-title">📦 Daftar Batch & Lot Inventaris Aktif</div>
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
                  <td><strong>${b.remainingQty} / ${b.initialQty} Karung</strong></td>
                  <td>
                    <span class="tier-badge ${b.status === 'ACTIVE' ? 'tier-grosir-pro' : 'tier-starter-free'}">${b.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
};
