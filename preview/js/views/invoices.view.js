/**
 * Invoices & Sales History View (Pilar 05)
 */
const InvoicesView = {
  render(state) {
    const invoices = state?.pilar5?.invoices || [];
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Faktur & Riwayat Penjualan</h1>
          <p class="view-subtitle">Daftar seluruh transaksi kasir POS, faktur tempo kasbon, dan invoice siap cetak thermal.</p>
        </div>
        <div class="view-actions">
          <button id="tour-invoices-export-btn" class="btn btn-outline" onclick="exportInvoicesCsv()" ${invoices.length === 0 ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}>📥 Export CSV</button>
          <button class="btn btn-primary" onclick="navigate('/pos')">🛒 Buka Kasir POS</button>
        </div>
      </div>

      <!-- SETUP REMINDER IF INVOICES EMPTY -->
      ${invoices.length === 0 ? `
        <div class="card" style="margin-bottom:20px; border-left: 4px solid var(--primary); background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:flex-start; gap:12px;">
              <div style="font-size:2rem;">🧾</div>
              <div>
                <div class="card-title" style="margin:0 0 4px 0;">Belum Ada Faktur Penjualan Diterbitkan</div>
                <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5; max-width:600px; margin:0;">
                  Setiap transaksi dari terminal <strong>Kasir POS</strong> atau pesanan tempo/kasbon akan otomatis tercatat dan menerbitkan nomor faktur resmi serta struk siap cetak di halaman ini.
                </p>
              </div>
            </div>
            <div>
              <button class="btn btn-primary" onclick="navigate('/pos')">🛒 Buka Terminal Kasir</button>
            </div>
          </div>
        </div>
      ` : ''}

      <div id="tour-invoices-table" class="card">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>Daftar Faktur Penjualan</span>
          ${invoices.length > 0 ? `<span class="badge badge-outline" style="font-size:11px;">${invoices.length} Faktur</span>` : ''}
        </div>
        <div class="table-scroll-hint"><span>⇄</span> Geser ke samping untuk melihat total & cetak struk</div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>No. Faktur</th>
                <th>Tgl & Waktu</th>
                <th>Pelanggan</th>
                <th>Kasir</th>
                <th>Metode Bayar</th>
                <th>Total Transaksi</th>
                <th>Status Bayar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="invoices-tbody">
              ${invoices.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align:center; padding:36px 16px; color:var(--text-secondary);">
                    <div style="font-size:2rem; margin-bottom:8px;">🧾</div>
                    <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px;">Belum Ada Faktur Diterbitkan</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); max-width:400px; margin:0 auto 12px auto;">
                      Lakukan transaksi kasir pertama Anda untuk membuat dan mencetak faktur penjualan baru.
                    </div>
                    <button class="btn btn-primary" style="font-size:0.8rem;" onclick="navigate('/pos')">🛒 Buka Terminal Kasir POS</button>
                  </td>
                </tr>
              ` : invoices.map(inv => `
                <tr>
                  <td><code>${inv.invoiceNumber}</code></td>
                  <td>${inv.date}</td>
                  <td><strong>${inv.customerName}</strong></td>
                  <td>${inv.cashierName}</td>
                  <td><span class="badge-tag">${inv.paymentMethod}</span></td>
                  <td><strong>${formatRupiah(inv.totalAmount)}</strong></td>
                  <td>
                    <span class="tier-badge ${inv.status === 'PAID' ? 'tier-grosir-pro' : 'tier-starter-free'}">${inv.status}</span>
                  </td>
                  <td>
                    <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="viewInvoiceReceipt('${inv.invoiceNumber}')">
                      🧾 Struk POS
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
