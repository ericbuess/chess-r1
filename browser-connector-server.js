const http = require('http');

const PORT = 3025;

// Create a simple HTTP server that responds to browser tool requests
const server = http.createServer((req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Basic health check endpoint
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      server: 'browser-connector',
      port: PORT,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle browser tool commands
  if (req.url === '/command' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log('Received command:', body);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        received: body
      }));
    });
    return;
  }

  // Default response
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Browser connector server running on http://127.0.0.1:${PORT}`);
  console.log('Waiting for browser extension to connect...');
});