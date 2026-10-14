# pizza2go

Write small Go packages on a phone against your own tests, offline: the real Go compiler, linker and `go vet` analyzers, built for WebAssembly, in a PWA. Live at <https://pizza2go.dzza.workers.dev>. Design and decisions: [SPEC.md](SPEC.md).

- `public/` — the app (no build step; built on [pizza-starter](https://github.com/devp/psychic-meme/tree/main/pizza-starter), see `public/STARTER`). Deployed as-is, plus the toolchain.
- `checker/` — `checker.wasm`: type errors, gofmt, test discovery, vet. `go test ./...` runs natively.
- `toolchain/` — the pinned Go version, the stdlib allowlist, and `build.sh`, which builds what the app downloads into `public/toolchain/`.
- `docs/gen.mjs` — regenerates `public/docs/` (spec, Effective Go, Go by Example, package docs).
- `spike/` — the original measurement harness; numbers are in SPEC.md.

Locally:

```sh
toolchain/build.sh                 # ~1 min; needs Go (fetches the pinned version)
cd public && python3 -m http.server 8000
just dev-init && just dev-check    # in public/: typecheck + tests (browser test with `just dev-init-browser`)
```

Pushing to `main` tests, builds and deploys (`.github/workflows/deploy.yml`).
