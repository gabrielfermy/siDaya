/**
 * Dynamic Standard Error Page View (HTTP 400-503)
 */
const ErrorView = {
  render(errSpec, path) {
    const isOps = (typeof window !== 'undefined' && (
      window.location.hostname.startsWith('ops.') ||
      !!localStorage.getItem('sidaya_operator_session') ||
      (document.documentElement && document.documentElement.className.includes('ops'))
    ));

    const returnRoute = isOps ? '/telemetry' : '/dashboard';
    const returnLabel = isOps ? '⚡ Kembali ke Control Plane' : '🏠 Kembali ke Dashboard';

    return `
      <div class="error-page-wrap">
        <div class="error-page-card">
          <div class="error-badge">
            <span>🛡️</span>
            <span>HTTP ${errSpec.statusCode || errSpec.code || '404'} - ${errSpec.title || 'Error'}</span>
          </div>
          <div class="error-icon">${errSpec.icon || errSpec.badgeIcon || '⚠️'}</div>
          <h1 class="error-title">${errSpec.title || 'Terjadi Kendala'}</h1>
          <p class="error-desc">${errSpec.desc || 'Halaman tidak dapat ditampilkan.'}</p>
          <div class="error-meta-box">
            <div class="error-meta-row">
              <span class="error-meta-label">Path Diminta</span>
              <span class="error-meta-value"><code>${path}</code></span>
            </div>
            <div class="error-meta-row">
              <span class="error-meta-label">Kode Internal</span>
              <span class="error-meta-value">${errSpec.action || 'ERR_' + (errSpec.statusCode || errSpec.code || '404')}</span>
            </div>
          </div>
          <div class="error-actions">
            <button class="btn btn-primary" onclick="navigate('${returnRoute}')">
              ${returnLabel}
            </button>
            <button class="btn btn-outline" onclick="window.location.reload()">
              🔄 Muat Ulang Halaman
            </button>
          </div>
        </div>
      </div>

      ${isOps ? `
        <!-- OPERATOR EXCLUSIVE HTTP STATUS SWITCHER DOCK -->
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
      ` : ''}
    `;
  },
};
