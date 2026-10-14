// Split files over Cloudflare's 25MiB asset limit into parts, then write
// <outroot>/manifest.json listing every file the app must download.
// Usage: node toolchain/manifest.mjs <outroot> <go version>
import fs from "node:fs";
import path from "node:path";

const PART = 20_000_000;
const [outroot, go] = process.argv.slice(2);
const dir = path.join(outroot, go);

/** @param {string} d @returns {string[]} */
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [path.relative(dir, p)];
  });

const files = walk(dir)
  .filter((f) => !/\.\d+$/.test(f))
  .sort()
  .map((name) => {
    const full = path.join(dir, name);
    const size = fs.statSync(full).size;
    if (size <= PART) return { name, size };
    const buf = fs.readFileSync(full);
    const parts = [];
    for (let i = 0; i * PART < size; i++) {
      fs.writeFileSync(`${full}.${i}`, buf.subarray(i * PART, (i + 1) * PART));
      parts.push(`${name}.${i}`);
    }
    fs.rmSync(full);
    return { name, size, parts };
  });

const manifest = { go, dir: go + "/", bytes: files.reduce((n, f) => n + f.size, 0), files };
fs.writeFileSync(path.join(outroot, "manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
console.log(`${go}: ${files.length} files, ${(manifest.bytes / 1048576).toFixed(1)}MB`);
