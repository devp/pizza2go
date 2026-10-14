import { test } from "node:test";
import assert from "node:assert/strict";
import { nameProblem, template, hashOf, statusOf } from "../lib/units.js";
import { testmain } from "../lib/testmain.js";

test("nameProblem", () => {
  assert.equal(nameProblem("stack"), "");
  assert.equal(nameProblem("ring2"), "");
  assert.match(nameProblem("Stack"), /lowercase/);
  assert.match(nameProblem("my_pkg"), /lowercase/);
  assert.match(nameProblem("func"), /keyword/);
  assert.match(nameProblem("main"), /main/);
  assert.match(nameProblem("stack", ["stack"]), /already/);
});

test("template", () => {
  const t = template("stack");
  assert.equal(t.go, "package stack\n");
  assert.match(t.test, /^package stack\n\nimport "testing"\n\nfunc TestStack\(t \*testing\.T\) \{/);
});

test("statusOf", () => {
  const src = { go: "a", test: "b" };
  const h = hashOf(src);
  assert.notEqual(h, hashOf({ go: "a", test: "c" }));
  assert.equal(statusOf(undefined, h), "new");
  assert.equal(statusOf({ run: { hash: "x", ok: true, at: 0 } }, h), "stale");
  assert.equal(statusOf({ run: { hash: h, ok: false, at: 0 } }, h), "fail");
  assert.equal(statusOf({ run: { hash: h, ok: true, at: 0 } }, h), "pass");
  assert.equal(statusOf({ run: { hash: h, ok: true, at: 0 }, check: { hash: h, problems: 0, gofmt: true } }, h), "done");
  assert.equal(statusOf({ run: { hash: h, ok: true, at: 0 }, check: { hash: h, problems: 1, gofmt: true } }, h), "pass");
});

test("testmain lists tests and runs only examples with output", () => {
  const src = testmain("stack", [
    { name: "TestPush", kind: "test" },
    { name: "BenchmarkPush", kind: "benchmark" },
    { name: "ExampleNew", kind: "example", output: "1\n2\n", unordered: true },
    { name: "ExampleNoOutput", kind: "example" },
  ], false);
  assert.match(src, /\{"TestPush", _test\.TestPush\}/);
  assert.match(src, /\{"BenchmarkPush", _test\.BenchmarkPush\}/);
  assert.match(src, /\{"ExampleNew", _test\.ExampleNew, "1\\n2\\n", true\}/);
  assert.doesNotMatch(src, /ExampleNoOutput/);
  assert.match(src, /os\.Exit\(m\.Run\(\)\)/);
  assert.match(testmain("stack", [], true), /_test\.TestMain\(m\)/);
});
