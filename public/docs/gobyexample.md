# Go by Example

<p class="doc-source">By Mark McGranaghan and Eli Bendersky, <a target="_blank" rel="noopener" href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>; from <a target="_blank" rel="noopener" href="https://gobyexample.com">gobyexample.com</a> (mmcgrana/gobyexample 28c81a7), reformatted for this app. Examples that use packages outside pizza2go's allowlist (net/http, os/exec, ...) won't run in a unit.</p>

## Hello World

Our first program will print the classic "hello world"
message. Here's the full source code.

```go
package main

import "fmt"

func main() {
	fmt.Println("hello world")
}
```

```console
$ go run hello-world.go
hello world

$ go build hello-world.go
$ ls
hello-world	hello-world.go

$ ./hello-world
hello world
```

## Values

Go has various value types including strings,
integers, floats, booleans, etc. Here are a few
basic examples.

```go
package main

import "fmt"

func main() {
```

Strings, which can be added together with `+`.

```go
fmt.Println("go" + "lang")
```

Integers and floats.

```go
fmt.Println("1+1 =", 1+1)
	fmt.Println("7.0/3.0 =", 7.0/3.0)
```

Booleans, with boolean operators as you'd expect.

```go
fmt.Println(true && false)
	fmt.Println(true || false)
	fmt.Println(!true)
}
```

```console
$ go run values.go
golang
1+1 = 2
7.0/3.0 = 2.3333333333333335
false
true
false
```

## Variables

In Go, _variables_ are explicitly declared and used by
the compiler to e.g. check type-correctness of function
calls.

```go
package main

import "fmt"

func main() {
```

`var` declares 1 or more variables.

```go
var a = "initial"
	fmt.Println(a)
```

You can declare multiple variables at once.

```go
var b, c int = 1, 2
	fmt.Println(b, c)
```

Go will infer the type of initialized variables.

```go
var d = true
	fmt.Println(d)
```

Variables declared without a corresponding
initialization are _zero-valued_. For example, the
zero value for an `int` is `0`.

```go
var e int
	fmt.Println(e)
```

The `:=` syntax is shorthand for declaring and
initializing a variable, e.g. for
`var f string = "apple"` in this case.
This syntax is only available inside functions.

```go
f := "apple"
	fmt.Println(f)
}
```

```console
$ go run variables.go
initial
1 2
true
0
apple
```

## Constants

Go supports _constants_ of character, string, boolean,
and numeric values.

```go
package main

import (
	"fmt"
	"math"
)
```

`const` declares a constant value.

```go
const s string = "constant"

func main() {
	fmt.Println(s)
```

A `const` statement can also appear inside a
function body.

```go
const n = 500000000
```

Constant expressions perform arithmetic with
arbitrary precision.

```go
const d = 3e20 / n
	fmt.Println(d)
```

A numeric constant has no type until it's given
one, such as by an explicit conversion.

```go
fmt.Println(int64(d))
```

A number can be given a type by using it in a
context that requires one, such as a variable
assignment or function call. For example, here
`math.Sin` expects a `float64`.

```go
fmt.Println(math.Sin(n))
}
```

```console
$ go run constant.go 
constant
6e+11
600000000000
-0.28470407323754404
```

## For

`for` is Go's only looping construct. Here are
some basic types of `for` loops.

```go
package main

import "fmt"

func main() {
```

The most basic type, with a single condition.

```go
i := 1
	for i <= 3 {
		fmt.Println(i)
		i = i + 1
	}
```

A classic initial/condition/after `for` loop.

```go
for j := 0; j < 3; j++ {
		fmt.Println(j)
	}
```

Another way of accomplishing the basic "do this
N times" iteration is `range` over an integer.

```go
for i := range 3 {
		fmt.Println("range", i)
	}
```

`for` without a condition will loop repeatedly
until you `break` out of the loop or `return` from
the enclosing function.

```go
for {
		fmt.Println("loop")
		break
	}
```

You can also `continue` to the next iteration of
the loop.

```go
for n := range 6 {
		if n%2 == 0 {
			continue
		}
		fmt.Println(n)
	}
}
```

```console
$ go run for.go
1
2
3
0
1
2
range 0
range 1
range 2
loop
1
3
5
```

## If/Else

Branching with `if` and `else` in Go is
straight-forward.

```go
package main

import "fmt"

func main() {
```

Here's a basic example.

```go
if 7%2 == 0 {
		fmt.Println("7 is even")
	} else {
		fmt.Println("7 is odd")
	}
```

You can have an `if` statement without an else.

```go
if 8%4 == 0 {
		fmt.Println("8 is divisible by 4")
	}
```

Logical operators like `&&` and `||` are often
useful in conditions.

```go
if 8%2 == 0 || 7%2 == 0 {
		fmt.Println("either 8 or 7 are even")
	}
```

A statement can precede conditionals; any variables
declared in this statement are available in the current
and all subsequent branches.

```go
if num := 9; num < 0 {
		fmt.Println(num, "is negative")
	} else if num < 10 {
		fmt.Println(num, "has 1 digit")
	} else {
		fmt.Println(num, "has multiple digits")
	}
}
```

Note that you don't need parentheses around conditions
in Go, but that the braces are required.

```console
$ go run if-else.go
7 is odd
8 is divisible by 4
either 8 or 7 are even
9 has 1 digit
```

## Switch

_Switch statements_ express conditionals across many
branches.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
```

Here's a basic `switch`.

```go
i := 2
	fmt.Print("Write ", i, " as ")
	switch i {
	case 1:
		fmt.Println("one")
	case 2:
		fmt.Println("two")
	case 3:
		fmt.Println("three")
	}
```

You can use commas to separate multiple expressions
in the same `case` statement. We use the optional
`default` case in this example as well.

```go
switch time.Now().Weekday() {
	case time.Saturday, time.Sunday:
		fmt.Println("It's the weekend")
	default:
		fmt.Println("It's a weekday")
	}
```

`switch` without an expression is an alternate way
to express if/else logic. Here we also show how the
`case` expressions can be non-constants.

```go
t := time.Now()
	switch {
	case t.Hour() < 12:
		fmt.Println("It's before noon")
	default:
		fmt.Println("It's after noon")
	}
```

A type `switch` compares types instead of values.  You
can use this to discover the type of an interface
value.  In this example, the variable `t` will have the
type corresponding to its clause.

```go
whatAmI := func(i any) {
		switch t := i.(type) {
		case bool:
			fmt.Println("I'm a bool")
		case int:
			fmt.Println("I'm an int")
		default:
			fmt.Printf("Don't know type %T\n", t)
		}
	}
	whatAmI(true)
	whatAmI(1)
	whatAmI("hey")
}
```

```console
$ go run switch.go 
Write 2 as two
It's a weekday
It's after noon
I'm a bool
I'm an int
Don't know type string
```

## Arrays

In Go, an _array_ is a numbered sequence of elements of a
specific length. In typical Go code, [slices](slices) are
much more common; arrays are useful in some special
scenarios.

```go
package main

import "fmt"

func main() {
```

Here we create an array `a` that will hold exactly
5 `int`s. The type of elements and length are both
part of the array's type. By default an array is
zero-valued, which for `int`s means `0`s.

```go
var a [5]int
	fmt.Println("emp:", a)
```

We can set a value at an index using the
`array[index] = value` syntax, and get a value with
`array[index]`.

```go
a[4] = 100
	fmt.Println("set:", a)
	fmt.Println("get:", a[4])
```

The builtin `len` returns the length of an array.

```go
fmt.Println("len:", len(a))
```

Use this syntax to declare and initialize an array
in one line.

```go
b := [5]int{1, 2, 3, 4, 5}
	fmt.Println("dcl:", b)
```

You can also have the compiler count the number of
elements for you with `...`

```go
b = [...]int{1, 2, 3, 4, 5}
	fmt.Println("dcl:", b)
```

If you specify the index with `:`, the elements in
between will be zeroed.

```go
b = [...]int{100, 3: 400, 500}
	fmt.Println("idx:", b)
```

Array types are one-dimensional, but you can
compose types to build multi-dimensional data
structures.

```go
var twoD [2][3]int
	for i := range 2 {
		for j := range 3 {
			twoD[i][j] = i + j
		}
	}
	fmt.Println("2d: ", twoD)
```

You can create and initialize multi-dimensional
arrays at once too.

```go
twoD = [2][3]int{
		{1, 2, 3},
		{1, 2, 3},
	}
	fmt.Println("2d: ", twoD)
}
```

```console
$ go run arrays.go
emp: [0 0 0 0 0]
set: [0 0 0 0 100]
get: 100
len: 5
dcl: [1 2 3 4 5]
dcl: [1 2 3 4 5]
idx: [100 0 0 400 500]
2d:  [[0 1 2] [1 2 3]]
2d:  [[1 2 3] [1 2 3]]
```

## Slices

_Slices_ are an important data type in Go, giving
a more powerful interface to sequences than arrays.

```go
package main

import (
	"fmt"
	"slices"
)

func main() {
```

Unlike arrays, slices are typed only by the
elements they contain (not the number of elements).
An uninitialized slice equals to nil and has
length 0.

```go
var s []string
	fmt.Println("uninit:", s, s == nil, len(s) == 0)
```

To create a slice with non-zero length, use
the builtin `make`. Here we make a slice of
`string`s of length `3` (initially zero-valued).
By default a new slice's capacity is equal to its
length; if we know the slice is going to grow ahead
of time, it's possible to pass a capacity explicitly
as an additional parameter to `make`.

```go
s = make([]string, 3)
	fmt.Println("emp:", s, "len:", len(s), "cap:", cap(s))
```

We can set and get just like with arrays.

```go
s[0] = "a"
	s[1] = "b"
	s[2] = "c"
	fmt.Println("set:", s)
	fmt.Println("get:", s[2])
```

`len` returns the length of the slice as expected.

```go
fmt.Println("len:", len(s))
```

In addition to these basic operations, slices
support several more that make them richer than
arrays. One is the builtin `append`, which
returns a slice containing one or more new values.
Note that we need to accept a return value from
`append` as we may get a new slice value.

```go
s = append(s, "d")
	s = append(s, "e", "f")
	fmt.Println("apd:", s)
```

Slices can also be `copy`'d. Here we create an
empty slice `c` of the same length as `s` and copy
into `c` from `s`.

```go
c := make([]string, len(s))
	copy(c, s)
	fmt.Println("cpy:", c)
```

Slices support a "slice" operator with the syntax
`slice[low:high]`. For example, this gets a slice
of the elements `s[2]`, `s[3]`, and `s[4]`.

```go
l := s[2:5]
	fmt.Println("sl1:", l)
```

This slices up to (but excluding) `s[5]`.

```go
l = s[:5]
	fmt.Println("sl2:", l)
```

And this slices up from (and including) `s[2]`.

```go
l = s[2:]
	fmt.Println("sl3:", l)
```

We can declare and initialize a variable for slice
in a single line as well.

```go
t := []string{"g", "h", "i"}
	fmt.Println("dcl:", t)
```

The `slices` package contains a number of useful
utility functions for slices.

```go
t2 := []string{"g", "h", "i"}
	if slices.Equal(t, t2) {
		fmt.Println("t == t2")
	}
```

Slices can be composed into multi-dimensional data
structures. The length of the inner slices can
vary, unlike with multi-dimensional arrays.

```go
twoD := make([][]int, 3)
	for i := range 3 {
		innerLen := i + 1
		twoD[i] = make([]int, innerLen)
		for j := range innerLen {
			twoD[i][j] = i + j
		}
	}
	fmt.Println("2d: ", twoD)
}
```

```console
$ go run slices.go
uninit: [] true true
emp: [  ] len: 3 cap: 3
set: [a b c]
get: c
len: 3
apd: [a b c d e f]
cpy: [a b c d e f]
sl1: [c d e]
sl2: [a b c d e]
sl3: [c d e f]
dcl: [g h i]
t == t2
2d:  [[0] [1 2] [2 3 4]]
```

## Maps

_Maps_ are Go's built-in [associative data type](https://en.wikipedia.org/wiki/Associative_array)
(sometimes called _hashes_ or _dicts_ in other languages).

```go
package main

import (
	"fmt"
	"maps"
)

func main() {
```

To create an empty map, use the builtin `make`:
`make(map[key-type]val-type)`.

```go
m := make(map[string]int)
```

Set key/value pairs using typical `name[key] = val`
syntax.

```go
m["k1"] = 7
	m["k2"] = 13
```

Printing a map with e.g. `fmt.Println` will show all of
its key/value pairs.

```go
fmt.Println("map:", m)
```

Get a value for a key with `name[key]`.

```go
v1 := m["k1"]
	fmt.Println("v1:", v1)
```

If the key doesn't exist, the
[zero value](https://go.dev/ref/spec#The_zero_value) of the
value type is returned.

```go
v3 := m["k3"]
	fmt.Println("v3:", v3)
```

The builtin `len` returns the number of key/value
pairs when called on a map.

```go
fmt.Println("len:", len(m))
```

The builtin `delete` removes key/value pairs from
a map.

```go
delete(m, "k2")
	fmt.Println("map:", m)
```

To remove *all* key/value pairs from a map, use
the `clear` builtin.

```go
clear(m)
	fmt.Println("map:", m)
```

The optional second return value when getting a
value from a map indicates if the key was present
in the map. This can be used to disambiguate
between missing keys and keys with zero values
like `0` or `""`. Here we didn't need the value
itself, so we ignored it with the _blank identifier_
`_`.

```go
_, prs := m["k2"]
	fmt.Println("prs:", prs)
```

You can also declare and initialize a new map in
the same line with this syntax.

```go
n := map[string]int{"foo": 1, "bar": 2}
	fmt.Println("map:", n)
```

The `maps` package contains a number of useful
utility functions for maps.

```go
n2 := map[string]int{"foo": 1, "bar": 2}
	if maps.Equal(n, n2) {
		fmt.Println("n == n2")
	}
}
```

```console
$ go run maps.go 
map: map[k1:7 k2:13]
v1: 7
v3: 0
len: 2
map: map[k1:7]
map: map[]
prs: false
map: map[bar:2 foo:1]
n == n2
```

## Functions

_Functions_ are central in Go. We'll learn about
functions with a few different examples.

```go
package main

import "fmt"
```

Here's a function that takes two `int`s and returns
their sum as an `int`.

```go
func plus(a int, b int) int {
```

Go requires explicit returns, i.e. it won't
automatically return the value of the last
expression.

```go
return a + b
}
```

When you have multiple consecutive parameters of
the same type, you may omit the type name for the
like-typed parameters up to the final parameter that
declares the type.

```go
func plusPlus(a, b, c int) int {
	return a + b + c
}

func main() {
```

Call a function just as you'd expect, with
`name(args)`.

```go
res := plus(1, 2)
	fmt.Println("1+2 =", res)

	res = plusPlus(1, 2, 3)
	fmt.Println("1+2+3 =", res)
}
```

```console
$ go run functions.go 
1+2 = 3
1+2+3 = 6
```

## Multiple Return Values

Go has built-in support for _multiple return values_.
This feature is used often in idiomatic Go, for example
to return both result and error values from a function.

```go
package main

import "fmt"
```

The `(int, int)` in this function signature shows that
the function returns 2 `int`s.

```go
func vals() (int, int) {
	return 3, 7
}

func main() {
```

Here we use the 2 different return values from the
call with _multiple assignment_.

```go
a, b := vals()
	fmt.Println(a)
	fmt.Println(b)
```

If you only want a subset of the returned values,
use the blank identifier `_`.

```go
_, c := vals()
	fmt.Println(c)
}
```

```console
$ go run multiple-return-values.go
3
7
7
```

## Variadic Functions

[_Variadic functions_](https://en.wikipedia.org/wiki/Variadic_function)
can be called with any number of trailing arguments.
For example, `fmt.Println` is a common variadic
function.

```go
package main

import "fmt"
```

Here's a function that will take an arbitrary number
of `int`s as arguments.

```go
func sum(nums ...int) {
	fmt.Print(nums, " ")
	total := 0
```

Within the function, the type of `nums` is
equivalent to `[]int`. We can call `len(nums)`,
iterate over it with `range`, etc.

```go
for _, num := range nums {
		total += num
	}
	fmt.Println(total)
}

func main() {
```

Variadic functions can be called in the usual way
with individual arguments.

```go
sum(1, 2)
	sum(1, 2, 3)
```

If you already have multiple args in a slice,
apply them to a variadic function using
`func(slice...)` like this.

```go
nums := []int{1, 2, 3, 4}
	sum(nums...)
}
```

```console
$ go run variadic-functions.go 
[1 2] 3
[1 2 3] 6
[1 2 3 4] 10
```

## Closures

Go supports [_anonymous functions_](https://en.wikipedia.org/wiki/Anonymous_function),
which can form <a href="https://en.wikipedia.org/wiki/Closure_(computer_science)"><em>closures</em></a>.
Anonymous functions are useful when you want to define
a function inline without having to name it.

```go
package main

import "fmt"
```

This function `intSeq` returns another function, which
we define anonymously in the body of `intSeq`. The
returned function _closes over_ the variable `i` to
form a closure.

```go
func intSeq() func() int {
	i := 0
	return func() int {
		i++
		return i
	}
}

func main() {
```

We call `intSeq`, assigning the result (a function)
to `nextInt`. This function value captures its
own `i` value, which will be updated each time
we call `nextInt`.

```go
nextInt := intSeq()
```

See the effect of the closure by calling `nextInt`
a few times.

```go
fmt.Println(nextInt())
	fmt.Println(nextInt())
	fmt.Println(nextInt())
```

To confirm that the state is unique to that
particular function, create and test a new one.

```go
newInts := intSeq()
	fmt.Println(newInts())
}
```

```console
$ go run closures.go
1
2
3
1
```

## Recursion

Go supports
<a href="https://en.wikipedia.org/wiki/Recursion_(computer_science)"><em>recursive functions</em></a>.
Here's a classic example.

```go
package main

import "fmt"
```

This `fact` function calls itself until it reaches the
base case of `fact(0)`.

```go
func fact(n int) int {
	if n == 0 {
		return 1
	}
	return n * fact(n-1)
}

func main() {
	fmt.Println(fact(7))
```

Anonymous functions can also be recursive, but this requires
explicitly declaring a variable with `var` to store
the function before it's defined.

```go
var fib func(n int) int

	fib = func(n int) int {
		if n < 2 {
			return n
		}
```

Since `fib` was previously declared in `main`, Go
knows which function to call with `fib` here.

```go
return fib(n-1) + fib(n-2)
	}

	fmt.Println(fib(7))
}
```

```console
$ go run recursion.go 
5040
13
```

## Range over Built-in Types

_range_ iterates over elements in a variety of
built-in data structures. Let's see how to
use `range` with some of the data structures
we've already learned.

```go
package main

import "fmt"

func main() {
```

Here we use `range` to sum the numbers in a slice.
Arrays work like this too.

```go
nums := []int{2, 3, 4}
	sum := 0
	for _, num := range nums {
		sum += num
	}
	fmt.Println("sum:", sum)
```

`range` on arrays and slices provides both the
index and value for each entry. Above we didn't
need the index, so we ignored it with the
blank identifier `_`. Sometimes we actually want
the indexes though.

```go
for i, num := range nums {
		if num == 3 {
			fmt.Println("index:", i)
		}
	}
```

`range` on map iterates over key/value pairs.

```go
kvs := map[string]string{"a": "apple", "b": "banana"}
	for k, v := range kvs {
		fmt.Printf("%s -> %s\n", k, v)
	}
```

`range` can also iterate over just the keys of a map.

```go
for k := range kvs {
		fmt.Println("key:", k)
	}
```

`range` on strings iterates over Unicode code
points. The first value is the starting byte index
of the `rune` and the second the `rune` itself.
See [Strings and Runes](strings-and-runes) for more
details.

```go
for i, c := range "go" {
		fmt.Println(i, c)
	}
}
```

```console
$ go run range-over-built-in-types.go
sum: 9
index: 1
a -> apple
b -> banana
key: a
key: b
0 103
1 111
```

## Pointers

Go supports <em><a href="https://en.wikipedia.org/wiki/Pointer_(computer_programming)">pointers</a></em>,
allowing you to pass references to values and records
within your program.

```go
package main

import "fmt"
```

We'll show how pointers work in contrast to values with
2 functions: `zeroval` and `zeroptr`. `zeroval` has an
`int` parameter, so arguments will be passed to it by
value. `zeroval` will get a copy of `ival` distinct
from the one in the calling function.

```go
func zeroval(ival int) {
	ival = 0
}
```

`zeroptr` in contrast has an `*int` parameter, meaning
that it takes an `int` pointer. The `*iptr` code in the
function body then _dereferences_ the pointer from its
memory address to the current value at that address.
Assigning a value to a dereferenced pointer changes the
value at the referenced address.

```go
func zeroptr(iptr *int) {
	*iptr = 0
}

func main() {
	i := 1
	fmt.Println("initial:", i)

	zeroval(i)
	fmt.Println("zeroval:", i)
```

The `&i` syntax gives the memory address of `i`,
i.e. a pointer to `i`.

```go
zeroptr(&i)
	fmt.Println("zeroptr:", i)
```

Pointers can be printed too.

```go
fmt.Println("pointer:", &i)
```

A new pointer to a value can be created with the
builtin function `new`.

```go
p := new(42)
	fmt.Println("value at *p:", *p)
	zeroptr(p)
	fmt.Println("value at *p:", *p)
}
```

```console
$ go run pointers.go
initial: 1
zeroval: 1
zeroptr: 0
pointer: 0x42131100
value at *p: 42
value at *p: 0
```

## Strings and Runes

A Go string is a read-only slice of bytes. The language
and the standard library treat strings specially - as
containers of text encoded in [UTF-8](https://en.wikipedia.org/wiki/UTF-8).
In other languages, strings are made of "characters".
In Go, the concept of a character is called a `rune` - it's
an integer that represents a Unicode code point.
[This Go blog post](https://go.dev/blog/strings) is a good
introduction to the topic.

```go
package main

import (
	"fmt"
	"unicode/utf8"
)

func main() {
```

`s` is a `string` assigned a literal value
representing the word "hello" in the Thai
language. Go string literals are UTF-8
encoded text.

```go
const s = "สวัสดี"
```

Since strings are equivalent to `[]byte`, this
will produce the length of the raw bytes stored within.

```go
fmt.Println("Len:", len(s))
```

Indexing into a string produces the raw byte values at
each index. This loop generates the hex values of all
the bytes that constitute the code points in `s`.

```go
for i := 0; i < len(s); i++ {
		fmt.Printf("%x ", s[i])
	}
	fmt.Println()
```

To count how many _runes_ are in a string, we can use
the `utf8` package. Note that the run-time of
`RuneCountInString` depends on the size of the string,
because it has to decode each UTF-8 rune sequentially.
Some Thai characters are represented by UTF-8 code points
that can span multiple bytes, so the result of this count
may be surprising.

```go
fmt.Println("Rune count:", utf8.RuneCountInString(s))
```

A `range` loop handles strings specially and decodes
each `rune` along with its offset in the string.

```go
for idx, runeValue := range s {
		fmt.Printf("%#U starts at %d\n", runeValue, idx)
	}
```

We can achieve the same iteration by using the
`utf8.DecodeRuneInString` function explicitly.

```go
fmt.Println("\nUsing DecodeRuneInString")
	for i, w := 0, 0; i < len(s); i += w {
		runeValue, width := utf8.DecodeRuneInString(s[i:])
		fmt.Printf("%#U starts at %d\n", runeValue, i)
		w = width
```

This demonstrates passing a `rune` value to a function.

```go
examineRune(runeValue)
	}
}

func examineRune(r rune) {
```

Values enclosed in single quotes are _rune literals_. We
can compare a `rune` value to a rune literal directly.

```go
if r == 't' {
		fmt.Println("found tee")
	} else if r == 'ส' {
		fmt.Println("found so sua")
	}
}
```

```console
$ go run strings-and-runes.go
Len: 18
e0 b8 aa e0 b8 a7 e0 b8 b1 e0 b8 aa e0 b8 94 e0 b8 b5 
Rune count: 6
U+0E2A 'ส' starts at 0
U+0E27 'ว' starts at 3
U+0E31 'ั' starts at 6
U+0E2A 'ส' starts at 9
U+0E14 'ด' starts at 12
U+0E35 'ี' starts at 15

Using DecodeRuneInString
U+0E2A 'ส' starts at 0
found so sua
U+0E27 'ว' starts at 3
U+0E31 'ั' starts at 6
U+0E2A 'ส' starts at 9
found so sua
U+0E14 'ด' starts at 12
U+0E35 'ี' starts at 15
```

## Structs

Go's _structs_ are typed collections of fields.
They're useful for grouping data together to form
records.

```go
package main

import "fmt"
```

This `person` struct type has `name` and `age` fields.

```go
type person struct {
	name string
	age  int
}
```

`newPerson` constructs a new person struct with the given name.

```go
func newPerson(name string) *person {
```

Go is a garbage collected language; you can safely
return a pointer to a local variable - it will only
be cleaned up by the garbage collector when there
are no active references to it.

```go
p := person{name: name}
	p.age = 42
	return &p
}

func main() {
```

This syntax creates a new struct.

```go
fmt.Println(person{"Bob", 20})
```

You can name the fields when initializing a struct.

```go
fmt.Println(person{name: "Alice", age: 30})
```

Omitted fields will be zero-valued.

```go
fmt.Println(person{name: "Fred"})
```

An `&` prefix yields a pointer to the struct.

```go
fmt.Println(&person{name: "Ann", age: 40})
```

It's idiomatic to encapsulate new struct creation in constructor functions

```go
fmt.Println(newPerson("Jon"))
```

Access struct fields with a dot.

```go
s := person{name: "Sean", age: 50}
	fmt.Println(s.name)
```

Structs are mutable.

```go
s.age = 51
	fmt.Println(s)
```

You can also use dots with struct pointers - the
pointers are automatically dereferenced.

```go
sp := &s
	sp.age = 52
	fmt.Println(sp.age)
```

If a struct type is only used for a single value, we don't
have to give it a name. The value can have an anonymous
struct type. This technique is commonly used for
[table-driven tests](testing-and-benchmarking).

```go
dog := struct {
		name   string
		isGood bool
	}{
		"Rex",
		true,
	}
	fmt.Println(dog)
}
```

```console
{Bob 20}
{Alice 30}
{Fred 0}
&{Ann 40}
&{Jon 42}
Sean
{Sean 51}
52
{Rex true}
```

## Methods

Go supports _methods_ defined on struct types.

```go
package main

import "fmt"

type rect struct {
	width, height int
}
```

This `area` method has a _receiver type_ of `*rect`.

```go
func (r *rect) area() int {
	return r.width * r.height
}
```

Methods can be defined for either pointer or value
receiver types. Here's an example of a value receiver.

```go
func (r rect) perim() int {
	return 2*r.width + 2*r.height
}

func main() {
	r := rect{width: 10, height: 5}
```

Here we call the 2 methods defined for our struct.

```go
fmt.Println("area: ", r.area())
	fmt.Println("perim:", r.perim())
```

Go automatically handles conversion between values
and pointers for method calls. You may want to use
a pointer receiver type to avoid copying on method
calls or to allow the method to mutate the
receiving struct.

```go
rp := &r
	fmt.Println("area: ", rp.area())
	fmt.Println("perim:", rp.perim())
}
```

```console
$ go run methods.go 
area:  50
perim: 30
area:  50
perim: 30
```

## Interfaces

_Interfaces_ are named collections of method
signatures.

```go
package main

import (
	"fmt"
	"math"
)
```

Here's a basic interface for geometric shapes.

```go
type geometry interface {
	area() float64
	perim() float64
}
```

For our example we'll implement this interface on
`rect` and `circle` types.

```go
type rect struct {
	width, height float64
}
type circle struct {
	radius float64
}
```

To implement an interface in Go, we just need to
implement all the methods in the interface. Here we
implement `geometry` on `rect`s.

```go
func (r rect) area() float64 {
	return r.width * r.height
}
func (r rect) perim() float64 {
	return 2*r.width + 2*r.height
}
```

The implementation for `circle`s.

```go
func (c circle) area() float64 {
	return math.Pi * c.radius * c.radius
}
func (c circle) perim() float64 {
	return 2 * math.Pi * c.radius
}
```

If a variable has an interface type, then we can call
methods that are in the named interface. Here's a
generic `measure` function taking advantage of this
to work on any `geometry`.

```go
func measure(g geometry) {
	fmt.Println(g)
	fmt.Println(g.area())
	fmt.Println(g.perim())
}
```

Sometimes it's useful to know the runtime type of an
interface value. One option is using a *type assertion*
as shown here; another is a [type `switch`](switch).

```go
func detectCircle(g geometry) {
	if c, ok := g.(circle); ok {
		fmt.Println("circle with radius", c.radius)
	}
}

func main() {
	r := rect{width: 3, height: 4}
	c := circle{radius: 5}
```

The `circle` and `rect` struct types both
implement the `geometry` interface so we can use
instances of
these structs as arguments to `measure`.

```go
measure(r)
	measure(c)

	detectCircle(r)
	detectCircle(c)
}
```

```console
$ go run interfaces.go
{3 4}
12
14
{5}
78.53981633974483
31.41592653589793
circle with radius 5
```

## Enums

_Enumerated types_ (enums) are a special case of
[sum types](https://en.wikipedia.org/wiki/Algebraic_data_type).
An enum is a type that has a fixed number of possible
values, each with a distinct name. Go doesn't have an
enum type as a distinct language feature, but enums
are simple to implement using existing language idioms.

```go
package main

import "fmt"
```

Our enum type `ServerState` has an underlying `int` type.

```go
type ServerState int
```

The possible values for `ServerState` are defined as
constants. The special keyword [iota](https://go.dev/ref/spec#Iota)
generates successive constant values automatically; in this
case 0, 1, 2 and so on.

```go
const (
	StateIdle ServerState = iota
	StateConnected
	StateError
	StateRetrying
)
```

By implementing the [fmt.Stringer](https://pkg.go.dev/fmt#Stringer)
interface, values of `ServerState` can be printed out or converted
to strings.

This can get cumbersome if there are many possible values. In such
cases the [stringer tool](https://pkg.go.dev/golang.org/x/tools/cmd/stringer)
can be used in conjunction with `go:generate` to automate the
process. See [this post](https://eli.thegreenplace.net/2021/a-comprehensive-guide-to-go-generate)
for a longer explanation.

```go
var stateName = map[ServerState]string{
	StateIdle:      "idle",
	StateConnected: "connected",
	StateError:     "error",
	StateRetrying:  "retrying",
}

func (ss ServerState) String() string {
	return stateName[ss]
}

func main() {
	ns := transition(StateIdle)
	fmt.Println(ns)
```

If we have a value of type `int`, we cannot pass it to `transition` - the
compiler will complain about type mismatch. This provides some degree of
compile-time type safety for enums.

```go
ns2 := transition(ns)
	fmt.Println(ns2)
}
```

transition emulates a state transition for a
server; it takes the existing state and returns
a new state.

```go
func transition(s ServerState) ServerState {
	switch s {
	case StateIdle:
		return StateConnected
	case StateConnected, StateRetrying:
```

Suppose we check some predicates here to
determine the next state...

```go
return StateIdle
	case StateError:
		return StateError
	default:
		panic(fmt.Errorf("unknown state: %s", s))
	}
}
```

```console
$ go run enums.go
connected
idle
```

## Struct Embedding

Go supports _embedding_ of structs and interfaces
to express a more seamless _composition_ of types.
This is not to be confused with [`//go:embed`](embed-directive) which is
a go directive introduced in Go version 1.16+ to embed
files and folders into the application binary.

```go
package main

import "fmt"

type base struct {
	num int
}

func (b base) describe() string {
	return fmt.Sprintf("base with num=%v", b.num)
}
```

A `container` _embeds_ a `base`. An embedding looks
like a field without a name.

```go
type container struct {
	base
	str string
}

func main() {
```

When creating structs with literals, we have to
initialize the embedding explicitly; here the
embedded type serves as the field name.

```go
co := container{
		base: base{
			num: 1,
		},
		str: "some name",
	}
```

We can access the base's fields directly on `co`,
e.g. `co.num`.

```go
fmt.Printf("co={num: %v, str: %v}\n", co.num, co.str)
```

Alternatively, we can spell out the full path using
the embedded type name.

```go
fmt.Println("also num:", co.base.num)
```

Since `container` embeds `base`, the methods of
`base` also become methods of a `container`. Here
we invoke a method that was embedded from `base`
directly on `co`.

```go
fmt.Println("describe:", co.describe())

	type describer interface {
		describe() string
	}
```

Embedding structs with methods may be used to bestow
interface implementations onto other structs. Here
we see that a `container` now implements the
`describer` interface because it embeds `base`.

```go
var d describer = co
	fmt.Println("describer:", d.describe())
}
```

```console
$ go run struct-embedding.go
co={num: 1, str: some name}
also num: 1
describe: base with num=1
describer: base with num=1
```

## Generics

Starting with version 1.18, Go has added support for
_generics_, also known as _type parameters_.

```go
package main

import "fmt"
```

As an example of a generic function, `SlicesIndex` takes
a slice of any `comparable` type and an element of that
type and returns the index of the first occurrence of
v in s, or -1 if not present. The `comparable` constraint
means that we can compare values of this type with the
`==` and `!=` operators. For a more thorough explanation
of this type signature, see [this blog post](https://go.dev/blog/deconstructing-type-parameters).
Note that this function exists in the standard library
as [slices.Index](https://pkg.go.dev/slices#Index).

```go
func SlicesIndex[S ~[]E, E comparable](s S, v E) int {
	for i := range s {
		if v == s[i] {
			return i
		}
	}
	return -1
}
```

As an example of a generic type, `List` is a
singly-linked list with values of any type.

```go
type List[T any] struct {
	head, tail *element[T]
}

type element[T any] struct {
	next *element[T]
	val  T
}
```

We can define methods on generic types just like we
do on regular types, but we have to keep the type
parameters in place. The type is `List[T]`, not `List`.

```go
func (lst *List[T]) Push(v T) {
	if lst.tail == nil {
		lst.head = &element[T]{val: v}
		lst.tail = lst.head
	} else {
		lst.tail.next = &element[T]{val: v}
		lst.tail = lst.tail.next
	}
}
```

AllElements returns all the List elements as a slice.
In the next example we'll see a more idiomatic way
of iterating over all elements of custom types.

```go
func (lst *List[T]) AllElements() []T {
	var elems []T
	for e := lst.head; e != nil; e = e.next {
		elems = append(elems, e.val)
	}
	return elems
}

func main() {
	var s = []string{"foo", "bar", "zoo"}
```

When invoking generic functions, we can often rely
on _type inference_. Note that we don't have to
specify the types for `S` and `E` when
calling `SlicesIndex` - the compiler infers them
automatically.

```go
fmt.Println("index of zoo:", SlicesIndex(s, "zoo"))
```

... though we could also specify them explicitly.

```go
_ = SlicesIndex[[]string, string](s, "zoo")

	lst := List[int]{}
	lst.Push(10)
	lst.Push(13)
	lst.Push(23)
	fmt.Println("list:", lst.AllElements())
}
```

```console
$ go run generics.go
index of zoo: 2
list: [10 13 23]
```

## Range over Iterators

Starting with version 1.23, Go has added support for
[iterators](https://go.dev/blog/range-functions),
which lets us range over pretty much anything!

```go
package main

import (
	"fmt"
	"iter"
	"slices"
	"strings"
)
```

Let's look at the `List` type from the
[previous example](generics) again. In that example
we had an `AllElements` method that returned a slice
of all elements in the list. With Go iterators, we
can do it better - as shown below.

```go
type List[T any] struct {
	head, tail *element[T]
}

type element[T any] struct {
	next *element[T]
	val  T
}

func (lst *List[T]) Push(v T) {
	if lst.tail == nil {
		lst.head = &element[T]{val: v}
		lst.tail = lst.head
	} else {
		lst.tail.next = &element[T]{val: v}
		lst.tail = lst.tail.next
	}
}
```

All returns an _iterator_, which in Go is a function
with a [special signature](https://pkg.go.dev/iter#Seq).

```go
func (lst *List[T]) All() iter.Seq[T] {
	return func(yield func(T) bool) {
```

The iterator function takes another function as
a parameter, called `yield` by convention (but
the name can be arbitrary). It will call `yield` for
every element we want to iterate over, and note `yield`'s
return value for a potential early termination.

```go
for e := lst.head; e != nil; e = e.next {
			if !yield(e.val) {
				return
			}
		}
	}
}
```

Iteration doesn't require an underlying data structure,
and doesn't even have to be finite! Here's a function
returning an iterator over Fibonacci numbers: it keeps
running as long as `yield` keeps returning `true`.

```go
func genFib() iter.Seq[int] {
	return func(yield func(int) bool) {
		a, b := 0, 1

		for {
			if !yield(a) {
				return
			}
			a, b = b, a+b
		}
	}
}

func main() {
	lst := List[int]{}
	lst.Push(10)
	lst.Push(13)
	lst.Push(23)
```

Since `List.All` returns an iterator, we can use it
in a regular `range` loop.

```go
for e := range lst.All() {
		fmt.Println(e)
	}
```

Packages like [slices](https://pkg.go.dev/slices) have
a number of useful functions to work with iterators.
For example, `Collect` takes any iterator and collects
all its values into a slice.

```go
all := slices.Collect(lst.All())
	fmt.Println("all:", all)
```

Standard library packages now expose iterator helpers
too. For example, `strings.SplitSeq` iterates over parts
of a byte slice without first building a result slice.

```go
for part := range strings.SplitSeq("go-by-example", "-") {
		fmt.Printf("part: %s\n", part)
	}

	for n := range genFib() {
```

Once the loop hits `break` or an early return, the `yield` function
passed to the iterator will return `false`.

```go
if n >= 10 {
			break
		}
		fmt.Println(n)
	}
}
```

```console
$ go run range-over-iterators.go
10
13
23
all: [10 13 23]
part: go
part: by
part: example
0
1
1
2
3
5
8
```

## Errors

In Go it's idiomatic to communicate errors via an
explicit, separate return value. This contrasts with
the exceptions used in languages like Java, Python and
Ruby and the overloaded single result / error value
sometimes used in C. Go's approach makes it easy to
see which functions return errors and to handle them
using the same language constructs employed for other,
non-error tasks.

See the documentation of the [errors package](https://pkg.go.dev/errors)
and [this blog post](https://go.dev/blog/go1.13-errors) for additional
details.

```go
package main

import (
	"errors"
	"fmt"
)
```

By convention, errors are the last return value and
have type `error`, a built-in interface.

```go
func f(arg int) (int, error) {
	if arg == 42 {
```

`errors.New` constructs a basic `error` value
with the given error message.

```go
return -1, errors.New("can't work with 42")
	}
```

A `nil` value in the error position indicates that
there was no error.

```go
return arg + 3, nil
}
```

A sentinel error is a predeclared variable that is used to
signify a specific error condition.

```go
var ErrOutOfTea = errors.New("no more tea available")
var ErrPower = errors.New("can't boil water")

func makeTea(arg int) error {
	if arg == 2 {
		return ErrOutOfTea
	} else if arg == 4 {
```

We can wrap errors with higher-level errors to add
context. The simplest way to do this is with the
`%w` verb in `fmt.Errorf`. Wrapped errors
create a logical chain (A wraps B, which wraps C, etc.)
that can be queried with functions like `errors.Is`
and `errors.AsType`.

```go
return fmt.Errorf("making tea: %w", ErrPower)
	}
	return nil
}

func main() {
	for _, i := range []int{7, 42} {
```

It's idiomatic to use an inline error check in the `if`
line.

```go
if r, e := f(i); e != nil {
			fmt.Println("f failed:", e)
		} else {
			fmt.Println("f worked:", r)
		}
	}

	for i := range 5 {
		if err := makeTea(i); err != nil {
```

`errors.Is` checks that a given error (or any error in its chain)
matches a specific error value. This is especially useful with wrapped or
nested errors, allowing you to identify specific error types or sentinel
errors in a chain of errors.

```go
if errors.Is(err, ErrOutOfTea) {
				fmt.Println("We should buy new tea!")
			} else if errors.Is(err, ErrPower) {
				fmt.Println("Now it is dark.")
			} else {
				fmt.Printf("unknown error: %s\n", err)
			}
			continue
		}

		fmt.Println("Tea is ready!")
	}
}
```

```console
$ go run errors.go
f worked: 10
f failed: can't work with 42
Tea is ready!
Tea is ready!
We should buy new tea!
Tea is ready!
Now it is dark.
```

## Custom Errors

It's possible to define custom error types by
implementing the `Error()` method on them. Here's a
variant on the example above that uses a custom type
to explicitly represent an argument error.

```go
package main

import (
	"errors"
	"fmt"
)
```

A custom error type usually has the suffix "Error".

```go
type argError struct {
	arg     int
	message string
}
```

Adding this `Error` method makes `argError` implement
the `error` interface.

```go
func (e *argError) Error() string {
	return fmt.Sprintf("%d - %s", e.arg, e.message)
}

func f(arg int) (int, error) {
	if arg == 42 {
```

Return our custom error.

```go
return -1, &argError{arg, "can't work with it"}
	}
	return arg + 3, nil
}

func main() {
```

`errors.AsType` is a more advanced version of `errors.Is`.
It checks that a given error (or any error in its chain)
matches a specific error type and converts to a value
of that type, also returning `true`. If there's no match, the
second return value is `false`.

```go
_, err := f(42)
	if ae, ok := errors.AsType[*argError](err); ok {
		fmt.Println(ae.arg)
		fmt.Println(ae.message)
	} else {
		fmt.Println("err doesn't match argError")
	}
}
```

```console
$ go run custom-errors.go
42
can't work with it
```

## Goroutines

A _goroutine_ is a lightweight thread of execution.

```go
package main

import (
	"fmt"
	"time"
)

func f(from string) {
	for i := range 3 {
		fmt.Println(from, ":", i)
	}
}

func main() {
```

Suppose we have a function call `f(s)`. Here's how
we'd call that in the usual way, running it
synchronously.

```go
f("direct")
```

To invoke this function in a goroutine, use
`go f(s)`. This new goroutine will execute
concurrently with the calling one.

```go
go f("goroutine")
```

You can also start a goroutine for an anonymous
function call.

```go
go func(msg string) {
		fmt.Println(msg)
	}("going")
```

Our two function calls are running asynchronously in
separate goroutines now. Wait for them to finish
(for a more robust approach, use a [WaitGroup](waitgroups)).

```go
time.Sleep(time.Second)
	fmt.Println("done")
}
```

```console
$ go run goroutines.go
direct : 0
direct : 1
direct : 2
goroutine : 0
going
goroutine : 1
goroutine : 2
done
```

## Channels

_Channels_ are the pipes that connect concurrent
goroutines. You can send values into channels from one
goroutine and receive those values into another
goroutine.

```go
package main

import "fmt"

func main() {
```

Create a new channel with `make(chan val-type)`.
Channels are typed by the values they convey.

```go
messages := make(chan string)
```

_Send_ a value into a channel using the `channel <-`
syntax. Here we send `"ping"`  to the `messages`
channel we made above, from a new goroutine.

```go
go func() { messages <- "ping" }()
```

The `<-channel` syntax _receives_ a value from the
channel. Here we'll receive the `"ping"` message
we sent above and print it out.

```go
msg := <-messages
	fmt.Println(msg)
}
```

```console
$ go run channels.go 
ping
```

## Channel Buffering

By default channels are _unbuffered_, meaning that they
will only accept sends (`chan <-`) if there is a
corresponding receive (`<- chan`) ready to receive the
sent value. _Buffered channels_ accept a limited
number of  values without a corresponding receiver for
those values.

```go
package main

import "fmt"

func main() {
```

Here we `make` a channel of strings buffering up to
2 values.

```go
messages := make(chan string, 2)
```

Because this channel is buffered, we can send these
values into the channel without a corresponding
concurrent receive.

```go
messages <- "buffered"
	messages <- "channel"
```

Later we can receive these two values as usual.

```go
fmt.Println(<-messages)
	fmt.Println(<-messages)
}
```

```console
$ go run channel-buffering.go 
buffered
channel
```

## Channel Synchronization

We can use channels to synchronize execution
across goroutines. Here's an example of using a
blocking receive to wait for a goroutine to finish.
When waiting for multiple goroutines to finish,
you may prefer to use a [WaitGroup](waitgroups).

```go
package main

import (
	"fmt"
	"time"
)
```

This is the function we'll run in a goroutine. The
`done` channel will be used to notify another
goroutine that this function's work is done.

```go
func worker(done chan bool) {
	fmt.Print("working...")
	time.Sleep(time.Second)
	fmt.Println("done")
```

Send a value to notify that we're done.

```go
done <- true
}

func main() {
```

Start a worker goroutine, giving it the channel to
notify on.

```go
done := make(chan bool, 1)
	go worker(done)
```

Block until we receive a notification from the
worker on the channel.

```go
<-done
}
```

```console
$ go run channel-synchronization.go      
working...done
```

## Channel Directions

When using channels as function parameters, you can
specify if a channel is meant to only send or receive
values. This specificity increases the type-safety of
the program.

```go
package main

import "fmt"
```

This `ping` function only accepts a channel for sending
values. It would be a compile-time error to try to
receive on this channel.

```go
func ping(pings chan<- string, msg string) {
	pings <- msg
}
```

The `pong` function accepts one channel for receives
(`pings`) and a second for sends (`pongs`).

```go
func pong(pings <-chan string, pongs chan<- string) {
	msg := <-pings
	pongs <- msg
}

func main() {
	pings := make(chan string, 1)
	pongs := make(chan string, 1)
	ping(pings, "passed message")
	pong(pings, pongs)
	fmt.Println(<-pongs)
}
```

```console
$ go run channel-directions.go
passed message
```

## Select

Go's _select_ lets you wait on multiple channel
operations. Combining goroutines and channels with
select is a powerful feature of Go.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
```

For our example we'll select across two channels.

```go
c1 := make(chan string)
	c2 := make(chan string)
```

Each channel will receive a value after some amount
of time, to simulate e.g. blocking RPC operations
executing in concurrent goroutines.

```go
go func() {
		time.Sleep(1 * time.Second)
		c1 <- "one"
	}()
	go func() {
		time.Sleep(2 * time.Second)
		c2 <- "two"
	}()
```

We'll use `select` to await both of these values
simultaneously, printing each one as it arrives.

```go
for range 2 {
		select {
		case msg1 := <-c1:
			fmt.Println("received", msg1)
		case msg2 := <-c2:
			fmt.Println("received", msg2)
		}
	}
}
```

```console
$ time go run select.go 
received one
received two

real	0m2.245s
```

## Timeouts

_Timeouts_ are important for programs that connect to
external resources or that otherwise need to bound
execution time. Implementing timeouts in Go is easy and
elegant thanks to channels and `select`.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
```

For our example, suppose we're executing an external
call that returns its result on a channel `c1`
after 2s. Note that the channel is buffered, so the
send in the goroutine is nonblocking. This is a
common pattern to prevent goroutine leaks in case the
channel is never read.

```go
c1 := make(chan string, 1)
	go func() {
		time.Sleep(2 * time.Second)
		c1 <- "result 1"
	}()
```

Here's the `select` implementing a timeout.
`res := <-c1` awaits the result and `<-time.After`
awaits a value to be sent after the timeout of
1s. Since `select` proceeds with the first
receive that's ready, we'll take the timeout case
if the operation takes more than the allowed 1s.

```go
select {
	case res := <-c1:
		fmt.Println(res)
	case <-time.After(1 * time.Second):
		fmt.Println("timeout 1")
	}
```

If we allow a longer timeout of 3s, then the receive
from `c2` will succeed and we'll print the result.

```go
c2 := make(chan string, 1)
	go func() {
		time.Sleep(2 * time.Second)
		c2 <- "result 2"
	}()
	select {
	case res := <-c2:
		fmt.Println(res)
	case <-time.After(3 * time.Second):
		fmt.Println("timeout 2")
	}
}
```

```console
$ go run timeouts.go 
timeout 1
result 2
```

## Non-Blocking Channel Operations

Basic sends and receives on channels are blocking.
However, we can use `select` with a `default` clause to
implement _non-blocking_ sends, receives, and even
non-blocking multi-way `select`s.

```go
package main

import "fmt"

func main() {
	messages := make(chan string)
	signals := make(chan bool)
```

Here's a non-blocking receive. If a value is
available on `messages` then `select` will take
the `<-messages` `case` with that value. If not
it will immediately take the `default` case.

```go
select {
	case msg := <-messages:
		fmt.Println("received message", msg)
	default:
		fmt.Println("no message received")
	}
```

A non-blocking send works similarly. Here `msg`
cannot be sent to the `messages` channel, because
the channel has no buffer and there is no receiver.
Therefore the `default` case is selected.

```go
msg := "hi"
	select {
	case messages <- msg:
		fmt.Println("sent message", msg)
	default:
		fmt.Println("no message sent")
	}
```

We can use multiple `case`s above the `default`
clause to implement a multi-way non-blocking
select. Here we attempt non-blocking receives
on both `messages` and `signals`.

```go
select {
	case msg := <-messages:
		fmt.Println("received message", msg)
	case sig := <-signals:
		fmt.Println("received signal", sig)
	default:
		fmt.Println("no activity")
	}
}
```

```console
$ go run non-blocking-channel-operations.go 
no message received
no message sent
no activity
```

## Closing Channels

_Closing_ a channel indicates that no more values
will be sent on it. This can be useful to communicate
completion to the channel's receivers.

```go
package main

import "fmt"
```

In this example we'll use a `jobs` channel to
communicate work to be done from the `main()` goroutine
to a worker goroutine. When we have no more jobs for
the worker we'll `close` the `jobs` channel.

```go
func main() {
	jobs := make(chan int, 5)
	done := make(chan bool)
```

Here's the worker goroutine. It repeatedly receives
from `jobs` with `j, more := <-jobs`. In this
special 2-value form of receive, the `more` value
will be `false` if `jobs` has been `close`d and all
values in the channel have already been received.
We use this to notify on `done` when we've worked
all our jobs.

```go
go func() {
		for {
			j, more := <-jobs
			if more {
				fmt.Println("received job", j)
			} else {
				fmt.Println("received all jobs")
				done <- true
				return
			}
		}
	}()
```

This sends 3 jobs to the worker over the `jobs`
channel, then closes it.

```go
for j := 1; j <= 3; j++ {
		jobs <- j
		fmt.Println("sent job", j)
	}
	close(jobs)
	fmt.Println("sent all jobs")
```

We await the worker using the
[synchronization](channel-synchronization) approach
we saw earlier.

```go
<-done
```

Reading from a closed channel succeeds immediately,
returning the zero value of the underlying type.
The optional second return value is `true` if the
value received was delivered by a successful send
operation to the channel, or `false` if it was a
zero value generated because the channel is closed
and empty.

```go
_, ok := <-jobs
	fmt.Println("received more jobs:", ok)
}
```

```console
$ go run closing-channels.go 
sent job 1
received job 1
sent job 2
received job 2
sent job 3
received job 3
sent all jobs
received all jobs
received more jobs: false
```

## Range over Channels

In a [previous](range-over-built-in-types) example we saw how `for` and
`range` provide iteration over basic data structures.
We can also use this syntax to iterate over
values received from a channel.

```go
package main

import "fmt"

func main() {
```

We'll iterate over 2 values in the `queue` channel.

```go
queue := make(chan string, 2)
	queue <- "one"
	queue <- "two"
	close(queue)
```

This `range` iterates over each element as it's
received from `queue`. Because we `close`d the
channel above, the iteration terminates after
receiving the 2 elements.

```go
for elem := range queue {
		fmt.Println(elem)
	}
}
```

```console
$ go run range-over-channels.go
one
two
```

## Timers

We often want to execute Go code at some point in the
future, or repeatedly at some interval. Go's built-in
_timer_ and _ticker_ features make both of these tasks
easy. We'll look first at timers and then
at [tickers](tickers).

```go
package main

import (
	"fmt"
	"time"
)

func main() {
```

Timers represent a single event in the future. You
tell the timer how long you want to wait, and it
provides a channel that will be notified at that
time. This timer will wait 2 seconds.

```go
timer1 := time.NewTimer(2 * time.Second)
```

The `<-timer1.C` blocks on the timer's channel `C`
until it sends a value indicating that the timer
fired.

```go
<-timer1.C
	fmt.Println("Timer 1 fired")
```

If you just wanted to wait, you could have used
`time.Sleep`. One reason a timer may be useful is
that you can cancel the timer before it fires.
Here's an example of that.

```go
timer2 := time.NewTimer(time.Second)
	go func() {
		<-timer2.C
		fmt.Println("Timer 2 fired")
	}()
	stop2 := timer2.Stop()
	if stop2 {
		fmt.Println("Timer 2 stopped")
	}
```

Give the `timer2` enough time to fire, if it ever
was going to, to show it is in fact stopped.

```go
time.Sleep(2 * time.Second)
}
```

```console
$ go run timers.go
Timer 1 fired
Timer 2 stopped
```

## Tickers

[Timers](timers) are for when you want to do
something once in the future - _tickers_ are for when
you want to do something repeatedly at regular
intervals. Here's an example of a ticker that ticks
periodically until we stop it.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
```

Tickers use a similar mechanism to timers: a
channel that is sent values. Here we'll use the
`select` builtin on the channel to await the
values as they arrive every 500ms.

```go
ticker := time.NewTicker(500 * time.Millisecond)
	done := make(chan bool)

	go func() {
		for {
			select {
			case <-done:
				return
			case t := <-ticker.C:
				fmt.Println("Tick at", t)
			}
		}
	}()
```

Tickers can be stopped like timers. Once a ticker
is stopped it won't receive any more values on its
channel. We'll stop ours after 1600ms.

```go
time.Sleep(1600 * time.Millisecond)
	ticker.Stop()
	done <- true
	fmt.Println("Ticker stopped")
}
```

```console
$ go run tickers.go
Tick at 2012-09-23 11:29:56.487625 -0700 PDT
Tick at 2012-09-23 11:29:56.988063 -0700 PDT
Tick at 2012-09-23 11:29:57.488076 -0700 PDT
Ticker stopped
```

## Worker Pools

In this example we'll look at how to implement
a _worker pool_ using goroutines and channels.

```go
package main

import (
	"fmt"
	"time"
)
```

Here's the worker, of which we'll run several
concurrent instances. These workers will receive
work on the `jobs` channel and send the corresponding
results on `results`. We'll sleep a second per job to
simulate an expensive task.

```go
func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		fmt.Println("worker", id, "started  job", j)
		time.Sleep(time.Second)
		fmt.Println("worker", id, "finished job", j)
		results <- j * 2
	}
}

func main() {
```

In order to use our pool of workers we need to send
them work and collect their results. We make 2
channels for this.

```go
const numJobs = 5
	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)
```

This starts up 3 workers, initially blocked
because there are no jobs yet.

```go
for w := 1; w <= 3; w++ {
		go worker(w, jobs, results)
	}
```

Here we send 5 `jobs` and then `close` that
channel to indicate that's all the work we have.

```go
for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs)
```

Finally we collect all the results of the work.
This also ensures that the worker goroutines have
finished. An alternative way to wait for multiple
goroutines is to use a [WaitGroup](waitgroups).

```go
for a := 1; a <= numJobs; a++ {
		<-results
	}
}
```

```console
$ time go run worker-pools.go 
worker 1 started  job 1
worker 2 started  job 2
worker 3 started  job 3
worker 1 finished job 1
worker 1 started  job 4
worker 2 finished job 2
worker 2 started  job 5
worker 3 finished job 3
worker 1 finished job 4
worker 2 finished job 5

real	0m2.358s
```

## WaitGroups

To wait for multiple goroutines to finish, we can
use a *wait group*.

```go
package main

import (
	"fmt"
	"sync"
	"time"
)
```

This is the function we'll run in every goroutine.

```go
func worker(id int) {
	fmt.Printf("Worker %d starting\n", id)
```

Sleep to simulate an expensive task.

```go
time.Sleep(time.Second)
	fmt.Printf("Worker %d done\n", id)
}

func main() {
```

This WaitGroup is used to wait for all the
goroutines launched here to finish. Note: if a WaitGroup is
explicitly passed into functions, it should be done *by pointer*.

```go
var wg sync.WaitGroup
```

Launch several goroutines using `WaitGroup.Go`

```go
for i := 1; i <= 5; i++ {
		wg.Go(func() {
			worker(i)
		})
	}
```

Block until all the goroutines started by `wg` are
done. A goroutine is done when the function it invokes
returns.

```go
wg.Wait()
```

Note that this approach has no straightforward way
to propagate errors from workers. For more
advanced use cases, consider using the
[errgroup package](https://pkg.go.dev/golang.org/x/sync/errgroup).

```go
}
```

```console
$ go run waitgroups.go
Worker 5 starting
Worker 3 starting
Worker 4 starting
Worker 1 starting
Worker 2 starting
Worker 4 done
Worker 1 done
Worker 2 done
Worker 5 done
Worker 3 done
```

## Rate Limiting

[_Rate limiting_](https://en.wikipedia.org/wiki/Rate_limiting)
is an important mechanism for controlling resource
utilization and maintaining quality of service. Go
elegantly supports rate limiting with goroutines,
channels, and [tickers](tickers).

```go
package main

import (
	"fmt"
	"time"
)

func main() {
```

First we'll look at basic rate limiting. Suppose
we want to limit our handling of incoming requests.
We'll serve these requests off a channel of the
same name.

```go
requests := make(chan int, 5)
	for i := 1; i <= 5; i++ {
		requests <- i
	}
	close(requests)
```

This `limiter` channel will receive a value
every 200 milliseconds. This is the regulator in
our rate limiting scheme.

```go
limiter := time.Tick(200 * time.Millisecond)
```

By blocking on a receive from the `limiter` channel
before serving each request, we limit ourselves to
1 request every 200 milliseconds.

```go
for req := range requests {
		<-limiter
		fmt.Println("request", req, time.Now())
	}
```

We may want to allow short bursts of requests in
our rate limiting scheme while preserving the
overall rate limit. We can accomplish this by
buffering our limiter channel. This `burstyLimiter`
channel will allow bursts of up to 3 events.

```go
burstyLimiter := make(chan time.Time, 3)
```

Fill up the channel to represent allowed bursting.

```go
for range 3 {
		burstyLimiter <- time.Now()
	}
```

Every 200 milliseconds we'll try to add a new
value to `burstyLimiter`, up to its limit of 3.

```go
go func() {
		for t := range time.Tick(200 * time.Millisecond) {
			burstyLimiter <- t
		}
	}()
```

Now simulate 5 more incoming requests. The first
3 of these will benefit from the burst capability
of `burstyLimiter`.

```go
burstyRequests := make(chan int, 5)
	for i := 1; i <= 5; i++ {
		burstyRequests <- i
	}
	close(burstyRequests)
	for req := range burstyRequests {
		<-burstyLimiter
		fmt.Println("request", req, time.Now())
	}
}
```

```console
$ go run rate-limiting.go
request 1 2012-10-19 00:38:18.687438 +0000 UTC
request 2 2012-10-19 00:38:18.887471 +0000 UTC
request 3 2012-10-19 00:38:19.087238 +0000 UTC
request 4 2012-10-19 00:38:19.287338 +0000 UTC
request 5 2012-10-19 00:38:19.487331 +0000 UTC

request 1 2012-10-19 00:38:20.487578 +0000 UTC
request 2 2012-10-19 00:38:20.487645 +0000 UTC
request 3 2012-10-19 00:38:20.487676 +0000 UTC
request 4 2012-10-19 00:38:20.687483 +0000 UTC
request 5 2012-10-19 00:38:20.887542 +0000 UTC
```

## Atomic Counters

The primary mechanism for managing state in Go is
communication over channels. We saw this for example
with [worker pools](worker-pools). There are a few other
options for managing state though. Here we'll
look at using the `sync/atomic` package for _atomic
counters_ accessed by multiple goroutines.

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
```

We'll use an atomic integer type to represent our
(always-positive) counter.

```go
var ops atomic.Uint64
```

A WaitGroup will help us wait for all goroutines
to finish their work.

```go
var wg sync.WaitGroup
```

We'll start 50 goroutines that each increment the
counter exactly 1000 times.

```go
for range 50 {
		wg.Go(func() {
			for range 1000 {
```

To atomically increment the counter we use `Add`.

```go
ops.Add(1)
			}
		})
	}
```

Wait until all the goroutines are done.

```go
wg.Wait()
```

Here no goroutines are writing to 'ops', but using
`Load` it's safe to atomically read a value even while
other goroutines are (atomically) updating it.

```go
fmt.Println("ops:", ops.Load())
}
```

```console
$ go run atomic-counters.go
ops: 50000
```

## Mutexes

In the previous example we saw how to manage simple
counter state using [atomic operations](atomic-counters).
For more complex state we can use a [_mutex_](https://en.wikipedia.org/wiki/Mutual_exclusion)
to safely access data across multiple goroutines.

```go
package main

import (
	"fmt"
	"sync"
)
```

Container holds a map of counters; since we want to
update it concurrently from multiple goroutines, we
add a `Mutex` to synchronize access.
Note that mutexes must not be copied, so if this
`struct` is passed around, it should be done by
pointer.

```go
type Container struct {
	mu       sync.Mutex
	counters map[string]int
}

func (c *Container) inc(name string) {
```

Lock the mutex before accessing `counters`; unlock
it at the end of the function using a [defer](defer)
statement.

```go
c.mu.Lock()
	defer c.mu.Unlock()
	c.counters[name]++
}

func main() {
	c := Container{
```

Note that the zero value of a mutex is usable as-is, so no
initialization is required here.

```go
counters: map[string]int{"a": 0, "b": 0},
	}

	var wg sync.WaitGroup
```

This function increments a named counter
in a loop.

```go
doIncrement := func(name string, n int) {
		for range n {
			c.inc(name)
		}
	}
```

Run several goroutines concurrently; note
that they all access the same `Container`,
and two of them access the same counter.

```go
wg.Go(func() {
		doIncrement("a", 10000)
	})

	wg.Go(func() {
		doIncrement("a", 10000)
	})

	wg.Go(func() {
		doIncrement("b", 10000)
	})
```

Wait for the goroutines to finish

```go
wg.Wait()
	fmt.Println(c.counters)
}
```

```console
$ go run mutexes.go
map[a:20000 b:10000]
```

## Stateful Goroutines

In the previous example we used explicit locking with
[mutexes](mutexes) to synchronize access to shared state
across multiple goroutines. Another option is to use the
built-in synchronization features of  goroutines and
channels to achieve the same result. This channel-based
approach aligns with Go's ideas of sharing memory by
communicating and having each piece of data owned
by exactly one goroutine.

```go
package main

import (
	"fmt"
	"math/rand"
	"sync/atomic"
	"time"
)
```

In this example our state will be owned by a single
goroutine. This will guarantee that the data is never
corrupted with concurrent access. In order to read or
write that state, other goroutines will send messages
to the owning goroutine and receive corresponding
replies. These `readOp` and `writeOp` `struct`s
encapsulate those requests and a way for the owning
goroutine to respond.

```go
type readOp struct {
	key  int
	resp chan int
}
type writeOp struct {
	key  int
	val  int
	resp chan bool
}

func main() {
```

As before we'll count how many operations we perform.

```go
var readOps uint64
	var writeOps uint64
```

The `reads` and `writes` channels will be used by
other goroutines to issue read and write requests,
respectively.

```go
reads := make(chan readOp)
	writes := make(chan writeOp)
```

Here is the goroutine that owns the `state`, which
is a map as in the previous example but now private
to the stateful goroutine. This goroutine repeatedly
selects on the `reads` and `writes` channels,
responding to requests as they arrive. A response
is executed by first performing the requested
operation and then sending a value on the response
channel `resp` to indicate success (and the desired
value in the case of `reads`).

```go
go func() {
		var state = make(map[int]int)
		for {
			select {
			case read := <-reads:
				read.resp <- state[read.key]
			case write := <-writes:
				state[write.key] = write.val
				write.resp <- true
			}
		}
	}()
```

This starts 100 goroutines to issue reads to the
state-owning goroutine via the `reads` channel.
Each read requires constructing a `readOp`, sending
it over the `reads` channel, and then receiving the
result over the provided `resp` channel.

```go
for range 100 {
		go func() {
			for {
				read := readOp{
					key:  rand.Intn(5),
					resp: make(chan int)}
				reads <- read
				<-read.resp
				atomic.AddUint64(&readOps, 1)
				time.Sleep(time.Millisecond)
			}
		}()
	}
```

We start 10 writes as well, using a similar
approach.

```go
for range 10 {
		go func() {
			for {
				write := writeOp{
					key:  rand.Intn(5),
					val:  rand.Intn(100),
					resp: make(chan bool)}
				writes <- write
				<-write.resp
				atomic.AddUint64(&writeOps, 1)
				time.Sleep(time.Millisecond)
			}
		}()
	}
```

Let the goroutines work for a second.

```go
time.Sleep(time.Second)
```

Finally, capture and report the op counts.

```go
readOpsFinal := atomic.LoadUint64(&readOps)
	fmt.Println("readOps:", readOpsFinal)
	writeOpsFinal := atomic.LoadUint64(&writeOps)
	fmt.Println("writeOps:", writeOpsFinal)
}
```

```console
$ go run stateful-goroutines.go
readOps: 71708
writeOps: 7177
```

## Sorting

Go's `slices` package implements sorting for builtins
and user-defined types. We'll look at sorting for
builtins first.

```go
package main

import (
	"fmt"
	"slices"
)

func main() {
```

Sorting functions are generic, and work for any
_ordered_ built-in type. For a list of ordered
types, see [cmp.Ordered](https://pkg.go.dev/cmp#Ordered).

```go
strs := []string{"c", "a", "b"}
	slices.Sort(strs)
	fmt.Println("Strings:", strs)
```

An example of sorting `int`s.

```go
ints := []int{7, 2, 4}
	slices.Sort(ints)
	fmt.Println("Ints:   ", ints)
```

We can also use the `slices` package to check if
a slice is already in sorted order.

```go
s := slices.IsSorted(ints)
	fmt.Println("Sorted: ", s)
}
```

```console
$ go run sorting.go
Strings: [a b c]
Ints:    [2 4 7]
Sorted:  true
```

## Sorting by Functions

Sometimes we'll want to sort a collection by something
other than its natural order. For example, suppose we
wanted to sort strings by their length instead of
alphabetically. Here's an example of custom sorts
in Go.

```go
package main

import (
	"cmp"
	"fmt"
	"slices"
)

func main() {
	fruits := []string{"peach", "banana", "kiwi"}
```

We implement a comparison function for string
lengths. `cmp.Compare` is helpful for this.

```go
lenCmp := func(a, b string) int {
		return cmp.Compare(len(a), len(b))
	}
```

Now we can call `slices.SortFunc` with this custom
comparison function to sort `fruits` by name length.

```go
slices.SortFunc(fruits, lenCmp)
	fmt.Println(fruits)
```

We can use the same technique to sort a slice of
values that aren't built-in types.

```go
type Person struct {
		name string
		age  int
	}

	people := []Person{
		Person{name: "Jax", age: 37},
		Person{name: "TJ", age: 25},
		Person{name: "Alex", age: 72},
	}
```

Sort `people` by age using `slices.SortFunc`.

Note: if the `Person` struct is large,
you may want the slice to contain `*Person` instead
and adjust the sorting function accordingly. If in
doubt, [benchmark](testing-and-benchmarking)!

```go
slices.SortFunc(people,
		func(a, b Person) int {
			return cmp.Compare(a.age, b.age)
		})
	fmt.Println(people)
}
```

```console
$ go run sorting-by-functions.go 
[kiwi peach banana]
[{TJ 25} {Jax 37} {Alex 72}]
```

## Panic

A `panic` typically means something went unexpectedly
wrong. Mostly we use it to fail fast on errors that
shouldn't occur during normal operation, or that we
aren't prepared to handle gracefully.

```go
package main

import (
	"os"
	"path/filepath"
)

func main() {
```

We'll use panic throughout this site to check for
unexpected errors. This is the only program on the
site designed to panic.

```go
panic("a problem")
```

A common use of panic is to abort if a function
returns an error value that we don't know how to
(or want to) handle. Here's an example of
`panic`king if we get an unexpected error when creating a new file.

```go
path := filepath.Join(os.TempDir(), "file")
	_, err := os.Create(path)
	if err != nil {
		panic(err)
	}
}
```

```console
$ go run panic.go
panic: a problem

goroutine 1 [running]:
main.main()
	/.../panic.go:12 +0x47
...
exit status 2
```

## Defer

_Defer_ is used to ensure that a function call is
performed later in a program's execution, usually for
purposes of cleanup. `defer` is often used where e.g.
`ensure` and `finally` would be used in other languages.

```go
package main

import (
	"fmt"
	"os"
	"path/filepath"
)
```

Suppose we wanted to create a file, write to it,
and then close when we're done. Here's how we could
do that with `defer`.

```go
func main() {
```

Immediately after getting a file object with
`createFile`, we defer the closing of that file
with `closeFile`. This will be executed at the end
of the enclosing function (`main`), after
`writeFile` has finished.

```go
path := filepath.Join(os.TempDir(), "defer.txt")
	f := createFile(path)
	defer closeFile(f)
	writeFile(f)
}

func createFile(p string) *os.File {
	fmt.Println("creating")
	f, err := os.Create(p)
	if err != nil {
		panic(err)
	}
	return f
}

func writeFile(f *os.File) {
	fmt.Println("writing")
	fmt.Fprintln(f, "data")
}

func closeFile(f *os.File) {
	fmt.Println("closing")
	err := f.Close()
```

It's important to check for errors when closing a
file, even in a deferred function.

```go
if err != nil {
		panic(err)
	}
}
```

```console
$ go run defer.go
creating
writing
closing
```

## Recover

Go makes it possible to _recover_ from a panic, by
using the `recover` built-in function. A `recover` can
stop a `panic` from aborting the program and let it
continue with execution instead.

An example of where this can be useful: a server
wouldn't want to crash if one of the client connections
exhibits a critical error. Instead, the server would
want to close that connection and continue serving
other clients. In fact, this is what Go's `net/http`
does by default for HTTP servers.

```go
package main

import "fmt"
```

This function panics.

```go
func mayPanic() {
	panic("a problem")
}

func main() {
```

`recover` must be called within a deferred function.
When the enclosing function panics, the defer will
activate and a `recover` call within it will catch
the panic.

```go
defer func() {
		if r := recover(); r != nil {
```

The return value of `recover` is the error raised in
the call to `panic`.

```go
fmt.Println("Recovered. Error:\n", r)
		}
	}()

	mayPanic()
```

This code will not run, because `mayPanic` panics.
The execution of `main` stops at the point of the
panic and resumes in the deferred closure.

```go
fmt.Println("After mayPanic()")
}
```

```console
$ go run recover.go
Recovered. Error:
 a problem
```

## String Functions

The standard library's `strings` package provides many
useful string-related functions. Here are some examples
to give you a sense of the package.

```go
package main

import (
	"fmt"
	s "strings"
)
```

We alias `fmt.Println` to a shorter name as we'll use
it a lot below.

```go
var p = fmt.Println

func main() {
```

Here's a sample of the functions available in
`strings`. Since these are functions from the
package, not methods on the string object itself,
we need to pass the string in question as the first
argument to the function. You can find more
functions in the [`strings`](https://pkg.go.dev/strings)
package docs.

```go
p("Contains:  ", s.Contains("test", "es"))
	p("Count:     ", s.Count("test", "t"))
	p("HasPrefix: ", s.HasPrefix("test", "te"))
	p("HasSuffix: ", s.HasSuffix("test", "st"))
	p("Index:     ", s.Index("test", "e"))
	p("Join:      ", s.Join([]string{"a", "b"}, "-"))
	p("Repeat:    ", s.Repeat("a", 5))
	p("Replace:   ", s.Replace("foo", "o", "0", -1))
	p("Replace:   ", s.Replace("foo", "o", "0", 1))
	p("Split:     ", s.Split("a-b-c-d-e", "-"))
	p("ToLower:   ", s.ToLower("TEST"))
	p("ToUpper:   ", s.ToUpper("test"))
}
```

```console
$ go run string-functions.go
Contains:   true
Count:      2
HasPrefix:  true
HasSuffix:  true
Index:      1
Join:       a-b
Repeat:     aaaaa
Replace:    f00
Replace:    f0o
Split:      [a b c d e]
ToLower:    test
ToUpper:    TEST
```

## String Formatting

Go offers excellent support for string formatting in
the `printf` tradition. Here are some examples of
common string formatting tasks.

```go
package main

import (
	"fmt"
	"os"
)

type point struct {
	x, y int
}

func main() {
```

Go offers several printing "verbs" designed to
format general Go values. For example, this prints
an instance of our `point` struct.

```go
p := point{1, 2}
	fmt.Printf("struct1: %v\n", p)
```

If the value is a struct, the `%+v` variant will
include the struct's field names.

```go
fmt.Printf("struct2: %+v\n", p)
```

The `%#v` variant prints a Go syntax representation
of the value, i.e. the source code snippet that
would produce that value.

```go
fmt.Printf("struct3: %#v\n", p)
```

To print the type of a value, use `%T`.

```go
fmt.Printf("type: %T\n", p)
```

Formatting booleans is straight-forward.

```go
fmt.Printf("bool: %t\n", true)
```

There are many options for formatting integers.
Use `%d` for standard, base-10 formatting.

```go
fmt.Printf("int: %d\n", 123)
```

This prints a binary representation.

```go
fmt.Printf("bin: %b\n", 14)
```

This prints the character corresponding to the
given integer.

```go
fmt.Printf("char: %c\n", 33)
```

`%x` provides hex encoding.

```go
fmt.Printf("hex: %x\n", 456)
```

There are also several formatting options for
floats. For basic decimal formatting use `%f`.

```go
fmt.Printf("float1: %f\n", 78.9)
```

`%e` and `%E` format the float in (slightly
different versions of) scientific notation.

```go
fmt.Printf("float2: %e\n", 123400000.0)
	fmt.Printf("float3: %E\n", 123400000.0)
```

For basic string printing use `%s`.

```go
fmt.Printf("str1: %s\n", "\"string\"")
```

To double-quote strings as in Go source, use `%q`.

```go
fmt.Printf("str2: %q\n", "\"string\"")
```

As with integers seen earlier, `%x` renders
the string in base-16, with two output characters
per byte of input.

```go
fmt.Printf("str3: %x\n", "hex this")
```

To print a representation of a pointer, use `%p`.

```go
fmt.Printf("pointer: %p\n", &p)
```

When formatting numbers you will often want to
control the width and precision of the resulting
figure. To specify the width of an integer, use a
number after the `%` in the verb. By default the
result will be right-justified and padded with
spaces.

```go
fmt.Printf("width1: |%6d|%6d|\n", 12, 345)
```

You can also specify the width of printed floats,
though usually you'll also want to restrict the
decimal precision at the same time with the
width.precision syntax.

```go
fmt.Printf("width2: |%6.2f|%6.2f|\n", 1.2, 3.45)
```

To left-justify, use the `-` flag.

```go
fmt.Printf("width3: |%-6.2f|%-6.2f|\n", 1.2, 3.45)
```

You may also want to control width when formatting
strings, especially to ensure that they align in
table-like output. For basic right-justified width.

```go
fmt.Printf("width4: |%6s|%6s|\n", "foo", "b")
```

To left-justify use the `-` flag as with numbers.

```go
fmt.Printf("width5: |%-6s|%-6s|\n", "foo", "b")
```

So far we've seen `Printf`, which prints the
formatted string to `os.Stdout`. `Sprintf` formats
and returns a string without printing it anywhere.

```go
s := fmt.Sprintf("sprintf: a %s", "string")
	fmt.Println(s)
```

You can format+print to `io.Writers` other than
`os.Stdout` using `Fprintf`.

```go
fmt.Fprintf(os.Stderr, "io: an %s\n", "error")
}
```

```console
$ go run string-formatting.go
struct1: {1 2}
struct2: {x:1 y:2}
struct3: main.point{x:1, y:2}
type: main.point
bool: true
int: 123
bin: 1110
char: !
hex: 1c8
float1: 78.900000
float2: 1.234000e+08
float3: 1.234000E+08
str1: "string"
str2: "\"string\""
str3: 6865782074686973
pointer: 0xc0000ba000
width1: |    12|   345|
width2: |  1.20|  3.45|
width3: |1.20  |3.45  |
width4: |   foo|     b|
width5: |foo   |b     |
sprintf: a string
io: an error
```

## Text Templates

Go offers built-in support for creating dynamic content or showing customized
output to the user with the `text/template` package. A sibling package
named `html/template` provides the same API but has additional security
features and should be used for generating HTML.

```go
package main

import (
	"os"
	"text/template"
)

func main() {
```

We can create a new template and parse its body from
a string.
Templates are a mix of static text and "actions" enclosed in
`{{...}}` that are used to dynamically insert content.

```go
t1 := template.New("t1")
	t1, err := t1.Parse("Value is {{.}}\n")
	if err != nil {
		panic(err)
	}
```

Alternatively, we can use the `template.Must` function to
panic in case `Parse` returns an error. This is especially
useful for templates initialized in the global scope.

```go
t1 = template.Must(t1.Parse("Value: {{.}}\n"))
```

By "executing" the template we generate its text with
specific values for its actions. The `{{.}}` action is
replaced by the value passed as a parameter to `Execute`.

```go
t1.Execute(os.Stdout, "some text")
	t1.Execute(os.Stdout, 5)
	t1.Execute(os.Stdout, []string{
		"Go",
		"Rust",
		"C++",
		"C#",
	})
```

Helper function we'll use below.

```go
Create := func(name, t string) *template.Template {
		return template.Must(template.New(name).Parse(t))
	}
```

If the data is a struct we can use the `{{.FieldName}}` action to access
its fields. The fields should be exported to be accessible when a
template is executing.

```go
t2 := Create("t2", "Name: {{.Name}}\n")

	t2.Execute(os.Stdout, struct {
		Name string
	}{"Jane Doe"})
```

The same applies to maps; with maps there is no restriction on the
case of key names.

```go
t2.Execute(os.Stdout, map[string]string{
		"Name": "Mickey Mouse",
	})
```

if/else provide conditional execution for templates. A value is considered
false if it's the default value of a type, such as 0, an empty string,
nil pointer, etc.
This sample demonstrates another
feature of templates: using `-` in actions to trim whitespace.

```go
t3 := Create("t3",
		"{{if . -}} yes {{else -}} no {{end}}\n")
	t3.Execute(os.Stdout, "not empty")
	t3.Execute(os.Stdout, "")
```

range blocks let us loop through slices, arrays, maps or channels. Inside
the range block `{{.}}` is set to the current item of the iteration.

```go
t4 := Create("t4",
		"Range: {{range .}}{{.}} {{end}}\n")
	t4.Execute(os.Stdout,
		[]string{
			"Go",
			"Rust",
			"C++",
			"C#",
		})
}
```

```console
$ go run templates.go 
Value: some text
Value: 5
Value: [Go Rust C++ C#]
Name: Jane Doe
Name: Mickey Mouse
yes 
no 
Range: Go Rust C++ C#
```

## Regular Expressions

Go offers built-in support for [regular expressions](https://en.wikipedia.org/wiki/Regular_expression).
Here are some examples of  common regexp-related tasks
in Go.

```go
package main

import (
	"bytes"
	"fmt"
	"regexp"
)

func main() {
```

This tests whether a pattern matches a string.

```go
match, _ := regexp.MatchString("p([a-z]+)ch", "peach")
	fmt.Println(match)
```

Above we used a string pattern directly, but for
other regexp tasks you'll need to `Compile` an
optimized `Regexp` struct.

```go
r, _ := regexp.Compile("p([a-z]+)ch")
```

Many methods are available on these structs. Here's
a match test like we saw earlier.

```go
fmt.Println(r.MatchString("peach"))
```

This finds the match for the regexp.

```go
fmt.Println(r.FindString("peach punch"))
```

This also finds the first match but returns the
start and end indexes for the match instead of the
matching text.

```go
fmt.Println("idx:", r.FindStringIndex("peach punch"))
```

The `Submatch` variants include information about
both the whole-pattern matches and the submatches
within those matches. For example this will return
information for both `p([a-z]+)ch` and `([a-z]+)`.

```go
fmt.Println(r.FindStringSubmatch("peach punch"))
```

Similarly this will return information about the
indexes of matches and submatches.

```go
fmt.Println(r.FindStringSubmatchIndex("peach punch"))
```

The `All` variants of these functions apply to all
matches in the input, not just the first. For
example to find all matches for a regexp.

```go
fmt.Println(r.FindAllString("peach punch pinch", -1))
```

These `All` variants are available for the other
functions we saw above as well.

```go
fmt.Println("all:", r.FindAllStringSubmatchIndex(
		"peach punch pinch", -1))
```

Providing a non-negative integer as the second
argument to these functions will limit the number
of matches.

```go
fmt.Println(r.FindAllString("peach punch pinch", 2))
```

Our examples above had string arguments and used
names like `MatchString`. We can also provide
`[]byte` arguments and drop `String` from the
function name.

```go
fmt.Println(r.Match([]byte("peach")))
```

When creating global variables with regular
expressions you can use the `MustCompile` variation
of `Compile`. `MustCompile` panics instead of
returning an error, which makes it safer to use for
global variables.

```go
r = regexp.MustCompile("p([a-z]+)ch")
	fmt.Println("regexp:", r)
```

The `regexp` package can also be used to replace
subsets of strings with other values.

```go
fmt.Println(r.ReplaceAllString("a peach", "<fruit>"))
```

The `Func` variant allows you to transform matched
text with a given function.

```go
in := []byte("a peach")
	out := r.ReplaceAllFunc(in, bytes.ToUpper)
	fmt.Println(string(out))
}
```

```console
$ go run regular-expressions.go
true
true
peach
idx: [0 5]
[peach ea]
[0 5 1 3]
[peach punch pinch]
all: [[0 5 1 3] [6 11 7 9] [12 17 13 15]]
[peach punch]
true
regexp: p([a-z]+)ch
a <fruit>
a PEACH
```

## JSON

Go offers built-in support for JSON encoding and
decoding, including to and from built-in and custom
data types.

```go
package main

import (
	"bytes"
	"encoding/json/v2"
	"fmt"
	"strings"
)
```

We'll use these two structs to demonstrate encoding and
decoding of custom types below.

```go
type response1 struct {
	Page   int
	Fruits []string
}
```

Only exported fields will be encoded/decoded in JSON.
Fields must start with capital letters to be exported.

```go
type response2 struct {
	Page   int      `json:"page"`
	Fruits []string `json:"fruits"`
}

func main() {
```

First we'll look at encoding basic data types to
JSON strings. Here are some examples for atomic
values.

```go
bolB, _ := json.Marshal(true)
	fmt.Println(string(bolB))

	intB, _ := json.Marshal(1)
	fmt.Println(string(intB))

	fltB, _ := json.Marshal(2.34)
	fmt.Println(string(fltB))

	strB, _ := json.Marshal("gopher")
	fmt.Println(string(strB))
```

And here are some for slices and maps, which encode
to JSON arrays and objects as you'd expect.

```go
slcD := []string{"apple", "peach", "pear"}
	slcB, _ := json.Marshal(slcD)
	fmt.Println(string(slcB))

	mapD := map[string]int{"apple": 5, "lettuce": 7}
	mapB, _ := json.Marshal(mapD)
	fmt.Println(string(mapB))
```

The JSON package can automatically encode your
custom data types. It will only include exported
fields in the encoded output and will by default
use those names as the JSON keys.

```go
res1D := &response1{
		Page:   1,
		Fruits: []string{"apple", "peach", "pear"}}
	res1B, _ := json.Marshal(res1D)
	fmt.Println(string(res1B))
```

You can use tags on struct field declarations
to customize the encoded JSON key names. Check the
definition of `response2` above to see an example
of such tags.

```go
res2D := &response2{
		Page:   1,
		Fruits: []string{"apple", "peach", "pear"}}
	res2B, _ := json.Marshal(res2D)
	fmt.Println(string(res2B))
```

Now let's look at decoding JSON data into Go
values. Here's an example for a generic data
structure.

```go
byt := []byte(`{"num":6.13,"strs":["a","b"]}`)
```

We need to provide a variable where the JSON
package can put the decoded data. This
`map[string]any` will hold a map of strings
to arbitrary data types.

```go
var dat map[string]any
```

Here's the actual decoding, and a check for
associated errors.
For the sake of brevity we ignore the errors in
these examples; in real code, you should always check
for errors and act upon them.

```go
if err := json.Unmarshal(byt, &dat); err != nil {
		panic(err)
	}
	fmt.Println(dat)
```

In order to use the values in the decoded map,
we'll need to convert them to their appropriate type.
For example here we convert the value in `num` to
the expected `float64` type.

```go
num := dat["num"].(float64)
	fmt.Println(num)
```

Accessing nested data requires a series of
conversions.

```go
strs := dat["strs"].([]any)
	str1 := strs[0].(string)
	fmt.Println(str1)
```

We can also decode JSON into custom data types.
This has the advantages of adding additional
type-safety to our programs and eliminating the
need for type assertions when accessing the decoded
data.

```go
str := `{"page": 1, "fruits": ["apple", "peach"]}`
	res := response2{}
	_ = json.Unmarshal([]byte(str), &res)
	fmt.Println(res)
	fmt.Println(res.Fruits[0])
```

In the examples above we always used bytes and
strings as intermediates between the data and
JSON representation on standard out. We can also
stream JSON encodings directly to `io.Writer`s like
`os.Stdout` or even HTTP response bodies.

```go
d := map[string]int{"apple": 5, "lettuce": 7}
	var buf bytes.Buffer
	_ = json.MarshalWrite(&buf, d)
	fmt.Println(buf.String())
```

Streaming reads from `io.Reader`s like `os.Stdin`
or HTTP request bodies is done with `json.UnmarshalRead`.

```go
res1 := response2{}
	_ = json.UnmarshalRead(strings.NewReader(str), &res1)
	fmt.Println(res1)
}
```

```console
$ go run json.go
true
1
2.34
"gopher"
["apple","peach","pear"]
{"apple":5,"lettuce":7}
{"Page":1,"Fruits":["apple","peach","pear"]}
{"page":1,"fruits":["apple","peach","pear"]}
map[num:6.13 strs:[a b]]
6.13
a
{1 [apple peach]}
apple
{"apple":5,"lettuce":7}
{1 [apple peach]}
```

## XML

Go offers built-in support for XML and XML-like
formats with the `encoding/xml` package.

```go
package main

import (
	"encoding/xml"
	"fmt"
)
```

Plant will be mapped to XML. Similarly to the
JSON examples, field tags contain directives for the
encoder and decoder. Here we use some special features
of the XML package: the `XMLName` field name dictates
the name of the XML element representing this struct;
`id,attr` means that the `Id` field is an XML
_attribute_ rather than a nested element.

```go
type Plant struct {
	XMLName xml.Name `xml:"plant"`
	Id      int      `xml:"id,attr"`
	Name    string   `xml:"name"`
	Origin  []string `xml:"origin"`
}

func (p Plant) String() string {
	return fmt.Sprintf("Plant id=%v, name=%v, origin=%v",
		p.Id, p.Name, p.Origin)
}

func main() {
	coffee := &Plant{Id: 27, Name: "Coffee"}
	coffee.Origin = []string{"Ethiopia", "Brazil"}
```

Emit XML representing our plant; using
`MarshalIndent` to produce a more
human-readable output.

```go
out, _ := xml.MarshalIndent(coffee, " ", "  ")
	fmt.Println(string(out))
```

To add a generic XML header to the output, append
it explicitly.

```go
fmt.Println(xml.Header + string(out))
```

Use `Unmarshal` to parse a stream of bytes with XML
into a data structure. If the XML is malformed or
cannot be mapped onto Plant, a descriptive error
will be returned.

```go
var p Plant
	if err := xml.Unmarshal(out, &p); err != nil {
		panic(err)
	}
	fmt.Println(p)

	tomato := &Plant{Id: 81, Name: "Tomato"}
	tomato.Origin = []string{"Mexico", "California"}
```

The `parent>child>plant` field tag tells the encoder
to nest all `plant`s under `<parent><child>...`

```go
type Nesting struct {
		XMLName xml.Name `xml:"nesting"`
		Plants  []*Plant `xml:"parent>child>plant"`
	}

	nesting := &Nesting{}
	nesting.Plants = []*Plant{coffee, tomato}

	out, _ = xml.MarshalIndent(nesting, " ", "  ")
	fmt.Println(string(out))
}
```

```console
$ go run xml.go
 <plant id="27">
   <name>Coffee</name>
   <origin>Ethiopia</origin>
   <origin>Brazil</origin>
 </plant>
<?xml version="1.0" encoding="UTF-8"?>
 <plant id="27">
   <name>Coffee</name>
   <origin>Ethiopia</origin>
   <origin>Brazil</origin>
 </plant>
Plant id=27, name=Coffee, origin=[Ethiopia Brazil]
 <nesting>
   <parent>
     <child>
       <plant id="27">
         <name>Coffee</name>
         <origin>Ethiopia</origin>
         <origin>Brazil</origin>
       </plant>
       <plant id="81">
         <name>Tomato</name>
         <origin>Mexico</origin>
         <origin>California</origin>
       </plant>
     </child>
   </parent>
 </nesting>
```

## Time

Go offers extensive support for times and durations;
here are some examples.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	p := fmt.Println
```

We'll start by getting the current time.

```go
now := time.Now()
	p(now)
```

You can build a `time` struct by providing the
year, month, day, etc. Times are always associated
with a `Location`, i.e. time zone.

```go
then := time.Date(
		2009, 11, 17, 20, 34, 58, 651387237, time.UTC)
	p(then)
```

You can extract the various components of the time
value as expected.

```go
p(then.Year())
	p(then.Month())
	p(then.Day())
	p(then.Hour())
	p(then.Minute())
	p(then.Second())
	p(then.Nanosecond())
	p(then.Location())
```

The Monday-Sunday `Weekday` is also available.

```go
p(then.Weekday())
```

These methods compare two times, testing if the
first occurs before, after, or at the same time
as the second, respectively.

```go
p(then.Before(now))
	p(then.After(now))
	p(then.Equal(now))
```

The `Sub` methods returns a `Duration` representing
the interval between two times.

```go
diff := now.Sub(then)
	p(diff)
```

We can compute the length of the duration in
various units.

```go
p(diff.Hours())
	p(diff.Minutes())
	p(diff.Seconds())
	p(diff.Nanoseconds())
```

You can use `Add` to advance a time by a given
duration, or with a `-` to move backwards by a
duration.

```go
p(then.Add(diff))
	p(then.Add(-diff))
}
```

```console
$ go run time.go
2012-10-31 15:50:13.793654 +0000 UTC
2009-11-17 20:34:58.651387237 +0000 UTC
2009
November
17
20
34
58
651387237
UTC
Tuesday
true
false
false
25891h15m15.142266763s
25891.25420618521
1.5534752523711128e+06
9.320851514226677e+07
93208515142266763
2012-10-31 15:50:13.793654 +0000 UTC
2006-12-05 01:19:43.509120474 +0000 UTC
```

## Epoch

A common requirement in programs is getting the number
of seconds, milliseconds, or nanoseconds since the
[Unix epoch](https://en.wikipedia.org/wiki/Unix_time).
Here's how to do it in Go.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
```

Use `time.Now` with `Unix`, `UnixMilli` or `UnixNano`
to get elapsed time since the Unix epoch in seconds,
milliseconds or nanoseconds, respectively.

```go
now := time.Now()
	fmt.Println(now)

	fmt.Println(now.Unix())
	fmt.Println(now.UnixMilli())
	fmt.Println(now.UnixNano())
```

You can also convert integer seconds or nanoseconds
since the epoch into the corresponding `time`.

```go
fmt.Println(time.Unix(now.Unix(), 0))
	fmt.Println(time.Unix(0, now.UnixNano()))
}
```

```console
$ go run epoch.go 
2012-10-31 16:13:58.292387 +0000 UTC
1351700038
1351700038292
1351700038292387000
2012-10-31 16:13:58 +0000 UTC
2012-10-31 16:13:58.292387 +0000 UTC
```

## Time Formatting / Parsing

Go supports time formatting and parsing via
pattern-based layouts.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	p := fmt.Println
```

Here's a basic example of formatting a time
according to RFC3339, using the corresponding layout
constant.

```go
t := time.Now()
	p(t.Format(time.RFC3339))
```

Time parsing uses the same layout values as `Format`.

```go
t1, _ := time.Parse(time.RFC3339, "2012-11-01T22:08:41+00:00")
	p(t1)
```

`Format` and `Parse` use example-based layouts. Usually
you'll use a constant from `time` for these layouts, but
you can also supply custom layouts. Layouts must use the
reference time `Mon Jan 2 15:04:05 MST 2006` to show the
pattern with which to format/parse a given time/string.
The example time must be exactly as shown: the year 2006,
15 for the hour, Monday for the day of the week, etc.

```go
p(t.Format("3:04PM"))
	p(t.Format("Mon Jan _2 15:04:05 2006"))
	p(t.Format("2006-01-02T15:04:05.999999-07:00"))
	form := "3 04 PM"
	t2, _ := time.Parse(form, "8 41 PM")
	p(t2)
```

For purely numeric representations you can also
use standard string formatting with the extracted
components of the time value.

```go
fmt.Printf("%d-%02d-%02dT%02d:%02d:%02d-00:00\n",
		t.Year(), t.Month(), t.Day(),
		t.Hour(), t.Minute(), t.Second())
```

`Parse` will return an error on malformed input
explaining the parsing problem.

```go
_, err := time.Parse("Mon Jan _2 15:04:05 2006", "8:41PM")
	p(err)
}
```

```console
$ go run time-formatting-parsing.go 
2014-04-15T18:00:15-07:00
2012-11-01 22:08:41 +0000 +0000
6:00PM
Tue Apr 15 18:00:15 2014
2014-04-15T18:00:15.161182-07:00
0000-01-01 20:41:00 +0000 UTC
2014-04-15T18:00:15-00:00
parsing time "8:41PM" as "Mon Jan _2 15:04:05 2006": ...
```

## Random Numbers

Go's `math/rand/v2` package provides
[pseudorandom number](https://en.wikipedia.org/wiki/Pseudorandom_number_generator)
generation.

```go
package main

import (
	"fmt"
	"math/rand/v2"
)

func main() {
```

For example, `rand.IntN` returns a random `int` n,
`0 <= n < 100`.

```go
fmt.Print(rand.IntN(100), ",")
	fmt.Print(rand.IntN(100))
	fmt.Println()
```

`rand.Float64` returns a `float64` `f`,
`0.0 <= f < 1.0`.

```go
fmt.Println(rand.Float64())
```

This can be used to generate random floats in
other ranges, for example `5.0 <= f' < 10.0`.

```go
fmt.Print((rand.Float64()*5)+5, ",")
	fmt.Print((rand.Float64() * 5) + 5)
	fmt.Println()
```

If you want a known seed, create a new
`rand.Source` and pass it into the `New`
constructor. `NewPCG` creates a new
[PCG](https://en.wikipedia.org/wiki/Permuted_congruential_generator)
source that requires a seed of two `uint64`
numbers.

```go
s2 := rand.NewPCG(42, 1024)
	r2 := rand.New(s2)
	fmt.Print(r2.IntN(100), ",")
	fmt.Print(r2.IntN(100))
	fmt.Println()

	s3 := rand.NewPCG(42, 1024)
	r3 := rand.New(s3)
	fmt.Print(r3.IntN(100), ",")
	fmt.Print(r3.IntN(100))
	fmt.Println()
}
```

```console
$ go run random-numbers.go
68,56
0.8090228139659177
5.840125017402497,6.937056298890035
94,49
94,49
```

## Number Parsing

Parsing numbers from strings is a basic but common task
in many programs; here's how to do it in Go.

```go
package main
```

The built-in package `strconv` provides the number
parsing.

```go
import (
	"fmt"
	"strconv"
)

func main() {
```

With `ParseFloat`, this `64` tells how many bits of
precision to parse.

```go
f, _ := strconv.ParseFloat("1.234", 64)
	fmt.Println(f)
```

For `ParseInt`, the `0` means infer the base from
the string. `64` requires that the result fit in 64
bits.

```go
i, _ := strconv.ParseInt("123", 0, 64)
	fmt.Println(i)
```

`ParseInt` will recognize hex-formatted numbers.

```go
d, _ := strconv.ParseInt("0x1c8", 0, 64)
	fmt.Println(d)
```

A `ParseUint` is also available.

```go
u, _ := strconv.ParseUint("789", 0, 64)
	fmt.Println(u)
```

`Atoi` is a convenience function for basic base-10
`int` parsing.

```go
k, _ := strconv.Atoi("135")
	fmt.Println(k)
```

Parse functions return an error on bad input.

```go
_, e := strconv.Atoi("wat")
	fmt.Println(e)
}
```

```console
$ go run number-parsing.go 
1.234
123
456
789
135
strconv.ParseInt: parsing "wat": invalid syntax
```

## URL Parsing

URLs provide a [uniform way to locate resources](https://adam.herokuapp.com/past/2010/3/30/urls_are_the_uniform_way_to_locate_resources/).
Here's how to parse URLs in Go.

```go
package main

import (
	"fmt"
	"net"
	"net/url"
)

func main() {
```

We'll parse this example URL, which includes a
scheme, authentication info, host, port, path,
query params, and query fragment.

```go
s := "postgres://user:pass@host.com:5432/path?k=v#f"
```

Parse the URL and ensure there are no errors.

```go
u, err := url.Parse(s)
	if err != nil {
		panic(err)
	}
```

Accessing the scheme is straightforward.

```go
fmt.Println(u.Scheme)
```

`User` contains all authentication info; call
`Username` and `Password` on this for individual
values.

```go
fmt.Println(u.User)
	fmt.Println(u.User.Username())
	p, _ := u.User.Password()
	fmt.Println(p)
```

The `Host` contains both the hostname and the port,
if present. Use `SplitHostPort` to extract them.

```go
fmt.Println(u.Host)
	host, port, _ := net.SplitHostPort(u.Host)
	fmt.Println(host)
	fmt.Println(port)
```

Here we extract the `path` and the fragment after
the `#`.

```go
fmt.Println(u.Path)
	fmt.Println(u.Fragment)
```

To get query params in a string of `k=v` format,
use `RawQuery`. You can also parse query params
into a map. The parsed query param maps are from
strings to slices of strings, so index into `[0]`
if you only want the first value.

```go
fmt.Println(u.RawQuery)
	m, _ := url.ParseQuery(u.RawQuery)
	fmt.Println(m)
	fmt.Println(m["k"][0])
}
```

```console
$ go run url-parsing.go 
postgres
user:pass
user
pass
host.com:5432
host.com
5432
/path
f
k=v
map[k:[v]]
v
```

## SHA256 Hashes

[_SHA256 hashes_](https://en.wikipedia.org/wiki/SHA-2) are
frequently used to compute short identities for binary
or text blobs. For example, TLS/SSL certificates use SHA256
to compute a certificate's signature. Here's how to compute
SHA256 hashes in Go.

```go
package main
```

Go implements several hash functions in various
`crypto/*` packages.

```go
import (
	"crypto/sha256"
	"fmt"
)

func main() {
	s := "sha256 this string"
```

Here we start with a new hash.

```go
h := sha256.New()
```

`Write` expects bytes. If you have a string `s`,
use `[]byte(s)` to coerce it to bytes.

```go
h.Write([]byte(s))
```

This gets the finalized hash result as a byte
slice. The argument to `Sum` can be used to append
to an existing byte slice: it usually isn't needed.

```go
bs := h.Sum(nil)

	fmt.Println(s)
	fmt.Printf("%x\n", bs)
}
```

```console
$ go run sha256-hashes.go
sha256 this string
1af1dfa857bf1d8814fe1af8983c18080019922e557f15a8a...
```

## Base64 Encoding

Go provides built-in support for [base64
encoding/decoding](https://en.wikipedia.org/wiki/Base64).

```go
package main
```

This syntax imports the `encoding/base64` package with
the `b64` name instead of the default `base64`. It'll
save us some space below.

```go
import (
	b64 "encoding/base64"
	"fmt"
)

func main() {
```

Here's the `string` we'll encode/decode.

```go
data := "abc123!?$*&()'-=@~"
```

Go supports both standard and URL-compatible
base64. Here's how to encode using the standard
encoder. The encoder requires a `[]byte` so we
convert our `string` to that type.

```go
sEnc := b64.StdEncoding.EncodeToString([]byte(data))
	fmt.Println(sEnc)
```

Decoding may return an error, which you can check
if you don't already know the input to be
well-formed.

```go
sDec, _ := b64.StdEncoding.DecodeString(sEnc)
	fmt.Println(string(sDec))
	fmt.Println()
```

This encodes/decodes using a URL-compatible base64
format.

```go
uEnc := b64.URLEncoding.EncodeToString([]byte(data))
	fmt.Println(uEnc)
	uDec, _ := b64.URLEncoding.DecodeString(uEnc)
	fmt.Println(string(uDec))
}
```

```console
$ go run base64-encoding.go
YWJjMTIzIT8kKiYoKSctPUB+
abc123!?$*&()'-=@~

YWJjMTIzIT8kKiYoKSctPUB-
abc123!?$*&()'-=@~
```

## Reading Files

Reading and writing files are basic tasks needed for
many Go programs. First we'll look at some examples of
reading files.

```go
package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
)
```

Reading files requires checking most calls for errors.
This helper will streamline our error checks below.

```go
func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {
```

Perhaps the most basic file reading task is
slurping a file's entire contents into memory.

```go
path := filepath.Join(os.TempDir(), "dat")
	dat, err := os.ReadFile(path)
	check(err)
	fmt.Print(string(dat))
```

You'll often want more control over how and what
parts of a file are read. For these tasks, start
by `Open`ing a file to obtain an `os.File` value.

```go
f, err := os.Open(path)
	check(err)
```

Read some bytes from the beginning of the file.
Allow up to 5 to be read but also note how many
actually were read.

```go
b1 := make([]byte, 5)
	n1, err := f.Read(b1)
	check(err)
	fmt.Printf("%d bytes: %s\n", n1, string(b1[:n1]))
```

You can also `Seek` to a known location in the file
and `Read` from there.

```go
o2, err := f.Seek(6, io.SeekStart)
	check(err)
	b2 := make([]byte, 2)
	n2, err := f.Read(b2)
	check(err)
	fmt.Printf("%d bytes @ %d: ", n2, o2)
	fmt.Printf("%v\n", string(b2[:n2]))
```

Other methods of seeking are relative to the
current cursor position,

```go
_, err = f.Seek(2, io.SeekCurrent)
	check(err)
```

and relative to the end of the file.

```go
_, err = f.Seek(-4, io.SeekEnd)
	check(err)
```

The `io` package provides some functions that may
be helpful for file reading. For example, reads
like the ones above can be more robustly
implemented with `ReadAtLeast`.

```go
o3, err := f.Seek(6, io.SeekStart)
	check(err)
	b3 := make([]byte, 2)
	n3, err := io.ReadAtLeast(f, b3, 2)
	check(err)
	fmt.Printf("%d bytes @ %d: %s\n", n3, o3, string(b3))
```

There is no built-in rewind, but
`Seek(0, io.SeekStart)` accomplishes this.

```go
_, err = f.Seek(0, io.SeekStart)
	check(err)
```

The `bufio` package implements a buffered
reader that may be useful both for its efficiency
with many small reads and because of the additional
reading methods it provides.

```go
r4 := bufio.NewReader(f)
	b4, err := r4.Peek(5)
	check(err)
	fmt.Printf("5 bytes: %s\n", string(b4))
```

Close the file when you're done (usually this would
be scheduled immediately after `Open`ing with
`defer`).

```go
f.Close()
}
```

```console
$ echo "hello" > /tmp/dat
$ echo "go" >>   /tmp/dat
$ go run reading-files.go
hello
go
5 bytes: hello
2 bytes @ 6: go
2 bytes @ 6: go
5 bytes: hello
```

## Writing Files

Writing files in Go follows similar patterns to the
ones we saw earlier for reading.

```go
package main

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {
```

To start, here's how to dump a string (or just
bytes) into a file.

```go
d1 := []byte("hello\ngo\n")
	path1 := filepath.Join(os.TempDir(), "dat1")
	err := os.WriteFile(path1, d1, 0644)
	check(err)
```

For more granular writes, open a file for writing.

```go
path2 := filepath.Join(os.TempDir(), "dat2")
	f, err := os.Create(path2)
	check(err)
```

It's idiomatic to defer a `Close` immediately
after opening a file.

```go
defer f.Close()
```

You can `Write` byte slices as you'd expect.

```go
d2 := []byte{115, 111, 109, 101, 10}
	n2, err := f.Write(d2)
	check(err)
	fmt.Printf("wrote %d bytes\n", n2)
```

A `WriteString` is also available.

```go
n3, err := f.WriteString("writes\n")
	check(err)
	fmt.Printf("wrote %d bytes\n", n3)
```

Issue a `Sync` to flush writes to stable storage.

```go
f.Sync()
```

`bufio` provides buffered writers in addition
to the buffered readers we saw earlier.

```go
w := bufio.NewWriter(f)
	n4, err := w.WriteString("buffered\n")
	check(err)
	fmt.Printf("wrote %d bytes\n", n4)
```

Use `Flush` to ensure all buffered operations have
been applied to the underlying writer.

```go
w.Flush()

}
```

```console
$ go run writing-files.go 
wrote 5 bytes
wrote 7 bytes
wrote 9 bytes

$ cat /tmp/dat1
hello
go
$ cat /tmp/dat2
some
writes
buffered
```

## Line Filters

A _line filter_ is a common type of program that reads
input on stdin, processes it, and then prints some
derived result to stdout. `grep` and `sed` are common
line filters.

Here's an example line filter in Go that writes a
capitalized version of all input text. You can use this
pattern to write your own Go line filters.

```go
package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
```

Wrapping the unbuffered `os.Stdin` with a buffered
scanner gives us a convenient `Scan` method that
advances the scanner to the next token; which is
the next line in the default scanner.

```go
scanner := bufio.NewScanner(os.Stdin)

	for scanner.Scan() {
```

`Text` returns the current token, here the next line,
from the input.

```go
ucl := strings.ToUpper(scanner.Text())
```

Write out the uppercased line.

```go
fmt.Println(ucl)
	}
```

Check for errors during `Scan`. End of file is
expected and not reported by `Scan` as an error.

```go
if err := scanner.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
```

```console
$ echo 'hello'   > /tmp/lines
$ echo 'filter' >> /tmp/lines

$ cat /tmp/lines | go run line-filters.go
HELLO
FILTER
```

## File Paths

The `filepath` package provides functions to parse
and construct *file paths* in a way that is portable
between operating systems; `dir/file` on Linux vs.
`dir\file` on Windows, for example.

```go
package main

import (
	"fmt"
	"path/filepath"
	"strings"
)

func main() {
```

`Join` should be used to construct paths in a
portable way. It takes any number of arguments
and constructs a hierarchical path from them.

```go
p := filepath.Join("dir1", "dir2", "filename")
	fmt.Println("p:", p)
```

You should always use `Join` instead of
concatenating `/`s or `\`s manually. In addition
to providing portability, `Join` will also
normalize paths by removing superfluous separators
and directory changes.

```go
fmt.Println(filepath.Join("dir1//", "filename"))
	fmt.Println(filepath.Join("dir1/../dir1", "filename"))
```

`Dir` and `Base` can be used to split a path to the
directory and the file. Alternatively, `Split` will
return both in the same call.

```go
fmt.Println("Dir(p):", filepath.Dir(p))
	fmt.Println("Base(p):", filepath.Base(p))
```

We can check whether a path is absolute.

```go
fmt.Println(filepath.IsAbs("dir/file"))
	fmt.Println(filepath.IsAbs("/dir/file"))

	filename := "config.json"
```

Some file names have extensions following a dot. We
can split the extension out of such names with `Ext`.

```go
ext := filepath.Ext(filename)
	fmt.Println(ext)
```

To find the file's name with the extension removed,
use `strings.TrimSuffix`.

```go
fmt.Println(strings.TrimSuffix(filename, ext))
```

`Rel` finds a relative path between a *base* and a
*target*. It returns an error if the target cannot
be made relative to base.

```go
rel, err := filepath.Rel("a/b", "a/b/t/file")
	if err != nil {
		panic(err)
	}
	fmt.Println(rel)

	rel, err = filepath.Rel("a/b", "a/c/t/file")
	if err != nil {
		panic(err)
	}
	fmt.Println(rel)
}
```

```console
$ go run file-paths.go
p: dir1/dir2/filename
dir1/filename
dir1/filename
Dir(p): dir1/dir2
Base(p): filename
false
true
.json
config
t/file
../c/t/file
```

## Directories

Go has several useful functions for working with
*directories* in the file system.

```go
package main

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {
```

Create a new sub-directory in the current working
directory.

```go
err := os.Mkdir("subdir", 0755)
	check(err)
```

When creating temporary directories, it's good
practice to `defer` their removal. `os.RemoveAll`
will delete a whole directory tree (similarly to
`rm -rf`).

```go
defer os.RemoveAll("subdir")
```

Helper function to create a new empty file.

```go
createEmptyFile := func(name string) {
		d := []byte("")
		check(os.WriteFile(name, d, 0644))
	}

	createEmptyFile("subdir/file1")
```

We can create a hierarchy of directories, including
parents with `MkdirAll`. This is similar to the
command-line `mkdir -p`.

```go
err = os.MkdirAll("subdir/parent/child", 0755)
	check(err)

	createEmptyFile("subdir/parent/file2")
	createEmptyFile("subdir/parent/file3")
	createEmptyFile("subdir/parent/child/file4")
```

`ReadDir` lists directory contents, returning a
slice of `os.DirEntry` objects.

```go
c, err := os.ReadDir("subdir/parent")
	check(err)

	fmt.Println("Listing subdir/parent")
	for _, entry := range c {
		fmt.Println(" ", entry.Name(), entry.IsDir())
	}
```

`Chdir` lets us change the current working directory,
similarly to `cd`.

```go
err = os.Chdir("subdir/parent/child")
	check(err)
```

Now we'll see the contents of `subdir/parent/child`
when listing the *current* directory.

```go
c, err = os.ReadDir(".")
	check(err)

	fmt.Println("Listing subdir/parent/child")
	for _, entry := range c {
		fmt.Println(" ", entry.Name(), entry.IsDir())
	}
```

`cd` back to where we started.

```go
err = os.Chdir("../../..")
	check(err)
```

We can also visit a directory *recursively*,
including all its sub-directories. `WalkDir` accepts
a callback function to handle every file or
directory visited.

```go
fmt.Println("Visiting subdir")
	err = filepath.WalkDir("subdir", visit)
	check(err)
}
```

`visit` is called for every file or directory found
recursively by `filepath.WalkDir`.

```go
func visit(path string, d fs.DirEntry, err error) error {
	if err != nil {
		return err
	}
	fmt.Println(" ", path, d.IsDir())
	return nil
}
```

```console
$ go run directories.go
Listing subdir/parent
  child true
  file2 false
  file3 false
Listing subdir/parent/child
  file4 false
Visiting subdir
  subdir true
  subdir/file1 false
  subdir/parent true
  subdir/parent/child true
  subdir/parent/child/file4 false
  subdir/parent/file2 false
  subdir/parent/file3 false
```

## Temporary Files and Directories

Throughout program execution, we often want to create
data that isn't needed after the program exits.
*Temporary files and directories* are useful for this
purpose since they don't pollute the file system over
time.

```go
package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {
```

The easiest way to create a temporary file is by
calling `os.CreateTemp`. It creates a file *and*
opens it for reading and writing. We provide `""`
as the first argument, so `os.CreateTemp` will
create the file in the default location for our OS.

```go
f, err := os.CreateTemp("", "sample")
	check(err)
```

Display the name of the temporary file. On
Unix-based OSes the directory will likely be `/tmp`.
The file name starts with the prefix given as the
second argument to `os.CreateTemp` and the rest
is chosen automatically to ensure that concurrent
calls will always create different file names.

```go
fmt.Println("Temp file name:", f.Name())
```

Clean up the file after we're done. The OS is
likely to clean up temporary files by itself after
some time, but it's good practice to do this
explicitly.

```go
defer os.Remove(f.Name())
```

We can write some data to the file.

```go
_, err = f.Write([]byte{1, 2, 3, 4})
	check(err)
```

If we intend to write many temporary files, we may
prefer to create a temporary *directory*.
`os.MkdirTemp`'s arguments are the same as
`CreateTemp`'s, but it returns a directory *name*
rather than an open file.

```go
dname, err := os.MkdirTemp("", "sampledir")
	check(err)
	fmt.Println("Temp dir name:", dname)

	defer os.RemoveAll(dname)
```

Now we can synthesize temporary file names by
prefixing them with our temporary directory.

```go
fname := filepath.Join(dname, "file1")
	err = os.WriteFile(fname, []byte{1, 2}, 0666)
	check(err)
}
```

```console
$ go run temporary-files-and-directories.go
Temp file name: /tmp/sample610887201
Temp dir name: /tmp/sampledir898854668
```

## Embed Directive

`//go:embed` is a [compiler
directive](https://pkg.go.dev/cmd/compile#hdr-Compiler_Directives) that
allows programs to include arbitrary files and folders in the Go binary at
build time. Read more about the embed directive
[here](https://pkg.go.dev/embed).

```go
package main
```

Import the `embed` package; if you don't use any exported
identifiers from this package, you can do a blank import with `_ "embed"`.

```go
import (
	"embed"
)
```

`embed` directives accept paths relative to the directory containing the
Go source file. This directive embeds the contents of the file into the
`string` variable immediately following it.

```go
//go:embed folder/single_file.txt
var fileString string
```

Or embed the contents of the file into a `[]byte`.

```go
//go:embed folder/single_file.txt
var fileByte []byte
```

We can also embed multiple files or even folders with wildcards. This uses
a variable of the [embed.FS type](https://pkg.go.dev/embed#FS), which
implements a simple virtual file system.

```go
//go:embed folder/single_file.txt
//go:embed folder/*.hash
var folder embed.FS

func main() {
```

Print out the contents of `single_file.txt`.

```go
print(fileString)
	print(string(fileByte))
```

Retrieve some files from the embedded folder.

```go
content1, _ := folder.ReadFile("folder/file1.hash")
	print(string(content1))

	content2, _ := folder.ReadFile("folder/file2.hash")
	print(string(content2))
}
```

```console
$ mkdir -p folder
$ echo "hello go" > folder/single_file.txt
$ echo "123" > folder/file1.hash
$ echo "456" > folder/file2.hash

$ go run embed-directive.go
hello go
hello go
123
456
```

## Testing and Benchmarking

Unit testing is an important part of writing
principled Go programs. The `testing` package
provides the tools we need to write unit tests
and the `go test` command runs tests.

For the sake of demonstration, this code is in package
`main`, but it could be any package. Testing code
typically lives in the same package as the code it tests.

```go
package main

import (
	"fmt"
	"testing"
)
```

We'll be testing this simple implementation of an
integer minimum. Typically, the code we're testing
would be in a source file named something like
`intutils.go`, and the test file for it would then
be named `intutils_test.go`.

```go
func IntMin(a, b int) int {
	if a < b {
		return a
	}
	return b
}
```

A test is created by writing a function with a name
beginning with `Test`.

```go
func TestIntMinBasic(t *testing.T) {
	ans := IntMin(2, -2)
	if ans != -2 {
```

`t.Error*` will report test failures but continue
executing the test. `t.Fatal*` will report test
failures and stop the test immediately.

```go
t.Errorf("IntMin(2, -2) = %d; want -2", ans)
	}
}
```

Writing tests can be repetitive, so it's idiomatic to
use a *table-driven style*, where test inputs and
expected outputs are listed in a table and a single loop
walks over them and performs the test logic.

```go
func TestIntMinTableDriven(t *testing.T) {
	var tests = []struct {
		a, b int
		want int
	}{
		{0, 1, 0},
		{1, 0, 0},
		{2, -2, -2},
		{0, -1, -1},
		{-1, 0, -1},
	}

	for _, tt := range tests {
```

`t.Run` enables running "subtests", one for each
table entry. These are shown separately
when executing `go test -v`.

```go
testname := fmt.Sprintf("%d,%d", tt.a, tt.b)
		t.Run(testname, func(t *testing.T) {
			ans := IntMin(tt.a, tt.b)
			if ans != tt.want {
				t.Errorf("got %d, want %d", ans, tt.want)
			}
		})
	}
}
```

Benchmark tests typically go in `_test.go` files and are
named beginning with `Benchmark`.
Any code that's required for the benchmark to run but should
not be measured goes before this loop.

```go
func BenchmarkIntMin(b *testing.B) {
	for b.Loop() {
```

The benchmark runner will automatically execute this loop
body many times to determine a reasonable estimate of the
run-time of a single iteration.

```go
IntMin(1, 2)
	}
}
```

```console
$ go test -v
== RUN   TestIntMinBasic
--- PASS: TestIntMinBasic (0.00s)
=== RUN   TestIntMinTableDriven
=== RUN   TestIntMinTableDriven/0,1
=== RUN   TestIntMinTableDriven/1,0
=== RUN   TestIntMinTableDriven/2,-2
=== RUN   TestIntMinTableDriven/0,-1
=== RUN   TestIntMinTableDriven/-1,0
--- PASS: TestIntMinTableDriven (0.00s)
    --- PASS: TestIntMinTableDriven/0,1 (0.00s)
    --- PASS: TestIntMinTableDriven/1,0 (0.00s)
    --- PASS: TestIntMinTableDriven/2,-2 (0.00s)
    --- PASS: TestIntMinTableDriven/0,-1 (0.00s)
    --- PASS: TestIntMinTableDriven/-1,0 (0.00s)
PASS
ok  	examples/testing-and-benchmarking	0.023s

$ go test -bench=.
goos: darwin
goarch: arm64
pkg: examples/testing
BenchmarkIntMin-8 1000000000 0.3136 ns/op
PASS
ok  	examples/testing-and-benchmarking	0.351s
```

## Command-Line Arguments

[_Command-line arguments_](https://en.wikipedia.org/wiki/Command-line_interface#Arguments)
are a common way to parameterize execution of programs.
For example, `go run hello.go` uses `run` and
`hello.go` arguments to the `go` program.

```go
package main

import (
	"fmt"
	"os"
)

func main() {
```

`os.Args` provides access to raw command-line
arguments. Note that the first value in this slice
is the path to the program, and `os.Args[1:]`
holds the arguments to the program.

```go
argsWithProg := os.Args
	argsWithoutProg := os.Args[1:]
```

You can get individual args with normal indexing.

```go
arg := os.Args[3]

	fmt.Println(argsWithProg)
	fmt.Println(argsWithoutProg)
	fmt.Println(arg)
}
```

```console
$ go build command-line-arguments.go
$ ./command-line-arguments a b c d
[./command-line-arguments a b c d]       
[a b c d]
c
```

## Command-Line Flags

[_Command-line flags_](https://en.wikipedia.org/wiki/Command-line_interface#Command-line_option)
are a common way to specify options for command-line
programs. For example, in `wc -l` the `-l` is a
command-line flag.

```go
package main
```

Go provides a `flag` package supporting basic
command-line flag parsing. We'll use this package to
implement our example command-line program.

```go
import (
	"flag"
	"fmt"
)

func main() {
```

Basic flag declarations are available for string,
integer, and boolean options. Here we declare a
string flag `word` with a default value `"foo"`
and a short description. This `flag.String` function
returns a string pointer (not a string value);
we'll see how to use this pointer below.

```go
wordPtr := flag.String("word", "foo", "a string")
```

This declares `numb` and `fork` flags, using a
similar approach to the `word` flag.

```go
numbPtr := flag.Int("numb", 42, "an int")
	forkPtr := flag.Bool("fork", false, "a bool")
```

It's also possible to declare an option that uses an
existing var declared elsewhere in the program.
Note that we need to pass in a pointer to the flag
declaration function.

```go
var svar string
	flag.StringVar(&svar, "svar", "bar", "a string var")
```

Once all flags are declared, call `flag.Parse()`
to execute the command-line parsing.

```go
flag.Parse()
```

Here we'll just dump out the parsed options and
any trailing positional arguments. Note that we
need to dereference the pointers with e.g. `*wordPtr`
to get the actual option values.

```go
fmt.Println("word:", *wordPtr)
	fmt.Println("numb:", *numbPtr)
	fmt.Println("fork:", *forkPtr)
	fmt.Println("svar:", svar)
	fmt.Println("tail:", flag.Args())
}
```

```console
$ go build command-line-flags.go

$ ./command-line-flags -word=opt -numb=7 -fork -svar=flag
word: opt
numb: 7
fork: true
svar: flag
tail: []

$ ./command-line-flags -word=opt
word: opt
numb: 42
fork: false
svar: bar
tail: []

$ ./command-line-flags -word=opt a1 a2 a3
word: opt
...
tail: [a1 a2 a3]

$ ./command-line-flags -word=opt a1 a2 a3 -numb=7
word: opt
numb: 42
fork: false
svar: bar
tail: [a1 a2 a3 -numb=7]

$ ./command-line-flags -h
Usage of ./command-line-flags:
  -fork=false: a bool
  -numb=42: an int
  -svar="bar": a string var
  -word="foo": a string

$ ./command-line-flags -wat
flag provided but not defined: -wat
Usage of ./command-line-flags:
...
```

## Command-Line Subcommands

Some command-line tools, like the `go` tool or `git`
have many *subcommands*, each with its own set of
flags. For example, `go build` and `go get` are two
different subcommands of the `go` tool.
The `flag` package lets us easily define simple
subcommands that have their own flags.

```go
package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
```

We declare a subcommand using the `NewFlagSet`
function, and proceed to define new flags specific
for this subcommand.

```go
fooCmd := flag.NewFlagSet("foo", flag.ExitOnError)
	fooEnable := fooCmd.Bool("enable", false, "enable")
	fooName := fooCmd.String("name", "", "name")
```

For a different subcommand we can define different
supported flags.

```go
barCmd := flag.NewFlagSet("bar", flag.ExitOnError)
	barLevel := barCmd.Int("level", 0, "level")
```

The subcommand is expected as the first argument
to the program.

```go
if len(os.Args) < 2 {
		fmt.Println("expected 'foo' or 'bar' subcommands")
		os.Exit(1)
	}
```

Check which subcommand is invoked.

```go
switch os.Args[1] {
```

For every subcommand, we parse its own flags and
have access to trailing positional arguments.

```go
case "foo":
		fooCmd.Parse(os.Args[2:])
		fmt.Println("subcommand 'foo'")
		fmt.Println("  enable:", *fooEnable)
		fmt.Println("  name:", *fooName)
		fmt.Println("  tail:", fooCmd.Args())
	case "bar":
		barCmd.Parse(os.Args[2:])
		fmt.Println("subcommand 'bar'")
		fmt.Println("  level:", *barLevel)
		fmt.Println("  tail:", barCmd.Args())
	default:
		fmt.Println("expected 'foo' or 'bar' subcommands")
		os.Exit(1)
	}
}
```

```console
$ go build command-line-subcommands.go 

$ ./command-line-subcommands foo -enable -name=joe a1 a2
subcommand 'foo'
  enable: true
  name: joe
  tail: [a1 a2]

$ ./command-line-subcommands bar -level 8 a1
subcommand 'bar'
  level: 8
  tail: [a1]

$ ./command-line-subcommands bar -enable a1
flag provided but not defined: -enable
Usage of bar:
  -level int
    	level
```

## Environment Variables

[Environment variables](https://en.wikipedia.org/wiki/Environment_variable)
are a universal mechanism for [conveying configuration
information to Unix programs](https://www.12factor.net/config).
Let's look at how to set, get, and list environment variables.

```go
package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
```

To set a key/value pair, use `os.Setenv`. To get a
value for a key, use `os.Getenv`. This will return
an empty string if the key isn't present in the
environment.

```go
os.Setenv("FOO", "1")
	fmt.Println("FOO:", os.Getenv("FOO"))
	fmt.Println("BAR:", os.Getenv("BAR"))
```

Use `os.Environ` to list all key/value pairs in the
environment. This returns a slice of strings in the
form `KEY=value`. You can `strings.SplitN` them to
get the key and value. Here we print all the keys.

```go
fmt.Println()
	for _, e := range os.Environ() {
		pair := strings.SplitN(e, "=", 2)
		fmt.Println(pair[0])
	}
}
```

```console
$ go run environment-variables.go
FOO: 1
BAR: 

TERM_PROGRAM
PATH
SHELL
...
FOO

$ BAR=2 go run environment-variables.go
FOO: 1
BAR: 2
...
```

## Logging

The Go standard library provides straightforward
tools for outputting logs from Go programs, with
the [log](https://pkg.go.dev/log) package for
free-form output and the
[log/slog](https://pkg.go.dev/log/slog) package for
structured output.

```go
package main

import (
	"bytes"
	"fmt"
	"log"
	"os"

	"log/slog"
)

func main() {
```

Simply invoking functions like `Println` from the
`log` package uses the _standard_ logger, which
is already pre-configured for reasonable logging
output to `os.Stderr`. Additional methods like
`Fatal*` or `Panic*` will exit the program after
logging.

```go
log.Println("standard logger")
```

Loggers can be configured with _flags_ to set
their output format. By default, the standard
logger has the `log.Ldate` and `log.Ltime` flags
set, and these are collected in `log.LstdFlags`.
We can change its flags to emit time with
microsecond accuracy, for example.

```go
log.SetFlags(log.LstdFlags | log.Lmicroseconds)
	log.Println("with micro")
```

It also supports emitting the file name and
line from which the `log` function is called.

```go
log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("with file/line")
```

It may be useful to create a custom logger and
pass it around. When creating a new logger, we
can set a _prefix_ to distinguish its output
from other loggers.

```go
mylog := log.New(os.Stdout, "my:", log.LstdFlags)
	mylog.Println("from mylog")
```

We can set the prefix
on existing loggers (including the standard one)
with the `SetPrefix` method.

```go
mylog.SetPrefix("ohmy:")
	mylog.Println("from mylog")
```

Loggers can have custom output targets;
any `io.Writer` works.

```go
var buf bytes.Buffer
	buflog := log.New(&buf, "buf:", log.LstdFlags)
```

This call writes the log output into `buf`.

```go
buflog.Println("hello")
```

This will actually show it on standard output.

```go
fmt.Print("from buflog:", buf.String())
```

The `slog` package provides
_structured_ log output. For example, logging
in JSON format is straightforward.

```go
jsonHandler := slog.NewJSONHandler(os.Stderr, nil)
	myslog := slog.New(jsonHandler)
	myslog.Info("hi there")
```

In addition to the message, `slog` output can
contain an arbitrary number of key=value
pairs.

```go
myslog.Info("hello again", "key", "val", "age", 25)
}
```

```console
$ go run logging.go
2023/08/22 10:45:16 standard logger
2023/08/22 10:45:16.904141 with micro
2023/08/22 10:45:16 logging.go:40: with file/line
my:2023/08/22 10:45:16 from mylog
ohmy:2023/08/22 10:45:16 from mylog
from buflog:buf:2023/08/22 10:45:16 hello

{"time":"2023-08-22T10:45:16.904166391-07:00",
 "level":"INFO","msg":"hi there"}
{"time":"2023-08-22T10:45:16.904178985-07:00",
	"level":"INFO","msg":"hello again",
	"key":"val","age":25}
```

## HTTP Client

The Go standard library comes with excellent support
for HTTP clients and servers in the `net/http`
package. In this example we'll use it to issue simple
HTTP requests.

```go
package main

import (
	"bufio"
	"fmt"
	"net/http"
)

func main() {
```

Issue an HTTP GET request to a server. `http.Get` is a
convenient shortcut around creating an `http.Client`
object and calling its `Get` method; it uses the
`http.DefaultClient` object which has useful default
settings.

```go
resp, err := http.Get("https://gobyexample.com")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
```

Print the HTTP response status.

```go
fmt.Println("Response status:", resp.Status)
```

Print the first 5 lines of the response body.

```go
scanner := bufio.NewScanner(resp.Body)
	for i := 0; scanner.Scan() && i < 5; i++ {
		fmt.Println(scanner.Text())
	}

	if err := scanner.Err(); err != nil {
		panic(err)
	}
}
```

```console
$ go run http-clients.go
Response status: 200 OK
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Go by Example</title>
```

## HTTP Server

Writing a basic HTTP server is easy using the
`net/http` package.

```go
package main

import (
	"fmt"
	"net/http"
)
```

A fundamental concept in `net/http` servers is
*handlers*. A handler is an object implementing the
`http.Handler` interface. A common way to write
a handler is by using the `http.HandlerFunc` adapter
on functions with the appropriate signature.

```go
func hello(w http.ResponseWriter, req *http.Request) {
```

Functions serving as handlers take a
`http.ResponseWriter` and a `http.Request` as
arguments. The response writer is used to fill in the
HTTP response. Here our simple response is just
"hello\n".

```go
fmt.Fprintf(w, "hello\n")
}

func headers(w http.ResponseWriter, req *http.Request) {
```

This handler does something a little more
sophisticated by reading all the HTTP request
headers and echoing them into the response body.

```go
for name, headers := range req.Header {
		for _, h := range headers {
			fmt.Fprintf(w, "%v: %v\n", name, h)
		}
	}
}

func main() {
```

We register our handlers on server routes using the
`http.HandleFunc` convenience function. It sets up
the *default router* in the `net/http` package and
takes a function as an argument.

```go
http.HandleFunc("/hello", hello)
	http.HandleFunc("/headers", headers)
```

Finally, we call the `ListenAndServe` with the port
and a handler. `nil` tells it to use the default
router we've just set up.

```go
http.ListenAndServe(":8090", nil)
}
```

```console
$ go run http-server.go &

$ curl localhost:8090/hello
hello
```

## TCP Server

The `net` package provides the tools we need to easily build
TCP socket servers.

```go
package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"strings"
)

func main() {
```

`net.Listen` starts the server on the given network
(TCP) and address (port 8090 on all interfaces).

```go
listener, err := net.Listen("tcp", ":8090")
	if err != nil {
		log.Fatal("Error listening:", err)
	}
```

Close the listener to free the port
when the application exits.

```go
defer listener.Close()
```

Loop indefinitely to accept new client connections.

```go
for {
```

Wait for a connection.

```go
conn, err := listener.Accept()
		if err != nil {
			log.Println("Error accepting conn:", err)
			continue
		}
```

We use a goroutine here to handle the connection
so that the main loop can continue accepting more
connections.

```go
go handleConnection(conn)
	}
}
```

`handleConnection` handles a single client connection,
reading one line of text from the client and returning a response.

```go
func handleConnection(conn net.Conn) {
```

Closing the connection releases resources when
we are finished interacting with the client.

```go
defer conn.Close()
```

Use `bufio.NewReader` to read one line of data
from the client (terminated by a newline).

```go
reader := bufio.NewReader(conn)
	message, err := reader.ReadString('\n')
	if err != nil {
		log.Printf("Read error: %v", err)
		return
	}
```

Create and send a response back to the client,
demonstrating two-way communication.

```go
ackMsg := strings.ToUpper(strings.TrimSpace(message))
	response := fmt.Sprintf("ACK: %s\n", ackMsg)
	_, err = conn.Write([]byte(response))
	if err != nil {
		log.Printf("Server write error: %v", err)
	}
}
```

```console
$ go run tcp-server.go &

$ echo "Hello from netcat" | nc localhost 8090
ACK: HELLO FROM NETCAT
```

## Context

In the previous example we looked at setting up a simple
[HTTP server](http-server). HTTP servers are useful for
demonstrating the usage of `context.Context` for
controlling cancellation. A `Context` carries deadlines,
cancellation signals, and other request-scoped values
across API boundaries and goroutines.

```go
package main

import (
	"fmt"
	"net/http"
	"time"
)

func hello(w http.ResponseWriter, req *http.Request) {
```

A `context.Context` is created for each request by
the `net/http` machinery, and is available with
the `Context()` method.

```go
ctx := req.Context()
	fmt.Println("server: hello handler started")
	defer fmt.Println("server: hello handler ended")
```

Wait for a few seconds before sending a reply to the
client. This could simulate some work the server is
doing. While working, keep an eye on the context's
`Done()` channel for a signal that we should cancel
the work and return as soon as possible.

```go
select {
	case <-time.After(10 * time.Second):
		fmt.Fprintf(w, "hello\n")
	case <-ctx.Done():
```

The context's `Err()` method returns an error
that explains why the `Done()` channel was
closed.

```go
err := ctx.Err()
		fmt.Println("server:", err)
		internalError := http.StatusInternalServerError
		http.Error(w, err.Error(), internalError)
	}
}

func main() {
```

As before, we register our handler on the "/hello"
route, and start serving.

```go
http.HandleFunc("/hello", hello)
	http.ListenAndServe(":8090", nil)
}
```

```console
$ go run context.go &

$ curl localhost:8090/hello
server: hello handler started
^C
server: context canceled
server: hello handler ended
```

## Spawning Processes

Sometimes our Go programs need to spawn other
processes.

```go
package main

import (
	"errors"
	"fmt"
	"io"
	"os/exec"
)

func main() {
```

We'll start with a simple command that takes no
arguments or input and just prints something to
stdout. The `exec.Command` helper creates an object
to represent this external process.

```go
dateCmd := exec.Command("date")
```

The `Output` method runs the command, waits for it
to finish and collects its standard output.
 If there were no errors, `dateOut` will hold bytes
with the date info.

```go
dateOut, err := dateCmd.Output()
	if err != nil {
		panic(err)
	}
	fmt.Println("> date")
	fmt.Println(string(dateOut))
```

`Output` and other methods of `Command` will return
`*exec.Error` if there was a problem executing the
command (e.g. wrong path), and `*exec.ExitError`
if the command ran but exited with a non-zero return
code.

```go
_, err = exec.Command("date", "-x").Output()
	if err != nil {
		if e, ok := errors.AsType[*exec.Error](err); ok {
			fmt.Println("failed executing:", e)
		} else if e, ok := errors.AsType[*exec.ExitError](err); ok {
			exitCode := e.ExitCode()
			fmt.Println("command exit rc =", exitCode)
		} else {
			panic(err)
		}
	}
```

Next we'll look at a slightly more involved case
where we pipe data to the external process on its
`stdin` and collect the results from its `stdout`.

```go
grepCmd := exec.Command("grep", "hello")
```

Here we explicitly grab input/output pipes, start
the process, write some input to it, read the
resulting output, and finally wait for the process
to exit.

```go
grepIn, _ := grepCmd.StdinPipe()
	grepOut, _ := grepCmd.StdoutPipe()
	grepCmd.Start()
	grepIn.Write([]byte("hello grep\ngoodbye grep"))
	grepIn.Close()
	grepBytes, _ := io.ReadAll(grepOut)
	grepCmd.Wait()
```

We omitted error checks in the above example, but
you could use the usual `if err != nil` pattern for
all of them. We also only collect the `StdoutPipe`
results, but you could collect the `StderrPipe` in
exactly the same way.

```go
fmt.Println("> grep hello")
	fmt.Println(string(grepBytes))
```

Note that when spawning commands we need to
provide an explicitly delineated command and
argument array, vs. being able to just pass in one
command-line string. If you want to spawn a full
command with a string, you can use `bash`'s `-c`
option:

```go
lsCmd := exec.Command("bash", "-c", "ls -a -l -h")
	lsOut, err := lsCmd.Output()
	if err != nil {
		panic(err)
	}
	fmt.Println("> ls -a -l -h")
	fmt.Println(string(lsOut))
}
```

```console
$ go run spawning-processes.go 
> date
Thu 05 May 2022 10:10:12 PM PDT

command exit rc = 1
> grep hello
hello grep

> ls -a -l -h
drwxr-xr-x  4 mark 136B Oct 3 16:29 .
drwxr-xr-x 91 mark 3.0K Oct 3 12:50 ..
-rw-r--r--  1 mark 1.3K Oct 3 16:28 spawning-processes.go
```

## Signals

Sometimes we'd like our Go programs to intelligently
handle [Unix signals](https://en.wikipedia.org/wiki/Unix_signal).
For example, we might want a server to gracefully
shutdown when it receives a `SIGTERM`, or a command-line
tool to stop processing input if it receives a `SIGINT`.
Here's a modern way to handle signals using contexts.

```go
package main

import (
	"context"
	"fmt"
	"os/signal"
	"syscall"
)

func main() {
```

`signal.NotifyContext` returns a context that's canceled
when one of the listed signals arrives.

```go
ctx, stop := signal.NotifyContext(
		context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
```

The program will wait here until one of the
configured signals is received.

```go
fmt.Println("awaiting signal")
	<-ctx.Done()
```

`context.Cause` reports why the context was canceled.
For a signal-triggered cancellation, this includes
the signal value.

```go
fmt.Println()
	fmt.Println(context.Cause(ctx))
	fmt.Println("exiting")
}
```

```console
$ go run signals.go
awaiting signal
^C
interrupt signal received
exiting
```

## Exit

Use `os.Exit` to immediately exit with a given
status.

```go
package main

import (
	"fmt"
	"os"
)

func main() {
```

`defer`s will _not_ be run when using `os.Exit`, so
this `fmt.Println` will never be called.

```go
defer fmt.Println("!")
```

Exit with status 3.

```go
os.Exit(3)
}
```

Note that unlike e.g. C, Go does not use an integer
return value from `main` to indicate exit status. If
you'd like to exit with a non-zero status you should
use `os.Exit`.

```console
$ go run exit.go
exit status 3

$ go build exit.go
$ ./exit
$ echo $?
3
```
