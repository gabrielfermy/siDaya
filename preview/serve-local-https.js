/**
 * @file serve-local-https.js
 * @description Native Zero-Dependency Local HTTPS Reverse Proxy (Port 443 & Port 80)
 * Handles automatic SSL termination and routing for:
 *   - https://sidaya.test & https://*.sidaya.test -> localhost:3333
 *   - https://ops.sidaya.test -> localhost:3333
 *   - https://pay.sidaya.test -> localhost:3000
 *   - https://api.sidaya.test -> localhost:4000
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CERT_PATH = path.join(__dirname, 'certs', 'cert.pem');
const KEY_PATH = path.join(__dirname, 'certs', 'key.pem');

if (!fs.existsSync(CERT_PATH) || !fs.existsSync(KEY_PATH)) {
  console.error('[HTTPS Proxy] SSL certificate or key not found in preview/certs/.');
  process.exit(1);
}

const sslOptions = {
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH),
};

const ROUTE_TABLE = {
  'api.sidaya.test': 4000,
  'pay.sidaya.test': 3000,
  'ops.sidaya.test': 3333,
  'sidaya.test': 3333,
};

function getTargetPort(hostHeader) {
  const host = (hostHeader || '').split(':')[0].toLowerCase();
  if (ROUTE_TABLE[host]) {
    return ROUTE_TABLE[host];
  }
  if (host.endsWith('.sidaya.test')) {
    if (host.startsWith('api.')) return 4000;
    if (host.startsWith('pay.')) return 3000;
    return 3333; // Tenant workspaces e.g. berasjaya.sidaya.test
  }
  return 3333;
}

function proxyRequest(req, res, targetPort) {
  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'x-forwarded-proto': 'https',
      'x-forwarded-host': req.headers.host,
      'x-forwarded-for': req.socket.remoteAddress || '127.0.0.1',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[HTTPS Proxy Error] Failed to proxy to port ${targetPort}:`, err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Bad Gateway: Could not connect to backend service on port ${targetPort}. Please ensure the service is running.`);
    }
  });

  req.pipe(proxyReq, { end: true });
}

// 1. Start HTTPS Proxy on Port 443
const httpsServer = https.createServer(sslOptions, (req, res) => {
  const host = req.headers.host || 'sidaya.test';
  const targetPort = getTargetPort(host);
  proxyRequest(req, res, targetPort);
});

// Handle WebSocket / SSE live reload upgrade
httpsServer.on('upgrade', (req, socket, head) => {
  const host = req.headers.host || 'sidaya.test';
  const targetPort = getTargetPort(host);
  
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: req.headers,
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write(`HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`);
    for (let i = 0; i < proxyRes.rawHeaders.length; i += 2) {
      socket.write(`${proxyRes.rawHeaders[i]}: ${proxyRes.rawHeaders[i + 1]}\r\n`);
    }
    socket.write('\r\n');
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', (err) => {
    socket.destroy();
  });

  proxyReq.end();
});

httpsServer.listen(443, '0.0.0.0', () => {
  console.log('========================================================================');
  console.log('🔒 SiDaya Local HTTPS Reverse Proxy active on Standard Port 443:');
  console.log(' - Merchant Plane:        https://sidaya.test');
  console.log(' - Tenant Workspace:       https://berasjaya.sidaya.test');
  console.log(' - Operator Control Plane: https://ops.sidaya.test');
  console.log(' - PayLink Checkout:       https://pay.sidaya.test');
  console.log(' - Core API Endpoint:      https://api.sidaya.test');
  console.log('========================================================================');
});

// 2. Start HTTP to HTTPS Redirect on Port 80
const httpServer = http.createServer((req, res) => {
  const host = (req.headers.host || 'sidaya.test').split(':')[0];
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
});

httpServer.listen(80, '0.0.0.0', () => {
  console.log('ℹ️  Port 80 HTTP -> HTTPS Redirector active.');
});
