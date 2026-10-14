// Wiring. Everything app-shaped lives here in the open, rather than behind a
// lib -- this is the file you edit first, so it should be readable top to
// bottom with no indirection.

import { syncAppHeight } from "./lib/viewport.js";
import { theme, font, tab, shortcutsPref, downloadPref, fileTab, paneTab, iosWarned, units, results } from "./state.js";
import * as toolchain from "./lib/toolchain.js";
import { GoWorker } from "./lib/go.js";
import { nameProblem, template, filesOf, hashOf, statusOf } from "./lib/units.js";
import { lineColAt, offsetAt, newline, dedent } from "./lib/editor.js";
import { Tabs } from "./components/tabs.js";
import { UnitList } from "./components/unit-list.js";
import { DownloadCard } from "./components/download-card.js";
import { DocView } from "./components/doc-view.js";
import { UpdateToast } from "./components/update-toast.js";

customElements.define("go-tabs", Tabs);
customElements.define("unit-list", UnitList);
customElements.define("download-card", DownloadCard);
customElements.define("doc-view", DocView);
customElements.define("update-toast", UpdateToast);

/** @template {HTMLElement} T @param {string} id @returns {T} */
const byId = (id) => /** @type {T} */ (document.getElementById(id));

/** Tokens the phone keyboard buries. Not snippets: you add those yourself, in Options. */
const DEFAULT_SHORTCUTS = ["err != nil", "!=", "==", "&&", "||", "<-", '""', "`"];
/** A run still going after this is stopped (infinite loop, deadlock). ?runlimit=ms overrides, for tests. */
const RUN_LIMIT_MS = Number(new URLSearchParams(location.search).get("runlimit")) || 30_000;
/** Pause after typing before the checker looks. */
const CHECK_DELAY_MS = 400;

// ---- units ----------------------------------------------------------------
// A unit record's items are its two files, {kind: "go"|"test", src}.

/**
 * @typedef {import("./lib/store.js").StoredRecord} Unit
 * @typedef {import("./lib/units.js").Results} Results
 * @typedef {import("./lib/go.js").CheckResult} CheckResult
 * @typedef {import("./lib/go.js").Diagnostic} Diagnostic
 */

/** @returns {Unit|null} */
const openUnit = () => {
  const id = units.getActiveId();
  return (id && units.get(id)) || null;
};
/** @param {Unit} u @param {"go"|"test"} kind */
const fileItem = (u, kind) => u.items.find((i) => i.kind === kind);
/** @param {Unit} u */
const srcOf = (u) => ({ go: fileItem(u, "go")?.src ?? "", test: fileItem(u, "test")?.src ?? "" });
/** @param {Unit} u @param {"go"|"test"} kind */
const fileName = (u, kind) => (kind === "go" ? `${u.name}.go` : `${u.name}_test.go`);

/** @returns {Record<string, Results>} */
const allResults = () => {
  try {
    return JSON.parse(results.get());
  } catch {
    return {};
  }
};
/** @param {string} id @param {Partial<Results>} patch */
const saveResults = (id, patch) => {
  const all = allResults();
  all[id] = { ...all[id], ...patch };
  results.set(JSON.stringify(all));
};

const unitList = /** @type {UnitList} */ (byId("unit-list"));
const paintUnits = () => {
  const r = allResults();
  unitList.units = units.getAll().map((u) => ({
    id: u.id,
    name: u.name,
    updatedAt: u.updatedAt,
    status: statusOf(r[u.id], hashOf(srcOf(u))),
  }));
  unitList.activeId = units.getActiveId();
};

unitList.addEventListener("open", (e) => {
  units.setActive(/** @type {CustomEvent<string>} */ (e).detail);
  tab.set("code");
});

const newUnitForm = /** @type {HTMLFormElement} */ (byId("new-unit-form"));
const newUnitName = /** @type {HTMLInputElement} */ (byId("new-unit-name"));
const newUnitError = byId("new-unit-error");
newUnitForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = newUnitName.value.trim();
  const problem = nameProblem(
    name,
    units.getAll().map((u) => u.name)
  );
  newUnitError.hidden = !problem;
  newUnitError.textContent = problem && `Can't use “${name}”: ${problem}.`;
  if (problem) return;
  const u = units.create(name);
  const t = template(name);
  units.append(u.id, { kind: "go", src: t.go });
  units.append(u.id, { kind: "test", src: t.test });
  units.setActive(u.id);
  newUnitName.value = "";
  fileTab.set("test"); // tests first
  tab.set("code");
});

// ---- editor ---------------------------------------------------------------

const editor = /** @type {HTMLTextAreaElement} */ (byId("editor"));
const caretPos = byId("caret-pos");
const codePanel = /** @type {HTMLElement} */ (document.querySelector(".code-panel"));

/** @returns {"go"|"test"} */
const currentKind = () => (fileTab.get() === "go" ? "go" : "test");

/** Caret position per unit file, so switching files comes back to the same place. */
/** @type {Map<string, number>} */
const caretMemory = new Map();

/** Show the open unit's current file. Only when the unit or file changes, never while typing. */
let shownKey = "";
const showFile = () => {
  const u = openUnit();
  codePanel.classList.toggle("empty", !u);
  if (!u) {
    shownKey = "";
    return;
  }
  for (const kind of /** @type {const} */ (["go", "test"])) {
    const b = byId(`file-${kind}`);
    b.textContent = fileName(u, kind);
    b.setAttribute("aria-selected", String(currentKind() === kind));
  }
  const key = u.id + ":" + currentKind();
  const src = fileItem(u, currentKind())?.src ?? "";
  if (key === shownKey) {
    // Typing saves editor -> store, so they match; a change from elsewhere
    // (a new unit's files arriving, gofmt) is shown with the caret kept.
    if (src !== editor.value) {
      const at = Math.min(editor.selectionStart, src.length);
      editor.value = src;
      editor.setSelectionRange(at, at);
    }
    return;
  }
  if (shownKey) caretMemory.set(shownKey, editor.selectionStart);
  shownKey = key;
  editor.value = src;
  const at = caretMemory.get(key) ?? 0;
  editor.setSelectionRange(at, at);
  showCaret();
  scheduleCheck(0);
};

const save = () => {
  const u = openUnit();
  const item = u && fileItem(u, currentKind());
  if (!u || !item || item.src === editor.value) return;
  units.updateItem(u.id, item.id, { src: editor.value });
};

function showCaret() {
  const { line, col } = lineColAt(editor.value, editor.selectionStart);
  caretPos.textContent = `${line}:${col}`;
}

editor.addEventListener("input", () => {
  save();
  scheduleCheck(CHECK_DELAY_MS);
});
for (const ev of ["keyup", "click", "select", "focus"]) editor.addEventListener(ev, showCaret);

/** Replace the selection, as typing would (so it's undoable where supported). */
/** @param {string} text @param {number} [caret] caret offset within text; default after it */
const insert = (text, caret = text.length) => {
  const start = editor.selectionStart;
  editor.focus();
  if (!document.execCommand?.("insertText", false, text)) {
    editor.setRangeText(text, start, editor.selectionEnd, "end");
  }
  editor.setSelectionRange(start + caret, start + caret);
  save();
  showCaret();
  scheduleCheck(CHECK_DELAY_MS);
};

editor.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.altKey || e.metaKey;
  if (e.key === "Enter" && mod) {
    e.preventDefault();
    runTests();
  } else if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const nl = newline(editor.value, editor.selectionStart, editor.selectionEnd);
    insert(nl.insert, nl.caret);
  } else if (e.key === "Tab" && !mod) {
    e.preventDefault();
    if (e.shiftKey) {
      const at = editor.selectionStart;
      const d = dedent(editor.value, at);
      if (!d.removed) return;
      editor.value = d.text;
      const to = Math.max(d.lineStart, at - d.removed);
      editor.setSelectionRange(to, to);
      save();
      scheduleCheck(CHECK_DELAY_MS);
    } else insert("\t");
  } else if ((e.ctrlKey && e.key === "s") || (e.altKey && e.key === "f")) {
    e.preventDefault();
    formatNow();
  } else if (e.altKey && (e.key === "1" || e.key === "2")) {
    e.preventDefault();
    fileTab.set(e.key === "1" ? "go" : "test");
  }
});

byId("file-go").addEventListener("click", () => fileTab.set("go"));
byId("file-test").addEventListener("click", () => fileTab.set("test"));

// Key row. Tapping a key would move focus off the textarea and drop the
// keyboard, so keep it there.
byId("key-row").addEventListener("pointerdown", (e) => e.preventDefault());
byId("key-row").addEventListener("click", (e) => {
  const b = /** @type {HTMLElement} */ (e.target).closest("button[data-ins]");
  if (b instanceof HTMLElement) insert(b.dataset.ins ?? "");
});
for (const id of ["fmt-btn", "run-btn"]) byId(id).addEventListener("pointerdown", (e) => e.preventDefault());

const shortcutsDialog = /** @type {HTMLDialogElement} */ (byId("shortcuts-dialog"));
const shortcutsList = byId("shortcuts-list");
const shortcutsField = /** @type {HTMLInputElement} */ (byId("shortcuts-field"));
shortcutsField.placeholder = DEFAULT_SHORTCUTS.join(", ");
shortcutsField.addEventListener("input", () => shortcutsPref.set(shortcutsField.value));
shortcutsPref.subscribe((v) => {
  if (shortcutsField.value !== v) shortcutsField.value = v;
  const custom = v.split(",").map((c) => c.trim()).filter(Boolean);
  shortcutsList.replaceChildren(
    ...(custom.length ? custom : DEFAULT_SHORTCUTS).map((text) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "command-item";
      b.textContent = text;
      b.addEventListener("click", () => {
        shortcutsDialog.close();
        insert(text);
      });
      return b;
    })
  );
});
byId("shortcuts-btn").addEventListener("click", () => shortcutsDialog.showModal());

// ---- the Go worker --------------------------------------------------------

/** @type {GoWorker|null} */
let go = null;
let goFor = "";

/** Start (or restart, on a new version) the worker once a toolchain is installed. */
/** @param {import("./lib/toolchain.js").Status} s */
function onToolchain(s) {
  const m = s.installed;
  if (!m || goFor === m.go) return paintRunState();
  go?.terminate();
  go = new GoWorker(toolchain.cacheName(m), m);
  goFor = m.go;
  go.ready.then(
    () => {
      paintRunState();
      scheduleCheck(0);
    },
    (/** @type {Error} */ err) => {
      setPaneStatus(`toolchain failed to load: ${err.message}`, "error");
      go = null;
      goFor = "";
    }
  );
  paintRunState();
}

let running = false;
function paintRunState() {
  const ready = Boolean(go) && toolchain.get().installed !== null;
  /** @type {HTMLButtonElement} */ (byId("run-btn")).disabled = !ready || running || !openUnit();
  /** @type {HTMLButtonElement} */ (byId("fmt-btn")).disabled = !ready || !openUnit();
  const m = toolchain.get().installed;
  byId("toolchain-info").textContent = m
    ? `${m.go}, ${(m.bytes / 1048576).toFixed(0)}MB on this device.`
    : "Not downloaded.";
  /** @type {HTMLButtonElement} */ (byId("toolchain-delete-btn")).disabled = !m;
}

// ---- checking -------------------------------------------------------------

/** @type {CheckResult|null} the latest check, for the code as it was then */
let lastCheck = null;
let lastCheckHash = "";
/** @type {ReturnType<typeof setTimeout>|undefined} */
let checkTimer;
let checkSeq = 0;

/** @param {number} delay */
function scheduleCheck(delay) {
  clearTimeout(checkTimer);
  checkTimer = setTimeout(checkNow, delay);
}

/** Check the open unit; resolves with the result, or null if there's nothing to check. */
async function checkNow() {
  const u = openUnit();
  if (!u || !go) return null;
  const src = srcOf(u);
  const seq = ++checkSeq;
  const r = await go.check(u.name, filesOf(u.name, src));
  if (r.error) {
    if (r.error !== "restarted" && seq === checkSeq) setPaneStatus(`checker: ${r.error}`, "error");
    return null;
  }
  if (seq !== checkSeq || openUnit()?.id !== u.id) return r; // stale for display
  lastCheck = r;
  lastCheckHash = hashOf(src);
  const gofmt = Object.entries(filesOf(u.name, src)).every(([n, s]) => r.formatted[n] === s);
  saveResults(u.id, { check: { hash: lastCheckHash, problems: r.diagnostics.length, gofmt } });
  paintProblems(u, r, gofmt);
  return r;
}

const problemsEl = byId("problems");
/** @param {Unit} u @param {CheckResult} r @param {boolean} gofmt */
function paintProblems(u, r, gofmt) {
  const n = r.diagnostics.length;
  byId("pane-problems").textContent = n ? `Problems (${n})` : "Problems";
  byId("pane-problems").classList.toggle("has-problems", n > 0);
  /** @param {string} tag @param {string} cls @param {string} text */
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    e.className = cls;
    e.textContent = text;
    return e;
  };
  /** @type {HTMLElement[]} */
  const rows = r.diagnostics.map((d) => {
    const b = /** @type {HTMLButtonElement} */ (el("button", `problem ${d.source}`, ""));
    b.type = "button";
    b.append(el("span", "where", `${d.file}:${d.line}:${d.col}`), el("span", "msg", d.msg));
    if (d.source === "vet") b.append(el("span", "tag", "vet"));
    b.addEventListener("click", () => jumpTo(u, d));
    return b;
  });
  if (n === 0) rows.push(el("p", "hint", gofmt ? "No problems." : "No problems. Not gofmt'd yet."));
  if (n === 0 && r.tests.length === 0) rows.push(el("p", "hint", `No tests found in ${u.name}_test.go.`));
  problemsEl.replaceChildren(...rows);
}

/** @param {Unit} u @param {Diagnostic} d */
function jumpTo(u, d) {
  fileTab.set(d.file === `${u.name}.go` ? "go" : "test");
  const at = offsetAt(editor.value, d.line, d.col);
  editor.focus();
  editor.setSelectionRange(at, at);
  // Bring the line into view: the textarea has no API for it.
  const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 20;
  editor.scrollTop = Math.max(0, (d.line - 3) * lineHeight);
  showCaret();
}

// ---- gofmt ----------------------------------------------------------------

/**
 * Replace both files with their gofmt'd versions (when they parse), keeping
 * the caret on the same line. Returns the check it used.
 */
async function formatNow() {
  const u = openUnit();
  if (!u || !go) return null;
  const r = await checkNow();
  if (!r) return null;
  const files = filesOf(u.name, srcOf(u));
  let changed = false;
  for (const kind of /** @type {const} */ (["go", "test"])) {
    const name = fileName(u, kind);
    const formatted = r.formatted[name];
    const item = fileItem(u, kind);
    if (formatted === undefined || !item || formatted === files[name]) continue;
    changed = true;
    if (kind === currentKind()) {
      const { line } = lineColAt(editor.value, editor.selectionStart);
      editor.value = formatted;
      const at = offsetAt(formatted, line, 1) + (formatted.slice(offsetAt(formatted, line, 1)).match(/^\t*/)?.[0].length ?? 0);
      editor.setSelectionRange(at, at);
    }
    units.updateItem(u.id, item.id, { src: formatted });
  }
  return changed ? checkNow() : r;
}
byId("fmt-btn").addEventListener("click", formatNow);

// ---- running tests --------------------------------------------------------

const outputEl = byId("run-output");

/** @param {string} line */
const lineClass = (line) =>
  /^(--- FAIL|FAIL|panic:|fatal error:)/.test(line.trim())
    ? "fail"
    : /^(--- PASS|PASS$|ok\b)/.test(line.trim())
      ? "pass"
      : /^(=== RUN|=== PAUSE|=== CONT)/.test(line)
        ? "dim"
        : "";

/** @param {string} text @param {string} [cls] */
function outLine(text, cls = lineClass(text)) {
  const div = document.createElement("div");
  div.className = "out-line " + cls;
  div.textContent = text;
  outputEl.append(div);
}

/** @param {string} text @param {string} [cls] */
function setPaneStatus(text, cls = "") {
  const el = byId("pane-status");
  el.textContent = text;
  el.className = "pane-status " + cls;
}

async function runTests() {
  const u = openUnit();
  if (!u || !go || running) return;
  running = true;
  paintRunState();
  paneTab.set("output");
  outputEl.replaceChildren();
  setPaneStatus("checking…");
  try {
    // gofmt on save: running is when the code is "saved" as a whole.
    const r = await formatNow();
    if (!r) return;
    const blocking = r.diagnostics.filter((d) => d.source !== "vet");
    if (blocking.length) {
      setPaneStatus(`${blocking.length} problem${blocking.length > 1 ? "s" : ""}: fix before running`, "fail");
      paneTab.set("problems");
      return;
    }
    const fresh = /** @type {Unit} */ (openUnit());
    const src = srcOf(fresh);
    setPaneStatus("compiling…");
    const res = await go.run(
      { pkg: fresh.name, files: filesOf(fresh.name, src), tests: r.tests, hasTestMain: r.hasTestMain },
      (stream, line) => {
        if (stream === "build") setPaneStatus("building…");
        else setPaneStatus("running…");
        outLine(line);
        outputEl.scrollTop = outputEl.scrollHeight;
      },
      RUN_LIMIT_MS
    );
    if (res.timedOut) {
      outLine(`stopped after ${RUN_LIMIT_MS / 1000}s: an infinite loop, or a deadlock Go couldn't detect?`, "fail");
      setPaneStatus("stopped", "fail");
    } else if (res.phase !== "test") {
      setPaneStatus(`${res.phase} failed`, "fail");
    } else {
      const total = Object.values(res.ms).reduce((a, b) => a + b, 0);
      setPaneStatus(`${res.ok ? "PASS" : "FAIL"} in ${(total / 1000).toFixed(1)}s`, res.ok ? "pass" : "fail");
    }
    saveResults(fresh.id, { run: { hash: hashOf(src), ok: res.ok && !res.timedOut && res.phase === "test", at: Date.now() } });
  } finally {
    running = false;
    paintRunState();
  }
}
byId("run-btn").addEventListener("click", runTests);

// ---- the pane under the editor --------------------------------------------

paneTab.subscribe((v) => {
  byId("pane").classList.toggle("closed", v === "closed");
  for (const which of ["problems", "output"]) {
    byId(`pane-${which}`).setAttribute("aria-selected", String(v === which));
    /** @type {HTMLElement} */ (document.querySelector(`[data-pane-body="${which}"]`)).hidden = v !== which;
  }
  byId("pane-toggle").textContent = v === "closed" ? "▴" : "▾";
});
let lastOpenPane = paneTab.get() === "closed" ? "problems" : paneTab.get();
byId("pane-problems").addEventListener("click", () => paneTab.set((lastOpenPane = "problems")));
byId("pane-output").addEventListener("click", () => paneTab.set((lastOpenPane = "output")));
byId("pane-toggle").addEventListener("click", () => paneTab.set(paneTab.get() === "closed" ? lastOpenPane : "closed"));

// ---- unit actions: share, copy, delete --------------------------------------

const unitDialog = /** @type {HTMLDialogElement} */ (byId("unit-dialog"));
byId("unit-menu-btn").addEventListener("click", () => {
  const u = openUnit();
  if (!u) return;
  byId("unit-dialog-title").textContent = `package ${u.name}`;
  byId("share-btn").hidden = !navigator.canShare?.({ files: [new File([""], "x.go", { type: "text/plain" })] });
  unitDialog.showModal();
});

byId("share-btn").addEventListener("click", async () => {
  const u = openUnit();
  if (!u) return;
  const files = Object.entries(filesOf(u.name, srcOf(u))).map(([n, s]) => new File([s], n, { type: "text/plain" }));
  try {
    await navigator.share({ files, title: `package ${u.name}` });
    unitDialog.close();
  } catch {
    /* cancelled */
  }
});

byId("copy-btn").addEventListener("click", (e) => {
  const u = openUnit();
  if (!u) return;
  const text = Object.entries(filesOf(u.name, srcOf(u)))
    .map(([n, s]) => `// ==== ${n} ====\n${s}`)
    .join("\n");
  copyText(text, /** @type {HTMLElement} */ (e.currentTarget));
});

byId("delete-btn").addEventListener("click", () => {
  const u = openUnit();
  if (!u || !confirm(`Delete package ${u.name}? This can't be undone.`)) return;
  units.remove(u.id);
  const all = allResults();
  delete all[u.id];
  results.set(JSON.stringify(all));
  unitDialog.close();
  tab.set("units");
});

/**
 * Copy, then flash ✓ or ✕ on the button. The fallback covers pages without the
 * async Clipboard API, e.g. served over plain http to a phone on the LAN.
 * @param {string} text
 * @param {HTMLElement} btn
 */
function copyText(text, btn) {
  const flash = (/** @type {boolean} */ ok) => {
    const original = btn.textContent;
    btn.textContent = ok ? "Copied ✓" : "Couldn't copy ✕";
    setTimeout(() => (btn.textContent = original), 1200);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => flash(true), () => flash(false));
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.append(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {}
  ta.remove();
  flash(ok);
}

// ---- docs -----------------------------------------------------------------

/** @returns {DocView|null} */
const activeDoc = () => document.querySelector(".panel.active doc-view");
const docIndexBtn = byId("doc-index-btn");
const docIndexDialog = /** @type {HTMLDialogElement} */ (byId("doc-index-dialog"));
const docIndexList = byId("doc-index-list");
docIndexBtn.addEventListener("click", () => {
  const doc = activeDoc();
  const items = doc?.headings ?? [];
  docIndexList.replaceChildren(
    ...items.map((item) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `doc-index-item level-${item.level}`;
      b.textContent = item.text;
      b.addEventListener("click", () => {
        // Long docs: jump, don't smooth-scroll the whole way.
        doc?.querySelector("#" + CSS.escape(item.id))?.scrollIntoView({ block: "start" });
        docIndexDialog.close();
      });
      return b;
    })
  );
  if (items.length === 0) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = "No sections found.";
    docIndexList.append(p);
  }
  docIndexDialog.showModal();
});

// ---- toolchain ------------------------------------------------------------

byId("download-card").addEventListener("wait-wifi", () => {
  downloadPref.set("wifi");
  toolchain.waitForWifi();
});
byId("toolchain-delete-btn").addEventListener("click", async () => {
  if (!confirm("Delete the Go toolchain from this device? You'll need to download it again to check or run tests.")) return;
  go?.terminate();
  go = null;
  goFor = "";
  await toolchain.remove();
});

// Compiling and linking need ~100MB of wasm memory; iOS Safari may not allow it.
// pizza2go targets Android Chrome, so this only warns, once.
const iOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
if (iOS && !iosWarned.get()) {
  iosWarned.set("1");
  setPaneStatus("Heads up: on iOS, compiling may run out of memory and fail.", "fail");
}

// ---- start ------------------------------------------------------------------
// Subscribers run once right away, so they're attached here, after everything
// they call is defined.

units.subscribe(paintUnits);
results.subscribe(paintUnits);
units.subscribe(showFile);
fileTab.subscribe(showFile);
units.subscribe(paintRunState);
toolchain.subscribe(onToolchain);
toolchain.start({ pref: downloadPref.get() === "wifi" ? "wifi" : "ask" });

// ---- shell glue -----------------------------------------------------------

theme.subscribe((v) => {
  document.documentElement.setAttribute("data-theme", v);
  syncChecked("[data-set-theme]", "data-set-theme", v);
});

font.subscribe((v) => {
  document.documentElement.setAttribute("data-font", v);
  syncChecked("[data-set-font]", "data-set-font", v);
});

tab.subscribe((v) => {
  document.querySelectorAll(".panel").forEach((p) => {
    p.classList.toggle("active", p.getAttribute("data-panel") === v);
  });
  document.querySelectorAll("go-tabs [data-tab]").forEach((b) => {
    const on = b.getAttribute("data-tab") === v;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", String(on));
  });
  const doc = activeDoc();
  doc?.load();
  docIndexBtn.hidden = !doc;
});

/**
 * @param {string} selector
 * @param {string} attr
 * @param {string} value
 */
function syncChecked(selector, attr, value) {
  document.querySelectorAll(selector).forEach((b) => {
    b.setAttribute("aria-checked", String(b.getAttribute(attr) === value));
  });
}

document.addEventListener("click", (e) => {
  const el = e.target instanceof Element ? e.target : null;
  if (!el) return;
  const t = el.closest("[data-set-theme]");
  if (t) theme.set(t.getAttribute("data-set-theme") ?? "dusk");
  const f = el.closest("[data-set-font]");
  if (f) font.set(f.getAttribute("data-set-font") ?? "mono");
  if (el.closest("[data-close]")) el.closest("dialog")?.close();
});

const settings = /** @type {HTMLDialogElement} */ (byId("settings-dialog"));
byId("settings-btn").addEventListener("click", () => settings.showModal());

// Share: the QR page (misc/qr/) encodes whatever ?q= holds.
const shareLink = /** @type {HTMLAnchorElement | null} */ (document.getElementById("share-link"));
if (shareLink) shareLink.search = new URLSearchParams({ q: new URL(".", location.href).href }).toString();

// ---- phone ----------------------------------------------------------------

syncAppHeight();

// ---- offline --------------------------------------------------------------

if ("serviceWorker" in navigator) {
  const register = () =>
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* not fatal -- the app still works, it just won't survive the subway */
    });

  // Not simply addEventListener("load", ...). Any top-level await in this
  // module defers the rest of its body past the load event, so a load listener
  // registered here would never fire and offline would silently never work.
  // Check readyState first and this stays correct either way.
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });

  // Updates: the toast checks for them on every launch and resume. Edits save
  // as you type, so reloading never loses work -- unless a run is going.
  const toast = new UpdateToast();
  toast.idle = () => !running;
  document.body.append(toast);
}
