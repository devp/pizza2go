// Serve spike/ plus a built toolchain dir at /tc/, load the harness in headless Chromium, print the result JSON.
// Usage: node spike/run.mjs <toolchain-out-dir> [runs] ; needs playwright-core (NODE_PATH) and PLAYWRIGHT_BROWSERS_PATH.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright-core');

const tc = path.resolve(process.argv[2]);
const runs = process.argv[3] || 3;
const spike = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm' };
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = u.startsWith('/tc/') ? path.join(tc, u.slice(4)) : path.join(spike, u === '/' ? 'index.html' : u);
  fs.readFile(f, (e, b) => {
    if (e) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }).end(b);
  });
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--enable-precise-memory-info'] });
const page = await browser.newPage();
page.on('console', (m) => process.stderr.write('[page] ' + m.text() + '\n'));
page.on('crash', () => process.stderr.write('[page] CRASHED\n'));
await page.goto(`http://localhost:${port}/?runs=${runs}`);
await page.waitForFunction('window.__result', null, { timeout: 540000 });
console.log(JSON.stringify(await page.evaluate('window.__result'), null, 1));
await browser.close(); srv.close();
