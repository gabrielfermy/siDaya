/**
 * ==========================================================================
 * PILAR 08: DAFTAR STAF & HAK AKSES PIN
 * ==========================================================================
 */
function renderStaffTable(staffList) {
  const tbody = document.getElementById('tenant-staff-tbody');
  if (!tbody) return;
  tbody.innerHTML = staffList.map(s => `
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
        <button class="save-matrix-btn" style="padding:4px 8px; font-size:0.7rem; background:var(--primary);" onclick="handleResetStaffPin('${s.email}')">
          🔑 Reset PIN
        </button>
      </td>
    </tr>
  `).join('');
}

function handleInviteStaffSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('staff-invite-name').value;
  const email = document.getElementById('staff-invite-email').value;
  const phone = document.getElementById('staff-invite-phone').value;
  const role = document.getElementById('staff-invite-role').value;

  store.dispatch('STAFF_INVITE', { name, email, phone, role });
  store.dispatch('CLOSE_MODAL');
}

function handleResetStaffPin(email) {
  store.dispatch('STAFF_RESET_PIN', { email });
}
