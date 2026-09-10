/**
 * Dynamic Coming Soon & Roadmap Feature View
 */
const RoadmapView = {
  render(spec) {
    return `
      <div class="coming-soon-hero">
        <div class="coming-soon-badge">
          <span>🚀</span>
          <span>Rencana Peluncuran: <strong>${spec.phase}</strong> (${spec.eta})</span>
        </div>
        <h1 class="coming-soon-title">${spec.title}</h1>
        <p class="coming-soon-desc">${spec.desc}</p>
        <div class="coming-soon-spec-card">
          <div class="coming-soon-spec-header">
            <span>📋</span>
            <span>Spesifikasi Fitur & Nilai Tambah Enterprise</span>
          </div>
          <div class="coming-soon-features-list">
            ${spec.features.map(f => `
              <div class="coming-soon-feature-item">
                <div class="coming-soon-feature-icon">✨</div>
                <div>
                  <div class="coming-soon-feature-title">${f.name}</div>
                  <div class="coming-soon-feature-desc">${f.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="coming-soon-actions">
            <button class="btn btn-primary" onclick="requestEarlyAccess('${spec.title}')">
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
