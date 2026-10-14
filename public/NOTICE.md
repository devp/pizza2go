# Third-party code and content

- **`vendor/lit.js`** — [Lit](https://lit.dev), BSD-3-Clause (`vendor/lit.LICENSE.txt`).
- **`vendor/marked.min.js`** — [marked](https://marked.js.org), MIT (`vendor/marked.LICENSE.md`).
- **`vendor/browser_wasi_shim/`** — [@bjorn3/browser_wasi_shim](https://github.com/bjorn3/browser_wasi_shim) 0.4.2, MIT or Apache-2.0 (`LICENSE-MIT`, `LICENSE-APACHE` there).
- **`toolchain/`** (built in CI, downloaded on request) — the Go compiler and linker (`cmd/compile`, `cmd/link`) and standard library, built for wasip1; and `checker.wasm`, which includes `golang.org/x/tools`. © The Go Authors, BSD-3-Clause (`vendor/go.LICENSE.txt`).
- **`docs/spec.md`, `docs/effective-go.md`** — from go.dev, © The Go Authors, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); code samples BSD-3-Clause.
- **`docs/packages.md`** — `go doc` output for the standard library, © The Go Authors, BSD-3-Clause.
- **`docs/gobyexample.md`** — [Go by Example](https://gobyexample.com) by Mark McGranaghan and Eli Bendersky, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), reformatted.

Each doc names its source and license at its top. `docs/gen.mjs` (repo root) regenerates them.
