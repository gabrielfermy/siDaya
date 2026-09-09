const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const filePath = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading prototype preview');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SiDaya Multi-Domain Prototype Server running at http://localhost:${PORT}`);
  console.log(` - Merchant Plane: http://localhost:${PORT}`);
  console.log(` - Operator Control Plane: http://ops.localhost:${PORT}`);
  console.log(` - PayLink Portal: http://pay.localhost:${PORT}`);
});
