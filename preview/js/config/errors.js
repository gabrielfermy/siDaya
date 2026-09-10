/**
 * ==========================================================================
 * STANDARD HTTP ERROR DEFINITIONS (400, 401, 403, 404, 429, 500, 503)
 * ==========================================================================
 */
const ERROR_DEFINITIONS = {
  '400': {
    code: '400',
    badgeClass: 'error-badge-400',
    badgeText: '400 • BAD REQUEST',
    badgeIcon: '⚠️',
    title: 'Permintaan Tidak Valid (Sintaks Salah)',
    desc: 'Format parameter URL atau payload data yang dikirimkan tidak sesuai dengan skema validasi sistem SiDaya.',
    codeClass: 'code-amber',
    statusText: '400 Bad Request (Schema Validation Failed)'
  },
  '401': {
    code: '401',
    badgeClass: 'error-badge-401',
    badgeText: '401 • UNAUTHORIZED',
    badgeIcon: '🔒',
    title: 'Sesi Login Berakhir atau Tidak Ditemukan',
    desc: 'Token otentikasi kedaluwarsa atau sesi Anda telah ditutup. Silakan masuk kembali dengan email dan kata sandi Anda.',
    codeClass: '',
    statusText: '401 Unauthorized (JWT Session Expired)'
  },
  '403': {
    code: '403',
    badgeClass: 'error-badge-403',
    badgeText: '403 • FORBIDDEN',
    badgeIcon: '🚫',
    title: 'Akses Ditolak (Otoritas Tidak Cukup)',
    desc: 'Peran akun Anda saat ini tidak memiliki izin (*Capability Key*) untuk mengakses atau memodifikasi modul ini.',
    codeClass: 'code-danger',
    statusText: '403 Forbidden (RBAC Permission Denied)'
  },
  '404': {
    code: '404',
    badgeClass: 'error-badge-404',
    badgeText: '404 • NOT FOUND',
    badgeIcon: '🔍',
    title: 'Halaman Tidak Ditemukan',
    desc: 'Tautan atau rute yang Anda tuju tidak terdaftar, telah dihapus, atau sedang dipindahkan ke alamat baru.',
    codeClass: '',
    statusText: '404 Not Found (Endpoint Unresolved)'
  },
  '429': {
    code: '429',
    badgeClass: 'error-badge-429',
    badgeText: '429 • TOO MANY REQUESTS',
    badgeIcon: '⏳',
    title: 'Batas Laju Permintaan Terlampaui',
    desc: 'Terlalu banyak permintaan dalam waktu singkat (Rate Limiting aktif). Silakan tunggu beberapa saat sebelum mencoba kembali.',
    codeClass: 'code-amber',
    statusText: '429 Too Many Requests (Rate Limit Triggered)'
  },
  '500': {
    code: '500',
    badgeClass: 'error-badge-500',
    badgeText: '500 • INTERNAL SERVER ERROR',
    badgeIcon: '💥',
    title: 'Terjadi Kendala Pada Server',
    desc: 'Terjadi kesalahan internal yang tidak terduga pada kluster server. Tim teknis telah menerima log otomatis insiden ini.',
    codeClass: 'code-danger',
    statusText: '500 Internal Server Error (Unhandled Exception)'
  },
  '503': {
    code: '503',
    badgeClass: 'error-badge-503',
    badgeText: '503 • SERVICE UNAVAILABLE',
    badgeIcon: '🛠️',
    title: 'Sistem Dalam Pemeliharaan Terjadwal',
    desc: 'Kami sedang melakukan peningkatan performa infrastruktur server SiDaya. Layanan akan kembali normal dalam beberapa menit.',
    codeClass: '',
    statusText: '503 Service Unavailable (Maintenance Window)'
  }
};

const ERROR_PAGES = {
  '/400': { statusCode: '400', title: ERROR_DEFINITIONS['400'].title, desc: ERROR_DEFINITIONS['400'].desc, icon: '⚠️', action: 'ERR_BAD_REQUEST_400' },
  '/401': { statusCode: '401', title: ERROR_DEFINITIONS['401'].title, desc: ERROR_DEFINITIONS['401'].desc, icon: '🔒', action: 'ERR_UNAUTHORIZED_401' },
  '/403': { statusCode: '403', title: ERROR_DEFINITIONS['403'].title, desc: ERROR_DEFINITIONS['403'].desc, icon: '🚫', action: 'ERR_FORBIDDEN_403' },
  '/404': { statusCode: '404', title: ERROR_DEFINITIONS['404'].title, desc: ERROR_DEFINITIONS['404'].desc, icon: '🔍', action: 'ERR_NOT_FOUND_404' },
  '/429': { statusCode: '429', title: ERROR_DEFINITIONS['429'].title, desc: ERROR_DEFINITIONS['429'].desc, icon: '⏳', action: 'ERR_RATE_LIMIT_429' },
  '/500': { statusCode: '500', title: ERROR_DEFINITIONS['500'].title, desc: ERROR_DEFINITIONS['500'].desc, icon: '💥', action: 'ERR_INTERNAL_500' },
  '/503': { statusCode: '503', title: ERROR_DEFINITIONS['503'].title, desc: ERROR_DEFINITIONS['503'].desc, icon: '🛠️', action: 'ERR_MAINTENANCE_503' },
};
