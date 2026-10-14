import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

// Opt-in: skipped unless playwright is installed (`just dev-init-browser`), and
// the toolchain parts unless it's built (`../toolchain/build.sh`).
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {}

const root = new URL("../..", import.meta.url).pathname;
const appNs = (await readFile(join(root, "index.html"), "utf8")).match(/name="app-ns" content="([^"]+)"/)?.[1];
const haveToolchain = await stat(join(root, "toolchain/manifest.json")).then(() => true, () => false);
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".wasm": "application/wasm",
  ".json": "application/json",
};

// Path -> body to serve instead of the file, or a number to answer with that status.
const overrides = new Map();

function serve() {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    const file = join(root, path === "/" ? "index.html" : path);
    const override = overrides.get(path);
    if (typeof override === "number") return void res.writeHead(override).end();
    if (override !== undefined) {
      res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
      return void res.end(override);
    }
    try {
      if (!file.startsWith(root)) throw new Error("outside root");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const STACK = `package stack

// Stack is a LIFO stack of ints.
type Stack struct{ items []int }

// Push adds v to the top.
func (s *Stack) Push(v int) { s.items = append(s.items, v) }

// Pop removes and returns the top, and false if s is empty.
func (s *Stack) Pop() (int, bool) {
	if len(s.items) == 0 {
		return 0, false
	}
	v := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return v, true
}
`;

const STACK_TEST = `package stack

import (
	"fmt"
	"testing"
)

func TestPushPop(t *testing.T) {
	var s Stack
	s.Push(1)
	s.Push(2)
	if v, ok := s.Pop(); v != 2 || !ok {
		t.Fatalf("Pop() = %d, %v; want 2, true", v, ok)
	}
}

func TestEmpty(t *testing.T) {
	var s Stack
	if _, ok := s.Pop(); ok {
		t.Fatal("Pop on empty stack succeeded")
	}
}

func ExampleStack() {
	var s Stack
	s.Push(7)
	fmt.Println(s.Pop())
	// Output: 7 true
}
`;

test("pizza2go in a real browser", { skip: !chromium && "playwright not installed" }, async (t) => {
  const server = await serve();
  const BASE = `http://127.0.0.1:${server.address().port}/`;
  const launch = (o) => chromium.launch(o);
  const browser = await launch({ channel: "chrome" })
    .catch(() => launch())
    .catch(() => launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }));
  t.after(async () => {
    await browser.close();
    server.closeAllConnections();
    server.close();
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const ok = (name, cond, extra = "") => t.test(name, () => assert.ok(cond, extra || name));

  await page.goto(BASE + "index.html?runlimit=4000");
  await ok("title is pizza2go", (await page.title()) === "pizza2go");
  await ok("header says pizza2go", (await page.locator(".app-header h1").innerText()) === "pizza2go");
  await ok("starts on the units tab", await page.locator('.panel[data-panel="units"]').isVisible());
  await ok("empty list says so", (await page.locator("unit-list").innerText()).includes("No units yet"));

  // ---- new unit ----
  await page.fill("#new-unit-name", "Stack");
  await page.click("#new-unit-form button");
  await ok("bad name is refused with a reason", (await page.locator("#new-unit-error").innerText()).includes("lowercase"));
  await page.fill("#new-unit-name", "stack");
  await page.click("#new-unit-form button");
  await ok("new unit opens in the code tab", await page.locator('.panel[data-panel="code"]').isVisible());
  await ok("test file first", (await page.inputValue("#editor")).includes("func TestStack(t *testing.T)"));
  await ok("file buttons named for the package", (await page.locator("#file-go").innerText()) === "stack.go");
  await ok("storage keys use the app-ns meta", await page.evaluate((ns) => Object.keys(localStorage).some((k) => k.startsWith(ns + ":units") && localStorage.getItem(k)?.includes("stack")), appNs));

  // ---- editor ----
  await page.click("#file-go");
  await ok("switching files shows the other file", (await page.inputValue("#editor")) === "package stack\n");
  await page.click("#editor");
  await page.keyboard.press("Control+End");
  await page.keyboard.type("\nfunc f() {");
  await page.keyboard.press("Enter");
  await ok("Enter indents after {", (await page.inputValue("#editor")).endsWith("func f() {\n\t"));
  await page.click('#key-row [data-ins="}"]');
  await ok("key row inserts at the caret", (await page.inputValue("#editor")).endsWith("\n\t}"));
  await ok("key row keeps focus in the editor", await page.evaluate(() => document.activeElement?.id === "editor"));
  await page.fill("#editor", "package stack\n");

  if (!haveToolchain) return void t.diagnostic("toolchain not built; skipping check and run");

  // ---- toolchain download ----
  await page.locator("download-card .card").waitFor();
  await ok("asks before downloading", (await page.locator("download-card").innerText()).includes("Download the Go toolchain?"));
  await ok("run is disabled without a toolchain", await page.locator("#run-btn").isDisabled());
  await page.click('download-card [data-act="download"]');
  await page.waitForFunction(() => !document.querySelector("download-card .card"), null, { timeout: 120_000 });
  await page.waitForFunction(() => !document.querySelector("#run-btn").disabled, null, { timeout: 60_000 });
  await ok("toolchain downloaded and loaded", true);
  const cacheNames = await page.evaluate(() => caches.keys());
  await ok("toolchain cache is outside sw.js's prefix", cacheNames.some((n) => n.includes("#toolchain go")), cacheNames.join(", "));

  // ---- check ----
  const problems = () => page.locator("#problems").innerText();
  await page.click("#pane-problems");
  await page.click("#file-test");
  await page.waitForFunction(() => document.querySelector("#problems")?.textContent?.includes("No problems"), null, { timeout: 30_000 });
  await ok("template checks clean", true);

  // ---- run: the template's failing test ----
  await page.click("#run-btn");
  await page.waitForFunction(() => /PASS|FAIL|failed|stopped/.test(document.querySelector("#pane-status")?.textContent ?? ""), null, { timeout: 60_000 });
  await ok("template test fails", (await page.locator("#pane-status").innerText()).startsWith("FAIL"), await page.locator("#pane-status").innerText());
  await ok("output shows the failure", (await page.locator("#run-output").innerText()).includes("--- FAIL: TestStack"));

  // ---- a type error blocks the run and points at the line ----
  await page.click("#file-go");
  await page.fill("#editor", "package stack\n\nfunc F() int { return \"x\" }\n");
  await page.waitForFunction(() => document.querySelector("#problems")?.textContent?.includes("cannot use"), null, { timeout: 30_000 });
  await ok("type error listed", (await problems()).includes("stack.go:3:"));
  await page.click("#run-btn");
  await page.waitForFunction(() => /fix before running/.test(document.querySelector("#pane-status")?.textContent ?? ""), null, { timeout: 30_000 });
  await ok("type errors block the run", true);

  // ---- real code, passing tests, example output ----
  await page.fill("#editor", STACK);
  await page.click("#file-test");
  await page.fill("#editor", STACK_TEST);
  await page.click("#run-btn");
  await page.waitForFunction(() => /^(PASS|FAIL)|failed|stopped/.test(document.querySelector("#pane-status")?.textContent ?? ""), null, { timeout: 60_000 });
  const out = await page.locator("#run-output").innerText();
  await ok("tests pass", (await page.locator("#pane-status").innerText()).startsWith("PASS"), out);
  await ok("example ran", out.includes("--- PASS: ExampleStack"), out);
  await page.click('go-tabs [data-tab="units"]');
  await ok("unit is done: passing, clean, gofmt'd", (await page.locator("unit-list .badge").innerText()) === "done");
  await page.click("unit-list .unit-row");

  // ---- gofmt ----
  await page.click("#file-go");
  await page.fill("#editor", STACK.replace("func (s *Stack) Push(v int) { s.items = append(s.items, v) }", "func (s *Stack) Push(v int) {   s.items = append(s.items,v) }"));
  await page.click("#fmt-btn");
  await page.waitForFunction((want) => document.querySelector("#editor").value === want, STACK, { timeout: 30_000 });
  await ok("gofmt formats", true);

  // ---- vet ----
  await page.fill("#editor", STACK + '\nfunc bad() string { return fmt.Sprintf("%d", "x") }\n'.replace("fmt.", "fmt.") );
  await page.fill("#editor", STACK.replace("package stack\n", 'package stack\n\nimport "fmt"\n') + '\nfunc bad() string { return fmt.Sprintf("%d", "x") }\n');
  await page.waitForFunction(() => document.querySelector("#problems")?.textContent?.includes("Sprintf"), null, { timeout: 30_000 });
  await ok("vet finding listed", (await problems()).includes("vet"));
  await page.fill("#editor", STACK);

  // ---- an infinite loop is stopped, and the next run works ----
  await page.click("#file-test");
  await page.fill("#editor", STACK_TEST + "\nfunc TestForever(t *testing.T) {\n\tfor {\n\t}\n}\n");
  await page.click("#run-btn");
  await page.waitForFunction(() => /stopped|PASS|FAIL/.test(document.querySelector("#pane-status")?.textContent ?? ""), null, { timeout: 60_000 });
  await ok("a hung run is stopped", (await page.locator("#pane-status").innerText()) === "stopped", await page.locator("#pane-status").innerText());
  await page.fill("#editor", STACK_TEST);
  await page.waitForFunction(() => !document.querySelector("#run-btn").disabled, null, { timeout: 60_000 });
  await page.click("#run-btn");
  await page.waitForFunction(() => /^(PASS|FAIL)|failed|stopped/.test(document.querySelector("#pane-status")?.textContent ?? ""), null, { timeout: 60_000 });
  await ok("runs again after a restart", (await page.locator("#pane-status").innerText()).startsWith("PASS"), await page.locator("#run-output").innerText());

  // ---- persistence, offline ----
  await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === "activated", null, { timeout: 30_000 });
  await page.reload();
  await ok("unit survives a reload", (await page.inputValue("#editor")).includes("TestPushPop"));
  await page.waitForFunction(() => !document.querySelector("#run-btn").disabled, null, { timeout: 60_000 });
  await ok("toolchain survives a reload; no card", (await page.locator("download-card .card").count()) === 0);
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => !document.querySelector("#run-btn").disabled, null, { timeout: 60_000 });
  await page.click("#run-btn");
  await page.waitForFunction(() => /^(PASS|FAIL)|failed|stopped/.test(document.querySelector("#pane-status")?.textContent ?? ""), null, { timeout: 60_000 });
  await ok("runs tests offline", (await page.locator("#pane-status").innerText()).startsWith("PASS"));
  await context.setOffline(false);

  // ---- delete ----
  page.once("dialog", (d) => d.accept());
  await page.click("#unit-menu-btn");
  await page.click("#delete-btn");
  await ok("deleting goes back to an empty list", (await page.locator("unit-list").innerText()).includes("No units yet"));

  await ok("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
});
