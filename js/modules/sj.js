/**
 * ==========================================================================
 * PILAR 06: SURAT JALAN & LOGISTIK PENGIRIMAN
 * ==========================================================================
 */
function renderSuratJalanList(sjList) {
  const container = document.getElementById('surat-jalan-list');
  if (!container) return;

  container.innerHTML = sjList.map(sj => {
    let statusBadge = `<span class="tier-badge" style="background:var(--accent-amber-soft); color:var(--accent-amber);">SIAP DIKIRIM</span>`;
    if (sj.status === 'DALAM_PERJALANAN') {
      statusBadge = `<span class="tier-badge" style="background:var(--primary-soft); color:var(--primary);">🚚 DALAM PERJALANAN</span>`;
    } else if (sj.status === 'TERKIRIM') {
      statusBadge = `<span class="tier-badge" style="background:var(--accent-green-soft); color:var(--accent-green);">✅ TERKIRIM & DITERIMA</span>`;
    }

    return `
      <div style="background:var(--bg-surface-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:8px; margin-bottom:10px;">
          <div>
            <strong style="font-size:0.95rem;">${sj.id}</strong>
            <span style="font-size:0.72rem; color:var(--text-muted); margin-left:8px;">Faktur: ${sj.invoiceId} • Waktu: ${sj.createdAt}</span>
          </div>
          ${statusBadge}
        </div>
        <div style="font-size:0.78rem; line-height:1.6; margin-bottom:10px;">
          <div><strong>Penerima:</strong> ${sj.recipientName}</div>
          <div><strong>Tujuan:</strong> ${sj.address}</div>
          <div><strong>Muatan:</strong> ${sj.items}</div>
          <div><strong>Driver Armada:</strong> ${sj.driverName}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="font-size:0.68rem; color:var(--accent-green); font-weight:700;">
            🛡️ COGS Privacy: Harga modal disembunyikan sepenuhnya dari kurir.
          </div>
          <div style="display:flex; gap:6px;">
            ${sj.status === 'SIAP_DIKIRIM' ? `
              <button class="save-matrix-btn" onclick="store.dispatch('SJ_UPDATE_STATUS', { sjId: '${sj.id}', status: 'DALAM_PERJALANAN' })">🚚 Berangkat Antar</button>
            ` : ''}
            ${sj.status === 'DALAM_PERJALANAN' ? `
              <button class="save-matrix-btn" style="background:var(--accent-green);" onclick="store.dispatch('SJ_UPDATE_STATUS', { sjId: '${sj.id}', status: 'TERKIRIM' })">✅ Konfirmasi Serah Terima</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}
