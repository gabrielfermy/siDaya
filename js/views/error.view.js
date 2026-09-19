/**
 * Dynamic Standard Error Page View (HTTP 400-503)
 * Full-screen Standalone Clean Architecture
 */
const ErrorView = {
  render(errSpec, path) {
    const statusCode = errSpec.statusCode || errSpec.code || '404';
    const title = errSpec.title || 'Halaman Tidak Ditemukan';
    const desc = errSpec.desc || 'Tautan atau rute yang Anda tuju tidak terdaftar, telah dihapus, atau sedang dipindahkan ke alamat baru.';
    const actionCode = errSpec.action || ('ERR_' + statusCode);

    const isDanger = ['500', '403'].includes(String(statusCode));
    const codeClass = isDanger ? 'code-danger' : 'code-gradient';

    return `
      <div class="error-standalone-container">
        <div class="error-card-v2">
          <div class="error-header-pill">
            <span class="error-pill-dot"></span>
            <span>HTTP ${statusCode} • ${statusCode === '404' ? 'NOT FOUND' : 'SYSTEM NOTICE'}</span>
          </div>

          <div class="error-hero-code ${codeClass}">
            ${statusCode}
          </div>

          <h1 class="error-hero-title">${title}</h1>
          <p class="error-hero-desc">${desc}</p>

          <div class="error-hero-meta">
            <span class="meta-tag">Path: <code>${path}</code></span>
            <span class="meta-divider">•</span>
            <span class="meta-tag">Code: <code>${actionCode}</code></span>
          </div>

          <div class="error-hero-actions">
            <button class="btn btn-outline error-btn-lg" onclick="window.history.length > 1 ? window.history.back() : navigate('/dashboard')" title="Kembali ke halaman sebelumnya">
              <span style="font-size:1.05rem; line-height:1;">←</span> Back
            </button>
            <button class="btn btn-primary error-btn-lg" onclick="navigate('/dashboard')" title="Kembali ke Dashboard Utama">
              <span>🏠</span> Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
