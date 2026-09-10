/**
 * ==========================================================================
 * ASHVIN LABS OPERATOR CONTROL PLANE CONTROLLER
 * ==========================================================================
 */
function renderTenantFleetTable(tenants, isMasked) {
  const tbody = document.getElementById('tenant-fleet-tbody');
  if (!tbody) return;
  tbody.innerHTML = tenants.map(t => `
    <tr>
      <td><strong>${t.name}</strong></td>
      <td><code>${t.subdomain}</code></td>
      <td>${isMasked ? t.maskedOwner : t.rawOwner}</td>
      <td><span class="tier-badge ${t.tier === 'GROSIR_PRO' ? 'tier-grosir-pro' : 'tier-starter-free'}">${t.tier}</span></td>
      <td><span class="tier-badge" style="background:var(--accent-green-soft); color:var(--accent-green);">${t.status}</span></td>
    </tr>
  `).join('');
}

function renderOperatorListTable(operators) {
  const tbody = document.getElementById('operator-list-tbody');
  if (!tbody) return;
  tbody.innerHTML = operators.map(op => `
    <tr>
      <td><strong>${op.name}</strong></td>
      <td>${op.email}</td>
      <td><span class="operator-role-badge ${op.role === 'SUPER_ADMIN' ? 'role-super-admin' : (op.role === 'DEV_ENGINEER' ? 'role-dev-engineer' : 'role-ops-support')}">${op.role}</span></td>
      <td><span class="tier-badge" style="background:var(--accent-green-soft); color:var(--accent-green);">${op.status}</span></td>
    </tr>
  `).join('');
}

function renderAuditLogsList(logs) {
  const container = document.getElementById('audit-log-container');
  if (!container) return;
  container.innerHTML = `
    <div style="font-size:0.78rem; line-height:1.7;">
      ${logs.map(l => `<div>• <strong>[${l.action}]</strong> ${l.details} <span style="color:var(--text-muted); font-size:0.7rem;">(${l.time})</span></div>`).join('')}
    </div>
  `;
}

function togglePdpMasking() {
  store.dispatch('OPS_TOGGLE_PII_MASK');
}

function handleInviteOperatorSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('ops-invite-email').value;
  const fullName = document.getElementById('ops-invite-name').value;
  const phone = document.getElementById('ops-invite-phone').value;
  const role = document.getElementById('ops-invite-role').value;

  store.dispatch('OPS_INVITE_OPERATOR', { email, fullName, phone, role });
  store.dispatch('CLOSE_MODAL');
}

function switchOperatorTab(tab) {
  history.pushState(null, '', '/' + tab);
  store.dispatch('NAVIGATE', tab);
}
