/**
 * Dynamic Standard Error Page View (HTTP 400-503)
 */
const ErrorView = {
  render(errSpec, path) {
    return `
      <div class="error-page-wrap">
        <div class="error-page-card">
          <div class="error-badge">
            <span>🛡️</span>
            <span>HTTP ${errSpec.statusCode} - ${errSpec.title}</span>
          </div>
          <div class="error-icon">${errSpec.icon}</div>
          <h1 class="error-title">${errSpec.title}</h1>
          <p class="error-desc">${errSpec.desc}</p>
          <div class="error-meta-box">
            <div class="error-meta-row">
              <span class="error-meta-label">Path Diminta</span>
              <span class="error-meta-value"><code>${path}</code></span>
            </div>
            <div class="error-meta-row">
              <span class="error-meta-label">Kode Internal</span>
              <span class="error-meta-value">${errSpec.action}</span>
            </div>
          </div>
          <div class="error-actions">
            <button class="btn btn-primary" onclick="navigate('/dashboard')">
              🏠 Kembali ke Dashboard
            </button>
            <button class="btn btn-outline" onclick="window.location.reload()">
              🔄 Muat Ulang Halaman
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
