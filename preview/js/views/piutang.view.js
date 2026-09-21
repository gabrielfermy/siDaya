/**
 * Buku Piutang & WA PayLink View (Pilar 07)
 */
const PiutangView = {
  render(state) {
    const s = state?.pilar7 || {};
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
          <button id="tour-piutang-export-btn" class="btn btn-outline" onclick="exportPiutangCsv()" ${debts.length === 0 ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}>📥 Export Rekap Kasbon</button>
        </div>
      </div>

      <!-- SETUP REMINDER IF NO DEBTS -->
      ${debts.length === 0 ? `
        <div class="card" style="margin-bottom:20px; border-left: 4px solid var(--primary); background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:flex-start; gap:12px;">
              <div style="font-size:2rem;">💬</div>
              <div>
                <div class="card-title" style="margin:0 0 4px 0;">Buku Piutang Toko Bersih (Nihil)</div>
                <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5; max-width:600px; margin:0;">
                  Saat pelanggan grosir melakukan transaksi dengan metode pembayaran <strong>Kasbon / Tempo</strong>, tagihan jatuh tempo dan tombol penagihan <strong>WhatsApp PayLink</strong> otomatis terbit di halaman ini. Pastikan Anda telah mengatur plafon kredit pelanggan di modul CRM.
                </p>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-outline" onclick="navigate('/customers')">👥 Atur Plafon CRM</button>
              <button class="btn btn-primary" onclick="navigate('/pos')">🛒 Kasir POS</button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- AGING BUCKETS SUMMARY -->
      <div id="tour-piutang-aging" class="kpi-grid" style="grid-template-columns: repeat(4, 1fr);">
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
          <div class="kpi-value ${aging15to30 > 0 ? 'warning' : ''}">${formatRupiah(aging15to30)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">> 30 Hari (Macet)</span><span class="kpi-icon">🔴</span></div>
          <div class="kpi-value ${agingOver30 > 0 ? 'danger' : ''}">${formatRupiah(agingOver30)}</div>
        </div>
      </div>

      <!-- OUTSTANDING INVOICES LIST -->
      <div class="card" style="margin-top:16px;">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>Daftar Tagihan Kasbon Belum Lunas</span>
          ${debts.length > 0 ? `<span class="badge badge-warning" style="font-size:11px;">${debts.length} Tagihan</span>` : '<span class="badge badge-success" style="font-size:11px;">Nihil Piutang</span>'}
        </div>
        <div class="table-scroll-hint"><span>⇄</span> Geser ke samping untuk melihat sisa tagihan & tombol WA</div>
        <div class="table-responsive">
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
              ${debts.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center; padding:36px 16px; color:var(--text-secondary);">
                    <div style="font-size:2rem; margin-bottom:8px;">✅</div>
                    <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px;">Tidak Ada Tagihan Kasbon Tertunggak</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); max-width:420px; margin:0 auto 12px auto;">
                      Seluruh tagihan tempo telah diselesaikan atau belum ada transaksi kasbon yang diterbitkan.
                    </div>
                    <div style="display:flex; justify-content:center; gap:8px;">
                      <button class="btn btn-outline" style="font-size:0.8rem;" onclick="navigate('/customers')">👥 Cek Plafon Kredit CRM</button>
                      <button class="btn btn-primary" style="font-size:0.8rem;" onclick="navigate('/pos')">🛒 Transaksi Kasir POS</button>
                    </div>
                  </td>
                </tr>
              ` : debts.map(d => `
                <tr>
                  <td><code>${d.invoiceNumber}</code></td>
                  <td><strong>${d.customerName}</strong></td>
                  <td>${d.phone}</td>
                  <td>${d.dueDate}</td>
                  <td><strong style="color:var(--accent-rose);">${formatRupiah(d.amount)}</strong></td>
                  <td><span class="tier-badge ${d.daysOverdue > 0 ? 'tier-starter-free' : 'tier-grosir-pro'}">${d.daysOverdue > 0 ? `Lewat ${d.daysOverdue} Hari` : 'Belum Jatuh Tempo'}</span></td>
                  <td>
                    <button id="tour-piutang-wa-btn" class="btn btn-primary" style="padding:4px 10px; font-size:0.75rem; background: #25D366; border-color:#25D366; color:#ffffff;" onclick="dispatchWhatsAppPaylink('${d.invoiceNumber}', '${d.customerName}', '${d.phone}', ${d.amount})">
                      💬 Kirim WA PayLink
                    </button>
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
