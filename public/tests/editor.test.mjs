import { test } from "node:test";
import assert from "node:assert/strict";
import { lineColAt, offsetAt, newline, dedent } from "../lib/editor.js";

test("lineColAt/offsetAt round-trip, with Go's byte columns", () => {
  const text = "package x\n\nvar s = \"héllo\" // x\n";
  const off = text.indexOf("//");
  const lc = lineColAt(text, off);
  assert.deepEqual(lc, { line: 3, col: 18 }); // é is 2 bytes
  assert.equal(offsetAt(text, lc.line, lc.col), off);
  assert.equal(offsetAt(text, 99, 1), text.length);
  assert.equal(offsetAt(text, 1, 999), "package x".length);
});

test("newline keeps indentation", () => {
  const t = "func f() {\n\tx := 1";
  assert.deepEqual(newline(t, t.length), { insert: "\n\t", caret: 2 });
});

test("newline indents after an opener", () => {
  const t = "func f() {";
  assert.deepEqual(newline(t, t.length), { insert: "\n\t", caret: 2 });
});

test("newline between a pair puts the closer on its own line", () => {
  const t = "\tif x {}";
  const r = newline(t, t.length - 1);
  assert.equal(r.insert, "\n\t\t\n\t");
  assert.equal(r.caret, 3);
});

test("newline doesn't split mismatched pairs", () => {
  const t = "f(}";
  assert.equal(newline(t, 2).insert, "\n\t");
});

test("dedent removes one tab", () => {
  assert.deepEqual(dedent("a\n\t\tb", 4), { text: "a\n\tb", removed: 1, lineStart: 2 });
  assert.equal(dedent("a\nb", 3).removed, 0);
});
