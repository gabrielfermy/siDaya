/**
 * Dynamic Coming Soon & Roadmap Feature View
 */
const RoadmapView = {
  render(spec) {
    if (!spec) {
      return `
        <div class="card" style="max-width:540px; margin:40px auto; text-align:center; padding:32px 24px;">
          <div style="font-size:2.5rem; margin-bottom:12px;">🗺️</div>
          <h2 style="font-size:1.2rem; font-weight:800; color:var(--text-primary); margin-bottom:8px;">Modul Roadmap</h2>
          <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:20px;">Spesifikasi modul roadmap belum terdefinisi.</p>
          <button class="btn btn-primary" onclick="navigate('/dashboard')">← Kembali ke Dashboard</button>
        </div>
      `;
    }

    const features = spec.features || [];
    const phaseLabel = spec.phase || 'PHASE 2 ROADMAP • Q4 2026';

    return `
      <div class="coming-soon-hero">
        <div class="coming-soon-badge">
          <span>🚀</span>
          <span>Rencana Peluncuran: <strong>${phaseLabel}</strong></span>
        </div>
        <h1 class="coming-soon-title">${spec.icon || '🚀'} ${spec.title || 'Modul Roadmap'}</h1>
        <p class="coming-soon-desc">${spec.desc || ''}</p>
        <div class="coming-soon-spec-card">
          <div class="coming-soon-spec-header">
            <span>📋</span>
            <span>Spesifikasi Fitur & Nilai Tambah Enterprise</span>
          </div>
          <div class="coming-soon-features-list">
            ${features.map(f => `
              <div class="coming-soon-feature-item">
                <div class="coming-soon-feature-icon">${f.icon || '✨'}</div>
                <div>
                  <div class="coming-soon-feature-title">${f.title || f.name || ''}</div>
                  <div class="coming-soon-feature-desc">${f.desc || ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="coming-soon-actions">
            <button class="btn btn-primary" onclick="requestEarlyAccess('${spec.title || 'Modul'}')">
              ⭐ Minta Akses Beta Awal
            </button>
            <button class="btn btn-outline" onclick="navigate('/dashboard')">
              ← Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
