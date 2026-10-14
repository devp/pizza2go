// The Go worker: holds the toolchain in memory and does the two jobs that need
// it, off the main thread.
//
//   check: run checker.wasm on a unit -> diagnostics, gofmt output, test list
//   run:   compile the unit, generate + compile testmain, link, run test.wasm
//
// Every tool invocation is a fresh WASI instance of an already-compiled
// WebAssembly.Module, over an in-memory filesystem (browser_wasi_shim). The main
// thread terminates this worker when a run takes too long and starts a new one.
//
// Messages in:  {op: "init", cacheName, manifest}
//               {op: "check", id, pkg, files}
//               {op: "run", id, pkg, files, tests, hasTestMain}
// Messages out: {op: "ready"} | {op: "init-error", message}
//               {op: "result", id, result}  (check)
//               {op: "out", id, stream, line} ..., {op: "testing", id} when test.wasm starts,
//               then {op: "done", id, ok, phase, exit, ms}  (run)

import { WASI, WASIProcExit, File, OpenFile, Directory, PreopenDirectory, ConsoleStdout } from "./vendor/browser_wasi_shim/index.js";
import { testmain } from "./lib/testmain.js";

const enc = new TextEncoder();
const dec = new TextDecoder();

/** @typedef {import("./vendor/browser_wasi_shim/index.js").Inode} Inode */

/** @type {Record<string, WebAssembly.Module>} */
const modules = {};
/** @type {Directory} */
let std;
/** @type {string} */
let importcfg = "";
/** @type {Promise<void>} */
let ready;

/** @param {any} msg */
const post = (msg) => self.postMessage(msg);

self.addEventListener("message", (e) => {
  const msg = e.data;
  if (msg.op === "init") {
    ready = init(msg.cacheName, msg.manifest);
    ready.then(
      () => post({ op: "ready" }),
      (err) => post({ op: "init-error", message: String(err?.message ?? err) })
    );
  } else if (msg.op === "check") {
    ready.then(() => post({ op: "result", id: msg.id, result: check(msg.pkg, msg.files) }));
  } else if (msg.op === "run") {
    ready.then(() => run(msg));
  }
});

/**
 * Load every file in the manifest from the toolchain cache.
 * @param {string} cacheName
 * @param {{dir: string, files: {name: string, size: number, parts?: string[]}[]}} manifest
 */
async function init(cacheName, manifest) {
  const cache = await caches.open(cacheName);
  const base = new URL("toolchain/" + manifest.dir, self.location.href);
  /** @param {string} name */
  const get = async (name) => {
    const res = await cache.match(new URL(name, base));
    if (!res) throw new Error("toolchain file missing from cache: " + name);
    return new Uint8Array(await res.arrayBuffer());
  };
  /** @type {Map<string, File>} */
  const stdFiles = new Map();
  await Promise.all(
    manifest.files.map(async (f) => {
      const bytes = f.parts ? concat(await Promise.all(f.parts.map(get))) : await get(f.name);
      if (f.name.endsWith(".wasm")) modules[f.name.slice(0, -5)] = await WebAssembly.compile(bytes);
      else if (f.name === "importcfg") importcfg = dec.decode(bytes);
      else if (f.name.startsWith("std/")) stdFiles.set(f.name.slice(4), new File(bytes, { readonly: true }));
    })
  );
  std = new Directory(stdFiles);
}

/** @param {Uint8Array[]} parts */
function concat(parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** @param {Record<string, string>} files name -> source */
function srcDir(files) {
  return new Directory(new Map(Object.entries(files).map(([n, s]) => [n, new File(enc.encode(s))])));
}

/**
 * Run one tool to completion. Returns the exit code.
 * @param {WebAssembly.Module} mod
 * @param {string[]} args
 * @param {Map<string, Inode>} root contents of /
 * @param {(stream: string, line: string) => void} out
 * @param {string[]} [env]
 */
function exec(mod, args, root, out, env = []) {
  const wasi = new WASI(args, env, [
    new OpenFile(new File([])),
    ConsoleStdout.lineBuffered((l) => out("stdout", l)),
    ConsoleStdout.lineBuffered((l) => out("stderr", l)),
    new PreopenDirectory("/", root),
  ]);
  const inst = new WebAssembly.Instance(mod, { wasi_snapshot_preview1: /** @type {any} */ (wasi.wasiImport) });
  try {
    return wasi.start(/** @type {any} */ (inst));
  } catch (err) {
    if (err instanceof WASIProcExit) return err.code;
    throw err;
  }
}

/**
 * @param {string} pkg
 * @param {Record<string, string>} files
 */
function check(pkg, files) {
  const outLines = /** @type {string[]} */ ([]);
  const errLines = /** @type {string[]} */ ([]);
  const root = new Map(
    /** @type {[string, Inode][]} */ ([
      ["std", std],
      ["importcfg", new File(enc.encode(importcfg))],
      ["request.json", new File(enc.encode(JSON.stringify({ pkg, files })))],
    ])
  );
  const code = exec(modules.checker, ["checker", "/request.json"], root, (s, l) => (s === "stdout" ? outLines : errLines).push(l));
  if (code !== 0) return { error: errLines.join("\n") || `checker exited ${code}` };
  return JSON.parse(outLines.join("\n"));
}

/**
 * @param {{id: number, pkg: string, files: Record<string, string>, tests: import("./lib/testmain.js").TestFunc[], hasTestMain: boolean}} msg
 */
function run({ id, pkg, files, tests, hasTestMain }) {
  /** @type {Record<string, number>} */
  const ms = {};
  const out = (/** @type {string} */ stream, /** @type {string} */ line) => post({ op: "out", id, stream, line });
  const outDir = new Directory(new Map());
  const src = srcDir({ ...files, "_testmain.go": testmain(pkg, tests, hasTestMain) });
  const root = new Map(
    /** @type {[string, Inode][]} */ ([
      ["std", std],
      ["src", src],
      ["out", outDir],
      ["importcfg", new File(enc.encode(importcfg))],
      ["importcfg.main", new File(enc.encode(importcfg + `packagefile ${pkg}=/out/${pkg}.a\n`))],
    ])
  );
  const goFiles = Object.keys(files).sort().map((n) => "/src/" + n);
  /** @type {[string, WebAssembly.Module, string[]][]} */
  const steps = [
    ["compile", modules.compile, ["compile", "-p", pkg, "-complete", "-importcfg", "/importcfg", "-o", `/out/${pkg}.a`, ...goFiles]],
    ["testmain", modules.compile, ["compile", "-p", "main", "-complete", "-importcfg", "/importcfg.main", "-o", "/out/main.a", "/src/_testmain.go"]],
    ["link", modules.link, ["link", "-importcfg", "/importcfg.main", "-o", "/out/test.wasm", "/out/main.a"]],
  ];
  for (const [phase, mod, args] of steps) {
    const t = performance.now();
    const code = exec(mod, args, root, (_, l) => out("build", l));
    ms[phase] = Math.round(performance.now() - t);
    if (code !== 0) return post({ op: "done", id, ok: false, phase, exit: code, ms });
  }
  let t = performance.now();
  const bin = /** @type {Uint8Array<ArrayBuffer>} */ (/** @type {File} */ (outDir.contents.get("test.wasm")).data);
  const testMod = new WebAssembly.Module(bin);
  ms.load = Math.round(performance.now() - t);
  post({ op: "testing", id });
  t = performance.now();
  const testRoot = new Map(/** @type {[string, Inode][]} */ ([["tmp", new Directory(new Map())]]));
  const code = exec(testMod, ["test.wasm", "-test.v=true", "-test.paniconexit0", "-test.timeout=60s"], testRoot, out, [
    "TMPDIR=/tmp",
    "HOME=/tmp",
    "PWD=/",
  ]);
  ms.test = Math.round(performance.now() - t);
  post({ op: "done", id, ok: code === 0, phase: "test", exit: code, ms });
}
