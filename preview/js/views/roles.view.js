/**
 * RBAC Capability Matrix View (Pilar 08)
 */
const RolesView = {
  render(state) {
    const roles = ['OWNER', 'MANAGER', 'CASHIER', 'WAREHOUSE', 'DRIVER'];
    const roleLabels = {
      OWNER: '👑 Owner / Direktur',
      MANAGER: '👔 Manajer Toko',
      CASHIER: '💳 Kasir Grosir',
      WAREHOUSE: '📦 Kepala Gudang',
      DRIVER: '🚚 Supir Logistik',
    };

    const keys = [
      { key: 'catalog:view_cogs', label: 'Lihat Harga Pokok Penjualan (COGS)', desc: 'Menampilkan modal harga asli beli dari supplier (Privasi Sensitif)' },
      { key: 'catalog:manage_prices', label: 'Ubah Harga Jual & Diskon Grosir', desc: 'Menetapkan harga bertingkat grosir per SKU' },
      { key: 'pos:checkout', label: 'Eksekusi Checkout Kasir POS', desc: 'Membuka transaksi penjualan dan menerima kasir' },
      { key: 'pos:void_item', label: 'Batalkan / Void Transaksi POS', desc: 'Menghapus barang dari transaksi yang sudah dicetak' },
      { key: 'pos:open_cash_drawer', label: 'Buka Laci Kasir Manual (No-Sale)', desc: 'Memicu sinyal pembuka laci kasir RJ11 tanpa transaksi' },
      { key: 'inventory:inbound', label: 'Terima Muatan Masuk Gudang (Inbound)', desc: 'Mencatat lot masuk dan mencetak label pallet' },
      { key: 'inventory:stock_opname', label: 'Penyesuaian & Opname Stok', desc: 'Mengubah kuantitas fisik inventaris gudang' },
      { key: 'customers:manage_credit_limit', label: 'Atur Plafon Kasbon Pelanggan', desc: 'Menetapkan batas piutang dan syarat tempo (TOP)' },
      { key: 'logistics:issue_surat_jalan', label: 'Terbitkan Surat Jalan (SJ)', desc: 'Menerbitkan manifest kirim logistik' },
      { key: 'logistics:sign_pod', label: 'Tanda Tangani Bukti Serah Terima (POD)', desc: 'Mengambil tanda tangan digital supir & toko penerima' },
      { key: 'finance:reports', label: 'Akses Laporan Laba Rugi (P&L)', desc: 'Melihat kalkulasi laba kotor & omset global' },
      { key: 'settings:manage', label: 'Konfigurasi Toko & Hardware', desc: 'Mengubah identitas toko dan printer ESC/POS' },
    ];

    const matrix = state.pilar8.rbacMatrix;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Matriks Hak Akses Granular (RBAC)</h1>
          <p class="view-subtitle">18 Capability Keys granular untuk isolasi keamanan data keuangan (COGS & P&L) antar peran kerja.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="saveRbacMatrix()">💾 Simpan Perubahan Matriks</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Matriks Izin 18 Capability Keys</div>
        <table class="data-table rbac-matrix-table">
          <thead>
            <tr>
              <th style="min-width:260px;">Capability Key / Deskripsi Fitur</th>
              ${roles.map(r => `
                <th style="text-align:center;">${roleLabels[r]}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${keys.map(item => `
              <tr>
                <td>
                  <strong>${item.label}</strong>
                  <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                    <code>${item.key}</code> - ${item.desc}
                  </div>
                </td>
                ${roles.map(r => {
                  const isChecked = matrix[r] && matrix[r].includes(item.key);
                  const isOwner = r === 'OWNER';
                  return `
                    <td style="text-align:center;">
                      <input type="checkbox" ${isChecked ? 'checked' : ''} ${isOwner ? 'disabled' : ''} onchange="toggleRbacCapability('${r}', '${item.key}', this.checked)">
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
