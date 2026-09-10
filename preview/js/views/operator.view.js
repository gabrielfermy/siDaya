/**
 * @fileoverview Operator Control Plane View: Fleet Management, Telemetry, and Audit Logs
 * @module View:Operator
 * @description
 * Ashvin Labs administrative portal for cross-tenant fleet metrics, tenant lifecycle,
 * break-glass diagnostics, and role-governed tenant impersonation ("Act as Tenant User").
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

const OperatorView = {
  /**
   * Renders the complete Operator Control Plane view
   * @param {Object} state - Global State Tree
   * @returns {string} HTML string
   */
  render(state) {
    const op = state?.operator || {};
    const tenants = op.tenants || [];
    const telemetry = op.telemetry || { totalGmv: 428500000, activeTenants: 12, latencyP95: 38, dbPoolPercent: 42 };
    const auditLogs = op.auditLogs || [];
    const isOpsSupport = op.currentRole === 'OPS_SUPPORT';

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">⚡ Ashvin Labs Operator Control Plane</h1>
          <p class="view-subtitle">Platform Fleet Management, Isolasi UU PDP, dan Telemetri Real-time.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-outline" onclick="openBreakglassModal()">🚨 Break-Glass Diagnostic</button>
          <button class="btn btn-primary" onclick="openInviteOperatorModal()">+ Undang Operator</button>
        </div>
      </div>

      <!-- TELEMETRY STATS -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">Platform GMV (Monthly)</span><span class="kpi-icon">🌐</span></div>
          <div class="kpi-value">${formatRupiah(telemetry.totalGmv)}</div>
          <div class="kpi-subtext positive">Across all active tenants</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">Active Tenant Fleet</span><span class="kpi-icon">🏢</span></div>
          <div class="kpi-value">${tenants.length} Toko</div>
          <div class="kpi-subtext">Isolasi DB multi-tenant aktif</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">API Latency p95</span><span class="kpi-icon">⚡</span></div>
          <div class="kpi-value">${telemetry.latencyP95} ms</div>
          <div class="kpi-subtext positive">Target: &lt; 50ms</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">Database Pool Usage</span><span class="kpi-icon">🗄️</span></div>
          <div class="kpi-value">${telemetry.dbPoolPercent}%</div>
          <div class="kpi-subtext">Optimal capacity</div>
        </div>
      </div>

      <!-- TENANT FLEET TABLE -->
      <div class="card" style="margin-top:20px;">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>🏢 Tenant Fleet Directory (UU PDP Privacy Guardrails)</span>
          <span class="badge-tag" style="background:${isOpsSupport ? 'var(--accent-amber-soft)' : 'var(--accent-green-soft)'}; color:${isOpsSupport ? 'var(--accent-amber)' : 'var(--accent-green)'};">
            ${isOpsSupport ? '🔒 PII MASKED (OPS_SUPPORT)' : '🔓 UNMASKED (SUPER_ADMIN)'}
          </span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama Usaha Tenant</th>
              <th>Subdomain URL</th>
              <th>Nama Pemilik (PII)</th>
              <th>Kontak Owner (PII)</th>
              <th>Paket Langganan</th>
              <th>Status Tenant</th>
              <th>Aksi Operator</th>
            </tr>
          </thead>
          <tbody>
            ${tenants.map(t => {
              const displayOwner = isOpsSupport ? t.ownerName.split(' ').map(w => w[0] + '***').join(' ') : t.ownerName;
              const displayPhone = isOpsSupport ? t.ownerPhone.replace(/(\+\d{4})\d+(\d{4})/, '$1****$2') : t.ownerPhone;
              return `
                <tr>
                  <td><strong>${t.businessName}</strong></td>
                  <td><code>${t.subdomain}.sidaya.biz.id</code></td>
                  <td>${displayOwner}</td>
                  <td>${displayPhone}</td>
                  <td><span class="tier-badge ${t.tier === 'GROSIR_PRO' ? 'tier-grosir-pro' : 'tier-starter-free'}">${t.tier}</span></td>
                  <td><span class="tier-badge" style="background:var(--accent-green-soft); color:var(--accent-green);">${t.status}</span></td>
                  <td style="display:flex; gap:6px;">
                    <button class="btn btn-primary btn-sm" style="background:linear-gradient(135deg, #7c3aed, #4f46e5); border:none; padding:4px 8px; font-size:0.75rem;" 
                            onclick="OperatorController.openImpersonateModal('${t.id}')" title="Masuk sebagai user tenant untuk investigasi">
                      🎭 Impersonate
                    </button>
                    <button class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="toggleTenantStatus('${t.id}')">
                      Status
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- AUDIT TRAIL LOGS -->
      <div class="card" style="margin-top:20px;">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>🛡️ Rekam Jejak Audit Operator (Immutable Forensic Logs)</span>
          <span class="badge badge-outline" style="font-size:11px;">UU PDP COMPLIANT</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu / Timestamp</th>
              <th>Operator</th>
              <th>Aksi / Event</th>
              <th>Target Tenant / User</th>
              <th>Ref. Tiket</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${auditLogs.map(log => `
              <tr>
                <td style="font-size:12px; color:var(--text-secondary);">${log.time}</td>
                <td><code>${log.operatorEmail}</code></td>
                <td><span class="badge ${log.action.includes('IMPERSONATION') ? 'badge-primary' : 'badge-warning'}">${log.action}</span></td>
                <td><strong>${log.target}</strong></td>
                <td><code>${log.ticketRef}</code></td>
                <td><span class="badge badge-success">${log.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
