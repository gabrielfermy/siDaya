/**
 * CRM & Customer Credit Limit View (Pilar 03)
 */
const CustomersView = {
  render(state) {
    const customers = state?.pilar3?.customers || (typeof INITIAL_DEFAULT_STATE !== 'undefined' ? INITIAL_DEFAULT_STATE.pilar3.customers : []);
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">CRM & Limit Piutang Pelanggan</h1>
          <p class="view-subtitle">Kelola direktori toko langganan, batas kasbon (plafon kredit), dan syarat pembayaran (TOP).</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="openAddCustomerModal()">+ Tambah Pelanggan</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Direktori Pelanggan Grosir & Status Kasbon</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama Toko / Pelanggan</th>
              <th>Kontak WhatsApp</th>
              <th>Tipe Bisnis</th>
              <th>Plafon Kasbon</th>
              <th>Piutang Terpakai</th>
              <th>Sisa Limit Kasbon</th>
              <th>TOP (Hari)</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="crm-customers-tbody">
            ${customers.map(c => {
              const remaining = c.creditLimit - c.usedCredit;
              const percentUsed = Math.min(100, Math.round((c.usedCredit / c.creditLimit) * 100));
              return `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td>${c.phone}</td>
                  <td><span class="badge-tag">${c.type}</span></td>
                  <td>${formatRupiah(c.creditLimit)}</td>
                  <td><strong style="color:${c.usedCredit > 0 ? 'var(--accent-amber)' : 'inherit'}">${formatRupiah(c.usedCredit)}</strong></td>
                  <td>
                    <div style="font-size:0.8rem; font-weight:700; color:${remaining < 5000000 ? 'var(--accent-rose)' : 'var(--accent-green)'};">
                      ${formatRupiah(remaining)}
                    </div>
                    <div style="width:100px; height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden; margin-top:3px;">
                      <div style="width:${percentUsed}%; height:100%; background:${percentUsed > 80 ? 'var(--accent-rose)' : 'var(--primary)'};"></div>
                    </div>
                  </td>
                  <td>${c.topDays} Hari</td>
                  <td>
                    <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="sendCustomerPaylink('${c.id}')">
                      💬 WA PayLink
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
