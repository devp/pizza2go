#!/bin/sh
# Build the toolchain pizza2go downloads to the phone, with the Go version in
# toolchain/go-version: compile.wasm, link.wasm, checker.wasm, the stdlib
# archives from toolchain/allowlist.txt, an importcfg, and manifest.json.
#
# Usage: toolchain/build.sh [outroot]   (default: public/toolchain)
# Writes <outroot>/<go version>/... and <outroot>/manifest.json.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
root=$(dirname "$here")
outroot=$(cd "$root" && mkdir -p "${1:-public/toolchain}" && cd "${1:-public/toolchain}" && pwd)

GOTOOLCHAIN=go$(cat "$here/go-version")
export GOTOOLCHAIN
ver=$(go env GOVERSION)
out=$outroot/$ver
rm -rf "$out"
mkdir -p "$out/std"

export GOOS=wasip1 GOARCH=wasm
go build -trimpath -o "$out/compile.wasm" cmd/compile
go build -trimpath -o "$out/link.wasm" cmd/link
(cd "$root/checker" && go build -trimpath -o "$out/checker.wasm" .)

# testing/internal/testdeps isn't user-importable, but the generated testmain needs it.
pkgs="$(grep -v '^#' "$here/allowlist.txt" | grep .) testing/internal/testdeps"
# shellcheck disable=SC2086
go list -export -deps -f '{{if .Export}}{{.ImportPath}}={{.Export}}{{end}}' $pkgs | sort -u > "$out/exports.txt"
: > "$out/importcfg"
while IFS== read -r path file; do
  name=$(echo "$path" | tr / _).a
  cp "$file" "$out/std/$name"
  echo "packagefile $path=/std/$name" >> "$out/importcfg"
done < "$out/exports.txt"
rm "$out/exports.txt"

node "$here/manifest.mjs" "$outroot" "$ver"
