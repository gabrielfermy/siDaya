const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const STATIC_DIR = __dirname;
const INDEX_FILE = path.join(STATIC_DIR, 'index.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Live Reload SSE Hub
const sseClients = new Set();

function broadcastReload() {
  for (const client of sseClients) {
    try {
      client.write('data: reload\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

const ROOT_ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Watch STATIC_DIR & ROOT_ASSETS_DIR for hot-reloading on save
let reloadDebounce = null;
function handleHotReload(filename) {
  if (!filename) return;
  const ext = path.extname(filename).toLowerCase();
  if (['.html', '.css', '.js', '.json', '.svg', '.png'].includes(ext)) {
    clearTimeout(reloadDebounce);
    reloadDebounce = setTimeout(() => {
      console.log(`[HotReload] File changed: ${filename}. Refreshing ${sseClients.size} client(s)...`);
      broadcastReload();
    }, 150);
  }
}

try {
  fs.watch(STATIC_DIR, { recursive: true }, (eventType, filename) => handleHotReload(filename));
  if (fs.existsSync(ROOT_ASSETS_DIR)) {
    fs.watch(ROOT_ASSETS_DIR, { recursive: true }, (eventType, filename) => handleHotReload(filename));
  }
} catch (err) {
  console.warn('[HotReload] File watcher error:', err.message);
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // Live Reload SSE Endpoint
  if (pathname === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(': connected\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // Check if requesting from centralized root /assets/
  let requestedFile = path.join(STATIC_DIR, pathname);
  if (pathname.startsWith('/assets/')) {
    const rootCandidate = path.join(ROOT_ASSETS_DIR, pathname.replace(/^\/assets\//, ''));
    if (fs.existsSync(rootCandidate) && fs.statSync(rootCandidate).isFile()) {
      requestedFile = rootCandidate;
    }
  }

  // Normalize root path
  if (pathname === '/') {
    pathname = '/index.html';
    requestedFile = INDEX_FILE;
  }

  // Check if static file exists
  fs.stat(requestedFile, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(requestedFile).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(requestedFile).pipe(res);
    } else {
      // SPA Fallback: serve index.html for application routes (e.g. /dashboard, /pos, /customers)
      fs.readFile(INDEX_FILE, (errIndex, data) => {
        if (errIndex) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading index.html');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SiDaya Modular Prototype Server running at http://localhost:${PORT}`);
  console.log(` - Merchant Plane: http://localhost:${PORT}`);
  console.log(` - Operator Control Plane: http://ops.localhost:${PORT}`);
  console.log(` - PayLink Portal: http://pay.localhost:${PORT}`);
});
