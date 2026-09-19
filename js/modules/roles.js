/**
 * ==========================================================================
 * PILAR 08: MATRIKS OTORITAS & IZIN CHECKBOX (RBAC)
 * ==========================================================================
 */
function renderRoleMatrixTable(perms) {
  const container = document.getElementById('role-matrix-container');
  if (!container) return;

  const modules = [
    {
      name: '🛒 Kasir POS & Transaksi',
      caps: [
        { key: 'pos:view_catalog', label: 'Buka Katalog & Scan Barcode' },
        { key: 'pos:checkout', label: 'Proses Pembayaran POS (Tunai/QRIS)' },
        { key: 'pos:apply_discount', label: 'Berikan Diskon Khusus Grosir' },
        { key: 'pos:void_item', label: 'Void / Hapus Item dari Transaksi' }
      ]
    },
    {
      name: '💳 Shift Kasir & Tutup Buku (Z)',
      caps: [
        { key: 'shifts:operate', label: 'Buka Shift Kasir & Terima Modal Kas' },
        { key: 'shifts:close_z', label: 'Cetak Laporan Tutup Shift (Z-Report)' }
      ]
    },
    {
      name: '📦 Inventori Gudang & FIFO',
      caps: [
        { key: 'inventory:view_stock', label: 'Lihat Stok Live & Nomor Lot' },
        { key: 'inventory:inbound_receive', label: 'Catat Inbound Lot Baru' },
        { key: 'inventory:adjust', label: 'Penyesuaian Stok / Rusak (Adjustment)' },
        { key: 'inventory:opname', label: 'Eksekusi Stock Opname Fisik' }
      ]
    },
    {
      name: '🚚 Logistik & Surat Jalan',
      caps: [
        { key: 'logistics:view_sj', label: 'Akses Dokumen Surat Jalan' },
        { key: 'logistics:dispatch', label: 'Update Status Pengiriman Armada' },
        { key: 'logistics:sign_pod', label: 'Konfirmasi Serah Terima Barang (POD)' }
      ]
    },
    {
      name: '💰 Keuangan, COGS & Laba Rugi',
      caps: [
        { key: 'finance:view_cogs', label: 'Lihat Harga Modal (COGS Privacy)' },
        { key: 'finance:view_profit', label: 'Akses Laporan Laba Rugi Realtime' },
        { key: 'finance:manage_piutang', label: 'Kelola Buku Kasbon & Penagihan WA' },
        { key: 'finance:export_data', label: 'Ekspor Data Finansial Excel/CSV' }
      ]
    },
    {
      name: '⚙️ Tata Kelola Staf & Pengaturan',
      caps: [
        { key: 'system:manage_users', label: 'Undang Staf & Kelola Peran' },
        { key: 'system:manage_settings', label: 'Ubah Subdomain & Akun Bank Settlement' }
      ]
    }
  ];

  const roles = [
    { id: 'KASIR', label: '💳 Kasir Grosir' },
    { id: 'GUDANG', label: '📦 Staf Gudang' },
    { id: 'DRIVER', label: '🚚 Driver Logistik' }
  ];

  let html = `
    <table class="operator-table" style="min-width:700px;">
      <thead>
        <tr>
          <th style="width:40%;">Modul & Kunci Otoritas (Capability Key)</th>
          <th style="text-align:center; width:15%;">👑 OWNER</th>
          ${roles.map(r => `<th style="text-align:center; width:15%;">${r.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  modules.forEach(mod => {
    html += `
      <tr style="background:var(--bg-surface-elevated);">
        <td colspan="${roles.length + 2}" style="font-weight:800; color:var(--primary); font-size:0.84rem; padding:8px 12px;">
           ${mod.name}
        </td>
      </tr>
    `;
    mod.caps.forEach(cap => {
      html += `
        <tr>
          <td>
            <div style="font-weight:700; font-size:0.8rem;">${cap.label}</div>
            <code style="font-size:0.68rem; color:var(--text-muted);">${cap.key}</code>
          </td>
          <td style="text-align:center;">
            <span class="tier-badge tier-grosir-pro" title="Owner memiliki akses tak terbatas otomatis">✓ FULL</span>
          </td>
          ${roles.map(r => {
            const rolePerms = perms[r.id] || [];
            const isChecked = rolePerms.includes(cap.key) || rolePerms.includes('all');
            return `
              <td style="text-align:center;">
                <input type="checkbox" class="role-perm-check" data-role="${r.id}" data-key="${cap.key}" ${isChecked ? 'checked' : ''} style="width:16px; height:16px; accent-color:var(--primary); cursor:pointer;">
              </td>
            `;
          }).join('')}
        </tr>
      `;
    });
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

function handleSaveRoleMatrix() {
  const checks = document.querySelectorAll('.role-perm-check');
  const newPerms = {
    OWNER: ['all'],
    KASIR: [],
    GUDANG: [],
    DRIVER: []
  };

  checks.forEach(c => {
    if (c.checked) {
      const role = c.getAttribute('data-role');
      const key = c.getAttribute('data-key');
      if (newPerms[role]) {
        newPerms[role].push(key);
      }
    }
  });

  store.dispatch('ROLE_MATRIX_SAVE', newPerms);
}
