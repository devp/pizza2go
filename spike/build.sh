#!/bin/sh
# Build compile.wasm, link.wasm and std archives for wasip1. Usage: spike/build.sh <outdir>
set -eu
out=${1:?outdir}
mkdir -p "$out/std"
export GOOS=wasip1 GOARCH=wasm
go build -o "$out/compile.wasm" cmd/compile
go build -o "$out/link.wasm" cmd/link
pkgs=$(grep -v '^#' "$(dirname "$0")/../toolchain/allowlist.txt" | grep . | tr '\n' ' ')
# unique deps with export files; testing needs runtime too
go list -export -deps -f '{{if .Export}}{{.ImportPath}}={{.Export}}{{end}}' $pkgs testing/internal/testdeps | sort -u > "$out/exports.txt"
: > "$out/importcfg"
while IFS== read -r path file; do
  dst="$out/std/$(echo "$path" | tr / _).a"
  cp "$file" "$dst"
  echo "packagefile $path=/std/$(basename "$dst")" >> "$out/importcfg"
done < "$out/exports.txt"
