package main

// A minimal go/analysis driver for one package already parsed and type-checked
// in memory: runs each analyzer after the ones it requires, and keeps facts in
// a map (they never cross a package boundary here, since the stdlib's facts
// aren't available; analyzers treat a missing fact as "nothing known").

import (
	"go/ast"
	"go/token"
	"go/types"
	"reflect"
	"sort"

	"golang.org/x/tools/go/analysis"
	"golang.org/x/tools/go/analysis/passes/appends"
	"golang.org/x/tools/go/analysis/passes/assign"
	"golang.org/x/tools/go/analysis/passes/atomic"
	"golang.org/x/tools/go/analysis/passes/bools"
	"golang.org/x/tools/go/analysis/passes/composite"
	"golang.org/x/tools/go/analysis/passes/copylock"
	"golang.org/x/tools/go/analysis/passes/defers"
	"golang.org/x/tools/go/analysis/passes/errorsas"
	"golang.org/x/tools/go/analysis/passes/ifaceassert"
	"golang.org/x/tools/go/analysis/passes/loopclosure"
	"golang.org/x/tools/go/analysis/passes/lostcancel"
	"golang.org/x/tools/go/analysis/passes/nilfunc"
	"golang.org/x/tools/go/analysis/passes/printf"
	"golang.org/x/tools/go/analysis/passes/shift"
	"golang.org/x/tools/go/analysis/passes/sigchanyzer"
	"golang.org/x/tools/go/analysis/passes/slog"
	"golang.org/x/tools/go/analysis/passes/stdmethods"
	"golang.org/x/tools/go/analysis/passes/stringintconv"
	"golang.org/x/tools/go/analysis/passes/structtag"
	"golang.org/x/tools/go/analysis/passes/testinggoroutine"
	"golang.org/x/tools/go/analysis/passes/tests"
	"golang.org/x/tools/go/analysis/passes/timeformat"
	"golang.org/x/tools/go/analysis/passes/unmarshal"
	"golang.org/x/tools/go/analysis/passes/unreachable"
	"golang.org/x/tools/go/analysis/passes/unusedresult"
	"golang.org/x/tools/go/analysis/passes/waitgroup"
)

// go vet's default analyzers, minus the ones about assembly, cgo, build tags,
// directives, module Go versions and frame pointers: none apply to a one-package
// unit in the browser.
var analyzers = []*analysis.Analyzer{
	appends.Analyzer,
	assign.Analyzer,
	atomic.Analyzer,
	bools.Analyzer,
	composite.Analyzer,
	copylock.Analyzer,
	defers.Analyzer,
	errorsas.Analyzer,
	ifaceassert.Analyzer,
	loopclosure.Analyzer,
	lostcancel.Analyzer,
	nilfunc.Analyzer,
	printf.Analyzer,
	shift.Analyzer,
	sigchanyzer.Analyzer,
	slog.Analyzer,
	stdmethods.Analyzer,
	stringintconv.Analyzer,
	structtag.Analyzer,
	testinggoroutine.Analyzer,
	tests.Analyzer,
	timeformat.Analyzer,
	unmarshal.Analyzer,
	unreachable.Analyzer,
	unusedresult.Analyzer,
	waitgroup.Analyzer,
}

type vetDiag struct {
	pos token.Pos
	msg string
}

type factKey struct {
	obj types.Object // nil for package facts
	typ reflect.Type
}

func vet(fset *token.FileSet, files []*ast.File, pkg *types.Package, info *types.Info) []vetDiag {
	var diags []vetDiag
	results := map[*analysis.Analyzer]any{}
	facts := map[factKey]analysis.Fact{}
	running := map[*analysis.Analyzer]bool{}

	var run func(a *analysis.Analyzer, report bool)
	run = func(a *analysis.Analyzer, report bool) {
		if _, done := results[a]; done || running[a] {
			return
		}
		running[a] = true
		for _, req := range a.Requires {
			run(req, false)
		}
		resultOf := map[*analysis.Analyzer]any{}
		for _, req := range a.Requires {
			resultOf[req] = results[req]
		}
		pass := &analysis.Pass{
			Analyzer:   a,
			Fset:       fset,
			Files:      files,
			Pkg:        pkg,
			TypesInfo:  info,
			TypesSizes: types.SizesFor("gc", "wasm"),
			ResultOf:   resultOf,
			Report: func(d analysis.Diagnostic) {
				if report {
					diags = append(diags, vetDiag{d.Pos, d.Message})
				}
			},
			ReadFile: func(string) ([]byte, error) { return nil, errNoFiles },
			ImportObjectFact: func(obj types.Object, fact analysis.Fact) bool {
				return importFact(facts, factKey{obj, reflect.TypeOf(fact)}, fact)
			},
			ExportObjectFact: func(obj types.Object, fact analysis.Fact) {
				facts[factKey{obj, reflect.TypeOf(fact)}] = fact
			},
			ImportPackageFact: func(p *types.Package, fact analysis.Fact) bool {
				return p == pkg && importFact(facts, factKey{nil, reflect.TypeOf(fact)}, fact)
			},
			ExportPackageFact: func(fact analysis.Fact) {
				facts[factKey{nil, reflect.TypeOf(fact)}] = fact
			},
			AllObjectFacts: func() []analysis.ObjectFact {
				var out []analysis.ObjectFact
				for k, f := range facts {
					if k.obj != nil {
						out = append(out, analysis.ObjectFact{Object: k.obj, Fact: f})
					}
				}
				return out
			},
			AllPackageFacts: func() []analysis.PackageFact {
				var out []analysis.PackageFact
				for k, f := range facts {
					if k.obj == nil {
						out = append(out, analysis.PackageFact{Package: pkg, Fact: f})
					}
				}
				return out
			},
		}
		res, err := a.Run(pass)
		if err != nil {
			// An analyzer that can't cope is dropped, not fatal.
			res = nil
		}
		results[a] = res
		running[a] = false
	}
	for _, a := range analyzers {
		run(a, true)
	}
	sort.SliceStable(diags, func(i, j int) bool { return diags[i].pos < diags[j].pos })
	return diags
}

// importFact copies a stored fact into the caller's (pointer) fact value.
func importFact(facts map[factKey]analysis.Fact, k factKey, into analysis.Fact) bool {
	f, ok := facts[k]
	if !ok {
		return false
	}
	reflect.ValueOf(into).Elem().Set(reflect.ValueOf(f).Elem())
	return true
}

type noFiles struct{}

func (noFiles) Error() string { return "no files outside the unit" }

var errNoFiles error = noFiles{}
