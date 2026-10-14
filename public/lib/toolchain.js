// The Go toolchain: which version is installed, whether a newer one is
// deployed, and downloading it -- only when the user says so.
//
// Kept apart from sw.js on purpose. The toolchain is ~100MB, so it isn't in
// ASSETS (refetched on every launch), and its cache is named outside sw.js's
// PREFIX, which `activate` would otherwise delete on every app update.
//
// A cache is complete once it holds manifest.json: that's written last.
// The manifest is fetched from the network on start (it isn't in ASSETS
// either), so a newly deployed version is noticed the same way app updates are.

/**
 * @typedef {{name: string, size: number, parts?: string[]}} ManifestFile
 * @typedef {{go: string, dir: string, bytes: number, files: ManifestFile[]}} Manifest
 * @typedef {"checking"|"missing"|"waiting"|"downloading"|"ready"|"offline"|"error"} State
 * @typedef {Object} Status
 * @property {State} state
 * @property {Manifest|null} installed  complete and usable
 * @property {Manifest|null} available  what's deployed, if we could fetch it
 * @property {{done: number, total: number}} progress
 * @property {string} error
 */

const base = new URL("toolchain/", document.baseURI);
const MANIFEST = new URL("manifest.json", base);
export const cachePrefix = new URL(".", document.baseURI).href + "#toolchain ";
/** @param {Manifest} m */
export const cacheName = (m) => cachePrefix + m.go;

/** @type {Status} */
let status = { state: "checking", installed: null, available: null, progress: { done: 0, total: 0 }, error: "" };
/** @type {Set<(s: Status) => void>} */
const listeners = new Set();

export const get = () => status;
/** @param {(s: Status) => void} fn */
export function subscribe(fn) {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
}
/** @param {Partial<Status>} patch */
function set(patch) {
  status = { ...status, ...patch };
  for (const fn of listeners) fn(status);
}

/** True when an update is deployed but the installed toolchain still works. */
export const updateAvailable = () =>
  Boolean(status.installed && status.available && status.available.go !== status.installed.go);

/** Whether the browser can tell Wi-Fi from cellular (Chrome on Android can). */
export const knowsWifi = () => typeof (/** @type {any} */ (navigator).connection?.type) === "string";
const onWifi = () => /** @type {any} */ (navigator).connection?.type === "wifi";
export const saveData = () => Boolean(/** @type {any} */ (navigator).connection?.saveData);

/** @type {"ask"|"wifi"} */
let pref = "ask";
let started = false;

/**
 * Find what's installed, fetch what's deployed, and download if the user
 * already asked to (Wait for Wi-Fi, and now we're on Wi-Fi).
 * @param {{pref: "ask"|"wifi"}} opts
 */
export async function start(opts) {
  pref = opts.pref;
  const installed = await findInstalled();
  /** @type {Manifest|null} */
  let available = null;
  try {
    const res = await fetch(MANIFEST, { cache: "no-cache" });
    if (res.ok) available = await res.json();
  } catch {
    /* offline */
  }
  if (installed) set({ state: "ready", installed, available });
  else if (!available) set({ state: "offline", installed, available });
  else set({ state: pref === "wifi" ? "waiting" : "missing", installed, available });

  if (!started) {
    started = true;
    /** @type {any} */ (navigator).connection?.addEventListener?.("change", maybeStartOnWifi);
  }
  maybeStartOnWifi();
}

function maybeStartOnWifi() {
  if (pref !== "wifi" || !onWifi() || status.state === "downloading") return;
  if (status.state === "waiting" || updateAvailable()) download();
}

/** Remember "Wait for Wi-Fi"; starts right away if already on Wi-Fi. */
export function waitForWifi() {
  pref = "wifi";
  if (!status.installed) set({ state: "waiting" });
  maybeStartOnWifi();
}

/** @returns {Promise<Manifest|null>} the newest complete toolchain in Cache Storage */
async function findInstalled() {
  /** @type {Manifest|null} */
  let best = null;
  for (const name of await caches.keys()) {
    if (!name.startsWith(cachePrefix)) continue;
    const res = await (await caches.open(name)).match(MANIFEST);
    if (!res) continue;
    const m = /** @type {Manifest} */ (await res.json());
    if (!best || compareGo(m.go, best.go) > 0) best = m;
  }
  return best;
}

/** @param {string} a @param {string} b go1.27.2-style versions */
export function compareGo(a, b) {
  const n = (/** @type {string} */ v) => v.replace(/^go/, "").split(".").map((x) => parseInt(x, 10) || 0);
  const [x, y] = [n(a), n(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  }
  return 0;
}

/** @param {Manifest} m @returns {string[]} every URL to fetch, parts included */
export const urlsOf = (m) => m.files.flatMap((f) => f.parts ?? [f.name]).map((n) => new URL(m.dir + n, base).href);

/**
 * Download the deployed toolchain into its own cache. Files already cached are
 * kept, so an interrupted download resumes. All-or-nothing: usable only once
 * the manifest is written, after every file.
 */
export async function download() {
  const m = status.available;
  if (!m || status.state === "downloading") return;
  // Ask before writing ~100MB, so the browser won't evict it under pressure.
  await navigator.storage?.persist?.().catch(() => false);
  const cache = await caches.open(cacheName(m));
  const urls = urlsOf(m);
  set({ state: "downloading", error: "", progress: { done: 0, total: m.bytes } });
  let done = 0;
  const bump = (/** @type {number} */ n) => {
    done += n;
    set({ progress: { done, total: m.bytes } });
  };
  try {
    const queue = [...urls];
    const worker = async () => {
      for (let url = queue.shift(); url; url = queue.shift()) {
        const have = await cache.match(url);
        if (have) {
          bump(Number(have.headers.get("content-length")) || (await have.clone().arrayBuffer()).byteLength);
          continue;
        }
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok || !res.body) throw new Error(`${new URL(url).pathname}: HTTP ${res.status}`);
        const chunks = [];
        const reader = res.body.getReader();
        for (;;) {
          const { done: end, value } = await reader.read();
          if (end) break;
          chunks.push(value);
          bump(value.length);
        }
        const body = new Blob(chunks);
        await cache.put(url, new Response(body, { headers: { "content-type": res.headers.get("content-type") ?? "application/octet-stream", "content-length": String(body.size) } }));
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    await cache.put(MANIFEST, new Response(JSON.stringify(m), { headers: { "content-type": "application/json" } }));
    // Only now is it complete; drop every other version, finished or not.
    for (const name of await caches.keys()) {
      if (name.startsWith(cachePrefix) && name !== cacheName(m)) await caches.delete(name);
    }
    set({ state: "ready", installed: m });
  } catch (err) {
    set({ state: "error", error: String(/** @type {any} */ (err)?.message ?? err) });
  }
}

/** Delete every toolchain cache. */
export async function remove() {
  for (const name of await caches.keys()) {
    if (name.startsWith(cachePrefix)) await caches.delete(name);
  }
  set({ state: status.available ? "missing" : "offline", installed: null });
}
