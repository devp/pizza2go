// A unit is one Go package: <name>.go and <name>_test.go, stdlib only.

const KEYWORDS = new Set(
  "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var".split(" ")
);

/**
 * Why name can't be a unit's package name, or "" if it can. Lowercase
 * letters and digits only, as Go style asks; not a keyword; not main, which
 * can't be imported by a test binary.
 * @param {string} name
 * @param {string[]} [taken]
 */
export function nameProblem(name, taken = []) {
  if (!/^[a-z][a-z0-9]*$/.test(name)) return "lowercase letters and digits, starting with a letter";
  if (KEYWORDS.has(name)) return `${name} is a Go keyword`;
  if (name === "main") return "main can't be tested as a unit";
  if (taken.includes(name)) return `there's already a unit called ${name}`;
  return "";
}

/** @param {string} pkg */
export function template(pkg) {
  const Title = pkg[0].toUpperCase() + pkg.slice(1);
  return {
    go: `package ${pkg}\n`,
    test: `package ${pkg}\n\nimport "testing"\n\nfunc Test${Title}(t *testing.T) {\n\tt.Error("no tests yet")\n}\n`,
  };
}

/**
 * @param {string} pkg
 * @param {{go: string, test: string}} src
 * @returns {Record<string, string>}
 */
export const filesOf = (pkg, src) => ({ [`${pkg}.go`]: src.go, [`${pkg}_test.go`]: src.test });

/**
 * FNV-1a over both files: tells whether a stored result is for the current code.
 * @param {{go: string, test: string}} src
 */
export function hashOf(src) {
  let h = 0x811c9dc5;
  for (const ch of src.go + "\u0000" + src.test) {
    h ^= /** @type {number} */ (ch.codePointAt(0));
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/**
 * @typedef {{hash: string, problems: number, gofmt: boolean}} CheckRecord
 * @typedef {{hash: string, ok: boolean, at: number}} RunRecord
 * @typedef {{check?: CheckRecord, run?: RunRecord}} Results
 */

/**
 * done: tests pass, no problems (type errors or vet), gofmt'd -- all for the current code.
 * @param {Results|undefined} r
 * @param {string} hash
 * @returns {"done"|"pass"|"fail"|"stale"|"new"}
 */
export function statusOf(r, hash) {
  const run = r?.run;
  if (!run) return "new";
  if (run.hash !== hash) return "stale";
  if (!run.ok) return "fail";
  const c = r?.check;
  return c && c.hash === hash && c.problems === 0 && c.gofmt ? "done" : "pass";
}
