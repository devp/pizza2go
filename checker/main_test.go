package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// importcfg for the host's stdlib, so check() can run natively.
func hostImportcfg(t *testing.T) string {
	t.Helper()
	out, err := exec.Command("go", "list", "-export", "-deps", "-f", "{{if .Export}}packagefile {{.ImportPath}}={{.Export}}{{end}}", "fmt", "testing", "strings", "errors").Output()
	if err != nil {
		t.Fatal(err)
	}
	p := filepath.Join(t.TempDir(), "importcfg")
	if err := os.WriteFile(p, out, 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func run(t *testing.T, cfg string, src, test string) response {
	t.Helper()
	files := map[string]string{"hello.go": src}
	if test != "" {
		files["hello_test.go"] = test
	}
	return check(request{Pkg: "hello", Files: files}, cfg)
}

func msgs(r response, source string) string {
	var b []string
	for _, d := range r.Diagnostics {
		if source == "" || d.Source == source {
			b = append(b, d.Msg)
		}
	}
	return strings.Join(b, "\n")
}

func TestCheck(t *testing.T) {
	cfg := hostImportcfg(t)

	t.Run("clean", func(t *testing.T) {
		r := run(t, cfg, "package hello\n\nfunc F() int { return 1 }\n", "")
		if len(r.Diagnostics) != 0 {
			t.Fatal(msgs(r, ""))
		}
		if r.Formatted["hello.go"] != "package hello\n\nfunc F() int { return 1 }\n" {
			t.Fatalf("formatted: %q", r.Formatted["hello.go"])
		}
	})

	t.Run("type error with position", func(t *testing.T) {
		r := run(t, cfg, "package hello\n\nfunc F() int { return \"x\" }\n", "")
		if len(r.Diagnostics) != 1 || r.Diagnostics[0].Source != "type" || r.Diagnostics[0].Line != 3 {
			t.Fatalf("%+v", r.Diagnostics)
		}
	})

	t.Run("syntax error, no formatted output", func(t *testing.T) {
		r := run(t, cfg, "package hello\n\nfunc F( {\n", "")
		if msgs(r, "syntax") == "" {
			t.Fatalf("%+v", r.Diagnostics)
		}
		if _, ok := r.Formatted["hello.go"]; ok {
			t.Fatal("formatted a file that doesn't parse")
		}
	})

	t.Run("gofmt output differs from unformatted source", func(t *testing.T) {
		r := run(t, cfg, "package hello\nfunc F()   int {return 1}\n", "")
		if r.Formatted["hello.go"] != "package hello\n\nfunc F() int { return 1 }\n" {
			t.Fatalf("%q", r.Formatted["hello.go"])
		}
	})

	t.Run("vet printf", func(t *testing.T) {
		r := run(t, cfg, "package hello\n\nimport \"fmt\"\n\nfunc F() string { return fmt.Sprintf(\"%d\", \"x\") }\n", "")
		if !strings.Contains(msgs(r, "vet"), "Sprintf format %d has arg") {
			t.Fatalf("%+v", r.Diagnostics)
		}
	})

	t.Run("vet skipped when it doesn't type-check", func(t *testing.T) {
		r := run(t, cfg, "package hello\n\nimport \"fmt\"\n\nfunc F() int { return fmt.Sprintf(\"%d\", \"x\") }\n", "")
		if msgs(r, "vet") != "" || msgs(r, "type") == "" {
			t.Fatalf("%+v", r.Diagnostics)
		}
	})

	t.Run("tests, benchmarks, fuzz, examples, TestMain", func(t *testing.T) {
		test := `package hello

import (
	"fmt"
	"testing"
)

func TestA(t *testing.T)      {}
func Testlower(t *testing.T)  {}
func TestWrongSig(x int)      {}
func BenchmarkB(b *testing.B) {}
func FuzzC(f *testing.F)      {}
func TestMain(m *testing.M)   { m.Run() }

func ExampleF() {
	fmt.Println("hi")
	// Output: hi
}

func ExampleG() {
	fmt.Println("no output comment")
}

func Example_unordered() {
	fmt.Println(1)
	fmt.Println(2)
	// Unordered output:
	// 2
	// 1
}
`
		r := run(t, cfg, "package hello\n", test)
		var got []string
		for _, tf := range r.Tests {
			s := tf.Kind + ":" + tf.Name
			if tf.Output != nil {
				s += "=" + strings.TrimSpace(*tf.Output)
			}
			if tf.Unordered {
				s += "(unordered)"
			}
			got = append(got, s)
		}
		want := "test:TestA benchmark:BenchmarkB fuzz:FuzzC example:ExampleF=hi example:ExampleG example:Example_unordered=2\n1(unordered)"
		if strings.Join(got, " ") != want {
			t.Fatalf("got  %s\nwant %s", strings.Join(got, " "), want)
		}
		if !r.HasTestMain {
			t.Fatal("TestMain not found")
		}
	})

	t.Run("external test package", func(t *testing.T) {
		r := run(t, cfg, "package hello\n", "package hello_test\n")
		if !strings.Contains(msgs(r, "unit"), "external test packages") {
			t.Fatalf("%+v", r.Diagnostics)
		}
	})

	t.Run("wrong package name", func(t *testing.T) {
		r := run(t, cfg, "package other\n", "")
		if !strings.Contains(msgs(r, "unit"), "package other, but this unit is package hello") {
			t.Fatalf("%+v", r.Diagnostics)
		}
	})

	t.Run("import outside the allowlist", func(t *testing.T) {
		r := run(t, cfg, "package hello\n\nimport \"net/http\"\n\nvar _ = http.Get\n", "")
		if !strings.Contains(msgs(r, "type"), "allowlist") {
			t.Fatalf("%+v", r.Diagnostics)
		}
	})
}
