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
 * @param {string} [path='']
 * @returns {string}
 */
function getSubdomainUrl(subdomain, path = '') {
  const proto = getAppProtocol();
  const base = getBaseDomain();
  const cleanPath = path ? (path.startsWith('/') ? path : '/' + path) : '';
  return `${proto}//${subdomain}.${base}${cleanPath}`;
}

/**
 * Resolves active tenant subdomain from current hostname or stored session
 * @returns {string}
 */
function getCurrentSubdomain() {
  if (typeof window === 'undefined') return 'berasjaya';
  const hostname = window.location.hostname.toLowerCase();
  
  // Direct subdomain check from hostname
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    const first = parts[0];
    if (first !== 'www' && first !== 'sidaya' && first !== 'localhost') {
      return first;
    }
  }

  // Fallback check from active merchant session
  try {
    const raw = localStorage.getItem('sidaya_merchant_session');
    if (raw) {
      const sess = JSON.parse(raw);
      if (sess && sess.subdomain) return sess.subdomain.toLowerCase();
    }
  } catch (e) {}

  return 'berasjaya';
}

// Global window attachment
if (typeof window !== 'undefined') {
  window.getBaseDomain = getBaseDomain;
  window.getAppProtocol = getAppProtocol;
  window.getSubdomainUrl = getSubdomainUrl;
  window.getCurrentSubdomain = getCurrentSubdomain;
}


