// Generate the offline docs in public/docs/ from their sources, for the Go
// version in toolchain/go-version. Needs git, go and network; run it when the
// pinned Go version changes, and commit the output.
//
//   node docs/gen.mjs
//
// - spec.md:        The Go Programming Language Specification (golang/go doc/go_spec.html)
// - effective-go.md: Effective Go (golang/website), with its {{code}} snippets inlined
// - gobyexample.md: Go by Example (mmcgrana/gobyexample), CC BY 3.0
// - packages.md:    `go doc -all` for the stdlib packages units use most
//
// The HTML ones stay HTML inside the .md: marked passes it through.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const out = path.join(root, "public/docs");
const go = "go" + fs.readFileSync(path.join(root, "toolchain/go-version"), "utf8").trim();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pizza2go-docs-"));
const env = { ...process.env, GOTOOLCHAIN: go };
fs.mkdirSync(out, { recursive: true });

/** @param {string} repo @param {string} dir @param {string[]} sparse @param {string} [branch] */
function clone(repo, dir, sparse, branch) {
  const args = ["clone", "-q", "--depth", "1", "--filter=blob:none", "--sparse"];
  if (branch) args.push("--branch", branch);
  execFileSync("git", ["-c", "advice.detachedHead=false", ...args, `https://github.com/${repo}`, dir], { stdio: "inherit" });
  execFileSync("git", ["-C", dir, "sparse-checkout", "set", ...sparse], { stdio: "inherit" });
  return execFileSync("git", ["-C", dir, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
}

/** Off-site links open go.dev in the browser instead of navigating the app away. */
/** @param {string} html */
const fixLinks = (html) =>
  html.replace(/href="\/(?!\/)/g, 'target="_blank" rel="noopener" href="https://go.dev/').replace(/<!--\{[\s\S]*?\}-->/, "");

/** @param {string} title @param {string} source @param {string} body */
const page = (title, source, body) => `# ${title}\n\n<p class="doc-source">${source}</p>\n\n${body.trim()}\n`;

// ---- spec ----
const goDir = path.join(tmp, "go");
clone("golang/go", goDir, ["doc"], go);
const spec = fs.readFileSync(path.join(goDir, "doc/go_spec.html"), "utf8");
const subtitle = spec.match(/"Subtitle": "([^"]+)"/)?.[1] ?? "";
fs.writeFileSync(
  path.join(out, "spec.md"),
  page("The Go Programming Language Specification", `${subtitle}. © The Go Authors, <a target="_blank" rel="noopener" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; from <a target="_blank" rel="noopener" href="https://go.dev/ref/spec">go.dev/ref/spec</a>.`, fixLinks(spec))
);

// ---- Effective Go ----
const webDir = path.join(tmp, "website");
const webRev = clone("golang/website", webDir, ["_content/doc"]);
let eff = fs.readFileSync(path.join(webDir, "_content/doc/effective_go.html"), "utf8");
/** The {{code "file" start end}} template action: lines from the start match through the end match. */
eff = eff.replace(/\{\{code "([^"]+)" (`[^`]*`|"[^"]*") (`[^`]*`|"[^"]*")\}\}/g, (_, file, a, b) => {
  const lines = fs.readFileSync(path.join(webDir, "_content", file), "utf8").split("\n");
  const re = (/** @type {string} */ p) => {
    const s = p.slice(1, -1);
    return s === "$" ? null : new RegExp(s.replace(/^\/|\/$/g, ""));
  };
  const [ra, rb] = [re(a), re(b)];
  const start = ra ? lines.findIndex((l) => ra.test(l)) : 0;
  let end = lines.length - 1;
  if (rb) end = lines.findIndex((l, i) => i >= start && rb.test(l));
  const esc = lines.slice(start, end + 1).join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<pre>${esc.trimEnd()}</pre>`;
});
eff = eff.replace(/\{\{"(\{\{[^"]*\}\})"\}\}/g, "$1");
fs.writeFileSync(
  path.join(out, "effective-go.md"),
  page("Effective Go", `© The Go Authors, <a target="_blank" rel="noopener" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; from <a target="_blank" rel="noopener" href="https://go.dev/doc/effective_go">go.dev/doc/effective_go</a> (golang/website ${webRev}). Written for Go's early years: still the idioms, but it predates modules, generics and iterators.`, fixLinks(eff))
);

// ---- Go by Example ----
const gbeDir = path.join(tmp, "gobyexample");
const gbeRev = clone("mmcgrana/gobyexample", gbeDir, ["examples"]);
const titles = fs.readFileSync(path.join(gbeDir, "examples.txt"), "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
const sections = titles.map((title) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const dir = path.join(gbeDir, "examples", slug);
  if (!fs.existsSync(dir)) return "";
  const parts = [`## ${title}`];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!fs.statSync(path.join(dir, f)).isFile()) continue;
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    if (f.endsWith(".go")) {
      // Comment-only lines are the prose; the rest is code, in order.
      /** @type {{prose: boolean, lines: string[]}[]} */
      const blocks = [];
      for (const line of text.split("\n")) {
        const m = line.match(/^\s*\/\/ ?(.*)$/);
        const prose = Boolean(m) && !/^\s*\/\/\s*(Output|go:)/.test(line);
        const last = blocks.at(-1);
        if (last && last.prose === prose) last.lines.push(prose ? /** @type {RegExpMatchArray} */ (m)[1] : line);
        else blocks.push({ prose, lines: [prose ? /** @type {RegExpMatchArray} */ (m)[1] : line] });
      }
      for (const b of blocks) {
        const body = b.lines.join("\n").trim();
        if (body) parts.push(b.prose ? body : "```go\n" + body + "\n```");
      }
    } else if (f.endsWith(".sh")) {
      const body = text.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n").trim();
      if (body) parts.push("```console\n" + body + "\n```");
    }
  }
  return parts.join("\n\n");
});
fs.writeFileSync(
  path.join(out, "gobyexample.md"),
  page("Go by Example", `By Mark McGranaghan and Eli Bendersky, <a target="_blank" rel="noopener" href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>; from <a target="_blank" rel="noopener" href="https://gobyexample.com">gobyexample.com</a> (mmcgrana/gobyexample ${gbeRev}), reformatted for this app. Examples that use packages outside pizza2go's allowlist (net/http, os/exec, ...) won't run in a unit.`, sections.filter(Boolean).join("\n\n"))
);

// ---- package docs ----
const PKGS = "fmt errors strings strconv slices maps sort cmp iter math math/rand unicode unicode/utf8 bytes io bufio os time testing sync sync/atomic context regexp encoding/json container/heap container/list".split(" ");
const docs = PKGS.map((p) => {
  const text = execFileSync("go", ["doc", "-all", p], { env, encoding: "utf8", maxBuffer: 64 << 20 });
  return `## ${p}\n\n\`\`\`go\n${text.trim()}\n\`\`\``;
});
fs.writeFileSync(
  path.join(out, "packages.md"),
  page("Packages", `<code>go doc -all</code> for the packages units use most, from ${go}. © The Go Authors, BSD-style license.`, docs.join("\n\n"))
);

fs.rmSync(tmp, { recursive: true, force: true });
for (const f of fs.readdirSync(out)) console.log(f, (fs.statSync(path.join(out, f)).size / 1024).toFixed(0) + "KB");
