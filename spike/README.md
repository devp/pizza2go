# spike

Throwaway measurement harness for SPEC.md's Spike section.

- `build.sh <outdir>`: builds `compile.wasm`, `link.wasm`, the std archives and `importcfg` (from `toolchain/allowlist.txt`) for wasip1.
- `checker/`: the minimal checker (parse + typecheck + gofmt). Build with `GOOS=wasip1 GOARCH=wasm go build -o <outdir>/checker.wasm ./checker`.
- `index.html` + `harness.js`: the browser harness. It expects the toolchain under `./tc/`.
- `run.mjs <outdir> [runs]`: serves the harness plus `<outdir>` as `/tc/`, runs it in headless Chromium, and prints JSON. Needs `playwright-core`.

For the phone: `node spike/serve.mjs <outdir>` and open the printed URL.
