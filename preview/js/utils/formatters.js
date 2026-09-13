/**
 * ==========================================================================
 * UTILITY HELPERS & FORMATTERS
 * ==========================================================================
 */
function formatRupiah(amount) {
  return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
}

function sanitizeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Resolves current base domain dynamically from runtime environment
 * Localhost preserves port (e.g. localhost:3333). Staging & prod dynamically extract apex domain.
 * @returns {string}
 */
function getBaseDomain() {
  if (typeof window === 'undefined') return 'sidaya.biz.id';
  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port ? `:${window.location.port}` : '';

  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1') {
    return `localhost${port}`;
  }

  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    const multiTLDs = ['my.id', 'biz.id', 'co.id', 'web.id', 'ac.id', 'sch.id', 'go.id', 'co.uk', 'com.au'];
    if (multiTLDs.includes(lastTwo)) {
      return parts.slice(-3).join('.') + port;
    }
    return parts.slice(-2).join('.') + port;
  }
  return hostname + port;
}

/**
 * Returns dynamic protocol (http: or https:) matching current host
 * @returns {string}
 */
function getAppProtocol() {
  if (typeof window === 'undefined') return 'https:';
  return window.location.protocol || 'http:';
}

/**
 * Generates full tenant or operator workspace URL for given subdomain
 * @param {string} subdomain
 * @returns {string}
 */
function getSubdomainUrl(subdomain) {
  const proto = getAppProtocol();
  const base = getBaseDomain();
  if (!subdomain) return `${proto}//${base}`;
  return `${proto}//${subdomain}.${base}`;
}

// Global window attachment
if (typeof window !== 'undefined') {
  window.getBaseDomain = getBaseDomain;
  window.getAppProtocol = getAppProtocol;
  window.getSubdomainUrl = getSubdomainUrl;
}

