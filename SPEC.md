# pizza2go — spec

An offline PWA for writing small Go packages on a phone (with a Clicks keyboard) against tests you wrote yourself, then exporting them unchanged into real modules at home. Built on [pizza-starter](https://github.com/devp/psychic-meme/tree/main/pizza-starter).

## Decisions

- **Real Go toolchain in the browser.** `cmd/compile` + `cmd/link` built for `GOOS=wasip1`, running in Web Workers against an in-memory filesystem. Rejected: TinyGo (it compiles *to* wasm and can't run *in* it, because of LLVM), Yaegi and GopherJS (each teaches a dialect of Go).
- **Unit = one real package.** `package <name>`, `<name>.go` + `<name>_test.go`, stdlib only. A unit is done when its tests pass, `go vet` is clean, and the code is gofmt'd.
- **Writing is mechanical on purpose.** gofmt on save, live type errors, keybindings. No autocomplete and no snippets.
- **Hosting:** `https://pizza2go.devpurkayastha.com` on GitHub Pages, with DNS on Cloudflare. It gets its own origin so its large caches and possible eviction can't take down the other pizza apps' data.
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
- Everything is versioned by Go version, e.g. `toolchain/go1.25.x/`.

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
- No network or real OS. `httptest` with an in-process handler is untested.
- Infinite loops are caught only by the runner timeout.

### Editor

CodeMirror 6, vendored, mounted inside a Lit element. Go language mode via `@codemirror/lang-go` (confirm it exists before relying on it). The lint gutter is fed by the checker. Keymap: run tests, format, switch file, new unit.

## Offline and storage

- The toolchain gets its own cache, `PREFIX + "go<version>"`, fetched once. It's left **out** of the starter's refetch-everything `ASSETS` list (`sw.js`): tens of MB redownloaded on every launch, with an all-or-nothing update, isn't viable.
- Units go in IndexedDB (or OPFS), not localStorage.
- Call `navigator.storage.persist()` on first run.

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

Measure on the phone before building any UI. The results go here.

| Metric | Result |
|---|---|
| `cmd/compile` builds and runs on wasip1 at all | |
| Size: compile.wasm / link.wasm / std archives (raw, gzip, brotli) | |
| Cold load: fetch + `compileStreaming` for each tool | |
| Warm compile+link+run, hello package with 3 tests | |
| Peak memory during link | |
| checker.wasm size, and `check()` latency on a 100-line file | |

If compile+link is too slow on the phone, ship the checker only and run tests at home.

## Open questions

- Is the Go version pinned per toolchain release, and how does an update reach the phone (an explicit "update toolchain" button)?
- Starter provenance: `just new-app` and `just drift` only work inside psychic-meme. Should we copy `app/` by hand and keep the `STARTER` stamp, or move the app into psychic-meme and only deploy from here?
- Does iOS Safari's memory cap allow `link` on a realistically sized package?
- Which stdlib packages go in the allowlist? (Size grows with every package.)

## Tasks

1. Spike: build tools to wasip1, write a one-page harness, record the numbers above.
2. Scaffold from pizza-starter `app/` (resolve the provenance question first).
3. Checker worker + CodeMirror lint gutter.
4. Runner worker + testmain generation.
5. Unit storage (IndexedDB) + unit list + new-unit template.
6. Toolchain cache in `sw.js` + `persist()`.
7. Vendor docs + a docs tab.
8. Export via the share sheet.

## Non-goals

- Third-party modules, cgo, `-race`, gopls-level refactors, any multi-package layout beyond one package per unit.
