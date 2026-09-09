import http from 'http';
import { PayLinkClientService } from './services/paylink-client.service';
import { PayLinkCheckoutRenderer } from './components/paylink-checkout';

const PORT = parseInt(process.env['WEB_PORT'] || '3000', 10);
const clientService = new PayLinkClientService(
  process.env['API_URL'] || 'http://localhost:4000/api/v1/public/paylink',
);

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const url = req.url || '';
  const method = req.method || 'GET';

  if (url === '/' && method === 'GET') {
    res.writeHead(302, { Location: '/p/tok_demo_01' });
    res.end();
    return;
  }

  if (url === '/api/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', service: 'SiDaya PayLink Web Portal', port: PORT }));
    return;
  }

  // Hosted customer checkout portal route: /p/:token
  if (url.startsWith('/p/')) {
    const token = url.split('/p/')[1]?.split('?')[0] || 'tok_demo_01';
    try {
      const session = await clientService.loadSession(token);
      const html = PayLinkCheckoutRenderer.renderHTML(session);

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      res.end(html);
      return;
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error rendering PayLink checkout: ${err.message}`);
      return;
    }
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SiDaya PayLink Web] Client Portal running at http://localhost:${PORT}`);
});
