// checker: parse + typecheck + gofmt one package. Usage: checker <req.json> (JSON {"Files":{name:src}}),
// with /importcfg mapping import paths to export-data archives. Prints JSON diagnostics and formatted sources.
package main

import (
	"encoding/json"
	"go/ast"
	"go/format"
	"go/importer"
	"go/parser"
	"go/token"
	"go/types"
	"io"
	"os"
	"strings"
)

type diag struct {
	File string `json:"file"`
	Line int    `json:"line"`
	Col  int    `json:"col"`
	Msg  string `json:"msg"`
}

func main() {
	in, err := os.ReadFile(os.Args[1])
	if err != nil {
		os.Stderr.WriteString(err.Error())
		os.Exit(2)
	}
	var req struct{ Files map[string]string }
	if err := json.Unmarshal(in, &req); err != nil {
		os.Stderr.WriteString(err.Error())
		os.Exit(2)
	}
	fset := token.NewFileSet()
	var files []*ast.File
	var diags []diag
	formatted := map[string]string{}
	for name, src := range req.Files {
		f, err := parser.ParseFile(fset, name, src, parser.AllErrors|parser.ParseComments)
		if err != nil {
			diags = append(diags, diag{File: name, Msg: err.Error()})
			continue
		}
		files = append(files, f)
		if out, err := format.Source([]byte(src)); err == nil {
			formatted[name] = string(out)
		}
	}
	cfg := types.Config{
		Importer: importer.ForCompiler(fset, "gc", lookup(readImportcfg("/importcfg"))),
		Error: func(err error) {
			if te, ok := err.(types.Error); ok {
				p := fset.Position(te.Pos)
				diags = append(diags, diag{p.Filename, p.Line, p.Column, te.Msg})
			}
		},
	}
	cfg.Check("p", fset, files, nil)
	json.NewEncoder(os.Stdout).Encode(map[string]any{"diagnostics": diags, "formatted": formatted})
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
			return nil, os.ErrNotExist
		}
		return os.Open(f)
	}
}
