// Main-thread side of go-worker.js: check and run, with a time limit on runs.
// A run that's still going at the limit (an infinite loop, a deadlock the Go
// runtime can't see) is stopped by terminating the worker; a new one starts.

/**
 * @typedef {import("./toolchain.js").Manifest} Manifest
 * @typedef {import("./testmain.js").TestFunc} TestFunc
 * @typedef {{file: string, line: number, col: number, msg: string, source: string}} Diagnostic
 * @typedef {{diagnostics: Diagnostic[], formatted: Record<string, string>, tests: TestFunc[], hasTestMain: boolean, error?: string}} CheckResult
 * @typedef {{ok: boolean, phase: string, exit: number, ms: Record<string, number>, timedOut?: boolean}} RunResult
 */

export class GoWorker {
  /**
   * @param {string} cacheName
   * @param {Manifest} manifest
   */
  constructor(cacheName, manifest) {
    this.cacheName = cacheName;
    this.manifest = manifest;
    this.nextId = 1;
    /** @type {Map<number, {resolve: (v: any) => void, onLine?: (stream: string, line: string) => void}>} */
    this.pending = new Map();
    const w = this.spawn();
    this.worker = w.worker;
    this.ready = w.ready;
  }

  /** Start a worker and send it the toolchain. */
  spawn() {
    const worker = new Worker(new URL("../go-worker.js", import.meta.url), { type: "module" });
    /** @type {Promise<void>} */
    const ready = new Promise((resolve, reject) => {
      worker.addEventListener("message", (e) => {
        const m = e.data;
        if (m.op === "ready") resolve();
        else if (m.op === "init-error") reject(new Error(m.message));
        else if (m.op === "result") this.settle(m.id, m.result);
        else if (m.op === "out") this.pending.get(m.id)?.onLine?.(m.stream, m.line);
        else if (m.op === "done") this.settle(m.id, { ok: m.ok, phase: m.phase, exit: m.exit, ms: m.ms });
      });
      worker.addEventListener("error", (e) => reject(new Error(e.message || "worker failed to start")));
    });
    worker.postMessage({ op: "init", cacheName: this.cacheName, manifest: this.manifest });
    return { worker, ready };
  }

  /** @param {number} id @param {any} value */
  settle(id, value) {
    this.pending.get(id)?.resolve(value);
    this.pending.delete(id);
  }

  /**
   * @param {string} pkg
   * @param {Record<string, string>} files
   * @returns {Promise<CheckResult>}
   */
  async check(pkg, files) {
    await this.ready;
    const id = this.nextId++;
    return new Promise((resolve) => {
      this.pending.set(id, { resolve });
      this.worker.postMessage({ op: "check", id, pkg, files });
    });
  }

  /**
   * @param {{pkg: string, files: Record<string, string>, tests: TestFunc[], hasTestMain: boolean}} unit
   * @param {(stream: string, line: string) => void} onLine
   * @param {number} limitMs
   * @returns {Promise<RunResult>}
   */
  async run(unit, onLine, limitMs) {
    await this.ready;
    const id = this.nextId++;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        // Kills any queued checks too; they resolve as errors and get redone.
        this.worker.terminate();
        for (const [pid, p] of this.pending) if (pid !== id) p.resolve({ diagnostics: [], formatted: {}, tests: [], hasTestMain: false, error: "restarted" });
        this.pending.clear();
        resolve({ ok: false, phase: "test", exit: -1, ms: {}, timedOut: true });
        const w = this.spawn();
        this.worker = w.worker;
        this.ready = w.ready;
      }, limitMs);
      this.pending.set(id, {
        onLine,
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
      });
      this.worker.postMessage({ op: "run", id, ...unit });
    });
  }

  terminate() {
    this.worker.terminate();
  }
}
