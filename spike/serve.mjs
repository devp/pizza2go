// Serve spike/ plus a built toolchain dir at /tc/ for opening on a phone. Usage: node spike/serve.mjs <toolchain-out-dir> [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tc = path.resolve(process.argv[2]);
const port = +process.argv[3] || 8080;
const spike = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm' };
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = u.startsWith('/tc/') ? path.join(tc, u.slice(4)) : path.join(spike, u === '/' ? 'index.html' : u);
  fs.readFile(f, (e, b) => {
    if (e) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }).end(b);
  });
}).listen(port, () => {
  for (const addrs of Object.values(os.networkInterfaces())) for (const a of addrs) if (a.family === 'IPv4' && !a.internal) console.log(`http://${a.address}:${port}/`);
});
