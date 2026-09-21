/**
 * Surat Jalan & Logistics View (Pilar 06)
 */
const SjView = {
  render(state) {
    const sjList = state?.pilar6?.deliveryOrders || [];
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Surat Jalan (POD) & Logistik Armada</h1>
          <p class="view-subtitle">Penerbitan manifest jalan bebas harga finansial dengan tanda tangan elektronik supir & penerima.</p>
        </div>
        <div class="view-actions">
          <button id="tour-sj-create-btn" class="btn btn-primary" onclick="openCreateSjModal()">+ Buat Surat Jalan Baru</button>
        </div>
      </div>

      <!-- SETUP REMINDER IF SJ EMPTY -->
      ${sjList.length === 0 ? `
        <div class="card" style="margin-bottom:20px; border-left: 4px solid var(--primary); background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:flex-start; gap:12px;">
              <div style="font-size:2rem;">🚚</div>
              <div>
                <div class="card-title" style="margin:0 0 4px 0;">Belum Ada Surat Jalan (POD) Diterbitkan</div>
                <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5; max-width:600px; margin:0;">
                  Terbitkan surat jalan pengiriman barang bebas rincian finansial modal. Supir dan toko langganan dapat membubuhkan tanda tangan elektronik (Proof of Delivery) secara langsung di perangkat HP.
                </p>
              </div>
            </div>
            <div>
              <button class="btn btn-primary" onclick="openCreateSjModal()">+ Buat Surat Jalan Pertama</button>
            </div>
          </div>
        </div>
      ` : ''}

      <div id="tour-sj-table" class="card">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>Manifest Pengiriman Barang & Status Serah Terima</span>
          ${sjList.length > 0 ? `<span class="badge badge-outline" style="font-size:11px;">${sjList.length} Pengiriman</span>` : ''}
        </div>
        <div class="table-scroll-hint"><span>⇄</span> Geser ke samping untuk melihat muatan & TTD POD</div>
        <div class="table-responsive">
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
              ${sjList.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center; padding:36px 16px; color:var(--text-secondary);">
                    <div style="font-size:2rem; margin-bottom:8px;">🚚</div>
                    <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px;">Belum Ada Surat Jalan</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); max-width:400px; margin:0 auto 12px auto;">
                      Buat manifest pengiriman barang pertama untuk supir armada logistik Anda.
                    </div>
                    <button class="btn btn-primary" style="font-size:0.8rem;" onclick="openCreateSjModal()">+ Buat Surat Jalan Baru</button>
                  </td>
                </tr>
              ` : sjList.map(sj => `
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
                      <button id="tour-sj-sign-btn" class="btn btn-primary" style="padding:4px 8px; font-size:0.75rem;" onclick="openPodSignModal('${sj.id}')">
                        ✍️ Tanda Tangani POD
                      </button>
                    `}
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
