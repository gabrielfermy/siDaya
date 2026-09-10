/**
 * Invoices & Sales History View (Pilar 05)
 */
const InvoicesView = {
  render(state) {
    const invoices = state.pilar5.invoices;
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Faktur & Riwayat Penjualan</h1>
          <p class="view-subtitle">Daftar seluruh transaksi kasir POS, faktur tempo kasbon, dan invoice siap cetak thermal.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-outline" onclick="exportInvoicesCsv()">📥 Export CSV</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Daftar Faktur Penjualan</div>
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
            ${invoices.map(inv => `
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
    `;
  },
};
