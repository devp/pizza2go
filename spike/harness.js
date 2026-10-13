// Browser spike: fetch the wasip1 toolchain, then compile + link + run a package with tests,
// each tool in a fresh WASI instance over an in-memory filesystem (the runner pipeline from SPEC.md).
// Results go to window.__result as JSON. Toolchain files are served from ./tc/.
import { WASI, File, Directory, PreopenDirectory, ConsoleStdout } from './vendor/browser_wasi_shim/index.js';

const logEl = document.getElementById('log');
const log = (...a) => { const s = a.join(' '); logEl.textContent += s + '\n'; console.log(s); };
const enc = new TextEncoder(), dec = new TextDecoder();
const ms = (t) => Math.round(performance.now() - t);
const R = { sizes: {}, cold: {}, runs: [] };

// Workers static assets cap files at 25MiB, so CI may split a big file into name.0, name.1, ...
async function fetchBytes(url) {
  const t = performance.now();
  let r = await fetch(url);
  let b;
  if (r.ok) b = new Uint8Array(await r.arrayBuffer());
  else {
    const parts = [];
    for (let i = 0; ; i++) {
      r = await fetch(`${url}.${i}`);
      if (!r.ok) break;
      parts.push(new Uint8Array(await r.arrayBuffer()));
    }
    if (!parts.length) throw new Error('missing ' + url);
    b = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let o = 0;
    for (const p of parts) { b.set(p, o); o += p.length; }
  }
  return [b, ms(t)];
}

// cold load
const mods = {};
for (const n of ['compile', 'link']) {
  const t = performance.now();
  const [bytes, fetchMs] = await fetchBytes(`tc/${n}.wasm`);
  const t2 = performance.now();
  mods[n] = await WebAssembly.compile(bytes);
  R.cold[n] = { bytes: bytes.length, fetchMs, compileMs: ms(t2), totalMs: ms(t) };
  log(n, JSON.stringify(R.cold[n]));
}
const importcfg = await (await fetch('tc/importcfg')).text();
const stdNames = [...importcfg.matchAll(/=\/std\/(\S+)/g)].map((m) => m[1]);
{
  const t = performance.now();
  const files = await Promise.all(stdNames.map(async (n) => [n, new File((await (await fetch('tc/std/' + n)).arrayBuffer()))]));
  R.cold.std = { files: files.length, bytes: files.reduce((s, [, f]) => s + f.data.length, 0), totalMs: ms(t) };
  log('std', JSON.stringify(R.cold.std));
  window.__std = files;
}

const helloGo = `package hello

import "fmt"

func Greet(name string) string { return fmt.Sprintf("hello, %s", name) }
`;
const helloTest = `package hello

import "testing"

func TestGreet(t *testing.T) {
	if got := Greet("x"); got != "hello, x" {
		t.Fatal(got)
	}
}

func TestEmpty(t *testing.T) {
	if got := Greet(""); got != "hello, " {
		t.Fatal(got)
	}
}

func TestLen(t *testing.T) {
	if len(Greet("ab")) != 9 {
		t.Fatal("len")
	}
}
`;
const names = ['TestGreet', 'TestEmpty', 'TestLen'];
const testmain = `package main

import (
	"os"
	"testing"
	"testing/internal/testdeps"

	hello "hello"
)

var tests = []testing.InternalTest{
${names.map((n) => `\t{"${n}", hello.${n}},`).join('\n')}
}

func main() {
	m := testing.MainStart(testdeps.TestDeps{}, tests, nil, nil, nil)
	os.Exit(m.Run())
}
`;

async function tool(mod, args, root, out) {
  const wasi = new WASI(['x', ...args], [], [
    null, ConsoleStdout.lineBuffered((l) => out.push(l)), ConsoleStdout.lineBuffered((l) => out.push(l)),
    new PreopenDirectory('/', root),
  ]);
  wasi.fds[0] = new (await import('./vendor/browser_wasi_shim/index.js')).OpenFile(new File([]));
  const inst = await WebAssembly.instantiate(mod, { wasi_snapshot_preview1: wasi.wasiImport });
  const code = wasi.start(inst);
  tool.lastMemMB = Math.round(inst.exports.memory.buffer.byteLength / 1048576);
  return code;
}

async function pipeline() {
  const T = {}, out = [];
  const std = new Directory(new Map(window.__std));
  const outDir = new Directory(new Map());
  const root = new Map([
    ['std', std], ['out', outDir],
    ['importcfg', new File(enc.encode(importcfg))],
    ['src', new Directory(new Map([
      ['hello.go', new File(enc.encode(helloGo))],
      ['hello_test.go', new File(enc.encode(helloTest))],
      ['_testmain.go', new File(enc.encode(testmain))],
    ]))],
  ]);
  const step = async (label, mod, args) => {
    const t = performance.now();
    const code = await tool(mods[mod], args, root, out);
    T[label] = ms(t);
    T[label + ' wasm memory MB'] = tool.lastMemMB;
    if (code !== 0) throw new Error(`${label} exit ${code}\n${out.join('\n')}`);
  };
  const t0 = performance.now();
  await step('compile pkg', 'compile', ['-p', 'hello', '-importcfg', '/importcfg', '-o', '/out/hello.a', '/src/hello.go', '/src/hello_test.go']);
  root.set('importcfg.main', new File(enc.encode(importcfg + 'packagefile hello=/out/hello.a\n')));
  await step('compile main', 'compile', ['-p', 'main', '-importcfg', '/importcfg.main', '-o', '/out/main.a', '/src/_testmain.go']);
  await step('link', 'link', ['-importcfg', '/importcfg.main', '-o', '/out/test.wasm', '/out/main.a']);
  const wasm = outDir.contents.get('test.wasm').data;
  T['test.wasm bytes'] = wasm.length;
  let t = performance.now();
  const tm = await WebAssembly.compile(wasm);
  T['compile test.wasm'] = ms(t);
  t = performance.now();
  const run = [];
  const w = new WASI(['test.wasm', '-test.v'], [], [null, ConsoleStdout.lineBuffered((l) => run.push(l)), ConsoleStdout.lineBuffered((l) => run.push(l))]);
  w.fds[0] = new (await import('./vendor/browser_wasi_shim/index.js')).OpenFile(new File([]));
  const code = w.start(await WebAssembly.instantiate(tm, { wasi_snapshot_preview1: w.wasiImport }));
  T['run tests'] = ms(t);
  T.total = ms(t0);
  T.testExit = code;
  T.testOutput = run.join('\n');
  return T;
}


// checker: latency of check() on a ~100-line file, cold (first instantiate) then warm
{
  const t = performance.now();
  const [bytes, fetchMs] = await fetchBytes('tc/checker.wasm');
  const t2 = performance.now();
  const cm = await WebAssembly.compile(bytes);
  R.cold.checker = { bytes: bytes.length, fetchMs, compileMs: ms(t2), totalMs: ms(t) };
  log('checker', JSON.stringify(R.cold.checker));
  let src = 'package big\n\nimport (\n\t"fmt"\n\t"strings"\n)\n\n';
  for (let i = 0; i < 12; i++) src += `// F${i} does a thing.\nfunc F${i}(s string, n int) (string, error) {\n\tif n < 0 {\n\t\treturn "", fmt.Errorf("neg %d", n)\n\t}\n\tout := strings.Repeat(s, n)\n\treturn strings.ToUpper(out), nil\n}\n\n`;
  src += 'func Bad() int { return "x" }\n';
  R.checkerSrcLines = src.split('\n').length;
  R.checker = [];
  for (let i = 0; i < 4; i++) {
    const std = new Directory(new Map(window.__std));
    const out = [];
    const root = new Map([['std', std], ['importcfg', new File(enc.encode(importcfg))], ['req.json', new File(enc.encode(JSON.stringify({ Files: { 'big.go': src } })))]]);
    const w = new WASI(['checker', '/req.json'], [], [new (await import('./vendor/browser_wasi_shim/index.js')).OpenFile(new File([])), ConsoleStdout.lineBuffered((l) => out.push(l)), ConsoleStdout.lineBuffered((l) => out.push(l)), new PreopenDirectory('/', root)]);
    const t3 = performance.now();
    const code = w.start(await WebAssembly.instantiate(cm, { wasi_snapshot_preview1: w.wasiImport }));
    R.checker.push({ ms: ms(t3), exit: code, out: out.join('').slice(0, 300) });
  }
  log('checker runs', JSON.stringify(R.checker));
}

const N = +new URLSearchParams(location.search).get('runs') || 3;
try {
  for (let i = 0; i < N; i++) {
    const T = await pipeline();
    T.heapMB = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
    R.runs.push(T);
    log(i ? 'warm' : 'first', JSON.stringify(T));
  }
} catch (e) {
  R.error = String(e && e.stack || e);
  log('ERROR', R.error);
}
window.__result = R;
