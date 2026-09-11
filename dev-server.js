/**
 * Local development server for the concept demo.
 * It serves the static front end and proxies /backend/* to the local ASP.NET Core API.
 * The proxy deliberately trusts the local development certificate only; never use this
 * server as a public production gateway.
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const apiOrigin = 'https://localhost:7285';
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};

function proxyApi(req, res) {
  const target = new URL(req.url.replace(/^\/backend/, ''), apiOrigin);
  const proxy = https.request(target, {
    method: req.method,
    headers: {...req.headers, host: target.host},
    rejectUnauthorized: false // Trust the local ASP.NET Core development certificate.
  }, upstream => {
    res.writeHead(upstream.statusCode || 502, upstream.headers);
    upstream.pipe(res);
  });
  proxy.on('error', error => {
    res.writeHead(502, {'Content-Type':'application/json; charset=utf-8'});
    res.end(JSON.stringify({message:`无法连接本机后端：${error.message}`}));
  });
  req.pipe(proxy);
}

function serveStatic(req, res) {
  const requestPath = req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.resolve(root, `.${requestPath}`);
  if (!filePath.startsWith(root + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (error, data) => {
    if (error) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream'});
    res.end(data);
  });
}

http.createServer((req, res) => req.url.startsWith('/backend/') ? proxyApi(req, res) : serveStatic(req, res))
  .listen(port, '127.0.0.1', () => console.log(`青财智管已启动：http://127.0.0.1:${port}`));
