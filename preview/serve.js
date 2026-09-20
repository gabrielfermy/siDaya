const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3333;
const STATIC_DIR = __dirname;
const ROOT_DIR = path.resolve(__dirname, '..');
const ROOT_ASSETS_DIR = path.join(ROOT_DIR, 'assets');
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

function broadcastHMR(eventData) {
  const payload = typeof eventData === 'string' ? eventData : JSON.stringify(eventData);
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Watch STATIC_DIR & ROOT_ASSETS_DIR for hot-reloading on save
let reloadDebounce = null;
function handleHotReload(filename, baseDir) {
  if (!filename) return;
  const ext = path.extname(filename).toLowerCase();
  
  if (['.html', '.css', '.js', '.json', '.svg', '.png', '.jpg', '.webp'].includes(ext)) {
    clearTimeout(reloadDebounce);
    reloadDebounce = setTimeout(() => {
      const normalizedPath = filename.replace(/\\/g, '/');
      let hmrType = 'reload';
      
      if (ext === '.css') {
        hmrType = 'css';
      } else if (['.svg', '.png', '.jpg', '.webp'].includes(ext)) {
        hmrType = 'asset';
      }

      console.log(`[HMR Server] ⚡ ${hmrType.toUpperCase()} modified: ${normalizedPath} (${sseClients.size} client(s) connected)`);

      // Auto-sync brand assets if root assets/brand changed
      if (baseDir === ROOT_ASSETS_DIR && normalizedPath.includes('brand')) {
        exec('node scripts/sync-assets.js', { cwd: ROOT_DIR }, () => {
          broadcastHMR({ type: 'asset', file: normalizedPath, timestamp: Date.now() });
        });
        return;
      }

      broadcastHMR({ type: hmrType, file: normalizedPath, timestamp: Date.now() });
    }, 100);
  }
}

try {
  fs.watch(STATIC_DIR, { recursive: true }, (eventType, filename) => handleHotReload(filename, STATIC_DIR));
  if (fs.existsSync(ROOT_ASSETS_DIR)) {
    fs.watch(ROOT_ASSETS_DIR, { recursive: true }, (eventType, filename) => handleHotReload(filename, ROOT_ASSETS_DIR));
  }
  console.log('[HMR Server] File watchers active for preview/ and assets/');
} catch (err) {
  console.warn('[HMR Server] File watcher error:', err.message);
}

// Injects HMR client script into HTML responses
function injectHMRScript(htmlContent) {
  if (typeof htmlContent !== 'string') htmlContent = htmlContent.toString('utf-8');
  if (htmlContent.includes('/js/core/hmr-client.js')) {
    return htmlContent;
  }
  const hmrTag = '\n  <!-- SiDaya HMR Engine -->\n  <script src="/js/core/hmr-client.js"></script>\n</body>';
  if (htmlContent.includes('</body>')) {
    return htmlContent.replace('</body>', hmrTag);
  }
  return htmlContent + '\n<script src="/js/core/hmr-client.js"></script>';
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

      // For HTML files, inject HMR client and disable caching
      if (ext === '.html') {
        fs.readFile(requestedFile, 'utf-8', (errHtml, content) => {
          if (errHtml) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading HTML file');
            return;
          }
          const injected = injectHMRScript(content);
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          });
          res.end(injected);
        });
        return;
      }

      // For JS, CSS, JSON, images
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.js' || ext === '.css' ? 'no-cache, must-revalidate' : 'public, max-age=3600'
      });
      fs.createReadStream(requestedFile).pipe(res);
    } else {
      // SPA Fallback: serve index.html with HMR injection
      fs.readFile(INDEX_FILE, 'utf-8', (errIndex, data) => {
        if (errIndex) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading index.html');
          return;
        }
        const injected = injectHMRScript(data);
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(injected);
      });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================================`);
  console.log(`⚡ SiDaya Prototype Server + HMR Engine active on :${PORT}`);
  console.log(` - Merchant Plane: http://localhost:${PORT}`);
  console.log(` - Operator Control Plane: http://ops.localhost:${PORT}`);
  console.log(` - PayLink Portal: http://pay.localhost:${PORT}`);
  console.log(` - HMR SSE Stream: http://localhost:${PORT}/__livereload`);
  console.log(`========================================================\n`);
});
