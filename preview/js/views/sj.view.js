/**
 * Surat Jalan & Logistics View (Pilar 06)
 */
const SjView = {
  render(state) {
    const sjList = state?.pilar6?.deliveryOrders || (typeof INITIAL_DEFAULT_STATE !== 'undefined' ? INITIAL_DEFAULT_STATE.pilar6.deliveryOrders : []);
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Surat Jalan (POD) & Logistik Armada</h1>
          <p class="view-subtitle">Penerbitan manifest jalan bebas harga finansial dengan tanda tangan elektronik supir & penerima.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="openCreateSjModal()">+ Buat Surat Jalan Baru</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Manifest Pengiriman Barang & Status Serah Terima</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>No. Surat Jalan</th>
              <th>No. Referensi Pesanan</th>
              <th>Supir & Plat Kendaraan</th>
              <th>Tujuan Toko</th>
              <th>Muatan Komoditas</th>
              <th>Status POD</th>
              <th>Aksi Serah Terima</th>
            </tr>
          </thead>
          <tbody id="sj-tbody">
            ${sjList.map(sj => `
              <tr>
                <td><code>${sj.sjNumber}</code></td>
                <td>${sj.orderNumber}</td>
                <td><strong>${sj.driverName}</strong> (${sj.plateNumber})</td>
                <td>${sj.destination}</td>
                <td><span class="badge-tag">${sj.itemSummary}</span></td>
                <td>
                  <span class="tier-badge ${sj.status === 'DELIVERED' ? 'tier-grosir-pro' : 'tier-starter-free'}">
                    ${sj.status === 'DELIVERED' ? '✅ DITERIMA (TTD)' : '🚚 DALAM PENGIRIMAN'}
                  </span>
                </td>
                <td>
                  ${sj.status === 'DELIVERED' ? `
                    <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="viewPodSignature('${sj.sjNumber}')">
                      Lihat Bukti TTD
                    </button>
                  ` : `
                    <button class="btn btn-primary" style="padding:4px 8px; font-size:0.75rem;" onclick="openPodSignModal('${sj.id}')">
                      ✍️ Tanda Tangani POD
                    </button>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
