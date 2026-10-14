// checker: everything pizza2go knows about a unit without compiling it.
// Parse, type-check (against the stdlib export data named in /importcfg),
// gofmt, find the tests, and run go vet's analyzers that work on one package.
//
// Usage: checker <request.json>. The request is {"pkg": name, "files": {filename: source}}.
// Prints one JSON object (see response). Runs on wasip1, one instance per request.
package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/doc"
	"go/format"
	"go/importer"
	"go/parser"
	"go/scanner"
	"go/token"
	"go/types"
	"io"
	"os"
	"sort"
	"strings"
)

type request struct {
	Pkg   string            `json:"pkg"`
	Files map[string]string `json:"files"`
}

type diagnostic struct {
	File   string `json:"file"`
	Line   int    `json:"line"`
	Col    int    `json:"col"`
	Msg    string `json:"msg"`
	Source string `json:"source"` // syntax, type, vet, unit
}

type testFunc struct {
	Name string `json:"name"`
	Kind string `json:"kind"` // test, benchmark, fuzz, example
	// Examples only: the expected output, and whether lines may come in any order.
	// An example without an output comment is compiled but not run, as with go test.
	Output    *string `json:"output,omitempty"`
	Unordered bool    `json:"unordered,omitempty"`
}

type response struct {
	Diagnostics []diagnostic `json:"diagnostics"`
	// Formatted source per file; absent when the file doesn't parse.
	Formatted   map[string]string `json:"formatted"`
	Tests       []testFunc        `json:"tests"`
	HasTestMain bool              `json:"hasTestMain"`
}

func main() {
	if len(os.Args) != 2 {
		fail("usage: checker request.json")
	}
	b, err := os.ReadFile(os.Args[1])
	if err != nil {
		fail(err.Error())
	}
	var req request
	if err := json.Unmarshal(b, &req); err != nil {
		fail(err.Error())
	}
	res := check(req, "/importcfg")
	if err := json.NewEncoder(os.Stdout).Encode(res); err != nil {
		fail(err.Error())
	}
}

func fail(msg string) {
	fmt.Fprintln(os.Stderr, msg)
	os.Exit(2)
}

func check(req request, importcfg string) response {
	res := response{Diagnostics: []diagnostic{}, Formatted: map[string]string{}, Tests: []testFunc{}}
	fset := token.NewFileSet()
	report := func(pos token.Pos, source, msg string) {
		p := fset.Position(pos)
		res.Diagnostics = append(res.Diagnostics, diagnostic{File: p.Filename, Line: p.Line, Col: p.Column, Msg: msg, Source: source})
	}

	names := make([]string, 0, len(req.Files))
	for name := range req.Files {
		names = append(names, name)
	}
	sort.Strings(names)

	var files []*ast.File
	var testFile *ast.File
	for _, name := range names {
		src := req.Files[name]
		f, err := parser.ParseFile(fset, name, src, parser.AllErrors|parser.ParseComments)
		if err != nil {
			if list, ok := err.(scanner.ErrorList); ok {
				for _, e := range list {
					res.Diagnostics = append(res.Diagnostics, diagnostic{File: name, Line: e.Pos.Line, Col: e.Pos.Column, Msg: e.Msg, Source: "syntax"})
				}
			} else {
				res.Diagnostics = append(res.Diagnostics, diagnostic{File: name, Line: 1, Col: 1, Msg: err.Error(), Source: "syntax"})
			}
			continue
		}
		if out, err := format.Source([]byte(src)); err == nil {
			res.Formatted[name] = string(out)
		}
		switch got := f.Name.Name; {
		case got == req.Pkg:
		case strings.HasSuffix(name, "_test.go") && got == req.Pkg+"_test":
			report(f.Name.Pos(), "unit", fmt.Sprintf("external test packages aren't supported yet: use package %s", req.Pkg))
			continue
		default:
			report(f.Name.Pos(), "unit", fmt.Sprintf("package %s, but this unit is package %s", got, req.Pkg))
			continue
		}
		files = append(files, f)
		if strings.HasSuffix(name, "_test.go") {
			testFile = f
		}
	}
	if len(files) == 0 {
		return res
	}

	info := &types.Info{
		Types:        map[ast.Expr]types.TypeAndValue{},
		Instances:    map[*ast.Ident]types.Instance{},
		Defs:         map[*ast.Ident]types.Object{},
		Uses:         map[*ast.Ident]types.Object{},
		Implicits:    map[ast.Node]types.Object{},
		Selections:   map[*ast.SelectorExpr]*types.Selection{},
		Scopes:       map[ast.Node]*types.Scope{},
		FileVersions: map[*ast.File]string{},
	}
	typeErrors := 0
	conf := types.Config{
		Importer: importer.ForCompiler(fset, "gc", lookup(readImportcfg(importcfg))),
		Sizes:    types.SizesFor("gc", "wasm"),
		Error: func(err error) {
			if te, ok := err.(types.Error); ok {
				typeErrors++
				report(te.Pos, "type", te.Msg)
			}
		},
	}
	pkg, _ := conf.Check(req.Pkg, fset, files, info)

	if testFile != nil {
		res.Tests, res.HasTestMain = findTests(testFile, info)
	}
	// Like go vet: analyzers assume code that type-checks.
	if typeErrors == 0 && !hasSyntaxErrors(res.Diagnostics) {
		for _, d := range vet(fset, files, pkg, info) {
			report(d.pos, "vet", d.msg)
		}
	}
	sort.SliceStable(res.Diagnostics, func(i, j int) bool {
		a, b := res.Diagnostics[i], res.Diagnostics[j]
		if a.File != b.File {
			return a.File < b.File
		}
		if a.Line != b.Line {
			return a.Line < b.Line
		}
		return a.Col < b.Col
	})
	return res
}

func hasSyntaxErrors(ds []diagnostic) bool {
	for _, d := range ds {
		if d.Source == "syntax" || d.Source == "unit" {
			return true
		}
	}
	return false
}

// findTests lists what go test would run from one test file, by go test's own
// rules: TestXxx(*testing.T), BenchmarkXxx(*testing.B), FuzzXxx(*testing.F),
// ExampleXxx() with an output comment, and TestMain(*testing.M).
func findTests(f *ast.File, info *types.Info) (tests []testFunc, hasTestMain bool) {
	tests = []testFunc{}
	for _, decl := range f.Decls {
		fn, ok := decl.(*ast.FuncDecl)
		if !ok || fn.Recv != nil || fn.Type.TypeParams != nil {
			continue
		}
		name := fn.Name.Name
		if name == "TestMain" && takes(fn, info, "M") {
			hasTestMain = true
			continue
		}
		switch {
		case isTest(name, "Test") && takes(fn, info, "T"):
			tests = append(tests, testFunc{Name: name, Kind: "test"})
		case isTest(name, "Benchmark") && takes(fn, info, "B"):
			tests = append(tests, testFunc{Name: name, Kind: "benchmark"})
		case isTest(name, "Fuzz") && takes(fn, info, "F"):
			tests = append(tests, testFunc{Name: name, Kind: "fuzz"})
		}
	}
	for _, ex := range doc.Examples(f) {
		t := testFunc{Name: "Example" + ex.Name, Kind: "example", Unordered: ex.Unordered}
		if ex.Output != "" || ex.EmptyOutput {
			out := ex.Output
			t.Output = &out
		}
		tests = append(tests, t)
	}
	return tests, hasTestMain
}

// isTest reports whether name is prefix followed by nothing or a non-lowercase rune (go test's rule).
func isTest(name, prefix string) bool {
	if !strings.HasPrefix(name, prefix) {
		return false
	}
	rest := name[len(prefix):]
	return rest == "" || !(rest[0] >= 'a' && rest[0] <= 'z')
}

// takes reports whether fn has exactly one parameter, of type *testing.<typ>, and no results.
func takes(fn *ast.FuncDecl, info *types.Info, typ string) bool {
	obj, ok := info.Defs[fn.Name].(*types.Func)
	if !ok {
		return false
	}
	sig := obj.Type().(*types.Signature)
	if sig.Params().Len() != 1 || sig.Results().Len() != 0 {
		return false
	}
	ptr, ok := sig.Params().At(0).Type().(*types.Pointer)
	if !ok {
		return false
	}
	named, ok := ptr.Elem().(*types.Named)
	return ok && named.Obj().Pkg() != nil && named.Obj().Pkg().Path() == "testing" && named.Obj().Name() == typ
}

func readImportcfg(name string) map[string]string {
	m := map[string]string{}
	b, _ := os.ReadFile(name)
	for _, l := range strings.Split(string(b), "\n") {
		if rest, ok := strings.CutPrefix(l, "packagefile "); ok {
			if k, v, ok := strings.Cut(rest, "="); ok {
				m[k] = v
			}
		}
	}
	return m
}

func lookup(m map[string]string) importer.Lookup {
	return func(path string) (io.ReadCloser, error) {
		f, ok := m[path]
		if !ok {
			return nil, fmt.Errorf("package %s is not in pizza2go's stdlib allowlist", path)
		}
		return os.Open(f)
	}
}
