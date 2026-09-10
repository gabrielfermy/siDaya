/**
 * Buku Piutang & WA PayLink View (Pilar 07)
 */
const PiutangView = {
  render(state) {
    const s = state?.pilar7 || (typeof INITIAL_DEFAULT_STATE !== 'undefined' ? INITIAL_DEFAULT_STATE.pilar7 : {});
    const aging0to7 = s.aging0to7 || 0;
    const aging8to14 = s.aging8to14 || 0;
    const aging15to30 = s.aging15to30 || 0;
    const agingOver30 = s.agingOver30 || 0;
    const debts = s.debts || [];
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Buku Piutang & Penagihan WhatsApp PayLink</h1>
          <p class="view-subtitle">Monitor penuaan tagihan (aging piutang) dan kirimkan tautan pembayaran otomatis dengan QRIS & Virtual Account.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-outline" onclick="exportPiutangCsv()">📥 Export Rekap Kasbon</button>
        </div>
      </div>

      <!-- AGING BUCKETS SUMMARY -->
      <div class="kpi-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">0 - 7 Hari (Lancar)</span><span class="kpi-icon">🟢</span></div>
          <div class="kpi-value">${formatRupiah(aging0to7)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">8 - 14 Hari (Jatuh Tempo)</span><span class="kpi-icon">🟡</span></div>
          <div class="kpi-value">${formatRupiah(aging8to14)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">15 - 30 Hari (Menunggak)</span><span class="kpi-icon">🟠</span></div>
          <div class="kpi-value warning">${formatRupiah(aging15to30)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">> 30 Hari (Macet)</span><span class="kpi-icon">🔴</span></div>
          <div class="kpi-value danger">${formatRupiah(agingOver30)}</div>
        </div>
      </div>

      <!-- OUTSTANDING INVOICES LIST -->
      <div class="card" style="margin-top:16px;">
        <div class="card-title">Daftar Tagihan Kasbon Belum Lunas</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>No. Faktur</th>
              <th>Nama Toko Pembeli</th>
              <th>Kontak WhatsApp</th>
              <th>Tgl Jatuh Tempo</th>
              <th>Sisa Tagihan</th>
              <th>Status Penuaan</th>
              <th>Aksi Tagih WhatsApp</th>
            </tr>
          </thead>
          <tbody id="piutang-tbody">
            ${debts.map(d => `
              <tr>
                <td><code>${d.invoiceNumber}</code></td>
                <td><strong>${d.customerName}</strong></td>
                <td>${d.phone}</td>
                <td>${d.dueDate}</td>
                <td><strong style="color:var(--accent-rose);">${formatRupiah(d.amount)}</strong></td>
                <td><span class="tier-badge ${d.daysOverdue > 0 ? 'tier-starter-free' : 'tier-grosir-pro'}">${d.daysOverdue > 0 ? `Lewat ${d.daysOverdue} Hari` : 'Belum Jatuh Tempo'}</span></td>
                <td>
                  <button class="btn btn-primary" style="padding:4px 10px; font-size:0.75rem; background: #25D366; border-color:#25D366; color:#ffffff;" onclick="dispatchWhatsAppPaylink('${d.invoiceNumber}', '${d.customerName}', '${d.phone}', ${d.amount})">
                    💬 Kirim WA PayLink
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
