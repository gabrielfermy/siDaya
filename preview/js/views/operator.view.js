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
                      <button class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" 
                              onclick="OperatorController.resetTenantOnboarding('${t.subdomain}')" title="Reset status panduan kilat tenant ini">
                        🔄 Reset Panduan
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ONBOARDING MODULES MANAGEMENT & SIMULATOR -->
      <div class="card" style="margin-top:20px; border-left: 4px solid #10b981;">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <span>🎓 Manajemen Modul Panduan Kilat & Simulator (Onboarding Engine)</span>
          <span class="badge badge-success" style="font-size:11px;">MODULAR REGISTRY</span>
        </div>
        <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:14px; line-height:1.5;">
          Kelola modul tutorial interaktif, aktifkan/nonaktifkan pilar secara dinamis, edit narasi edukasi (What/Why/How), atau jalankan simulasi langsung sesuai peran.
        </p>

        <div style="display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; align-items:center; background:var(--bg-surface); padding:12px 14px; border-radius:10px; border:1px solid var(--border-subtle);">
          <span style="font-size:0.8rem; font-weight:700; color:var(--text-primary);">🎮 Simulator Peran:</span>
          <button class="btn btn-primary btn-sm" style="font-size:0.75rem;" onclick="OperatorController.simulateRoleTour('OWNER')">👑 Simulasi Owner (18 Langkah)</button>
          <button class="btn btn-outline btn-sm" style="font-size:0.75rem;" onclick="OperatorController.simulateRoleTour('KASIR')">🛒 Simulasi Kasir (6 Langkah)</button>
          <button class="btn btn-outline btn-sm" style="font-size:0.75rem;" onclick="OperatorController.simulateRoleTour('GUDANG')">📦 Simulasi Gudang (5 Langkah)</button>
          <button class="btn btn-outline btn-sm" style="font-size:0.75rem;" onclick="OperatorController.simulateRoleTour('SUPIR')">🚚 Simulasi Supir (3 Langkah)</button>
          <button class="btn btn-outline btn-sm" style="font-size:0.75rem;" onclick="OperatorController.simulateRoleTour('FINANCE')">💳 Simulasi Finance (5 Langkah)</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Modul Pilar</th>
                <th>Rute Target</th>
                <th>Tier Minimum</th>
                <th>Akses Peran / Izin</th>
                <th>Jml Langkah</th>
                <th>Status Modul</th>
                <th>Aksi Editor</th>
              </tr>
            </thead>
            <tbody id="operator-onboarding-tbody">
              ${(typeof OnboardingRegistry !== 'undefined' ? OnboardingRegistry.getAllModules() : []).map(m => `
                <tr>
                  <td><strong>${m.icon || '📌'} ${m.title}</strong> <div style="font-size:11px; color:var(--text-muted);"><code>${m.id}</code></div></td>
                  <td><code>${m.route}</code></td>
                  <td><span class="tier-badge ${m.tier === 'GROSIR_PRO' ? 'tier-grosir-pro' : 'tier-starter-free'}">${m.tier}</span></td>
                  <td>${m.isOwnerOnly ? '<span class="badge badge-warning" style="font-size:10px;">Owner Only</span>' : m.requiredPermissions.length > 0 ? `<span class="badge-tag" style="font-size:10px;">${m.requiredPermissions.join(', ')}</span>` : '<span class="badge badge-success" style="font-size:10px;">Semua Staf</span>'}</td>
                  <td><strong>${m.steps.length} Langkah</strong></td>
                  <td>
                    <span class="badge ${m.enabled !== false ? 'badge-success' : 'badge-danger'}">
                      ${m.enabled !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td style="display:flex; gap:6px;">
                    <button class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="OperatorController.openEditTourModuleModal('${m.id}')">
                      ✏️ Edit Teks
                    </button>
                    <button class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="OperatorController.toggleTourModule('${m.id}')">
                      ${m.enabled !== false ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              `).join('')}
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

      <div id="modal-edit-tour-module" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 600px; border-color: rgba(16, 185, 129, 0.4);">
          <button class="modal-close-btn" onclick="OperatorController.closeModal('modal-edit-tour-module')">✕</button>
          <div style="margin-bottom: 14px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary); margin:0;">✏️ Edit Konten Panduan Modul</h3>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:3px;" id="edit-tour-module-subtitle">
              Perbarui narasi edukasi What, Why, dan How & Where untuk modul ini.
            </p>
          </div>
          <form id="edit-tour-module-form" onsubmit="event.preventDefault(); OperatorController.handleSaveTourStep();">
            <input type="hidden" id="edit-tour-mod-id">
            <div class="form-group">
              <label class="form-label">Pilih Langkah yang Ingin Diedit</label>
              <select id="edit-tour-step-select" class="form-select" onchange="OperatorController.handleTourStepSelectChange(this.value)"></select>
            </div>
            <div class="form-group">
              <label class="form-label">📌 Apa Ini (What)</label>
              <textarea id="edit-tour-step-what" class="form-input" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">💡 Mengapa Penting & Dari Mana (Why)</label>
              <textarea id="edit-tour-step-why" class="form-input" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">🚀 Langkah & Lokasi Setup (How & Where)</label>
              <textarea id="edit-tour-step-how" class="form-input" rows="3" required></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
              <button type="button" class="btn btn-outline" onclick="OperatorController.closeModal('modal-edit-tour-module')">Batal</button>
              <button type="submit" class="btn btn-primary" style="background:linear-gradient(135deg, #10b981, #059669); border:none;">💾 Simpan Narasi</button>
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
