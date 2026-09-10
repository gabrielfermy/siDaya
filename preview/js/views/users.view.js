/**
 * Staff Directory & PIN Security View (Pilar 08)
 */
const UsersView = {
  render(state) {
    const staffList = state.pilar8.staff;
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Direktori Staf & Keamanan PIN POS</h1>
          <p class="view-subtitle">Kelola akun kasir, supir logistik, dan otentikasi cepat PIN kasir terlindungi HMAC.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="openInviteStaffModal()">+ Undang Staf Baru</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Daftar Anggota Staf & Status PIN Kasir</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama Lengkap Staf</th>
              <th>Email & No. WhatsApp</th>
              <th>Peran Utama</th>
              <th>Status Akun</th>
              <th>Status PIN Cepat (HMAC)</th>
              <th>Aksi Keamanan</th>
            </tr>
          </thead>
          <tbody id="tenant-staff-tbody">
            ${staffList.map(s => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.email} (${s.phone})</td>
                <td><span class="tier-badge ${s.role.includes('Owner') ? 'tier-grosir-pro' : 'tier-starter-free'}">${s.role}</span></td>
                <td><span class="tier-badge" style="background:var(--accent-green-soft); color:var(--accent-green);">${s.status}</span></td>
                <td>
                  <span class="tier-badge" style="background:${s.pinConfigured ? 'var(--accent-green-soft)' : 'var(--accent-amber-soft)'}; color:${s.pinConfigured ? 'var(--accent-green)' : 'var(--accent-amber)'};">
                    ${s.pinConfigured ? '🔒 PIN AKTIF (HMAC)' : '⚠️ BELUM ADA PIN'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary" style="padding:4px 8px; font-size:0.75rem;" onclick="handleResetStaffPin('${s.email}')">
                    🔑 Reset PIN
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
