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
        <div class="table-scroll-hint"><span>⇄</span> Geser ke samping untuk melihat detail tenant & aksi</div>
        <div class="table-responsive">
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
                    <td><code>${t.subdomain}.${(typeof getBaseDomain === 'function') ? getBaseDomain() : 'sidaya.biz.id'}</code></td>
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
      </div>

      <!-- PLATFORM OPERATOR TEAM DIRECTORY -->
      <div class="card" style="margin-top:20px;">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>⚡ Direktori Tim Operator Platform (Ashvin Labs)</span>
          <span class="badge badge-primary" style="font-size:11px;">CONTROL PLANE TEAM</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Email Korporat</th>
                <th>Peran Platform</th>
                <th>Status</th>
                <th>Bergabung</th>
                <th>Aksi Operator</th>
              </tr>
            </thead>
            <tbody>
              ${(op.operators || []).map(o => `
                <tr>
                  <td><strong>${o.name}</strong></td>
                  <td><code>${o.email}</code></td>
                  <td><span class="badge ${o.role === 'SUPER_ADMIN' ? 'badge-primary' : o.role === 'DEV_ENGINEER' ? 'badge-info' : 'badge-success'}">${o.role}</span></td>
                  <td><span class="badge ${o.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}">${o.status}</span></td>
                  <td style="font-size:12px; color:var(--text-secondary);">${o.joinedAt || '2026-01-01'}</td>
                  <td style="display:flex; gap:5px;">
                    <button class="btn btn-outline btn-sm" onclick="OperatorController.openEditOperatorModal('${o.email}')">✏️ Edit</button>
                    <button class="btn btn-outline btn-sm" onclick="OperatorController.sendPasswordReset('${o.email}')">✉️ Sandi</button>
                    ${!o.isPrimary ? `
                      <button class="btn btn-outline btn-sm" onclick="OperatorController.toggleOperatorStatus('${o.email}')">${o.status === 'ACTIVE' ? '⛔ Suspend' : '✅ Aktifkan'}</button>
                      <button class="btn btn-outline btn-sm" style="color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="OperatorController.openDeleteOperatorModal('${o.email}')">🗑️</button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- AUDIT TRAIL LOGS -->
      <div class="card" style="margin-top:20px;">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>🛡️ Rekam Jejak Audit Operator (Discreet Forensic Logs)</span>
          <span class="badge badge-outline" style="font-size:11px;">UU PDP COMPLIANT • NO BUSINESS LEAKS</span>
        </div>
        <div class="table-scroll-hint"><span>⇄</span> Geser ke samping untuk melihat log forensic lengkap</div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Operator</th>
                <th>Aksi Platform</th>
                <th>Target Entity</th>
                <th>Ref. Tiket</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${auditLogs.map(log => `
                <tr>
                  <td style="font-size:12px; color:var(--text-secondary);">${log.time}</td>
                  <td><code>${log.operatorEmail}</code></td>
                  <td><span class="badge ${log.action.includes('REVOKED') || log.action.includes('OFFBOARDED') ? 'badge-danger' : log.action.includes('IMPERSONATION') ? 'badge-primary' : 'badge-warning'}">${log.action}</span></td>
                  <td><strong>${log.target}</strong></td>
                  <td><code>${log.ticketRef}</code></td>
                  <td><span class="badge badge-success">${log.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- HTTP ERROR SIMULATOR (OPERATOR EXCLUSIVE) -->
      <div class="card" style="margin-top:20px; border-left: 4px solid #7c3aed;">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <span>🌐 HTTP Response Status Simulator (Platform Resilience & Fallbacks)</span>
          <span class="badge" style="background:rgba(124, 58, 237, 0.15); color:#7c3aed; font-size:11px; font-weight:700;">OPERATOR EXCLUSIVE</span>
        </div>
        <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:14px; line-height:1.5;">
          Uji simulasi respon status kode HTTP standar RFC 9110 dan fallback UI error recovery platform secara real-time:
        </p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <button class="btn btn-outline btn-sm" onclick="navigate('/400')" style="font-weight:700;">400 Bad Request</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('/401')" style="font-weight:700;">401 Unauthorized</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('/403')" style="font-weight:700;">403 Forbidden</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('/404')" style="font-weight:700;">404 Not Found</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('/429')" style="font-weight:700;">429 Rate Limit</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('/500')" style="font-weight:700;">500 Server Error</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('/503')" style="font-weight:700;">503 Service Unavailable</button>
        </div>
      </div>

      <!-- MODALS: OPERATOR MANAGEMENT -->
      <div id="modal-invite-operator" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 480px; border-color: rgba(124, 58, 237, 0.4);">
          <button class="modal-close-btn" onclick="OperatorController.closeModal('modal-invite-operator')">✕</button>
          <div style="margin-bottom: 14px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary); margin:0;">+ Undang Operator Platform</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;">
              Kirimkan undangan bergabung ke tim platform Ashvin Labs.
            </p>
          </div>
          <form id="invite-operator-form" onsubmit="event.preventDefault(); OperatorController.handleInviteSubmit();">
            <div class="form-group">
              <label class="form-label">Nama Lengkap Operator</label>
              <input id="inv-op-name" type="text" class="form-input" required placeholder="contoh: Rahmat Hidayat">
            </div>
            <div class="form-group">
              <label class="form-label">Email Korporat (@ashvinlabs.com)</label>
              <input id="inv-op-email" type="email" class="form-input" required placeholder="rahmat@ashvinlabs.com">
            </div>
            <div class="form-group">
              <label class="form-label">Peran Keamanan Platform</label>
              <select id="inv-op-role" class="form-select">
                <option value="OPS_SUPPORT">OPS_SUPPORT (Customer Support & PII Masked)</option>
                <option value="DEV_ENGINEER">DEV_ENGINEER (Developer & Diagnostic)</option>
                <option value="AUDIT_LEGAL">AUDIT_LEGAL (Compliance & Forensic)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px; background:linear-gradient(135deg, #7C3AED, #4F46E5); border:none;">
              🚀 Kirim Undangan Operator
            </button>
          </form>
        </div>
      </div>

      <div id="modal-edit-operator" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 480px; border-color: rgba(124, 58, 237, 0.4);">
          <button class="modal-close-btn" onclick="OperatorController.closeModal('modal-edit-operator')">✕</button>
          <div style="margin-bottom: 14px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary); margin:0;">✏️ Edit Peran Operator</h3>
          </div>
          <form id="edit-operator-form" onsubmit="event.preventDefault(); OperatorController.handleEditSubmit();">
            <input type="hidden" id="edit-op-email">
            <div class="form-group">
              <label class="form-label">Nama Operator</label>
              <input id="edit-op-name" type="text" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Peran Platform</label>
              <select id="edit-op-role" class="form-select">
                <option value="OPS_SUPPORT">OPS_SUPPORT</option>
                <option value="DEV_ENGINEER">DEV_ENGINEER</option>
                <option value="AUDIT_LEGAL">AUDIT_LEGAL</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px; background:linear-gradient(135deg, #7C3AED, #4F46E5); border:none;">
              💾 Simpan Perubahan
            </button>
          </form>
        </div>
      </div>

      <div id="modal-delete-operator" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 440px; border: 2px solid #ef4444;">
          <button class="modal-close-btn" onclick="OperatorController.closeModal('modal-delete-operator')">✕</button>
          <div style="margin-bottom: 12px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:#ef4444; margin:0;">🚨 Cabut Akses Operator</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
              Pencabutan akun operator platform dicatat secara permanen di audit trail.
            </p>
          </div>
          <form id="delete-operator-form" onsubmit="event.preventDefault(); OperatorController.handleDeleteSubmit();">
            <input type="hidden" id="del-op-email">
            <div class="form-group">
              <label class="form-label">Target Operator</label>
              <input id="del-op-display" type="text" class="form-input" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Tiket Support / Ref*</label>
              <input id="del-op-ticket" type="text" class="form-input" required value="#SEC-REVOKE-01">
            </div>
            <div class="form-group">
              <label class="form-label">Alasan Pencabutan Akses*</label>
              <textarea id="del-op-reason" class="form-input" rows="2" required placeholder="Contoh: Rotasi anggota tim platform">Rotasi tim platform engineering</textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
              <button type="button" class="btn btn-outline" onclick="OperatorController.closeModal('modal-delete-operator')">Batal</button>
              <button type="submit" class="btn btn-primary" style="background:#ef4444; border-color:#ef4444;">Ya, Cabut Akses</button>
            </div>
          </form>
        </div>
      </div>

      <!-- OPERATOR FLOATING DOCK -->
      <div class="error-tester-dock">
        <span style="font-size:0.75rem; font-weight:800; color:#7c3aed;">⚡ Ops Simulator:</span>
        <button class="error-pill-btn" onclick="navigate('/400')">400</button>
        <button class="error-pill-btn" onclick="navigate('/401')">401</button>
        <button class="error-pill-btn" onclick="navigate('/403')">403</button>
        <button class="error-pill-btn" onclick="navigate('/404')">404</button>
        <button class="error-pill-btn" onclick="navigate('/429')">429</button>
        <button class="error-pill-btn" onclick="navigate('/500')">500</button>
        <button class="error-pill-btn" onclick="navigate('/503')">503</button>
      </div>
    `;
  },
};
