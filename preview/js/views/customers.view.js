const CustomersView = {
  render(state) {
    const customers = state?.pilar3?.customers || [];
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">CRM & Limit Piutang Pelanggan</h1>
          <p class="view-subtitle">Kelola direktori toko langganan, batas kasbon (plafon kredit), dan syarat pembayaran (TOP).</p>
        </div>
        <div class="view-actions">
          <button id="tour-crm-add-btn" class="btn btn-primary" onclick="openAddCustomerModal()">+ Tambah Pelanggan</button>
        </div>
      </div>

      <!-- SETUP REMINDER IF CUSTOMERS EMPTY -->
      ${customers.length === 0 ? `
        <div class="card" style="margin-bottom:20px; border-left: 4px solid var(--primary); background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:flex-start; gap:12px;">
              <div style="font-size:2rem;">👥</div>
              <div>
                <div class="card-title" style="margin:0 0 4px 0;">Direktori Pelanggan & Mitra Belum Didaftarkan</div>
                <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5; max-width:600px; margin:0;">
                  Daftarkan pelanggan grosir, warung binaan, atau toko langganan Anda. Anda dapat mengatur batas kasbon (plafon kredit) dan jangka waktu pembayaran (TOP) agar kasir dapat memproses transaksi bertipe tempo secara aman.
                </p>
              </div>
            </div>
            <div>
              <button class="btn btn-primary" onclick="openAddCustomerModal()">+ Tambah Pelanggan Baru</button>
            </div>
          </div>
        </div>
      ` : ''}

      <div id="tour-crm-table" class="card">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>Direktori Pelanggan Grosir & Status Kasbon</span>
          ${customers.length > 0 ? `<span class="badge badge-outline" style="font-size:11px;">${customers.length} Mitra</span>` : ''}
        </div>

        ${customers.length > 0 ? `
          <div class="table-scroll-hint"><span>⇄</span> Geser ke samping untuk melihat sisa plafon & kirim PayLink</div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nama Toko / Pelanggan</th>
                  <th>Kontak WhatsApp</th>
                  <th>Tipe Bisnis</th>
                  <th id="tour-crm-limit">Plafon Kasbon</th>
                  <th>Piutang Terpakai</th>
                  <th>Sisa Limit Kasbon</th>
                  <th>TOP (Hari)</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="crm-customers-tbody">
                ${customers.map(c => {
                  const remaining = (c.creditLimit || 0) - (c.usedCredit || 0);
                  const percentUsed = c.creditLimit > 0 ? Math.min(100, Math.round(((c.usedCredit || 0) / c.creditLimit) * 100)) : 0;
                  return `
                    <tr>
                      <td><strong>${c.name}</strong> ${c.storeName ? `<div style="font-size:11px; color:var(--text-muted);">${c.storeName}</div>` : ''}</td>
                      <td>${c.phone}</td>
                      <td><span class="badge-tag">${c.type}</span></td>
                      <td>${formatRupiah(c.creditLimit)}</td>
                      <td><strong style="color:${c.usedCredit > 0 ? 'var(--accent-amber)' : 'inherit'}">${formatRupiah(c.usedCredit)}</strong></td>
                      <td>
                        <div style="font-size:0.8rem; font-weight:700; color:${remaining < 5000000 && remaining > 0 ? 'var(--accent-rose)' : 'var(--accent-green)'};">
                          ${formatRupiah(remaining)}
                        </div>
                        <div style="width:100px; height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden; margin-top:3px;">
                          <div style="width:${percentUsed}%; height:100%; background:${percentUsed > 80 ? 'var(--accent-rose)' : 'var(--primary)'};"></div>
                        </div>
                      </td>
                      <td>${c.topDays || 0} Hari</td>
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
        ` : `
          <div style="padding:32px 16px; text-align:center; background:var(--bg-surface); border:1px dashed var(--border-color); border-radius:10px; margin-top:10px;">
            <div style="font-size:2rem; margin-bottom:8px;">👥</div>
            <div style="font-weight:700; font-size:0.95rem; color:var(--text-primary); margin-bottom:4px;">Belum Ada Pelanggan Terdaftar</div>
            <p style="font-size:0.78rem; color:var(--text-secondary); max-width:420px; margin:0 auto 14px auto;">
              Daftarkan pelanggan grosir atau toko mitra Anda untuk mempermudah pencatatan kasbon dan penagihan via WhatsApp PayLink.
            </p>
            <button class="btn btn-primary" onclick="openAddCustomerModal()">
              + Tambah Pelanggan Pertama
            </button>
          </div>
        `}
      </div>
    `;
  },
};

