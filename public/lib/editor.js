// Text helpers for the code editor (a plain textarea). Pure functions over
// strings and offsets, so they're testable without a DOM.
//
// Go reports columns in bytes of UTF-8; a textarea counts UTF-16 code units.
// lineColAt/offsetAt convert between the two.

const enc = new TextEncoder();

/**
 * 1-based line and byte column of an offset into text.
 * @param {string} text
 * @param {number} offset
 */
export function lineColAt(text, offset) {
  const before = text.slice(0, offset);
  const lineStart = before.lastIndexOf("\n") + 1;
  return { line: before.split("\n").length, col: enc.encode(before.slice(lineStart)).length + 1 };
}

/**
 * Offset of a 1-based line and byte column, clamped to the text.
 * @param {string} text
 * @param {number} line
 * @param {number} col
 */
export function offsetAt(text, line, col) {
  let start = 0;
  for (let l = 1; l < line; l++) {
    const nl = text.indexOf("\n", start);
    if (nl === -1) return text.length;
    start = nl + 1;
  }
  const end = text.indexOf("\n", start) === -1 ? text.length : text.indexOf("\n", start);
  let bytes = 0;
  let i = start;
  while (i < end && bytes < col - 1) {
    const cp = /** @type {number} */ (text.codePointAt(i));
    bytes += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
    i += cp > 0xffff ? 2 : 1;
  }
  return i;
}

/**
 * What Enter inserts: a newline plus the current line's indentation, one tab
 * deeper after an opening bracket. Between a pair like {|} the closer goes on
 * its own line. Returns the text and where the caret lands within it.
 * @param {string} text
 * @param {number} at caret offset (start of selection)
 * @param {number} [end] end of selection, replaced
 */
export function newline(text, at, end = at) {
  const lineStart = text.lastIndexOf("\n", at - 1) + 1;
  const indent = /** @type {string} */ (text.slice(lineStart, at).match(/^[\t ]*/)?.[0]);
  const before = text.slice(lineStart, at).trimEnd();
  const opener = /[{(\[]$/.test(before);
  const next = text.slice(end).match(/^[\t ]*(.)/)?.[1];
  const closes = opener && next !== undefined && "})]".includes(next) && "{([".indexOf(before.at(-1) ?? "") === "})]".indexOf(next);
  if (closes) {
    const first = "\n" + indent + "\t";
    return { insert: first + "\n" + indent, caret: first.length };
  }
  const insert = "\n" + indent + (opener ? "\t" : "");
  return { insert, caret: insert.length };
}

/**
 * Remove one level of indentation (a tab, or up to 4 spaces) from the line holding offset.
 * @param {string} text
 * @param {number} at
 * @returns {{text: string, removed: number, lineStart: number}}
 */
export function dedent(text, at) {
  const lineStart = text.lastIndexOf("\n", at - 1) + 1;
  const m = text.slice(lineStart).match(/^(\t| {1,4})/);
  if (!m) return { text, removed: 0, lineStart };
  return { text: text.slice(0, lineStart) + text.slice(lineStart + m[0].length), removed: m[0].length, lineStart };
}
