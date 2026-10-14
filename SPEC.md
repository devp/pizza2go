# pizza2go — spec

An offline PWA for writing small Go packages on an Android phone (with a Clicks keyboard) against tests you wrote yourself, then exporting them unchanged into real modules at home. Built on [pizza-starter](https://github.com/devp/psychic-meme/tree/main/pizza-starter).

## Decisions

- **Real Go toolchain in the browser.** `cmd/compile` + `cmd/link` built for `GOOS=wasip1`, running in Web Workers against an in-memory filesystem. Rejected: TinyGo (it compiles *to* wasm and can't run *in* it, because of LLVM), Yaegi and GopherJS (each teaches a dialect of Go).
- **Unit = one real package.** `package <name>`, `<name>.go` + `<name>_test.go`, stdlib only. A unit is done when its tests pass, `go vet` is clean, and the code is gofmt'd.
- **Writing is mechanical on purpose.** gofmt on save, live type errors, keybindings, a key row for the symbols the phone keyboard buries. No autocomplete and no built-in snippets (the ⋯ shortcuts are ones you add yourself).
- **Hosting:** `https://pizza2go.dzza.workers.dev`, Cloudflare Workers static assets, deployed from `public/` by `.github/workflows/deploy.yml` on push to main (same setup as psychic-meme; PRs get a `--dry-run`). It gets its own origin so its large caches and possible eviction can't take down the other pizza apps' data.
- **Stdlib only.** There's no `go` command in the browser, so no module resolution.

## Goals this serves

- Fluency writing Go by hand: `testing` idioms, errors, interfaces, generics.
- Code you can export: units drop into home projects without edits.
- Supports the home-side goal: a real Go project for the resume (see the export CLI under Later).

## Architecture

### Build time (CI, per Go version)

`toolchain/build.sh [outroot]` (default `public/toolchain`), with the Go version from `toolchain/go-version`:

- `GOOS=wasip1 GOARCH=wasm go build -trimpath cmd/compile` → `compile.wasm`. Same for `cmd/link` → `link.wasm`.
- `checker/` → `checker.wasm`: our Go program using `go/parser`, `go/types`, `go/format`, `go/doc`, and go vet's analyzers from `golang.org/x/tools/go/analysis` (all of `go vet`'s defaults except asmdecl, buildtag, cgocall, directive, framepointer, hostport, stdversion and httpresponse), driven in-process by a ~100-line driver (`checker/vet.go`).
- Stdlib archives: `go list -export -deps` over `toolchain/allowlist.txt` plus `testing/internal/testdeps` (the generated testmain needs it), copied to `std/<path_with_underscores>.a`, with an `importcfg` (`packagefile path=/std/...`).
- `toolchain/manifest.mjs` splits files over 20MB into `.0`, `.1`, ... parts (Workers assets cap files at 25MiB; `compile.wasm` is 53MB on 1.27) and writes `manifest.json`: `{go, dir, bytes, files: [{name, size, parts?}]}`.
- Output: `public/toolchain/go1.27.2/...` + `public/toolchain/manifest.json`. Not committed; CI builds it before every deploy. On Go 1.27.2 it's 153 files, 125.7MB raw.
- `.github/workflows/deploy.yml` also runs `go vet` + `go test` in `checker/` and the node unit tests before building.

### Run time

One worker, `go-worker.js`, holds the toolchain in memory (read from the toolchain cache, modules compiled once) and does both jobs. Every tool invocation is a fresh WASI instance (`@bjorn3/browser_wasi_shim` 0.4.2, vendored) over an in-memory filesystem.

- **check(pkg, files)** → `checker.wasm` → `{diagnostics, formatted, tests, hasTestMain}`. Diagnostics carry a source: `syntax`, `type`, `vet` or `unit` (wrong package name, external test package). Vet runs only when the package type-checks, as with `go vet`. Runs 400ms after typing stops.
- **run** (compile → testmain → link → test):
  1. `compile -p <name> -complete -importcfg /importcfg -o /out/<name>.a /src/<name>.go /src/<name>_test.go`
  2. `lib/testmain.js` writes `/src/_testmain.go` from the checker's test list: tests, benchmarks, fuzz targets, examples with an output comment, and `TestMain` if present, as `go test` generates it. Then `compile -p main …`.
  3. `link -importcfg /importcfg.main -o /out/test.wasm /out/main.a`
  4. Run `test.wasm -test.v=true -test.paniconexit0 -test.timeout=60s`, with `/tmp` writable (`TMPDIR`, `t.TempDir()`), streaming output to the Output pane.
- **Time limit:** the test binary gets 30s from when it starts (building is bounded; the code under test isn't). At the limit the main thread terminates the worker and starts a new one.
- Run first gofmt's both files, then refuses to run while there are syntax, type or unit problems (vet findings don't block).

### Known limits

- Single-threaded: goroutines work, but there's no parallelism and no `-race`.
- No network or real OS. `net/*` (including `httptest`) is out of the allowlist; importing a package outside it is a type error that says so.
- Infinite loops are caught only by the 30s limit.
- In-package tests only: a `package <name>_test` test file is reported, not run. (Supporting it means a second compile and an import of the unit's package.)
- Benchmarks are compiled but not run (no `-test.bench`). Fuzz targets run their seed corpus only, as with plain `go test`.
- Time zone is UTC (no tzdata).

### Editor

A plain `<textarea>` showing one file at a time (`<name>.go` / `<name>_test.go`), with the caret position (line:col, in Go's byte columns) and:

- **Key row:** `( ) { } [ ] := ⇥ ⋯`; ⋯ pops up shortcuts (defaults: `err != nil`, `!=`, `==`, `&&`, `||`, `<-`, `""`, `` ` ``), replaced by your own comma-separated list in Options.
- **Keys:** Enter keeps the indentation (one deeper after `{ ( [`, and splits `{|}`); Tab / Shift+Tab indent and outdent; Ctrl/Alt+Enter runs tests; Ctrl+S or Alt+F gofmts; Alt+1 / Alt+2 switch file.
- **Problems / Output pane** under the editor; tapping a problem jumps to it.
- CodeMirror 6 (with a lint gutter) is the fallback if this proves too thin.

### Units

- One record per unit in `lib/store.js` (localStorage): name = package name, items = the two files. New units get `package <name>` and a failing `Test<Name>`, and open on the test file (tests first).
- Names: lowercase letters and digits, not a keyword, not `main`, unique.
- Status, per the current code (an FNV hash of both files): **done** (tests pass, no problems including vet, gofmt'd), **passing**, **failing**, **edited** (changed since the last run), **not run**.

## Offline and storage

- The toolchain gets its own Cache Storage cache, fetched once. It's left **out** of the starter's refetch-everything `ASSETS` list (`sw-assets.js`): tens of MB redownloaded on every launch isn't viable.
- **Cache name:** outside the starter's `PREFIX` (`scope + " "`), e.g. `scope + "#toolchain go<version>"`. The starter's `sw.js` deletes every `PREFIX` cache except its own on `activate`, so a `PREFIX` name would be wiped on every app update. This avoids changing the shared `sw.js`.
- The worker reads toolchain files straight from that cache (`caches.open(...).match(...)`), not through the service worker's `fetch` handler. A cache is complete once it holds `manifest.json`, which is written last.
- **Asking before the first download.** Nothing large downloads until the user says so; the app shell is ~200KB. Until the toolchain is cached, a card takes the place of Run and shows the download size, with **Download now** and **Wait for Wi-Fi**:
  - *Wait for Wi-Fi* is remembered, and starts the download by itself when `navigator.connection.type` becomes `"wifi"` while the app is open (Chrome on Android). Where the browser doesn't report the connection type, the second button is a plain **Later**.
  - If `navigator.connection.saveData` is on, *Wait for Wi-Fi* is the default.
  - All-or-nothing: the toolchain is usable only once every file in the manifest is cached. Files that finished survive an interruption, so a retry fetches only the rest. Progress shows while downloading. Downloads run only while the app is open (no Background Fetch in v1).
  - The same card, with the same two choices, is used for toolchain updates (below). Writing code works without the toolchain; checking and running don't.
- **Download size:** the card shows the manifest's size, which is what's stored on the device (126MB for Go 1.27.2). The transfer is smaller if Cloudflare compresses the `.wasm` and `.a` files (roughly 7x with brotli). Not yet verified: a look at the Network tab on the deployed site will tell.
- **Toolchain updates are noticed on launch.** The app fetches `toolchain/manifest.json` from the network on every start (it isn't in `ASSETS`: CI generates it, so it can't be listed). When the manifest's Go version differs from the cached one, the download card offers the update (Download now / Wait for Wi-Fi). The old toolchain keeps working until the new cache is complete; then the app switches and deletes the old one. No separate update button.
- Units go in localStorage via the starter's `lib/store.js`.
- Call `navigator.storage.persist()` on first run (before the toolchain download).
- Everything under `public/` deploys, so `public/.assetsignore` keeps dev-only files (`package.json`, `tests/`, `scripts/`, `justfile`, ...) out of the deploy.

## Docs (vendored, offline)

Generated by `node docs/gen.mjs` for the pinned Go version, committed to `public/docs/`, and listed in `ASSETS`. One tab each, rendered by `components/doc-view.js` (from pizza-repl-fennel) with a jump-to-section list.

| Tab | Source | License |
|---|---|---|
| spec | `doc/go_spec.html` from golang/go at the pinned tag | CC BY 4.0 (code BSD) |
| effective go | `_content/doc/effective_go.html` from golang/website, with its `{{code}}` snippets inlined | CC BY 4.0 (code BSD) |
| by example | Go by Example (mmcgrana/gobyexample), comments as prose, code and output as blocks | CC BY 3.0 |
| learnx | Learn X in Y minutes' `go.md` (adambard/learnxinyminutes-docs), front matter dropped | CC BY-SA 3.0 |
| packages | `go doc -all` for 26 packages (fmt, errors, strings, strconv, slices, maps, sort, cmp, iter, math, math/rand, unicode, unicode/utf8, bytes, io, bufio, os, time, testing, sync, sync/atomic, context, regexp, encoding/json, container/heap, container/list) | BSD |

About 1MB in all. Links to go.dev pages open in the browser. Not included (yet): A Tour of Go (its `.article` present format needs its own converter) and Go Code Review Comments.

## Export

- v1 (done): the unit menu (⋮) shares both files through the Web Share API where the browser can share files, or copies both, each under a `// ==== <name> ====` header.
- Later: sync over remoteStorage (planned direction for pizza apps), plus a Go CLI at home that pulls units into a module and runs `go test ./...`.

## Spike (first)

Desktop numbers below are from headless Chromium (Playwright build 1194, V8) on a 4-core Linux VM, Go 1.24.7, with `@bjorn3/browser_wasi_shim` 0.4.2 over an in-memory filesystem; everything is served from localhost, so fetch times are optimistic. The spike, then deployed at `/spike/` (since retired: the app replaced it), was run on desktop Chrome and on a Pixel 8a in Android Chrome (the target device). iOS is not a target. Running it: `spike/build.sh <outdir>` builds the toolchain, and `node spike/run.mjs <outdir>` runs the harness in headless Chromium (needs `playwright-core`).

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

(None right now.)

## Resolved

- **Editor:** the pizza-repl textarea + key row (`{ } ( ) [ ]`, `:=`, `err != nil`, Tab; ⋯ pops up your own shortcuts from Options), with checker diagnostics as a tappable list under the editor (tap jumps to the line). CodeMirror 6 only if this feels too thin in use.
- **Unit storage:** the starter's `lib/store.js` (localStorage). Units are a few KB each. The toolchain stays in Cache Storage.
- **Go version:** the newest stable release, pinned in `toolchain/go-version` (now 1.27.2), which CI's `setup-go` reads. Bump it deliberately; the manifest records it.

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

1. ~~Spike: build tools to wasip1, write a one-page harness, record the numbers above.~~
2. ~~Scaffold from pizza-starter into this repo.~~ `public/`, stamped from psychic-meme `ee4feb2`.
3. ~~Checker + editor (textarea, key row, diagnostics list).~~
4. ~~Runner + testmain generation.~~
5. ~~Unit storage + unit list + new-unit template.~~
6. ~~Toolchain cache (outside `sw.js`'s prefix) + the download card + `persist()`.~~
7. ~~Vendor docs + docs tabs.~~
8. ~~Export via the share sheet, or copy.~~

Tested: `checker/` has Go tests (`go test ./...`); `public/tests/` has node unit tests and a Playwright test that downloads the locally built toolchain and runs units end to end (check, gofmt, vet, run, examples, a hung run, reload, offline).

### Next

- Try it on the Pixel 8a with the Clicks keyboard, and adjust the key row and keys from use.
- Verify whether Cloudflare compresses the toolchain on the wire.
- External test packages (`package <name>_test`).
- A Tour of Go as a docs tab, and maybe as unit seeds.
- The export CLI at home (see Export).

## Non-goals

- Third-party modules, cgo, `-race`, gopls-level refactors, any multi-package layout beyond one package per unit.
