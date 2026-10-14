# pizza2go — spec

An offline PWA for writing small Go packages on an Android phone (with a Clicks keyboard) against tests you wrote yourself, then exporting them unchanged into real modules at home. Built on [pizza-starter](https://github.com/devp/psychic-meme/tree/main/pizza-starter).

## Decisions

- **Real Go toolchain in the browser.** `cmd/compile` + `cmd/link` built for `GOOS=wasip1`, running in Web Workers against an in-memory filesystem. Rejected: TinyGo (it compiles *to* wasm and can't run *in* it, because of LLVM), Yaegi and GopherJS (each teaches a dialect of Go).
- **Unit = one real package.** `package <name>`, `<name>.go` + `<name>_test.go`, stdlib only. A unit is done when its tests pass, `go vet` is clean, and the code is gofmt'd.
- **Writing is mechanical on purpose.** gofmt on save, live type errors, keybindings. No autocomplete and no snippets.
- **Hosting:** `https://pizza2go.dzza.workers.dev`, Cloudflare Workers static assets, deployed from `public/` by `.github/workflows/deploy.yml` on push to main (same setup as psychic-meme; PRs get a `--dry-run`). It gets its own origin so its large caches and possible eviction can't take down the other pizza apps' data.
- **Stdlib only.** There's no `go` command in the browser, so no module resolution.

## Goals this serves

- Fluency writing Go by hand: `testing` idioms, errors, interfaces, generics.
- Code you can export: units drop into home projects without edits.
- Supports the home-side goal: a real Go project for the resume (see the export CLI under Later).

## Architecture

### Build time (desktop, per Go version)

- `GOOS=wasip1 GOARCH=wasm go build cmd/compile` → `compile.wasm`. Same for `cmd/link` → `link.wasm`.
- Stdlib archives for the target: `GOOS=wasip1 GOARCH=wasm go list -export -deps -f '{{.ImportPath}}={{.Export}}' <allowlist>`. Copy them to `std/` and write an `importcfg` (`packagefile path=/std/...`).
- `checker.wasm`: our own Go program using `go/parser`, `go/types`, `go/format`, `go/ast`, plus a subset of `x/tools/go/analysis` vet passes.
- Everything is versioned by Go version, e.g. `toolchain/go1.25.x/`. The Go version is pinned per toolchain release, and a manifest (`toolchain/manifest.json`: Go version, file list, hashes) is the single source of truth for what's current.

### Run time

| Worker | Lifetime | Job |
|---|---|---|
| checker | long-lived | `check(files)` → diagnostics JSON; `format(src)`; `tests(src)` → list of Test/Benchmark/Example funcs |
| runner | one per run, `terminate()`d on timeout | compile → generate testmain → compile → link → run `test.wasm -test.v` |

Runner pipeline (one fresh WASI instance per tool invocation; the `WebAssembly.Module` is compiled once per session):

1. `compile -p <name> -importcfg /importcfg -o /out/<name>.a /src/<name>.go /src/<name>_test.go`
2. Write `/src/_testmain.go` (`package main`, calls `testing.MainStart`) from the checker's test list, then `compile -p main …`
3. `link -importcfg /importcfg -o /out/test.wasm /out/main.a` (importcfg plus `packagefile <name>=/out/<name>.a`)
4. Run `test.wasm` and stream stdout/stderr to the UI.

WASI shim: `@bjorn3/browser_wasi_shim` (or equivalent), vendored.

### Known limits

- Single-threaded: goroutines work, but there's no parallelism and no `-race`.
- No network or real OS. `net/*` (including `httptest`) is out of the allowlist.
- Infinite loops are caught only by the runner timeout.

### Editor

CodeMirror 6, vendored, mounted inside a Lit element. Go language mode via `@codemirror/lang-go` (confirm it exists before relying on it). The lint gutter is fed by the checker. Keymap: run tests, format, switch file, new unit.

## Offline and storage

- The toolchain gets its own Cache Storage cache, fetched once. It's left **out** of the starter's refetch-everything `ASSETS` list (`sw-assets.js`): tens of MB redownloaded on every launch isn't viable.
- **Cache name:** outside the starter's `PREFIX` (`scope + " "`), e.g. `scope + "#toolchain go<version>"`. The starter's `sw.js` deletes every `PREFIX` cache except its own on `activate`, so a `PREFIX` name would be wiped on every app update. This avoids changing the shared `sw.js`.
- The app reads toolchain files straight from that cache (`caches.open(...).match(...)`), not through the service worker's `fetch` handler.
- **Asking before the first download.** Nothing large downloads until the user says so; the app shell is ~200KB. Until the toolchain is cached, a card takes the place of Run and shows the download size, with **Download now** and **Wait for Wi-Fi**:
  - *Wait for Wi-Fi* is remembered, and starts the download by itself when `navigator.connection.type` becomes `"wifi"` while the app is open (Chrome on Android). Where the browser doesn't report the connection type, the second button is a plain **Later**.
  - If `navigator.connection.saveData` is on, *Wait for Wi-Fi* is the default.
  - All-or-nothing: the toolchain is usable only once every file in the manifest is cached. Files that finished survive an interruption, so a retry fetches only the rest. Progress shows while downloading. Downloads run only while the app is open (no Background Fetch in v1).
  - The same card, with the same two choices, is used for toolchain updates (below). Writing code works without the toolchain; checking and running don't.
- **Download size:** ~14MB if Cloudflare serves the `.wasm` and `.a` files brotli-compressed, ~100MB if not. Not yet verified (this needs a look at the Network tab on the deployed site); the card shows whichever is true, from sizes in the manifest.
- **Toolchain updates ride the normal site-update detection.** The manifest is small and goes in the starter's `ASSETS` list, so the refetch on launch/resume picks up a version change. When the manifest's Go version differs from the cached one, the download card offers the update (Download now / Wait for Wi-Fi). The old toolchain keeps working until the new cache is complete; then the app switches and deletes the old one. No separate update button.
- Units go in IndexedDB (or OPFS), not localStorage.
- Call `navigator.storage.persist()` on first run (before the toolchain download).
- Everything under `public/` deploys, so `public/.assetsignore` keeps dev-only files (`package.json`, `tests/`, `scripts/`, `justfile`, ...) out of the deploy.

## Docs (vendored, offline)

| Source | Use | License (verify before vendoring) |
|---|---|---|
| Go by Example | concept lookup | CC BY 3.0 |
| A Tour of Go | curriculum, unit seeds | BSD-style |
| Effective Go, language spec | idioms, ground truth | Go website terms |
| Go Code Review Comments | review checklist | Go wiki |
| `go doc -all` for ~20 core packages | API reference | BSD |

## Export

- v1: Web Share API with both files, or copy.
- Later: sync over remoteStorage (planned direction for pizza apps), plus a Go CLI at home that pulls units into a module and runs `go test ./...`.

## Spike (first)

Desktop numbers below are from headless Chromium (Playwright build 1194, V8) on a 4-core Linux VM, Go 1.24.7, with `@bjorn3/browser_wasi_shim` 0.4.2 over an in-memory filesystem; everything is served from localhost, so fetch times are optimistic. The deployed spike at `/spike/` was run on desktop Chrome and on a Pixel 8a in Android Chrome (the target device). iOS is not a target. Running it: `spike/build.sh <outdir>` builds the toolchain, and `node spike/run.mjs <outdir>` runs the harness in headless Chromium (needs `playwright-core`).

| Metric | Desktop Chromium (headless, my VM) | Deployed spike, desktop Chrome | Deployed spike, Pixel 8a, Android Chrome |
|---|---|---|---|
| `cmd/compile` builds and runs on wasip1 at all | Yes. Compile, link, and run of a package with 3 tests passes (`-test.v` output correct). | Yes, same result: 3 tests pass | Yes: 3 tests pass |
| Size: compile.wasm / link.wasm / std archives (raw, gzip, brotli) | compile 38.5 / 8.1 / 5.3 MB; link 10.1 / 2.7 / 1.9 MB; std (135 archives, full allowlist) 42.8 / 9.9 / 7.1 MB (brotli q9). Total ≈ 14.3MB brotli | Same toolchain files, but built by CI with the latest Go 1.24.x: compile 40.7MB, link 10.6MB, std 47.0MB (138 files), checker 9.0MB raw | Same files as the desktop Chrome column |
| Cold load: fetch + `compileStreaming` for each tool | compile 195ms, link 88ms, checker 68ms, std 381ms (all localhost, uncompressed; used `compile(bytes)`, not streaming) | compile fetch 1029ms + compile 34ms; link 454ms; std 976ms; checker 181ms (over the real Cloudflare deploy, before caching) | compile fetch 3.9s + compile 82ms; link 334ms; std 5.6s; checker 327ms. About 10s of downloading in total, before any caching (network unknown) |
| Warm compile+link+run, hello package with 3 tests | First run 2.5s (V8 tier-up), then 1.0s, then 0.5-0.6s: compile pkg ~70ms, compile main ~80-140ms, link ~350-650ms, run ~25ms | First run 452ms, warm 208-214ms (compile pkg 20-28, compile main ~29, link 140-153, run 2-14) | First run 2.1s (compile pkg 777, compile main 242, link 961, run 77). Warm 0.70-0.79s (link 447-502, compile pkg 70-105, compile main ~120, run ~48) |
| Peak memory during link | link instance's wasm memory ended at 104MB (compile: 24-28MB); JS heap ~190MB. That's a lower bound on peak, since the JS-side file copies are on top | link wasm memory 100MB (compile 24-28MB); JS heap 77-116MB | link wasm memory 100MB (compile 24-28MB); JS heap 78MB. No out-of-memory failures |
| checker.wasm size, and `check()` latency on a 100-line file | 9.0MB raw; 117-line file parse + typecheck (against std export data) + format: 150ms cold, 26-31ms warm. It reported the seeded type error at the right line/col | 53ms cold, 7-8ms warm; same diagnostic at the same line/col | 264ms cold, 23-27ms warm; same diagnostic at the same line/col |

Findings:

- **The std archives dominate, and the allowlist is almost free.** `fmt` + `testing` alone pull in 37.6MB of the 44.9MB total (the runtime and reflect). Everything else in the allowlist adds 7.3MB raw: `text/template` +2.6MB, `math/big` +1.4MB, `log/slog` +1.2MB, `image` +0.7MB; `regexp`, `encoding/json` and `crypto/sha256` cost nothing extra because `testing` already imports them. So the "only if the spike shows room" tier stays in.
- **Link is the cost:** ~60% of warm time, and it needs the most memory.
- **Node's built-in WASI crashes (segfault) when linking anything bigger than a `println` program.** The same `link.wasm` works in Chromium. Not a problem for us, but desktop tests of the pipeline must run in a browser, not Node.
- **Test packages:** this harness compiles `<name>.go` and `<name>_test.go` into one package, which handles in-package tests only. An external `package foo_test` file would need a second compile; handle that when building the runner.
- **testmain** imports `testing/internal/testdeps` (a `go list` dependency we have to add to the export list; `build.sh` does).
- **Not measured:** vet passes (`x/tools/go/analysis`) and the `tests()` listing in the checker. `check()` and `format()` are done.
- The shim's `poll_oneoff` busy-waits, and its in-memory files reallocate on every growing write. Both are fine for the spike, but watch them if the linker's output writes get slow on the phone.
- **Android works.** On the Pixel 8a, compile+link+run of the hello package takes 2.1s the first time and about 0.7s after. Link uses 100MB of wasm memory with no failures. The checker answers in about 25ms warm, which is fine for live diagnostics. The cost is the first-run download (~100MB, about 10s on this connection), which makes the one-time cache and `persist()` from Offline and storage necessary.

The fallback of shipping the checker only is not needed: compile+link is fast enough on the Pixel 8a.

## Open questions

- **Editor.** CodeMirror 6 with a lint gutter (as planned), or the pizza-repl textarea + key row with diagnostics as a tappable list under the editor? Recommendation: the textarea + key row first (proven on the Pixel + Clicks, nearly free to borrow), CodeMirror only if that feels thin.
- **Unit storage.** IndexedDB (as planned) or the starter's `lib/store.js` (localStorage)? Units are a few KB of text each. Recommendation: localStorage for v1; the toolchain is in Cache Storage either way.
- **Go version.** CI builds the latest 1.24.x (from `spike/checker/go.mod`); this spec said 1.25. Recommendation: pin the newest stable release, recorded in `toolchain/manifest.json`.

## Resolved

- **Go version pinning:** pinned per toolchain release; updates are detected through the manifest and the normal site-update flow (see Offline and storage).
- **Starter provenance:** by the time this is scaffolded, pizza-starter will support setting up into other directories, so we scaffold into this repo with `just new-app`-style tooling and keep the `STARTER` stamp. No hand-copying, and the app doesn't move into psychic-meme.
- **iOS Safari memory cap:** not a target. The device is a Pixel 8a (Android Chrome), where link used 100MB without trouble, and iOS has not been tested. Keep the one-time toast for first-time iOS Safari users (compiling and linking may run out of memory there and may fail) as a low-priority nicety, in case the app gets shared. Don't build anything more elaborate.

## Stdlib allowlist

Basis: what Go by Example, A Tour of Go, and Effective Go actually import. `go list -deps` pulls in transitive deps, so `fmt` already brings `reflect`, `strconv`, `sort`, `unicode`, `os`, and `sync`; the cost of most extras is small. The list is committed as `toolchain/allowlist.txt` (one import path per line, tiers as comments) and is the input to the build step. All four tiers are in: the spike showed the whole list adds only 7.3MB raw over `fmt` + `testing` alone.

- **Core (always):** `fmt`, `errors`, `strings`, `strconv`, `sort`, `slices`, `maps`, `cmp`, `iter`, `math`, `math/rand`, `unicode`, `unicode/utf8`, `bytes`, `io`, `bufio`, `os`, `time`, `testing`
- **Concurrency (Tour, Go by Example):** `sync`, `sync/atomic`, `context`
- **Common in tutorials, modest size:** `regexp`, `encoding/json`, `container/heap`, `container/list`, `text/tabwriter`, `math/cmplx`, `math/bits`, `math/big`, `path`, `path/filepath`, `io/fs`, `flag`, `log`, `log/slog`
- **Larger, included after the spike:** `text/template`, `testing/quick`, `testing/fstest`, `testing/iotest`, `encoding/csv`, `encoding/hex`, `encoding/base64`, `hash/fnv`, `crypto/sha256`, `crypto/md5`, `image`
- **Excluded:** `net/*` (including `net/http` and `httptest`), `os/exec`, `os/signal`, `database/sql`, `html/template`, `plugin`, `runtime/debug`, `syscall`, `unsafe`-heavy packages, and `golang.org/x/tour`. None are meaningful on wasip1 or in an offline phone sandbox. This also reverses the "`httptest` is untested" note under Known limits: `httptest` is simply out.

The Tour's `golang.org/x/tour` helpers (`pic`, `tree`, `wc`) aren't stdlib; exercises that depend on them need the unit seed to inline a stub.

## Tasks

1. Spike: build tools to wasip1, write a one-page harness, record the numbers above.
2. ~~Scaffold from pizza-starter into this repo with its setup-into-other-dirs support. Keep the `STARTER` stamp.~~ Done: `public/`, stamped from psychic-meme `ee4feb2`.
3. Checker worker + CodeMirror lint gutter.
4. Runner worker + testmain generation.
5. Unit storage (IndexedDB) + unit list + new-unit template.
6. Toolchain cache (outside `sw.js`'s prefix) + the download card + `persist()`.
7. Vendor docs + a docs tab (borrow `components/doc-view.js` + `vendor/marked.min.js` from pizza-repl-fennel).
8. Export via the share sheet (pattern from pizza-repl's `lib/export.js`).

## Non-goals

- Third-party modules, cgo, `-race`, gopls-level refactors, any multi-package layout beyond one package per unit.
