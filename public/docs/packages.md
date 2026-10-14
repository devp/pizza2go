# Packages

<p class="doc-source"><code>go doc -all</code> for the packages units use most, from go1.27.2. © The Go Authors, BSD-style license.</p>

## fmt

```go
package fmt // import "fmt"

Package fmt implements formatted I/O with functions analogous to C's printf and
scanf. The format 'verbs' are derived from C's but are simpler.

# Printing

There are four families of printing functions defined by their output
destination. Print, Println and Printf write to os.Stdout; Sprint, Sprintln and
Sprintf return a string; Fprint, Fprintln and Fprintf write to an io.Writer;
and Append, Appendln and Appendf append the output to a byte slice.

The functions within each family do the formatting according to the end of the
name. Print, Sprint, Fprint and Append use the default format for each argument,
adding a space between operands when neither is a string. Println, Sprintln,
Fprintln and Appendln always add spaces and append a newline. Printf, Sprintf,
Fprintf and Appendf use a sequence of "verbs" to control the formatting.

The verbs:

General:

    %v	the value in a default format
    	when printing structs, the plus flag (%+v) adds field names
    %#v	a Go-syntax representation of the value
    	(floating-point infinities and NaNs print as ±Inf and NaN)
    %T	a Go-syntax representation of the type of the value
    %%	a literal percent sign; consumes no value

Boolean:

    %t	the word true or false

Integer:

    %b	base 2
    %c	the character represented by the corresponding Unicode code point
    %d	base 10
    %o	base 8
    %O	base 8 with 0o prefix
    %q	a single-quoted rune literal safely escaped with Go syntax.
    %x	base 16, with lower-case letters for a-f
    %X	base 16, with upper-case letters for A-F
    %U	Unicode format: U+1234; same as "U+%04X"

Floating-point and complex constituents:

    %b	decimalless scientific notation with exponent a power of two,
    	in the manner of strconv.FormatFloat with the 'b' format,
    	e.g. -123456p-78
    %e	scientific notation, e.g. -1.234456e+78
    %E	scientific notation, e.g. -1.234456E+78
    %f	decimal point but no exponent, e.g. 123.456
    %F	synonym for %f
    %g	%e for large exponents, %f otherwise. Precision is discussed below.
    %G	%E for large exponents, %F otherwise
    %x	hexadecimal notation (with decimal power of two exponent), e.g. -0x1.23abcp+20
    %X	upper-case hexadecimal notation, e.g. -0X1.23ABCP+20

    The exponent is always a decimal integer.
    For formats other than %b the exponent is at least two digits.

String and slice of bytes (treated equivalently with these verbs):

    %s	the uninterpreted bytes of the string or slice
    %q	a double-quoted string safely escaped with Go syntax
    %x	base 16, lower-case, two characters per byte
    %X	base 16, upper-case, two characters per byte

Slice:

    %p	address of 0th element in base 16 notation, with leading 0x

Pointer:

    %p	base 16 notation, with leading 0x
    The %b, %d, %o, %x and %X verbs also work with pointers,
    formatting the value exactly as if it were an integer.

The default format for %v is:

    bool:                    %t
    int, int8 etc.:          %d
    uint, uint8 etc.:        %d, %#x if printed with %#v
    float32, complex64, etc: %g
    string:                  %s
    chan:                    %p
    pointer:                 %p

For compound objects, the elements are printed using these rules, recursively,
laid out like this:

    struct:             {field0 field1 ...}
    array, slice:       [elem0 elem1 ...]
    maps:               map[key1:value1 key2:value2 ...]
    pointer to above:   &{}, &[], &map[]

Width is specified by an optional decimal number immediately preceding the verb.
If absent, the width is whatever is necessary to represent the value. Precision
is specified after the (optional) width by a period followed by a decimal
number. If no period is present, a default precision is used. A period with no
following number specifies a precision of zero. Examples:

    %f     default width, default precision
    %9f    width 9, default precision
    %.2f   default width, precision 2
    %9.2f  width 9, precision 2
    %9.f   width 9, precision 0

Width and precision are measured in units of Unicode code points, that is,
runes. (This differs from C's printf where the units are always measured in
bytes.) Either or both of the flags may be replaced with the character '*',
causing their values to be obtained from the next operand (preceding the one to
format), which must be of type int.

For most values, width is the minimum number of runes to output, padding the
formatted form with spaces if necessary.

For strings, byte slices and byte arrays, however, precision limits the length
of the input to be formatted (not the size of the output), truncating if
necessary. Normally it is measured in runes, but for these types when formatted
with the %x or %X format it is measured in bytes.

For floating-point values, width sets the minimum width of the field and
precision sets the number of places after the decimal, if appropriate, except
that for %g/%G precision sets the maximum number of significant digits (trailing
zeros are removed). For example, given 12.345 the format %6.3f prints 12.345
while %.3g prints 12.3. The default precision for %e, %f and %#g is 6; for %g it
is the smallest number of digits necessary to identify the value uniquely.

For complex numbers, the width and precision apply to the two components
independently and the result is parenthesized, so %f applied to 1.2+3.4i
produces (1.200000+3.400000i).

When formatting a single integer code point or a rune string (type []rune)
with %q, invalid Unicode code points are changed to the Unicode replacement
character, U+FFFD, as in strconv.QuoteRune.

Other flags:

    '+'	always print a sign for numeric values;
    	guarantee ASCII-only output for %q (%+q)
    '-'	pad with spaces on the right rather than the left (left-justify the field)
    '#'	alternate format: add leading 0b for binary (%#b), 0 for octal (%#o),
    	0x or 0X for hex (%#x or %#X); suppress 0x for %p (%#p);
    	for %q, print a raw (backquoted) string if [strconv.CanBackquote]
    	returns true;
    	always print a decimal point for %e, %E, %f, %F, %g and %G;
    	do not remove trailing zeros for %g and %G;
    	write e.g. U+0078 'x' if the character is printable for %U (%#U)
    ' '	(space) leave a space for elided sign in numbers (% d);
    	put spaces between bytes printing strings or slices in hex (% x, % X)
    '0'	pad with leading zeros rather than spaces;
    	for numbers, this moves the padding after the sign

Flags are ignored by verbs that do not expect them. For example there is no
alternate decimal format, so %#d and %d behave identically.

For each Printf-like function, there is also a Print function that takes no
format and is equivalent to saying %v for every operand. Another variant Println
inserts blanks between operands and appends a newline.

Regardless of the verb, if an operand is an interface value, the internal
concrete value is used, not the interface itself. Thus:

    var i interface{} = 23
    fmt.Printf("%v\n", i)

will print 23.

Except when printed using the verbs %T and %p, special formatting considerations
apply for operands that implement certain interfaces. In order of application:

1. If the operand is a reflect.Value, the operand is replaced by the concrete
value that it holds, and printing continues with the next rule.

2. If an operand implements the Formatter interface, it will be invoked. In this
case the interpretation of verbs and flags is controlled by that implementation.

3. If the %v verb is used with the # flag (%#v) and the operand implements the
GoStringer interface, that will be invoked.

If the format (which is implicitly %v for Println etc.) is valid for a string
(%s %q %x %X), or is %v but not %#v, the following two rules apply:

4. If an operand implements the error interface, the Error method will be
invoked to convert the object to a string, which will then be formatted as
required by the verb (if any).

5. If an operand implements method String() string, that method will be invoked
to convert the object to a string, which will then be formatted as required by
the verb (if any).

For compound operands such as slices and structs, the format applies to the
elements of each operand, recursively, not to the operand as a whole. Thus %q
will quote each element of a slice of strings, and %6.2f will control formatting
for each element of a floating-point array.

However, when printing a byte slice with a string-like verb (%s %q %x %X),
it is treated identically to a string, as a single item.

To avoid recursion in cases such as

    type X string
    func (x X) String() string { return Sprintf("<%s>", x) }

convert the value before recurring:

    func (x X) String() string { return Sprintf("<%s>", string(x)) }

Infinite recursion can also be triggered by self-referential data structures,
such as a slice that contains itself as an element, if that type has a String
method. Such pathologies are rare, however, and the package does not protect
against them.

When printing a struct, fmt cannot and therefore does not invoke formatting
methods such as Error or String on unexported fields.

# Explicit argument indexes

In Printf, Sprintf, Fprintf, and Appendf, the default behavior is for each
formatting verb to format successive arguments passed in the call. However,
the notation [n] immediately before the verb indicates that the nth one-indexed
argument is to be formatted instead. The same notation before a '*' for a width
or precision selects the argument index holding the value. After processing a
bracketed expression [n], subsequent verbs will use arguments n+1, n+2, etc.
unless otherwise directed.

For example,

    fmt.Sprintf("%[2]d %[1]d\n", 11, 22)

will yield "22 11", while

    fmt.Sprintf("%[3]*.[2]*[1]f", 12.0, 2, 6)

equivalent to

    fmt.Sprintf("%6.2f", 12.0)

will yield " 12.00". Because an explicit index affects subsequent verbs,
this notation can be used to print the same values multiple times by resetting
the index for the first argument to be repeated:

    fmt.Sprintf("%d %d %#[1]x %#x", 16, 17)

will yield "16 17 0x10 0x11".

# Format errors

If an invalid argument is given for a verb, such as providing a string to %d,
the generated string will contain a description of the problem, as in these
examples:

    Wrong type or unknown verb: %!verb(type=value)
    	Printf("%d", "hi"):        %!d(string=hi)
    Too many arguments: %!(EXTRA type=value)
    	Printf("hi", "guys"):      hi%!(EXTRA string=guys)
    Too few arguments: %!verb(MISSING)
    	Printf("hi%d"):            hi%!d(MISSING)
    Non-int for width or precision: %!(BADWIDTH) or %!(BADPREC)
    	Printf("%*s", 4.5, "hi"):  %!(BADWIDTH)hi
    	Printf("%.*s", 4.5, "hi"): %!(BADPREC)hi
    Invalid or invalid use of argument index: %!(BADINDEX)
    	Printf("%*[2]d", 7):       %!d(BADINDEX)
    	Printf("%.[2]d", 7):       %!d(BADINDEX)

All errors begin with the string "%!" followed sometimes by a single character
(the verb) and end with a parenthesized description.

If an Error or String method triggers a panic when called by a print routine,
the fmt package reformats the error message from the panic, decorating it with
an indication that it came through the fmt package. For example, if a String
method calls panic("bad"), the resulting formatted message will look like

    %!s(PANIC=bad)

The %!s just shows the print verb in use when the failure occurred. If the panic
is caused by a nil receiver to an Error, String, or GoString method, however,
the output is the undecorated string, "<nil>".

Many packages whose APIs involve string formatting expose a trio of functions
similar to Print, Printf, and Println. For example, the log.Print, log.Printf
and log.Println functions forward their arguments to the corresponding functions
in this package. To avoid confusion, other wrapper functions should follow the
naming and behavioral conventions established by this package. In particular,
a single function should not choose between literal printing (like Print) and
formatted printing (like Printf) based on the number of arguments; instead,
provide separate functions.

# Scanning

An analogous set of functions scans formatted text to yield values. Scan, Scanf
and Scanln read from os.Stdin; Fscan, Fscanf and Fscanln read from a specified
io.Reader; Sscan, Sscanf and Sscanln read from an argument string.

Scan, Fscan, Sscan treat newlines in the input as spaces.

Scanln, Fscanln and Sscanln stop scanning at a newline and require that the
items be followed by a newline or EOF.

Scanf, Fscanf, and Sscanf parse the arguments according to a format string,
analogous to that of Printf. In the text that follows, 'space' means any Unicode
whitespace character except newline.

In the format string, a verb introduced by the % character consumes and parses
input; these verbs are described in more detail below. A character other than %,
space, or newline in the format consumes exactly that input character, which
must be present. A newline with zero or more spaces before it in the format
string consumes zero or more spaces in the input followed by a single newline or
the end of the input. A space following a newline in the format string consumes
zero or more spaces in the input. Otherwise, any run of one or more spaces in
the format string consumes as many spaces as possible in the input. Unless the
run of spaces in the format string appears adjacent to a newline, the run must
consume at least one space from the input or find the end of the input.

The handling of spaces and newlines differs from that of C's scanf family: in C,
newlines are treated as any other space, and it is never an error when a run of
spaces in the format string finds no spaces to consume in the input.

The verbs behave analogously to those of Printf. For example, %x will scan an
integer as a hexadecimal number, and %v will scan the default representation
format for the value. The Printf verbs %p and %T and the flags # and + are not
implemented. For floating-point and complex values, all valid formatting verbs
(%b %e %E %f %F %g %G %x %X and %v) are equivalent and accept both decimal and
hexadecimal notation (for example: "2.3e+7", "0x4.5p-8") and digit-separating
underscores (for example: "3.14159_26535_89793").

Input processed by verbs is implicitly space-delimited: the implementation of
every verb except %c starts by discarding leading spaces from the remaining
input, and the %s verb (and %v reading into a string) stops consuming input at
the first space or newline character.

The familiar base-setting prefixes 0b (binary), 0o and 0 (octal), and 0x
(hexadecimal) are accepted when scanning integers without a format or with the
%v verb, as are digit-separating underscores.

Width is interpreted in the input text but there is no syntax for scanning with
a precision (no %5.2f, just %5f). If width is provided, it applies after leading
spaces are trimmed and specifies the maximum number of runes to read to satisfy
the verb. For example,

    Sscanf(" 1234567 ", "%5s%d", &s, &i)

will set s to "12345" and i to 67 while

    Sscanf(" 12 34 567 ", "%5s%d", &s, &i)

will set s to "12" and i to 34.

In all the scanning functions, a carriage return followed immediately by a
newline is treated as a plain newline (\r\n means the same as \n).

In all the scanning functions, if an operand implements method Scan (that is,
it implements the Scanner interface) that method will be used to scan the text
for that operand. Also, if the number of arguments scanned is less than the
number of arguments provided, an error is returned.

All arguments to be scanned must be either pointers to basic types or
implementations of the Scanner interface.

Like Scanf and Fscanf, Sscanf need not consume its entire input. There is no way
to recover how much of the input string Sscanf used.

Note: Fscan etc. can read one character (rune) past the input they return,
which means that a loop calling a scan routine may skip some of the input.
This is usually a problem only when there is no space between input values.
If the reader provided to Fscan implements ReadRune, that method will be used
to read characters. If the reader also implements UnreadRune, that method
will be used to save the character and successive calls will not lose data.
To attach ReadRune and UnreadRune methods to a reader without that capability,
use bufio.NewReader.

FUNCTIONS

func Append(b []byte, a ...any) []byte
    Append formats using the default formats for its operands, appends the
    result to the byte slice, and returns the updated slice. Spaces are added
    between operands when neither is a string.

func Appendf(b []byte, format string, a ...any) []byte
    Appendf formats according to a format specifier, appends the result to the
    byte slice, and returns the updated slice.

func Appendln(b []byte, a ...any) []byte
    Appendln formats using the default formats for its operands, appends the
    result to the byte slice, and returns the updated slice. Spaces are always
    added between operands and a newline is appended.

func Errorf(format string, a ...any) (err error)
    Errorf formats according to a format specifier and returns the string as a
    value that satisfies error.

    If the format specifier includes a %w verb with an error operand,
    the returned error will implement an Unwrap method returning the operand.
    If there is more than one %w verb, the returned error will implement an
    Unwrap method returning a []error containing all the %w operands in the
    order they appear in the arguments. It is invalid to supply the %w verb
    with an operand that does not implement the error interface. The %w verb is
    otherwise a synonym for %v.

func FormatString(state State, verb rune) string
    FormatString returns a string representing the fully qualified formatting
    directive captured by the State, followed by the argument verb. (State
    does not itself contain the verb.) The result has a leading percent sign
    followed by any flags, the width, and the precision. Missing flags, width,
    and precision are omitted. This function allows a Formatter to reconstruct
    the original directive triggering the call to Format.

func Fprint(w io.Writer, a ...any) (n int, err error)
    Fprint formats using the default formats for its operands and writes to w.
    Spaces are added between operands when neither is a string. It returns the
    number of bytes written and any write error encountered.

func Fprintf(w io.Writer, format string, a ...any) (n int, err error)
    Fprintf formats according to a format specifier and writes to w. It returns
    the number of bytes written and any write error encountered.

func Fprintln(w io.Writer, a ...any) (n int, err error)
    Fprintln formats using the default formats for its operands and writes to w.
    Spaces are always added between operands and a newline is appended.
    It returns the number of bytes written and any write error encountered.

func Fscan(r io.Reader, a ...any) (n int, err error)
    Fscan scans text read from r, storing successive space-separated values
    into successive arguments. Newlines count as space. It returns the number of
    items successfully scanned. If that is less than the number of arguments,
    err will report why.

func Fscanf(r io.Reader, format string, a ...any) (n int, err error)
    Fscanf scans text read from r, storing successive space-separated values
    into successive arguments as determined by the format. It returns the number
    of items successfully parsed. Newlines in the input must match newlines in
    the format.

func Fscanln(r io.Reader, a ...any) (n int, err error)
    Fscanln is similar to Fscan, but stops scanning at a newline and after the
    final item there must be a newline or EOF.

func Print(a ...any) (n int, err error)
    Print formats using the default formats for its operands and writes to
    standard output. Spaces are added between operands when neither is a string.
    It returns the number of bytes written and any write error encountered.

func Printf(format string, a ...any) (n int, err error)
    Printf formats according to a format specifier and writes to standard
    output. It returns the number of bytes written and any write error
    encountered.

func Println(a ...any) (n int, err error)
    Println formats using the default formats for its operands and writes to
    standard output. Spaces are always added between operands and a newline
    is appended. It returns the number of bytes written and any write error
    encountered.

func Scan(a ...any) (n int, err error)
    Scan scans text read from standard input, storing successive space-separated
    values into successive arguments. Newlines count as space. It returns the
    number of items successfully scanned. If that is less than the number of
    arguments, err will report why.

func Scanf(format string, a ...any) (n int, err error)
    Scanf scans text read from standard input, storing successive
    space-separated values into successive arguments as determined by the
    format. It returns the number of items successfully scanned. If that is less
    than the number of arguments, err will report why. Newlines in the input
    must match newlines in the format. The one exception: the verb %c always
    scans the next rune in the input, even if it is a space (or tab etc.) or
    newline.

func Scanln(a ...any) (n int, err error)
    Scanln is similar to Scan, but stops scanning at a newline and after the
    final item there must be a newline or EOF.

func Sprint(a ...any) string
    Sprint formats using the default formats for its operands and returns
    the resulting string. Spaces are added between operands when neither is a
    string.

func Sprintf(format string, a ...any) string
    Sprintf formats according to a format specifier and returns the resulting
    string.

func Sprintln(a ...any) string
    Sprintln formats using the default formats for its operands and returns the
    resulting string. Spaces are always added between operands and a newline is
    appended.

func Sscan(str string, a ...any) (n int, err error)
    Sscan scans the argument string, storing successive space-separated values
    into successive arguments. Newlines count as space. It returns the number of
    items successfully scanned. If that is less than the number of arguments,
    err will report why.

func Sscanf(str string, format string, a ...any) (n int, err error)
    Sscanf scans the argument string, storing successive space-separated values
    into successive arguments as determined by the format. It returns the number
    of items successfully parsed. Newlines in the input must match newlines in
    the format.

func Sscanln(str string, a ...any) (n int, err error)
    Sscanln is similar to Sscan, but stops scanning at a newline and after the
    final item there must be a newline or EOF.


TYPES

type Formatter interface {
	Format(f State, verb rune)
}
    Formatter is implemented by any value that has a Format method. The
    implementation controls how State and rune are interpreted, and may call
    Sprint or Fprint(f) etc. to generate its output.

type GoStringer interface {
	GoString() string
}
    GoStringer is implemented by any value that has a GoString method, which
    defines the Go syntax for that value. The GoString method is used to print
    values passed as an operand to a %#v format.

type ScanState interface {
	// ReadRune reads the next rune (Unicode code point) from the input.
	// If invoked during Scanln, Fscanln, or Sscanln, ReadRune() will
	// return EOF after returning the first '\n' or when reading beyond
	// the specified width.
	ReadRune() (r rune, size int, err error)
	// UnreadRune causes the next call to ReadRune to return the same rune.
	UnreadRune() error
	// SkipSpace skips space in the input. Newlines are treated appropriately
	// for the operation being performed; see the package documentation
	// for more information.
	SkipSpace()
	// Token skips space in the input if skipSpace is true, then returns the
	// run of Unicode code points c satisfying f(c).  If f is nil,
	// !unicode.IsSpace(c) is used; that is, the token will hold non-space
	// characters. Newlines are treated appropriately for the operation being
	// performed; see the package documentation for more information.
	// The returned slice points to shared data that may be overwritten
	// by the next call to Token, a call to a Scan function using the ScanState
	// as input, or when the calling Scan method returns.
	Token(skipSpace bool, f func(rune) bool) (token []byte, err error)
	// Width returns the value of the width option and whether it has been set.
	// The unit is Unicode code points.
	Width() (wid int, ok bool)
	// Because ReadRune is implemented by the interface, Read should never be
	// called by the scanning routines and a valid implementation of
	// ScanState may choose always to return an error from Read.
	Read(buf []byte) (n int, err error)
}
    ScanState represents the scanner state passed to custom scanners. Scanners
    may do rune-at-a-time scanning or ask the ScanState to discover the next
    space-delimited token.

type Scanner interface {
	Scan(state ScanState, verb rune) error
}
    Scanner is implemented by any value that has a Scan method, which scans
    the input for the representation of a value and stores the result in the
    receiver, which must be a pointer to be useful. The Scan method is called
    for any argument to Scan, Scanf, or Scanln that implements it.

type State interface {
	// Write is the function to call to emit formatted output to be printed.
	Write(b []byte) (n int, err error)
	// Width returns the value of the width option and whether it has been set.
	Width() (wid int, ok bool)
	// Precision returns the value of the precision option and whether it has been set.
	Precision() (prec int, ok bool)

	// Flag reports whether the flag c, a character, has been set.
	Flag(c int) bool
}
    State represents the printer state passed to custom formatters. It provides
    access to the io.Writer interface plus information about the flags and
    options for the operand's format specifier.

type Stringer interface {
	String() string
}
    Stringer is implemented by any value that has a String method, which defines
    the “native” format for that value. The String method is used to print
    values passed as an operand to any format that accepts a string or to an
    unformatted printer such as Print.
```

## errors

```go
package errors // import "errors"

Package errors implements functions to manipulate errors.

The New function creates errors whose only content is a text message.

An error e wraps another error if e's type has one of the methods

    Unwrap() error
    Unwrap() []error

If e.Unwrap() returns a non-nil error w or a slice containing w, then we say
that e wraps w. A nil error returned from e.Unwrap() indicates that e does
not wrap any error. It is invalid for an Unwrap method to return an []error
containing a nil error value.

An easy way to create wrapped errors is to call fmt.Errorf and apply the %w verb
to the error argument:

    wrapsErr := fmt.Errorf("... %w ...", ..., err, ...)

Successive unwrapping of an error creates a tree. The Is and As functions
inspect an error's tree by examining first the error itself followed by the tree
of each of its children in turn (pre-order, depth-first traversal).

See https://go.dev/blog/go1.13-errors for a deeper discussion of the philosophy
of wrapping and when to wrap.

Is examines the tree of its first argument looking for an error that matches the
second. It reports whether it finds a match. It should be used in preference to
simple equality checks:

    if errors.Is(err, fs.ErrExist)

is preferable to

    if err == fs.ErrExist

because the former will succeed if err wraps io/fs.ErrExist.

AsType examines the tree of its argument looking for an error whose type matches
its type argument. If it succeeds, it returns the corresponding value of that
type and true. Otherwise, it returns the zero value of that type and false.
The form

    if perr, ok := errors.AsType[*fs.PathError](err); ok {
    	fmt.Println(perr.Path)
    }

is preferable to

    if perr, ok := err.(*fs.PathError); ok {
    	fmt.Println(perr.Path)
    }

because the former will succeed if err wraps an *io/fs.PathError.

VARIABLES

var ErrUnsupported = New("unsupported operation")
    ErrUnsupported indicates that a requested operation cannot be performed,
    because it is unsupported. For example, a call to os.Link when using a file
    system that does not support hard links.

    Functions and methods should not return this error but should instead return
    an error including appropriate context that satisfies

        errors.Is(err, errors.ErrUnsupported)

    either by directly wrapping ErrUnsupported or by implementing an Is method.

    Functions and methods should document the cases in which an error wrapping
    this will be returned.


FUNCTIONS

func As(err error, target any) bool
    As finds the first error in err's tree that matches target, and if one
    is found, sets target to that error value and returns true. Otherwise,
    it returns false.

    For most uses, prefer AsType. As is equivalent to AsType but sets its target
    argument rather than returning the matching error and doesn't require its
    target argument to implement error.

    The tree consists of err itself, followed by the errors obtained by
    repeatedly calling its Unwrap() error or Unwrap() []error method. When err
    wraps multiple errors, As examines err followed by a depth-first traversal
    of its children.

    An error matches target if the error's concrete value is assignable to
    the value pointed to by target, or if the error has a method As(any) bool
    such that As(target) returns true. In the latter case, the As method is
    responsible for setting target.

    An error type might provide an As method so it can be treated as if it were
    a different error type.

    As panics if target is not a non-nil pointer to either a type that
    implements error, or to any interface type.

func AsType[E error](err error) (E, bool)
    AsType finds the first error in err's tree that matches the type E, and if
    one is found, returns that error value and true. Otherwise, it returns the
    zero value of E and false.

    The tree consists of err itself, followed by the errors obtained by
    repeatedly calling its Unwrap() error or Unwrap() []error method. When
    err wraps multiple errors, AsType examines err followed by a depth-first
    traversal of its children.

    An error err matches the type E if the type assertion err.(E) holds,
    or if the error has a method As(any) bool such that err.As(target) returns
    true when target is a non-nil *E. In the latter case, the As method is
    responsible for setting target.

func Is(err, target error) bool
    Is reports whether any error in err's tree matches target. The target must
    be comparable.

    The tree consists of err itself, followed by the errors obtained by
    repeatedly calling its Unwrap() error or Unwrap() []error method. When err
    wraps multiple errors, Is examines err followed by a depth-first traversal
    of its children.

    An error is considered to match a target if it is equal to that target or if
    it implements a method Is(error) bool such that Is(target) returns true.

    An error type might provide an Is method so it can be treated as equivalent
    to an existing error. For example, if MyError defines

        func (m MyError) Is(target error) bool { return target == fs.ErrExist }

    then Is(MyError{}, fs.ErrExist) returns true. See syscall.Errno.Is for an
    example in the standard library. An Is method should only shallowly compare
    err and the target and not call Unwrap on either.

func Join(errs ...error) error
    Join returns an error that wraps the given errors. Any nil error values are
    discarded. Join returns nil if every value in errs is nil. The error formats
    as the concatenation of the strings obtained by calling the Error method of
    each element of errs, with a newline between each string.

    A non-nil error returned by Join implements the Unwrap() []error method.
    The errors may be inspected with Is and As.

func New(text string) error
    New returns an error that formats as the given text. Each call to New
    returns a distinct error value even if the text is identical.

func Unwrap(err error) error
    Unwrap returns the result of calling the Unwrap method on err, if err's type
    contains an Unwrap method returning error. Otherwise, Unwrap returns nil.

    Unwrap only calls a method of the form "Unwrap() error". In particular
    Unwrap does not unwrap errors returned by Join.
```

## strings

```go
package strings // import "strings"

Package strings implements simple functions to manipulate UTF-8 encoded strings.

For information about UTF-8 strings in Go, see https://blog.golang.org/strings.

FUNCTIONS

func Clone(s string) string
    Clone returns a fresh copy of s. It guarantees to make a copy of s into a
    new allocation, which can be important when retaining only a small substring
    of a much larger string. Using Clone can help such programs use less memory.
    Of course, since using Clone makes a copy, overuse of Clone can make
    programs use more memory. Clone should typically be used only rarely,
    and only when profiling indicates that it is needed. For strings of length
    zero the string "" will be returned and no allocation is made.

func Compare(a, b string) int
    Compare returns an integer comparing two strings lexicographically.
    The result will be 0 if a == b, -1 if a < b, and +1 if a > b.

    Use Compare when you need to perform a three-way comparison (with
    slices.SortFunc, for example). It is usually clearer and always faster to
    use the built-in string comparison operators ==, <, >, and so on.

func Contains(s, substr string) bool
    Contains reports whether substr is within s.

func ContainsAny(s, chars string) bool
    ContainsAny reports whether any Unicode code points in chars are within s.

func ContainsFunc(s string, f func(rune) bool) bool
    ContainsFunc reports whether any Unicode code points r within s satisfy
    f(r). It stops as soon as a call to f returns true.

func ContainsRune(s string, r rune) bool
    ContainsRune reports whether the Unicode code point r is within s.

func Count(s, substr string) int
    Count counts the number of non-overlapping instances of substr in s.
    If substr is an empty string, Count returns 1 + the number of Unicode code
    points in s.

func Cut(s, sep string) (before, after string, found bool)
    Cut slices s around the first instance of sep, returning the text before and
    after sep. The found result reports whether sep appears in s. If sep does
    not appear in s, cut returns s, "", false.

func CutLast(s, sep string) (before, after string, found bool)
    CutLast slices s around the last instance of sep, returning the text
    before and after sep. The found result reports whether sep appears in s.
    If sep does not appear in s, CutLast returns s, "", false.

func CutPrefix(s, prefix string) (after string, found bool)
    CutPrefix returns s without the provided leading prefix string and reports
    whether it found the prefix. If s doesn't start with prefix, CutPrefix
    returns s, false. If prefix is the empty string, CutPrefix returns s, true.

func CutSuffix(s, suffix string) (before string, found bool)
    CutSuffix returns s without the provided ending suffix string and reports
    whether it found the suffix. If s doesn't end with suffix, CutSuffix returns
    s, false. If suffix is the empty string, CutSuffix returns s, true.

func EqualFold(s, t string) bool
    EqualFold reports whether s and t, interpreted as UTF-8 strings,
    are equal under simple Unicode case-folding, which is a more general form of
    case-insensitivity.

func Fields(s string) []string
    Fields splits the string s around each instance of one or more consecutive
    white space characters, as defined by unicode.IsSpace, returning a slice
    of substrings of s or an empty slice if s contains only white space.
    Every element of the returned slice is non-empty. Unlike Split, leading and
    trailing runs of white space characters are discarded.

func FieldsFunc(s string, f func(rune) bool) []string
    FieldsFunc splits the string s at each run of Unicode code points c
    satisfying f(c) and returns an array of slices of s. If all code points
    in s satisfy f(c) or the string is empty, an empty slice is returned.
    Every element of the returned slice is non-empty. Unlike Split, leading and
    trailing runs of code points satisfying f(c) are discarded.

    FieldsFunc makes no guarantees about the order in which it calls f(c) and
    assumes that f always returns the same value for a given c.

func FieldsFuncSeq(s string, f func(rune) bool) iter.Seq[string]
    FieldsFuncSeq returns an iterator over substrings of s split around runs of
    Unicode code points satisfying f(c). The iterator yields the same strings
    that would be returned by FieldsFunc(s), but without constructing the slice.

func FieldsSeq(s string) iter.Seq[string]
    FieldsSeq returns an iterator over substrings of s split around runs
    of whitespace characters, as defined by unicode.IsSpace. The iterator
    yields the same strings that would be returned by Fields(s), but without
    constructing the slice.

func HasPrefix(s, prefix string) bool
    HasPrefix reports whether the string s begins with prefix.

func HasSuffix(s, suffix string) bool
    HasSuffix reports whether the string s ends with suffix.

func Index(s, substr string) int
    Index returns the index of the first instance of substr in s, or -1 if
    substr is not present in s.

func IndexAny(s, chars string) int
    IndexAny returns the index of the first instance of any Unicode code point
    from chars in s, or -1 if no Unicode code point from chars is present in s.

func IndexByte(s string, c byte) int
    IndexByte returns the index of the first instance of c in s, or -1 if c is
    not present in s.

func IndexFunc(s string, f func(rune) bool) int
    IndexFunc returns the index into s of the first Unicode code point
    satisfying f(c), or -1 if none do.

func IndexRune(s string, r rune) int
    IndexRune returns the index of the first instance of the Unicode code point
    r, or -1 if rune is not present in s. If r is utf8.RuneError, it returns the
    first instance of any invalid UTF-8 byte sequence.

func Join(elems []string, sep string) string
    Join concatenates the elements of its first argument to create a single
    string. The separator string sep is placed between elements in the resulting
    string.

func LastIndex(s, substr string) int
    LastIndex returns the index of the last instance of substr in s, or -1 if
    substr is not present in s.

func LastIndexAny(s, chars string) int
    LastIndexAny returns the index of the last instance of any Unicode code
    point from chars in s, or -1 if no Unicode code point from chars is present
    in s.

func LastIndexByte(s string, c byte) int
    LastIndexByte returns the index of the last instance of c in s, or -1 if c
    is not present in s.

func LastIndexFunc(s string, f func(rune) bool) int
    LastIndexFunc returns the index into s of the last Unicode code point
    satisfying f(c), or -1 if none do.

func Lines(s string) iter.Seq[string]
    Lines returns an iterator over the newline-terminated lines in the string s.
    The lines yielded by the iterator include their terminating newlines.
    If s is empty, the iterator yields no lines at all. If s does not end in
    a newline, the final yielded line will not end in a newline. It returns a
    single-use iterator.

func Map(mapping func(rune) rune, s string) string
    Map returns a copy of the string s with all its characters modified
    according to the mapping function. If mapping returns a negative value,
    the character is dropped from the string with no replacement.

func Repeat(s string, count int) string
    Repeat returns a new string consisting of count copies of the string s.

    It panics if count is negative or if the result of (len(s) * count)
    overflows.

func Replace(s, old, new string, n int) string
    Replace returns a copy of the string s with the first n non-overlapping
    instances of old replaced by new. If old is empty, it matches at the
    beginning of the string and after each UTF-8 sequence, yielding up to k+1
    replacements for a k-rune string. If n < 0, there is no limit on the number
    of replacements.

func ReplaceAll(s, old, new string) string
    ReplaceAll returns a copy of the string s with all non-overlapping instances
    of old replaced by new. If old is empty, it matches at the beginning of the
    string and after each UTF-8 sequence, yielding up to k+1 replacements for a
    k-rune string.

func Split(s, sep string) []string
    Split slices s into all substrings separated by sep and returns a slice of
    the substrings between those separators.

    If s does not contain sep and sep is not empty, Split returns a slice of
    length 1 whose only element is s.

    If sep is empty, Split splits after each UTF-8 sequence. If both s and sep
    are empty, Split returns an empty slice.

    It is equivalent to SplitN with a count of -1.

    To split around the first instance of a separator, see Cut.

func SplitAfter(s, sep string) []string
    SplitAfter slices s into all substrings after each instance of sep and
    returns a slice of those substrings.

    If s does not contain sep and sep is not empty, SplitAfter returns a slice
    of length 1 whose only element is s.

    If sep is empty, SplitAfter splits after each UTF-8 sequence. If both s and
    sep are empty, SplitAfter returns an empty slice.

    It is equivalent to SplitAfterN with a count of -1.

func SplitAfterN(s, sep string, n int) []string
    SplitAfterN slices s into substrings after each instance of sep and returns
    a slice of those substrings.

    The count determines the number of substrings to return:
      - n > 0: at most n substrings; the last substring will be the unsplit
        remainder;
      - n == 0: the result is nil (zero substrings);
      - n < 0: all substrings.

    Edge cases for s and sep (for example, empty strings) are handled as
    described in the documentation for SplitAfter.

func SplitAfterSeq(s, sep string) iter.Seq[string]
    SplitAfterSeq returns an iterator over substrings of s split after each
    instance of sep. The iterator yields the same strings that would be returned
    by SplitAfter(s, sep), but without constructing the slice. It returns a
    single-use iterator.

func SplitN(s, sep string, n int) []string
    SplitN slices s into substrings separated by sep and returns a slice of the
    substrings between those separators.

    The count determines the number of substrings to return:
      - n > 0: at most n substrings; the last substring will be the unsplit
        remainder;
      - n == 0: the result is nil (zero substrings);
      - n < 0: all substrings.

    Edge cases for s and sep (for example, empty strings) are handled as
    described in the documentation for Split.

    To split around the first instance of a separator, see Cut.

func SplitSeq(s, sep string) iter.Seq[string]
    SplitSeq returns an iterator over all substrings of s separated by sep.
    The iterator yields the same strings that would be returned by Split(s,
    sep), but without constructing the slice. It returns a single-use iterator.

func Title(s string) string
    Title returns a copy of the string s with all Unicode letters that begin
    words mapped to their Unicode title case.

    Deprecated: The rule Title uses for word boundaries does not handle Unicode
    punctuation properly. Use golang.org/x/text/cases instead.

func ToLower(s string) string
    ToLower returns s with all Unicode letters mapped to their lower case.

func ToLowerSpecial(c unicode.SpecialCase, s string) string
    ToLowerSpecial returns a copy of the string s with all Unicode letters
    mapped to their lower case using the case mapping specified by c.

func ToTitle(s string) string
    ToTitle returns a copy of the string s with all Unicode letters mapped to
    their Unicode title case.

func ToTitleSpecial(c unicode.SpecialCase, s string) string
    ToTitleSpecial returns a copy of the string s with all Unicode letters
    mapped to their Unicode title case, giving priority to the special casing
    rules.

func ToUpper(s string) string
    ToUpper returns s with all Unicode letters mapped to their upper case.

func ToUpperSpecial(c unicode.SpecialCase, s string) string
    ToUpperSpecial returns a copy of the string s with all Unicode letters
    mapped to their upper case using the case mapping specified by c.

func ToValidUTF8(s, replacement string) string
    ToValidUTF8 returns a copy of the string s with each run of invalid UTF-8
    byte sequences replaced by the replacement string, which may be empty.

func Trim(s, cutset string) string
    Trim returns a slice of the string s with all leading and trailing Unicode
    code points contained in cutset removed.

func TrimFunc(s string, f func(rune) bool) string
    TrimFunc returns a slice of the string s with all leading and trailing
    Unicode code points c satisfying f(c) removed.

func TrimLeft(s, cutset string) string
    TrimLeft returns a slice of the string s with all leading Unicode code
    points contained in cutset removed.

    To remove a prefix, use TrimPrefix instead.

func TrimLeftFunc(s string, f func(rune) bool) string
    TrimLeftFunc returns a slice of the string s with all leading Unicode code
    points c satisfying f(c) removed.

func TrimPrefix(s, prefix string) string
    TrimPrefix returns s without the provided leading prefix string. If s
    doesn't start with prefix, s is returned unchanged.

func TrimRight(s, cutset string) string
    TrimRight returns a slice of the string s, with all trailing Unicode code
    points contained in cutset removed.

    To remove a suffix, use TrimSuffix instead.

func TrimRightFunc(s string, f func(rune) bool) string
    TrimRightFunc returns a slice of the string s with all trailing Unicode code
    points c satisfying f(c) removed.

func TrimSpace(s string) string
    TrimSpace returns a slice (substring) of the string s, with all leading and
    trailing white space removed, as defined by Unicode.

func TrimSuffix(s, suffix string) string
    TrimSuffix returns s without the provided trailing suffix string. If s
    doesn't end with suffix, s is returned unchanged.


TYPES

type Builder struct {
	// Has unexported fields.
}
    A Builder is used to efficiently build a string using Builder.Write methods.
    It minimizes memory copying. The zero value is ready to use. Do not copy a
    non-zero Builder.

func (b *Builder) Cap() int
    Cap returns the capacity of the builder's underlying byte slice. It is the
    total space allocated for the string being built and includes any bytes
    already written.

func (b *Builder) Grow(n int)
    Grow grows b's capacity, if necessary, to guarantee space for another n
    bytes. After Grow(n), at least n bytes can be written to b without another
    allocation. If n is negative, Grow panics.

func (b *Builder) Len() int
    Len returns the number of accumulated bytes; b.Len() == len(b.String()).

func (b *Builder) Reset()
    Reset resets the Builder to be empty.

func (b *Builder) String() string
    String returns the accumulated string.

func (b *Builder) Write(p []byte) (int, error)
    Write appends the contents of p to b's buffer. Write always returns len(p),
    nil.

func (b *Builder) WriteByte(c byte) error
    WriteByte appends the byte c to b's buffer. The returned error is always
    nil.

func (b *Builder) WriteRune(r rune) (int, error)
    WriteRune appends the UTF-8 encoding of Unicode code point r to b's buffer.
    It returns the number of bytes written and a nil error.

func (b *Builder) WriteString(s string) (int, error)
    WriteString appends the contents of s to b's buffer. It returns the length
    of s and a nil error.

type Reader struct {
	// Has unexported fields.
}
    A Reader implements the io.Reader, io.ReaderAt, io.ByteReader,
    io.ByteScanner, io.RuneReader, io.RuneScanner, io.Seeker, and io.WriterTo
    interfaces by reading from a string. The zero value for Reader operates like
    a Reader of an empty string.

func NewReader(s string) *Reader
    NewReader returns a new Reader reading from s. It is similar to
    bytes.NewBufferString but more efficient and non-writable.

func (r *Reader) Len() int
    Len returns the number of bytes of the unread portion of the string.

func (r *Reader) Read(b []byte) (n int, err error)
    Read implements the io.Reader interface.

func (r *Reader) ReadAt(b []byte, off int64) (n int, err error)
    ReadAt implements the io.ReaderAt interface.

func (r *Reader) ReadByte() (byte, error)
    ReadByte implements the io.ByteReader interface.

func (r *Reader) ReadRune() (ch rune, size int, err error)
    ReadRune implements the io.RuneReader interface.

func (r *Reader) Reset(s string)
    Reset resets the Reader to be reading from s.

func (r *Reader) Seek(offset int64, whence int) (int64, error)
    Seek implements the io.Seeker interface.

func (r *Reader) Size() int64
    Size returns the original length of the underlying string. Size is the
    number of bytes available for reading via Reader.ReadAt. The returned value
    is always the same and is not affected by calls to any other method.

func (r *Reader) UnreadByte() error
    UnreadByte implements the io.ByteScanner interface.

func (r *Reader) UnreadRune() error
    UnreadRune implements the io.RuneScanner interface.

func (r *Reader) WriteTo(w io.Writer) (n int64, err error)
    WriteTo implements the io.WriterTo interface.

type Replacer struct {
	// Has unexported fields.
}
    Replacer replaces a list of strings with replacements. It is safe for
    concurrent use by multiple goroutines.

func NewReplacer(oldnew ...string) *Replacer
    NewReplacer returns a new Replacer from a list of old, new string pairs.
    Replacements are performed in the order they appear in the target string,
    without overlapping matches. The old string comparisons are done in argument
    order.

    NewReplacer panics if given an odd number of arguments.

func (r *Replacer) Replace(s string) string
    Replace returns a copy of s with all replacements performed.

func (r *Replacer) WriteString(w io.Writer, s string) (n int, err error)
    WriteString writes s to w with all replacements performed.
```

## strconv

```go
package strconv // import "strconv"

Package strconv implements conversions to and from string representations of
basic data types.

# Numeric Conversions

The most common numeric conversions are Atoi (string to int) and Itoa (int to
string).

    i, err := strconv.Atoi("-42")
    s := strconv.Itoa(-42)

These assume decimal and the Go int type.

ParseBool, ParseFloat, ParseInt, and ParseUint convert strings to values:

    b, err := strconv.ParseBool("true")
    f, err := strconv.ParseFloat("3.1415", 64)
    i, err := strconv.ParseInt("-42", 10, 64)
    u, err := strconv.ParseUint("42", 10, 64)

The parse functions return the widest type (float64, int64, and uint64), but if
the size argument specifies a narrower width the result can be converted to that
narrower type without data loss:

    s := "2147483647" // biggest int32
    i64, err := strconv.ParseInt(s, 10, 32)
    ...
    i := int32(i64)

FormatBool, FormatFloat, FormatInt, and FormatUint convert values to strings:

    s := strconv.FormatBool(true)
    s := strconv.FormatFloat(3.1415, 'E', -1, 64)
    s := strconv.FormatInt(-42, 16)
    s := strconv.FormatUint(42, 16)

AppendBool, AppendFloat, AppendInt, and AppendUint are similar but append the
formatted value to a destination slice.

# String Conversions

Quote and QuoteToASCII convert strings to quoted Go string literals. The latter
guarantees that the result is an ASCII string, by escaping any non-ASCII Unicode
with \u:

    q := strconv.Quote("Hello, 世界")
    q := strconv.QuoteToASCII("Hello, 世界")

QuoteRune and QuoteRuneToASCII are similar but accept runes and return quoted Go
rune literals.

Unquote and UnquoteChar unquote Go string and rune literals.

CONSTANTS

const IntSize = strconv.IntSize
    IntSize is the size in bits of an int or uint value.


VARIABLES

var ErrRange = errors.New("value out of range")
    ErrRange indicates that a value is out of range for the target type.

var ErrSyntax = errors.New("invalid syntax")
    ErrSyntax indicates that a value does not have the right syntax for the
    target type.


FUNCTIONS

func AppendBool(dst []byte, b bool) []byte
    AppendBool appends "true" or "false", according to the value of b, to dst
    and returns the extended buffer.

func AppendFloat(dst []byte, f float64, fmt byte, prec, bitSize int) []byte
    AppendFloat appends the string form of the floating-point number f,
    as generated by FormatFloat, to dst and returns the extended buffer.

func AppendInt(dst []byte, i int64, base int) []byte
    AppendInt appends the string form of the integer i, as generated by
    FormatInt, to dst and returns the extended buffer.

func AppendQuote(dst []byte, s string) []byte
    AppendQuote appends a double-quoted Go string literal representing s,
    as generated by Quote, to dst and returns the extended buffer.

func AppendQuoteRune(dst []byte, r rune) []byte
    AppendQuoteRune appends a single-quoted Go character literal representing
    the rune, as generated by QuoteRune, to dst and returns the extended buffer.

func AppendQuoteRuneToASCII(dst []byte, r rune) []byte
    AppendQuoteRuneToASCII appends a single-quoted Go character literal
    representing the rune, as generated by QuoteRuneToASCII, to dst and returns
    the extended buffer.

func AppendQuoteRuneToGraphic(dst []byte, r rune) []byte
    AppendQuoteRuneToGraphic appends a single-quoted Go character literal
    representing the rune, as generated by QuoteRuneToGraphic, to dst and
    returns the extended buffer.

func AppendQuoteToASCII(dst []byte, s string) []byte
    AppendQuoteToASCII appends a double-quoted Go string literal representing s,
    as generated by QuoteToASCII, to dst and returns the extended buffer.

func AppendQuoteToGraphic(dst []byte, s string) []byte
    AppendQuoteToGraphic appends a double-quoted Go string literal representing
    s, as generated by QuoteToGraphic, to dst and returns the extended buffer.

func AppendUint(dst []byte, i uint64, base int) []byte
    AppendUint appends the string form of the unsigned integer i, as generated
    by FormatUint, to dst and returns the extended buffer.

func Atoi(s string) (int, error)
    Atoi is equivalent to ParseInt(s, 10, 0), converted to type int.

func CanBackquote(s string) bool
    CanBackquote reports whether the string s can be represented unchanged as a
    single-line backquoted string without control characters other than tab.

func FormatBool(b bool) string
    FormatBool returns "true" or "false" according to the value of b.

func FormatComplex(c complex128, fmt byte, prec, bitSize int) string
    FormatComplex converts the complex number c to a string of the form (a+bi)
    where a and b are the real and imaginary parts, formatted according to the
    format fmt and precision prec.

    The format fmt and precision prec have the same meaning as in FormatFloat.
    It rounds the result assuming that the original was obtained from a
    complex value of bitSize bits, which must be 64 for complex64 and 128 for
    complex128.

func FormatFloat(f float64, fmt byte, prec, bitSize int) string
    FormatFloat converts the floating-point number f to a string, according to
    the format fmt and precision prec. It rounds the result assuming that the
    original was obtained from a floating-point value of bitSize bits (32 for
    float32, 64 for float64).

    The format fmt is one of
      - 'b' (-ddddp±ddd, a binary exponent),
      - 'e' (-d.dddde±dd, a decimal exponent),
      - 'E' (-d.ddddE±dd, a decimal exponent),
      - 'f' (-ddd.dddd, no exponent),
      - 'g' ('e' for large exponents, 'f' otherwise),
      - 'G' ('E' for large exponents, 'f' otherwise),
      - 'x' (-0xd.ddddp±ddd, a hexadecimal fraction and binary exponent), or
      - 'X' (-0Xd.ddddP±ddd, a hexadecimal fraction and binary exponent).

    The precision prec controls the number of digits (excluding the exponent)
    printed by the 'e', 'E', 'f', 'g', 'G', 'x', and 'X' formats. For 'e', 'E',
    'f', 'x', and 'X', it is the number of digits after the decimal point.
    For 'g' and 'G' it is the maximum number of significant digits (trailing
    zeros are removed). The special precision -1 uses the smallest number of
    digits necessary such that ParseFloat will return f exactly. The exponent is
    written as a decimal integer; for all formats other than 'b', it will be at
    least two digits.

func FormatInt(i int64, base int) string
    FormatInt returns the string representation of i in the given base, for 2
    <= base <= 36. The result uses the lower-case letters 'a' to 'z' for digit
    values >= 10.

func FormatUint(i uint64, base int) string
    FormatUint returns the string representation of i in the given base,
    for 2 <= base <= 36. The result uses the lower-case letters 'a' to 'z' for
    digit values >= 10.

func IsGraphic(r rune) bool
    IsGraphic reports whether the rune is defined as a Graphic by Unicode.
    Such characters include letters, marks, numbers, punctuation, symbols,
    and spaces, from categories L, M, N, P, S, and Zs.

func IsPrint(r rune) bool
    IsPrint reports whether the rune is defined as printable by Go, with the
    same definition as unicode.IsPrint: letters, numbers, punctuation, symbols
    and ASCII space.

func Itoa(i int) string
    Itoa is equivalent to FormatInt(int64(i), 10).

func ParseBool(str string) (bool, error)
    ParseBool returns the boolean value represented by the string. It accepts 1,
    t, T, TRUE, true, True, 0, f, F, FALSE, false, False. Any other value
    returns an error.

func ParseComplex(s string, bitSize int) (complex128, error)
    ParseComplex converts the string s to a complex number with the precision
    specified by bitSize: 64 for complex64, or 128 for complex128. When
    bitSize=64, the result still has type complex128, but it will be convertible
    to complex64 without changing its value.

    The number represented by s must be of the form N, Ni, or N±Ni, where N
    stands for a floating-point number as recognized by ParseFloat, and i is
    the imaginary component. If the second N is unsigned, a + sign is required
    between the two components as indicated by the ±. If the second N is NaN,
    only a + sign is accepted. The form may be parenthesized and cannot contain
    any spaces. The resulting complex number consists of the two components
    converted by ParseFloat.

    The errors that ParseComplex returns have concrete type *NumError and
    include err.Num = s.

    If s is not syntactically well-formed, ParseComplex returns err.Err =
    ErrSyntax.

    If s is syntactically well-formed but either component is more than 1/2 ULP
    away from the largest floating point number of the given component's size,
    ParseComplex returns err.Err = ErrRange and c = ±Inf for the respective
    component.

func ParseFloat(s string, bitSize int) (float64, error)
    ParseFloat converts the string s to a floating-point number with the
    precision specified by bitSize: 32 for float32, or 64 for float64. When
    bitSize=32, the result still has type float64, but it will be convertible to
    float32 without changing its value.

    ParseFloat accepts decimal and hexadecimal floating-point numbers as defined
    by the Go syntax for floating-point literals. If s is well-formed and near a
    valid floating-point number, ParseFloat returns the nearest floating-point
    number rounded using IEEE754 unbiased rounding. (Parsing a hexadecimal
    floating-point value only rounds when there are more bits in the hexadecimal
    representation than will fit in the mantissa.)

    The errors that ParseFloat returns have concrete type *NumError and include
    err.Num = s.

    If s is not syntactically well-formed, ParseFloat returns err.Err =
    ErrSyntax.

    If s is syntactically well-formed but is more than 1/2 ULP away from the
    largest floating point number of the given size, ParseFloat returns f =
    ±Inf, err.Err = ErrRange.

    ParseFloat recognizes the string "NaN", and the (possibly signed) strings
    "Inf" and "Infinity" as their respective special floating point values.
    It ignores case when matching.

[floating-point literals]: https://go.dev/ref/spec#Floating-point_literals

func ParseInt(s string, base int, bitSize int) (i int64, err error)
    ParseInt interprets a string s in the given base (0, 2 to 36) and bit size
    (0 to 64) and returns the corresponding value i.

    The string may begin with a leading sign: "+" or "-".

    If the base argument is 0, the true base is implied by the string's prefix
    following the sign (if present): 2 for "0b", 8 for "0" or "0o", 16 for "0x",
    and 10 otherwise. Also, for argument base 0 only, underscore characters are
    permitted as defined by the Go syntax for integer literals.

    The bitSize argument specifies the integer type that the result must fit
    into. Bit sizes 0, 8, 16, 32, and 64 correspond to int, int8, int16, int32,
    and int64. If bitSize is below 0 or above 64, an error is returned.

    The errors that ParseInt returns have concrete type *NumError and include
    err.Num = s. If s is empty or contains invalid digits, err.Err = ErrSyntax
    and the returned value is 0; if the value corresponding to s cannot be
    represented by a signed integer of the given size, err.Err = ErrRange and
    the returned value is the maximum magnitude integer of the appropriate
    bitSize and sign.

[integer literals]: https://go.dev/ref/spec#Integer_literals

func ParseUint(s string, base int, bitSize int) (uint64, error)
    ParseUint is like ParseInt but for unsigned numbers.

    A sign prefix is not permitted.

func Quote(s string) string
    Quote returns a double-quoted Go string literal representing s. The
    returned string uses Go escape sequences (\t, \n, \xFF, \u0100) for control
    characters and non-printable characters as defined by IsPrint.

func QuoteRune(r rune) string
    QuoteRune returns a single-quoted Go character literal representing the
    rune. The returned string uses Go escape sequences (\t, \n, \xFF, \u0100)
    for control characters and non-printable characters as defined by IsPrint.
    If r is not a valid Unicode code point, it is interpreted as the Unicode
    replacement character U+FFFD.

func QuoteRuneToASCII(r rune) string
    QuoteRuneToASCII returns a single-quoted Go character literal representing
    the rune. The returned string uses Go escape sequences (\t, \n, \xFF,
    \u0100) for non-ASCII characters and non-printable characters as defined by
    IsPrint. If r is not a valid Unicode code point, it is interpreted as the
    Unicode replacement character U+FFFD.

func QuoteRuneToGraphic(r rune) string
    QuoteRuneToGraphic returns a single-quoted Go character literal representing
    the rune. If the rune is not a Unicode graphic character, as defined by
    IsGraphic, the returned string will use a Go escape sequence (\t, \n, \xFF,
    \u0100). If r is not a valid Unicode code point, it is interpreted as the
    Unicode replacement character U+FFFD.

func QuoteToASCII(s string) string
    QuoteToASCII returns a double-quoted Go string literal representing s.
    The returned string uses Go escape sequences (\t, \n, \xFF, \u0100) for
    non-ASCII characters and non-printable characters as defined by IsPrint.

func QuoteToGraphic(s string) string
    QuoteToGraphic returns a double-quoted Go string literal representing s.
    The returned string leaves Unicode graphic characters, as defined by
    IsGraphic, unchanged and uses Go escape sequences (\t, \n, \xFF, \u0100) for
    non-graphic characters.

func QuotedPrefix(s string) (string, error)
    QuotedPrefix returns the quoted string (as understood by Unquote) at the
    prefix of s. If s does not start with a valid quoted string, QuotedPrefix
    returns an error.

func Unquote(s string) (string, error)
    Unquote interprets s as a single-quoted, double-quoted, or backquoted
    Go string literal, returning the string value that s quotes. (If s is
    single-quoted, it would be a Go character literal; Unquote returns the
    corresponding one-character string. For an empty character literal Unquote
    returns the empty string.)

func UnquoteChar(s string, quote byte) (value rune, multibyte bool, tail string, err error)
    UnquoteChar decodes the first character or byte in the escaped string or
    character literal represented by the string s. It returns four values:

     1. value, the decoded Unicode code point or byte value;
     2. multibyte, a boolean indicating whether the decoded character requires a
        multibyte UTF-8 representation;
     3. tail, the remainder of the string after the character; and
     4. an error that will be nil if the character is syntactically valid.

    The second argument, quote, specifies the type of literal being parsed and
    therefore which escaped quote character is permitted. If set to a single
    quote, it permits the sequence \' and disallows unescaped '. If set to a
    double quote, it permits \" and disallows unescaped ". If set to zero,
    it does not permit either escape and allows both quote characters to appear
    unescaped.


TYPES

type NumError struct {
	Func string // the failing function (ParseBool, ParseInt, ParseUint, ParseFloat, ParseComplex)
	Num  string // the input
	Err  error  // the reason the conversion failed (e.g. ErrRange, ErrSyntax, etc.)
}
    A NumError records a failed conversion.

func (e *NumError) Error() string

func (e *NumError) Unwrap() error
```

## slices

```go
package slices // import "slices"

Package slices defines various functions useful with slices of any type.

FUNCTIONS

func All[Slice ~[]E, E any](s Slice) iter.Seq2[int, E]
    All returns an iterator over index-value pairs in the slice in the usual
    order.

func AppendSeq[Slice ~[]E, E any](s Slice, seq iter.Seq[E]) Slice
    AppendSeq appends the values from seq to the slice and returns the extended
    slice. If seq is empty, the result preserves the nilness of s.

func Backward[Slice ~[]E, E any](s Slice) iter.Seq2[int, E]
    Backward returns an iterator over index-value pairs in the slice, traversing
    it backward with descending indices.

func BinarySearch[S ~[]E, E cmp.Ordered](x S, target E) (int, bool)
    BinarySearch searches for target in a sorted slice and returns the earliest
    position where target is found, or the position where target would appear in
    the sort order; it also returns a bool saying whether the target is really
    found in the slice. The slice must be sorted in increasing order.

func BinarySearchFunc[S ~[]E, E, T any](x S, target T, cmp func(E, T) int) (int, bool)
    BinarySearchFunc works like BinarySearch, but uses a custom comparison
    function. The slice must be sorted in increasing order, where "increasing"
    is defined by cmp. cmp should return 0 if the slice element matches the
    target, a negative number if the slice element precedes the target, or a
    positive number if the slice element follows the target. cmp must implement
    the same ordering as the slice, such that if cmp(a, t) < 0 and cmp(b,
    t) >= 0, then a must precede b in the slice.

func Chunk[Slice ~[]E, E any](s Slice, n int) iter.Seq[Slice]
    Chunk returns an iterator over consecutive sub-slices of up to n elements of
    s. All but the last sub-slice will have size n. All sub-slices are clipped
    to have no capacity beyond the length. If s is empty, the sequence is empty:
    there is no empty slice in the sequence. Chunk panics if n is less than 1.

func Clip[S ~[]E, E any](s S) S
    Clip removes unused capacity from the slice, returning s[:len(s):len(s)].
    The result preserves the nilness of s.

func Clone[S ~[]E, E any](s S) S
    Clone returns a copy of the slice. The elements are copied using assignment,
    so this is a shallow clone. The result may have additional unused capacity.
    The result preserves the nilness of s.

func Collect[E any](seq iter.Seq[E]) []E
    Collect collects values from seq into a new slice and returns it. If seq is
    empty, the result is nil.

func Compact[S ~[]E, E comparable](s S) S
    Compact replaces consecutive runs of equal elements with a single copy. This
    is like the uniq command found on Unix. Compact modifies the contents of the
    slice s and returns the modified slice, which may have a smaller length.
    Compact zeroes the elements between the new length and the original length.
    The result preserves the nilness of s.

func CompactFunc[S ~[]E, E any](s S, eq func(E, E) bool) S
    CompactFunc is like Compact but uses an equality function to compare
    elements. For runs of elements that compare equal, CompactFunc keeps the
    first one. CompactFunc zeroes the elements between the new length and the
    original length. The result preserves the nilness of s.

func Compare[S ~[]E, E cmp.Ordered](s1, s2 S) int
    Compare compares the elements of s1 and s2, using cmp.Compare on each pair
    of elements. The elements are compared sequentially, starting at index 0,
    until one element is not equal to the other. The result of comparing the
    first non-matching elements is returned. If both slices are equal until one
    of them ends, the shorter slice is considered less than the longer one.
    The result is 0 if s1 == s2, -1 if s1 < s2, and +1 if s1 > s2.

func CompareFunc[S1 ~[]E1, S2 ~[]E2, E1, E2 any](s1 S1, s2 S2, cmp func(E1, E2) int) int
    CompareFunc is like Compare but uses a custom comparison function on
    each pair of elements. The result is the first non-zero result of cmp;
    if cmp always returns 0 the result is 0 if len(s1) == len(s2), -1 if len(s1)
    < len(s2), and +1 if len(s1) > len(s2).

func Concat[S ~[]E, E any](slices ...S) S
    Concat returns a new slice concatenating the passed in slices. If the
    concatenation is empty, the result is nil.

func Contains[S ~[]E, E comparable](s S, v E) bool
    Contains reports whether v is present in s.

func ContainsFunc[S ~[]E, E any](s S, f func(E) bool) bool
    ContainsFunc reports whether at least one element e of s satisfies f(e).
    It stops as soon as a call to f returns true.

func Delete[S ~[]E, E any](s S, i, j int) S
    Delete modifies s in place by removing the elements s[i:j], and returns the
    modified slice. Delete panics if j > len(s) or s[i:j] is not a valid slice
    of s. Delete is O(len(s)-i), so if many items must be deleted, it is better
    to make a single call deleting them all together than to delete one at a
    time. Delete zeroes the elements s[len(s)-(j-i):len(s)]. If the result is
    empty, it has the same nilness as s.

func DeleteFunc[S ~[]E, E any](s S, del func(E) bool) S
    DeleteFunc modifies s in place by removing any elements for which del
    returns true, and returns the modified slice. DeleteFunc zeroes the elements
    between the new length and the original length. If the result is empty,
    it has the same nilness as s.

func Equal[S ~[]E, E comparable](s1, s2 S) bool
    Equal reports whether two slices are equal: the same length and all elements
    equal. If the lengths are different, Equal returns false. Otherwise,
    the elements are compared in increasing index order, and the comparison
    stops at the first unequal pair. Empty and nil slices are considered equal.
    Floating point NaNs are not considered equal.

func EqualFunc[S1 ~[]E1, S2 ~[]E2, E1, E2 any](s1 S1, s2 S2, eq func(E1, E2) bool) bool
    EqualFunc reports whether two slices are equal using an equality function
    on each pair of elements. If the lengths are different, EqualFunc returns
    false. Otherwise, the elements are compared in increasing index order,
    and the comparison stops at the first index for which eq returns false.

func Grow[S ~[]E, E any](s S, n int) S
    Grow increases the slice's capacity, if necessary, to guarantee space for
    another n elements. After Grow(n), at least n elements can be appended
    to the slice without another allocation. If n is negative or too large to
    allocate the memory, Grow panics. The result preserves the nilness of s.

func Index[S ~[]E, E comparable](s S, v E) int
    Index returns the index of the first occurrence of v in s, or -1 if not
    present.

func IndexFunc[S ~[]E, E any](s S, f func(E) bool) int
    IndexFunc returns the first index i satisfying f(s[i]), or -1 if none do.

func Insert[S ~[]E, E any](s S, i int, v ...E) S
    Insert modifies s in place by inserting the values v... at index i,
    and returns the modified slice. The elements at s[i:] are shifted up to make
    room. In the returned slice r, r[i] == v[0], and, if i < len(s), r[i+len(v)]
    == value originally at s[i]. Insert panics if i > len(s). This function is
    O(len(s) + len(v)). If the result is empty, it has the same nilness as s.

func IsSorted[S ~[]E, E cmp.Ordered](x S) bool
    IsSorted reports whether x is sorted in ascending order.

func IsSortedFunc[S ~[]E, E any](x S, cmp func(a, b E) int) bool
    IsSortedFunc reports whether x is sorted in ascending order, with cmp as the
    comparison function as defined by SortFunc.

func Max[S ~[]E, E cmp.Ordered](x S) E
    Max returns the maximal value in x. It panics if x is empty. For
    floating-point E, Max propagates NaNs (any NaN value in x forces the output
    to be NaN).

func MaxFunc[S ~[]E, E any](x S, cmp func(a, b E) int) E
    MaxFunc returns the maximal value in x, using cmp to compare elements.
    It panics if x is empty. If there is more than one maximal element according
    to the cmp function, MaxFunc returns the first one.

func Min[S ~[]E, E cmp.Ordered](x S) E
    Min returns the minimal value in x. It panics if x is empty. For
    floating-point numbers, Min propagates NaNs (any NaN value in x forces the
    output to be NaN).

func MinFunc[S ~[]E, E any](x S, cmp func(a, b E) int) E
    MinFunc returns the minimal value in x, using cmp to compare elements.
    It panics if x is empty. If there is more than one minimal element according
    to the cmp function, MinFunc returns the first one.

func Repeat[S ~[]E, E any](x S, count int) S
    Repeat returns a new slice that repeats the provided slice the given number
    of times. The result has length and capacity (len(x) * count). The result is
    never nil. Repeat panics if count is negative or if the result of (len(x) *
    count) overflows.

func Replace[S ~[]E, E any](s S, i, j int, v ...E) S
    Replace modifies s in place by replacing the elements s[i:j] with the given
    v, and returns the modified slice. Replace panics if j > len(s) or s[i:j]
    is not a valid slice of s. When len(v) < (j-i), Replace zeroes the elements
    between the new length and the original length. If the result is empty,
    it has the same nilness as s.

func Reverse[S ~[]E, E any](s S)
    Reverse reverses the elements of the slice in place.

func Sort[S ~[]E, E cmp.Ordered](x S)
    Sort sorts a slice of any ordered type in ascending order. When sorting
    floating-point numbers, NaNs are ordered before other values.

func SortFunc[S ~[]E, E any](x S, cmp func(a, b E) int)
    SortFunc sorts the slice x in ascending order as determined by the cmp
    function. This sort is not guaranteed to be stable. cmp(a, b) should return
    a negative number when a < b, a positive number when a > b and zero when a
    == b or a and b are incomparable in the sense of a strict weak ordering.

    SortFunc requires that cmp is a strict weak ordering. See
    https://en.wikipedia.org/wiki/Weak_ordering#Strict_weak_orderings.
    The function should return 0 for incomparable items.

func SortStableFunc[S ~[]E, E any](x S, cmp func(a, b E) int)
    SortStableFunc sorts the slice x while keeping the original order of equal
    elements, using cmp to compare elements in the same way as SortFunc.

func Sorted[E cmp.Ordered](seq iter.Seq[E]) []E
    Sorted collects values from seq into a new slice, sorts the slice, and
    returns it. If seq is empty, the result is nil.

func SortedFunc[E any](seq iter.Seq[E], cmp func(E, E) int) []E
    SortedFunc collects values from seq into a new slice, sorts the slice using
    the comparison function, and returns it. If seq is empty, the result is nil.

func SortedStableFunc[E any](seq iter.Seq[E], cmp func(E, E) int) []E
    SortedStableFunc collects values from seq into a new slice. It then sorts
    the slice while keeping the original order of equal elements, using the
    comparison function to compare elements. It returns the new slice. If seq is
    empty, the result is nil.

func Values[Slice ~[]E, E any](s Slice) iter.Seq[E]
    Values returns an iterator that yields the slice elements in order.
```

## maps

```go
package maps // import "maps"

Package maps defines various functions useful with maps of any type.

This package does not have any special handling for non-reflexive keys (keys k
where k != k), such as floating-point NaNs.

FUNCTIONS

func All[Map ~map[K]V, K comparable, V any](m Map) iter.Seq2[K, V]
    All returns an iterator over key-value pairs from m. The iteration order
    is not specified and is not guaranteed to be the same from one call to the
    next.

func Clone[M ~map[K]V, K comparable, V any](m M) M
    Clone returns a copy of m. This is a shallow clone: the new keys and values
    are set using ordinary assignment.

func Collect[K comparable, V any](seq iter.Seq2[K, V]) map[K]V
    Collect collects key-value pairs from seq into a new map and returns it.

func Copy[M1 ~map[K]V, M2 ~map[K]V, K comparable, V any](dst M1, src M2)
    Copy copies all key/value pairs in src adding them to dst. When a key in src
    is already present in dst, the value in dst will be overwritten by the value
    associated with the key in src.

func DeleteFunc[M ~map[K]V, K comparable, V any](m M, del func(K, V) bool)
    DeleteFunc deletes any key/value pairs from m for which del returns true.

func Equal[M1, M2 ~map[K]V, K, V comparable](m1 M1, m2 M2) bool
    Equal reports whether two maps contain the same key/value pairs. Values are
    compared using ==.

func EqualFunc[M1 ~map[K]V1, M2 ~map[K]V2, K comparable, V1, V2 any](m1 M1, m2 M2, eq func(V1, V2) bool) bool
    EqualFunc is like Equal, but compares values using eq. Keys are still
    compared with ==.

func Insert[Map ~map[K]V, K comparable, V any](m Map, seq iter.Seq2[K, V])
    Insert adds the key-value pairs from seq to m. If a key in seq already
    exists in m, its value will be overwritten.

func Keys[Map ~map[K]V, K comparable, V any](m Map) iter.Seq[K]
    Keys returns an iterator over keys in m. The iteration order is not
    specified and is not guaranteed to be the same from one call to the next.

func Values[Map ~map[K]V, K comparable, V any](m Map) iter.Seq[V]
    Values returns an iterator over values in m. The iteration order is not
    specified and is not guaranteed to be the same from one call to the next.
```

## sort

```go
package sort // import "sort"

Package sort provides primitives for sorting slices and user-defined
collections.

FUNCTIONS

func Find(n int, cmp func(int) int) (i int, found bool)
    Find uses binary search to find and return the smallest index i in [0,
    n) at which cmp(i) <= 0. If there is no such index i, Find returns i = n.
    The found result is true if i < n and cmp(i) == 0. Find calls cmp(i) only
    for i in the range [0, n).

    To permit binary search, Find requires that cmp(i) > 0 for a leading prefix
    of the range, cmp(i) == 0 in the middle, and cmp(i) < 0 for the final suffix
    of the range. (Each subrange could be empty.) The usual way to establish
    this condition is to interpret cmp(i) as a comparison of a desired target
    value t against entry i in an underlying indexed data structure x, returning
    <0, 0, and >0 when t < x[i], t == x[i], and t > x[i], respectively.

    For example, to look for a particular string in a sorted, random-access list
    of strings:

        i, found := sort.Find(x.Len(), func(i int) int {
            return strings.Compare(target, x.At(i))
        })
        if found {
            fmt.Printf("found %s at entry %d\n", target, i)
        } else {
            fmt.Printf("%s not found, would insert at %d", target, i)
        }

func Float64s(x []float64)
    Float64s sorts a slice of float64s in increasing order. Not-a-number (NaN)
    values are ordered before other values.

    Note: as of Go 1.22, this function simply calls slices.Sort.

func Float64sAreSorted(x []float64) bool
    Float64sAreSorted reports whether the slice x is sorted in increasing order,
    with not-a-number (NaN) values before any other values.

    Note: as of Go 1.22, this function simply calls slices.IsSorted.

func Ints(x []int)
    Ints sorts a slice of ints in increasing order.

    Note: as of Go 1.22, this function simply calls slices.Sort.

func IntsAreSorted(x []int) bool
    IntsAreSorted reports whether the slice x is sorted in increasing order.

    Note: as of Go 1.22, this function simply calls slices.IsSorted.

func IsSorted(data Interface) bool
    IsSorted reports whether data is sorted.

    Note: in many situations, the newer slices.IsSortedFunc function is more
    ergonomic and runs faster.

func Search(n int, f func(int) bool) int
    Search uses binary search to find and return the smallest index i in [0,
    n) at which f(i) is true, assuming that on the range [0, n), f(i) == true
    implies f(i+1) == true. That is, Search requires that f is false for some
    (possibly empty) prefix of the input range [0, n) and then true for the
    (possibly empty) remainder; Search returns the first true index. If there is
    no such index, Search returns n. (Note that the "not found" return value is
    not -1 as in, for instance, strings.Index.) Search calls f(i) only for i in
    the range [0, n).

    A common use of Search is to find the index i for a value x in a sorted,
    indexable data structure such as an array or slice. In this case,
    the argument f, typically a closure, captures the value to be searched for,
    and how the data structure is indexed and ordered.

    For instance, given a slice data sorted in ascending order, the call
    Search(len(data), func(i int) bool { return data[i] >= 23 }) returns the
    smallest index i such that data[i] >= 23. If the caller wants to find
    whether 23 is in the slice, it must test data[i] == 23 separately.

    Searching data sorted in descending order would use the <= operator instead
    of the >= operator.

    To complete the example above, the following code tries to find the value x
    in an integer slice data sorted in ascending order:

        x := 23
        i := sort.Search(len(data), func(i int) bool { return data[i] >= x })
        if i < len(data) && data[i] == x {
        	// x is present at data[i]
        } else {
        	// x is not present in data,
        	// but i is the index where it would be inserted.
        }

    As a more whimsical example, this program guesses your number:

        func GuessingGame() {
        	var s string
        	fmt.Printf("Pick an integer from 0 to 100.\n")
        	answer := sort.Search(100, func(i int) bool {
        		fmt.Printf("Is your number <= %d? ", i)
        		fmt.Scanf("%s", &s)
        		return s != "" && s[0] == 'y'
        	})
        	fmt.Printf("Your number is %d.\n", answer)
        }

func SearchFloat64s(a []float64, x float64) int
    SearchFloat64s searches for x in a sorted slice of float64s and returns the
    index as specified by Search. The return value is the index to insert x if x
    is not present (it could be len(a)). The slice must be sorted in ascending
    order.

func SearchInts(a []int, x int) int
    SearchInts searches for x in a sorted slice of ints and returns the index as
    specified by Search. The return value is the index to insert x if x is not
    present (it could be len(a)). The slice must be sorted in ascending order.

func SearchStrings(a []string, x string) int
    SearchStrings searches for x in a sorted slice of strings and returns the
    index as specified by Search. The return value is the index to insert x if x
    is not present (it could be len(a)). The slice must be sorted in ascending
    order.

func Slice(x any, less func(i, j int) bool)
    Slice sorts the slice x given the provided less function. It panics if x is
    not a slice.

    The sort is not guaranteed to be stable: equal elements may be reversed from
    their original order. For a stable sort, use SliceStable.

    The less function must satisfy the same requirements as the Interface type's
    Less method.

    Note: in many situations, the newer slices.SortFunc function is more
    ergonomic and runs faster.

func SliceIsSorted(x any, less func(i, j int) bool) bool
    SliceIsSorted reports whether the slice x is sorted according to the
    provided less function. It panics if x is not a slice.

    Note: in many situations, the newer slices.IsSortedFunc function is more
    ergonomic and runs faster.

func SliceStable(x any, less func(i, j int) bool)
    SliceStable sorts the slice x using the provided less function, keeping
    equal elements in their original order. It panics if x is not a slice.

    The less function must satisfy the same requirements as the Interface type's
    Less method.

    Note: in many situations, the newer slices.SortStableFunc function is more
    ergonomic and runs faster.

func Sort(data Interface)
    Sort sorts data in ascending order as determined by the Less method. It
    makes one call to data.Len to determine n and O(n*log(n)) calls to data.Less
    and data.Swap. The sort is not guaranteed to be stable.

    Note: in many situations, the newer slices.SortFunc function is more
    ergonomic and runs faster.

func Stable(data Interface)
    Stable sorts data in ascending order as determined by the Less method,
    while keeping the original order of equal elements.

    It makes one call to data.Len to determine n, O(n*log(n)) calls to data.Less
    and O(n*log(n)*log(n)) calls to data.Swap.

    Note: in many situations, the newer slices.SortStableFunc function is more
    ergonomic and runs faster.

func Strings(x []string)
    Strings sorts a slice of strings in increasing order.

    Note: as of Go 1.22, this function simply calls slices.Sort.

func StringsAreSorted(x []string) bool
    StringsAreSorted reports whether the slice x is sorted in increasing order.

    Note: as of Go 1.22, this function simply calls slices.IsSorted.


TYPES

type Float64Slice []float64
    Float64Slice implements Interface for a []float64, sorting in increasing
    order, with not-a-number (NaN) values ordered before other values.

func (x Float64Slice) Len() int

func (x Float64Slice) Less(i, j int) bool
    Less reports whether x[i] should be ordered before x[j], as required by
    the sort Interface. Note that floating-point comparison by itself is
    not a transitive relation: it does not report a consistent ordering for
    not-a-number (NaN) values. This implementation of Less places NaN values
    before any others, by using:

        x[i] < x[j] || (math.IsNaN(x[i]) && !math.IsNaN(x[j]))

func (p Float64Slice) Search(x float64) int
    Search returns the result of applying SearchFloat64s to the receiver and x.

func (x Float64Slice) Sort()
    Sort is a convenience method: x.Sort() calls Sort(x).

func (x Float64Slice) Swap(i, j int)

type IntSlice []int
    IntSlice attaches the methods of Interface to []int, sorting in increasing
    order.

func (x IntSlice) Len() int

func (x IntSlice) Less(i, j int) bool

func (p IntSlice) Search(x int) int
    Search returns the result of applying SearchInts to the receiver and x.

func (x IntSlice) Sort()
    Sort is a convenience method: x.Sort() calls Sort(x).

func (x IntSlice) Swap(i, j int)

type Interface interface {
	// Len is the number of elements in the collection.
	Len() int

	// Less reports whether the element with index i
	// must sort before the element with index j.
	//
	// If both Less(i, j) and Less(j, i) are false,
	// then the elements at index i and j are considered equal.
	// Sort may place equal elements in any order in the final result,
	// while Stable preserves the original input order of equal elements.
	//
	// Less must describe a [Strict Weak Ordering]. For example:
	//  - if both Less(i, j) and Less(j, k) are true, then Less(i, k) must be true as well.
	//  - if both Less(i, j) and Less(j, k) are false, then Less(i, k) must be false as well.
	//
	// Note that floating-point comparison (the < operator on float32 or float64 values)
	// is not a strict weak ordering when not-a-number (NaN) values are involved.
	// See Float64Slice.Less for a correct implementation for floating-point values.
	//
	// [Strict Weak Ordering]: https://en.wikipedia.org/wiki/Weak_ordering#Strict_weak_orderings
	Less(i, j int) bool

	// Swap swaps the elements with indexes i and j.
	Swap(i, j int)
}
    An implementation of Interface can be sorted by the routines in this
    package. The methods refer to elements of the underlying collection by
    integer index.

func Reverse(data Interface) Interface
    Reverse returns the reverse order for data.

type StringSlice []string
    StringSlice attaches the methods of Interface to []string, sorting in
    increasing order.

func (x StringSlice) Len() int

func (x StringSlice) Less(i, j int) bool

func (p StringSlice) Search(x string) int
    Search returns the result of applying SearchStrings to the receiver and x.

func (x StringSlice) Sort()
    Sort is a convenience method: x.Sort() calls Sort(x).

func (x StringSlice) Swap(i, j int)
```

## cmp

```go
package cmp // import "cmp"

Package cmp provides types and functions related to comparing ordered values.

FUNCTIONS

func Compare[T Ordered](x, y T) int
    Compare returns

        -1 if x is less than y,
         0 if x equals y,
        +1 if x is greater than y.

    For floating-point types, a NaN is considered less than any non-NaN,
    a NaN is considered equal to a NaN, and -0.0 is equal to 0.0.

func Less[T Ordered](x, y T) bool
    Less reports whether x is less than y. For floating-point types, a NaN is
    considered less than any non-NaN, and -0.0 is not less than (is equal to)
    0.0.

func Or[T comparable](vals ...T) T
    Or returns the first of its arguments that is not equal to the zero value.
    If no argument is non-zero, it returns the zero value.


TYPES

type Ordered interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
		~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
		~float32 | ~float64 |
		~string
}
    Ordered is a constraint that permits any ordered type: any type that
    supports the operators < <= >= >. If future releases of Go add new ordered
    types, this constraint will be modified to include them.

    Note that floating-point types may contain NaN ("not-a-number") values. An
    operator such as == or < will always report false when comparing a NaN value
    with any other value, NaN or not. See the Compare function for a consistent
    way to compare NaN values.
```

## iter

```go
package iter // import "iter"

Package iter provides basic definitions and operations related to iterators over
sequences.

# Iterators

An iterator is a function that passes successive elements of a sequence to a
callback function, conventionally named yield. The function stops either when
the sequence is finished or when yield returns false, indicating to stop the
iteration early. This package defines Seq and Seq2 (pronounced like seek—the
first syllable of sequence) as shorthands for iterators that pass 1 or 2 values
per sequence element to yield:

    type (
    	Seq[V any]     func(yield func(V) bool)
    	Seq2[K, V any] func(yield func(K, V) bool)
    )

Seq2 represents a sequence of paired values, conventionally key-value or
index-value pairs.

Yield returns true if the iterator should continue with the next element in the
sequence, false if it should stop.

Yield panics if called after it returns false.

For instance, maps.Keys returns an iterator that produces the sequence of keys
of the map m, implemented as follows:

    func Keys[Map ~map[K]V, K comparable, V any](m Map) iter.Seq[K] {
    	return func(yield func(K) bool) {
    		for k := range m {
    			if !yield(k) {
    				return
    			}
    		}
    	}
    }

Further examples can be found in The Go Blog: Range Over Function Types.

Iterator functions are most often called by a range loop, as in:

    func PrintAll[V any](seq iter.Seq[V]) {
    	for v := range seq {
    		fmt.Println(v)
    	}
    }

# Naming Conventions

Iterator functions and methods are named for the sequence being walked:

    // All returns an iterator over all elements in s.
    func (s *Set[V]) All() iter.Seq[V]

The iterator method on a collection type is conventionally named All, because it
iterates a sequence of all the values in the collection.

For a type containing multiple possible sequences, the iterator's name can
indicate which sequence is being provided:

    // Cities returns an iterator over the major cities in the country.
    func (c *Country) Cities() iter.Seq[*City]

    // Languages returns an iterator over the official spoken languages of the country.
    func (c *Country) Languages() iter.Seq[string]

If an iterator requires additional configuration, the constructor function can
take additional configuration arguments:

    // Scan returns an iterator over key-value pairs with min ≤ key ≤ max.
    func (m *Map[K, V]) Scan(min, max K) iter.Seq2[K, V]

    // Split returns an iterator over the (possibly-empty) substrings of s
    // separated by sep.
    func Split(s, sep string) iter.Seq[string]

When there are multiple possible iteration orders, the method name may indicate
that order:

    // All returns an iterator over the list from head to tail.
    func (l *List[V]) All() iter.Seq[V]

    // Backward returns an iterator over the list from tail to head.
    func (l *List[V]) Backward() iter.Seq[V]

    // Preorder returns an iterator over all nodes of the syntax tree
    // beneath (and including) the specified root, in depth-first preorder,
    // visiting a parent node before its children.
    func Preorder(root Node) iter.Seq[Node]

# Single-Use Iterators

Most iterators provide the ability to walk an entire sequence: when called,
the iterator does any setup necessary to start the sequence, then calls yield
on successive elements of the sequence, and then cleans up before returning.
Calling the iterator again walks the sequence again.

Some iterators break that convention, providing the ability to walk a sequence
only once. These “single-use iterators” typically report values from a data
stream that cannot be rewound to start over. Calling the iterator again after
stopping early may continue the stream, but calling it again after the sequence
is finished will yield no values at all. Doc comments for functions or methods
that return single-use iterators should document this fact:

    // Lines returns an iterator over lines read from r.
    // It returns a single-use iterator.
    func (r *Reader) Lines() iter.Seq[string]

# Pulling Values

Functions and methods that accept or return iterators should use the standard
Seq or Seq2 types, to ensure compatibility with range loops and other iterator
adapters. The standard iterators can be thought of as “push iterators”, which
push values to the yield function.

Sometimes a range loop is not the most natural way to consume values of the
sequence. In this case, Pull converts a standard push iterator to a “pull
iterator”, which can be called to pull one value at a time from the sequence.
Pull starts an iterator and returns a pair of functions—next and stop—which
return the next value from the iterator and stop it, respectively.

For example:

    // Pairs returns an iterator over successive pairs of values from seq.
    func Pairs[V any](seq iter.Seq[V]) iter.Seq2[V, V] {
    	return func(yield func(V, V) bool) {
    		next, stop := iter.Pull(seq)
    		defer stop()
    		for {
    			v1, ok1 := next()
    			if !ok1 {
    				return
    			}
    			v2, ok2 := next()
    			// If ok2 is false, v2 should be the
    			// zero value; yield one last pair.
    			if !yield(v1, v2) {
    				return
    			}
    			if !ok2 {
    				return
    			}
    		}
    	}
    }

If clients do not consume the sequence to completion, they must call stop, which
allows the iterator function to finish and return. As shown in the example,
the conventional way to ensure this is to use defer.

# Standard Library Usage

A few packages in the standard library provide iterator-based APIs, most notably
the maps and slices packages. For example, maps.Keys returns an iterator over
the keys of a map, while slices.Sorted collects the values of an iterator into a
slice, sorts them, and returns the slice, so to iterate over the sorted keys of
a map:

    for _, key := range slices.Sorted(maps.Keys(m)) {
    	...
    }

# Mutation

Iterators provide only the values of the sequence, not any direct way to modify
it. If an iterator wishes to provide a mechanism for modifying a sequence
during iteration, the usual approach is to define a position type with the extra
operations and then provide an iterator over positions.

For example, a tree implementation might provide:

    // Positions returns an iterator over positions in the sequence.
    func (t *Tree[V]) Positions() iter.Seq[*Pos[V]]

    // A Pos represents a position in the sequence.
    // It is only valid during the yield call it is passed to.
    type Pos[V any] struct { ... }

    // Value returns the value at the cursor.
    func (p *Pos[V]) Value() V

    // Delete deletes the value at this point in the iteration.
    func (p *Pos[V]) Delete()

    // Set changes the value v at the cursor.
    func (p *Pos[V]) Set(v V)

And then a client could delete boring values from the tree using:

    for p := range t.Positions() {
    	if boring(p.Value()) {
    		p.Delete()
    	}
    }

[The Go Blog: Range Over Function Types]: https://go.dev/blog/range-functions
[range loop]: https://go.dev/ref/spec#For_range

FUNCTIONS

func Pull[V any](seq Seq[V]) (next func() (V, bool), stop func())
    Pull converts the “push-style” iterator sequence seq into a “pull-style”
    iterator accessed by the two functions next and stop.

    Next returns the next value in the sequence and a boolean indicating whether
    the value is valid. When the sequence is over, next returns the zero V and
    false. It is valid to call next after reaching the end of the sequence
    or after calling stop. These calls will continue to return the zero V and
    false.

    Stop ends the iteration. It must be called when the caller is no longer
    interested in next values and next has not yet signaled that the sequence is
    over (with a false boolean return). It is valid to call stop multiple times
    and when next has already returned false. Typically, callers should “defer
    stop()”.

    It is an error to call next or stop from multiple goroutines simultaneously.

    If the iterator panics during a call to next (or stop), then next (or stop)
    itself panics with the same value.

func Pull2[K, V any](seq Seq2[K, V]) (next func() (K, V, bool), stop func())
    Pull2 converts the “push-style” iterator sequence seq into a “pull-style”
    iterator accessed by the two functions next and stop.

    Next returns the next pair in the sequence and a boolean indicating whether
    the pair is valid. When the sequence is over, next returns a pair of zero
    values and false. It is valid to call next after reaching the end of the
    sequence or after calling stop. These calls will continue to return a pair
    of zero values and false.

    Stop ends the iteration. It must be called when the caller is no longer
    interested in next values and next has not yet signaled that the sequence is
    over (with a false boolean return). It is valid to call stop multiple times
    and when next has already returned false. Typically, callers should “defer
    stop()”.

    It is an error to call next or stop from multiple goroutines simultaneously.

    If the iterator panics during a call to next (or stop), then next (or stop)
    itself panics with the same value.


TYPES

type Seq[V any] func(yield func(V) bool)
    Seq is an iterator over sequences of individual values. When called as
    seq(yield), seq calls yield(v) for each value v in the sequence, stopping
    early if yield returns false. See the iter package documentation for more
    details.

type Seq2[K, V any] func(yield func(K, V) bool)
    Seq2 is an iterator over sequences of pairs of values, most commonly
    key-value pairs. When called as seq(yield), seq calls yield(k, v) for
    each pair (k, v) in the sequence, stopping early if yield returns false.
    See the iter package documentation for more details.
```

## math

```go
package math // import "math"

Package math provides basic constants and mathematical functions.

This package does not guarantee bit-identical results across architectures.

CONSTANTS

const (
	E   = 2.71828182845904523536028747135266249775724709369995957496696763 // https://oeis.org/A001113
	Pi  = 3.14159265358979323846264338327950288419716939937510582097494459 // https://oeis.org/A000796
	Phi = 1.61803398874989484820458683436563811772030917980576286213544862 // https://oeis.org/A001622

	Sqrt2   = 1.41421356237309504880168872420969807856967187537694807317667974 // https://oeis.org/A002193
	SqrtE   = 1.64872127070012814684865078781416357165377610071014801157507931 // https://oeis.org/A019774
	SqrtPi  = 1.77245385090551602729816748334114518279754945612238712821380779 // https://oeis.org/A002161
	SqrtPhi = 1.27201964951406896425242246173749149171560804184009624861664038 // https://oeis.org/A139339

	Ln2    = 0.693147180559945309417232121458176568075500134360255254120680009 // https://oeis.org/A002162
	Log2E  = 1 / Ln2
	Ln10   = 2.30258509299404568401799145468436420760110148862877297603332790 // https://oeis.org/A002392
	Log10E = 1 / Ln10
)
    Mathematical constants.

const (
	MaxFloat32             = 0x1p127 * (1 + (1 - 0x1p-23)) // 3.40282346638528859811704183484516925440e+38
	SmallestNonzeroFloat32 = 0x1p-126 * 0x1p-23            // 1.401298464324817070923729583289916131280e-45

	MaxFloat64             = 0x1p1023 * (1 + (1 - 0x1p-52)) // 1.79769313486231570814527423731704356798070e+308
	SmallestNonzeroFloat64 = 0x1p-1022 * 0x1p-52            // 4.9406564584124654417656879286822137236505980e-324
)
    Floating-point limit values. Max is the largest finite value representable
    by the type. SmallestNonzero is the smallest positive, non-zero value
    representable by the type.

const (
	MaxInt    = 1<<(intSize-1) - 1  // MaxInt32 or MaxInt64 depending on intSize.
	MinInt    = -1 << (intSize - 1) // MinInt32 or MinInt64 depending on intSize.
	MaxInt8   = 1<<7 - 1            // 127
	MinInt8   = -1 << 7             // -128
	MaxInt16  = 1<<15 - 1           // 32767
	MinInt16  = -1 << 15            // -32768
	MaxInt32  = 1<<31 - 1           // 2147483647
	MinInt32  = -1 << 31            // -2147483648
	MaxInt64  = 1<<63 - 1           // 9223372036854775807
	MinInt64  = -1 << 63            // -9223372036854775808
	MaxUint   = 1<<intSize - 1      // MaxUint32 or MaxUint64 depending on intSize.
	MaxUint8  = 1<<8 - 1            // 255
	MaxUint16 = 1<<16 - 1           // 65535
	MaxUint32 = 1<<32 - 1           // 4294967295
	MaxUint64 = 1<<64 - 1           // 18446744073709551615
)
    Integer limit values.


FUNCTIONS

func Abs(x float64) float64
    Abs returns the absolute value of x.

    Special cases are:

        Abs(±Inf) = +Inf
        Abs(NaN) = NaN

func Acos(x float64) float64
    Acos returns the arccosine, in radians, of x.

    Special case is:

        Acos(x) = NaN if x < -1 or x > 1

func Acosh(x float64) float64
    Acosh returns the inverse hyperbolic cosine of x.

    Special cases are:

        Acosh(+Inf) = +Inf
        Acosh(x) = NaN if x < 1
        Acosh(NaN) = NaN

func Asin(x float64) float64
    Asin returns the arcsine, in radians, of x.

    Special cases are:

        Asin(±0) = ±0
        Asin(x) = NaN if x < -1 or x > 1

func Asinh(x float64) float64
    Asinh returns the inverse hyperbolic sine of x.

    Special cases are:

        Asinh(±0) = ±0
        Asinh(±Inf) = ±Inf
        Asinh(NaN) = NaN

func Atan(x float64) float64
    Atan returns the arctangent, in radians, of x.

    Special cases are:

        Atan(±0) = ±0
        Atan(±Inf) = ±Pi/2

func Atan2(y, x float64) float64
    Atan2 returns the arc tangent of y/x, using the signs of the two to
    determine the quadrant of the return value.

    Special cases are (in order):

        Atan2(y, NaN) = NaN
        Atan2(NaN, x) = NaN
        Atan2(+0, x>=0) = +0
        Atan2(-0, x>=0) = -0
        Atan2(+0, x<=-0) = +Pi
        Atan2(-0, x<=-0) = -Pi
        Atan2(y>0, 0) = +Pi/2
        Atan2(y<0, 0) = -Pi/2
        Atan2(+Inf, +Inf) = +Pi/4
        Atan2(-Inf, +Inf) = -Pi/4
        Atan2(+Inf, -Inf) = 3Pi/4
        Atan2(-Inf, -Inf) = -3Pi/4
        Atan2(y, +Inf) = 0
        Atan2(y>0, -Inf) = +Pi
        Atan2(y<0, -Inf) = -Pi
        Atan2(+Inf, x) = +Pi/2
        Atan2(-Inf, x) = -Pi/2

func Atanh(x float64) float64
    Atanh returns the inverse hyperbolic tangent of x.

    Special cases are:

        Atanh(1) = +Inf
        Atanh(±0) = ±0
        Atanh(-1) = -Inf
        Atanh(x) = NaN if x < -1 or x > 1
        Atanh(NaN) = NaN

func Cbrt(x float64) float64
    Cbrt returns the cube root of x.

    Special cases are:

        Cbrt(±0) = ±0
        Cbrt(±Inf) = ±Inf
        Cbrt(NaN) = NaN

func Ceil(x float64) float64
    Ceil returns the least integer value greater than or equal to x.

    Special cases are:

        Ceil(±0) = ±0
        Ceil(±Inf) = ±Inf
        Ceil(NaN) = NaN

func Copysign(f, sign float64) float64
    Copysign returns a value with the magnitude of f and the sign of sign.

func Cos(x float64) float64
    Cos returns the cosine of the radian argument x.

    Special cases are:

        Cos(±Inf) = NaN
        Cos(NaN) = NaN

func Cosh(x float64) float64
    Cosh returns the hyperbolic cosine of x.

    Special cases are:

        Cosh(±0) = 1
        Cosh(±Inf) = +Inf
        Cosh(NaN) = NaN

func Dim(x, y float64) float64
    Dim returns the maximum of x-y or 0.

    Special cases are:

        Dim(+Inf, +Inf) = NaN
        Dim(-Inf, -Inf) = NaN
        Dim(x, NaN) = Dim(NaN, x) = NaN

func Erf(x float64) float64
    Erf returns the error function of x.

    Special cases are:

        Erf(+Inf) = 1
        Erf(-Inf) = -1
        Erf(NaN) = NaN

func Erfc(x float64) float64
    Erfc returns the complementary error function of x.

    Special cases are:

        Erfc(+Inf) = 0
        Erfc(-Inf) = 2
        Erfc(NaN) = NaN

func Erfcinv(x float64) float64
    Erfcinv returns the inverse of Erfc(x).

    Special cases are:

        Erfcinv(0) = +Inf
        Erfcinv(2) = -Inf
        Erfcinv(x) = NaN if x < 0 or x > 2
        Erfcinv(NaN) = NaN

func Erfinv(x float64) float64
    Erfinv returns the inverse error function of x.

    Special cases are:

        Erfinv(1) = +Inf
        Erfinv(-1) = -Inf
        Erfinv(x) = NaN if x < -1 or x > 1
        Erfinv(NaN) = NaN

func Exp(x float64) float64
    Exp returns e**x, the base-e exponential of x.

    Special cases are:

        Exp(+Inf) = +Inf
        Exp(NaN) = NaN

    Very large values overflow to 0 or +Inf. Very small values underflow to 1.

func Exp2(x float64) float64
    Exp2 returns 2**x, the base-2 exponential of x.

    Special cases are the same as Exp.

func Expm1(x float64) float64
    Expm1 returns e**x - 1, the base-e exponential of x minus 1. It is more
    accurate than Exp(x) - 1 when x is near zero.

    Special cases are:

        Expm1(+Inf) = +Inf
        Expm1(-Inf) = -1
        Expm1(NaN) = NaN

    Very large values overflow to -1 or +Inf.

func FMA(x, y, z float64) float64
    FMA returns x * y + z, computed with only one rounding. (That is, FMA
    returns the fused multiply-add of x, y, and z.)

func Float32bits(f float32) uint32
    Float32bits returns the IEEE 754 binary representation of f,
    with the sign bit of f and the result in the same bit position.
    Float32bits(Float32frombits(x)) == x.

func Float32frombits(b uint32) float32
    Float32frombits returns the floating-point number corresponding to the IEEE
    754 binary representation b, with the sign bit of b and the result in the
    same bit position. Float32frombits(Float32bits(x)) == x.

func Float64bits(f float64) uint64
    Float64bits returns the IEEE 754 binary representation of f,
    with the sign bit of f and the result in the same bit position, and
    Float64bits(Float64frombits(x)) == x.

func Float64frombits(b uint64) float64
    Float64frombits returns the floating-point number corresponding to the IEEE
    754 binary representation b, with the sign bit of b and the result in the
    same bit position. Float64frombits(Float64bits(x)) == x.

func Floor(x float64) float64
    Floor returns the greatest integer value less than or equal to x.

    Special cases are:

        Floor(±0) = ±0
        Floor(±Inf) = ±Inf
        Floor(NaN) = NaN

func Frexp(f float64) (frac float64, exp int)
    Frexp breaks f into a normalized fraction and an integral power of two.
    It returns frac and exp satisfying f == frac × 2**exp, with the absolute
    value of frac in the interval [½, 1).

    Special cases are:

        Frexp(±0) = ±0, 0
        Frexp(±Inf) = ±Inf, 0
        Frexp(NaN) = NaN, 0

func Gamma(x float64) float64
    Gamma returns the Gamma function of x.

    Special cases are:

        Gamma(+Inf) = +Inf
        Gamma(+0) = +Inf
        Gamma(-0) = -Inf
        Gamma(x) = NaN for integer x < 0
        Gamma(-Inf) = NaN
        Gamma(NaN) = NaN

func Hypot(p, q float64) float64
    Hypot returns Sqrt(p*p + q*q), taking care to avoid unnecessary overflow and
    underflow.

    Special cases are:

        Hypot(±Inf, q) = +Inf
        Hypot(p, ±Inf) = +Inf
        Hypot(NaN, q) = NaN
        Hypot(p, NaN) = NaN

func Ilogb(x float64) int
    Ilogb returns the binary exponent of x as an integer.

    Special cases are:

        Ilogb(±Inf) = MaxInt32
        Ilogb(0) = MinInt32
        Ilogb(NaN) = MaxInt32

func Inf(sign int) float64
    Inf returns positive infinity if sign >= 0, negative infinity if sign < 0.

func IsInf(f float64, sign int) bool
    IsInf reports whether f is an infinity, according to sign. If sign > 0,
    IsInf reports whether f is positive infinity. If sign < 0, IsInf reports
    whether f is negative infinity. If sign == 0, IsInf reports whether f is
    either infinity.

func IsNaN(f float64) (is bool)
    IsNaN reports whether f is an IEEE 754 “not-a-number” value.

func J0(x float64) float64
    J0 returns the order-zero Bessel function of the first kind.

    Special cases are:

        J0(±Inf) = 0
        J0(0) = 1
        J0(NaN) = NaN

func J1(x float64) float64
    J1 returns the order-one Bessel function of the first kind.

    Special cases are:

        J1(±Inf) = 0
        J1(NaN) = NaN

func Jn(n int, x float64) float64
    Jn returns the order-n Bessel function of the first kind.

    Special cases are:

        Jn(n, ±Inf) = 0
        Jn(n, NaN) = NaN

func Ldexp(frac float64, exp int) float64
    Ldexp is the inverse of Frexp. It returns frac × 2**exp.

    Special cases are:

        Ldexp(±0, exp) = ±0
        Ldexp(±Inf, exp) = ±Inf
        Ldexp(NaN, exp) = NaN

func Lgamma(x float64) (lgamma float64, sign int)
    Lgamma returns the natural logarithm and sign (-1 or +1) of Gamma(x).

    Special cases are:

        Lgamma(+Inf) = +Inf
        Lgamma(0) = +Inf
        Lgamma(-integer) = +Inf
        Lgamma(-Inf) = -Inf
        Lgamma(NaN) = NaN

func Log(x float64) float64
    Log returns the natural logarithm of x.

    Special cases are:

        Log(+Inf) = +Inf
        Log(0) = -Inf
        Log(x < 0) = NaN
        Log(NaN) = NaN

func Log10(x float64) float64
    Log10 returns the decimal logarithm of x. The special cases are the same as
    for Log.

func Log1p(x float64) float64
    Log1p returns the natural logarithm of 1 plus its argument x. It is more
    accurate than Log(1 + x) when x is near zero.

    Special cases are:

        Log1p(+Inf) = +Inf
        Log1p(±0) = ±0
        Log1p(-1) = -Inf
        Log1p(x < -1) = NaN
        Log1p(NaN) = NaN

func Log2(x float64) float64
    Log2 returns the binary logarithm of x. The special cases are the same as
    for Log.

func Logb(x float64) float64
    Logb returns the binary exponent of x.

    Special cases are:

        Logb(±Inf) = +Inf
        Logb(0) = -Inf
        Logb(NaN) = NaN

func Max(x, y float64) float64
    Max returns the larger of x or y.

    Special cases are:

        Max(x, +Inf) = Max(+Inf, x) = +Inf
        Max(x, NaN) = Max(NaN, x) = NaN
        Max(+0, ±0) = Max(±0, +0) = +0
        Max(-0, -0) = -0

    Note that this differs from the built-in function max when called with NaN
    and +Inf.

func Min(x, y float64) float64
    Min returns the smaller of x or y.

    Special cases are:

        Min(x, -Inf) = Min(-Inf, x) = -Inf
        Min(x, NaN) = Min(NaN, x) = NaN
        Min(-0, ±0) = Min(±0, -0) = -0

    Note that this differs from the built-in function min when called with NaN
    and -Inf.

func Mod(x, y float64) float64
    Mod returns the floating-point remainder of x/y. The magnitude of the result
    is less than y and its sign agrees with that of x.

    Special cases are:

        Mod(±Inf, y) = NaN
        Mod(NaN, y) = NaN
        Mod(x, 0) = NaN
        Mod(x, ±Inf) = x
        Mod(x, NaN) = NaN

func Modf(f float64) (integer float64, fractional float64)
    Modf returns integer and fractional floating-point numbers that sum to f.
    Both values have the same sign as f.

    Special cases are:

        Modf(±Inf) = ±Inf, NaN
        Modf(NaN) = NaN, NaN

func NaN() float64
    NaN returns an IEEE 754 “not-a-number” value.

func Nextafter(x, y float64) (r float64)
    Nextafter returns the next representable float64 value after x towards y.

    Special cases are:

        Nextafter(x, y)   = x when x == y
        Nextafter(0, y)   = ±SmallestNonzeroFloat64 towards y, for y ≠ 0
        Nextafter(NaN, y) = NaN
        Nextafter(x, NaN) = NaN

func Nextafter32(x, y float32) (r float32)
    Nextafter32 returns the next representable float32 value after x towards y.

    Special cases are:

        Nextafter32(x, y)   = x when x == y
        Nextafter32(0, y)   = ±SmallestNonzeroFloat32 towards y, for y ≠ 0
        Nextafter32(NaN, y) = NaN
        Nextafter32(x, NaN) = NaN

func Pow(x, y float64) float64
    Pow returns x**y, the base-x exponential of y.

    Special cases are (in order):

        Pow(x, ±0) = 1 for any x
        Pow(1, y) = 1 for any y
        Pow(x, 1) = x for any x
        Pow(NaN, y) = NaN
        Pow(x, NaN) = NaN
        Pow(±0, y) = ±Inf for y an odd integer < 0
        Pow(±0, -Inf) = +Inf
        Pow(±0, +Inf) = +0
        Pow(±0, y) = +Inf for finite y < 0 and not an odd integer
        Pow(±0, y) = ±0 for y an odd integer > 0
        Pow(±0, y) = +0 for finite y > 0 and not an odd integer
        Pow(-1, ±Inf) = 1
        Pow(x, +Inf) = +Inf for |x| > 1
        Pow(x, -Inf) = +0 for |x| > 1
        Pow(x, +Inf) = +0 for |x| < 1
        Pow(x, -Inf) = +Inf for |x| < 1
        Pow(+Inf, y) = +Inf for y > 0
        Pow(+Inf, y) = +0 for y < 0
        Pow(-Inf, y) = Pow(-0, -y)
        Pow(x, y) = NaN for finite x < 0 and finite non-integer y

func Pow10(n int) float64
    Pow10 returns 10**n, the base-10 exponential of n.

    Special cases are:

        Pow10(n) =    0 for n < -323
        Pow10(n) = +Inf for n > 308

func Remainder(x, y float64) float64
    Remainder returns the IEEE 754 floating-point remainder of x/y.

    Special cases are:

        Remainder(±Inf, y) = NaN
        Remainder(NaN, y) = NaN
        Remainder(x, 0) = NaN
        Remainder(x, ±Inf) = x
        Remainder(x, NaN) = NaN

func Round(x float64) float64
    Round returns the nearest integer, rounding half away from zero.

    Special cases are:

        Round(±0) = ±0
        Round(±Inf) = ±Inf
        Round(NaN) = NaN

func RoundToEven(x float64) float64
    RoundToEven returns the nearest integer, rounding ties to even.

    Special cases are:

        RoundToEven(±0) = ±0
        RoundToEven(±Inf) = ±Inf
        RoundToEven(NaN) = NaN

func Signbit(x float64) bool
    Signbit reports whether x is negative or negative zero.

func Sin(x float64) float64
    Sin returns the sine of the radian argument x.

    Special cases are:

        Sin(±0) = ±0
        Sin(±Inf) = NaN
        Sin(NaN) = NaN

func Sincos(x float64) (sin, cos float64)
    Sincos returns Sin(x), Cos(x).

    Special cases are:

        Sincos(±0) = ±0, 1
        Sincos(±Inf) = NaN, NaN
        Sincos(NaN) = NaN, NaN

func Sinh(x float64) float64
    Sinh returns the hyperbolic sine of x.

    Special cases are:

        Sinh(±0) = ±0
        Sinh(±Inf) = ±Inf
        Sinh(NaN) = NaN

func Sqrt(x float64) float64
    Sqrt returns the square root of x.

    Special cases are:

        Sqrt(+Inf) = +Inf
        Sqrt(±0) = ±0
        Sqrt(x < 0) = NaN
        Sqrt(NaN) = NaN

func Tan(x float64) float64
    Tan returns the tangent of the radian argument x.

    Special cases are:

        Tan(±0) = ±0
        Tan(±Inf) = NaN
        Tan(NaN) = NaN

func Tanh(x float64) float64
    Tanh returns the hyperbolic tangent of x.

    Special cases are:

        Tanh(±0) = ±0
        Tanh(±Inf) = ±1
        Tanh(NaN) = NaN

func Trunc(x float64) float64
    Trunc returns the integer value of x.

    Special cases are:

        Trunc(±0) = ±0
        Trunc(±Inf) = ±Inf
        Trunc(NaN) = NaN

func Y0(x float64) float64
    Y0 returns the order-zero Bessel function of the second kind.

    Special cases are:

        Y0(+Inf) = 0
        Y0(0) = -Inf
        Y0(x < 0) = NaN
        Y0(NaN) = NaN

func Y1(x float64) float64
    Y1 returns the order-one Bessel function of the second kind.

    Special cases are:

        Y1(+Inf) = 0
        Y1(0) = -Inf
        Y1(x < 0) = NaN
        Y1(NaN) = NaN

func Yn(n int, x float64) float64
    Yn returns the order-n Bessel function of the second kind.

    Special cases are:

        Yn(n, +Inf) = 0
        Yn(n ≥ 0, 0) = -Inf
        Yn(n < 0, 0) = +Inf if n is odd, -Inf if n is even
        Yn(n, x < 0) = NaN
        Yn(n, NaN) = NaN
```

## math/rand

```go
package rand // import "math/rand"

Package rand implements pseudo-random number generators suitable for tasks such
as simulation, but it should not be used for security-sensitive work.

Random numbers are generated by a Source, usually wrapped in a Rand. Both
types should be used by a single goroutine at a time: sharing among multiple
goroutines requires some kind of synchronization.

Top-level functions, such as Float64 and Int, are safe for concurrent use by
multiple goroutines.

This package's outputs might be easily predictable regardless of how it's
seeded. For random numbers suitable for security-sensitive work, see the
crypto/rand package.

FUNCTIONS

func ExpFloat64() float64
    ExpFloat64 returns an exponentially distributed float64 in the range (0,
    +[math.MaxFloat64]] with an exponential distribution whose rate parameter
    (lambda) is 1 and whose mean is 1/lambda (1) from the default Source. To
    produce a distribution with a different rate parameter, callers can adjust
    the output using:

        sample = ExpFloat64() / desiredRateParameter

func Float32() float32
    Float32 returns, as a float32, a pseudo-random number in the half-open
    interval [0.0,1.0) from the default Source.

func Float64() float64
    Float64 returns, as a float64, a pseudo-random number in the half-open
    interval [0.0,1.0) from the default Source.

func Int() int
    Int returns a non-negative pseudo-random int from the default Source.

func Int31() int32
    Int31 returns a non-negative pseudo-random 31-bit integer as an int32 from
    the default Source.

func Int31n(n int32) int32
    Int31n returns, as an int32, a non-negative pseudo-random number in the
    half-open interval [0,n) from the default Source. It panics if n <= 0.

func Int63() int64
    Int63 returns a non-negative pseudo-random 63-bit integer as an int64 from
    the default Source.

func Int63n(n int64) int64
    Int63n returns, as an int64, a non-negative pseudo-random number in the
    half-open interval [0,n) from the default Source. It panics if n <= 0.

func Intn(n int) int
    Intn returns, as an int, a non-negative pseudo-random number in the
    half-open interval [0,n) from the default Source. It panics if n <= 0.

func NormFloat64() float64
    NormFloat64 returns a normally distributed float64 in the range
    [-math.MaxFloat64, +[math.MaxFloat64]] with standard normal distribution
    (mean = 0, stddev = 1) from the default Source. To produce a different
    normal distribution, callers can adjust the output using:

        sample = NormFloat64() * desiredStdDev + desiredMean

func Perm(n int) []int
    Perm returns, as a slice of n ints, a pseudo-random permutation of the
    integers in the half-open interval [0,n) from the default Source.

func Read(p []byte) (n int, err error)
    Read generates len(p) random bytes from the default Source and writes them
    into p. It always returns len(p) and a nil error. Read, unlike the Rand.Read
    method, is safe for concurrent use.

    Deprecated: For almost all use cases, crypto/rand.Read is more appropriate.
    If a deterministic source is required, use math/rand/v2.ChaCha8.Read.

func Seed(seed int64)
    Seed uses the provided seed value to initialize the default Source to a
    deterministic state. Seed values that have the same remainder when divided
    by 2³¹-1 generate the same pseudo-random sequence. Seed, unlike the
    Rand.Seed method, is safe for concurrent use.

    If Seed is not called, the generator is seeded randomly at program startup.

    Prior to Go 1.20, the generator was seeded like Seed(1) at program startup.
    To force the old behavior, call Seed(1) at program startup. Alternately,
    set GODEBUG=randautoseed=0 in the environment before making any calls to
    functions in this package.

    Deprecated: As of Go 1.20 there is no reason to call Seed with a random
    value. Programs that call Seed with a known value to get a specific
    sequence of results should use New(NewSource(seed)) to obtain a local random
    generator.

    As of Go 1.24 Seed is a no-op. To restore the previous behavior set
    GODEBUG=randseednop=0.

func Shuffle(n int, swap func(i, j int))
    Shuffle pseudo-randomizes the order of elements using the default Source. n
    is the number of elements. Shuffle panics if n < 0. swap swaps the elements
    with indexes i and j.

func Uint32() uint32
    Uint32 returns a pseudo-random 32-bit value as a uint32 from the default
    Source.

func Uint64() uint64
    Uint64 returns a pseudo-random 64-bit value as a uint64 from the default
    Source.


TYPES

type Rand struct {
	// Has unexported fields.
}
    A Rand is a source of random numbers.

func New(src Source) *Rand
    New returns a new Rand that uses random values from src to generate other
    random values.

func (r *Rand) ExpFloat64() float64
    ExpFloat64 returns an exponentially distributed float64 in the range (0,
    +[math.MaxFloat64]] with an exponential distribution whose rate parameter
    (lambda) is 1 and whose mean is 1/lambda (1). To produce a distribution with
    a different rate parameter, callers can adjust the output using:

        sample = ExpFloat64() / desiredRateParameter

func (r *Rand) Float32() float32
    Float32 returns, as a float32, a pseudo-random number in the half-open
    interval [0.0,1.0).

func (r *Rand) Float64() float64
    Float64 returns, as a float64, a pseudo-random number in the half-open
    interval [0.0,1.0).

func (r *Rand) Int() int
    Int returns a non-negative pseudo-random int.

func (r *Rand) Int31() int32
    Int31 returns a non-negative pseudo-random 31-bit integer as an int32.

func (r *Rand) Int31n(n int32) int32
    Int31n returns, as an int32, a non-negative pseudo-random number in the
    half-open interval [0,n). It panics if n <= 0.

func (r *Rand) Int63() int64
    Int63 returns a non-negative pseudo-random 63-bit integer as an int64.

func (r *Rand) Int63n(n int64) int64
    Int63n returns, as an int64, a non-negative pseudo-random number in the
    half-open interval [0,n). It panics if n <= 0.

func (r *Rand) Intn(n int) int
    Intn returns, as an int, a non-negative pseudo-random number in the
    half-open interval [0,n). It panics if n <= 0.

func (r *Rand) NormFloat64() float64
    NormFloat64 returns a normally distributed float64 in the range
    -math.MaxFloat64 through +[math.MaxFloat64] inclusive, with standard
    normal distribution (mean = 0, stddev = 1). To produce a different normal
    distribution, callers can adjust the output using:

        sample = NormFloat64() * desiredStdDev + desiredMean

func (r *Rand) Perm(n int) []int
    Perm returns, as a slice of n ints, a pseudo-random permutation of the
    integers in the half-open interval [0,n).

func (r *Rand) Read(p []byte) (n int, err error)
    Read generates len(p) random bytes and writes them into p. It always returns
    len(p) and a nil error. Read should not be called concurrently with any
    other Rand method.

func (r *Rand) Seed(seed int64)
    Seed uses the provided seed value to initialize the generator to a
    deterministic state. Seed should not be called concurrently with any other
    Rand method.

func (r *Rand) Shuffle(n int, swap func(i, j int))
    Shuffle pseudo-randomizes the order of elements. n is the number of
    elements. Shuffle panics if n < 0. swap swaps the elements with indexes i
    and j.

func (r *Rand) Uint32() uint32
    Uint32 returns a pseudo-random 32-bit value as a uint32.

func (r *Rand) Uint64() uint64
    Uint64 returns a pseudo-random 64-bit value as a uint64.

type Source interface {
	Int63() int64
	Seed(seed int64)
}
    A Source represents a source of uniformly-distributed pseudo-random int64
    values in the range [0, 1<<63).

    A Source is not safe for concurrent use by multiple goroutines.

func NewSource(seed int64) Source
    NewSource returns a new pseudo-random Source seeded with the given value.
    Unlike the default Source used by top-level functions, this source is
    not safe for concurrent use by multiple goroutines. The returned Source
    implements Source64.

type Source64 interface {
	Source
	Uint64() uint64
}
    A Source64 is a Source that can also generate uniformly-distributed
    pseudo-random uint64 values in the range [0, 1<<64) directly. If a Rand r's
    underlying Source s implements Source64, then r.Uint64 returns the result of
    one call to s.Uint64 instead of making two calls to s.Int63.

type Zipf struct {
	// Has unexported fields.
}
    A Zipf generates Zipf distributed variates.

func NewZipf(r *Rand, s float64, v float64, imax uint64) *Zipf
    NewZipf returns a Zipf variate generator. The generator generates values k ∈
    [0, imax] such that P(k) is proportional to (v + k) ** (-s). Requirements:
    s > 1 and v >= 1.

func (z *Zipf) Uint64() uint64
    Uint64 returns a value drawn from the Zipf distribution described by the
    Zipf object.
```

## unicode

```go
package unicode // import "unicode"

Package unicode provides data and functions to test some properties of Unicode
code points.

CONSTANTS

const (
	MaxRune         = '\U0010FFFF' // Maximum valid Unicode code point.
	ReplacementChar = '\uFFFD'     // Represents invalid code points.
	MaxASCII        = '\u007F'     // maximum ASCII value.
	MaxLatin1       = '\u00FF'     // maximum Latin-1 value.
)
const (
	UpperCase = iota
	LowerCase
	TitleCase
	MaxCase
)
    Indices into the Delta arrays inside CaseRanges for case mapping.

const (
	UpperLower = MaxRune + 1 // (Cannot be a valid delta.)
)
    If the Delta field of a CaseRange is UpperLower, it means this CaseRange
    represents a sequence of the form (say) Upper Lower Upper Lower.

const Version = "17.0.0"
    Version is the Unicode edition from which the tables are derived.


VARIABLES

var (
	Cc     = _Cc // Cc is the set of Unicode characters in category Cc (Other, control).
	Cf     = _Cf // Cf is the set of Unicode characters in category Cf (Other, format).
	Cn     = _Cn // Cn is the set of Unicode characters in category Cn (Other, not assigned).
	Co     = _Co // Co is the set of Unicode characters in category Co (Other, private use).
	Cs     = _Cs // Cs is the set of Unicode characters in category Cs (Other, surrogate).
	Digit  = _Nd // Digit is the set of Unicode characters with the "decimal digit" property.
	Nd     = _Nd // Nd is the set of Unicode characters in category Nd (Number, decimal digit).
	LC     = _LC // LC is the set of Unicode characters in category LC (Letter, cased: Ll | Lt | Lu).
	Letter = _L  // Letter/L is the set of Unicode letters, category L.
	L      = _L
	Lm     = _Lm // Lm is the set of Unicode characters in category Lm (Letter, modifier).
	Lo     = _Lo // Lo is the set of Unicode characters in category Lo (Letter, other).
	Lower  = _Ll // Lower is the set of Unicode lower case letters.
	Ll     = _Ll // Ll is the set of Unicode characters in category Ll (Letter, lowercase).
	Mark   = _M  // Mark/M is the set of Unicode mark characters, category M.
	M      = _M
	Mc     = _Mc // Mc is the set of Unicode characters in category Mc (Mark, spacing combining).
	Me     = _Me // Me is the set of Unicode characters in category Me (Mark, enclosing).
	Mn     = _Mn // Mn is the set of Unicode characters in category Mn (Mark, nonspacing).
	Nl     = _Nl // Nl is the set of Unicode characters in category Nl (Number, letter).
	No     = _No // No is the set of Unicode characters in category No (Number, other).
	Number = _N  // Number/N is the set of Unicode number characters, category N.
	N      = _N
	Other  = _C // Other/C is the set of Unicode control, special, and unassigned code points, category C.
	C      = _C
	Pc     = _Pc // Pc is the set of Unicode characters in category Pc (Punctuation, connector).
	Pd     = _Pd // Pd is the set of Unicode characters in category Pd (Punctuation, dash).
	Pe     = _Pe // Pe is the set of Unicode characters in category Pe (Punctuation, close).
	Pf     = _Pf // Pf is the set of Unicode characters in category Pf (Punctuation, final quote).
	Pi     = _Pi // Pi is the set of Unicode characters in category Pi (Punctuation, initial quote).
	Po     = _Po // Po is the set of Unicode characters in category Po (Punctuation, other).
	Ps     = _Ps // Ps is the set of Unicode characters in category Ps (Punctuation, open).
	Punct  = _P  // Punct/P is the set of Unicode punctuation characters, category P.
	P      = _P
	Sc     = _Sc // Sc is the set of Unicode characters in category Sc (Symbol, currency).
	Sk     = _Sk // Sk is the set of Unicode characters in category Sk (Symbol, modifier).
	Sm     = _Sm // Sm is the set of Unicode characters in category Sm (Symbol, math).
	So     = _So // So is the set of Unicode characters in category So (Symbol, other).
	Space  = _Z  // Space/Z is the set of Unicode space characters, category Z.
	Z      = _Z
	Symbol = _S // Symbol/S is the set of Unicode symbol characters, category S.
	S      = _S
	Title  = _Lt // Title is the set of Unicode title case letters.
	Lt     = _Lt // Lt is the set of Unicode characters in category Lt (Letter, titlecase).
	Upper  = _Lu // Upper is the set of Unicode upper case letters.
	Lu     = _Lu // Lu is the set of Unicode characters in category Lu (Letter, uppercase).
	Zl     = _Zl // Zl is the set of Unicode characters in category Zl (Separator, line).
	Zp     = _Zp // Zp is the set of Unicode characters in category Zp (Separator, paragraph).
	Zs     = _Zs // Zs is the set of Unicode characters in category Zs (Separator, space).
)
    These variables have type *RangeTable.

var (
	Adlam                  = _Adlam                  // Adlam is the set of Unicode characters in script Adlam.
	Ahom                   = _Ahom                   // Ahom is the set of Unicode characters in script Ahom.
	Anatolian_Hieroglyphs  = _Anatolian_Hieroglyphs  // Anatolian_Hieroglyphs is the set of Unicode characters in script Anatolian_Hieroglyphs.
	Arabic                 = _Arabic                 // Arabic is the set of Unicode characters in script Arabic.
	Armenian               = _Armenian               // Armenian is the set of Unicode characters in script Armenian.
	Avestan                = _Avestan                // Avestan is the set of Unicode characters in script Avestan.
	Balinese               = _Balinese               // Balinese is the set of Unicode characters in script Balinese.
	Bamum                  = _Bamum                  // Bamum is the set of Unicode characters in script Bamum.
	Bassa_Vah              = _Bassa_Vah              // Bassa_Vah is the set of Unicode characters in script Bassa_Vah.
	Batak                  = _Batak                  // Batak is the set of Unicode characters in script Batak.
	Bengali                = _Bengali                // Bengali is the set of Unicode characters in script Bengali.
	Beria_Erfe             = _Beria_Erfe             // Beria_Erfe is the set of Unicode characters in script Beria_Erfe.
	Bhaiksuki              = _Bhaiksuki              // Bhaiksuki is the set of Unicode characters in script Bhaiksuki.
	Bopomofo               = _Bopomofo               // Bopomofo is the set of Unicode characters in script Bopomofo.
	Brahmi                 = _Brahmi                 // Brahmi is the set of Unicode characters in script Brahmi.
	Braille                = _Braille                // Braille is the set of Unicode characters in script Braille.
	Buginese               = _Buginese               // Buginese is the set of Unicode characters in script Buginese.
	Buhid                  = _Buhid                  // Buhid is the set of Unicode characters in script Buhid.
	Canadian_Aboriginal    = _Canadian_Aboriginal    // Canadian_Aboriginal is the set of Unicode characters in script Canadian_Aboriginal.
	Carian                 = _Carian                 // Carian is the set of Unicode characters in script Carian.
	Caucasian_Albanian     = _Caucasian_Albanian     // Caucasian_Albanian is the set of Unicode characters in script Caucasian_Albanian.
	Chakma                 = _Chakma                 // Chakma is the set of Unicode characters in script Chakma.
	Cham                   = _Cham                   // Cham is the set of Unicode characters in script Cham.
	Cherokee               = _Cherokee               // Cherokee is the set of Unicode characters in script Cherokee.
	Chorasmian             = _Chorasmian             // Chorasmian is the set of Unicode characters in script Chorasmian.
	Common                 = _Common                 // Common is the set of Unicode characters in script Common.
	Coptic                 = _Coptic                 // Coptic is the set of Unicode characters in script Coptic.
	Cuneiform              = _Cuneiform              // Cuneiform is the set of Unicode characters in script Cuneiform.
	Cypriot                = _Cypriot                // Cypriot is the set of Unicode characters in script Cypriot.
	Cypro_Minoan           = _Cypro_Minoan           // Cypro_Minoan is the set of Unicode characters in script Cypro_Minoan.
	Cyrillic               = _Cyrillic               // Cyrillic is the set of Unicode characters in script Cyrillic.
	Deseret                = _Deseret                // Deseret is the set of Unicode characters in script Deseret.
	Devanagari             = _Devanagari             // Devanagari is the set of Unicode characters in script Devanagari.
	Dives_Akuru            = _Dives_Akuru            // Dives_Akuru is the set of Unicode characters in script Dives_Akuru.
	Dogra                  = _Dogra                  // Dogra is the set of Unicode characters in script Dogra.
	Duployan               = _Duployan               // Duployan is the set of Unicode characters in script Duployan.
	Egyptian_Hieroglyphs   = _Egyptian_Hieroglyphs   // Egyptian_Hieroglyphs is the set of Unicode characters in script Egyptian_Hieroglyphs.
	Elbasan                = _Elbasan                // Elbasan is the set of Unicode characters in script Elbasan.
	Elymaic                = _Elymaic                // Elymaic is the set of Unicode characters in script Elymaic.
	Ethiopic               = _Ethiopic               // Ethiopic is the set of Unicode characters in script Ethiopic.
	Garay                  = _Garay                  // Garay is the set of Unicode characters in script Garay.
	Georgian               = _Georgian               // Georgian is the set of Unicode characters in script Georgian.
	Glagolitic             = _Glagolitic             // Glagolitic is the set of Unicode characters in script Glagolitic.
	Gothic                 = _Gothic                 // Gothic is the set of Unicode characters in script Gothic.
	Grantha                = _Grantha                // Grantha is the set of Unicode characters in script Grantha.
	Greek                  = _Greek                  // Greek is the set of Unicode characters in script Greek.
	Gujarati               = _Gujarati               // Gujarati is the set of Unicode characters in script Gujarati.
	Gunjala_Gondi          = _Gunjala_Gondi          // Gunjala_Gondi is the set of Unicode characters in script Gunjala_Gondi.
	Gurmukhi               = _Gurmukhi               // Gurmukhi is the set of Unicode characters in script Gurmukhi.
	Gurung_Khema           = _Gurung_Khema           // Gurung_Khema is the set of Unicode characters in script Gurung_Khema.
	Han                    = _Han                    // Han is the set of Unicode characters in script Han.
	Hangul                 = _Hangul                 // Hangul is the set of Unicode characters in script Hangul.
	Hanifi_Rohingya        = _Hanifi_Rohingya        // Hanifi_Rohingya is the set of Unicode characters in script Hanifi_Rohingya.
	Hanunoo                = _Hanunoo                // Hanunoo is the set of Unicode characters in script Hanunoo.
	Hatran                 = _Hatran                 // Hatran is the set of Unicode characters in script Hatran.
	Hebrew                 = _Hebrew                 // Hebrew is the set of Unicode characters in script Hebrew.
	Hiragana               = _Hiragana               // Hiragana is the set of Unicode characters in script Hiragana.
	Imperial_Aramaic       = _Imperial_Aramaic       // Imperial_Aramaic is the set of Unicode characters in script Imperial_Aramaic.
	Inherited              = _Inherited              // Inherited is the set of Unicode characters in script Inherited.
	Inscriptional_Pahlavi  = _Inscriptional_Pahlavi  // Inscriptional_Pahlavi is the set of Unicode characters in script Inscriptional_Pahlavi.
	Inscriptional_Parthian = _Inscriptional_Parthian // Inscriptional_Parthian is the set of Unicode characters in script Inscriptional_Parthian.
	Javanese               = _Javanese               // Javanese is the set of Unicode characters in script Javanese.
	Kaithi                 = _Kaithi                 // Kaithi is the set of Unicode characters in script Kaithi.
	Kannada                = _Kannada                // Kannada is the set of Unicode characters in script Kannada.
	Katakana               = _Katakana               // Katakana is the set of Unicode characters in script Katakana.
	Kawi                   = _Kawi                   // Kawi is the set of Unicode characters in script Kawi.
	Kayah_Li               = _Kayah_Li               // Kayah_Li is the set of Unicode characters in script Kayah_Li.
	Kharoshthi             = _Kharoshthi             // Kharoshthi is the set of Unicode characters in script Kharoshthi.
	Khitan_Small_Script    = _Khitan_Small_Script    // Khitan_Small_Script is the set of Unicode characters in script Khitan_Small_Script.
	Khmer                  = _Khmer                  // Khmer is the set of Unicode characters in script Khmer.
	Khojki                 = _Khojki                 // Khojki is the set of Unicode characters in script Khojki.
	Khudawadi              = _Khudawadi              // Khudawadi is the set of Unicode characters in script Khudawadi.
	Kirat_Rai              = _Kirat_Rai              // Kirat_Rai is the set of Unicode characters in script Kirat_Rai.
	Lao                    = _Lao                    // Lao is the set of Unicode characters in script Lao.
	Latin                  = _Latin                  // Latin is the set of Unicode characters in script Latin.
	Lepcha                 = _Lepcha                 // Lepcha is the set of Unicode characters in script Lepcha.
	Limbu                  = _Limbu                  // Limbu is the set of Unicode characters in script Limbu.
	Linear_A               = _Linear_A               // Linear_A is the set of Unicode characters in script Linear_A.
	Linear_B               = _Linear_B               // Linear_B is the set of Unicode characters in script Linear_B.
	Lisu                   = _Lisu                   // Lisu is the set of Unicode characters in script Lisu.
	Lycian                 = _Lycian                 // Lycian is the set of Unicode characters in script Lycian.
	Lydian                 = _Lydian                 // Lydian is the set of Unicode characters in script Lydian.
	Mahajani               = _Mahajani               // Mahajani is the set of Unicode characters in script Mahajani.
	Makasar                = _Makasar                // Makasar is the set of Unicode characters in script Makasar.
	Malayalam              = _Malayalam              // Malayalam is the set of Unicode characters in script Malayalam.
	Mandaic                = _Mandaic                // Mandaic is the set of Unicode characters in script Mandaic.
	Manichaean             = _Manichaean             // Manichaean is the set of Unicode characters in script Manichaean.
	Marchen                = _Marchen                // Marchen is the set of Unicode characters in script Marchen.
	Masaram_Gondi          = _Masaram_Gondi          // Masaram_Gondi is the set of Unicode characters in script Masaram_Gondi.
	Medefaidrin            = _Medefaidrin            // Medefaidrin is the set of Unicode characters in script Medefaidrin.
	Meetei_Mayek           = _Meetei_Mayek           // Meetei_Mayek is the set of Unicode characters in script Meetei_Mayek.
	Mende_Kikakui          = _Mende_Kikakui          // Mende_Kikakui is the set of Unicode characters in script Mende_Kikakui.
	Meroitic_Cursive       = _Meroitic_Cursive       // Meroitic_Cursive is the set of Unicode characters in script Meroitic_Cursive.
	Meroitic_Hieroglyphs   = _Meroitic_Hieroglyphs   // Meroitic_Hieroglyphs is the set of Unicode characters in script Meroitic_Hieroglyphs.
	Miao                   = _Miao                   // Miao is the set of Unicode characters in script Miao.
	Modi                   = _Modi                   // Modi is the set of Unicode characters in script Modi.
	Mongolian              = _Mongolian              // Mongolian is the set of Unicode characters in script Mongolian.
	Mro                    = _Mro                    // Mro is the set of Unicode characters in script Mro.
	Multani                = _Multani                // Multani is the set of Unicode characters in script Multani.
	Myanmar                = _Myanmar                // Myanmar is the set of Unicode characters in script Myanmar.
	Nabataean              = _Nabataean              // Nabataean is the set of Unicode characters in script Nabataean.
	Nag_Mundari            = _Nag_Mundari            // Nag_Mundari is the set of Unicode characters in script Nag_Mundari.
	Nandinagari            = _Nandinagari            // Nandinagari is the set of Unicode characters in script Nandinagari.
	New_Tai_Lue            = _New_Tai_Lue            // New_Tai_Lue is the set of Unicode characters in script New_Tai_Lue.
	Newa                   = _Newa                   // Newa is the set of Unicode characters in script Newa.
	Nko                    = _Nko                    // Nko is the set of Unicode characters in script Nko.
	Nushu                  = _Nushu                  // Nushu is the set of Unicode characters in script Nushu.
	Nyiakeng_Puachue_Hmong = _Nyiakeng_Puachue_Hmong // Nyiakeng_Puachue_Hmong is the set of Unicode characters in script Nyiakeng_Puachue_Hmong.
	Ogham                  = _Ogham                  // Ogham is the set of Unicode characters in script Ogham.
	Ol_Chiki               = _Ol_Chiki               // Ol_Chiki is the set of Unicode characters in script Ol_Chiki.
	Ol_Onal                = _Ol_Onal                // Ol_Onal is the set of Unicode characters in script Ol_Onal.
	Old_Hungarian          = _Old_Hungarian          // Old_Hungarian is the set of Unicode characters in script Old_Hungarian.
	Old_Italic             = _Old_Italic             // Old_Italic is the set of Unicode characters in script Old_Italic.
	Old_North_Arabian      = _Old_North_Arabian      // Old_North_Arabian is the set of Unicode characters in script Old_North_Arabian.
	Old_Permic             = _Old_Permic             // Old_Permic is the set of Unicode characters in script Old_Permic.
	Old_Persian            = _Old_Persian            // Old_Persian is the set of Unicode characters in script Old_Persian.
	Old_Sogdian            = _Old_Sogdian            // Old_Sogdian is the set of Unicode characters in script Old_Sogdian.
	Old_South_Arabian      = _Old_South_Arabian      // Old_South_Arabian is the set of Unicode characters in script Old_South_Arabian.
	Old_Turkic             = _Old_Turkic             // Old_Turkic is the set of Unicode characters in script Old_Turkic.
	Old_Uyghur             = _Old_Uyghur             // Old_Uyghur is the set of Unicode characters in script Old_Uyghur.
	Oriya                  = _Oriya                  // Oriya is the set of Unicode characters in script Oriya.
	Osage                  = _Osage                  // Osage is the set of Unicode characters in script Osage.
	Osmanya                = _Osmanya                // Osmanya is the set of Unicode characters in script Osmanya.
	Pahawh_Hmong           = _Pahawh_Hmong           // Pahawh_Hmong is the set of Unicode characters in script Pahawh_Hmong.
	Palmyrene              = _Palmyrene              // Palmyrene is the set of Unicode characters in script Palmyrene.
	Pau_Cin_Hau            = _Pau_Cin_Hau            // Pau_Cin_Hau is the set of Unicode characters in script Pau_Cin_Hau.
	Phags_Pa               = _Phags_Pa               // Phags_Pa is the set of Unicode characters in script Phags_Pa.
	Phoenician             = _Phoenician             // Phoenician is the set of Unicode characters in script Phoenician.
	Psalter_Pahlavi        = _Psalter_Pahlavi        // Psalter_Pahlavi is the set of Unicode characters in script Psalter_Pahlavi.
	Rejang                 = _Rejang                 // Rejang is the set of Unicode characters in script Rejang.
	Runic                  = _Runic                  // Runic is the set of Unicode characters in script Runic.
	Samaritan              = _Samaritan              // Samaritan is the set of Unicode characters in script Samaritan.
	Saurashtra             = _Saurashtra             // Saurashtra is the set of Unicode characters in script Saurashtra.
	Sharada                = _Sharada                // Sharada is the set of Unicode characters in script Sharada.
	Shavian                = _Shavian                // Shavian is the set of Unicode characters in script Shavian.
	Siddham                = _Siddham                // Siddham is the set of Unicode characters in script Siddham.
	Sidetic                = _Sidetic                // Sidetic is the set of Unicode characters in script Sidetic.
	SignWriting            = _SignWriting            // SignWriting is the set of Unicode characters in script SignWriting.
	Sinhala                = _Sinhala                // Sinhala is the set of Unicode characters in script Sinhala.
	Sogdian                = _Sogdian                // Sogdian is the set of Unicode characters in script Sogdian.
	Sora_Sompeng           = _Sora_Sompeng           // Sora_Sompeng is the set of Unicode characters in script Sora_Sompeng.
	Soyombo                = _Soyombo                // Soyombo is the set of Unicode characters in script Soyombo.
	Sundanese              = _Sundanese              // Sundanese is the set of Unicode characters in script Sundanese.
	Sunuwar                = _Sunuwar                // Sunuwar is the set of Unicode characters in script Sunuwar.
	Syloti_Nagri           = _Syloti_Nagri           // Syloti_Nagri is the set of Unicode characters in script Syloti_Nagri.
	Syriac                 = _Syriac                 // Syriac is the set of Unicode characters in script Syriac.
	Tagalog                = _Tagalog                // Tagalog is the set of Unicode characters in script Tagalog.
	Tagbanwa               = _Tagbanwa               // Tagbanwa is the set of Unicode characters in script Tagbanwa.
	Tai_Le                 = _Tai_Le                 // Tai_Le is the set of Unicode characters in script Tai_Le.
	Tai_Tham               = _Tai_Tham               // Tai_Tham is the set of Unicode characters in script Tai_Tham.
	Tai_Viet               = _Tai_Viet               // Tai_Viet is the set of Unicode characters in script Tai_Viet.
	Tai_Yo                 = _Tai_Yo                 // Tai_Yo is the set of Unicode characters in script Tai_Yo.
	Takri                  = _Takri                  // Takri is the set of Unicode characters in script Takri.
	Tamil                  = _Tamil                  // Tamil is the set of Unicode characters in script Tamil.
	Tangsa                 = _Tangsa                 // Tangsa is the set of Unicode characters in script Tangsa.
	Tangut                 = _Tangut                 // Tangut is the set of Unicode characters in script Tangut.
	Telugu                 = _Telugu                 // Telugu is the set of Unicode characters in script Telugu.
	Thaana                 = _Thaana                 // Thaana is the set of Unicode characters in script Thaana.
	Thai                   = _Thai                   // Thai is the set of Unicode characters in script Thai.
	Tibetan                = _Tibetan                // Tibetan is the set of Unicode characters in script Tibetan.
	Tifinagh               = _Tifinagh               // Tifinagh is the set of Unicode characters in script Tifinagh.
	Tirhuta                = _Tirhuta                // Tirhuta is the set of Unicode characters in script Tirhuta.
	Todhri                 = _Todhri                 // Todhri is the set of Unicode characters in script Todhri.
	Tolong_Siki            = _Tolong_Siki            // Tolong_Siki is the set of Unicode characters in script Tolong_Siki.
	Toto                   = _Toto                   // Toto is the set of Unicode characters in script Toto.
	Tulu_Tigalari          = _Tulu_Tigalari          // Tulu_Tigalari is the set of Unicode characters in script Tulu_Tigalari.
	Ugaritic               = _Ugaritic               // Ugaritic is the set of Unicode characters in script Ugaritic.
	Vai                    = _Vai                    // Vai is the set of Unicode characters in script Vai.
	Vithkuqi               = _Vithkuqi               // Vithkuqi is the set of Unicode characters in script Vithkuqi.
	Wancho                 = _Wancho                 // Wancho is the set of Unicode characters in script Wancho.
	Warang_Citi            = _Warang_Citi            // Warang_Citi is the set of Unicode characters in script Warang_Citi.
	Yezidi                 = _Yezidi                 // Yezidi is the set of Unicode characters in script Yezidi.
	Yi                     = _Yi                     // Yi is the set of Unicode characters in script Yi.
	Zanabazar_Square       = _Zanabazar_Square       // Zanabazar_Square is the set of Unicode characters in script Zanabazar_Square.
)
    These variables have type *RangeTable.

var (
	ASCII_Hex_Digit                    = _ASCII_Hex_Digit                    // ASCII_Hex_Digit is the set of Unicode characters with property ASCII_Hex_Digit.
	Bidi_Control                       = _Bidi_Control                       // Bidi_Control is the set of Unicode characters with property Bidi_Control.
	Dash                               = _Dash                               // Dash is the set of Unicode characters with property Dash.
	Deprecated                         = _Deprecated                         // Deprecated is the set of Unicode characters with property Deprecated.
	Diacritic                          = _Diacritic                          // Diacritic is the set of Unicode characters with property Diacritic.
	Extender                           = _Extender                           // Extender is the set of Unicode characters with property Extender.
	Hex_Digit                          = _Hex_Digit                          // Hex_Digit is the set of Unicode characters with property Hex_Digit.
	Hyphen                             = _Hyphen                             // Hyphen is the set of Unicode characters with property Hyphen.
	IDS_Binary_Operator                = _IDS_Binary_Operator                // IDS_Binary_Operator is the set of Unicode characters with property IDS_Binary_Operator.
	IDS_Trinary_Operator               = _IDS_Trinary_Operator               // IDS_Trinary_Operator is the set of Unicode characters with property IDS_Trinary_Operator.
	IDS_Unary_Operator                 = _IDS_Unary_Operator                 // IDS_Unary_Operator is the set of Unicode characters with property IDS_Unary_Operator.
	ID_Compat_Math_Continue            = _ID_Compat_Math_Continue            // ID_Compat_Math_Continue is the set of Unicode characters with property ID_Compat_Math_Continue.
	ID_Compat_Math_Start               = _ID_Compat_Math_Start               // ID_Compat_Math_Start is the set of Unicode characters with property ID_Compat_Math_Start.
	Ideographic                        = _Ideographic                        // Ideographic is the set of Unicode characters with property Ideographic.
	Join_Control                       = _Join_Control                       // Join_Control is the set of Unicode characters with property Join_Control.
	Logical_Order_Exception            = _Logical_Order_Exception            // Logical_Order_Exception is the set of Unicode characters with property Logical_Order_Exception.
	Modifier_Combining_Mark            = _Modifier_Combining_Mark            // Modifier_Combining_Mark is the set of Unicode characters with property Modifier_Combining_Mark.
	Noncharacter_Code_Point            = _Noncharacter_Code_Point            // Noncharacter_Code_Point is the set of Unicode characters with property Noncharacter_Code_Point.
	Other_Alphabetic                   = _Other_Alphabetic                   // Other_Alphabetic is the set of Unicode characters with property Other_Alphabetic.
	Other_Default_Ignorable_Code_Point = _Other_Default_Ignorable_Code_Point // Other_Default_Ignorable_Code_Point is the set of Unicode characters with property Other_Default_Ignorable_Code_Point.
	Other_Grapheme_Extend              = _Other_Grapheme_Extend              // Other_Grapheme_Extend is the set of Unicode characters with property Other_Grapheme_Extend.
	Other_ID_Continue                  = _Other_ID_Continue                  // Other_ID_Continue is the set of Unicode characters with property Other_ID_Continue.
	Other_ID_Start                     = _Other_ID_Start                     // Other_ID_Start is the set of Unicode characters with property Other_ID_Start.
	Other_Lowercase                    = _Other_Lowercase                    // Other_Lowercase is the set of Unicode characters with property Other_Lowercase.
	Other_Math                         = _Other_Math                         // Other_Math is the set of Unicode characters with property Other_Math.
	Other_Uppercase                    = _Other_Uppercase                    // Other_Uppercase is the set of Unicode characters with property Other_Uppercase.
	Pattern_Syntax                     = _Pattern_Syntax                     // Pattern_Syntax is the set of Unicode characters with property Pattern_Syntax.
	Pattern_White_Space                = _Pattern_White_Space                // Pattern_White_Space is the set of Unicode characters with property Pattern_White_Space.
	Prepended_Concatenation_Mark       = _Prepended_Concatenation_Mark       // Prepended_Concatenation_Mark is the set of Unicode characters with property Prepended_Concatenation_Mark.
	Quotation_Mark                     = _Quotation_Mark                     // Quotation_Mark is the set of Unicode characters with property Quotation_Mark.
	Radical                            = _Radical                            // Radical is the set of Unicode characters with property Radical.
	Regional_Indicator                 = _Regional_Indicator                 // Regional_Indicator is the set of Unicode characters with property Regional_Indicator.
	STerm                              = _Sentence_Terminal                  // STerm is an alias for Sentence_Terminal.
	Sentence_Terminal                  = _Sentence_Terminal                  // Sentence_Terminal is the set of Unicode characters with property Sentence_Terminal.
	Soft_Dotted                        = _Soft_Dotted                        // Soft_Dotted is the set of Unicode characters with property Soft_Dotted.
	Terminal_Punctuation               = _Terminal_Punctuation               // Terminal_Punctuation is the set of Unicode characters with property Terminal_Punctuation.
	Unified_Ideograph                  = _Unified_Ideograph                  // Unified_Ideograph is the set of Unicode characters with property Unified_Ideograph.
	Variation_Selector                 = _Variation_Selector                 // Variation_Selector is the set of Unicode characters with property Variation_Selector.
	White_Space                        = _White_Space                        // White_Space is the set of Unicode characters with property White_Space.
)
    These variables have type *RangeTable.

var CaseRanges = _CaseRanges
    CaseRanges is the table describing case mappings for all letters with
    non-self mappings.

var Categories = map[string]*RangeTable{
	"C":  C,
	"Cc": Cc,
	"Cf": Cf,
	"Cn": Cn,
	"Co": Co,
	"Cs": Cs,
	"L":  L,
	"LC": LC,
	"Ll": Ll,
	"Lm": Lm,
	"Lo": Lo,
	"Lt": Lt,
	"Lu": Lu,
	"M":  M,
	"Mc": Mc,
	"Me": Me,
	"Mn": Mn,
	"N":  N,
	"Nd": Nd,
	"Nl": Nl,
	"No": No,
	"P":  P,
	"Pc": Pc,
	"Pd": Pd,
	"Pe": Pe,
	"Pf": Pf,
	"Pi": Pi,
	"Po": Po,
	"Ps": Ps,
	"S":  S,
	"Sc": Sc,
	"Sk": Sk,
	"Sm": Sm,
	"So": So,
	"Z":  Z,
	"Zl": Zl,
	"Zp": Zp,
	"Zs": Zs,
}
    Categories is the set of Unicode category tables.

var CategoryAliases = map[string]string{
	"Cased_Letter":          "LC",
	"Close_Punctuation":     "Pe",
	"Combining_Mark":        "M",
	"Connector_Punctuation": "Pc",
	"Control":               "Cc",
	"Currency_Symbol":       "Sc",
	"Dash_Punctuation":      "Pd",
	"Decimal_Number":        "Nd",
	"Enclosing_Mark":        "Me",
	"Final_Punctuation":     "Pf",
	"Format":                "Cf",
	"Initial_Punctuation":   "Pi",
	"Letter":                "L",
	"Letter_Number":         "Nl",
	"Line_Separator":        "Zl",
	"Lowercase_Letter":      "Ll",
	"Mark":                  "M",
	"Math_Symbol":           "Sm",
	"Modifier_Letter":       "Lm",
	"Modifier_Symbol":       "Sk",
	"Nonspacing_Mark":       "Mn",
	"Number":                "N",
	"Open_Punctuation":      "Ps",
	"Other":                 "C",
	"Other_Letter":          "Lo",
	"Other_Number":          "No",
	"Other_Punctuation":     "Po",
	"Other_Symbol":          "So",
	"Paragraph_Separator":   "Zp",
	"Private_Use":           "Co",
	"Punctuation":           "P",
	"Separator":             "Z",
	"Space_Separator":       "Zs",
	"Spacing_Mark":          "Mc",
	"Surrogate":             "Cs",
	"Symbol":                "S",
	"Titlecase_Letter":      "Lt",
	"Unassigned":            "Cn",
	"Uppercase_Letter":      "Lu",
	"cntrl":                 "Cc",
	"digit":                 "Nd",
	"punct":                 "P",
}
    CategoryAliases maps category aliases to standard category names.

var FoldCategory = map[string]*RangeTable{
	"L":  foldL,
	"Ll": foldLl,
	"Lt": foldLt,
	"Lu": foldLu,
	"M":  foldM,
	"Mn": foldMn,
}
    FoldCategory maps a category name to a table of code points outside the
    category that are equivalent under simple case folding to code points inside
    the category. If there is no entry for a category name, there are no such
    points.

var FoldScript = map[string]*RangeTable{
	"Common":    foldCommon,
	"Greek":     foldGreek,
	"Inherited": foldInherited,
}
    FoldScript maps a script name to a table of code points outside the script
    that are equivalent under simple case folding to code points inside the
    script. If there is no entry for a script name, there are no such points.

var GraphicRanges = []*RangeTable{
	L, M, N, P, S, Zs,
}
    GraphicRanges defines the set of graphic characters according to Unicode.

var PrintRanges = []*RangeTable{
	L, M, N, P, S,
}
    PrintRanges defines the set of printable characters according to Go.
    ASCII space, U+0020, is handled separately.

var Properties = map[string]*RangeTable{
	"ASCII_Hex_Digit":                    ASCII_Hex_Digit,
	"Bidi_Control":                       Bidi_Control,
	"Dash":                               Dash,
	"Deprecated":                         Deprecated,
	"Diacritic":                          Diacritic,
	"Extender":                           Extender,
	"Hex_Digit":                          Hex_Digit,
	"Hyphen":                             Hyphen,
	"IDS_Binary_Operator":                IDS_Binary_Operator,
	"IDS_Trinary_Operator":               IDS_Trinary_Operator,
	"IDS_Unary_Operator":                 IDS_Unary_Operator,
	"ID_Compat_Math_Continue":            ID_Compat_Math_Continue,
	"ID_Compat_Math_Start":               ID_Compat_Math_Start,
	"Ideographic":                        Ideographic,
	"Join_Control":                       Join_Control,
	"Logical_Order_Exception":            Logical_Order_Exception,
	"Modifier_Combining_Mark":            Modifier_Combining_Mark,
	"Noncharacter_Code_Point":            Noncharacter_Code_Point,
	"Other_Alphabetic":                   Other_Alphabetic,
	"Other_Default_Ignorable_Code_Point": Other_Default_Ignorable_Code_Point,
	"Other_Grapheme_Extend":              Other_Grapheme_Extend,
	"Other_ID_Continue":                  Other_ID_Continue,
	"Other_ID_Start":                     Other_ID_Start,
	"Other_Lowercase":                    Other_Lowercase,
	"Other_Math":                         Other_Math,
	"Other_Uppercase":                    Other_Uppercase,
	"Pattern_Syntax":                     Pattern_Syntax,
	"Pattern_White_Space":                Pattern_White_Space,
	"Prepended_Concatenation_Mark":       Prepended_Concatenation_Mark,
	"Quotation_Mark":                     Quotation_Mark,
	"Radical":                            Radical,
	"Regional_Indicator":                 Regional_Indicator,
	"Sentence_Terminal":                  Sentence_Terminal,
	"STerm":                              Sentence_Terminal,
	"Soft_Dotted":                        Soft_Dotted,
	"Terminal_Punctuation":               Terminal_Punctuation,
	"Unified_Ideograph":                  Unified_Ideograph,
	"Variation_Selector":                 Variation_Selector,
	"White_Space":                        White_Space,
}
    Properties is the set of Unicode property tables.

var Scripts = map[string]*RangeTable{
	"Adlam":                  Adlam,
	"Ahom":                   Ahom,
	"Anatolian_Hieroglyphs":  Anatolian_Hieroglyphs,
	"Arabic":                 Arabic,
	"Armenian":               Armenian,
	"Avestan":                Avestan,
	"Balinese":               Balinese,
	"Bamum":                  Bamum,
	"Bassa_Vah":              Bassa_Vah,
	"Batak":                  Batak,
	"Bengali":                Bengali,
	"Beria_Erfe":             Beria_Erfe,
	"Bhaiksuki":              Bhaiksuki,
	"Bopomofo":               Bopomofo,
	"Brahmi":                 Brahmi,
	"Braille":                Braille,
	"Buginese":               Buginese,
	"Buhid":                  Buhid,
	"Canadian_Aboriginal":    Canadian_Aboriginal,
	"Carian":                 Carian,
	"Caucasian_Albanian":     Caucasian_Albanian,
	"Chakma":                 Chakma,
	"Cham":                   Cham,
	"Cherokee":               Cherokee,
	"Chorasmian":             Chorasmian,
	"Common":                 Common,
	"Coptic":                 Coptic,
	"Cuneiform":              Cuneiform,
	"Cypriot":                Cypriot,
	"Cypro_Minoan":           Cypro_Minoan,
	"Cyrillic":               Cyrillic,
	"Deseret":                Deseret,
	"Devanagari":             Devanagari,
	"Dives_Akuru":            Dives_Akuru,
	"Dogra":                  Dogra,
	"Duployan":               Duployan,
	"Egyptian_Hieroglyphs":   Egyptian_Hieroglyphs,
	"Elbasan":                Elbasan,
	"Elymaic":                Elymaic,
	"Ethiopic":               Ethiopic,
	"Garay":                  Garay,
	"Georgian":               Georgian,
	"Glagolitic":             Glagolitic,
	"Gothic":                 Gothic,
	"Grantha":                Grantha,
	"Greek":                  Greek,
	"Gujarati":               Gujarati,
	"Gunjala_Gondi":          Gunjala_Gondi,
	"Gurmukhi":               Gurmukhi,
	"Gurung_Khema":           Gurung_Khema,
	"Han":                    Han,
	"Hangul":                 Hangul,
	"Hanifi_Rohingya":        Hanifi_Rohingya,
	"Hanunoo":                Hanunoo,
	"Hatran":                 Hatran,
	"Hebrew":                 Hebrew,
	"Hiragana":               Hiragana,
	"Imperial_Aramaic":       Imperial_Aramaic,
	"Inherited":              Inherited,
	"Inscriptional_Pahlavi":  Inscriptional_Pahlavi,
	"Inscriptional_Parthian": Inscriptional_Parthian,
	"Javanese":               Javanese,
	"Kaithi":                 Kaithi,
	"Kannada":                Kannada,
	"Katakana":               Katakana,
	"Kawi":                   Kawi,
	"Kayah_Li":               Kayah_Li,
	"Kharoshthi":             Kharoshthi,
	"Khitan_Small_Script":    Khitan_Small_Script,
	"Khmer":                  Khmer,
	"Khojki":                 Khojki,
	"Khudawadi":              Khudawadi,
	"Kirat_Rai":              Kirat_Rai,
	"Lao":                    Lao,
	"Latin":                  Latin,
	"Lepcha":                 Lepcha,
	"Limbu":                  Limbu,
	"Linear_A":               Linear_A,
	"Linear_B":               Linear_B,
	"Lisu":                   Lisu,
	"Lycian":                 Lycian,
	"Lydian":                 Lydian,
	"Mahajani":               Mahajani,
	"Makasar":                Makasar,
	"Malayalam":              Malayalam,
	"Mandaic":                Mandaic,
	"Manichaean":             Manichaean,
	"Marchen":                Marchen,
	"Masaram_Gondi":          Masaram_Gondi,
	"Medefaidrin":            Medefaidrin,
	"Meetei_Mayek":           Meetei_Mayek,
	"Mende_Kikakui":          Mende_Kikakui,
	"Meroitic_Cursive":       Meroitic_Cursive,
	"Meroitic_Hieroglyphs":   Meroitic_Hieroglyphs,
	"Miao":                   Miao,
	"Modi":                   Modi,
	"Mongolian":              Mongolian,
	"Mro":                    Mro,
	"Multani":                Multani,
	"Myanmar":                Myanmar,
	"Nabataean":              Nabataean,
	"Nag_Mundari":            Nag_Mundari,
	"Nandinagari":            Nandinagari,
	"New_Tai_Lue":            New_Tai_Lue,
	"Newa":                   Newa,
	"Nko":                    Nko,
	"Nushu":                  Nushu,
	"Nyiakeng_Puachue_Hmong": Nyiakeng_Puachue_Hmong,
	"Ogham":                  Ogham,
	"Ol_Chiki":               Ol_Chiki,
	"Ol_Onal":                Ol_Onal,
	"Old_Hungarian":          Old_Hungarian,
	"Old_Italic":             Old_Italic,
	"Old_North_Arabian":      Old_North_Arabian,
	"Old_Permic":             Old_Permic,
	"Old_Persian":            Old_Persian,
	"Old_Sogdian":            Old_Sogdian,
	"Old_South_Arabian":      Old_South_Arabian,
	"Old_Turkic":             Old_Turkic,
	"Old_Uyghur":             Old_Uyghur,
	"Oriya":                  Oriya,
	"Osage":                  Osage,
	"Osmanya":                Osmanya,
	"Pahawh_Hmong":           Pahawh_Hmong,
	"Palmyrene":              Palmyrene,
	"Pau_Cin_Hau":            Pau_Cin_Hau,
	"Phags_Pa":               Phags_Pa,
	"Phoenician":             Phoenician,
	"Psalter_Pahlavi":        Psalter_Pahlavi,
	"Rejang":                 Rejang,
	"Runic":                  Runic,
	"Samaritan":              Samaritan,
	"Saurashtra":             Saurashtra,
	"Sharada":                Sharada,
	"Shavian":                Shavian,
	"Siddham":                Siddham,
	"Sidetic":                Sidetic,
	"SignWriting":            SignWriting,
	"Sinhala":                Sinhala,
	"Sogdian":                Sogdian,
	"Sora_Sompeng":           Sora_Sompeng,
	"Soyombo":                Soyombo,
	"Sundanese":              Sundanese,
	"Sunuwar":                Sunuwar,
	"Syloti_Nagri":           Syloti_Nagri,
	"Syriac":                 Syriac,
	"Tagalog":                Tagalog,
	"Tagbanwa":               Tagbanwa,
	"Tai_Le":                 Tai_Le,
	"Tai_Tham":               Tai_Tham,
	"Tai_Viet":               Tai_Viet,
	"Tai_Yo":                 Tai_Yo,
	"Takri":                  Takri,
	"Tamil":                  Tamil,
	"Tangsa":                 Tangsa,
	"Tangut":                 Tangut,
	"Telugu":                 Telugu,
	"Thaana":                 Thaana,
	"Thai":                   Thai,
	"Tibetan":                Tibetan,
	"Tifinagh":               Tifinagh,
	"Tirhuta":                Tirhuta,
	"Todhri":                 Todhri,
	"Tolong_Siki":            Tolong_Siki,
	"Toto":                   Toto,
	"Tulu_Tigalari":          Tulu_Tigalari,
	"Ugaritic":               Ugaritic,
	"Vai":                    Vai,
	"Vithkuqi":               Vithkuqi,
	"Wancho":                 Wancho,
	"Warang_Citi":            Warang_Citi,
	"Yezidi":                 Yezidi,
	"Yi":                     Yi,
	"Zanabazar_Square":       Zanabazar_Square,
}
    Scripts is the set of Unicode script tables.


FUNCTIONS

func In(r rune, ranges ...*RangeTable) bool
    In reports whether the rune is a member of one of the ranges.

func Is(rangeTab *RangeTable, r rune) bool
    Is reports whether the rune is in the specified table of ranges.

func IsControl(r rune) bool
    IsControl reports whether the rune is a control character. The C (Other)
    Unicode category includes more code points such as surrogates; use Is(C,
    r) to test for them.

func IsDigit(r rune) bool
    IsDigit reports whether the rune is a decimal digit.

func IsGraphic(r rune) bool
    IsGraphic reports whether the rune is defined as a Graphic by Unicode.
    Such characters include letters, marks, numbers, punctuation, symbols,
    and spaces, from categories L, M, N, P, S, Zs.

func IsLetter(r rune) bool
    IsLetter reports whether the rune is a letter (category L).

func IsLower(r rune) bool
    IsLower reports whether the rune is a lower case letter.

func IsMark(r rune) bool
    IsMark reports whether the rune is a mark character (category M).

func IsNumber(r rune) bool
    IsNumber reports whether the rune is a number (category N).

func IsOneOf(ranges []*RangeTable, r rune) bool
    IsOneOf reports whether the rune is a member of one of the ranges. The
    function "In" provides a nicer signature and should be used in preference to
    IsOneOf.

func IsPrint(r rune) bool
    IsPrint reports whether the rune is defined as printable by Go. Such
    characters include letters, marks, numbers, punctuation, symbols, and the
    ASCII space character, from categories L, M, N, P, S and the ASCII space
    character. This categorization is the same as IsGraphic except that the only
    spacing character is ASCII space, U+0020.

func IsPunct(r rune) bool
    IsPunct reports whether the rune is a Unicode punctuation character
    (category P).

func IsSpace(r rune) bool
    IsSpace reports whether the rune is a space character as defined by
    Unicode's White Space property; in the Latin-1 space this is

        '\t', '\n', '\v', '\f', '\r', ' ', U+0085 (NEL), U+00A0 (NBSP).

    Other definitions of spacing characters are set by category Z and property
    Pattern_White_Space.

func IsSymbol(r rune) bool
    IsSymbol reports whether the rune is a symbolic character.

func IsTitle(r rune) bool
    IsTitle reports whether the rune is a title case letter.

func IsUpper(r rune) bool
    IsUpper reports whether the rune is an upper case letter.

func SimpleFold(r rune) rune
    SimpleFold iterates over Unicode code points equivalent under the
    Unicode-defined simple case folding. Among the code points equivalent to
    rune (including rune itself), SimpleFold returns the smallest rune > r if
    one exists, or else the smallest rune >= 0. If r is not a valid Unicode code
    point, SimpleFold(r) returns r.

    For example:

        SimpleFold('A') = 'a'
        SimpleFold('a') = 'A'

        SimpleFold('K') = 'k'
        SimpleFold('k') = '\u212A' (Kelvin symbol, K)
        SimpleFold('\u212A') = 'K'

        SimpleFold('1') = '1'

        SimpleFold(-2) = -2

func To(_case int, r rune) rune
    To maps the rune to the specified case: UpperCase, LowerCase, or TitleCase.

func ToLower(r rune) rune
    ToLower maps the rune to lower case.

func ToTitle(r rune) rune
    ToTitle maps the rune to title case.

func ToUpper(r rune) rune
    ToUpper maps the rune to upper case.


TYPES

type CaseRange struct {
	Lo    uint32
	Hi    uint32
	Delta d
}
    CaseRange represents a range of Unicode code points for simple (one code
    point to one code point) case conversion. The range runs from Lo to Hi
    inclusive, with a fixed stride of 1. Deltas are the number to add to the
    code point to reach the code point for a different case for that character.
    They may be negative. If zero, it means the character is in the
    corresponding case. There is a special case representing sequences of
    alternating corresponding Upper and Lower pairs. It appears with a fixed
    Delta of

        {UpperLower, UpperLower, UpperLower}

    The constant UpperLower has an otherwise impossible delta value.

type Range16 struct {
	Lo     uint16
	Hi     uint16
	Stride uint16
}
    Range16 represents of a range of 16-bit Unicode code points. The range runs
    from Lo to Hi inclusive and has the specified stride.

type Range32 struct {
	Lo     uint32
	Hi     uint32
	Stride uint32
}
    Range32 represents of a range of Unicode code points and is used when one
    or more of the values will not fit in 16 bits. The range runs from Lo to Hi
    inclusive and has the specified stride. Lo and Hi must always be >= 1<<16.

type RangeTable struct {
	R16         []Range16
	R32         []Range32
	LatinOffset int // number of entries in R16 with Hi <= MaxLatin1
}
    RangeTable defines a set of Unicode code points by listing the ranges of
    code points within the set. The ranges are listed in two slices to save
    space: a slice of 16-bit ranges and a slice of 32-bit ranges. The two slices
    must be in sorted order and non-overlapping. Also, R32 should contain only
    values >= 0x10000 (1<<16).

type SpecialCase []CaseRange
    SpecialCase represents language-specific case mappings such as Turkish.
    Methods of SpecialCase customize (by overriding) the standard mappings.

var AzeriCase SpecialCase = _TurkishCase
var TurkishCase SpecialCase = _TurkishCase
func (special SpecialCase) ToLower(r rune) rune
    ToLower maps the rune to lower case giving priority to the special mapping.

func (special SpecialCase) ToTitle(r rune) rune
    ToTitle maps the rune to title case giving priority to the special mapping.

func (special SpecialCase) ToUpper(r rune) rune
    ToUpper maps the rune to upper case giving priority to the special mapping.


BUG: There is no mechanism for full case folding, that is, for
characters that involve multiple runes in the input or output.
```

## unicode/utf8

```go
package utf8 // import "unicode/utf8"

Package utf8 implements functions and constants to support text encoded
in UTF-8. It includes functions to translate between runes and UTF-8 byte
sequences. See https://en.wikipedia.org/wiki/UTF-8

CONSTANTS

const (
	RuneError = '\uFFFD'     // the "error" Rune or "Unicode replacement character"
	RuneSelf  = 0x80         // characters below RuneSelf are represented as themselves in a single byte.
	MaxRune   = '\U0010FFFF' // Maximum valid Unicode code point.
	UTFMax    = 4            // maximum number of bytes of a UTF-8 encoded Unicode character.
)
    Numbers fundamental to the encoding.


FUNCTIONS

func AppendRune(p []byte, r rune) []byte
    AppendRune appends the UTF-8 encoding of r to the end of p and returns the
    extended buffer. If the rune is out of range, it appends the encoding of
    RuneError.

func DecodeLastRune(p []byte) (r rune, size int)
    DecodeLastRune unpacks the last UTF-8 encoding in p and returns the rune
    and its width in bytes. If p is empty it returns (RuneError, 0). Otherwise,
    if the encoding is invalid, it returns (RuneError, 1). Both are impossible
    results for correct, non-empty UTF-8.

    An encoding is invalid if it is incorrect UTF-8, encodes a rune that is out
    of range, or is not the shortest possible UTF-8 encoding for the value.
    No other validation is performed.

func DecodeLastRuneInString(s string) (r rune, size int)
    DecodeLastRuneInString is like DecodeLastRune but its input is a string.
    If s is empty it returns (RuneError, 0). Otherwise, if the encoding is
    invalid, it returns (RuneError, 1). Both are impossible results for correct,
    non-empty UTF-8.

    An encoding is invalid if it is incorrect UTF-8, encodes a rune that is out
    of range, or is not the shortest possible UTF-8 encoding for the value.
    No other validation is performed.

func DecodeRune(p []byte) (r rune, size int)
    DecodeRune unpacks the first UTF-8 encoding in p and returns the rune and
    its width in bytes. If p is empty it returns (RuneError, 0). Otherwise,
    if the encoding is invalid, it returns (RuneError, 1). Both are impossible
    results for correct, non-empty UTF-8.

    An encoding is invalid if it is incorrect UTF-8, encodes a rune that is out
    of range, or is not the shortest possible UTF-8 encoding for the value.
    No other validation is performed.

func DecodeRuneInString(s string) (r rune, size int)
    DecodeRuneInString is like DecodeRune but its input is a string. If s is
    empty it returns (RuneError, 0). Otherwise, if the encoding is invalid,
    it returns (RuneError, 1). Both are impossible results for correct,
    non-empty UTF-8.

    An encoding is invalid if it is incorrect UTF-8, encodes a rune that is out
    of range, or is not the shortest possible UTF-8 encoding for the value.
    No other validation is performed.

func EncodeRune(p []byte, r rune) int
    EncodeRune writes into p (which must be large enough) the UTF-8 encoding of
    the rune. If the rune is out of range, it writes the encoding of RuneError.
    It returns the number of bytes written.

func FullRune(p []byte) bool
    FullRune reports whether the bytes in p begin with a full UTF-8 encoding of
    a rune. An invalid encoding is considered a full Rune since it will convert
    as a width-1 error rune.

func FullRuneInString(s string) bool
    FullRuneInString is like FullRune but its input is a string.

func RuneCount(p []byte) int
    RuneCount returns the number of runes in p. Erroneous and short encodings
    are treated as single runes of width 1 byte.

func RuneCountInString(s string) (n int)
    RuneCountInString is like RuneCount but its input is a string.

func RuneLen(r rune) int
    RuneLen returns the number of bytes in the UTF-8 encoding of the rune.
    It returns -1 if the rune is not a valid value to encode in UTF-8.

func RuneStart(b byte) bool
    RuneStart reports whether the byte could be the first byte of an encoded,
    possibly invalid rune. Second and subsequent bytes always have the top two
    bits set to 10.

func Valid(p []byte) bool
    Valid reports whether p consists entirely of valid UTF-8-encoded runes.

func ValidRune(r rune) bool
    ValidRune reports whether r can be legally encoded as UTF-8. Code points
    that are out of range or a surrogate half are illegal.

func ValidString(s string) bool
    ValidString reports whether s consists entirely of valid UTF-8-encoded
    runes.
```

## bytes

```go
package bytes // import "bytes"

Package bytes implements functions for the manipulation of byte slices. It is
analogous to the facilities of the strings package.

CONSTANTS

const MinRead = 512
    MinRead is the minimum slice size passed to a Buffer.Read call by
    Buffer.ReadFrom. As long as the Buffer has at least MinRead bytes beyond
    what is required to hold the contents of r, Buffer.ReadFrom will not grow
    the underlying buffer.


VARIABLES

var ErrTooLarge = errors.New("bytes.Buffer: too large")
    ErrTooLarge is passed to panic if memory cannot be allocated to store data
    in a buffer.


FUNCTIONS

func Clone(b []byte) []byte
    Clone returns a copy of b[:len(b)]. The result may have additional unused
    capacity. Clone(nil) returns nil.

func Compare(a, b []byte) int
    Compare returns an integer comparing two byte slices lexicographically.
    The result will be 0 if a == b, -1 if a < b, and +1 if a > b. A nil argument
    is equivalent to an empty slice.

func Contains(b, subslice []byte) bool
    Contains reports whether subslice is within b.

func ContainsAny(b []byte, chars string) bool
    ContainsAny reports whether any of the UTF-8-encoded code points in chars
    are within b.

func ContainsFunc(b []byte, f func(rune) bool) bool
    ContainsFunc reports whether any of the UTF-8-encoded code points r within b
    satisfy f(r). It stops as soon as a call to f returns true.

func ContainsRune(b []byte, r rune) bool
    ContainsRune reports whether the rune is contained in the UTF-8-encoded byte
    slice b.

func Count(s, sep []byte) int
    Count counts the number of non-overlapping instances of sep in s. If sep is
    an empty slice, Count returns 1 + the number of UTF-8-encoded code points in
    s.

func Cut(s, sep []byte) (before, after []byte, found bool)
    Cut slices s around the first instance of sep, returning the text before and
    after sep. The found result reports whether sep appears in s. If sep does
    not appear in s, cut returns s, nil, false.

    Cut returns slices of the original slice s, not copies.

func CutLast(s, sep []byte) (before, after []byte, found bool)
    CutLast slices s around the last instance of sep, returning the text
    before and after sep. The found result reports whether sep appears in s.
    If sep does not appear in s, CutLast returns s, nil, false.

    CutLast returns slices of the original slice s, not copies.

func CutPrefix(s, prefix []byte) (after []byte, found bool)
    CutPrefix returns s without the provided leading prefix byte slice and
    reports whether it found the prefix. If s doesn't start with prefix,
    CutPrefix returns s, false. If prefix is the empty byte slice, CutPrefix
    returns s, true.

    CutPrefix returns slices of the original slice s, not copies.

func CutSuffix(s, suffix []byte) (before []byte, found bool)
    CutSuffix returns s without the provided ending suffix byte slice and
    reports whether it found the suffix. If s doesn't end with suffix, CutSuffix
    returns s, false. If suffix is the empty byte slice, CutSuffix returns s,
    true.

    CutSuffix returns slices of the original slice s, not copies.

func Equal(a, b []byte) bool
    Equal reports whether a and b are the same length and contain the same
    bytes. A nil argument is equivalent to an empty slice.

func EqualFold(s, t []byte) bool
    EqualFold reports whether s and t, interpreted as UTF-8 strings,
    are equal under simple Unicode case-folding, which is a more general form of
    case-insensitivity.

func Fields(s []byte) [][]byte
    Fields interprets s as a sequence of UTF-8-encoded code points. It splits
    the slice s around each instance of one or more consecutive white space
    characters, as defined by unicode.IsSpace, returning a slice of subslices
    of s or an empty slice if s contains only white space. Every element of
    the returned slice is non-empty. Unlike Split, leading and trailing runs of
    white space characters are discarded.

func FieldsFunc(s []byte, f func(rune) bool) [][]byte
    FieldsFunc interprets s as a sequence of UTF-8-encoded code points.
    It splits the slice s at each run of code points c satisfying f(c) and
    returns a slice of subslices of s. If all code points in s satisfy f(c),
    or len(s) == 0, an empty slice is returned. Every element of the returned
    slice is non-empty. Unlike Split, leading and trailing runs of code points
    satisfying f(c) are discarded.

    FieldsFunc makes no guarantees about the order in which it calls f(c) and
    assumes that f always returns the same value for a given c.

func FieldsFuncSeq(s []byte, f func(rune) bool) iter.Seq[[]byte]
    FieldsFuncSeq returns an iterator over subslices of s split around runs of
    Unicode code points satisfying f(c). The iterator yields the same subslices
    that would be returned by FieldsFunc(s), but without constructing a new
    slice containing the subslices.

func FieldsSeq(s []byte) iter.Seq[[]byte]
    FieldsSeq returns an iterator over subslices of s split around runs of
    whitespace characters, as defined by unicode.IsSpace. The iterator yields
    the same subslices that would be returned by Fields(s), but without
    constructing a new slice containing the subslices.

func HasPrefix(s, prefix []byte) bool
    HasPrefix reports whether the byte slice s begins with prefix.

func HasSuffix(s, suffix []byte) bool
    HasSuffix reports whether the byte slice s ends with suffix.

func Index(s, sep []byte) int
    Index returns the index of the first instance of sep in s, or -1 if sep is
    not present in s.

func IndexAny(s []byte, chars string) int
    IndexAny interprets s as a sequence of UTF-8-encoded Unicode code points.
    It returns the byte index of the first occurrence in s of any of the Unicode
    code points in chars. It returns -1 if chars is empty or if there is no code
    point in common.

func IndexByte(b []byte, c byte) int
    IndexByte returns the index of the first instance of c in b, or -1 if c is
    not present in b.

func IndexFunc(s []byte, f func(r rune) bool) int
    IndexFunc interprets s as a sequence of UTF-8-encoded code points. It
    returns the byte index in s of the first Unicode code point satisfying f(c),
    or -1 if none do.

func IndexRune(s []byte, r rune) int
    IndexRune interprets s as a sequence of UTF-8-encoded code points.
    It returns the byte index of the first occurrence in s of the given rune.
    It returns -1 if rune is not present in s. If r is utf8.RuneError,
    it returns the first instance of any invalid UTF-8 byte sequence.

func Join(s [][]byte, sep []byte) []byte
    Join concatenates the elements of s to create a new byte slice. The
    separator sep is placed between elements in the resulting slice.

func LastIndex(s, sep []byte) int
    LastIndex returns the index of the last instance of sep in s, or -1 if sep
    is not present in s.

func LastIndexAny(s []byte, chars string) int
    LastIndexAny interprets s as a sequence of UTF-8-encoded Unicode code
    points. It returns the byte index of the last occurrence in s of any of the
    Unicode code points in chars. It returns -1 if chars is empty or if there is
    no code point in common.

func LastIndexByte(s []byte, c byte) int
    LastIndexByte returns the index of the last instance of c in s, or -1 if c
    is not present in s.

func LastIndexFunc(s []byte, f func(r rune) bool) int
    LastIndexFunc interprets s as a sequence of UTF-8-encoded code points. It
    returns the byte index in s of the last Unicode code point satisfying f(c),
    or -1 if none do.

func Lines(s []byte) iter.Seq[[]byte]
    Lines returns an iterator over the newline-terminated lines in the byte
    slice s. The lines yielded by the iterator include their terminating
    newlines. If s is empty, the iterator yields no lines at all. If s does
    not end in a newline, the final yielded line will not end in a newline.
    It returns a single-use iterator.

func Map(mapping func(r rune) rune, s []byte) []byte
    Map returns a copy of the byte slice s with all its characters modified
    according to the mapping function. If mapping returns a negative value, the
    character is dropped from the byte slice with no replacement. The characters
    in s and the output are interpreted as UTF-8-encoded code points.

func Repeat(b []byte, count int) []byte
    Repeat returns a new byte slice consisting of count copies of b.

    It panics if count is negative or if the result of (len(b) * count)
    overflows.

func Replace(s, old, new []byte, n int) []byte
    Replace returns a copy of the slice s with the first n non-overlapping
    instances of old replaced by new. If old is empty, it matches at the
    beginning of the slice and after each UTF-8 sequence, yielding up to k+1
    replacements for a k-rune slice. If n < 0, there is no limit on the number
    of replacements.

func ReplaceAll(s, old, new []byte) []byte
    ReplaceAll returns a copy of the slice s with all non-overlapping instances
    of old replaced by new. If old is empty, it matches at the beginning of the
    slice and after each UTF-8 sequence, yielding up to k+1 replacements for a
    k-rune slice.

func Runes(s []byte) []rune
    Runes interprets s as a sequence of UTF-8-encoded code points. It returns a
    slice of runes (Unicode code points) equivalent to s.

func Split(s, sep []byte) [][]byte
    Split slices s into all subslices separated by sep and returns a slice of
    the subslices between those separators. If sep is empty, Split splits after
    each UTF-8 sequence. It is equivalent to SplitN with a count of -1.

    To split around the first instance of a separator, see Cut.

func SplitAfter(s, sep []byte) [][]byte
    SplitAfter slices s into all subslices after each instance of sep and
    returns a slice of those subslices. If sep is empty, SplitAfter splits after
    each UTF-8 sequence. It is equivalent to SplitAfterN with a count of -1.

func SplitAfterN(s, sep []byte, n int) [][]byte
    SplitAfterN slices s into subslices after each instance of sep and returns
    a slice of those subslices. If sep is empty, SplitAfterN splits after each
    UTF-8 sequence. The count determines the number of subslices to return:
      - n > 0: at most n subslices; the last subslice will be the unsplit
        remainder;
      - n == 0: the result is nil (zero subslices);
      - n < 0: all subslices.

func SplitAfterSeq(s, sep []byte) iter.Seq[[]byte]
    SplitAfterSeq returns an iterator over subslices of s split after each
    instance of sep. The iterator yields the same subslices that would be
    returned by SplitAfter(s, sep), but without constructing a new slice
    containing the subslices. It returns a single-use iterator.

func SplitN(s, sep []byte, n int) [][]byte
    SplitN slices s into subslices separated by sep and returns a slice of the
    subslices between those separators. If sep is empty, SplitN splits after
    each UTF-8 sequence. The count determines the number of subslices to return:
      - n > 0: at most n subslices; the last subslice will be the unsplit
        remainder;
      - n == 0: the result is nil (zero subslices);
      - n < 0: all subslices.

    To split around the first instance of a separator, see Cut.

func SplitSeq(s, sep []byte) iter.Seq[[]byte]
    SplitSeq returns an iterator over all subslices of s separated by sep.
    The iterator yields the same subslices that would be returned by Split(s,
    sep), but without constructing a new slice containing the subslices.
    It returns a single-use iterator.

func Title(s []byte) []byte
    Title treats s as UTF-8-encoded bytes and returns a copy with all Unicode
    letters that begin words mapped to their title case.

    Deprecated: The rule Title uses for word boundaries does not handle Unicode
    punctuation properly. Use golang.org/x/text/cases instead.

func ToLower(s []byte) []byte
    ToLower returns a copy of the byte slice s with all Unicode letters mapped
    to their lower case.

func ToLowerSpecial(c unicode.SpecialCase, s []byte) []byte
    ToLowerSpecial treats s as UTF-8-encoded bytes and returns a copy with
    all the Unicode letters mapped to their lower case, giving priority to the
    special casing rules.

func ToTitle(s []byte) []byte
    ToTitle treats s as UTF-8-encoded bytes and returns a copy with all the
    Unicode letters mapped to their title case.

func ToTitleSpecial(c unicode.SpecialCase, s []byte) []byte
    ToTitleSpecial treats s as UTF-8-encoded bytes and returns a copy with
    all the Unicode letters mapped to their title case, giving priority to the
    special casing rules.

func ToUpper(s []byte) []byte
    ToUpper returns a copy of the byte slice s with all Unicode letters mapped
    to their upper case.

func ToUpperSpecial(c unicode.SpecialCase, s []byte) []byte
    ToUpperSpecial treats s as UTF-8-encoded bytes and returns a copy with
    all the Unicode letters mapped to their upper case, giving priority to the
    special casing rules.

func ToValidUTF8(s, replacement []byte) []byte
    ToValidUTF8 treats s as UTF-8-encoded bytes and returns a copy with each run
    of bytes representing invalid UTF-8 replaced with the bytes in replacement,
    which may be empty.

func Trim(s []byte, cutset string) []byte
    Trim returns a subslice of s by slicing off all leading and trailing
    UTF-8-encoded code points contained in cutset.

func TrimFunc(s []byte, f func(r rune) bool) []byte
    TrimFunc returns a subslice of s by slicing off all leading and trailing
    UTF-8-encoded code points c that satisfy f(c).

func TrimLeft(s []byte, cutset string) []byte
    TrimLeft returns a subslice of s by slicing off all leading UTF-8-encoded
    code points contained in cutset.

func TrimLeftFunc(s []byte, f func(r rune) bool) []byte
    TrimLeftFunc treats s as UTF-8-encoded bytes and returns a subslice of s by
    slicing off all leading UTF-8-encoded code points c that satisfy f(c).

func TrimPrefix(s, prefix []byte) []byte
    TrimPrefix returns s without the provided leading prefix string. If s
    doesn't start with prefix, s is returned unchanged.

func TrimRight(s []byte, cutset string) []byte
    TrimRight returns a subslice of s by slicing off all trailing UTF-8-encoded
    code points that are contained in cutset.

func TrimRightFunc(s []byte, f func(r rune) bool) []byte
    TrimRightFunc returns a subslice of s by slicing off all trailing
    UTF-8-encoded code points c that satisfy f(c).

func TrimSpace(s []byte) []byte
    TrimSpace returns a subslice of s by slicing off all leading and trailing
    white space, as defined by Unicode.

func TrimSuffix(s, suffix []byte) []byte
    TrimSuffix returns s without the provided trailing suffix string. If s
    doesn't end with suffix, s is returned unchanged.


TYPES

type Buffer struct {
	// Has unexported fields.
}
    A Buffer is a variable-sized buffer of bytes with Buffer.Read and
    Buffer.Write methods. The zero value for Buffer is an empty buffer ready to
    use.

func NewBuffer(buf []byte) *Buffer
    NewBuffer creates and initializes a new Buffer using buf as its initial
    contents. The new Buffer takes ownership of buf, and the caller should not
    use buf after this call. NewBuffer is intended to prepare a Buffer to read
    existing data. It can also be used to set the initial size of the internal
    buffer for writing. To do that, buf should have the desired capacity but a
    length of zero.

    In most cases, new(Buffer) (or just declaring a Buffer variable) is
    sufficient to initialize a Buffer.

func NewBufferString(s string) *Buffer
    NewBufferString creates and initializes a new Buffer using string s as its
    initial contents. It is intended to prepare a buffer to read an existing
    string.

    In most cases, new(Buffer) (or just declaring a Buffer variable) is
    sufficient to initialize a Buffer.

func (b *Buffer) Available() int
    Available returns how many bytes are unused in the buffer.

func (b *Buffer) AvailableBuffer() []byte
    AvailableBuffer returns an empty buffer with b.Available() capacity. This
    buffer is intended to be appended to and passed to an immediately succeeding
    Buffer.Write call. The buffer is only valid until the next write operation
    on b.

func (b *Buffer) Bytes() []byte
    Bytes returns a slice of length b.Len() holding the unread portion of the
    buffer. The slice is valid for use only until the next buffer modification
    (that is, only until the next call to a method like Buffer.Read,
    Buffer.Write, Buffer.Reset, or Buffer.Truncate). The slice aliases the
    buffer content at least until the next buffer modification, so immediate
    changes to the slice will affect the result of future reads.

func (b *Buffer) Cap() int
    Cap returns the capacity of the buffer's underlying byte slice, that is,
    the total space allocated for the buffer's data.

func (b *Buffer) Grow(n int)
    Grow grows the buffer's capacity, if necessary, to guarantee space for
    another n bytes. After Grow(n), at least n bytes can be written to the
    buffer without another allocation. If n is negative, Grow will panic.
    If the buffer can't grow it will panic with ErrTooLarge.

func (b *Buffer) Len() int
    Len returns the number of bytes of the unread portion of the buffer; b.Len()
    == len(b.Bytes()).

func (b *Buffer) Next(n int) []byte
    Next returns a slice containing the next n bytes from the buffer,
    advancing the buffer as if the bytes had been returned by Buffer.Read. If
    there are fewer than n bytes in the buffer, Next returns the entire buffer.
    The slice is only valid until the next call to a read or write method.

func (b *Buffer) Peek(n int) ([]byte, error)
    Peek returns the next n bytes without advancing the buffer. If Peek returns
    fewer than n bytes, it also returns io.EOF. The slice is only valid until
    the next call to a read or write method. The slice aliases the buffer
    content at least until the next buffer modification, so immediate changes to
    the slice will affect the result of future reads.

func (b *Buffer) Read(p []byte) (n int, err error)
    Read reads the next len(p) bytes from the buffer or until the buffer is
    drained. The return value n is the number of bytes read. If the buffer has
    no data to return, err is io.EOF (unless len(p) is zero); otherwise it is
    nil.

func (b *Buffer) ReadByte() (byte, error)
    ReadByte reads and returns the next byte from the buffer. If no byte is
    available, it returns error io.EOF.

func (b *Buffer) ReadBytes(delim byte) (line []byte, err error)
    ReadBytes reads until the first occurrence of delim in the input,
    returning a slice containing the data up to and including the delimiter.
    If ReadBytes encounters an error before finding a delimiter, it returns the
    data read before the error and the error itself (often io.EOF). ReadBytes
    returns err != nil if and only if the returned data does not end in delim.

func (b *Buffer) ReadFrom(r io.Reader) (n int64, err error)
    ReadFrom reads data from r until EOF and appends it to the buffer, growing
    the buffer as needed. The return value n is the number of bytes read.
    Any error except io.EOF encountered during the read is also returned.
    If the buffer becomes too large, ReadFrom will panic with ErrTooLarge.

func (b *Buffer) ReadRune() (r rune, size int, err error)
    ReadRune reads and returns the next UTF-8-encoded Unicode code point from
    the buffer. If no bytes are available, the error returned is io.EOF. If the
    bytes are an erroneous UTF-8 encoding, it consumes one byte and returns
    U+FFFD, 1.

func (b *Buffer) ReadString(delim byte) (line string, err error)
    ReadString reads until the first occurrence of delim in the input,
    returning a string containing the data up to and including the delimiter.
    If ReadString encounters an error before finding a delimiter, it returns the
    data read before the error and the error itself (often io.EOF). ReadString
    returns err != nil if and only if the returned data does not end in delim.

func (b *Buffer) Reset()
    Reset resets the buffer to be empty, but it retains the underlying storage
    for use by future writes. Reset is the same as Buffer.Truncate(0).

func (b *Buffer) String() string
    String returns the contents of the unread portion of the buffer as a string.
    If the Buffer is a nil pointer, it returns "<nil>".

    To build strings more efficiently, see the strings.Builder type.

func (b *Buffer) Truncate(n int)
    Truncate discards all but the first n unread bytes from the buffer but
    continues to use the same allocated storage. It panics if n is negative or
    greater than the length of the buffer.

func (b *Buffer) UnreadByte() error
    UnreadByte unreads the last byte returned by the most recent successful
    read operation that read at least one byte. If a write has happened since
    the last read, if the last read returned an error, or if the read read zero
    bytes, UnreadByte returns an error.

func (b *Buffer) UnreadRune() error
    UnreadRune unreads the last rune returned by Buffer.ReadRune. If the
    most recent read or write operation on the buffer was not a successful
    Buffer.ReadRune, UnreadRune returns an error. (In this regard it is stricter
    than Buffer.UnreadByte, which will unread the last byte from any read
    operation.)

func (b *Buffer) Write(p []byte) (n int, err error)
    Write appends the contents of p to the buffer, growing the buffer as needed.
    The return value n is the length of p; err is always nil. If the buffer
    becomes too large, Write will panic with ErrTooLarge.

func (b *Buffer) WriteByte(c byte) error
    WriteByte appends the byte c to the buffer, growing the buffer as needed.
    The returned error is always nil, but is included to match bufio.Writer's
    WriteByte. If the buffer becomes too large, WriteByte will panic with
    ErrTooLarge.

func (b *Buffer) WriteRune(r rune) (n int, err error)
    WriteRune appends the UTF-8 encoding of Unicode code point r to the buffer,
    returning the number of bytes written and a nil error. The nil error is
    included to match bufio.Writer's WriteRune. The buffer is grown as needed;
    if it becomes too large, WriteRune will panic with ErrTooLarge.

func (b *Buffer) WriteString(s string) (n int, err error)
    WriteString appends the contents of s to the buffer, growing the buffer as
    needed. The return value n is the length of s; err is always nil. If the
    buffer becomes too large, WriteString will panic with ErrTooLarge.

func (b *Buffer) WriteTo(w io.Writer) (n int64, err error)
    WriteTo writes data to w until the buffer is drained or an error occurs. The
    return value n is the number of bytes written; it always fits into an int,
    but it is int64 to match the io.WriterTo interface. Any error encountered
    during the write is also returned.

type Reader struct {
	// Has unexported fields.
}
    A Reader implements the io.Reader, io.ReaderAt, io.WriterTo, io.Seeker,
    io.ByteScanner, and io.RuneScanner interfaces by reading from a byte slice.
    Unlike a Buffer, a Reader is read-only and supports seeking. The zero value
    for Reader operates like a Reader of an empty slice.

func NewReader(b []byte) *Reader
    NewReader returns a new Reader reading from b.

func (r *Reader) Len() int
    Len returns the number of bytes of the unread portion of the slice.

func (r *Reader) Read(b []byte) (n int, err error)
    Read implements the io.Reader interface.

func (r *Reader) ReadAt(b []byte, off int64) (n int, err error)
    ReadAt implements the io.ReaderAt interface.

func (r *Reader) ReadByte() (byte, error)
    ReadByte implements the io.ByteReader interface.

func (r *Reader) ReadRune() (ch rune, size int, err error)
    ReadRune implements the io.RuneReader interface.

func (r *Reader) Reset(b []byte)
    Reset resets the Reader to be reading from b.

func (r *Reader) Seek(offset int64, whence int) (int64, error)
    Seek implements the io.Seeker interface.

func (r *Reader) Size() int64
    Size returns the original length of the underlying byte slice. Size is
    the number of bytes available for reading via Reader.ReadAt. The result is
    unaffected by any method calls except Reader.Reset.

func (r *Reader) UnreadByte() error
    UnreadByte complements Reader.ReadByte in implementing the io.ByteScanner
    interface.

func (r *Reader) UnreadRune() error
    UnreadRune complements Reader.ReadRune in implementing the io.RuneScanner
    interface.

func (r *Reader) WriteTo(w io.Writer) (n int64, err error)
    WriteTo implements the io.WriterTo interface.
```

## io

```go
package io // import "io"

Package io provides basic interfaces to I/O primitives. Its primary job is to
wrap existing implementations of such primitives, such as those in package os,
into shared public interfaces that abstract the functionality, plus some other
related primitives.

Because these interfaces and primitives wrap lower-level operations with various
implementations, unless otherwise informed clients should not assume they are
safe for parallel execution.

CONSTANTS

const (
	SeekStart   = 0 // seek relative to the origin of the file
	SeekCurrent = 1 // seek relative to the current offset
	SeekEnd     = 2 // seek relative to the end
)
    Seek whence values.


VARIABLES

var EOF = errors.New("EOF")
    EOF is the error returned by Read when no more input is available. (Read
    must return EOF itself, not an error wrapping EOF, because callers will test
    for EOF using ==.) Functions should return EOF only to signal a graceful
    end of input. If the EOF occurs unexpectedly in a structured data stream,
    the appropriate error is either ErrUnexpectedEOF or some other error giving
    more detail.

var ErrClosedPipe = errors.New("io: read/write on closed pipe")
    ErrClosedPipe is the error used for read or write operations on a closed
    pipe.

var ErrNoProgress = errors.New("multiple Read calls return no data or error")
    ErrNoProgress is returned by some clients of a Reader when many calls to
    Read have failed to return any data or error, usually the sign of a broken
    Reader implementation.

var ErrShortBuffer = errors.New("short buffer")
    ErrShortBuffer means that a read required a longer buffer than was provided.

var ErrShortWrite = errors.New("short write")
    ErrShortWrite means that a write accepted fewer bytes than requested but
    failed to return an explicit error.

var ErrUnexpectedEOF = errors.New("unexpected EOF")
    ErrUnexpectedEOF means that EOF was encountered in the middle of reading a
    fixed-size block or data structure.


FUNCTIONS

func Copy(dst Writer, src Reader) (written int64, err error)
    Copy copies from src to dst until either EOF is reached on src or an
    error occurs. It returns the number of bytes copied and the first error
    encountered while copying, if any.

    A successful Copy returns err == nil, not err == EOF. Because Copy is
    defined to read from src until EOF, it does not treat an EOF from Read as an
    error to be reported.

    If src implements WriterTo, the copy is implemented by calling
    src.WriteTo(dst). Otherwise, if dst implements ReaderFrom, the copy is
    implemented by calling dst.ReadFrom(src).

func CopyBuffer(dst Writer, src Reader, buf []byte) (written int64, err error)
    CopyBuffer is identical to Copy except that it stages through the provided
    buffer (if one is required) rather than allocating a temporary one.
    If buf is nil, one is allocated; otherwise if it has zero length, CopyBuffer
    panics.

    If either src implements WriterTo or dst implements ReaderFrom, buf will not
    be used to perform the copy.

func CopyN(dst Writer, src Reader, n int64) (written int64, err error)
    CopyN copies n bytes (or until an error) from src to dst. It returns the
    number of bytes copied and the earliest error encountered while copying.
    On return, written == n if and only if err == nil.

    If dst implements ReaderFrom, the copy is implemented using it.

func Pipe() (*PipeReader, *PipeWriter)
    Pipe creates a synchronous in-memory pipe. It can be used to connect code
    expecting an io.Reader with code expecting an io.Writer.

    Reads and Writes on the pipe are matched one to one except when multiple
    Reads are needed to consume a single Write. That is, each Write to the
    PipeWriter blocks until it has satisfied one or more Reads from the
    PipeReader that fully consume the written data. The data is copied directly
    from the Write to the corresponding Read (or Reads); there is no internal
    buffering.

    It is safe to call Read and Write in parallel with each other or with Close.
    Parallel calls to Read and parallel calls to Write are also safe: the
    individual calls will be gated sequentially.

func ReadAll(r Reader) ([]byte, error)
    ReadAll reads from r until an error or EOF and returns the data it read.
    A successful call returns err == nil, not err == EOF. Because ReadAll is
    defined to read from src until EOF, it does not treat an EOF from Read as an
    error to be reported.

func ReadAtLeast(r Reader, buf []byte, min int) (n int, err error)
    ReadAtLeast reads from r into buf until it has read at least min bytes.
    It returns the number of bytes copied and an error if fewer bytes were read.
    The error is EOF only if no bytes were read. If an EOF happens after
    reading fewer than min bytes, ReadAtLeast returns ErrUnexpectedEOF. If min
    is greater than the length of buf, ReadAtLeast returns ErrShortBuffer.
    On return, n >= min if and only if err == nil. If r returns an error having
    read at least min bytes, the error is dropped.

func ReadFull(r Reader, buf []byte) (n int, err error)
    ReadFull reads exactly len(buf) bytes from r into buf. It returns the number
    of bytes copied and an error if fewer bytes were read. The error is EOF only
    if no bytes were read. If an EOF happens after reading some but not all the
    bytes, ReadFull returns ErrUnexpectedEOF. On return, n == len(buf) if and
    only if err == nil. If r returns an error having read at least len(buf)
    bytes, the error is dropped.

func WriteString(w Writer, s string) (n int, err error)
    WriteString writes the contents of the string s to w, which accepts a slice
    of bytes. If w implements StringWriter, StringWriter.WriteString is invoked
    directly. Otherwise, Writer.Write is called exactly once.


TYPES

type ByteReader interface {
	ReadByte() (byte, error)
}
    ByteReader is the interface that wraps the ReadByte method.

    ReadByte reads and returns the next byte from the input or any error
    encountered. If ReadByte returns an error, no input byte was consumed,
    and the returned byte value is undefined.

    ReadByte provides an efficient interface for byte-at-time processing.
    A Reader that does not implement ByteReader can be wrapped using
    bufio.NewReader to add this method.

type ByteScanner interface {
	ByteReader
	UnreadByte() error
}
    ByteScanner is the interface that adds the UnreadByte method to the basic
    ReadByte method.

    UnreadByte causes the next call to ReadByte to return the last byte read.
    If the last operation was not a successful call to ReadByte, UnreadByte
    may return an error, unread the last byte read (or the byte prior to the
    last-unread byte), or (in implementations that support the Seeker interface)
    seek to one byte before the current offset.

type ByteWriter interface {
	WriteByte(c byte) error
}
    ByteWriter is the interface that wraps the WriteByte method.

type Closer interface {
	Close() error
}
    Closer is the interface that wraps the basic Close method.

    The behavior of Close after the first call is undefined. Specific
    implementations may document their own behavior.

type LimitedReader struct {
	R Reader // underlying reader
	N int64  // max bytes remaining
}
    A LimitedReader reads from R but limits the amount of data returned to just
    N bytes. Each call to Read updates N to reflect the new amount remaining.
    Read returns EOF when N <= 0 or when the underlying R returns EOF.

func (l *LimitedReader) Read(p []byte) (n int, err error)

type OffsetWriter struct {
	// Has unexported fields.
}
    An OffsetWriter maps writes at offset base to offset base+off in the
    underlying writer.

func NewOffsetWriter(w WriterAt, off int64) *OffsetWriter
    NewOffsetWriter returns an OffsetWriter that writes to w starting at offset
    off.

func (o *OffsetWriter) Seek(offset int64, whence int) (int64, error)

func (o *OffsetWriter) Write(p []byte) (n int, err error)

func (o *OffsetWriter) WriteAt(p []byte, off int64) (n int, err error)

type PipeReader struct {
	// Has unexported fields.
}
    A PipeReader is the read half of a pipe.

func (r *PipeReader) Close() error
    Close closes the reader; subsequent writes to the write half of the pipe
    will return the error ErrClosedPipe.

func (r *PipeReader) CloseWithError(err error) error
    CloseWithError closes the reader; subsequent writes to the write half of the
    pipe will return the error err.

    CloseWithError never overwrites the previous error if it exists and always
    returns nil.

func (r *PipeReader) Read(data []byte) (n int, err error)
    Read implements the standard Read interface: it reads data from the pipe,
    blocking until a writer arrives or the write end is closed. If the write
    end is closed with an error, that error is returned as err; otherwise err is
    EOF.

type PipeWriter struct {
	// Has unexported fields.
}
    A PipeWriter is the write half of a pipe.

func (w *PipeWriter) Close() error
    Close closes the writer; subsequent reads from the read half of the pipe
    will return no bytes and EOF.

func (w *PipeWriter) CloseWithError(err error) error
    CloseWithError closes the writer; subsequent reads from the read half of the
    pipe will return no bytes and the error err, or EOF if err is nil.

    CloseWithError never overwrites the previous error if it exists and always
    returns nil.

func (w *PipeWriter) Write(data []byte) (n int, err error)
    Write implements the standard Write interface: it writes data to the pipe,
    blocking until one or more readers have consumed all the data or the read
    end is closed. If the read end is closed with an error, that err is returned
    as err; otherwise err is ErrClosedPipe.

type ReadCloser interface {
	Reader
	Closer
}
    ReadCloser is the interface that groups the basic Read and Close methods.

func NopCloser(r Reader) ReadCloser
    NopCloser returns a ReadCloser with a no-op Close method wrapping the
    provided Reader r. If r implements WriterTo, the returned ReadCloser will
    implement WriterTo by forwarding calls to r.

type ReadSeekCloser interface {
	Reader
	Seeker
	Closer
}
    ReadSeekCloser is the interface that groups the basic Read, Seek and Close
    methods.

type ReadSeeker interface {
	Reader
	Seeker
}
    ReadSeeker is the interface that groups the basic Read and Seek methods.

type ReadWriteCloser interface {
	Reader
	Writer
	Closer
}
    ReadWriteCloser is the interface that groups the basic Read, Write and Close
    methods.

type ReadWriteSeeker interface {
	Reader
	Writer
	Seeker
}
    ReadWriteSeeker is the interface that groups the basic Read, Write and Seek
    methods.

type ReadWriter interface {
	Reader
	Writer
}
    ReadWriter is the interface that groups the basic Read and Write methods.

type Reader interface {
	Read(p []byte) (n int, err error)
}
    Reader is the interface that wraps the basic Read method.

    Read reads up to len(p) bytes into p. It returns the number of bytes read (0
    <= n <= len(p)) and any error encountered. Even if Read returns n < len(p),
    it may use all of p as scratch space during the call. If some data is
    available but not len(p) bytes, Read conventionally returns what is
    available instead of waiting for more.

    When Read encounters an error or end-of-file condition after successfully
    reading n > 0 bytes, it returns the number of bytes read. It may return the
    (non-nil) error from the same call or return the error (and n == 0) from a
    subsequent call. An instance of this general case is that a Reader returning
    a non-zero number of bytes at the end of the input stream may return either
    err == EOF or err == nil. The next Read should return 0, EOF.

    Callers should always process the n > 0 bytes returned before considering
    the error err. Doing so correctly handles I/O errors that happen after
    reading some bytes and also both of the allowed EOF behaviors.

    If len(p) == 0, Read should always return n == 0. It may return a non-nil
    error if some error condition is known, such as EOF.

    Implementations of Read are discouraged from returning a zero byte count
    with a nil error, except when len(p) == 0. Callers should treat a return
    of 0 and nil as indicating that nothing happened; in particular it does not
    indicate EOF.

    Implementations must not retain p.

func LimitReader(r Reader, n int64) Reader
    LimitReader returns a Reader that reads from r but stops with EOF after n
    bytes. The underlying implementation is a *LimitedReader.

func MultiReader(readers ...Reader) Reader
    MultiReader returns a Reader that's the logical concatenation of the
    provided input readers. They're read sequentially. Once all inputs have
    returned EOF, Read will return EOF. If any of the readers return a non-nil,
    non-EOF error, Read will return that error.

func TeeReader(r Reader, w Writer) Reader
    TeeReader returns a Reader that writes to w what it reads from r. All reads
    from r performed through it are matched with corresponding writes to w.
    There is no internal buffering - the write must complete before the read
    completes. Any error encountered while writing is reported as a read error.

type ReaderAt interface {
	ReadAt(p []byte, off int64) (n int, err error)
}
    ReaderAt is the interface that wraps the basic ReadAt method.

    ReadAt reads len(p) bytes into p starting at offset off in the underlying
    input source. It returns the number of bytes read (0 <= n <= len(p)) and any
    error encountered.

    When ReadAt returns n < len(p), it returns a non-nil error explaining why
    more bytes were not returned. In this respect, ReadAt is stricter than Read.

    Even if ReadAt returns n < len(p), it may use all of p as scratch
    space during the call. If some data is available but not len(p) bytes,
    ReadAt blocks until either all the data is available or an error occurs.
    In this respect ReadAt is different from Read.

    If the n = len(p) bytes returned by ReadAt are at the end of the input
    source, ReadAt may return either err == EOF or err == nil.

    If ReadAt is reading from an input source with a seek offset, ReadAt should
    not affect nor be affected by the underlying seek offset.

    Clients of ReadAt can execute parallel ReadAt calls on the same input
    source.

    Implementations must not retain p.

type ReaderFrom interface {
	ReadFrom(r Reader) (n int64, err error)
}
    ReaderFrom is the interface that wraps the ReadFrom method.

    ReadFrom reads data from r until EOF or error. The return value n is the
    number of bytes read. Any error except EOF encountered during the read is
    also returned.

    The Copy function uses ReaderFrom if available.

type RuneReader interface {
	ReadRune() (r rune, size int, err error)
}
    RuneReader is the interface that wraps the ReadRune method.

    ReadRune reads a single encoded Unicode character and returns the rune and
    its size in bytes. If no character is available, err will be set.

type RuneScanner interface {
	RuneReader
	UnreadRune() error
}
    RuneScanner is the interface that adds the UnreadRune method to the basic
    ReadRune method.

    UnreadRune causes the next call to ReadRune to return the last rune read.
    If the last operation was not a successful call to ReadRune, UnreadRune
    may return an error, unread the last rune read (or the rune prior to the
    last-unread rune), or (in implementations that support the Seeker interface)
    seek to the start of the rune before the current offset.

type SectionReader struct {
	// Has unexported fields.
}
    SectionReader implements Read, Seek, and ReadAt on a section of an
    underlying ReaderAt.

func NewSectionReader(r ReaderAt, off int64, n int64) *SectionReader
    NewSectionReader returns a SectionReader that reads from r starting at
    offset off and stops with EOF after n bytes.

func (s *SectionReader) Outer() (r ReaderAt, off int64, n int64)
    Outer returns the underlying ReaderAt and offsets for the section.

    The returned values are the same that were passed to NewSectionReader when
    the SectionReader was created.

func (s *SectionReader) Read(p []byte) (n int, err error)

func (s *SectionReader) ReadAt(p []byte, off int64) (n int, err error)

func (s *SectionReader) Seek(offset int64, whence int) (int64, error)

func (s *SectionReader) Size() int64
    Size returns the size of the section in bytes.

type Seeker interface {
	Seek(offset int64, whence int) (int64, error)
}
    Seeker is the interface that wraps the basic Seek method.

    Seek sets the offset for the next Read or Write to offset, interpreted
    according to whence: SeekStart means relative to the start of the file,
    SeekCurrent means relative to the current offset, and SeekEnd means relative
    to the end (for example, offset = -2 specifies the penultimate byte of the
    file). Seek returns the new offset relative to the start of the file or an
    error, if any.

    Seeking to an offset before the start of the file is an error. Seeking
    to any positive offset may be allowed, but if the new offset exceeds the
    size of the underlying object the behavior of subsequent I/O operations is
    implementation-dependent.

type StringWriter interface {
	WriteString(s string) (n int, err error)
}
    StringWriter is the interface that wraps the WriteString method.

type WriteCloser interface {
	Writer
	Closer
}
    WriteCloser is the interface that groups the basic Write and Close methods.

type WriteSeeker interface {
	Writer
	Seeker
}
    WriteSeeker is the interface that groups the basic Write and Seek methods.

type Writer interface {
	Write(p []byte) (n int, err error)
}
    Writer is the interface that wraps the basic Write method.

    Write writes len(p) bytes from p to the underlying data stream. It returns
    the number of bytes written from p (0 <= n <= len(p)) and any error
    encountered that caused the write to stop early. Write must return a non-nil
    error if it returns n < len(p). Write must not modify the slice data,
    even temporarily.

    Implementations must not retain p.

var Discard Writer = discard{}
    Discard is a Writer on which all Write calls succeed without doing anything.

func MultiWriter(writers ...Writer) Writer
    MultiWriter creates a writer that duplicates its writes to all the provided
    writers, similar to the Unix tee(1) command.

    Each write is written to each listed writer, one at a time. If a listed
    writer returns an error, that overall write operation stops and returns the
    error; it does not continue down the list.

type WriterAt interface {
	WriteAt(p []byte, off int64) (n int, err error)
}
    WriterAt is the interface that wraps the basic WriteAt method.

    WriteAt writes len(p) bytes from p to the underlying data stream at offset
    off. It returns the number of bytes written from p (0 <= n <= len(p)) and
    any error encountered that caused the write to stop early. WriteAt must
    return a non-nil error if it returns n < len(p).

    If WriteAt is writing to a destination with a seek offset, WriteAt should
    not affect nor be affected by the underlying seek offset.

    Clients of WriteAt can execute parallel WriteAt calls on the same
    destination if the ranges do not overlap.

    Implementations must not retain p.

type WriterTo interface {
	WriteTo(w Writer) (n int64, err error)
}
    WriterTo is the interface that wraps the WriteTo method.

    WriteTo writes data to w until there's no more data to write or when an
    error occurs. The return value n is the number of bytes written. Any error
    encountered during the write is also returned.

    The Copy function uses WriterTo if available.
```

## bufio

```go
package bufio // import "bufio"

Package bufio implements buffered I/O. It wraps an io.Reader or io.Writer
object, creating another object (Reader or Writer) that also implements the
interface but provides buffering and some help for textual I/O.

CONSTANTS

const (
	// MaxScanTokenSize is the maximum size used to buffer a token
	// unless the user provides an explicit buffer with [Scanner.Buffer].
	// The actual maximum token size may be smaller as the buffer
	// may need to include, for instance, a newline.
	MaxScanTokenSize = 64 * 1024
)

VARIABLES

var (
	ErrInvalidUnreadByte = errors.New("bufio: invalid use of UnreadByte")
	ErrInvalidUnreadRune = errors.New("bufio: invalid use of UnreadRune")
	ErrBufferFull        = errors.New("bufio: buffer full")
	ErrNegativeCount     = errors.New("bufio: negative count")
)
var (
	ErrTooLong         = errors.New("bufio.Scanner: token too long")
	ErrNegativeAdvance = errors.New("bufio.Scanner: SplitFunc returns negative advance count")
	ErrAdvanceTooFar   = errors.New("bufio.Scanner: SplitFunc returns advance count beyond input")
	ErrBadReadCount    = errors.New("bufio.Scanner: Read returned impossible count")
)
    Errors returned by Scanner.

var ErrFinalToken = errors.New("final token")
    ErrFinalToken is a special sentinel error value. It is intended to be
    returned by a Split function to indicate that the scanning should stop
    with no error. If the token being delivered with this error is not nil,
    the token is the last token.

    The value is useful to stop processing early or when it is necessary to
    deliver a final empty token (which is different from a nil token). One could
    achieve the same behavior with a custom error value but providing one here
    is tidier. See the emptyFinalToken example for a use of this value.


FUNCTIONS

func ScanBytes(data []byte, atEOF bool) (advance int, token []byte, err error)
    ScanBytes is a split function for a Scanner that returns each byte as a
    token.

func ScanLines(data []byte, atEOF bool) (advance int, token []byte, err error)
    ScanLines is a split function for a Scanner that returns each line of text,
    stripped of any trailing end-of-line marker. The returned line may be empty.
    The end-of-line marker is one optional carriage return followed by one
    mandatory newline. In regular expression notation, it is `\r?\n`. The last
    non-empty line of input will be returned even if it has no newline.

func ScanRunes(data []byte, atEOF bool) (advance int, token []byte, err error)
    ScanRunes is a split function for a Scanner that returns each UTF-8-encoded
    rune as a token. The sequence of runes returned is equivalent to that
    from a range loop over the input as a string, which means that erroneous
    UTF-8 encodings translate to U+FFFD = "\xef\xbf\xbd". Because of the Scan
    interface, this makes it impossible for the client to distinguish correctly
    encoded replacement runes from encoding errors.

func ScanWords(data []byte, atEOF bool) (advance int, token []byte, err error)
    ScanWords is a split function for a Scanner that returns each
    space-separated word of text, with surrounding spaces deleted. It will never
    return an empty string. The definition of space is set by unicode.IsSpace.


TYPES

type ReadWriter struct {
	*Reader
	*Writer
}
    ReadWriter stores pointers to a Reader and a Writer. It implements
    io.ReadWriter.

func NewReadWriter(r *Reader, w *Writer) *ReadWriter
    NewReadWriter allocates a new ReadWriter that dispatches to r and w.

type Reader struct {
	// Has unexported fields.
}
    Reader implements buffering for an io.Reader object. A new Reader is created
    by calling NewReader or NewReaderSize; alternatively the zero value of a
    Reader may be used after calling Reader.Reset on it.

func NewReader(rd io.Reader) *Reader
    NewReader returns a new Reader whose buffer has the default size.

func NewReaderSize(rd io.Reader, size int) *Reader
    NewReaderSize returns a new Reader whose buffer has at least the specified
    size. If the argument io.Reader is already a Reader with large enough size,
    it returns the underlying Reader.

func (b *Reader) Buffered() int
    Buffered returns the number of bytes that can be read from the current
    buffer.

func (b *Reader) Discard(n int) (discarded int, err error)
    Discard skips the next n bytes, returning the number of bytes discarded.

    If Discard skips fewer than n bytes, it also returns an error. If 0 <= n
    <= b.Buffered(), Discard is guaranteed to succeed without reading from the
    underlying io.Reader.

func (b *Reader) Peek(n int) ([]byte, error)
    Peek returns the next n bytes without advancing the reader. The bytes stop
    being valid at the next read call. If necessary, Peek will read more bytes
    into the buffer in order to make n bytes available. If Peek returns fewer
    than n bytes, it also returns an error explaining why the read is short.
    The error is ErrBufferFull if n is larger than b's buffer size.

    Calling Peek prevents a Reader.UnreadByte or Reader.UnreadRune call from
    succeeding until the next read operation.

func (b *Reader) Read(p []byte) (n int, err error)
    Read reads data into p. It returns the number of bytes read into p.
    The bytes are taken from at most one Read on the underlying Reader, hence n
    may be less than len(p). To read exactly len(p) bytes, use io.ReadFull(b,
    p). If the underlying Reader can return a non-zero count with io.EOF,
    then this Read method can do so as well; see the io.Reader docs.

func (b *Reader) ReadByte() (byte, error)
    ReadByte reads and returns a single byte. If no byte is available, returns
    an error.

func (b *Reader) ReadBytes(delim byte) ([]byte, error)
    ReadBytes reads until the first occurrence of delim in the input,
    returning a slice containing the data up to and including the delimiter.
    If ReadBytes encounters an error before finding a delimiter, it returns the
    data read before the error and the error itself (often io.EOF). ReadBytes
    returns err != nil if and only if the returned data does not end in delim.
    For simple uses, a Scanner may be more convenient.

func (b *Reader) ReadLine() (line []byte, isPrefix bool, err error)
    ReadLine is a low-level line-reading primitive. Most callers should use
    Reader.ReadBytes('\n') or Reader.ReadString('\n') instead or use a Scanner.

    ReadLine tries to return a single line, not including the end-of-line bytes.
    If the line was too long for the buffer then isPrefix is set and the
    beginning of the line is returned. The rest of the line will be returned
    from future calls. isPrefix will be false when returning the last fragment
    of the line. The returned buffer is only valid until the next call to
    ReadLine. ReadLine either returns a non-nil line or it returns an error,
    never both.

    The text returned from ReadLine does not include the line end ("\r\n" or
    "\n"). No indication or error is given if the input ends without a final
    line end. Calling Reader.UnreadByte after ReadLine will always unread the
    last byte read (possibly a character belonging to the line end) even if that
    byte is not part of the line returned by ReadLine.

func (b *Reader) ReadRune() (r rune, size int, err error)
    ReadRune reads a single UTF-8 encoded Unicode character and returns the rune
    and its size in bytes. If the encoded rune is invalid, it consumes one byte
    and returns unicode.ReplacementChar (U+FFFD) with a size of 1.

func (b *Reader) ReadSlice(delim byte) (line []byte, err error)
    ReadSlice reads until the first occurrence of delim in the input, returning
    a slice pointing at the bytes in the buffer. The bytes stop being valid at
    the next read. If ReadSlice encounters an error before finding a delimiter,
    it returns all the data in the buffer and the error itself (often io.EOF).
    ReadSlice fails with error ErrBufferFull if the buffer fills without a
    delim. Because the data returned from ReadSlice will be overwritten by the
    next I/O operation, most clients should use Reader.ReadBytes or ReadString
    instead. ReadSlice returns err != nil if and only if line does not end in
    delim.

func (b *Reader) ReadString(delim byte) (string, error)
    ReadString reads until the first occurrence of delim in the input,
    returning a string containing the data up to and including the delimiter.
    If ReadString encounters an error before finding a delimiter, it returns the
    data read before the error and the error itself (often io.EOF). ReadString
    returns err != nil if and only if the returned data does not end in delim.
    For simple uses, a Scanner may be more convenient.

func (b *Reader) Reset(r io.Reader)
    Reset discards any buffered data, resets all state, and switches the
    buffered reader to read from r. Calling Reset on the zero value of Reader
    initializes the internal buffer to the default size. Calling b.Reset(b)
    (that is, resetting a Reader to itself) does nothing.

func (b *Reader) Size() int
    Size returns the size of the underlying buffer in bytes.

func (b *Reader) UnreadByte() error
    UnreadByte unreads the last byte. Only the most recently read byte can be
    unread.

    UnreadByte returns an error if the most recent method called on the
    Reader was not a read operation. Notably, Reader.Peek, Reader.Discard,
    and Reader.WriteTo are not considered read operations.

func (b *Reader) UnreadRune() error
    UnreadRune unreads the last rune. If the most recent method called on the
    Reader was not a Reader.ReadRune, Reader.UnreadRune returns an error.
    (In this regard it is stricter than Reader.UnreadByte, which will unread the
    last byte from any read operation.)

func (b *Reader) WriteTo(w io.Writer) (n int64, err error)
    WriteTo implements io.WriterTo. This may make multiple calls to the
    Reader.Read method of the underlying Reader. If the underlying reader
    supports the Reader.WriteTo method, this calls the underlying Reader.WriteTo
    without buffering.

type Scanner struct {
	// Has unexported fields.
}
    Scanner provides a convenient interface for reading data such as a file
    of newline-delimited lines of text. Successive calls to the Scanner.Scan
    method will step through the 'tokens' of a file, skipping the bytes between
    the tokens. The specification of a token is defined by a split function
    of type SplitFunc; the default split function breaks the input into lines
    with line termination stripped. Scanner.Split functions are defined in
    this package for scanning a file into lines, bytes, UTF-8-encoded runes,
    and space-delimited words. The client may instead provide a custom split
    function.

    Scanning stops unrecoverably at EOF, the first I/O error, or a token too
    large to fit in the Scanner.Buffer. When a scan stops, the reader may
    have advanced arbitrarily far past the last token. Programs that need more
    control over error handling or large tokens, or must run sequential scans on
    a reader, should use bufio.Reader instead.

func NewScanner(r io.Reader) *Scanner
    NewScanner returns a new Scanner to read from r. The split function defaults
    to ScanLines.

func (s *Scanner) Buffer(buf []byte, max int)
    Buffer controls memory allocation by the Scanner. It sets the initial buffer
    to use when scanning and the maximum size of buffer that may be allocated
    during scanning. The contents of the buffer are ignored.

    The maximum token size must be less than the larger of max and cap(buf).
    If max <= cap(buf), Scanner.Scan will use this buffer only and do no
    allocation.

    By default, Scanner.Scan uses an internal buffer and sets the maximum token
    size to MaxScanTokenSize.

    Buffer panics if it is called after scanning has started.

func (s *Scanner) Bytes() []byte
    Bytes returns the most recent token generated by a call to Scanner.Scan. The
    underlying array may point to data that will be overwritten by a subsequent
    call to Scan. It does no allocation.

func (s *Scanner) Err() error
    Err returns the first non-EOF error that was encountered by the Scanner.

func (s *Scanner) Scan() bool
    Scan advances the Scanner to the next token, which will then be available
    through the Scanner.Bytes or Scanner.Text method. It returns false when
    there are no more tokens, either by reaching the end of the input or
    an error. After Scan returns false, the Scanner.Err method will return
    any error that occurred during scanning, except that if it was io.EOF,
    Scanner.Err will return nil. Scan panics if the split function returns too
    many empty tokens without advancing the input. This is a common error mode
    for scanners.

func (s *Scanner) Split(split SplitFunc)
    Split sets the split function for the Scanner. The default split function is
    ScanLines.

    Split panics if it is called after scanning has started.

func (s *Scanner) Text() string
    Text returns the most recent token generated by a call to Scanner.Scan as a
    newly allocated string holding its bytes.

type SplitFunc func(data []byte, atEOF bool) (advance int, token []byte, err error)
    SplitFunc is the signature of the split function used to tokenize the input.
    The arguments are an initial substring of the remaining unprocessed data and
    a flag, atEOF, that reports whether the Reader has no more data to give.
    The return values are the number of bytes to advance the input and the next
    token to return to the user, if any, plus an error, if any.

    Scanning stops if the function returns an error, in which case some of the
    input may be discarded. If that error is ErrFinalToken, scanning stops with
    no error. A non-nil token delivered with ErrFinalToken will be the last
    token, and a nil token with ErrFinalToken immediately stops the scanning.

    Otherwise, the Scanner advances the input. If the token is not nil,
    the Scanner returns it to the user. If the token is nil, the Scanner reads
    more data and continues scanning; if there is no more data--if atEOF was
    true--the Scanner returns. If the data does not yet hold a complete token,
    for instance if it has no newline while scanning lines, a SplitFunc can
    return (0, nil, nil) to signal the Scanner to read more data into the slice
    and try again with a longer slice starting at the same point in the input.

    The function is never called with an empty data slice unless atEOF is true.
    If atEOF is true, however, data may be non-empty and, as always, holds
    unprocessed text.

type Writer struct {
	// Has unexported fields.
}
    Writer implements buffering for an io.Writer object. If an error occurs
    writing to a Writer, no more data will be accepted and all subsequent
    writes, and Writer.Flush, will return the error. After all data has been
    written, the client should call the Writer.Flush method to guarantee all
    data has been forwarded to the underlying io.Writer.

func NewWriter(w io.Writer) *Writer
    NewWriter returns a new Writer whose buffer has the default size.
    If the argument io.Writer is already a Writer with large enough buffer size,
    it returns the underlying Writer.

func NewWriterSize(w io.Writer, size int) *Writer
    NewWriterSize returns a new Writer whose buffer has at least the specified
    size. If the argument io.Writer is already a Writer with large enough size,
    it returns the underlying Writer.

func (b *Writer) Available() int
    Available returns how many bytes are unused in the buffer.

func (b *Writer) AvailableBuffer() []byte
    AvailableBuffer returns an empty buffer with b.Available() capacity. This
    buffer is intended to be appended to and passed to an immediately succeeding
    Writer.Write call. The buffer is only valid until the next write operation
    on b.

func (b *Writer) Buffered() int
    Buffered returns the number of bytes that have been written into the current
    buffer.

func (b *Writer) Flush() error
    Flush writes any buffered data to the underlying io.Writer.

func (b *Writer) ReadFrom(r io.Reader) (n int64, err error)
    ReadFrom implements io.ReaderFrom. If the underlying writer supports the
    ReadFrom method, this calls the underlying ReadFrom. If there is buffered
    data and an underlying ReadFrom, this fills the buffer and writes it before
    calling ReadFrom.

func (b *Writer) Reset(w io.Writer)
    Reset discards any unflushed buffered data, clears any error, and resets
    b to write its output to w. Calling Reset on the zero value of Writer
    initializes the internal buffer to the default size. Calling w.Reset(w)
    (that is, resetting a Writer to itself) does nothing.

func (b *Writer) Size() int
    Size returns the size of the underlying buffer in bytes.

func (b *Writer) Write(p []byte) (nn int, err error)
    Write writes the contents of p into the buffer. It returns the number of
    bytes written. If nn < len(p), it also returns an error explaining why the
    write is short.

func (b *Writer) WriteByte(c byte) error
    WriteByte writes a single byte.

func (b *Writer) WriteRune(r rune) (size int, err error)
    WriteRune writes a single Unicode code point, returning the number of bytes
    written and any error.

func (b *Writer) WriteString(s string) (int, error)
    WriteString writes a string. It returns the number of bytes written. If the
    count is less than len(s), it also returns an error explaining why the write
    is short.
```

## os

```go
package os // import "os"

Package os provides a platform-independent interface to operating system
functionality. The design is Unix-like, although the error handling is Go-like;
failing calls return values of type error rather than error numbers. Often, more
information is available within the error. For example, if a call that takes a
file name fails, such as Open or Stat, the error will include the failing file
name when printed and will be of type *PathError, which may be unpacked for more
information.

The os interface is intended to be uniform across all operating systems.
Features not generally available appear in the system-specific package syscall.

Here is a simple example, opening a file and reading some of it.

    file, err := os.Open("file.go") // For read access.
    if err != nil {
    	log.Fatal(err)
    }

If the open fails, the error string will be self-explanatory, like

    open file.go: no such file or directory

The file's data can then be read into a slice of bytes. Read and Write take
their byte counts from the length of the argument slice.

    data := make([]byte, 100)
    count, err := file.Read(data)
    if err != nil {
    	log.Fatal(err)
    }
    fmt.Printf("read %d bytes: %q\n", count, data[:count])

# Concurrency

The methods of File correspond to file system operations. All are safe for
concurrent use. The maximum number of concurrent operations on a File may be
limited by the OS or the system. The number should be high, but exceeding it may
degrade performance or cause other issues.

CONSTANTS

const (
	// Exactly one of O_RDONLY, O_WRONLY, or O_RDWR must be specified.
	O_RDONLY int = syscall.O_RDONLY // open the file read-only.
	O_WRONLY int = syscall.O_WRONLY // open the file write-only.
	O_RDWR   int = syscall.O_RDWR   // open the file read-write.
	// The remaining values may be or'ed in to control behavior.
	O_APPEND int = syscall.O_APPEND // append data to the file when writing.
	O_CREATE int = syscall.O_CREAT  // create a new file if none exists.
	O_EXCL   int = syscall.O_EXCL   // used with O_CREATE, file must not exist.
	O_SYNC   int = syscall.O_SYNC   // open for synchronous I/O.
	O_TRUNC  int = syscall.O_TRUNC  // truncate regular writable file when opened.
)
    Flags to OpenFile wrapping those of the underlying system. Not all flags may
    be implemented on a given system.

const (
	SEEK_SET int = 0 // seek relative to the origin of the file
	SEEK_CUR int = 1 // seek relative to the current offset
	SEEK_END int = 2 // seek relative to the end
)
    Seek whence values.

    Deprecated: Use io.SeekStart, io.SeekCurrent, and io.SeekEnd.

const (
	PathSeparator     = '/' // OS-specific path separator
	PathListSeparator = ':' // OS-specific path list separator
)
const (
	// The single letters are the abbreviations
	// used by the String method's formatting.
	ModeDir        = fs.ModeDir        // d: is a directory
	ModeAppend     = fs.ModeAppend     // a: append-only
	ModeExclusive  = fs.ModeExclusive  // l: exclusive use
	ModeTemporary  = fs.ModeTemporary  // T: temporary file; Plan 9 only
	ModeSymlink    = fs.ModeSymlink    // L: symbolic link
	ModeDevice     = fs.ModeDevice     // D: device file
	ModeNamedPipe  = fs.ModeNamedPipe  // p: named pipe (FIFO)
	ModeSocket     = fs.ModeSocket     // S: Unix domain socket
	ModeSetuid     = fs.ModeSetuid     // u: setuid
	ModeSetgid     = fs.ModeSetgid     // g: setgid
	ModeCharDevice = fs.ModeCharDevice // c: Unix character device, when ModeDevice is set
	ModeSticky     = fs.ModeSticky     // t: sticky
	ModeIrregular  = fs.ModeIrregular  // ?: non-regular file; nothing else is known about this file

	// Mask for the type bits. For regular files, none will be set.
	ModeType = fs.ModeType

	ModePerm = fs.ModePerm // Unix permission bits, 0o777
)
    The defined file mode bits are the most significant bits of the FileMode.
    The nine least-significant bits are the standard Unix rwxrwxrwx permissions.
    The values of these bits should be considered part of the public API and may
    be used in wire protocols or disk representations: they must not be changed,
    although new bits might be added.

const DevNull = "/dev/null"
    DevNull is the name of the operating system's “null device.” On Unix-like
    systems, it is "/dev/null"; on Windows, "NUL".


VARIABLES

var (
	// ErrInvalid indicates an invalid argument.
	// Methods on File will return this error when the receiver is nil.
	ErrInvalid = fs.ErrInvalid // "invalid argument"

	ErrPermission = fs.ErrPermission // "permission denied"
	ErrExist      = fs.ErrExist      // "file already exists"
	ErrNotExist   = fs.ErrNotExist   // "file does not exist"
	ErrClosed     = fs.ErrClosed     // "file already closed"

	ErrNoDeadline       = errNoDeadline()       // "file type does not support deadline"
	ErrDeadlineExceeded = errDeadlineExceeded() // "i/o timeout"
)
    Portable analogs of some common system call errors.

    Errors returned from this package may be tested against these errors with
    errors.Is.

var (
	// ErrProcessDone indicates a [Process] has finished.
	ErrProcessDone = errors.New("os: process already finished")

	// ErrNoHandle indicates a [Process] does not have a handle.
	ErrNoHandle = errors.New("os: process handle unavailable")
)
var (
	Stdin  = NewFile(uintptr(syscall.Stdin), "/dev/stdin")
	Stdout = NewFile(uintptr(syscall.Stdout), "/dev/stdout")
	Stderr = NewFile(uintptr(syscall.Stderr), "/dev/stderr")
)
    Stdin, Stdout, and Stderr are open Files pointing to the standard input,
    standard output, and standard error file descriptors.

    Note that the Go runtime writes to standard error for panics and crashes;
    closing Stderr may cause those messages to go elsewhere, perhaps to a file
    opened later.

var Args []string
    Args hold the command-line arguments, starting with the program name.


FUNCTIONS

func Chdir(dir string) error
    Chdir changes the current working directory to the named directory. If there
    is an error, it will be of type *PathError.

func Chmod(name string, mode FileMode) error
    Chmod changes the mode of the named file to mode. If the file is a symbolic
    link, it changes the mode of the link's target. If there is an error,
    it will be of type *PathError.

    A different subset of the mode bits are used, depending on the operating
    system.

    On Unix, the mode's permission bits, ModeSetuid, ModeSetgid, and ModeSticky
    are used.

    On Windows, only the 0o200 bit (owner writable) of mode is used; it controls
    whether the file's read-only attribute is set or cleared. The other bits are
    currently unused. For compatibility with Go 1.12 and earlier, use a non-zero
    mode. Use mode 0o400 for a read-only file and 0o600 for a readable+writable
    file.

    On Plan 9, the mode's permission bits, ModeAppend, ModeExclusive, and
    ModeTemporary are used.

func Chown(name string, uid, gid int) error
    Chown changes the numeric uid and gid of the named file. If the file
    is a symbolic link, it changes the uid and gid of the link's target.
    A uid or gid of -1 means to not change that value. If there is an error,
    it will be of type *PathError.

    On Windows or Plan 9, Chown always returns the syscall.EWINDOWS or
    syscall.EPLAN9 error, wrapped in *PathError.

func Chtimes(name string, atime time.Time, mtime time.Time) error
    Chtimes changes the access and modification times of the named file, similar
    to the Unix utime() or utimes() functions. A zero time.Time value will leave
    the corresponding file time unchanged.

    The underlying filesystem may truncate or round the values to a less precise
    time unit. If there is an error, it will be of type *PathError.

func Clearenv()
    Clearenv deletes all environment variables.

func CopyFS(dir string, fsys fs.FS) error
    CopyFS copies the file system fsys into the directory dir, creating dir if
    necessary.

    Files are created with mode 0o666 plus any execute permissions from the
    source, and directories are created with mode 0o777 (before umask).

    CopyFS will not overwrite existing files. If a file name in fsys
    already exists in the destination, CopyFS will return an error such that
    errors.Is(err, fs.ErrExist) will be true.

    Symbolic links in dir are followed.

    New files added to fsys (including if dir is a subdirectory of fsys) while
    CopyFS is running are not guaranteed to be copied.

    Copying stops at and returns the first error encountered.

func DirFS(dir string) fs.FS
    DirFS returns a file system (an fs.FS) for the tree of files rooted at the
    directory dir.

    Note that DirFS("/prefix") only guarantees that the Open calls
    it makes to the operating system will begin with "/prefix":
    DirFS("/prefix").Open("file") is the same as os.Open("/prefix/file").
    So if /prefix/file is a symbolic link pointing outside the /prefix tree,
    then using DirFS does not stop the access any more than using os.Open does.
    Additionally, the root of the fs.FS returned for a relative path,
    DirFS("prefix"), will be affected by later calls to Chdir. DirFS is
    therefore not a general substitute for a chroot-style security mechanism
    when the directory tree contains arbitrary content.

    Use Root.FS to obtain a fs.FS that prevents escapes from the tree via
    symbolic links.

    The directory dir must not be "".

    The result implements io/fs.StatFS, io/fs.ReadFileFS, io/fs.ReadDirFS,
    and io/fs.ReadLinkFS.

func Environ() []string
    Environ returns a copy of strings representing the environment, in the form
    "key=value".

func Executable() (string, error)
    Executable returns the path name for the executable that started the current
    process. There is no guarantee that the path is still pointing to the
    correct executable. If a symlink was used to start the process, depending on
    the operating system, the result might be the symlink or the path it pointed
    to. If a stable result is needed, path/filepath.EvalSymlinks might help.

    Executable returns an absolute path unless an error occurred.

    The main use case is finding resources located relative to an executable.

func Exit(code int)
    Exit causes the current program to exit with the given status code.
    Conventionally, code zero indicates success, non-zero an error. The program
    terminates immediately; deferred functions are not run.

    For portability, the status code should be in the range [0, 125].

func Expand(s string, mapping func(string) string) string
    Expand replaces ${var} or $var in the string based on the mapping function.
    For example, os.ExpandEnv(s) is equivalent to os.Expand(s, os.Getenv).

func ExpandEnv(s string) string
    ExpandEnv replaces ${var} or $var in the string according to the values of
    the current environment variables. References to undefined variables are
    replaced by the empty string.

func Getegid() int
    Getegid returns the numeric effective group id of the caller.

    On Windows, it returns -1.

func Getenv(key string) string
    Getenv retrieves the value of the environment variable named by the key.
    It returns the value, which will be empty if the variable is not present.
    To distinguish between an empty value and an unset value, use LookupEnv.

func Geteuid() int
    Geteuid returns the numeric effective user id of the caller.

    On Windows, it returns -1.

func Getgid() int
    Getgid returns the numeric group id of the caller.

    On Windows, it returns -1.

func Getgroups() ([]int, error)
    Getgroups returns a list of the numeric ids of groups that the caller
    belongs to.

    On Windows, it returns syscall.EWINDOWS. See the os/user package for a
    possible alternative.

func Getpagesize() int
    Getpagesize returns the underlying system's memory page size.

func Getpid() int
    Getpid returns the process id of the caller.

func Getppid() int
    Getppid returns the process id of the caller's parent.

func Getuid() int
    Getuid returns the numeric user id of the caller.

    On Windows, it returns -1.

func Getwd() (dir string, err error)
    Getwd returns an absolute path name corresponding to the current directory.
    If the current directory can be reached via multiple paths (due to symbolic
    links), Getwd may return any one of them.

    On Unix platforms, if the environment variable PWD provides an absolute
    name, and it is a name of the current directory, it is returned.

func Hostname() (name string, err error)
    Hostname returns the host name reported by the kernel.

func IsExist(err error) bool
    IsExist returns a boolean indicating whether its argument is known to report
    that a file or directory already exists. It is satisfied by ErrExist as well
    as some syscall errors.

    This function predates errors.Is. It only supports errors returned by the os
    package. New code should use errors.Is(err, fs.ErrExist).

func IsNotExist(err error) bool
    IsNotExist returns a boolean indicating whether its argument is known
    to report that a file or directory does not exist. It is satisfied by
    ErrNotExist as well as some syscall errors.

    This function predates errors.Is. It only supports errors returned by the os
    package. New code should use errors.Is(err, fs.ErrNotExist).

func IsPathSeparator(c uint8) bool
    IsPathSeparator reports whether c is a directory separator character.

func IsPermission(err error) bool
    IsPermission returns a boolean indicating whether its argument is known to
    report that permission is denied. It is satisfied by ErrPermission as well
    as some syscall errors.

    This function predates errors.Is. It only supports errors returned by the os
    package. New code should use errors.Is(err, fs.ErrPermission).

func IsTimeout(err error) bool
    IsTimeout returns a boolean indicating whether its argument is known to
    report that a timeout occurred.

    This function predates errors.Is, and the notion of whether an error
    indicates a timeout can be ambiguous. For example, the Unix error
    EWOULDBLOCK sometimes indicates a timeout and sometimes does not. New code
    should use errors.Is with a value appropriate to the call returning the
    error, such as os.ErrDeadlineExceeded.

func Lchown(name string, uid, gid int) error
    Lchown changes the numeric uid and gid of the named file. If the file is a
    symbolic link, it changes the uid and gid of the link itself. If there is an
    error, it will be of type *PathError.

    On Windows, it always returns the syscall.EWINDOWS error, wrapped in
    *PathError.

func Link(oldname, newname string) error
    Link creates newname as a hard link to the oldname file. If there is an
    error, it will be of type *LinkError.

func LookupEnv(key string) (string, bool)
    LookupEnv retrieves the value of the environment variable named by the key.
    If the variable is present in the environment the value (which may be empty)
    is returned and the boolean is true. Otherwise the returned value will be
    empty and the boolean will be false.

func Mkdir(name string, perm FileMode) error
    Mkdir creates a new directory with the specified name and permission bits
    (before umask). If there is an error, it will be of type *PathError.

func MkdirAll(path string, perm FileMode) error
    MkdirAll creates a directory named path, along with any necessary parents,
    and returns nil, or else returns an error. The permission bits perm (before
    umask) are used for all directories that MkdirAll creates. If path is
    already a directory, MkdirAll does nothing and returns nil.

func MkdirTemp(dir, pattern string) (string, error)
    MkdirTemp creates a new temporary directory in the directory dir and returns
    the pathname of the new directory. The new directory's name is generated by
    adding a random string to the end of pattern. If pattern includes a "*",
    the random string replaces the last "*" instead. The directory is created
    with mode 0o700 (before umask). If dir is the empty string, MkdirTemp uses
    the default directory for temporary files, as returned by TempDir. Multiple
    programs or goroutines calling MkdirTemp simultaneously will not choose the
    same directory. It is the caller's responsibility to remove the directory
    when it is no longer needed.

func NewSyscallError(syscall string, err error) error
    NewSyscallError returns, as an error, a new SyscallError with the given
    system call name and error details. As a convenience, if err is nil,
    NewSyscallError returns nil.

func Pipe() (r *File, w *File, err error)
    Pipe returns a connected pair of Files; reads from r return bytes written to
    w. It returns the files and an error, if any.

func ReadFile(name string) ([]byte, error)
    ReadFile reads the named file and returns the contents. A successful call
    returns err == nil, not err == EOF. Because ReadFile reads the whole file,
    it does not treat an EOF from Read as an error to be reported. If there is
    an error, it will be of type *PathError.

func Readlink(name string) (string, error)
    Readlink returns the destination of the named symbolic link. If there is an
    error, it will be of type *PathError.

    If the link destination is relative, Readlink returns the relative path
    without resolving it to an absolute one.

func Remove(name string) error
    Remove removes the named file or (empty) directory. If there is an error,
    it will be of type *PathError.

func RemoveAll(path string) error
    RemoveAll removes path and any children it contains. It removes everything
    it can but returns the first error it encounters. If the path does not
    exist, RemoveAll returns nil (no error). If there is an error, it will be of
    type *PathError.

func Rename(oldpath, newpath string) error
    Rename renames (moves) oldpath to newpath. If newpath already exists and
    is not a directory, Rename replaces it. If newpath already exists and is
    a directory, Rename returns an error. OS-specific restrictions may apply
    when oldpath and newpath are in different directories. Even within the
    same directory, on non-Unix platforms Rename is not an atomic operation.
    If there is an error, it will be of type *LinkError.

func SameFile(fi1, fi2 FileInfo) bool
    SameFile reports whether fi1 and fi2 describe the same file. For example,
    on Unix this means that the device and inode fields of the two underlying
    structures are identical; on other systems the decision may be based on the
    path names. SameFile only applies to results returned by this package's
    Stat. It returns false in other cases.

func Setenv(key, value string) error
    Setenv sets the value of the environment variable named by the key.
    It returns an error, if any.

func Symlink(oldname, newname string) error
    Symlink creates newname as a symbolic link to oldname. On Windows, a symlink
    to a non-existent oldname creates a file symlink; if oldname is later
    created as a directory the symlink will not work. If there is an error,
    it will be of type *LinkError.

func TempDir() string
    TempDir returns the default directory to use for temporary files.

    On Unix systems, it returns $TMPDIR if non-empty, else /tmp. On Windows,
    it uses GetTempPath, returning the first non-empty value from %TMP%, %TEMP%,
    %USERPROFILE%, or the Windows directory. On Plan 9, it returns /tmp.

    The directory is neither guaranteed to exist nor have accessible
    permissions.

func Truncate(name string, size int64) error
    Truncate changes the size of the named file. If the file is a symbolic link,
    it changes the size of the link's target. If there is an error, it will be
    of type *PathError.

func Unsetenv(key string) error
    Unsetenv unsets a single environment variable.

func UserCacheDir() (string, error)
    UserCacheDir returns the default root directory to use for user-specific
    cached data. Users should create their own application-specific subdirectory
    within this one and use that.

    On Unix systems, it returns $XDG_CACHE_HOME as specified by
    https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
    if non-empty, else $HOME/.cache. On Darwin, it returns $HOME/Library/Caches.
    On Windows, it returns %LocalAppData%. On Plan 9, it returns
    $home/lib/cache.

    If the location cannot be determined (for example, $HOME is not defined) or
    the path in $XDG_CACHE_HOME is relative, then it will return an error.

func UserConfigDir() (string, error)
    UserConfigDir returns the default root directory to use for user-specific
    configuration data. Users should create their own application-specific
    subdirectory within this one and use that.

    On Unix systems, it returns $XDG_CONFIG_HOME as specified by
    https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
    if non-empty, else $HOME/.config. On Darwin, it returns
    $HOME/Library/Application Support. On Windows, it returns %AppData%. On Plan
    9, it returns $home/lib.

    If the location cannot be determined (for example, $HOME is not defined) or
    the path in $XDG_CONFIG_HOME is relative, then it will return an error.

func UserHomeDir() (string, error)
    UserHomeDir returns the current user's home directory.

    On Unix, including macOS, it returns the $HOME environment variable.
    On Windows, it returns %USERPROFILE%. On Plan 9, it returns the $home
    environment variable.

    If the expected variable is not set in the environment, UserHomeDir returns
    either a platform-specific default value or a non-nil error.

func WriteFile(name string, data []byte, perm FileMode) error
    WriteFile writes data to the named file, creating it if necessary. If the
    file does not exist, WriteFile creates it with permissions perm (before
    umask); otherwise WriteFile truncates it before writing, without changing
    permissions. Since WriteFile requires multiple system calls to complete,
    a failure mid-operation can leave the file in a partially written state.


TYPES

type DirEntry = fs.DirEntry
    A DirEntry is an entry read from a directory (using the ReadDir function or
    a File.ReadDir method).

func ReadDir(name string) ([]DirEntry, error)
    ReadDir reads the named directory, returning all its directory entries
    sorted by filename. If an error occurs reading the directory, ReadDir
    returns the entries it was able to read before the error, along with the
    error.

type File struct {
	// Has unexported fields.
}
    File represents an open file descriptor.

    The methods of File are safe for concurrent use.

func Create(name string) (*File, error)
    Create creates or truncates the named file. If the file already exists,
    it is truncated. If the file does not exist, it is created with mode 0o666
    (before umask). If successful, methods on the returned File can be used
    for I/O; the associated file descriptor has mode O_RDWR. The directory
    containing the file must already exist. If there is an error, it will be of
    type *PathError.

func CreateTemp(dir, pattern string) (*File, error)
    CreateTemp creates a new temporary file in the directory dir, opens the
    file for reading and writing, and returns the resulting file. The filename
    is generated by taking pattern and adding a random string to the end.
    If pattern includes a "*", the random string replaces the last "*". The
    file is created with mode 0o600 (before umask). If dir is the empty string,
    CreateTemp uses the default directory for temporary files, as returned by
    TempDir. Multiple programs or goroutines calling CreateTemp simultaneously
    will not choose the same file. The caller can use the file's Name method to
    find the pathname of the file. It is the caller's responsibility to remove
    the file when it is no longer needed.

func NewFile(fd uintptr, name string) *File
    NewFile returns a new File with the given file descriptor and name.
    The returned value will be nil if fd is not a valid file descriptor.

    NewFile's behavior differs on some platforms:

      - On Unix, if fd is in non-blocking mode, NewFile will attempt to return a
        pollable file.
      - On Windows, if fd is opened for asynchronous I/O (that is,
        syscall.FILE_FLAG_OVERLAPPED has been specified in the
        syscall.CreateFile call), NewFile will attempt to return a pollable
        file by associating fd with the Go runtime I/O completion port. The I/O
        operations will be performed synchronously if the association fails.

    Only pollable files support File.SetDeadline, File.SetReadDeadline,
    and File.SetWriteDeadline.

    After passing it to NewFile, fd may become invalid under the same conditions
    described in the comments of File.Fd, and the same constraints apply.

func Open(name string) (*File, error)
    Open opens the named file for reading. If successful, methods on the
    returned file can be used for reading; the associated file descriptor has
    mode O_RDONLY. If there is an error, it will be of type *PathError.

func OpenFile(name string, flag int, perm FileMode) (*File, error)
    OpenFile is the generalized open call; most users will use Open or Create
    instead. It opens the named file with specified flag (O_RDONLY etc.).
    If the file does not exist, and the O_CREATE flag is passed, it is created
    with mode perm (before umask); the containing directory must exist.
    If successful, methods on the returned File can be used for I/O. If there is
    an error, it will be of type *PathError.

func OpenInRoot(dir, name string) (*File, error)
    OpenInRoot opens the file name in the directory dir. It is equivalent to
    OpenRoot(dir) followed by opening the file in the root.

    OpenInRoot returns an error if any component of the name references a
    location outside of dir.

    See Root for details and limitations.

func (f *File) Chdir() error
    Chdir changes the current working directory to the file, which must be a
    directory. If there is an error, it will be of type *PathError.

func (f *File) Chmod(mode FileMode) error
    Chmod changes the mode of the file to mode. If there is an error, it will be
    of type *PathError.

func (f *File) Chown(uid, gid int) error
    Chown changes the numeric uid and gid of the named file. If there is an
    error, it will be of type *PathError.

    On Windows, it always returns the syscall.EWINDOWS error, wrapped in
    *PathError.

func (f *File) Close() error
    Close closes the File, rendering it unusable for I/O. On files that support
    File.SetDeadline, any pending I/O operations will be canceled and return
    immediately with an ErrClosed error. Close will return an error if it has
    already been called.

func (f *File) Fd() uintptr
    Fd returns the system file descriptor or handle referencing the open file.
    If f is closed, the descriptor becomes invalid. If f is garbage
    collected, a finalizer may close the descriptor, making it invalid; see
    runtime.SetFinalizer for more information on when a finalizer might be run.

    Do not close the returned descriptor; that could cause a later close of f to
    close an unrelated descriptor.

    Fd's behavior differs on some platforms:

      - On Unix and Windows, File.SetDeadline methods will stop working.
      - On Windows, the file descriptor will be disassociated from the Go
        runtime I/O completion port if there are no concurrent I/O operations on
        the file.

    For most uses prefer the f.SyscallConn method.

func (f *File) Name() string
    Name returns the name of the file as presented to Open.

    It is safe to call Name after [Close].

func (f *File) Read(b []byte) (n int, err error)
    Read reads up to len(b) bytes from the File and stores them in b. It
    returns the number of bytes read and any error encountered. At end of file,
    Read returns 0, io.EOF.

func (f *File) ReadAt(b []byte, off int64) (n int, err error)
    ReadAt reads len(b) bytes from the File starting at byte offset off.
    It returns the number of bytes read and the error, if any. ReadAt always
    returns a non-nil error when n < len(b). At end of file, that error is
    io.EOF.

func (f *File) ReadDir(n int) ([]DirEntry, error)
    ReadDir reads the contents of the directory associated with the file f and
    returns a slice of DirEntry values in directory order. Subsequent calls on
    the same file will yield later DirEntry records in the directory.

    If n > 0, ReadDir returns at most n DirEntry records. In this case,
    if ReadDir returns an empty slice, it will return an error explaining why.
    At the end of a directory, the error is io.EOF.

    If n <= 0, ReadDir returns all the DirEntry records remaining in the
    directory. When it succeeds, it returns a nil error (not io.EOF).

func (f *File) ReadFrom(r io.Reader) (n int64, err error)
    ReadFrom implements io.ReaderFrom.

func (f *File) Readdir(n int) ([]FileInfo, error)
    Readdir reads the contents of the directory associated with file and
    returns a slice of up to n FileInfo values, as would be returned by Lstat,
    in directory order. Subsequent calls on the same file will yield further
    FileInfos.

    If n > 0, Readdir returns at most n FileInfo structures. In this case,
    if Readdir returns an empty slice, it will return a non-nil error explaining
    why. At the end of a directory, the error is io.EOF.

    If n <= 0, Readdir returns all the FileInfo from the directory in a single
    slice. In this case, if Readdir succeeds (reads all the way to the end of
    the directory), it returns the slice and a nil error. If it encounters an
    error before the end of the directory, Readdir returns the FileInfo read
    until that point and a non-nil error.

    Most clients are better served by the more efficient ReadDir method.

func (f *File) Readdirnames(n int) (names []string, err error)
    Readdirnames reads the contents of the directory associated with file and
    returns a slice of up to n names of files in the directory, in directory
    order. Subsequent calls on the same file will yield further names.

    If n > 0, Readdirnames returns at most n names. In this case,
    if Readdirnames returns an empty slice, it will return a non-nil error
    explaining why. At the end of a directory, the error is io.EOF.

    If n <= 0, Readdirnames returns all the names from the directory in a single
    slice. In this case, if Readdirnames succeeds (reads all the way to the end
    of the directory), it returns the slice and a nil error. If it encounters an
    error before the end of the directory, Readdirnames returns the names read
    until that point and a non-nil error.

func (f *File) Seek(offset int64, whence int) (ret int64, err error)
    Seek sets the offset for the next Read or Write on file to offset,
    interpreted according to whence: 0 means relative to the origin of the file,
    1 means relative to the current offset, and 2 means relative to the end.
    It returns the new offset and an error, if any. The behavior of Seek on a
    file opened with O_APPEND is not specified.

func (f *File) SetDeadline(t time.Time) error
    SetDeadline sets the read and write deadlines for a File. It is equivalent
    to calling both SetReadDeadline and SetWriteDeadline.

    Only some kinds of files support setting a deadline. Calls to SetDeadline
    for files that do not support deadlines will return ErrNoDeadline. On most
    systems ordinary files do not support deadlines, but pipes do.

    A deadline is an absolute time after which I/O operations fail with an error
    instead of blocking. The deadline applies to all future and pending I/O,
    not just the immediately following call to Read or Write. After a deadline
    has been exceeded, the connection can be refreshed by setting a deadline in
    the future.

    If the deadline is exceeded a call to Read or Write or to other I/O methods
    will return an error that wraps ErrDeadlineExceeded. This can be tested
    using errors.Is(err, os.ErrDeadlineExceeded). That error implements the
    Timeout method, and calling the Timeout method will return true, but there
    are other possible errors for which the Timeout will return true even if the
    deadline has not been exceeded.

    An idle timeout can be implemented by repeatedly extending the deadline
    after successful Read or Write calls.

    A zero value for t means I/O operations will not time out.

func (f *File) SetReadDeadline(t time.Time) error
    SetReadDeadline sets the deadline for future Read calls and any
    currently-blocked Read call. A zero value for t means Read will not time
    out. Not all files support setting deadlines; see SetDeadline.

func (f *File) SetWriteDeadline(t time.Time) error
    SetWriteDeadline sets the deadline for any future Write calls and any
    currently-blocked Write call. Even if Write times out, it may return n > 0,
    indicating that some of the data was successfully written. A zero value for
    t means Write will not time out. Not all files support setting deadlines;
    see SetDeadline.

func (f *File) Stat() (FileInfo, error)
    Stat returns the FileInfo structure describing file. If there is an error,
    it will be of type *PathError.

func (f *File) Sync() error
    Sync commits the current contents of the file to stable storage. Typically,
    this means flushing the file system's in-memory copy of recently written
    data to disk.

func (f *File) SyscallConn() (syscall.RawConn, error)
    SyscallConn returns a raw file. This implements the syscall.Conn interface.

func (f *File) Truncate(size int64) error
    Truncate changes the size of the file. It does not change the I/O offset.
    If there is an error, it will be of type *PathError.

func (f *File) Write(b []byte) (n int, err error)
    Write writes len(b) bytes from b to the File. It returns the number of
    bytes written and an error, if any. Write returns a non-nil error when n !=
    len(b).

func (f *File) WriteAt(b []byte, off int64) (n int, err error)
    WriteAt writes len(b) bytes to the File starting at byte offset off.
    It returns the number of bytes written and an error, if any. WriteAt returns
    a non-nil error when n != len(b).

    If file was opened with the O_APPEND flag, WriteAt returns an error.

func (f *File) WriteString(s string) (n int, err error)
    WriteString is like Write, but writes the contents of string s rather than a
    slice of bytes.

func (f *File) WriteTo(w io.Writer) (n int64, err error)
    WriteTo implements io.WriterTo.

type FileInfo = fs.FileInfo
    A FileInfo describes a file and is returned by Stat and Lstat.

func Lstat(name string) (FileInfo, error)
    Lstat returns a FileInfo describing the named file. If the file is a
    symbolic link, the returned FileInfo describes the symbolic link. Lstat
    makes no attempt to follow the link. If there is an error, it will be of
    type *PathError.

    On Windows, if the file is a reparse point that is a surrogate for another
    named entity (such as a symbolic link or mounted folder), the returned
    FileInfo describes the reparse point, and makes no attempt to resolve it.

func Stat(name string) (FileInfo, error)
    Stat returns a FileInfo describing the named file. If there is an error,
    it will be of type *PathError.

type FileMode = fs.FileMode
    A FileMode represents a file's mode and permission bits. The bits have the
    same definition on all systems, so that information about files can be moved
    from one system to another portably. Not all bits apply to all systems.
    The only required bit is ModeDir for directories.

type LinkError struct {
	Op  string
	Old string
	New string
	Err error
}
    LinkError records an error during a link or symlink or rename system call
    and the paths that caused it.

func (e *LinkError) Error() string

func (e *LinkError) Unwrap() error

type PathError = fs.PathError
    PathError records an error and the operation and file path that caused it.

type ProcAttr struct {
	// If Dir is non-empty, the child changes into the directory before
	// creating the process.
	Dir string
	// If Env is non-nil, it gives the environment variables for the
	// new process in the form returned by Environ.
	// If it is nil, the result of Environ will be used.
	Env []string
	// Files specifies the open files inherited by the new process. The
	// first three entries correspond to standard input, standard output, and
	// standard error. An implementation may support additional entries,
	// depending on the underlying operating system. A nil entry corresponds
	// to that file being closed when the process starts.
	// On Unix systems, StartProcess will change these File values
	// to blocking mode, which means that SetDeadline will stop working
	// and calling Close will not interrupt a Read or Write.
	Files []*File

	// Operating system-specific process creation attributes.
	// Note that setting this field means that your program
	// may not execute properly or even compile on some
	// operating systems.
	Sys *syscall.SysProcAttr
}
    ProcAttr holds the attributes that will be applied to a new process started
    by StartProcess.

type Process struct {
	// Pid is the operating system process ID.
	Pid int

	// Has unexported fields.
}
    Process stores the information about a process created by StartProcess.

func FindProcess(pid int) (*Process, error)
    FindProcess looks for a running process by its pid.

    The Process it returns can be used to obtain information about the
    underlying operating system process.

    On Unix systems, FindProcess always succeeds and returns a Process for the
    given pid, regardless of whether the process exists. To test whether the
    process actually exists, see whether p.Signal(syscall.Signal(0)) reports an
    error.

func StartProcess(name string, argv []string, attr *ProcAttr) (*Process, error)
    StartProcess starts a new process with the program, arguments and attributes
    specified by name, argv and attr. The argv slice will become os.Args in the
    new process, so it normally starts with the program name.

    If the calling goroutine has locked the operating system thread with
    runtime.LockOSThread and modified any inheritable OS-level thread state
    (for example, Linux or Plan 9 name spaces), the new process will inherit the
    caller's thread state.

    StartProcess is a low-level interface. The os/exec package provides
    higher-level interfaces.

    If there is an error, it will be of type *PathError.

func (p *Process) Kill() error
    Kill causes the Process to exit immediately. Kill does not wait until the
    Process has actually exited. This only kills the Process itself, not any
    other processes it may have started.

func (p *Process) Release() error
    Release releases any resources associated with the Process p, rendering it
    unusable in the future. Release only needs to be called if Process.Wait is
    not.

func (p *Process) Signal(sig Signal) error
    Signal sends a signal to the Process. Sending Interrupt on Windows is not
    implemented.

func (p *Process) Wait() (*ProcessState, error)
    Wait waits for the Process to exit, and then returns a ProcessState
    describing its status and an error, if any. Wait releases any resources
    associated with the Process. On most operating systems, the Process must be
    a child of the current process or an error will be returned.

func (p *Process) WithHandle(f func(handle uintptr)) error
    WithHandle calls a supplied function f with a valid process handle as an
    argument. The handle is guaranteed to refer to process p until f returns,
    even if p terminates. This function cannot be used after Process.Release or
    Process.Wait.

    If process handles are not supported or a handle is not available,
    it returns ErrNoHandle. Currently, process handles are supported on Linux
    5.4 or later (pidfd) and Windows.

type ProcessState struct {
	// Has unexported fields.
}
    ProcessState stores information about a process, as reported by Wait.

func (p *ProcessState) ExitCode() int
    ExitCode returns the exit code of the exited process, or -1 if the process
    hasn't exited or was terminated by a signal.

func (p *ProcessState) Exited() bool
    Exited reports whether the program has exited. On Unix systems this reports
    true if the program exited due to calling exit, but false if the program
    terminated due to a signal.

func (p *ProcessState) Pid() int
    Pid returns the process id of the exited process.

func (p *ProcessState) String() string

func (p *ProcessState) Success() bool
    Success reports whether the program exited successfully, such as with exit
    status 0 on Unix.

func (p *ProcessState) Sys() any
    Sys returns system-dependent exit information about the process. Convert
    it to the appropriate underlying type, such as syscall.WaitStatus on Unix,
    to access its contents.

func (p *ProcessState) SysUsage() any
    SysUsage returns system-dependent resource usage information about the
    exited process. Convert it to the appropriate underlying type, such as
    *syscall.Rusage on Unix, to access its contents. (On Unix, *syscall.Rusage
    matches struct rusage as defined in the getrusage(2) manual page.)

func (p *ProcessState) SystemTime() time.Duration
    SystemTime returns the system CPU time of the exited process and its
    children.

func (p *ProcessState) UserTime() time.Duration
    UserTime returns the user CPU time of the exited process and its children.

type Root struct {
	// Has unexported fields.
}
    Root may be used to only access files within a single directory tree.

    Methods on Root can only access files and directories beneath a root
    directory. If any component of a file name passed to a method of Root
    references a location outside the root, the method returns an error.
    File names may reference the directory itself (.).

    Methods on Root will follow symbolic links, but symbolic links may not
    reference a location outside the root. Symbolic links must not be absolute.

    Methods on Root do not prohibit traversal of filesystem boundaries, Linux
    bind mounts, /proc special files, or access to Unix device files.

    Methods on Root are safe to be used from multiple goroutines simultaneously.

    On most platforms, creating a Root opens a file descriptor or handle
    referencing the directory. If the directory is moved, methods on Root
    reference the original directory in its new location.

    Root's behavior differs on some platforms:

      - When GOOS=windows, file names may not reference Windows reserved device
        names such as NUL and COM1.
      - On Unix, Root.Chmod, Root.Chown, and Root.Chtimes are vulnerable to a
        race condition. If the target of the operation is changed from a regular
        file to a symlink while the operation is in progress, the operation may
        be performed on the link rather than the link target.
      - When GOOS=js, Root is vulnerable to TOCTOU (time-of-check-time-of-use)
        attacks in symlink validation, and cannot ensure that operations will
        not escape the root.
      - When GOOS=plan9 or GOOS=js, Root does not track directories across
        renames. On these platforms, a Root references a directory name,
        not a file descriptor.
      - WASI preview 1 (GOOS=wasip1) does not support Root.Chmod.

func OpenRoot(name string) (*Root, error)
    OpenRoot opens the named directory. It follows symbolic links in the
    directory name. If there is an error, it will be of type *PathError.

func (r *Root) Chmod(name string, mode FileMode) error
    Chmod changes the mode of the named file in the root to mode. See Chmod for
    more details.

func (r *Root) Chown(name string, uid, gid int) error
    Chown changes the numeric uid and gid of the named file in the root.
    See Chown for more details.

func (r *Root) Chtimes(name string, atime time.Time, mtime time.Time) error
    Chtimes changes the access and modification times of the named file in the
    root. See Chtimes for more details.

func (r *Root) Close() error
    Close closes the Root. After Close is called, methods on Root return errors.

func (r *Root) Create(name string) (*File, error)
    Create creates or truncates the named file in the root. See Create for more
    details.

func (r *Root) FS() fs.FS
    FS returns a file system (an fs.FS) for the tree of files in the root.

    The result implements io/fs.StatFS, io/fs.ReadFileFS, io/fs.ReadDirFS,
    and io/fs.ReadLinkFS.

func (r *Root) Lchown(name string, uid, gid int) error
    Lchown changes the numeric uid and gid of the named file in the root.
    See Lchown for more details.

func (r *Root) Link(oldname, newname string) error
    Link creates newname as a hard link to the oldname file. Both paths are
    relative to the root. See Link for more details.

    If oldname is a symbolic link, Link creates new link to oldname and not its
    target. This behavior may differ from that of Link on some platforms.

    When GOOS=js, Link returns an error if oldname is a symbolic link.

func (r *Root) Lstat(name string) (FileInfo, error)
    Lstat returns a FileInfo describing the named file in the root. If the file
    is a symbolic link, the returned FileInfo describes the symbolic link.
    See Lstat for more details.

func (r *Root) Mkdir(name string, perm FileMode) error
    Mkdir creates a new directory in the root with the specified name and
    permission bits (before umask). See Mkdir for more details.

    If perm contains bits other than the nine least-significant bits (0o777),
    Mkdir returns an error.

func (r *Root) MkdirAll(name string, perm FileMode) error
    MkdirAll creates a new directory in the root, along with any necessary
    parents. See MkdirAll for more details.

    If perm contains bits other than the nine least-significant bits (0o777),
    MkdirAll returns an error.

func (r *Root) Name() string
    Name returns the name of the directory presented to OpenRoot.

    It is safe to call Name after [Close].

func (r *Root) Open(name string) (*File, error)
    Open opens the named file in the root for reading. See Open for more
    details.

func (r *Root) OpenFile(name string, flag int, perm FileMode) (*File, error)
    OpenFile opens the named file in the root. See OpenFile for more details.

    If perm contains bits other than the nine least-significant bits (0o777),
    OpenFile returns an error.

func (r *Root) OpenRoot(name string) (*Root, error)
    OpenRoot opens the named directory in the root. If there is an error,
    it will be of type *PathError.

func (r *Root) ReadFile(name string) ([]byte, error)
    ReadFile reads the named file in the root and returns its contents.
    See ReadFile for more details.

func (r *Root) Readlink(name string) (string, error)
    Readlink returns the destination of the named symbolic link in the root.
    See Readlink for more details.

func (r *Root) Remove(name string) error
    Remove removes the named file or (empty) directory in the root. See Remove
    for more details.

func (r *Root) RemoveAll(name string) error
    RemoveAll removes the named file or directory and any children that it
    contains. See RemoveAll for more details.

func (r *Root) Rename(oldname, newname string) error
    Rename renames (moves) oldname to newname. Both paths are relative to the
    root. See Rename for more details.

func (r *Root) Stat(name string) (FileInfo, error)
    Stat returns a FileInfo describing the named file in the root. See Stat for
    more details.

func (r *Root) Symlink(oldname, newname string) error
    Symlink creates newname as a symbolic link to oldname. See Symlink for more
    details.

    Symlink does not validate oldname, which may reference a location outside
    the root.

    On Windows, a directory link is created if oldname references a directory
    within the root. Otherwise a file link is created.

func (r *Root) WriteFile(name string, data []byte, perm FileMode) error
    WriteFile writes data to the named file in the root, creating it if
    necessary. See WriteFile for more details.

type Signal interface {
	String() string
	Signal() // to distinguish from other Stringers
}
    A Signal represents an operating system signal. The usual underlying
    implementation is operating system-dependent: on Unix it is syscall.Signal.

var (
	Interrupt Signal = syscall.SIGINT
	Kill      Signal = syscall.SIGKILL
)
    The only signal values guaranteed to be present in the os package on all
    systems are os.Interrupt (send the process an interrupt) and os.Kill (force
    the process to exit). On Windows, sending os.Interrupt to a process with
    os.Process.Signal is not implemented; it will return an error instead of
    sending a signal.

type SyscallError struct {
	Syscall string
	Err     error
}
    SyscallError records an error from a specific system call.

func (e *SyscallError) Error() string

func (e *SyscallError) Timeout() bool
    Timeout reports whether this error represents a timeout.

func (e *SyscallError) Unwrap() error
```

## time

```go
package time // import "time"

Package time provides functionality for measuring and displaying time.

The calendrical calculations always assume a Gregorian calendar, with no leap
seconds.

# Monotonic Clocks

Operating systems provide both a “wall clock,” which is subject to changes
for clock synchronization, and a “monotonic clock,” which is not. The general
rule is that the wall clock is for telling time and the monotonic clock is for
measuring time. Rather than split the API, in this package the Time returned by
time.Now contains both a wall clock reading and a monotonic clock reading; later
time-telling operations use the wall clock reading, but later time-measuring
operations, specifically comparisons and subtractions, use the monotonic clock
reading.

For example, this code always computes a positive elapsed time of approximately
20 milliseconds, even if the wall clock is changed during the operation being
timed:

    start := time.Now()
    ... operation that takes 20 milliseconds ...
    t := time.Now()
    elapsed := t.Sub(start)

Other idioms, such as time.Since(start), time.Until(deadline), and
time.Now().Before(deadline), are similarly robust against wall clock resets.

The rest of this section gives the precise details of how operations use
monotonic clocks, but understanding those details is not required to use this
package.

The Time returned by time.Now contains a monotonic clock reading. If Time t
has a monotonic clock reading, t.Add adds the same duration to both the wall
clock and monotonic clock readings to compute the result. Because t.AddDate(y,
m, d), t.Round(d), and t.Truncate(d) are wall time computations, they always
strip any monotonic clock reading from their results. Because t.In, t.Local,
and t.UTC are used for their effect on the interpretation of the wall time,
they also strip any monotonic clock reading from their results. The canonical
way to strip a monotonic clock reading is to use t = t.Round(0).

If Times t and u both contain monotonic clock readings, the operations
t.After(u), t.Before(u), t.Equal(u), t.Compare(u), and t.Sub(u) are carried out
using the monotonic clock readings alone, ignoring the wall clock readings.
If either t or u contains no monotonic clock reading, these operations fall back
to using the wall clock readings.

On some systems the monotonic clock will stop if the computer goes to sleep.
On such a system, t.Sub(u) may not accurately reflect the actual time that
passed between t and u. The same applies to other functions and methods that
subtract times, such as Since, Until, Time.Before, Time.After, Time.Add,
Time.Equal and Time.Compare. In some cases, you may need to strip the monotonic
clock to get accurate results.

Because the monotonic clock reading has no meaning outside the current process,
the serialized forms generated by t.GobEncode, t.MarshalBinary, t.MarshalJSON,
and t.MarshalText omit the monotonic clock reading, and t.Format provides
no format for it. Similarly, the constructors time.Date, time.Parse,
time.ParseInLocation, and time.Unix, as well as the unmarshalers t.GobDecode,
t.UnmarshalBinary. t.UnmarshalJSON, and t.UnmarshalText always create times with
no monotonic clock reading.

The monotonic clock reading exists only in Time values. It is not a part of
Duration values or the Unix times returned by t.Unix and friends.

Note that the Go == operator compares not just the time instant but also the
Location and the monotonic clock reading. See the documentation for the Time
type for a discussion of equality testing for Time values.

For debugging, the result of t.String does include the monotonic clock
reading if present. If t != u because of different monotonic clock readings,
that difference will be visible when printing t.String() and u.String().

# Timer Resolution

Timer resolution varies depending on the Go runtime, the operating system
and the underlying hardware. On Unix, the resolution is ~1ms. On Windows
version 1803 and newer, the resolution is ~0.5ms. On older Windows versions,
the default resolution is ~16ms, but a higher resolution may be requested using
golang.org/x/sys/windows.TimeBeginPeriod.

CONSTANTS

const (
	Layout      = "01/02 03:04:05PM '06 -0700" // The reference time, in numerical order.
	ANSIC       = "Mon Jan _2 15:04:05 2006"
	UnixDate    = "Mon Jan _2 15:04:05 MST 2006"
	RubyDate    = "Mon Jan 02 15:04:05 -0700 2006"
	RFC822      = "02 Jan 06 15:04 MST"
	RFC822Z     = "02 Jan 06 15:04 -0700" // RFC822 with numeric zone
	RFC850      = "Monday, 02-Jan-06 15:04:05 MST"
	RFC1123     = "Mon, 02 Jan 2006 15:04:05 MST"
	RFC1123Z    = "Mon, 02 Jan 2006 15:04:05 -0700" // RFC1123 with numeric zone
	RFC3339     = "2006-01-02T15:04:05Z07:00"
	RFC3339Nano = "2006-01-02T15:04:05.999999999Z07:00"
	Kitchen     = "3:04PM"
	// Handy time stamps.
	Stamp      = "Jan _2 15:04:05"
	StampMilli = "Jan _2 15:04:05.000"
	StampMicro = "Jan _2 15:04:05.000000"
	StampNano  = "Jan _2 15:04:05.000000000"
	DateTime   = "2006-01-02 15:04:05"
	DateOnly   = "2006-01-02"
	TimeOnly   = "15:04:05"
)
    These are predefined layouts for use in Time.Format and time.Parse.
    The reference time used in these layouts is the specific time stamp:

        01/02 03:04:05PM '06 -0700

    (January 2, 15:04:05, 2006, in time zone seven hours west of GMT).
    That value is recorded as the constant named Layout, listed below. As a
    Unix time, this is 1136239445. Since MST is GMT-0700, the reference would be
    printed by the Unix date command as:

        Mon Jan 2 15:04:05 MST 2006

    It is a regrettable historic error that the date uses the American
    convention of putting the numerical month before the day.

    The example for Time.Format demonstrates the working of the layout string in
    detail and is a good reference.

    Note that the RFC822, RFC850, and RFC1123 formats should be applied only
    to local times. Applying them to UTC times will use "UTC" as the time zone
    abbreviation, while strictly speaking those RFCs require the use of "GMT"
    in that case. When using the RFC1123 or RFC1123Z formats for parsing,
    note that these formats define a leading zero for the day-in-month portion,
    which is not strictly allowed by RFC 1123. This will result in an error
    when parsing date strings that occur in the first 9 days of a given month.
    In general RFC1123Z should be used instead of RFC1123 for servers that
    insist on that format, and RFC3339 should be preferred for new protocols.
    RFC3339, RFC822, RFC822Z, RFC1123, and RFC1123Z are useful for formatting;
    when used with time.Parse they do not accept all the time formats permitted
    by the RFCs and they do accept time formats not formally defined. The
    RFC3339Nano format removes trailing zeros from the seconds field and thus
    may not sort correctly once formatted.

    Most programs can use one of the defined constants as the layout passed
    to Format or Parse. The rest of this comment can be ignored unless you are
    creating a custom layout string.

    To define your own format, write down what the reference time would look
    like formatted your way; see the values of constants like ANSIC, StampMicro
    or Kitchen for examples. The model is to demonstrate what the reference
    time looks like so that the Format and Parse methods can apply the same
    transformation to a general time value.

    Here is a summary of the components of a layout string. Each element shows
    by example the formatting of an element of the reference time. Only these
    values are recognized. Text in the layout string that is not recognized as
    part of the reference time is echoed verbatim during Format and expected to
    appear verbatim in the input to Parse.

        Year: "2006" "06"
        Month: "Jan" "January" "01" "1"
        Day of the week: "Mon" "Monday"
        Day of the month: "2" "_2" "02"
        Day of the year: "__2" "002"
        Hour: "15" "3" "03" (PM or AM)
        Minute: "4" "04"
        Second: "5" "05"
        AM/PM mark: "PM"

    Numeric time zone offsets format as follows:

        "-0700"     ±hhmm
        "-07:00"    ±hh:mm
        "-07"       ±hh
        "-070000"   ±hhmmss
        "-07:00:00" ±hh:mm:ss

    Replacing the sign in the format with a Z triggers the ISO 8601 behavior of
    printing Z instead of an offset for the UTC zone. Thus:

        "Z0700"      Z or ±hhmm
        "Z07:00"     Z or ±hh:mm
        "Z07"        Z or ±hh
        "Z070000"    Z or ±hhmmss
        "Z07:00:00"  Z or ±hh:mm:ss

    Within the format string, the underscores in "_2" and "__2" represent spaces
    that may be replaced by digits if the following number has multiple digits,
    for compatibility with fixed-width Unix time formats. A leading zero
    represents a zero-padded value.

    The formats __2 and 002 are space-padded and zero-padded three-character day
    of year; there is no unpadded day of year format.

    A comma or decimal point followed by one or more zeros represents a
    fractional second, printed to the given number of decimal places. A comma or
    decimal point followed by one or more nines represents a fractional second,
    printed to the given number of decimal places, with trailing zeros removed.
    For example "15:04:05,000" or "15:04:05.000" formats or parses with
    millisecond precision.

    Some valid layouts are invalid time values for time.Parse, due to formats
    such as _ for space padding and Z for zone information.

const (
	Nanosecond  Duration = 1
	Microsecond          = 1000 * Nanosecond
	Millisecond          = 1000 * Microsecond
	Second               = 1000 * Millisecond
	Minute               = 60 * Second
	Hour                 = 60 * Minute
)
    Common durations. There is no definition for units of Day or larger to avoid
    confusion across daylight savings time zone transitions.

    To count the number of units in a Duration, divide:

        second := time.Second
        fmt.Print(int64(second/time.Millisecond)) // prints 1000

    To convert an integer number of units to a Duration, multiply:

        seconds := 10
        fmt.Print(time.Duration(seconds)*time.Second) // prints 10s


FUNCTIONS

func After(d Duration) <-chan Time
    After waits for the duration to elapse and then sends the current time on
    the returned channel. It is equivalent to NewTimer(d).C.

    Before Go 1.23, this documentation warned that the underlying Timer
    would not be recovered by the garbage collector until the timer fired,
    and that if efficiency was a concern, code should use NewTimer instead and
    call Timer.Stop if the timer is no longer needed. As of Go 1.23, the garbage
    collector can recover unreferenced, unstopped timers. There is no reason to
    prefer NewTimer when After will do.

func Sleep(d Duration)
    Sleep pauses the current goroutine for at least the duration d. A negative
    or zero duration causes Sleep to return immediately.

func Tick(d Duration) <-chan Time
    Tick is a convenience wrapper for NewTicker providing access to the ticking
    channel only. Unlike NewTicker, Tick will return nil if d <= 0.

    Before Go 1.23, this documentation warned that the underlying Ticker would
    never be recovered by the garbage collector, and that if efficiency was a
    concern, code should use NewTicker instead and call Ticker.Stop when the
    ticker is no longer needed. As of Go 1.23, the garbage collector can recover
    unreferenced tickers, even if they haven't been stopped. The Stop method is
    no longer necessary to help the garbage collector. There is no longer any
    reason to prefer NewTicker when Tick will do.


TYPES

type Duration int64
    A Duration represents the elapsed time between two instants as an int64
    nanosecond count. The representation limits the largest representable
    duration to approximately 290 years.

func ParseDuration(s string) (Duration, error)
    ParseDuration parses a duration string. A duration string is a possibly
    signed sequence of decimal numbers, each with optional fraction and a unit
    suffix, such as "300ms", "-1.5h" or "2h45m". Valid time units are "ns",
    "us" (or "µs"), "ms", "s", "m", "h".

func Since(t Time) Duration
    Since returns the time elapsed since t. It is shorthand for
    time.Now().Sub(t).

func Until(t Time) Duration
    Until returns the duration until t. It is shorthand for t.Sub(time.Now()).

func (d Duration) Abs() Duration
    Abs returns the absolute value of d. As a special case,
    Duration(math.MinInt64) is converted to Duration(math.MaxInt64), reducing
    its magnitude by 1 nanosecond.

func (d Duration) Hours() float64
    Hours returns the duration as a floating point number of hours.

func (d Duration) Microseconds() int64
    Microseconds returns the duration as an integer microsecond count.

func (d Duration) Milliseconds() int64
    Milliseconds returns the duration as an integer millisecond count.

func (d Duration) Minutes() float64
    Minutes returns the duration as a floating point number of minutes.

func (d Duration) Nanoseconds() int64
    Nanoseconds returns the duration as an integer nanosecond count.

func (d Duration) Round(m Duration) Duration
    Round returns the result of rounding d to the nearest multiple of m.
    The rounding behavior for halfway values is to round away from zero.
    If the result exceeds the maximum (or minimum) value that can be stored
    in a Duration, Round returns the maximum (or minimum) duration. If m <= 0,
    Round returns d unchanged.

func (d Duration) Seconds() float64
    Seconds returns the duration as a floating point number of seconds.

func (d Duration) String() string
    String returns a string representing the duration in the form "72h3m0.5s".
    Leading zero units are omitted. As a special case, durations less than one
    second format use a smaller unit (milli-, micro-, or nanoseconds) to ensure
    that the leading digit is non-zero. The zero duration formats as 0s.

func (d Duration) Truncate(m Duration) Duration
    Truncate returns the result of rounding d toward zero to a multiple of m.
    If m <= 0, Truncate returns d unchanged.

type Location struct {
	// Has unexported fields.
}
    A Location maps time instants to the zone in use at that time. Typically,
    the Location represents the collection of time offsets in use in a
    geographical area. For many Locations the time offset varies depending on
    whether daylight savings time is in use at the time instant.

    Location is used to provide a time zone in a printed Time value and for
    calculations involving intervals that may cross daylight savings time
    boundaries.

var Local *Location = &localLoc
    Local represents the system's local time zone. On Unix systems,
    Local consults the TZ environment variable to find the time zone to use.
    No TZ means use the system default /etc/localtime. TZ="" means use UTC.
    TZ="foo" means use file foo in the system timezone directory.

var UTC *Location = &utcLoc
    UTC represents Universal Coordinated Time (UTC).

func FixedZone(name string, offset int) *Location
    FixedZone returns a Location that always uses the given zone name and offset
    (seconds east of UTC).

func LoadLocation(name string) (*Location, error)
    LoadLocation returns a Location with the given name.

    If the name is "" or "UTC", LoadLocation returns UTC. If the name is
    "Local", LoadLocation returns Local.

    Otherwise, a new Location is created where the name is taken to be a
    location name corresponding to a file in the IANA Time Zone database,
    such as "America/New_York".

    LoadLocation looks for the IANA Time Zone database in the following
    locations in order:

      - the directory or uncompressed zip file named by the ZONEINFO environment
        variable
      - on a Unix system, the system standard installation location
      - $GOROOT/lib/time/zoneinfo.zip
      - the time/tzdata package, if it was imported

func LoadLocationFromTZData(name string, data []byte) (*Location, error)
    LoadLocationFromTZData returns a new Location with the given name
    initialized from the IANA Time Zone database-formatted data. The data should
    be in the format of a standard IANA time zone file (for example, the content
    of /etc/localtime on Unix systems).

func (l *Location) String() string
    String returns a descriptive name for the time zone information,
    corresponding to the name argument to LoadLocation or FixedZone.

type Month int
    A Month specifies a month of the year (January = 1, ...).

const (
	January Month = 1 + iota
	February
	March
	April
	May
	June
	July
	August
	September
	October
	November
	December
)
func (m Month) String() string
    String returns the English name of the month ("January", "February", ...).

type ParseError struct {
	Layout     string
	Value      string
	LayoutElem string
	ValueElem  string
	Message    string
}
    ParseError describes a problem parsing a time string.

func (e *ParseError) Error() string
    Error returns the string representation of a ParseError.

type Ticker struct {
	C <-chan Time // The channel on which the ticks are delivered.
	// Has unexported fields.
}
    A Ticker holds a channel that delivers “ticks” of a clock at intervals.

func NewTicker(d Duration) *Ticker
    NewTicker returns a new Ticker containing a channel that will send the
    current time on the channel after each tick. The period of the ticks is
    specified by the duration argument. The ticker will adjust the time interval
    or drop ticks to make up for slow receivers. The duration d must be greater
    than zero; if not, NewTicker will panic.

    Before Go 1.23, the garbage collector did not recover tickers that had not
    yet expired or been stopped, so code often immediately deferred t.Stop
    after calling NewTicker, to make the ticker recoverable when it was no
    longer needed. As of Go 1.23, the garbage collector can recover unreferenced
    tickers, even if they haven't been stopped. The Stop method is no longer
    necessary to help the garbage collector. (Code may of course still want to
    call Stop to stop the ticker for other reasons.)

func (t *Ticker) Reset(d Duration)
    Reset stops a ticker and resets its period to the specified duration.
    The next tick will arrive after the new period elapses. The duration d must
    be greater than zero; if not, Reset will panic.

func (t *Ticker) Stop()
    Stop turns off a ticker. After Stop, no more ticks will be sent. Stop does
    not close the channel, to permit calling Ticker.Reset, and to prevent a
    concurrent goroutine reading from the channel from seeing an erroneous
    "tick".

type Time struct {
	// Has unexported fields.
}
    A Time represents an instant in time with nanosecond precision.

    Programs using times should typically store and pass them as values,
    not pointers. That is, time variables and struct fields should be of type
    time.Time, not *time.Time.

    A Time value can be used by multiple goroutines simultaneously except that
    the methods Time.GobDecode, Time.UnmarshalBinary, Time.UnmarshalJSON and
    Time.UnmarshalText are not concurrency-safe.

    Time instants can be compared using the Time.Before, Time.After, and
    Time.Equal methods. The Time.Sub method subtracts two instants, producing a
    Duration. The Time.Add method adds a Time and a Duration, producing a Time.

    The zero value of type Time is January 1, year 1, 00:00:00.000000000 UTC. As
    this time is unlikely to come up in practice, the Time.IsZero method gives a
    simple way of detecting a time that has not been initialized explicitly.

    Each time has an associated Location. The methods Time.Local, Time.UTC,
    and Time.In return a Time with a specific Location. Changing the Location
    of a Time value with these methods does not change the actual instant it
    represents, only the time zone in which to interpret it.

    Representations of a Time value saved by the Time.GobEncode,
    Time.MarshalBinary, Time.AppendBinary, Time.MarshalJSON, Time.MarshalText
    and Time.AppendText methods store the Time.Location's offset, but not the
    location name. They therefore lose information about Daylight Saving Time.

    In addition to the required “wall clock” reading, a Time may contain an
    optional reading of the current process's monotonic clock, to provide
    additional precision for comparison or subtraction. See the “Monotonic
    Clocks” section in the package documentation for details.

    Note that the Go == operator compares not just the time instant but also
    the Location and the monotonic clock reading. Therefore, Time values should
    not be used as map or database keys without first guaranteeing that the
    identical Location has been set for all values, which can be achieved
    through use of the UTC or Local method, and that the monotonic clock reading
    has been stripped by setting t = t.Round(0). In general, prefer t.Equal(u)
    to t == u, since t.Equal uses the most accurate comparison available and
    correctly handles the case when only one of its arguments has a monotonic
    clock reading.

func Date(year int, month Month, day, hour, min, sec, nsec int, loc *Location) Time
    Date returns the Time corresponding to

        yyyy-mm-dd hh:mm:ss + nsec nanoseconds

    in the appropriate zone for that time in the given location.

    The month, day, hour, min, sec, and nsec values may be outside their usual
    ranges and will be normalized during the conversion. For example, October 32
    converts to November 1.

    A daylight savings time transition skips or repeats times. For example,
    in the United States, March 13, 2011 2:15am never occurred, while November
    6, 2011 1:15am occurred twice. In such cases, the choice of time zone,
    and therefore the time, is not well-defined. Date returns a time that is
    correct in one of the two zones involved in the transition, but it does not
    guarantee which.

    Date panics if loc is nil.

func Now() Time
    Now returns the current local time.

func Parse(layout, value string) (Time, error)
    Parse parses a formatted string and returns the time value it represents.
    See the documentation for the constant called Layout to see how to represent
    the format. The second argument must be parseable using the format string
    (layout) provided as the first argument.

    The example for Time.Format demonstrates the working of the layout string in
    detail and is a good reference.

    When parsing (only), the input may contain a fractional second field
    immediately after the seconds field, even if the layout does not signify
    its presence. In that case either a comma or a decimal point followed by
    a maximal series of digits is parsed as a fractional second. Fractional
    seconds are truncated to nanosecond precision.

    Elements omitted from the layout are assumed to be zero or, when zero is
    impossible, one, so parsing "3:04pm" returns the time corresponding to
    Jan 1, year 0, 15:04:00 UTC (note that because the year is 0, this time is
    before the zero Time). Years must be in the range 0000..9999. The day of the
    week is checked for syntax but it is otherwise ignored.

    For layouts specifying the two-digit year 06, a value NN >= 69 will be
    treated as 19NN and a value NN < 69 will be treated as 20NN.

    Timestamps representing leap seconds (second 60) cannot be parsed. These are
    not representable by Time.

    The remainder of this comment describes the handling of time zones.

    In the absence of a time zone indicator, Parse returns a time in UTC.

    When parsing a time with a zone offset like -0700, if the offset corresponds
    to a time zone used by the current location (Local), then Parse uses that
    location and zone in the returned time. Otherwise it records the time as
    being in a fabricated location with time fixed at the given zone offset.

    When parsing a time with a zone abbreviation like MST, if the
    zone abbreviation has a defined offset in the current location,
    then that offset is used. The zone abbreviation "UTC" is recognized
    as UTC regardless of location. If the zone abbreviation is unknown,
    Parse records the time as being in a fabricated location with the given
    zone abbreviation and a zero offset. This choice means that such a time can
    be parsed and reformatted with the same layout losslessly, but the exact
    instant used in the representation will differ by the actual zone offset.
    To avoid such problems, prefer time layouts that use a numeric zone offset,
    or use ParseInLocation.

func ParseInLocation(layout, value string, loc *Location) (Time, error)
    ParseInLocation is like Parse but differs in two important ways. First,
    in the absence of time zone information, Parse interprets a time as UTC;
    ParseInLocation interprets the time as in the given location. Second,
    when given a zone offset or abbreviation, Parse tries to match it against
    the Local location; ParseInLocation uses the given location.

func Unix(sec int64, nsec int64) Time
    Unix returns the local Time corresponding to the given Unix time,
    sec seconds and nsec nanoseconds since January 1, 1970 UTC. It is valid
    to pass nsec outside the range [0, 999999999]. Not all sec values have
    a corresponding time value. One such value is 1<<63-1 (the largest int64
    value).

func UnixMicro(usec int64) Time
    UnixMicro returns the local Time corresponding to the given Unix time,
    usec microseconds since January 1, 1970 UTC.

func UnixMilli(msec int64) Time
    UnixMilli returns the local Time corresponding to the given Unix time,
    msec milliseconds since January 1, 1970 UTC.

func (t Time) Add(d Duration) Time
    Add returns the time t+d.

func (t Time) AddDate(years int, months int, days int) Time
    AddDate returns the time corresponding to adding the given number of years,
    months, and days to t. For example, AddDate(-1, 2, 3) applied to January 1,
    2011 returns March 4, 2010.

    Note that dates are fundamentally coupled to timezones, and calendrical
    periods like days don't have fixed durations. AddDate uses the Location
    of the Time value to determine these durations. That means that the same
    AddDate arguments can produce a different shift in absolute time depending
    on the base Time value and its Location. For example, AddDate(0, 0,
    1) applied to 12:00 on March 27 always returns 12:00 on March 28. At some
    locations and in some years this is a 24 hour shift. In others it's a 23
    hour shift due to daylight savings time transitions.

    AddDate normalizes its result in the same way that Date does, so, for
    example, adding one month to October 31 yields December 1, the normalized
    form for November 31.

func (t Time) After(u Time) bool
    After reports whether the time instant t is after u.

func (t Time) AppendBinary(b []byte) ([]byte, error)
    AppendBinary implements the encoding.BinaryAppender interface.

func (t Time) AppendFormat(b []byte, layout string) []byte
    AppendFormat is like Time.Format but appends the textual representation to b
    and returns the extended buffer.

func (t Time) AppendText(b []byte) ([]byte, error)
    AppendText implements the encoding.TextAppender interface. The time is
    formatted in RFC 3339 format with sub-second precision. If the timestamp
    cannot be represented as valid RFC 3339 (e.g., the year is out of range),
    then an error is returned.

func (t Time) Before(u Time) bool
    Before reports whether the time instant t is before u.

func (t Time) Clock() (hour, min, sec int)
    Clock returns the hour, minute, and second within the day specified by t.

func (t Time) Compare(u Time) int
    Compare compares the time instant t with u. If t is before u, it returns -1;
    if t is after u, it returns +1; if they're the same, it returns 0.

func (t Time) Date() (year int, month Month, day int)
    Date returns the year, month, and day in which t occurs.

func (t Time) Day() int
    Day returns the day of the month specified by t.

func (t Time) Equal(u Time) bool
    Equal reports whether t and u represent the same time instant. Two times
    can be equal even if they are in different locations. For example, 6:00
    +0200 and 4:00 UTC are Equal. See the documentation on the Time type for the
    pitfalls of using == with Time values; most code should use Equal instead.

func (t Time) Format(layout string) string
    Format returns a textual representation of the time value formatted
    according to the layout defined by the argument. See the documentation for
    the constant called Layout to see how to represent the layout format.

    The executable example for Time.Format demonstrates the working of the
    layout string in detail and is a good reference.

func (t Time) GoString() string
    GoString implements fmt.GoStringer and formats t to be printed in Go source
    code.

func (t *Time) GobDecode(data []byte) error
    GobDecode implements the gob.GobDecoder interface.

func (t Time) GobEncode() ([]byte, error)
    GobEncode implements the gob.GobEncoder interface.

func (t Time) Hour() int
    Hour returns the hour within the day specified by t, in the range [0, 23].

func (t Time) ISOWeek() (year, week int)
    ISOWeek returns the ISO 8601 year and week number in which t occurs.
    Week ranges from 1 to 53. Jan 01 to Jan 03 of year n might belong to week 52
    or 53 of year n-1, and Dec 29 to Dec 31 might belong to week 1 of year n+1.

func (t Time) In(loc *Location) Time
    In returns a copy of t representing the same time instant, but with the
    copy's location information set to loc for display purposes.

    In panics if loc is nil.

func (t Time) IsDST() bool
    IsDST reports whether the time in the configured location is in Daylight
    Savings Time.

func (t Time) IsZero() bool
    IsZero reports whether t represents the zero time instant, January 1,
    year 1, 00:00:00 UTC.

func (t Time) Local() Time
    Local returns t with the location set to local time.

func (t Time) Location() *Location
    Location returns the time zone information associated with t.

func (t Time) MarshalBinary() ([]byte, error)
    MarshalBinary implements the encoding.BinaryMarshaler interface.

func (t Time) MarshalJSON() ([]byte, error)
    MarshalJSON implements the encoding/json.Marshaler interface. The time is
    a quoted string in the RFC 3339 format with sub-second precision. If the
    timestamp cannot be represented as valid RFC 3339 (e.g., the year is out of
    range), then an error is reported.

func (t Time) MarshalText() ([]byte, error)
    MarshalText implements the encoding.TextMarshaler interface. The output
    matches that of calling the Time.AppendText method.

    See Time.AppendText for more information.

func (t Time) Minute() int
    Minute returns the minute offset within the hour specified by t, in the
    range [0, 59].

func (t Time) Month() Month
    Month returns the month of the year specified by t.

func (t Time) Nanosecond() int
    Nanosecond returns the nanosecond offset within the second specified by t,
    in the range [0, 999999999].

func (t Time) Round(d Duration) Time
    Round returns the result of rounding t to the nearest multiple of d (since
    the zero time). The rounding behavior for halfway values is to round up.
    If d <= 0, Round returns t stripped of any monotonic clock reading but
    otherwise unchanged.

    Round operates on the time as an absolute duration since the zero time;
    it does not operate on the presentation form of the time. Thus, Round(Hour)
    may return a time with a non-zero minute, depending on the time's Location.

func (t Time) Second() int
    Second returns the second offset within the minute specified by t, in the
    range [0, 59].

func (t Time) String() string
    String returns the time formatted using the format string

        "2006-01-02 15:04:05.999999999 -0700 MST"

    If the time has a monotonic clock reading, the returned string includes
    a final field "m=±<value>", where value is the monotonic clock reading
    formatted as a decimal number of seconds.

    The returned string is meant for debugging; for a stable serialized
    representation, use t.MarshalText, t.MarshalBinary, or t.Format with an
    explicit format string.

func (t Time) Sub(u Time) Duration
    Sub returns the duration t-u. If the result exceeds the maximum (or minimum)
    value that can be stored in a Duration, the maximum (or minimum) duration
    will be returned. To compute t-d for a duration d, use t.Add(-d).

func (t Time) Truncate(d Duration) Time
    Truncate returns the result of rounding t down to a multiple of d (since the
    zero time). If d <= 0, Truncate returns t stripped of any monotonic clock
    reading but otherwise unchanged.

    Truncate operates on the time as an absolute duration since the zero time;
    it does not operate on the presentation form of the time. Thus,
    Truncate(Hour) may return a time with a non-zero minute, depending on the
    time's Location.

func (t Time) UTC() Time
    UTC returns t with the location set to UTC.

func (t Time) Unix() int64
    Unix returns t as a Unix time, the number of seconds elapsed since January
    1, 1970 UTC. The result does not depend on the location associated with t.
    Unix-like operating systems often record time as a 32-bit count of seconds,
    but since the method here returns a 64-bit value it is valid for billions of
    years into the past or future.

func (t Time) UnixMicro() int64
    UnixMicro returns t as a Unix time, the number of microseconds elapsed
    since January 1, 1970 UTC. The result is undefined if the Unix time in
    microseconds cannot be represented by an int64 (a date before year -290307
    or after year 294246). The result does not depend on the location associated
    with t.

func (t Time) UnixMilli() int64
    UnixMilli returns t as a Unix time, the number of milliseconds elapsed
    since January 1, 1970 UTC. The result is undefined if the Unix time in
    milliseconds cannot be represented by an int64 (a date more than 292 million
    years before or after 1970). The result does not depend on the location
    associated with t.

func (t Time) UnixNano() int64
    UnixNano returns t as a Unix time, the number of nanoseconds elapsed since
    January 1, 1970 UTC. The result is undefined if the Unix time in nanoseconds
    cannot be represented by an int64 (a date before the year 1678 or after
    2262). Note that this means the result of calling UnixNano on the zero Time
    is undefined. The result does not depend on the location associated with t.

func (t *Time) UnmarshalBinary(data []byte) error
    UnmarshalBinary implements the encoding.BinaryUnmarshaler interface.

func (t *Time) UnmarshalJSON(data []byte) error
    UnmarshalJSON implements the encoding/json.Unmarshaler interface. The time
    must be a quoted string in the RFC 3339 format.

func (t *Time) UnmarshalText(data []byte) error
    UnmarshalText implements the encoding.TextUnmarshaler interface. The time
    must be in the RFC 3339 format.

func (t Time) Weekday() Weekday
    Weekday returns the day of the week specified by t.

func (t Time) Year() int
    Year returns the year in which t occurs.

func (t Time) YearDay() int
    YearDay returns the day of the year specified by t, in the range [1,365] for
    non-leap years, and [1,366] in leap years.

func (t Time) Zone() (name string, offset int)
    Zone computes the time zone in effect at time t, returning the abbreviated
    name of the zone (such as "CET") and its offset in seconds east of UTC.

func (t Time) ZoneBounds() (start, end Time)
    ZoneBounds returns the bounds of the time zone in effect at time t.
    The zone begins at start and the next zone begins at end. If the zone begins
    at the beginning of time, start will be returned as a zero Time. If the zone
    goes on forever, end will be returned as a zero Time. The Location of the
    returned times will be the same as t.

type Timer struct {
	C <-chan Time
	// Has unexported fields.
}
    The Timer type represents a single event. When the Timer expires, the
    current time will be sent on C, unless the Timer was created by AfterFunc.
    A Timer must be created with NewTimer or AfterFunc.

func AfterFunc(d Duration, f func()) *Timer
    AfterFunc waits for the duration to elapse and then calls f in its own
    goroutine. It returns a Timer that can be used to cancel the call using its
    Stop method. The returned Timer's C field is not used and will be nil.

func NewTimer(d Duration) *Timer
    NewTimer creates a new Timer that will send the current time on its channel
    after at least duration d.

    Before Go 1.23, the garbage collector did not recover timers that had not
    yet expired or been stopped, so code often immediately deferred t.Stop
    after calling NewTimer, to make the timer recoverable when it was no longer
    needed. As of Go 1.23, the garbage collector can recover unreferenced
    timers, even if they haven't expired or been stopped. The Stop method is no
    longer necessary to help the garbage collector. (Code may of course still
    want to call Stop to stop the timer for other reasons.)

    Before Go 1.23, the channel associated with a Timer was asynchronous
    (buffered, capacity 1), which meant that stale time values could be received
    even after Timer.Stop or Timer.Reset returned. As of Go 1.23, the channel is
    synchronous (unbuffered, capacity 0), eliminating the possibility of those
    stale values.

func (t *Timer) Reset(d Duration) bool
    Reset changes the timer to expire after duration d. It returns true if the
    timer had been active, false if the timer had expired or been stopped.

    For a func-based timer created with AfterFunc(d, f), Reset either
    reschedules when f will run, in which case Reset returns true, or schedules
    f to run again, in which case it returns false. When Reset returns false,
    Reset neither waits for the prior f to complete before returning nor does it
    guarantee that the subsequent goroutine running f does not run concurrently
    with the prior one. If the caller needs to know whether the prior execution
    of f is completed, it must coordinate with f explicitly.

    For a chan-based timer created with NewTimer, as of Go 1.23, any receive
    from t.C after Reset has returned is guaranteed not to receive a time
    value corresponding to the previous timer settings; if the program has not
    received from t.C already and the timer is running, Reset is guaranteed
    to return true. Before Go 1.23, the only safe way to use Reset was to
    call Timer.Stop and explicitly drain the timer first. See the NewTimer
    documentation for more details.

func (t *Timer) Stop() bool
    Stop prevents the Timer from firing. It returns true if the call stops the
    timer, false if the timer has already expired or been stopped.

    For a func-based timer created with AfterFunc(d, f), if t.Stop returns
    false, then the timer has already expired and the function f has been
    started in its own goroutine; Stop does not wait for f to complete before
    returning. If the caller needs to know whether f is completed, it must
    coordinate with f explicitly.

    For a chan-based timer created with NewTimer(d), as of Go 1.23, any receive
    from t.C after Stop has returned is guaranteed to block rather than receive
    a stale time value from before the Stop; if the program has not received
    from t.C already and the timer is running, Stop is guaranteed to return
    true. Before Go 1.23, the only safe way to use Stop was insert an extra
    <-t.C if Stop returned false to drain a potential stale value. See the
    NewTimer documentation for more details.

type Weekday int
    A Weekday specifies a day of the week (Sunday = 0, ...).

const (
	Sunday Weekday = iota
	Monday
	Tuesday
	Wednesday
	Thursday
	Friday
	Saturday
)
func (d Weekday) String() string
    String returns the English name of the day ("Sunday", "Monday", ...).
```

## testing

```go
package testing // import "testing"

Package testing provides support for automated testing of Go packages.
It is intended to be used in concert with the "go test" command, which automates
execution of any function of the form

    func TestXxx(*testing.T)

where Xxx does not start with a lowercase letter. The function name serves to
identify the test routine.

Within these functions, use T.Error, T.Fail or related methods to signal
failure.

To write a new test suite, create a file that contains the TestXxx functions as
described here, and give that file a name ending in "_test.go". The file will
be excluded from regular package builds but will be included when the "go test"
command is run.

The test file can be in the same package as the one being tested, or in a
corresponding package with the suffix "_test".

If the test file is in the same package, it may refer to unexported identifiers
within the package, as in this example:

    package abs

    import "testing"

    func TestAbs(t *testing.T) {
        got := abs(-1)
        if got != 1 {
            t.Errorf("abs(-1) = %d; want 1", got)
        }
    }

If the file is in a separate "_test" package, the package being tested must be
imported explicitly and only its exported identifiers may be used. This is known
as "black box" testing.

    package abs_test

    import (
    	"testing"

    	"path_to_pkg/abs"
    )

    func TestAbs(t *testing.T) {
        got := abs.Abs(-1)
        if got != 1 {
            t.Errorf("Abs(-1) = %d; want 1", got)
        }
    }

For more detail, run go help test and go help testflag.

# Benchmarks

Functions of the form

    func BenchmarkXxx(*testing.B)

are considered benchmarks, and are executed by the "go test" command when its
-bench flag is provided. Benchmarks are run sequentially.

For a description of the testing flags, see go help testflag.

A sample benchmark function looks like this:

    func BenchmarkRandInt(b *testing.B) {
        for b.Loop() {
            rand.Int()
        }
    }

The output

    BenchmarkRandInt-8   	68453040	        17.8 ns/op

means that the body of the loop ran 68453040 times at a speed of 17.8 ns per
loop.

Only the body of the loop is timed, so benchmarks may do expensive setup before
calling b.Loop, which will not be counted toward the benchmark measurement:

    func BenchmarkBigLen(b *testing.B) {
        big := NewBig()
        for b.Loop() {
            big.Len()
        }
    }

If a benchmark needs to test performance in a parallel setting, it may use the
RunParallel helper function; such benchmarks are intended to be used with the go
test -cpu flag:

    func BenchmarkTemplateParallel(b *testing.B) {
        templ := template.Must(template.New("test").Parse("Hello, {{.}}!"))
        b.RunParallel(func(pb *testing.PB) {
            var buf bytes.Buffer
            for pb.Next() {
                buf.Reset()
                templ.Execute(&buf, "World")
            }
        })
    }

A detailed specification of the benchmark results format is given in
https://go.dev/design/14313-benchmark-format.

There are standard tools for working with benchmark results at
golang.org/x/perf/cmd. In particular, golang.org/x/perf/cmd/benchstat performs
statistically robust A/B comparisons.

# b.N-style benchmarks

Prior to the introduction of B.Loop, benchmarks were written in a different
style using B.N. For example:

    func BenchmarkRandInt(b *testing.B) {
        for range b.N {
            rand.Int()
        }
    }

In this style of benchmark, the benchmark function must run the target code b.N
times. The benchmark function is called multiple times with b.N adjusted until
the benchmark function lasts long enough to be timed reliably. This also means
any setup done before the loop may be run several times.

If a benchmark needs some expensive setup before running, the timer should be
explicitly reset:

    func BenchmarkBigLen(b *testing.B) {
        big := NewBig()
        b.ResetTimer()
        for range b.N {
            big.Len()
        }
    }

New benchmarks should prefer using B.Loop, which is more robust and more
efficient.

# Examples

The package also runs and verifies example code. Example functions may include
a concluding line comment that begins with "Output:" and is compared with the
standard output of the function when the tests are run. (The comparison ignores
leading and trailing space.) These are examples of an example:

    func ExampleHello() {
        fmt.Println("hello")
        // Output: hello
    }

    func ExampleSalutations() {
        fmt.Println("hello, and")
        fmt.Println("goodbye")
        // Output:
        // hello, and
        // goodbye
    }

The comment prefix "Unordered output:" is like "Output:", but matches any line
order:

    func ExamplePerm() {
        for _, value := range Perm(5) {
            fmt.Println(value)
        }
        // Unordered output: 4
        // 2
        // 1
        // 3
        // 0
    }

Example functions without output comments are compiled but not executed.

The naming convention to declare examples for the package, a function F,
a type T and method M on type T are:

    func Example() { ... }
    func ExampleF() { ... }
    func ExampleT() { ... }
    func ExampleT_M() { ... }

Multiple example functions for a package/type/function/method may be provided by
appending a distinct suffix to the name. The suffix must start with a lower-case
letter.

    func Example_suffix() { ... }
    func ExampleF_suffix() { ... }
    func ExampleT_suffix() { ... }
    func ExampleT_M_suffix() { ... }

The entire test file is presented as the example when it contains a single
example function, at least one other function, type, variable, or constant
declaration, and no test or benchmark functions.

# Fuzzing

'go test' and the testing package support fuzzing, a testing technique where a
function is called with randomly generated inputs to find bugs not anticipated
by unit tests.

Functions of the form

    func FuzzXxx(*testing.F)

are considered fuzz tests.

For example:

    func FuzzHex(f *testing.F) {
      for _, seed := range [][]byte{{}, {0}, {9}, {0xa}, {0xf}, {1, 2, 3, 4}} {
        f.Add(seed)
      }
      f.Fuzz(func(t *testing.T, in []byte) {
        enc := hex.EncodeToString(in)
        out, err := hex.DecodeString(enc)
        if err != nil {
          t.Fatalf("%v: decode: %v", in, err)
        }
        if !bytes.Equal(in, out) {
          t.Fatalf("%v: not equal after round trip: %v", in, out)
        }
      })
    }

A fuzz test maintains a seed corpus, or a set of inputs which are run by
default, and can seed input generation. Seed inputs may be registered by calling
F.Add or by storing files in the directory testdata/fuzz/<Name> (where <Name>
is the name of the fuzz test) within the package containing the fuzz test. Seed
inputs are optional, but the fuzzing engine may find bugs more efficiently when
provided with a set of small seed inputs with good code coverage. These seed
inputs can also serve as regression tests for bugs identified through fuzzing.

The function passed to F.Fuzz within the fuzz test is considered the fuzz
target. A fuzz target must accept a *T parameter, followed by one or more
parameters for random inputs. The types of arguments passed to F.Add must be
identical to the types of these parameters. The fuzz target may signal that it's
found a problem the same way tests do: by calling T.Fail (or any method that
calls it like T.Error or T.Fatal) or by panicking.

When fuzzing is enabled (by setting the -fuzz flag to a regular expression
that matches a specific fuzz test), the fuzz target is called with arguments
generated by repeatedly making random changes to the seed inputs. On supported
platforms, 'go test' compiles the test executable with fuzzing coverage
instrumentation. The fuzzing engine uses that instrumentation to find and
cache inputs that expand coverage, increasing the likelihood of finding bugs.
If the fuzz target fails for a given input, the fuzzing engine writes the inputs
that caused the failure to a file in the directory testdata/fuzz/<Name> within
the package directory. This file later serves as a seed input. If the file can't
be written at that location (for example, because the directory is read-only),
the fuzzing engine writes the file to the fuzz cache directory within the build
cache instead.

When fuzzing is disabled, the fuzz target is called with the seed inputs
registered with F.Add and seed inputs from testdata/fuzz/<Name>. In this mode,
the fuzz test acts much like a regular test, with subtests started with F.Fuzz
instead of T.Run.

See https://go.dev/doc/fuzz for documentation about fuzzing.

# Skipping

Tests or benchmarks may be skipped at run time with a call to T.Skip or B.Skip:

    func TestTimeConsuming(t *testing.T) {
        if testing.Short() {
            t.Skip("skipping test in short mode.")
        }
        ...
    }

The T.Skip method can be used in a fuzz target if the input is invalid,
but should not be considered a failing input. For example:

    func FuzzJSONMarshaling(f *testing.F) {
        f.Fuzz(func(t *testing.T, b []byte) {
            var v interface{}
            if err := json.Unmarshal(b, &v); err != nil {
                t.Skip()
            }
            if _, err := json.Marshal(v); err != nil {
                t.Errorf("Marshal: %v", err)
            }
        })
    }

# Subtests and Sub-benchmarks

The T.Run and B.Run methods allow defining subtests and sub-benchmarks,
without having to define separate functions for each. This enables uses like
table-driven benchmarks and creating hierarchical tests. It also provides a way
to share common setup and tear-down code:

    func TestFoo(t *testing.T) {
        // <setup code>
        t.Run("A=1", func(t *testing.T) { ... })
        t.Run("A=2", func(t *testing.T) { ... })
        t.Run("B=1", func(t *testing.T) { ... })
        // <tear-down code>
    }

Each subtest and sub-benchmark has a unique name: the combination of the name
of the top-level test and the sequence of names passed to Run, separated by
slashes, with an optional trailing sequence number for disambiguation.

The argument to the -run, -bench, and -fuzz command-line flags is an
unanchored regular expression that matches the test's name. For tests with
multiple slash-separated elements, such as subtests, the argument is itself
slash-separated, with expressions matching each name element in turn.
Because it is unanchored, an empty expression matches any string. For example,
using "matching" to mean "whose name contains":

    go test -run ''        # Run all tests.
    go test -run Foo       # Run top-level tests matching "Foo", such as "TestFooBar".
    go test -run Foo/A=    # For top-level tests matching "Foo", run subtests matching "A=".
    go test -run /A=1      # For all top-level tests, run subtests matching "A=1".
    go test -fuzz FuzzFoo  # Fuzz the target matching "FuzzFoo"

The -run argument can also be used to run a specific value in the seed corpus,
for debugging. For example:

    go test -run=FuzzFoo/9ddb952d9814

The -fuzz and -run flags can both be set, in order to fuzz a target but skip the
execution of all other tests.

Subtests can also be used to control parallelism. A parent test will only
complete once all of its subtests complete. In this example, all tests are
run in parallel with each other, and only with each other, regardless of other
top-level tests that may be defined:

    func TestGroupedParallel(t *testing.T) {
        for _, tc := range tests {
            t.Run(tc.Name, func(t *testing.T) {
                t.Parallel()
                ...
            })
        }
    }

Run does not return until parallel subtests have completed, providing a way to
clean up after a group of parallel tests:

    func TestTeardownParallel(t *testing.T) {
        // This Run will not return until the parallel tests finish.
        t.Run("group", func(t *testing.T) {
            t.Run("Test1", parallelTest1)
            t.Run("Test2", parallelTest2)
            t.Run("Test3", parallelTest3)
        })
        // <tear-down code>
    }

# Main

It is sometimes necessary for a test or benchmark program to do extra setup or
teardown before or after it executes. It is also sometimes necessary to control
which code runs on the main thread. To support these and other cases, if a test
file contains a function:

    func TestMain(m *testing.M)

then the generated test will call TestMain(m) instead of running the tests or
benchmarks directly. TestMain runs in the main goroutine and can do whatever
setup and teardown is necessary around a call to m.Run. m.Run will return an
exit code that may be passed to os.Exit. If TestMain returns, the test wrapper
will pass the result of m.Run to os.Exit itself.

When TestMain is called, flag.Parse has not been run. If TestMain depends on
command-line flags, including those of the testing package, it should call
flag.Parse explicitly. Command line flags are always parsed by the time test or
benchmark functions run.

A simple implementation of TestMain is:

    func TestMain(m *testing.M) {
    	// call flag.Parse() here if TestMain uses flags
    	m.Run()
    }

TestMain is a low-level primitive and should not be necessary for casual testing
needs, where ordinary test functions suffice.

[go help test]: https://pkg.go.dev/cmd/go#hdr-Test_packages
[go help testflag]: https://pkg.go.dev/cmd/go#hdr-Testing_flags

FUNCTIONS

func AllocsPerRun(runs int, f func()) (avg float64)
    AllocsPerRun returns the average number of allocations during calls to f.
    Although the return value has type float64, it will always be an integral
    value.

    To compute the number of allocations, the function will first be run once
    as a warm-up. The average number of allocations over the specified number of
    runs will then be measured and returned.

    AllocsPerRun sets runtime.GOMAXPROCS to 1 during its measurement and will
    restore it before returning.

func CoverMode() string
    CoverMode reports what the test coverage mode is set to. The values are
    "set", "count", or "atomic". The return value will be empty if test coverage
    is not enabled.

func Coverage() float64
    Coverage reports the current code coverage as a fraction in the range [0,
    1]. If coverage is not enabled, Coverage returns 0.

    When running a large set of sequential test cases, checking Coverage after
    each one can be useful for identifying which test cases exercise new code
    paths. It is not a replacement for the reports generated by 'go test -cover'
    and 'go tool cover'.

func Init()
    Init registers testing flags. These flags are automatically registered by
    the "go test" command before running test functions, so Init is only needed
    when calling functions such as Benchmark without using "go test".

    Init is not safe to call concurrently. It has no effect if it was already
    called.

func Main(matchString func(pat, str string) (bool, error), tests []InternalTest, benchmarks []InternalBenchmark, examples []InternalExample)
    Main is an internal function, part of the implementation of the "go test"
    command. It was exported because it is cross-package and predates "internal"
    packages. It is no longer used by "go test" but preserved, as much as
    possible, for other systems that simulate "go test" using Main, but Main
    sometimes cannot be updated as new functionality is added to the testing
    package. Systems simulating "go test" should be updated to use MainStart.

func RegisterCover(c Cover)
    RegisterCover records the coverage data accumulators for the tests. NOTE:
    This function is internal to the testing infrastructure and may change.
    It is not covered (yet) by the Go 1 compatibility guidelines.

func RunBenchmarks(matchString func(pat, str string) (bool, error), benchmarks []InternalBenchmark)
    RunBenchmarks is an internal function but exported because it is
    cross-package; it is part of the implementation of the "go test" command.

func RunExamples(matchString func(pat, str string) (bool, error), examples []InternalExample) (ok bool)
    RunExamples is an internal function but exported because it is
    cross-package; it is part of the implementation of the "go test" command.

func RunTests(matchString func(pat, str string) (bool, error), tests []InternalTest) (ok bool)
    RunTests is an internal function but exported because it is cross-package;
    it is part of the implementation of the "go test" command.

func Short() bool
    Short reports whether the -test.short flag is set.

func Testing() bool
    Testing reports whether the current code is being run in a test. This will
    report true in programs created by "go test", false in programs created by
    "go build".

func Verbose() bool
    Verbose reports whether the -test.v flag is set.


TYPES

type B struct {
	N int

	// Has unexported fields.
}
    B is a type passed to Benchmark functions to manage benchmark timing and
    control the number of iterations.

    A benchmark ends when its Benchmark function returns or calls any of the
    methods B.FailNow, B.Fatal, B.Fatalf, B.SkipNow, B.Skip, or B.Skipf.
    Those methods must be called only from the goroutine running the Benchmark
    function. The other reporting methods, such as the variations of B.Log and
    B.Error, may be called simultaneously from multiple goroutines.

    Like in tests, benchmark logs are accumulated during execution and dumped
    to standard output when done. Unlike in tests, benchmark logs are always
    printed, so as not to hide output whose existence may be affecting benchmark
    results.

func (c *B) ArtifactDir() string
    ArtifactDir returns a directory in which the test should store output files.
    When the -artifacts flag is provided, this directory is located under the
    output directory. Otherwise, ArtifactDir returns a temporary directory that
    is removed after the test completes.

    Each test or subtest within each test package has a unique artifact
    directory. Repeated calls to ArtifactDir in the same test or subtest return
    the same directory. Subtest outputs are not located under the parent test's
    output directory.

func (c *B) Attr(key, value string)
    Attr emits a test attribute associated with this test.

    The key must not contain whitespace. The value must not contain newlines or
    carriage returns.

    The meaning of different attribute keys is left up to continuous integration
    systems and test frameworks.

    Test attributes are emitted immediately in the test log, but they are
    intended to be treated as unordered.

func (c *B) Chdir(dir string)
    Chdir calls os.Chdir and uses Cleanup to restore the current working
    directory to its original value after the test. On Unix, it also sets PWD
    environment variable for the duration of the test.

    Because Chdir affects the whole process, it cannot be used in parallel tests
    or tests with parallel ancestors.

func (c *B) Cleanup(f func())
    Cleanup registers a function to be called when the test (or subtest) and
    all its subtests complete. Cleanup functions will be called in last added,
    first called order.

func (c *B) Context() context.Context
    Context returns a context that is canceled just before Cleanup-registered
    functions are called.

    Cleanup functions can wait for any resources that shut down on
    context.Context.Done before the test or benchmark completes.

func (b *B) Elapsed() time.Duration
    Elapsed returns the measured elapsed time of the benchmark. The duration
    reported by Elapsed matches the one measured by B.StartTimer, B.StopTimer,
    and B.ResetTimer.

func (c *B) Error(args ...any)
    Error is equivalent to Log followed by Fail.

func (c *B) Errorf(format string, args ...any)
    Errorf is equivalent to Logf followed by Fail.

func (c *B) Fail()
    Fail marks the function as having failed but continues execution.

func (c *B) FailNow()
    FailNow marks the function as having failed and stops its execution by
    calling runtime.Goexit (which then runs all deferred calls in the current
    goroutine). Execution will continue at the next test or benchmark. FailNow
    must be called from the goroutine running the test or benchmark function,
    not from other goroutines created during the test. Calling FailNow does not
    stop those other goroutines.

func (c *B) Failed() bool
    Failed reports whether the function has failed.

func (c *B) Fatal(args ...any)
    Fatal is equivalent to Log followed by FailNow.

func (c *B) Fatalf(format string, args ...any)
    Fatalf is equivalent to Logf followed by FailNow.

func (c *B) Helper()
    Helper marks the calling function as a test helper function. When printing
    file and line information, that function will be skipped. Helper may be
    called simultaneously from multiple goroutines.

func (c *B) Log(args ...any)
    Log formats its arguments using default formatting, analogous to
    fmt.Println, and records the text in the error log. For tests, the text
    will be printed only if the test fails or the -test.v flag is set. For
    benchmarks, the text is always printed to avoid having performance depend
    on the value of the -test.v flag. It is an error to call Log after a test or
    benchmark returns.

func (c *B) Logf(format string, args ...any)
    Logf formats its arguments according to the format, analogous to fmt.Printf,
    and records the text in the error log. A final newline is added if not
    provided. For tests, the text will be printed only if the test fails or the
    -test.v flag is set. For benchmarks, the text is always printed to avoid
    having performance depend on the value of the -test.v flag. It is an error
    to call Logf after a test or benchmark returns.

func (b *B) Loop() bool
    Loop returns true as long as the benchmark should continue running.

    A typical benchmark is structured like:

        func Benchmark(b *testing.B) {
        	... setup ...
        	for b.Loop() {
        		... code to measure ...
        	}
        	... cleanup ...
        }

    Loop resets the benchmark timer the first time it is called in a benchmark,
    so any setup performed prior to starting the benchmark loop does not count
    toward the benchmark measurement. Likewise, when it returns false, it stops
    the timer so cleanup code is not measured.

    Within the body of a "for b.Loop() { ... }" loop, arguments to and results
    from function calls and assigned variables within the loop are kept alive,
    preventing the compiler from fully optimizing away the loop body. Currently,
    this is implemented as a compiler transformation that wraps such variables
    with a runtime.KeepAlive intrinsic call. This applies only to statements
    syntactically between the curly braces of the loop, and the loop condition
    must be written exactly as "b.Loop()".

    After Loop returns false, b.N contains the total number of iterations that
    ran, so the benchmark may use b.N to compute other average metrics.

    Prior to the introduction of Loop, benchmarks were expected to contain an
    explicit loop from 0 to b.N. Benchmarks should either use Loop or contain
    a loop to b.N, but not both. Loop offers more automatic management of the
    benchmark timer, and runs each benchmark function only once per measurement,
    whereas b.N-based benchmarks must run the benchmark function (and any
    associated setup and cleanup) several times.

func (c *B) Name() string
    Name returns the name of the running (sub-) test or benchmark.

    The name will include the name of the test along with the names of any
    nested sub-tests. If two sibling sub-tests have the same name, Name will
    append a suffix to guarantee the returned name is unique.

func (c *B) Output() io.Writer
    Output returns a Writer that writes to the same test output stream as
    TB.Log. The output is indented like TB.Log lines, but Output does not add
    source locations or newlines. The output is internally line buffered, and
    a call to TB.Log or the end of the test will implicitly flush the buffer,
    followed by a newline. After a test function and all its parents return,
    neither Output nor the Write method may be called.

func (b *B) ReportAllocs()
    ReportAllocs enables malloc statistics for this benchmark. It is equivalent
    to setting -test.benchmem, but it only affects the benchmark function that
    calls ReportAllocs.

func (b *B) ReportMetric(n float64, unit string)
    ReportMetric adds "n unit" to the reported benchmark results. If the metric
    is per-iteration, the caller should divide by b.N, and by convention units
    should end in "/op". ReportMetric overrides any previously reported value
    for the same unit. ReportMetric panics if unit is the empty string or if
    unit contains any whitespace. If unit is a unit normally reported by the
    benchmark framework itself (such as "allocs/op"), ReportMetric will override
    that metric. Setting "ns/op" to 0 will suppress that built-in metric.

func (b *B) ResetTimer()
    ResetTimer zeroes the elapsed benchmark time and memory allocation counters
    and deletes user-reported metrics. It does not affect whether the timer is
    running.

func (b *B) Run(name string, f func(b *B)) bool
    Run benchmarks f as a subbenchmark with the given name. It reports whether
    there were any failures.

    A subbenchmark is like any other benchmark. A benchmark that calls Run at
    least once will not be measured itself and will be called once with N=1.

func (b *B) RunParallel(body func(*PB))
    RunParallel runs a benchmark in parallel. It creates multiple goroutines and
    distributes b.N iterations among them. The number of goroutines defaults
    to GOMAXPROCS. To increase parallelism for non-CPU-bound benchmarks,
    call B.SetParallelism before RunParallel. RunParallel is usually used with
    the go test -cpu flag.

    The body function will be run in each goroutine. It should set up any
    goroutine-local state and then iterate until pb.Next returns false.
    It should not use the B.StartTimer, B.StopTimer, or B.ResetTimer functions,
    because they have global effect. It should also not call B.Run.

    RunParallel reports ns/op values as wall time for the benchmark as a whole,
    not the sum of wall time or CPU time over each parallel goroutine.

func (b *B) SetBytes(n int64)
    SetBytes records the number of bytes processed in a single operation.
    If this is called, the benchmark will report ns/op and MB/s.

func (b *B) SetParallelism(p int)
    SetParallelism sets the number of goroutines used by B.RunParallel to
    p*GOMAXPROCS. There is usually no need to call SetParallelism for CPU-bound
    benchmarks. If p is less than 1, this call will have no effect.

func (c *B) Setenv(key, value string)
    Setenv calls os.Setenv and uses Cleanup to restore the environment variable
    to its original value after the test.

    Because Setenv affects the whole process, it cannot be used in parallel
    tests or tests with parallel ancestors.

func (c *B) Skip(args ...any)
    Skip is equivalent to Log followed by SkipNow.

func (c *B) SkipNow()
    SkipNow marks the test as having been skipped and stops its execution by
    calling runtime.Goexit. If a test fails (see Error, Errorf, Fail) and is
    then skipped, it is still considered to have failed. Execution will continue
    at the next test or benchmark. See also FailNow. SkipNow must be called from
    the goroutine running the test, not from other goroutines created during the
    test. Calling SkipNow does not stop those other goroutines.

func (c *B) Skipf(format string, args ...any)
    Skipf is equivalent to Logf followed by SkipNow.

func (c *B) Skipped() bool
    Skipped reports whether the test was skipped.

func (b *B) StartTimer()
    StartTimer starts timing a test. This function is called automatically
    before a benchmark starts, but it can also be used to resume timing after a
    call to B.StopTimer.

func (b *B) StopTimer()
    StopTimer stops timing a test. This can be used to pause the timer while
    performing steps that you don't want to measure.

func (c *B) TempDir() string
    TempDir returns a temporary directory for the test to use. The directory
    is automatically removed when the test and all its subtests complete.
    Each subsequent call to TempDir returns a unique directory; if the
    directory creation fails, TempDir terminates the test by calling Fatal.
    If the environment variable GOTMPDIR is set, the temporary directory will be
    created somewhere beneath it.

type BenchmarkResult struct {
	N         int           // The number of iterations.
	T         time.Duration // The total time taken.
	Bytes     int64         // Bytes processed in one iteration.
	MemAllocs uint64        // The total number of memory allocations.
	MemBytes  uint64        // The total number of bytes allocated.

	// Extra records additional metrics reported by ReportMetric.
	Extra map[string]float64
}
    BenchmarkResult contains the results of a benchmark run.

func Benchmark(f func(b *B)) BenchmarkResult
    Benchmark benchmarks a single function. It is useful for creating custom
    benchmarks that do not use the "go test" command.

    If f depends on testing flags, then Init must be used to register those
    flags before calling Benchmark and before calling flag.Parse.

    If f calls Run, the result will be an estimate of running all its
    subbenchmarks that don't call Run in sequence in a single benchmark.

func (r BenchmarkResult) AllocedBytesPerOp() int64
    AllocedBytesPerOp returns the "B/op" metric, which is calculated as
    r.MemBytes / r.N.

func (r BenchmarkResult) AllocsPerOp() int64
    AllocsPerOp returns the "allocs/op" metric, which is calculated as
    r.MemAllocs / r.N.

func (r BenchmarkResult) MemString() string
    MemString returns r.AllocedBytesPerOp and r.AllocsPerOp in the same format
    as 'go test'.

func (r BenchmarkResult) NsPerOp() int64
    NsPerOp returns the "ns/op" metric.

func (r BenchmarkResult) String() string
    String returns a summary of the benchmark results. It follows the benchmark
    result line format from https://golang.org/design/14313-benchmark-format,
    not including the benchmark name. Extra metrics override built-in metrics
    of the same name. String does not include allocs/op or B/op, since those are
    reported by BenchmarkResult.MemString.

type Cover struct {
	Mode            string
	Counters        map[string][]uint32
	Blocks          map[string][]CoverBlock
	CoveredPackages string
}
    Cover records information about test coverage checking. NOTE: This struct
    is internal to the testing infrastructure and may change. It is not covered
    (yet) by the Go 1 compatibility guidelines.

type CoverBlock struct {
	Line0 uint32 // Line number for block start.
	Col0  uint16 // Column number for block start.
	Line1 uint32 // Line number for block end.
	Col1  uint16 // Column number for block end.
	Stmts uint16 // Number of statements included in this block.
}
    CoverBlock records the coverage data for a single basic block. The fields
    are 1-indexed, as in an editor: The opening line of the file is number 1,
    for example. Columns are measured in bytes. NOTE: This struct is internal to
    the testing infrastructure and may change. It is not covered (yet) by the Go
    1 compatibility guidelines.

type F struct {
	// Has unexported fields.
}
    F is a type passed to fuzz tests.

    Fuzz tests run generated inputs against a provided fuzz target, which can
    find and report potential bugs in the code being tested.

    A fuzz test runs the seed corpus by default, which includes entries provided
    by F.Add and entries in the testdata/fuzz/<FuzzTestName> directory.
    After any necessary setup and calls to F.Add, the fuzz test must then call
    F.Fuzz to provide the fuzz target. See the testing package documentation for
    an example, and see the F.Fuzz and F.Add method documentation for details.

    *F methods can only be called before F.Fuzz. Once the test is executing
    the fuzz target, only *T methods can be used. The only *F methods that are
    allowed in the F.Fuzz function are F.Failed and F.Name.

func (f *F) Add(args ...any)
    Add will add the arguments to the seed corpus for the fuzz test. This will
    be a no-op if called after or within the fuzz target, and args must match
    the arguments for the fuzz target.

func (c *F) ArtifactDir() string
    ArtifactDir returns a directory in which the test should store output files.
    When the -artifacts flag is provided, this directory is located under the
    output directory. Otherwise, ArtifactDir returns a temporary directory that
    is removed after the test completes.

    Each test or subtest within each test package has a unique artifact
    directory. Repeated calls to ArtifactDir in the same test or subtest return
    the same directory. Subtest outputs are not located under the parent test's
    output directory.

func (c *F) Attr(key, value string)
    Attr emits a test attribute associated with this test.

    The key must not contain whitespace. The value must not contain newlines or
    carriage returns.

    The meaning of different attribute keys is left up to continuous integration
    systems and test frameworks.

    Test attributes are emitted immediately in the test log, but they are
    intended to be treated as unordered.

func (c *F) Chdir(dir string)
    Chdir calls os.Chdir and uses Cleanup to restore the current working
    directory to its original value after the test. On Unix, it also sets PWD
    environment variable for the duration of the test.

    Because Chdir affects the whole process, it cannot be used in parallel tests
    or tests with parallel ancestors.

func (c *F) Cleanup(f func())
    Cleanup registers a function to be called when the test (or subtest) and
    all its subtests complete. Cleanup functions will be called in last added,
    first called order.

func (c *F) Context() context.Context
    Context returns a context that is canceled just before Cleanup-registered
    functions are called.

    Cleanup functions can wait for any resources that shut down on
    context.Context.Done before the test or benchmark completes.

func (c *F) Error(args ...any)
    Error is equivalent to Log followed by Fail.

func (c *F) Errorf(format string, args ...any)
    Errorf is equivalent to Logf followed by Fail.

func (f *F) Fail()
    Fail marks the function as having failed but continues execution.

func (c *F) FailNow()
    FailNow marks the function as having failed and stops its execution by
    calling runtime.Goexit (which then runs all deferred calls in the current
    goroutine). Execution will continue at the next test or benchmark. FailNow
    must be called from the goroutine running the test or benchmark function,
    not from other goroutines created during the test. Calling FailNow does not
    stop those other goroutines.

func (c *F) Failed() bool
    Failed reports whether the function has failed.

func (c *F) Fatal(args ...any)
    Fatal is equivalent to Log followed by FailNow.

func (c *F) Fatalf(format string, args ...any)
    Fatalf is equivalent to Logf followed by FailNow.

func (f *F) Fuzz(ff any)
    Fuzz runs the fuzz function, ff, for fuzz testing. If ff fails for a set of
    arguments, those arguments will be added to the seed corpus.

    ff must be a function with no return value whose first argument is *T and
    whose remaining arguments are the types to be fuzzed. For example:

        f.Fuzz(func(t *testing.T, b []byte, i int) { ... })

    The following types are allowed: []byte, string, bool, byte, rune, float32,
    float64, int, int8, int16, int32, int64, uint, uint8, uint16, uint32,
    uint64. More types may be supported in the future.

    ff must not call any *F methods, e.g. F.Log, F.Error, F.Skip. Use the
    corresponding *T method instead. The only *F methods that are allowed in the
    F.Fuzz function are F.Failed and F.Name.

    This function should be fast and deterministic, and its behavior should not
    depend on shared state. No mutable input arguments, or pointers to them,
    should be retained between executions of the fuzz function, as the memory
    backing them may be mutated during a subsequent invocation. ff must not
    modify the underlying data of the arguments provided by the fuzzing engine.

    When fuzzing, F.Fuzz does not return until a problem is found, time runs out
    (set with -fuzztime), or the test process is interrupted by a signal. F.Fuzz
    should be called exactly once, unless F.Skip or F.Fail is called beforehand.

func (f *F) Helper()
    Helper marks the calling function as a test helper function. When printing
    file and line information, that function will be skipped. Helper may be
    called simultaneously from multiple goroutines.

func (c *F) Log(args ...any)
    Log formats its arguments using default formatting, analogous to
    fmt.Println, and records the text in the error log. For tests, the text
    will be printed only if the test fails or the -test.v flag is set. For
    benchmarks, the text is always printed to avoid having performance depend
    on the value of the -test.v flag. It is an error to call Log after a test or
    benchmark returns.

func (c *F) Logf(format string, args ...any)
    Logf formats its arguments according to the format, analogous to fmt.Printf,
    and records the text in the error log. A final newline is added if not
    provided. For tests, the text will be printed only if the test fails or the
    -test.v flag is set. For benchmarks, the text is always printed to avoid
    having performance depend on the value of the -test.v flag. It is an error
    to call Logf after a test or benchmark returns.

func (c *F) Name() string
    Name returns the name of the running (sub-) test or benchmark.

    The name will include the name of the test along with the names of any
    nested sub-tests. If two sibling sub-tests have the same name, Name will
    append a suffix to guarantee the returned name is unique.

func (c *F) Output() io.Writer
    Output returns a Writer that writes to the same test output stream as
    TB.Log. The output is indented like TB.Log lines, but Output does not add
    source locations or newlines. The output is internally line buffered, and
    a call to TB.Log or the end of the test will implicitly flush the buffer,
    followed by a newline. After a test function and all its parents return,
    neither Output nor the Write method may be called.

func (c *F) Setenv(key, value string)
    Setenv calls os.Setenv and uses Cleanup to restore the environment variable
    to its original value after the test.

    Because Setenv affects the whole process, it cannot be used in parallel
    tests or tests with parallel ancestors.

func (c *F) Skip(args ...any)
    Skip is equivalent to Log followed by SkipNow.

func (c *F) SkipNow()
    SkipNow marks the test as having been skipped and stops its execution by
    calling runtime.Goexit. If a test fails (see Error, Errorf, Fail) and is
    then skipped, it is still considered to have failed. Execution will continue
    at the next test or benchmark. See also FailNow. SkipNow must be called from
    the goroutine running the test, not from other goroutines created during the
    test. Calling SkipNow does not stop those other goroutines.

func (c *F) Skipf(format string, args ...any)
    Skipf is equivalent to Logf followed by SkipNow.

func (f *F) Skipped() bool
    Skipped reports whether the test was skipped.

func (c *F) TempDir() string
    TempDir returns a temporary directory for the test to use. The directory
    is automatically removed when the test and all its subtests complete.
    Each subsequent call to TempDir returns a unique directory; if the
    directory creation fails, TempDir terminates the test by calling Fatal.
    If the environment variable GOTMPDIR is set, the temporary directory will be
    created somewhere beneath it.

type InternalBenchmark struct {
	Name string
	F    func(b *B)
}
    InternalBenchmark is an internal type but exported because it is
    cross-package; it is part of the implementation of the "go test" command.

type InternalExample struct {
	Name      string
	F         func()
	Output    string
	Unordered bool
}

type InternalFuzzTarget struct {
	Name string
	Fn   func(f *F)
}
    InternalFuzzTarget is an internal type but exported because it is
    cross-package; it is part of the implementation of the "go test" command.

type InternalTest struct {
	Name string
	F    func(*T)
}
    InternalTest is an internal type but exported because it is cross-package;
    it is part of the implementation of the "go test" command.

type M struct {
	// Has unexported fields.
}
    M is a type passed to a TestMain function to run the actual tests.

func MainStart(deps testDeps, tests []InternalTest, benchmarks []InternalBenchmark, fuzzTargets []InternalFuzzTarget, examples []InternalExample) *M
    MainStart is meant for use by tests generated by 'go test'. It is not meant
    to be called directly and is not subject to the Go 1 compatibility document.
    It may change signature from release to release.

func (m *M) Run() (code int)
    Run runs the tests. It returns an exit code to pass to os.Exit. The exit
    code is zero when all tests pass, and non-zero for any kind of failure.
    For machine readable test results, parse the output of 'go test -json'.

type PB struct {
	// Has unexported fields.
}
    A PB is used by RunParallel for running parallel benchmarks.

func (pb *PB) Next() bool
    Next reports whether there are more iterations to execute.

type T struct {
	// Has unexported fields.
}
    T is a type passed to Test functions to manage test state and support
    formatted test logs.

    A test ends when its Test function returns or calls any of the methods
    T.FailNow, T.Fatal, T.Fatalf, T.SkipNow, T.Skip, or T.Skipf. Those methods,
    as well as the T.Parallel method, must be called only from the goroutine
    running the Test function.

    The other reporting methods, such as the variations of T.Log and T.Error,
    may be called simultaneously from multiple goroutines.

func (c *T) ArtifactDir() string
    ArtifactDir returns a directory in which the test should store output files.
    When the -artifacts flag is provided, this directory is located under the
    output directory. Otherwise, ArtifactDir returns a temporary directory that
    is removed after the test completes.

    Each test or subtest within each test package has a unique artifact
    directory. Repeated calls to ArtifactDir in the same test or subtest return
    the same directory. Subtest outputs are not located under the parent test's
    output directory.

func (c *T) Attr(key, value string)
    Attr emits a test attribute associated with this test.

    The key must not contain whitespace. The value must not contain newlines or
    carriage returns.

    The meaning of different attribute keys is left up to continuous integration
    systems and test frameworks.

    Test attributes are emitted immediately in the test log, but they are
    intended to be treated as unordered.

func (t *T) Chdir(dir string)
    Chdir calls os.Chdir and uses Cleanup to restore the current working
    directory to its original value after the test. On Unix, it also sets PWD
    environment variable for the duration of the test.

    Because Chdir affects the whole process, it cannot be used in parallel tests
    or tests with parallel ancestors.

func (c *T) Cleanup(f func())
    Cleanup registers a function to be called when the test (or subtest) and
    all its subtests complete. Cleanup functions will be called in last added,
    first called order.

func (c *T) Context() context.Context
    Context returns a context that is canceled just before Cleanup-registered
    functions are called.

    Cleanup functions can wait for any resources that shut down on
    context.Context.Done before the test or benchmark completes.

func (t *T) Deadline() (deadline time.Time, ok bool)
    Deadline reports the time at which the test binary will have exceeded the
    timeout specified by the -timeout flag.

    The ok result is false if the -timeout flag indicates “no timeout” (0).

func (c *T) Error(args ...any)
    Error is equivalent to Log followed by Fail.

func (c *T) Errorf(format string, args ...any)
    Errorf is equivalent to Logf followed by Fail.

func (c *T) Fail()
    Fail marks the function as having failed but continues execution.

func (c *T) FailNow()
    FailNow marks the function as having failed and stops its execution by
    calling runtime.Goexit (which then runs all deferred calls in the current
    goroutine). Execution will continue at the next test or benchmark. FailNow
    must be called from the goroutine running the test or benchmark function,
    not from other goroutines created during the test. Calling FailNow does not
    stop those other goroutines.

func (c *T) Failed() bool
    Failed reports whether the function has failed.

func (c *T) Fatal(args ...any)
    Fatal is equivalent to Log followed by FailNow.

func (c *T) Fatalf(format string, args ...any)
    Fatalf is equivalent to Logf followed by FailNow.

func (c *T) Helper()
    Helper marks the calling function as a test helper function. When printing
    file and line information, that function will be skipped. Helper may be
    called simultaneously from multiple goroutines.

func (c *T) Log(args ...any)
    Log formats its arguments using default formatting, analogous to
    fmt.Println, and records the text in the error log. For tests, the text
    will be printed only if the test fails or the -test.v flag is set. For
    benchmarks, the text is always printed to avoid having performance depend
    on the value of the -test.v flag. It is an error to call Log after a test or
    benchmark returns.

func (c *T) Logf(format string, args ...any)
    Logf formats its arguments according to the format, analogous to fmt.Printf,
    and records the text in the error log. A final newline is added if not
    provided. For tests, the text will be printed only if the test fails or the
    -test.v flag is set. For benchmarks, the text is always printed to avoid
    having performance depend on the value of the -test.v flag. It is an error
    to call Logf after a test or benchmark returns.

func (c *T) Name() string
    Name returns the name of the running (sub-) test or benchmark.

    The name will include the name of the test along with the names of any
    nested sub-tests. If two sibling sub-tests have the same name, Name will
    append a suffix to guarantee the returned name is unique.

func (c *T) Output() io.Writer
    Output returns a Writer that writes to the same test output stream as
    TB.Log. The output is indented like TB.Log lines, but Output does not add
    source locations or newlines. The output is internally line buffered, and
    a call to TB.Log or the end of the test will implicitly flush the buffer,
    followed by a newline. After a test function and all its parents return,
    neither Output nor the Write method may be called.

func (t *T) Parallel()
    Parallel signals that this test is to be run in parallel with (and only
    with) other parallel tests, and pauses until all non-parallel tests have
    finished.

    When a test is run multiple times due to use of -test.count or -test.cpu,
    multiple instances of a single test never run in parallel with each other.

func (t *T) Run(name string, f func(t *T)) bool
    Run runs f as a subtest of t called name. It runs f in a separate goroutine
    and blocks until f returns or calls t.Parallel to become a parallel test.
    Run reports whether f succeeded (or at least did not fail before calling
    t.Parallel).

    Run may be called simultaneously from multiple goroutines, but all such
    calls must return before the outer test function for t returns.

func (t *T) Setenv(key, value string)
    Setenv calls os.Setenv(key, value) and uses Cleanup to restore the
    environment variable to its original value after the test.

    Because Setenv affects the whole process, it cannot be used in parallel
    tests or tests with parallel ancestors.

func (c *T) Skip(args ...any)
    Skip is equivalent to Log followed by SkipNow.

func (c *T) SkipNow()
    SkipNow marks the test as having been skipped and stops its execution by
    calling runtime.Goexit. If a test fails (see Error, Errorf, Fail) and is
    then skipped, it is still considered to have failed. Execution will continue
    at the next test or benchmark. See also FailNow. SkipNow must be called from
    the goroutine running the test, not from other goroutines created during the
    test. Calling SkipNow does not stop those other goroutines.

func (c *T) Skipf(format string, args ...any)
    Skipf is equivalent to Logf followed by SkipNow.

func (c *T) Skipped() bool
    Skipped reports whether the test was skipped.

func (c *T) TempDir() string
    TempDir returns a temporary directory for the test to use. The directory
    is automatically removed when the test and all its subtests complete.
    Each subsequent call to TempDir returns a unique directory; if the
    directory creation fails, TempDir terminates the test by calling Fatal.
    If the environment variable GOTMPDIR is set, the temporary directory will be
    created somewhere beneath it.

type TB interface {
	ArtifactDir() string
	Attr(key, value string)
	Cleanup(func())
	Error(args ...any)
	Errorf(format string, args ...any)
	Fail()
	FailNow()
	Failed() bool
	Fatal(args ...any)
	Fatalf(format string, args ...any)
	Helper()
	Log(args ...any)
	Logf(format string, args ...any)
	Name() string
	Setenv(key, value string)
	Chdir(dir string)
	Skip(args ...any)
	SkipNow()
	Skipf(format string, args ...any)
	Skipped() bool
	TempDir() string
	Context() context.Context
	Output() io.Writer

	// Has unexported methods.
}
    TB is the interface common to T, B, and F.
```

## sync

```go
package sync // import "sync"

Package sync provides basic synchronization primitives such as mutual exclusion
locks. Other than the Once and WaitGroup types, most are intended for use by
low-level library routines. Higher-level synchronization is better done via
channels and communication.

Values containing the types defined in this package should not be copied.

FUNCTIONS

func OnceFunc(f func()) func()
    OnceFunc returns a function that invokes f only once. The returned function
    may be called concurrently.

    If f panics, the returned function will panic with the same value on every
    call.

func OnceValue[T any](f func() T) func() T
    OnceValue returns a function that invokes f only once and returns the value
    returned by f. The returned function may be called concurrently.

    If f panics, the returned function will panic with the same value on every
    call.

func OnceValues[T1, T2 any](f func() (T1, T2)) func() (T1, T2)
    OnceValues returns a function that invokes f only once and returns the
    values returned by f. The returned function may be called concurrently.

    If f panics, the returned function will panic with the same value on every
    call.


TYPES

type Cond struct {

	// L is held while observing or changing the condition
	L Locker

	// Has unexported fields.
}
    Cond implements a condition variable, a rendezvous point for goroutines
    waiting for or announcing the occurrence of an event.

    Each Cond has an associated Locker L (often a *Mutex or *RWMutex), which
    must be held when changing the condition and when calling the Cond.Wait
    method.

    A Cond must not be copied after first use.

    In the terminology of the Go memory model, Cond arranges that a call to
    Cond.Broadcast or Cond.Signal “synchronizes before” any Wait call that it
    unblocks.

    For many simple use cases, users will be better off using channels than a
    Cond (Broadcast corresponds to closing a channel, and Signal corresponds to
    sending on a channel).

    For more on replacements for sync.Cond, see Roberto Clapis's series on
    advanced concurrency patterns, as well as Bryan Mills's talk on concurrency
    patterns.

[the Go memory model]: https://go.dev/ref/mem
[Roberto Clapis's series on advanced concurrency patterns]: https://blogtitle.github.io/categories/concurrency/
[Bryan Mills's talk on concurrency patterns]: https://drive.google.com/file/d/1nPdvhB0PutEJzdCq5ms6UI58dp50fcAN/view

func NewCond(l Locker) *Cond
    NewCond returns a new Cond with Locker l.

func (c *Cond) Broadcast()
    Broadcast wakes all goroutines waiting on c.

    It is allowed but not required for the caller to hold c.L during the call.
    The time it takes to run Broadcast is proportional to the number of waiting
    goroutines; be aware that holding the lock across a call to Broadcast will
    extend the amount of time that the lock is held.

func (c *Cond) Signal()
    Signal wakes one goroutine waiting on c, if there is any.

    It is allowed but not required for the caller to hold c.L during the call.

    Signal() does not affect goroutine scheduling priority; if other goroutines
    are attempting to lock c.L, they may be awoken before a "waiting" goroutine.

func (c *Cond) Wait()
    Wait atomically unlocks c.L and suspends execution of the calling goroutine.
    After later resuming execution, Wait locks c.L before returning. Unlike
    in other systems, Wait cannot return unless awoken by Cond.Broadcast or
    Cond.Signal.

    Because c.L is not locked while Wait is waiting, the caller typically cannot
    assume that the condition is true when Wait returns. Instead, the caller
    should Wait in a loop:

        c.L.Lock()
        for !condition() {
            c.Wait()
        }
        ... make use of condition ...
        c.L.Unlock()

type Locker interface {
	Lock()
	Unlock()
}
    A Locker represents an object that can be locked and unlocked.

type Map struct {
	// Has unexported fields.
}
    Map is like a Go map[any]any but is safe for concurrent use by multiple
    goroutines without additional locking or coordination. Loads, stores,
    and deletes run in amortized constant time.

    The Map type is specialized. Most code should use a plain Go map instead,
    with separate locking or coordination, for better type safety and to make it
    easier to maintain other invariants along with the map content.

    The Map type is optimized for two common use cases: (1) when the entry for
    a given key is only ever written once but read many times, as in caches
    that only grow, or (2) when multiple goroutines read, write, and overwrite
    entries for disjoint sets of keys. In these two cases, use of a Map may
    significantly reduce lock contention compared to a Go map paired with a
    separate Mutex or RWMutex.

    The zero Map is empty and ready for use. A Map must not be copied after
    first use.

    In the terminology of the Go memory model, Map arranges that a write
    operation “synchronizes before” any read operation that observes the effect
    of the write, where read and write operations are defined as follows.
    Map.Load, Map.LoadAndDelete, Map.LoadOrStore, Map.Swap, Map.CompareAndSwap,
    and Map.CompareAndDelete are read operations; Map.Delete, Map.LoadAndDelete,
    Map.Store, and Map.Swap are write operations; Map.LoadOrStore is a write
    operation when it returns loaded set to false; Map.CompareAndSwap is a write
    operation when it returns swapped set to true; and Map.CompareAndDelete is a
    write operation when it returns deleted set to true.

[the Go memory model]: https://go.dev/ref/mem

func (m *Map) Clear()
    Clear deletes all the entries, resulting in an empty Map.

func (m *Map) CompareAndDelete(key, old any) (deleted bool)
    CompareAndDelete deletes the entry for key if its value is equal to old.
    The old value must be of a comparable type.

    If there is no current value for key in the map, CompareAndDelete returns
    false (even if the old value is the nil interface value).

func (m *Map) CompareAndSwap(key, old, new any) (swapped bool)
    CompareAndSwap swaps the old and new values for key if the value stored in
    the map is equal to old. The old value must be of a comparable type.

func (m *Map) Delete(key any)
    Delete deletes the value for a key. If the key is not in the map, Delete
    does nothing.

func (m *Map) Load(key any) (value any, ok bool)
    Load returns the value stored in the map for a key, or nil if no value is
    present. The ok result indicates whether value was found in the map.

func (m *Map) LoadAndDelete(key any) (value any, loaded bool)
    LoadAndDelete deletes the value for a key, returning the previous value if
    any. The loaded result reports whether the key was present.

func (m *Map) LoadOrStore(key, value any) (actual any, loaded bool)
    LoadOrStore returns the existing value for the key if present. Otherwise,
    it stores and returns the given value. The loaded result is true if the
    value was loaded, false if stored.

func (m *Map) Range(f func(key, value any) bool)
    Range calls f sequentially for each key and value present in the map.
    If f returns false, range stops the iteration.

    Range does not necessarily correspond to any consistent snapshot of the
    Map's contents: no key will be visited more than once, but if the value
    for any key is stored or deleted concurrently (including by f), Range may
    reflect any mapping for that key from any point during the Range call.
    Range does not block other methods on the receiver; even f itself may call
    any method on m.

    Range may be O(N) with the number of elements in the map even if f returns
    false after a constant number of calls.

func (m *Map) Store(key, value any)
    Store sets the value for a key.

func (m *Map) Swap(key, value any) (previous any, loaded bool)
    Swap swaps the value for a key and returns the previous value if any.
    The loaded result reports whether the key was present.

type Mutex struct {
	// Has unexported fields.
}
    A Mutex is a mutual exclusion lock. The zero value for a Mutex is an
    unlocked mutex.

    A Mutex must not be copied after first use.

    In the terminology of the Go memory model, the n'th call to Mutex.Unlock
    “synchronizes before” the m'th call to Mutex.Lock for any n < m.
    A successful call to Mutex.TryLock is equivalent to a call to Lock. A failed
    call to TryLock does not establish any “synchronizes before” relation at
    all.

[the Go memory model]: https://go.dev/ref/mem

func (m *Mutex) Lock()
    Lock locks m. If the lock is already in use, the calling goroutine blocks
    until the mutex is available.

func (m *Mutex) TryLock() bool
    TryLock tries to lock m and reports whether it succeeded.

    Note that while correct uses of TryLock do exist, they are rare, and use of
    TryLock is often a sign of a deeper problem in a particular use of mutexes.

func (m *Mutex) Unlock()
    Unlock unlocks m. It is a run-time error if m is not locked on entry to
    Unlock.

    A locked Mutex is not associated with a particular goroutine. It is allowed
    for one goroutine to lock a Mutex and then arrange for another goroutine to
    unlock it.

type Once struct {
	// Has unexported fields.
}
    Once is an object that will perform exactly one action.

    A Once must not be copied after first use.

    In the terminology of the Go memory model, the return from f “synchronizes
    before” the return from any call of once.Do(f).

[the Go memory model]: https://go.dev/ref/mem

func (o *Once) Do(f func())
    Do calls the function f if and only if Do is being called for the first time
    for this instance of Once. In other words, given

        var once Once

    if once.Do(f) is called multiple times, only the first call will invoke f,
    even if f has a different value in each invocation. A new instance of Once
    is required for each function to execute.

    Do is intended for initialization that must be run exactly once. Since f
    is niladic, it may be necessary to use a function literal to capture the
    arguments to a function to be invoked by Do:

        config.once.Do(func() { config.init(filename) })

    Because no call to Do returns until the one call to f returns, if f causes
    Do to be called, it will deadlock.

    If f panics, Do considers it to have returned; future calls of Do return
    without calling f.

type Pool struct {

	// New optionally specifies a function to generate
	// a value when Get would otherwise return nil.
	// It may not be changed concurrently with calls to Get.
	New func() any
	// Has unexported fields.
}
    A Pool is a set of temporary objects that may be individually saved and
    retrieved.

    Any item stored in the Pool may be removed automatically at any time without
    notification. If the Pool holds the only reference when this happens,
    the item might be deallocated.

    A Pool is safe for use by multiple goroutines simultaneously.

    Pool's purpose is to cache allocated but unused items for later reuse,
    relieving pressure on the garbage collector. That is, it makes it easy to
    build efficient, thread-safe free lists. However, it is not suitable for all
    free lists.

    An appropriate use of a Pool is to manage a group of temporary items
    silently shared among and potentially reused by concurrent independent
    clients of a package. Pool provides a way to amortize allocation overhead
    across many clients.

    An example of good use of a Pool is in the fmt package, which maintains
    a dynamically-sized store of temporary output buffers. The store scales
    under load (when many goroutines are actively printing) and shrinks when
    quiescent.

    On the other hand, a free list maintained as part of a short-lived object is
    not a suitable use for a Pool, since the overhead does not amortize well in
    that scenario. It is more efficient to have such objects implement their own
    free list.

    A Pool must not be copied after first use.

    In the terminology of the Go memory model, a call to Put(x) “synchronizes
    before” a call to Pool.Get returning that same value x. Similarly, a call
    to New returning x “synchronizes before” a call to Get returning that same
    value x.

[the Go memory model]: https://go.dev/ref/mem

func (p *Pool) Get() any
    Get selects an arbitrary item from the Pool, removes it from the Pool,
    and returns it to the caller. Get may choose to ignore the pool and treat
    it as empty. Callers should not assume any relation between values passed to
    Pool.Put and the values returned by Get.

    If Get would otherwise return nil and p.New is non-nil, Get returns the
    result of calling p.New.

func (p *Pool) Put(x any)
    Put adds x to the pool.

type RWMutex struct {
	// Has unexported fields.
}
    A RWMutex is a reader/writer mutual exclusion lock. The lock can be held
    by an arbitrary number of readers or a single writer. The zero value for a
    RWMutex is an unlocked mutex.

    A RWMutex must not be copied after first use.

    If any goroutine calls RWMutex.Lock while the lock is already held by one or
    more readers, concurrent calls to RWMutex.RLock will block until the writer
    has acquired (and released) the lock, to ensure that the lock eventually
    becomes available to the writer. Note that this prohibits recursive
    read-locking. A RWMutex.RLock cannot be upgraded into a RWMutex.Lock,
    nor can a RWMutex.Lock be downgraded into a RWMutex.RLock.

    In the terminology of the Go memory model, the n'th call to RWMutex.Unlock
    “synchronizes before” the m'th call to Lock for any n < m, just as for
    Mutex. For any call to RLock, there exists an n such that the n'th call to
    Unlock “synchronizes before” that call to RLock, and the corresponding call
    to RWMutex.RUnlock “synchronizes before” the n+1'th call to Lock.

[the Go memory model]: https://go.dev/ref/mem

func (rw *RWMutex) Lock()
    Lock locks rw for writing. If the lock is already locked for reading or
    writing, Lock blocks until the lock is available.

func (rw *RWMutex) RLock()
    RLock locks rw for reading.

    It should not be used for recursive read locking; a blocked Lock call
    excludes new readers from acquiring the lock. See the documentation on the
    RWMutex type.

func (rw *RWMutex) RLocker() Locker
    RLocker returns a Locker interface that implements the Locker.Lock and
    Locker.Unlock methods by calling rw.RLock and rw.RUnlock.

func (rw *RWMutex) RUnlock()
    RUnlock undoes a single RWMutex.RLock call; it does not affect other
    simultaneous readers. It is a run-time error if rw is not locked for reading
    on entry to RUnlock.

func (rw *RWMutex) TryLock() bool
    TryLock tries to lock rw for writing and reports whether it succeeded.

    Note that while correct uses of TryLock do exist, they are rare, and use of
    TryLock is often a sign of a deeper problem in a particular use of mutexes.

func (rw *RWMutex) TryRLock() bool
    TryRLock tries to lock rw for reading and reports whether it succeeded.

    Note that while correct uses of TryRLock do exist, they are rare, and use of
    TryRLock is often a sign of a deeper problem in a particular use of mutexes.

func (rw *RWMutex) Unlock()
    Unlock unlocks rw for writing. It is a run-time error if rw is not locked
    for writing on entry to Unlock.

    As with Mutexes, a locked RWMutex is not associated with a particular
    goroutine. One goroutine may RWMutex.RLock (RWMutex.Lock) a RWMutex and then
    arrange for another goroutine to RWMutex.RUnlock (RWMutex.Unlock) it.

type WaitGroup struct {
	// Has unexported fields.
}
    A WaitGroup is a counting semaphore typically used to wait for a group of
    goroutines or tasks to finish.

    Typically, a main goroutine will start tasks, each in a new goroutine,
    by calling WaitGroup.Go and then wait for all tasks to complete by calling
    WaitGroup.Wait. For example:

        var wg sync.WaitGroup
        wg.Go(task1)
        wg.Go(task2)
        wg.Wait()

    A WaitGroup may also be used for tracking tasks without using Go to start
    new goroutines by using WaitGroup.Add and WaitGroup.Done.

    The previous example can be rewritten using explicitly created goroutines
    along with Add and Done:

        var wg sync.WaitGroup
        wg.Add(1)
        go func() {
        	defer wg.Done()
        	task1()
        }()
        wg.Add(1)
        go func() {
        	defer wg.Done()
        	task2()
        }()
        wg.Wait()

    This pattern is common in code that predates WaitGroup.Go.

    A WaitGroup must not be copied after first use.

func (wg *WaitGroup) Add(delta int)
    Add adds delta, which may be negative, to the WaitGroup task counter. If the
    counter becomes zero, all goroutines blocked on WaitGroup.Wait are released.
    If the counter goes negative, Add panics.

    Callers should prefer WaitGroup.Go.

    Note that calls with a positive delta that occur when the counter is
    zero must happen before a Wait. Calls with a negative delta, or calls
    with a positive delta that start when the counter is greater than zero,
    may happen at any time. Typically this means the calls to Add should execute
    before the statement creating the goroutine or other event to be waited for.
    If a WaitGroup is reused to wait for several independent sets of events,
    new Add calls must happen after all previous Wait calls have returned.
    See the WaitGroup example.

func (wg *WaitGroup) Done()
    Done decrements the WaitGroup task counter by one. It is equivalent to
    Add(-1).

    Callers should prefer WaitGroup.Go.

    In the terminology of the Go memory model, a call to Done "synchronizes
    before" the return of any Wait call that it unblocks.

[the Go memory model]: https://go.dev/ref/mem

func (wg *WaitGroup) Go(f func())
    Go calls f in a new goroutine and adds that task to the WaitGroup. When f
    returns, the task is removed from the WaitGroup.

    The function f must not panic.

    If the WaitGroup is empty, Go must happen before a WaitGroup.Wait.
    Typically, this simply means Go is called to start tasks before Wait is
    called. If the WaitGroup is not empty, Go may happen at any time. This means
    a goroutine started by Go may itself call Go. If a WaitGroup is reused to
    wait for several independent sets of tasks, new Go calls must happen after
    all previous Wait calls have returned.

    In the terminology of the Go memory model, the return from f "synchronizes
    before" the return of any Wait call that it unblocks.

[the Go memory model]: https://go.dev/ref/mem

func (wg *WaitGroup) Wait()
    Wait blocks until the WaitGroup task counter is zero.
```

## sync/atomic

```go
package atomic // import "sync/atomic"

Package atomic provides low-level atomic memory primitives useful for
implementing synchronization algorithms.

These functions require great care to be used correctly. Except for special,
low-level applications, synchronization is better done with channels or the
facilities of the sync package. Share memory by communicating; don't communicate
by sharing memory.

The swap operation, implemented by the SwapT functions, is the atomic equivalent
of:

    old = *addr
    *addr = new
    return old

The compare-and-swap operation, implemented by the CompareAndSwapT functions,
is the atomic equivalent of:

    if *addr == old {
    	*addr = new
    	return true
    }
    return false

The add operation, implemented by the AddT functions, is the atomic equivalent
of:

    *addr += delta
    return *addr

The load and store operations, implemented by the LoadT and StoreT functions,
are the atomic equivalents of "return *addr" and "*addr = val".

In the terminology of the Go memory model, if the effect of an atomic
operation A is observed by atomic operation B, then A “synchronizes before” B.
Additionally, all the atomic operations executed in a program behave as though
executed in some sequentially consistent order. This definition provides the
same semantics as C++'s sequentially consistent atomics and Java's volatile
variables.

Only a few integer sizes are supported: on many architectures, atomic operations
on non-word-sized integers are inefficient or infeasible. For example, a Bool
may be larger than a built-in bool.

[the Go memory model]: https://go.dev/ref/mem

FUNCTIONS

func AddInt32(addr *int32, delta int32) (new int32)
    AddInt32 atomically adds delta to *addr and returns the new value. Consider
    using the more ergonomic and less error-prone Int32.Add instead.

func AddInt64(addr *int64, delta int64) (new int64)
    AddInt64 atomically adds delta to *addr and returns the new value.
    Consider using the more ergonomic and less error-prone Int64.Add instead
    (particularly if you target 32-bit platforms; see the bugs section).

func AddUint32(addr *uint32, delta uint32) (new uint32)
    AddUint32 atomically adds delta to *addr and returns the new value.
    To subtract a signed positive constant value c from x, do AddUint32(&x,
    ^uint32(c-1)). In particular, to decrement x, do AddUint32(&x, ^uint32(0)).
    Consider using the more ergonomic and less error-prone Uint32.Add instead.

func AddUint64(addr *uint64, delta uint64) (new uint64)
    AddUint64 atomically adds delta to *addr and returns the new value.
    To subtract a signed positive constant value c from x, do AddUint64(&x,
    ^uint64(c-1)). In particular, to decrement x, do AddUint64(&x, ^uint64(0)).
    Consider using the more ergonomic and less error-prone Uint64.Add instead
    (particularly if you target 32-bit platforms; see the bugs section).

func AddUintptr(addr *uintptr, delta uintptr) (new uintptr)
    AddUintptr atomically adds delta to *addr and returns the new value.
    Consider using the more ergonomic and less error-prone Uintptr.Add instead.

func AndInt32(addr *int32, mask int32) (old int32)
    AndInt32 atomically performs a bitwise AND operation on *addr using the
    bitmask provided as mask and returns the old value. Consider using the more
    ergonomic and less error-prone Int32.And instead.

func AndInt64(addr *int64, mask int64) (old int64)
    AndInt64 atomically performs a bitwise AND operation on *addr using the
    bitmask provided as mask and returns the old value. Consider using the more
    ergonomic and less error-prone Int64.And instead.

func AndUint32(addr *uint32, mask uint32) (old uint32)
    AndUint32 atomically performs a bitwise AND operation on *addr using the
    bitmask provided as mask and returns the old value. Consider using the more
    ergonomic and less error-prone Uint32.And instead.

func AndUint64(addr *uint64, mask uint64) (old uint64)
    AndUint64 atomically performs a bitwise AND operation on *addr using the
    bitmask provided as mask and returns the old. Consider using the more
    ergonomic and less error-prone Uint64.And instead.

func AndUintptr(addr *uintptr, mask uintptr) (old uintptr)
    AndUintptr atomically performs a bitwise AND operation on *addr using the
    bitmask provided as mask and returns the old value. Consider using the more
    ergonomic and less error-prone Uintptr.And instead.

func CompareAndSwapInt32(addr *int32, old, new int32) (swapped bool)
    CompareAndSwapInt32 executes the compare-and-swap operation for an
    int32 value. Consider using the more ergonomic and less error-prone
    Int32.CompareAndSwap instead.

func CompareAndSwapInt64(addr *int64, old, new int64) (swapped bool)
    CompareAndSwapInt64 executes the compare-and-swap operation for an
    int64 value. Consider using the more ergonomic and less error-prone
    Int64.CompareAndSwap instead (particularly if you target 32-bit platforms;
    see the bugs section).

func CompareAndSwapPointer(addr *unsafe.Pointer, old, new unsafe.Pointer) (swapped bool)
    CompareAndSwapPointer executes the compare-and-swap operation for a
    unsafe.Pointer value. Consider using the more ergonomic and less error-prone
    Pointer.CompareAndSwap instead.

func CompareAndSwapUint32(addr *uint32, old, new uint32) (swapped bool)
    CompareAndSwapUint32 executes the compare-and-swap operation for a
    uint32 value. Consider using the more ergonomic and less error-prone
    Uint32.CompareAndSwap instead.

func CompareAndSwapUint64(addr *uint64, old, new uint64) (swapped bool)
    CompareAndSwapUint64 executes the compare-and-swap operation for a
    uint64 value. Consider using the more ergonomic and less error-prone
    Uint64.CompareAndSwap instead (particularly if you target 32-bit platforms;
    see the bugs section).

func CompareAndSwapUintptr(addr *uintptr, old, new uintptr) (swapped bool)
    CompareAndSwapUintptr executes the compare-and-swap operation for a
    uintptr value. Consider using the more ergonomic and less error-prone
    Uintptr.CompareAndSwap instead.

func LoadInt32(addr *int32) (val int32)
    LoadInt32 atomically loads *addr. Consider using the more ergonomic and less
    error-prone Int32.Load instead.

func LoadInt64(addr *int64) (val int64)
    LoadInt64 atomically loads *addr. Consider using the more ergonomic and less
    error-prone Int64.Load instead (particularly if you target 32-bit platforms;
    see the bugs section).

func LoadPointer(addr *unsafe.Pointer) (val unsafe.Pointer)
    LoadPointer atomically loads *addr. Consider using the more ergonomic and
    less error-prone Pointer.Load instead.

func LoadUint32(addr *uint32) (val uint32)
    LoadUint32 atomically loads *addr. Consider using the more ergonomic and
    less error-prone Uint32.Load instead.

func LoadUint64(addr *uint64) (val uint64)
    LoadUint64 atomically loads *addr. Consider using the more ergonomic and
    less error-prone Uint64.Load instead (particularly if you target 32-bit
    platforms; see the bugs section).

func LoadUintptr(addr *uintptr) (val uintptr)
    LoadUintptr atomically loads *addr. Consider using the more ergonomic and
    less error-prone Uintptr.Load instead.

func OrInt32(addr *int32, mask int32) (old int32)
    OrInt32 atomically performs a bitwise OR operation on *addr using the
    bitmask provided as mask and returns the old value. Consider using the more
    ergonomic and less error-prone Int32.Or instead.

func OrInt64(addr *int64, mask int64) (old int64)
    OrInt64 atomically performs a bitwise OR operation on *addr using the
    bitmask provided as mask and returns the old value. Consider using the more
    ergonomic and less error-prone Int64.Or instead.

func OrUint32(addr *uint32, mask uint32) (old uint32)
    OrUint32 atomically performs a bitwise OR operation on *addr using the
    bitmask provided as mask and returns the old value. Consider using the more
    ergonomic and less error-prone Uint32.Or instead.

func OrUint64(addr *uint64, mask uint64) (old uint64)
    OrUint64 atomically performs a bitwise OR operation on *addr using the
    bitmask provided as mask and returns the old value. Consider using the more
    ergonomic and less error-prone Uint64.Or instead.

func OrUintptr(addr *uintptr, mask uintptr) (old uintptr)
    OrUintptr atomically performs a bitwise OR operation on *addr using the
    bitmask provided as mask and returns the old value. Consider using the more
    ergonomic and less error-prone Uintptr.Or instead.

func StoreInt32(addr *int32, val int32)
    StoreInt32 atomically stores val into *addr. Consider using the more
    ergonomic and less error-prone Int32.Store instead.

func StoreInt64(addr *int64, val int64)
    StoreInt64 atomically stores val into *addr. Consider using the more
    ergonomic and less error-prone Int64.Store instead (particularly if you
    target 32-bit platforms; see the bugs section).

func StorePointer(addr *unsafe.Pointer, val unsafe.Pointer)
    StorePointer atomically stores val into *addr. Consider using the more
    ergonomic and less error-prone Pointer.Store instead.

func StoreUint32(addr *uint32, val uint32)
    StoreUint32 atomically stores val into *addr. Consider using the more
    ergonomic and less error-prone Uint32.Store instead.

func StoreUint64(addr *uint64, val uint64)
    StoreUint64 atomically stores val into *addr. Consider using the more
    ergonomic and less error-prone Uint64.Store instead (particularly if you
    target 32-bit platforms; see the bugs section).

func StoreUintptr(addr *uintptr, val uintptr)
    StoreUintptr atomically stores val into *addr. Consider using the more
    ergonomic and less error-prone Uintptr.Store instead.

func SwapInt32(addr *int32, new int32) (old int32)
    SwapInt32 atomically stores new into *addr and returns the previous *addr
    value. Consider using the more ergonomic and less error-prone Int32.Swap
    instead.

func SwapInt64(addr *int64, new int64) (old int64)
    SwapInt64 atomically stores new into *addr and returns the previous *addr
    value. Consider using the more ergonomic and less error-prone Int64.Swap
    instead (particularly if you target 32-bit platforms; see the bugs section).

func SwapPointer(addr *unsafe.Pointer, new unsafe.Pointer) (old unsafe.Pointer)
    SwapPointer atomically stores new into *addr and returns the previous *addr
    value. Consider using the more ergonomic and less error-prone Pointer.Swap
    instead.

func SwapUint32(addr *uint32, new uint32) (old uint32)
    SwapUint32 atomically stores new into *addr and returns the previous *addr
    value. Consider using the more ergonomic and less error-prone Uint32.Swap
    instead.

func SwapUint64(addr *uint64, new uint64) (old uint64)
    SwapUint64 atomically stores new into *addr and returns the previous *addr
    value. Consider using the more ergonomic and less error-prone Uint64.Swap
    instead (particularly if you target 32-bit platforms; see the bugs section).

func SwapUintptr(addr *uintptr, new uintptr) (old uintptr)
    SwapUintptr atomically stores new into *addr and returns the previous *addr
    value. Consider using the more ergonomic and less error-prone Uintptr.Swap
    instead.


TYPES

type Bool struct {
	// Has unexported fields.
}
    A Bool is an atomic boolean value. The zero value is false.

    Bool must not be copied after first use.

func (x *Bool) CompareAndSwap(old, new bool) (swapped bool)
    CompareAndSwap executes the compare-and-swap operation for the boolean value
    x.

func (x *Bool) Load() bool
    Load atomically loads and returns the value stored in x.

func (x *Bool) Store(val bool)
    Store atomically stores val into x.

func (x *Bool) Swap(new bool) (old bool)
    Swap atomically stores new into x and returns the previous value.

type Int32 struct {
	// Has unexported fields.
}
    An Int32 is an atomic int32. The zero value is zero.

    Int32 must not be copied after first use.

func (x *Int32) Add(delta int32) (new int32)
    Add atomically adds delta to x and returns the new value.

func (x *Int32) And(mask int32) (old int32)
    And atomically performs a bitwise AND operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Int32) CompareAndSwap(old, new int32) (swapped bool)
    CompareAndSwap executes the compare-and-swap operation for x.

func (x *Int32) Load() int32
    Load atomically loads and returns the value stored in x.

func (x *Int32) Or(mask int32) (old int32)
    Or atomically performs a bitwise OR operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Int32) Store(val int32)
    Store atomically stores val into x.

func (x *Int32) Swap(new int32) (old int32)
    Swap atomically stores new into x and returns the previous value.

type Int64 struct {
	// Has unexported fields.
}
    An Int64 is an atomic int64. The zero value is zero.

    Int64 must not be copied after first use.

func (x *Int64) Add(delta int64) (new int64)
    Add atomically adds delta to x and returns the new value.

func (x *Int64) And(mask int64) (old int64)
    And atomically performs a bitwise AND operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Int64) CompareAndSwap(old, new int64) (swapped bool)
    CompareAndSwap executes the compare-and-swap operation for x.

func (x *Int64) Load() int64
    Load atomically loads and returns the value stored in x.

func (x *Int64) Or(mask int64) (old int64)
    Or atomically performs a bitwise OR operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Int64) Store(val int64)
    Store atomically stores val into x.

func (x *Int64) Swap(new int64) (old int64)
    Swap atomically stores new into x and returns the previous value.

type Pointer[T any] struct {
	// Has unexported fields.
}
    A Pointer is an atomic pointer of type *T. The zero value is a nil *T.

    Pointer must not be copied after first use.

func (x *Pointer[T]) CompareAndSwap(old, new *T) (swapped bool)
    CompareAndSwap executes the compare-and-swap operation for x.

func (x *Pointer[T]) Load() *T
    Load atomically loads and returns the value stored in x.

func (x *Pointer[T]) Store(val *T)
    Store atomically stores val into x.

func (x *Pointer[T]) Swap(new *T) (old *T)
    Swap atomically stores new into x and returns the previous value.

type Uint32 struct {
	// Has unexported fields.
}
    A Uint32 is an atomic uint32. The zero value is zero.

    Uint32 must not be copied after first use.

func (x *Uint32) Add(delta uint32) (new uint32)
    Add atomically adds delta to x and returns the new value.

func (x *Uint32) And(mask uint32) (old uint32)
    And atomically performs a bitwise AND operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Uint32) CompareAndSwap(old, new uint32) (swapped bool)
    CompareAndSwap executes the compare-and-swap operation for x.

func (x *Uint32) Load() uint32
    Load atomically loads and returns the value stored in x.

func (x *Uint32) Or(mask uint32) (old uint32)
    Or atomically performs a bitwise OR operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Uint32) Store(val uint32)
    Store atomically stores val into x.

func (x *Uint32) Swap(new uint32) (old uint32)
    Swap atomically stores new into x and returns the previous value.

type Uint64 struct {
	// Has unexported fields.
}
    A Uint64 is an atomic uint64. The zero value is zero.

    Uint64 must not be copied after first use.

func (x *Uint64) Add(delta uint64) (new uint64)
    Add atomically adds delta to x and returns the new value.

func (x *Uint64) And(mask uint64) (old uint64)
    And atomically performs a bitwise AND operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Uint64) CompareAndSwap(old, new uint64) (swapped bool)
    CompareAndSwap executes the compare-and-swap operation for x.

func (x *Uint64) Load() uint64
    Load atomically loads and returns the value stored in x.

func (x *Uint64) Or(mask uint64) (old uint64)
    Or atomically performs a bitwise OR operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Uint64) Store(val uint64)
    Store atomically stores val into x.

func (x *Uint64) Swap(new uint64) (old uint64)
    Swap atomically stores new into x and returns the previous value.

type Uintptr struct {
	// Has unexported fields.
}
    A Uintptr is an atomic uintptr. The zero value is zero.

    Uintptr must not be copied after first use.

func (x *Uintptr) Add(delta uintptr) (new uintptr)
    Add atomically adds delta to x and returns the new value.

func (x *Uintptr) And(mask uintptr) (old uintptr)
    And atomically performs a bitwise AND operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Uintptr) CompareAndSwap(old, new uintptr) (swapped bool)
    CompareAndSwap executes the compare-and-swap operation for x.

func (x *Uintptr) Load() uintptr
    Load atomically loads and returns the value stored in x.

func (x *Uintptr) Or(mask uintptr) (old uintptr)
    Or atomically performs a bitwise OR operation on x using the bitmask
    provided as mask and returns the old value.

func (x *Uintptr) Store(val uintptr)
    Store atomically stores val into x.

func (x *Uintptr) Swap(new uintptr) (old uintptr)
    Swap atomically stores new into x and returns the previous value.

type Value struct {
	// Has unexported fields.
}
    A Value provides an atomic load and store of a consistently typed value.
    The zero value for a Value returns nil from Value.Load. Once Value.Store has
    been called, a Value must not be copied.

    A Value must not be copied after first use.

func (v *Value) CompareAndSwap(old, new any) (swapped bool)
    CompareAndSwap executes the compare-and-swap operation for the Value.

    All calls to CompareAndSwap for a given Value must use values of the same
    concrete type. CompareAndSwap of an inconsistent type panics, as does
    CompareAndSwap(old, nil).

func (v *Value) Load() (val any)
    Load returns the value set by the most recent Store. It returns nil if there
    has been no call to Store for this Value.

func (v *Value) Store(val any)
    Store sets the value of the Value v to val. All calls to Store for a given
    Value must use values of the same concrete type. Store of an inconsistent
    type panics, as does Store(nil).

func (v *Value) Swap(new any) (old any)
    Swap stores new into Value and returns the previous value. It returns nil if
    the Value is empty.

    All calls to Swap for a given Value must use values of the same concrete
    type. Swap of an inconsistent type panics, as does Swap(nil).


BUG: On 386, the 64-bit functions use instructions unavailable before the Pentium MMX.

On non-Linux ARM, the 64-bit functions use instructions unavailable before the ARMv6k core.

On ARM, 386, and 32-bit MIPS, it is the caller's responsibility to arrange
for 64-bit alignment of 64-bit words accessed atomically via the primitive
atomic functions (types [Int64] and [Uint64] are automatically aligned).
The first word in an allocated struct, array, or slice; in a global
variable; or in a local variable (because on 32-bit architectures, the
subject of 64-bit atomic operations will escape to the heap) can be
relied upon to be 64-bit aligned.
```

## context

```go
package context // import "context"

Package context defines the Context type, which carries deadlines, cancellation
signals, and other request-scoped values across API boundaries and between
processes.

Incoming requests to a server should create a Context, and outgoing calls to
servers should accept a Context. The chain of function calls between them must
propagate the Context, optionally replacing it with a derived Context created
using WithCancel, WithDeadline, WithTimeout, or WithValue.

A Context may be canceled to indicate that work done on its behalf should stop.
A Context with a deadline is canceled after the deadline passes. When a Context
is canceled, all Contexts derived from it are also canceled.

The WithCancel, WithDeadline, and WithTimeout functions take a Context (the
parent) and return a derived Context (the child) and a CancelFunc. Calling the
CancelFunc directly cancels the child and its children, removes the parent's
reference to the child, and stops any associated timers. Failing to call the
CancelFunc leaks the child and its children until the parent is canceled.
The go vet tool checks that CancelFuncs are used on all control-flow paths.

The WithCancelCause function returns a CancelCauseFunc, which takes an error and
records it as the cancellation cause. WithDeadlineCause and WithTimeoutCause
take a cause to use when the deadline expires. Calling Cause on the canceled
context or any of its children retrieves the cause. If no cause is specified,
Cause(ctx) returns the same value as ctx.Err().

Programs that use Contexts should follow these rules to keep interfaces
consistent across packages and enable static analysis tools to check context
propagation:

Do not store Contexts inside a struct type; instead, pass a Context
explicitly to each function that needs it. This is discussed further in
https://go.dev/blog/context-and-structs. The Context should be the first
parameter, typically named ctx:

    func DoSomething(ctx context.Context, arg Arg) error {
    	// ... use ctx ...
    }

Do not pass a nil Context, even if a function permits it. Pass context.TODO if
you are unsure about which Context to use.

Use context Values only for request-scoped data that transits processes and
APIs, not for passing optional parameters to functions.

The same Context may be passed to functions running in different goroutines;
Contexts are safe for simultaneous use by multiple goroutines.

See https://go.dev/blog/context for example code for a server that uses
Contexts.

VARIABLES

var Canceled = errors.New("context canceled")
    Canceled is the error returned by Context.Err when the context is canceled
    for some reason other than its deadline passing.

var DeadlineExceeded error = deadlineExceededError{}
    DeadlineExceeded is the error returned by Context.Err when the context is
    canceled due to its deadline passing.


FUNCTIONS

func AfterFunc(ctx Context, f func()) (stop func() bool)
    AfterFunc arranges to call f in its own goroutine after ctx is canceled. If
    ctx is already canceled, AfterFunc calls f immediately in its own goroutine.

    Multiple calls to AfterFunc on a context operate independently; one does not
    replace another.

    Calling the returned stop function stops the association of ctx with f.
    It returns true if the call stopped f from being run. If stop returns false,
    either the context is canceled and f has been started in its own goroutine;
    or f was already stopped. The stop function does not wait for f to complete
    before returning. If the caller needs to know whether f is completed,
    it must coordinate with f explicitly.

    If ctx has a "AfterFunc(func()) func() bool" method, AfterFunc will use it
    to schedule the call.

func Cause(c Context) error
    Cause returns a non-nil error explaining why c was canceled. The first
    cancellation of c or one of its parents sets the cause. If that cancellation
    happened via a call to CancelCauseFunc(err), then Cause returns err.
    Otherwise Cause(c) returns the same value as c.Err(). Cause returns nil if c
    has not been canceled yet.

func WithCancel(parent Context) (ctx Context, cancel CancelFunc)
    WithCancel returns a derived context that points to the parent context but
    has a new Done channel. The returned context's Done channel is closed when
    the returned cancel function is called or when the parent context's Done
    channel is closed, whichever happens first.

    Canceling this context releases resources associated with it, so code should
    call cancel as soon as the operations running in this Context complete.

func WithCancelCause(parent Context) (ctx Context, cancel CancelCauseFunc)
    WithCancelCause behaves like WithCancel but returns a CancelCauseFunc
    instead of a CancelFunc. Calling cancel with a non-nil error (the "cause")
    records that error in ctx; it can then be retrieved using Cause(ctx).
    Calling cancel with nil sets the cause to Canceled.

    Example use:

        ctx, cancel := context.WithCancelCause(parent)
        cancel(myError)
        ctx.Err() // returns context.Canceled
        context.Cause(ctx) // returns myError

func WithDeadline(parent Context, d time.Time) (Context, CancelFunc)
    WithDeadline returns a derived context that points to the parent context but
    has the deadline adjusted to be no later than d. If the parent's deadline is
    already earlier than d, WithDeadline(parent, d) is semantically equivalent
    to parent. The returned Context.Done channel is closed when the deadline
    expires, when the returned cancel function is called, or when the parent
    context's Done channel is closed, whichever happens first.

    Canceling this context releases resources associated with it, so code should
    call cancel as soon as the operations running in this Context complete.

func WithDeadlineCause(parent Context, d time.Time, cause error) (Context, CancelFunc)
    WithDeadlineCause behaves like WithDeadline but also sets the cause of the
    returned Context when the deadline is exceeded. The returned CancelFunc does
    not set the cause.

func WithTimeout(parent Context, timeout time.Duration) (Context, CancelFunc)
    WithTimeout returns WithDeadline(parent, time.Now().Add(timeout)).

    Canceling this context releases resources associated with it, so code should
    call cancel as soon as the operations running in this Context complete:

        func slowOperationWithTimeout(ctx context.Context) (Result, error) {
        	ctx, cancel := context.WithTimeout(ctx, 100*time.Millisecond)
        	defer cancel()  // releases resources if slowOperation completes before timeout elapses
        	return slowOperation(ctx)
        }

func WithTimeoutCause(parent Context, timeout time.Duration, cause error) (Context, CancelFunc)
    WithTimeoutCause behaves like WithTimeout but also sets the cause of the
    returned Context when the timeout expires. The returned CancelFunc does not
    set the cause.


TYPES

type CancelCauseFunc func(cause error)
    A CancelCauseFunc behaves like a CancelFunc but additionally sets the
    cancellation cause. This cause can be retrieved by calling Cause on the
    canceled Context or on any of its derived Contexts.

    If the context has already been canceled, CancelCauseFunc does not set the
    cause. For example, if childContext is derived from parentContext:
      - if parentContext is canceled with cause1 before childContext is canceled
        with cause2, then Cause(parentContext) == Cause(childContext) == cause1
      - if childContext is canceled with cause2 before parentContext is canceled
        with cause1, then Cause(parentContext) == cause1 and Cause(childContext)
        == cause2

type CancelFunc func()
    A CancelFunc tells an operation to abandon its work. A CancelFunc does not
    wait for the work to stop. A CancelFunc may be called by multiple goroutines
    simultaneously. After the first call, subsequent calls to a CancelFunc do
    nothing.

type Context interface {
	// Deadline returns the time when work done on behalf of this context
	// should be canceled. Deadline returns ok==false when no deadline is
	// set. Successive calls to Deadline return the same results.
	Deadline() (deadline time.Time, ok bool)

	// Done returns a channel that's closed when work done on behalf of this
	// context should be canceled. Done may return nil if this context can
	// never be canceled. Successive calls to Done return the same value.
	// The close of the Done channel may happen asynchronously,
	// after the cancel function returns.
	//
	// WithCancel arranges for Done to be closed when cancel is called;
	// WithDeadline arranges for Done to be closed when the deadline
	// expires; WithTimeout arranges for Done to be closed when the timeout
	// elapses.
	//
	// Done is provided for use in select statements:
	//
	//  // Stream generates values with DoSomething and sends them to out
	//  // until DoSomething returns an error or ctx.Done is closed.
	//  func Stream(ctx context.Context, out chan<- Value) error {
	//  	for {
	//  		v, err := DoSomething(ctx)
	//  		if err != nil {
	//  			return err
	//  		}
	//  		select {
	//  		case <-ctx.Done():
	//  			return ctx.Err()
	//  		case out <- v:
	//  		}
	//  	}
	//  }
	//
	// See https://go.dev/blog/pipelines for more examples of how to use
	// a Done channel for cancellation.
	Done() <-chan struct{}

	// If Done is not yet closed, Err returns nil.
	// If Done is closed, Err returns a non-nil error explaining why:
	// DeadlineExceeded if the context's deadline passed,
	// or Canceled if the context was canceled for some other reason.
	// After Err returns a non-nil error, successive calls to Err return the same error.
	Err() error

	// Value returns the value associated with this context for key, or nil
	// if no value is associated with key. Successive calls to Value with
	// the same key returns the same result.
	//
	// Use context values only for request-scoped data that transits
	// processes and API boundaries, not for passing optional parameters to
	// functions.
	//
	// A key identifies a specific value in a Context. Functions that wish
	// to store values in Context typically allocate a key in a global
	// variable then use that key as the argument to context.WithValue and
	// Context.Value. A key can be any type that supports equality;
	// packages should define keys as an unexported type to avoid
	// collisions.
	//
	// Packages that define a Context key should provide type-safe accessors
	// for the values stored using that key:
	//
	//	// Package user defines a User type that's stored in Contexts.
	//	package user
	//
	//	import "context"
	//
	//	// User is the type of value stored in the Contexts.
	//	type User struct {...}
	//
	//	// key is an unexported type for keys defined in this package.
	//	// This prevents collisions with keys defined in other packages.
	//	type key int
	//
	//	// userKey is the key for user.User values in Contexts. It is
	//	// unexported; clients use user.NewContext and user.FromContext
	//	// instead of using this key directly.
	//	var userKey key
	//
	//	// NewContext returns a new Context that carries value u.
	//	func NewContext(ctx context.Context, u *User) context.Context {
	//		return context.WithValue(ctx, userKey, u)
	//	}
	//
	//	// FromContext returns the User value stored in ctx, if any.
	//	func FromContext(ctx context.Context) (*User, bool) {
	//		u, ok := ctx.Value(userKey).(*User)
	//		return u, ok
	//	}
	Value(key any) any
}
    A Context carries a deadline, a cancellation signal, and other values across
    API boundaries.

    Context's methods may be called by multiple goroutines simultaneously.

func Background() Context
    Background returns a non-nil, empty Context. It is never canceled, has no
    values, and has no deadline. It is typically used by the main function,
    initialization, and tests, and as the top-level Context for incoming
    requests.

func TODO() Context
    TODO returns a non-nil, empty Context. Code should use context.TODO when
    it's unclear which Context to use or it is not yet available (because
    the surrounding function has not yet been extended to accept a Context
    parameter).

func WithValue(parent Context, key, val any) Context
    WithValue returns a derived context that points to the parent Context.
    In the derived context, the value associated with key is val.

    Use context Values only for request-scoped data that transits processes and
    APIs, not for passing optional parameters to functions.

    The provided key must be comparable and should not be of type string or any
    other built-in type to avoid collisions between packages using context.
    Users of WithValue should define their own types for keys. To avoid
    allocating when assigning to an interface{}, context keys often have
    concrete type struct{}. Alternatively, exported context key variables'
    static type should be a pointer or interface.

func WithoutCancel(parent Context) Context
    WithoutCancel returns a derived context that points to the parent context
    and is not canceled when parent is canceled. The returned context returns no
    Deadline or Err, and its Done channel is nil. Calling Cause on the returned
    context returns nil.
```

## regexp

```go
package regexp // import "regexp"

Package regexp implements regular expression search.

The syntax of the regular expressions accepted is the same general syntax
used by Perl, Python, and other languages. More precisely, it is the syntax
accepted by RE2 and described at https://golang.org/s/re2syntax, except for \C.
For an overview of the syntax, see the regexp/syntax package.

The regexp implementation provided by this package is guaranteed to run in time
linear in the size of the input. (This is a property not guaranteed by most
open source implementations of regular expressions.) For more information about
this property, see https://swtch.com/~rsc/regexp/regexp1.html or any book about
automata theory.

All characters are UTF-8-encoded code points. Following utf8.DecodeRune, each
byte of an invalid UTF-8 sequence is treated as if it encoded utf8.RuneError
(U+FFFD).

There are 24 methods of Regexp that match a regular expression and identify the
matched text. Their names are matched by this regular expression:

    (All|Find|FindAll)(String)?(Submatch)?(Index)?

The ‘All’ variants return an iterator over successive non-overlapping matches
of the entire expression. The ‘FindAll’ variants return a slice of those matches
instead. Empty matches abutting a preceding match are ignored. The ‘FindAll’
variants take an extra integer argument, n. If n >= 0, the function returns at
most n matches/submatches; otherwise, it returns all of them.

The ‘Find’ variants return only the first match that All or FindAll would
return.

If ‘String’ is present, the argument is a string; otherwise it is a []byte.

By default, each returned match is denoted by the substring matching the regular
expression, of type string or []byte according to the type of the argument.
If ‘Submatch’ is present, each match is represented instead by a slice of the
substrings matching the regular expression's parenthesized subexpressions (also
known as capturing groups), numbered from left to right in order of opening
parenthesis. Submatch 0 is the match of the entire expression, submatch 1 is
the match of the first parenthesized subexpression, and so on. If ‘Index’ is
present, each substring is instead denoted by a pair of byte indexes within the
input string. If an index is negative or substring is nil, it means that the
subexpression did not match any string in the input. For ‘String’ versions,
an empty string means either no match or an empty match.

There is also a subset of the methods that can be applied to text read
from an io.RuneReader: Regexp.MatchReader, Regexp.FindReaderIndex,
Regexp.FindReaderSubmatchIndex. Note that regular expression matches may need to
examine text beyond the text returned by a match, so the methods that match text
from an io.RuneReader may read arbitrarily far into the input before returning.

(There are a few other methods that do not match this pattern.)

FUNCTIONS

func Match(pattern string, b []byte) (matched bool, err error)
    Match reports whether the byte slice b contains any match of the regular
    expression pattern. More complicated queries need to use Compile and the
    full Regexp interface.

func MatchReader(pattern string, r io.RuneReader) (matched bool, err error)
    MatchReader reports whether the text returned by the io.RuneReader contains
    any match of the regular expression pattern. More complicated queries need
    to use Compile and the full Regexp interface.

func MatchString(pattern string, s string) (matched bool, err error)
    MatchString reports whether the string s contains any match of the regular
    expression pattern. More complicated queries need to use Compile and the
    full Regexp interface.

func QuoteMeta(s string) string
    QuoteMeta returns a string that escapes all regular expression
    metacharacters inside the argument text; the returned string is a regular
    expression matching the literal text.


TYPES

type Regexp struct {
	// Has unexported fields.
}
    Regexp is the representation of a compiled regular expression. A Regexp is
    safe for concurrent use by multiple goroutines, except for configuration
    methods, such as Regexp.Longest.

func Compile(expr string) (*Regexp, error)
    Compile parses a regular expression and returns, if successful, a Regexp
    object that can be used to match against text.

    When matching against text, the regexp returns a match that begins as
    early as possible in the input (leftmost), and among those it chooses
    the one that a backtracking search would have found first. This so-called
    leftmost-first matching is the same semantics that Perl, Python, and other
    implementations use, although this package implements it without the expense
    of backtracking. For POSIX leftmost-longest matching, see CompilePOSIX.

func CompilePOSIX(expr string) (*Regexp, error)
    CompilePOSIX is like Compile but restricts the regular expression to POSIX
    ERE (egrep) syntax and changes the match semantics to leftmost-longest.

    That is, when matching against text, the regexp returns a match that begins
    as early as possible in the input (leftmost), and among those it chooses a
    match that is as long as possible. This so-called leftmost-longest matching
    is the same semantics that early regular expression implementations used and
    that POSIX specifies.

    However, there can be multiple leftmost-longest matches, with
    different submatch choices, and here this package diverges from POSIX.
    Among the possible leftmost-longest matches, this package chooses the
    one that a backtracking search would have found first, while POSIX
    specifies that the match be chosen to maximize the length of the
    first subexpression, then the second, and so on from left to right.
    The POSIX rule is computationally prohibitive and not even well-defined.
    See https://swtch.com/~rsc/regexp/regexp2.html#posix for details.

func MustCompile(str string) *Regexp
    MustCompile is like Compile but panics if the expression cannot be parsed.
    It simplifies safe initialization of global variables holding compiled
    regular expressions.

func MustCompilePOSIX(str string) *Regexp
    MustCompilePOSIX is like CompilePOSIX but panics if the expression cannot
    be parsed. It simplifies safe initialization of global variables holding
    compiled regular expressions.

func (re *Regexp) AppendText(b []byte) ([]byte, error)
    AppendText implements encoding.TextAppender. The output matches that of
    calling the Regexp.String method.

    Note that the output is lossy in some cases: This method does not indicate
    POSIX regular expressions (i.e. those compiled by calling CompilePOSIX),
    or those for which the Regexp.Longest method has been called.

func (re *Regexp) Copy() *Regexp
    Copy returns a new Regexp object copied from re. Calling Regexp.Longest on
    one copy does not affect another.

    Deprecated: In earlier releases, when using a Regexp in multiple goroutines,
    giving each goroutine its own copy helped to avoid lock contention.
    As of Go 1.12, using Copy is no longer necessary to avoid lock contention.
    Copy may still be appropriate if the reason for its use is to make two
    copies with different Regexp.Longest settings.

func (re *Regexp) Expand(dst []byte, template []byte, src []byte, match []int) []byte
    Expand appends template to dst and returns the result; during the
    append, Expand replaces variables in the template with corresponding
    matches drawn from src. The match slice should have been returned by
    Regexp.FindSubmatchIndex.

    In the template, a variable is denoted by a substring of the form $name
    or ${name}, where name is a non-empty sequence of letters, digits, and
    underscores. A purely numeric name like $1 refers to the submatch with the
    corresponding index; other names refer to capturing parentheses named with
    the (?P<name>...) syntax. A reference to an out of range or unmatched index
    or a name that is not present in the regular expression is replaced with an
    empty slice.

    In the $name form, name is taken to be as long as possible: $1x is
    equivalent to ${1x}, not ${1}x, and, $10 is equivalent to ${10}, not ${1}0.

    To insert a literal $ in the output, use $$ in the template.

func (re *Regexp) ExpandString(dst []byte, template string, src string, match []int) []byte
    ExpandString is like Regexp.Expand but the template and source are strings.
    It appends to and returns a byte slice in order to give the calling code
    control over allocation.

func (re *Regexp) Find(b []byte) []byte
    Find returns the text of the leftmost match for re in b. The return value is
    nil for no match.

func (re *Regexp) FindAll(b []byte, n int) [][]byte
    FindAll returns all the matches for re in b. If n >= 0, FindAll returns no
    more than n matches. See [Regexp.All] for the equivalent iterator form.

func (re *Regexp) FindAllIndex(b []byte, n int) [][]int
    FindAllIndex returns the locations of all matches for re in b. If n >= 0,
    FindAllIndex returns no more than n matches. See [Regexp.AllIndex] for the
    equivalent iterator form.

func (re *Regexp) FindAllString(s string, n int) []string
    FindAllString returns all the matches for re in s. If n >= 0, FindAllString
    returns no more than n matches. See [Regexp.AllString] for the equivalent
    iterator form.

func (re *Regexp) FindAllStringIndex(s string, n int) [][]int
    FindAllStringIndex returns the locations of all matches for re in s.
    If n >= 0, FindAllStringIndex returns no more than n matches. See
    [Regexp.AllStringIndex] for the equivalent iterator form.

func (re *Regexp) FindAllStringSubmatch(s string, n int) [][]string
    FindAllStringSubmatch returns the locations of all matches for
    re in s, including submatch locations. In each returned match m,
    m[0] is the overall match, m[1] is the first submatch, and so on.
    If n >= 0, FindAllStringSubmatch returns no more than n matches. See
    [Regexp.AllStringSubmatch] for the equivalent iterator form.

func (re *Regexp) FindAllStringSubmatchIndex(s string, n int) [][]int
    FindAllStringSubmatchIndex returns the locations of all matches for re in s,
    including submatch locations. In each returned match m, the overall
    match is s[m[0]:m[1]], the first submatch is s[m[2]:m[3]], and so on.
    If n >= 0, FindAllStringSubmatchIndex returns no more than n matches.
    See [Regexp.AllStringSubmatchIndex] for the equivalent iterator form.

func (re *Regexp) FindAllSubmatch(b []byte, n int) [][][]byte
    FindAllSubmatch returns the locations of all matches for re in b, including
    submatch locations. In each returned match m, the overall match is m[0],
    the first submatch is m[1], and so on. If n >= 0, FindAllSubmatch returns
    no more than n matches. See [Regexp.AllSubmatch] for the equivalent iterator
    form.

func (re *Regexp) FindAllSubmatchIndex(b []byte, n int) [][]int
    FindAllSubmatchIndex returns the locations of all matches for re in b,
    including submatch locations. In each returned match m, the overall
    match is b[m[0]:m[1]], the first submatch is b[m[2]:m[3]], and so on.
    If n >= 0, FindAllSubmatchIndex returns no more than n matches. See
    [Regexp.AllSubmatchIndex] for the equivalent iterator form.

func (re *Regexp) FindIndex(b []byte) (m []int)
    FindIndex returns the location of the leftmost match for re in b. The match
    itself is at b[m[0]:m[1]]. The return value is nil for no match.

func (re *Regexp) FindReaderIndex(r io.RuneReader) (m []int)
    FindReaderIndex returns the location of the leftmost match for re in r.
    The match starts at byte index m[0] and ends just before byte index m[1].
    The return value is nil for no match.

    FindReaderIndex may read arbitrarily far from r, including reading beyond
    the returned match.

func (re *Regexp) FindReaderSubmatchIndex(r io.RuneReader) []int
    FindReaderSubmatchIndex returns the first match for re in r, including
    submatches. The overall match is at byte index m[0] up to m[1], the first
    submatch is at byte index m[2] up to m[3], and so on. The return value is
    nil for no match.

    FindReaderSubmatchIndex may read arbitrarily far from r, including reading
    beyond the returned match.

func (re *Regexp) FindString(s string) string
    FindString returns the text of the leftmost match for re in s.
    The return value is the empty string both for an empty match and for
    no match. To distinguish those two cases, use Regexp.FindStringIndex or
    Regexp.FindStringSubmatch.

func (re *Regexp) FindStringIndex(s string) (m []int)
    FindStringIndex returns the location of the leftmost match for re in s.
    The match itself is at s[m[0]:m[1]]. The return value is nil for no match.

func (re *Regexp) FindStringSubmatch(s string) []string
    FindStringSubmatch returns the first match for re in s, including
    submatches. The overall match is s[0], the first submatch is s[1], and so
    on. The return value is nil for no match.

func (re *Regexp) FindStringSubmatchIndex(s string) []int
    FindStringSubmatchIndex returns the first match for re in s, including
    submatches. The overall match is s[m[0]:m[1]], the first submatch is
    s[m[2]:m[3]], and so on. The return value is nil for no match.

func (re *Regexp) FindSubmatch(b []byte) [][]byte
    FindSubmatch returns the first match for re in b, including submatches.
    The overall match is m[0], the first submatch is m[1], and so on. The return
    value is nil for no match.

func (re *Regexp) FindSubmatchIndex(b []byte) []int
    FindSubmatchIndex returns the first match for re in b, including submatches.
    The overall match is b[m[0]:m[1]], the first submatch is b[m[2]:m[3]],
    and so on. The return value is nil for no match.

func (re *Regexp) LiteralPrefix() (prefix string, complete bool)
    LiteralPrefix returns a literal string that must begin any match of the
    regular expression re. It returns the boolean true if the literal string
    comprises the entire regular expression.

func (re *Regexp) Longest()
    Longest makes future searches prefer the leftmost-longest match. That is,
    when matching against text, the regexp returns a match that begins as early
    as possible in the input (leftmost), and among those it chooses a match
    that is as long as possible. This method modifies the Regexp and may not be
    called concurrently with any other methods.

func (re *Regexp) MarshalText() ([]byte, error)
    MarshalText implements encoding.TextMarshaler. The output matches that of
    calling the Regexp.AppendText method.

    See Regexp.AppendText for more information.

func (re *Regexp) Match(b []byte) bool
    Match reports whether the byte slice b contains any match of the regular
    expression re.

func (re *Regexp) MatchReader(r io.RuneReader) bool
    MatchReader reports whether the text returned by the io.RuneReader contains
    any match of the regular expression re.

func (re *Regexp) MatchString(s string) bool
    MatchString reports whether the string s contains any match of the regular
    expression re.

func (re *Regexp) NumSubexp() int
    NumSubexp returns the number of parenthesized subexpressions in this Regexp.

func (re *Regexp) ReplaceAll(src, repl []byte) []byte
    ReplaceAll returns a copy of src, replacing matches of the Regexp with
    the replacement text repl. Inside repl, $ signs are interpreted as in
    Regexp.Expand.

func (re *Regexp) ReplaceAllFunc(src []byte, repl func([]byte) []byte) []byte
    ReplaceAllFunc returns a copy of src in which all matches of the Regexp have
    been replaced by the return value of function repl applied to the matched
    byte slice. The replacement returned by repl is substituted directly,
    without using Regexp.Expand.

func (re *Regexp) ReplaceAllLiteral(src, repl []byte) []byte
    ReplaceAllLiteral returns a copy of src, replacing matches of the Regexp
    with the replacement bytes repl. The replacement repl is substituted
    directly, without using Regexp.Expand.

func (re *Regexp) ReplaceAllLiteralString(src, repl string) string
    ReplaceAllLiteralString returns a copy of src, replacing matches of the
    Regexp with the replacement string repl. The replacement repl is substituted
    directly, without using Regexp.Expand.

func (re *Regexp) ReplaceAllString(src, repl string) string
    ReplaceAllString returns a copy of src, replacing matches of the Regexp
    with the replacement string repl. Inside repl, $ signs are interpreted as in
    Regexp.Expand.

func (re *Regexp) ReplaceAllStringFunc(src string, repl func(string) string) string
    ReplaceAllStringFunc returns a copy of src in which all matches of the
    Regexp have been replaced by the return value of function repl applied to
    the matched substring. The replacement returned by repl is substituted
    directly, without using Regexp.Expand.

func (re *Regexp) Split(s string, n int) []string
    Split slices s into substrings separated by the expression and returns a
    slice of the substrings between those expression matches.

    The slice returned by this method consists of all the substrings of s
    not contained in the slice returned by Regexp.FindAllString. When called
    on an expression that contains no metacharacters, it is equivalent to
    strings.SplitN.

    Example:

        s := regexp.MustCompile("a*").Split("abaabaccadaaae", 5)
        // s: ["", "b", "b", "c", "cadaaae"]

    The count determines the number of substrings to return:
      - n > 0: at most n substrings; the last substring will be the unsplit
        remainder;
      - n == 0: the result is nil (zero substrings);
      - n < 0: all substrings.

func (re *Regexp) String() string
    String returns the source text used to compile the regular expression.

func (re *Regexp) SubexpIndex(name string) int
    SubexpIndex returns the index of the first subexpression with the given
    name, or -1 if there is no subexpression with that name.

    Note that multiple subexpressions can be written using the same name, as in
    (?P<bob>a+)(?P<bob>b+), which declares two subexpressions named "bob". In
    this case, SubexpIndex returns the index of the leftmost such subexpression
    in the regular expression.

func (re *Regexp) SubexpNames() []string
    SubexpNames returns the names of the parenthesized subexpressions in this
    Regexp. The name for the first sub-expression is names[1], so that if m is
    a match slice, the name for m[i] is SubexpNames()[i]. Since the Regexp as a
    whole cannot be named, names[0] is always the empty string. The slice should
    not be modified.

func (re *Regexp) UnmarshalText(text []byte) error
    UnmarshalText implements encoding.TextUnmarshaler by calling Compile on the
    encoded value.
```

## encoding/json

```go
package json // import "encoding/json"

Package json implements encoding and decoding of JSON as defined in RFC 7159.
The mapping between JSON and Go values is described in the documentation for the
Marshal and Unmarshal functions.

See JSON and Go for an introduction to this package.

# Security Considerations

See the "Security Considerations" section in encoding/json/v2.

For historical reasons, the default behavior of v1 encoding/json unfortunately
operates with less secure defaults. New usages of JSON in Go are encouraged to
use encoding/json/v2 instead.

# Migrating to v2

This package (i.e., encoding/json) is now formally known as the v1 package since
a v2 package now exists at encoding/json/v2. All the behavior of the v1 package
is implemented in terms of the v2 package with the appropriate set of options
specified that preserve the historical behavior of v1.

The jsonv2.Marshal function is the newer equivalent of v1 Marshal.
The jsonv2.Unmarshal function is the newer equivalent of v1 Unmarshal. The v2
functions have the same calling signature as the v1 equivalent except that they
take in variadic Options arguments that can be specified to alter the behavior
of marshal or unmarshal. Both v1 and v2 generally behave in similar ways,
but there are some notable differences.

The following is a list of differences between v1 and v2:

  - In v1, JSON object members are unmarshaled into a Go struct using
    a case-insensitive name match with the JSON name of the fields.
    In contrast, v2 matches fields using an exact, case-sensitive match.
    The jsonv2.MatchCaseInsensitiveNames and MatchCaseSensitiveDelimiter options
    control this behavior difference. To explicitly specify a Go struct field
    to use a particular name matching scheme, either the `case:ignore` or the
    `case:strict` field option can be specified. Field-specified options take
    precedence over caller-specified options.

  - In v1, when marshaling a Go struct, a field marked as `omitempty` is omitted
    if the field value is an "empty" Go value, which is defined as false, 0,
    a nil pointer, a nil interface value, and any empty array, slice, map, or
    string. In contrast, v2 redefines `omitempty` to omit a field if it encodes
    as an "empty" JSON value, which is defined as a JSON null, or an empty JSON
    string, object, or array. The OmitEmptyWithLegacySemantics option controls
    this behavior difference. Note that `omitempty` behaves identically in both
    v1 and v2 for a Go array, slice, map, or string (assuming no user-defined
    MarshalJSON method overrides the default representation). Existing usages of
    `omitempty` on a Go bool, number, pointer, or interface value should migrate
    to specifying `omitzero` instead (which is identically supported in both v1
    and v2).

  - In v1, a Go struct field marked as `string` can be used to quote a Go
    string, bool, number, or pointer to such as a JSON string. In contrast,
    v2 restricts the `string` option to only quote a value that would normally
    be represented as a JSON number, but also expands support for it to operate
    with any Go type that would normally be represented as a JSON number.
    The StringifyWithLegacySemantics option controls this behavior difference.

  - In v1, a nil Go slice or Go map is marshaled as a JSON null. In contrast,
    v2 marshals a nil Go slice or Go map as an empty JSON array or JSON object,
    respectively. The jsonv2.FormatNilSliceAsNull and jsonv2.FormatNilMapAsNull
    options control this behavior difference.

  - In v1, a Go array may be unmarshaled from a JSON array of any length. In
    contrast, in v2 a Go array must be unmarshaled from a JSON array of the same
    length, otherwise it results in an error. The UnmarshalArrayFromAnyLength
    option controls this behavior difference.

  - In v1, a Go byte array is represented as a JSON array of JSON numbers.
    In contrast, in v2 a Go byte array is represented as a Base64-encoded JSON
    string. The FormatByteArrayAsArray option controls this behavior difference.

  - In v1, MarshalJSON methods declared on a pointer receiver are
    only called if the Go value is addressable. In contrast, in v2 a
    MarshalJSON method is always callable regardless of addressability.
    The CallMethodsWithLegacySemantics option controls this behavior difference.

  - In v1, MarshalJSON and UnmarshalJSON methods are never called for Go map
    keys. In contrast, in v2 a MarshalJSON or UnmarshalJSON method is eligible
    for being called for Go map keys. The CallMethodsWithLegacySemantics option
    controls this behavior difference.

  - In v1, a Go map is marshaled in a deterministic order. In contrast, in v2 a
    Go map is marshaled in a non-deterministic order. The jsonv2.Deterministic
    option controls this behavior difference.

  - In v1, JSON strings are encoded with HTML-specific or JavaScript-specific
    characters being escaped. In contrast, in v2 JSON strings use the
    minimal encoding and only escape if required by the JSON grammar.
    The jsontext.EscapeForHTML and jsontext.EscapeForJS options control this
    behavior difference.

  - In v1, bytes of invalid UTF-8 within a string are silently replaced with the
    Unicode replacement character. In contrast, in v2 the presence of invalid
    UTF-8 results in an error. The jsontext.AllowInvalidUTF8 option controls
    this behavior difference.

  - In v1, a JSON object with duplicate names is permitted. In contrast,
    in v2 a JSON object with duplicate names results in an error. The
    jsontext.AllowDuplicateNames option controls this behavior difference.

  - In v1, when unmarshaling a JSON null into a non-empty Go value it will
    inconsistently either zero out the value or do nothing. In contrast,
    in v2 unmarshaling a JSON null will consistently and always zero out the
    underlying Go value. The MergeWithLegacySemantics option controls this
    behavior difference.

  - In v1, when unmarshaling a JSON value into a non-zero Go value,
    it merges into the original Go value for array elements, slice elements,
    struct fields (but not map values), pointer values, and interface values
    (only if a non-nil pointer). In contrast, in v2 unmarshal merges into the Go
    value for struct fields, map values, pointer values, and interface values.
    In general, the v2 semantic merges when unmarshaling a JSON object,
    otherwise it replaces the value. The MergeWithLegacySemantics option
    controls this behavior difference.

  - In v1, a time.Duration is represented as a JSON number containing the
    decimal number of nanoseconds. In contrast, in v2 a time.Duration
    has no default representation and results in a runtime error. The
    FormatDurationAsNano option controls this behavior difference.

  - In v1, errors are never reported at runtime for Go struct types that have
    some form of structural error (e.g., a malformed tag option). In contrast,
    v2 reports a runtime error for Go types that are invalid as they relate to
    JSON serialization. For example, a Go struct with only unexported fields
    cannot be serialized. The ReportErrorsWithLegacySemantics option controls
    this behavior difference.

As mentioned, the entirety of v1 is implemented in terms of v2, where options
are implicitly specified to opt into legacy behavior. For example, Marshal
directly calls jsonv2.Marshal with DefaultOptionsV1. Similarly, Unmarshal
directly calls jsonv2.Unmarshal with DefaultOptionsV1. The DefaultOptionsV1
option represents the set of all options that specify default v1 behavior.

For many of the behavior differences, there are Go struct field options that the
author of a Go type can specify to control the behavior such that the type is
represented identically in JSON under either v1 or v2 semantics.

The availability of DefaultOptionsV1 and jsonv2.DefaultOptionsV2, where later
options take precedence over former options allows for a gradual migration from
v1 to v2. For example:

  - jsonv1.Marshal(v) uses default v1 semantics.

  - jsonv2.Marshal(v, jsonv1.DefaultOptionsV1()) is semantically equivalent to
    jsonv1.Marshal and thus uses default v1 semantics.

  - jsonv2.Marshal(v, jsonv1.DefaultOptionsV1(),
    jsontext.AllowDuplicateNames(false)) uses mostly v1 semantics, but opts into
    one particular v2-specific behavior.

  - jsonv2.Marshal(v, jsonv1.CallMethodsWithLegacySemantics(true)) uses mostly
    v2 semantics, but opts into one particular v1-specific behavior.

  - jsonv2.Marshal(v, ..., jsonv2.DefaultOptionsV2()) is semantically equivalent
    to jsonv2.Marshal since jsonv2.DefaultOptionsV2 overrides any options
    specified earlier and thus uses default v2 semantics.

  - jsonv2.Marshal(v) uses default v2 semantics.

All new usages of "json" in Go should use the v2 package, but the v1 package
will forever remain supported.

See the encoding/json/v2 Migration Guide for additional detail on migration
approaches.

[JSON and Go]: https://go.dev/blog/json
[encoding/json/v2 Migration Guide]: https://go.dev/doc/jsonv2-migration

FUNCTIONS

func Compact(dst *bytes.Buffer, src []byte) error
    Compact appends to dst the JSON-encoded src with insignificant space
    characters elided.

func HTMLEscape(dst *bytes.Buffer, src []byte)
    HTMLEscape appends to dst the JSON-encoded src with <, >, &, U+2028 and
    U+2029 characters inside string literals changed to \u003c, \u003e, \u0026,
    \u2028, \u2029 so that the JSON will be safe to embed inside HTML <script>
    tags. For historical reasons, web browsers don't honor standard HTML
    escaping within <script> tags, so an alternative JSON encoding must be used.

func Indent(dst *bytes.Buffer, src []byte, prefix, indent string) error
    Indent appends to dst an indented form of the JSON-encoded src. Each element
    in a JSON object or array begins on a new, indented line beginning with
    prefix followed by one or more copies of indent according to the indentation
    nesting. The data appended to dst does not begin with the prefix nor any
    indentation, to make it easier to embed inside other formatted JSON data.
    Although leading space characters (space, tab, carriage return, newline) at
    the beginning of src are dropped, trailing space characters at the end of
    src are preserved and copied to dst. For example, if src has no trailing
    spaces, neither will dst; if src ends in a trailing newline, so will dst.

func Marshal(v any) ([]byte, error)
    Marshal returns the JSON encoding of v.

    Marshal traverses the value v recursively.

    The input value is encoded as JSON according the following rules:

      - If the value type implements jsonv2.MarshalerTo, then the MarshalJSONTo
        method is called to encode the value. If the method returns
        errors.ErrUnsupported, then the input is encoded according to subsequent
        rules.

      - If the value type implements Marshaler, then the MarshalJSON method is
        called to encode the value.

      - If the value type implements encoding.TextAppender, then the AppendText
        method is called to encode the value and subsequently encode its result
        as a JSON string.

      - If the value type implements encoding.TextMarshaler, then the
        MarshalText method is called to encode the value and subsequently encode
        its result as a JSON string.

    Otherwise, Marshal uses the following type-dependent default encodings:

    Boolean values encode as JSON booleans.

    Floating point, integer, and Number values encode as JSON numbers. NaN and
    +/-Inf values will return an UnsupportedValueError.

    String values encode as JSON strings coerced to valid UTF-8, replacing
    invalid bytes with the Unicode replacement rune. So that the JSON will
    be safe to embed inside HTML <script> tags, the string is encoded using
    HTMLEscape, which replaces "<", ">", "&", U+2028, and U+2029 are escaped to
    "\u003c","\u003e", "\u0026", "\u2028", and "\u2029". This replacement can be
    disabled when using an Encoder, by calling Encoder.SetEscapeHTML(false).

    Array and slice values encode as JSON arrays, except that []byte encodes as
    a base64-encoded string, and a nil slice encodes as the null JSON value.

    Struct values encode as JSON objects. Each exported struct field becomes
    a member of the object, using the field name as the object key, unless the
    field is omitted for one of the reasons given below.

    The encoding of each struct field can be customized by the format string
    stored under the "json" key in the struct field's tag. The format string
    gives the name of the field, possibly followed by a comma-separated list
    of options. The name may be empty in order to specify options without
    overriding the default field name.

    The "omitempty" option specifies that the field should be omitted from
    the encoding if the field has an empty value, defined as false, 0,
    a nil pointer, a nil interface value, and any array, slice, map, or string
    of length zero.

    As a special case, if the field tag is "-", the field is always omitted.
    JSON names containing commas or quotes, or names identical to "" or "-",
    can be specified using a single-quoted string literal, where the syntax is
    identical to the Go grammar for a double-quoted string literal, but instead
    uses single quotes as the delimiters.

    Examples of struct field tags and their meanings:

        // Field appears in JSON as key "myName".
        Field int `json:"myName"`

        // Field appears in JSON as key "myName" and
        // the field is omitted from the object if its value is empty,
        // as defined above.
        Field int `json:"myName,omitempty"`

        // Field appears in JSON as key "Field" (the default), but
        // the field is skipped if empty.
        // Note the leading comma.
        Field int `json:",omitempty"`

        // Field is ignored by this package.
        Field int `json:"-"`

        // Field appears in JSON as key "-".
        Field int `json:"'-'"`

    The "omitzero" option specifies that the field should be omitted from the
    encoding if the field has a zero value, according to rules:

    1) If the field type has an "IsZero() bool" method, that will be used to
    determine whether the value is zero.

    2) Otherwise, the value is zero if it is the zero value for its type.

    If both "omitempty" and "omitzero" are specified, the field will be omitted
    if the value is either empty or zero (or both).

    The "string" option signals that a field is stored as JSON inside a
    JSON-encoded string. It applies only to fields of string, floating point,
    integer, or boolean types. This extra level of encoding is sometimes used
    when communicating with JavaScript programs:

        Int64String int64 `json:",string"`

    The key name will be used if it's a non-empty string consisting of only
    Unicode letters, digits, and ASCII punctuation except quotation marks,
    backslash, and comma.

    Embedded struct fields are usually marshaled as if their inner exported
    fields were fields in the outer struct, subject to the usual Go visibility
    rules amended as described in the next paragraph. An anonymous struct field
    with a name given in its JSON tag is treated as having that name, rather
    than being anonymous. An anonymous struct field of interface type is treated
    the same as having that type as its name, rather than being anonymous.

    The Go visibility rules for struct fields are amended for JSON when deciding
    which field to marshal or unmarshal. If there are multiple fields at the
    same level, and that level is the least nested (and would therefore be the
    nesting level selected by the usual Go rules), the following extra rules
    apply:

    1) Of those fields, if any are JSON-tagged, only tagged fields are
    considered, even if there are multiple untagged fields that would otherwise
    conflict.

    2) If there is exactly one field (tagged or not according to the first
    rule), that is selected.

    3) Otherwise there are multiple fields, and all are ignored; no error
    occurs.

    Handling of anonymous struct fields is new in Go 1.1. Prior to Go 1.1,
    anonymous struct fields were ignored. To force ignoring of an anonymous
    struct field in both current and earlier versions, give the field a JSON tag
    of "-".

    Map values encode as JSON objects. The map's key type must either be a
    string, an integer type, or implement encoding.TextMarshaler. The map keys
    are sorted and used as JSON object keys by applying the following rules,
    subject to the UTF-8 coercion described for string values above:
      - keys of any string type are used directly
      - keys that implement encoding.TextMarshaler are marshaled
      - integer keys are converted to strings

    Pointer values encode as the value pointed to. A nil pointer encodes as the
    null JSON value.

    Interface values encode as the value contained in the interface. A nil
    interface value encodes as the null JSON value.

    Channel, complex, and function values cannot be encoded in JSON. Attempting
    to encode such a value causes Marshal to return an UnsupportedTypeError.

    JSON cannot represent cyclic data structures and Marshal does not handle
    them. Passing cyclic structures to Marshal will result in an error.

func MarshalIndent(v any, prefix, indent string) ([]byte, error)
    MarshalIndent is like Marshal but applies Indent to format the output.
    Each JSON element in the output will begin on a new line beginning with
    prefix followed by one or more copies of indent according to the indentation
    nesting.

func Unmarshal(data []byte, v any) error
    Unmarshal parses the JSON-encoded data and stores the result in the
    value pointed to by v. If v is nil or not a pointer, Unmarshal returns an
    InvalidUnmarshalError.

    Unmarshal uses the inverse of the encodings that Marshal uses, allocating
    maps, slices, and pointers as necessary, with the following additional
    rules:

    To unmarshal JSON into a pointer, Unmarshal first handles the case of the
    JSON being the JSON literal null. In that case, Unmarshal sets the pointer
    to nil. Otherwise, Unmarshal unmarshals the JSON into the value pointed at
    by the pointer. If the pointer is nil, Unmarshal allocates a new value for
    it to point to.

    The JSON input is decoded according the following rules:

      - If the value type implements jsonv2.UnmarshalerFrom, then the
        UnmarshalJSONFrom method is called to decode the JSON value.
        If the method returns errors.ErrUnsupported, then the input is decoded
        according to subsequent rules.

      - If the value type implements Unmarshaler, then the UnmarshalJSON method
        is called to decode the JSON value, including when the input is a JSON
        null.

      - If the value implements encoding.TextUnmarshaler and the input is a JSON
        string, then the UnmarshalText method is called with the unquoted form
        of the string.

    Otherwise, Unmarshal uses the following type-dependent default decodings:

    To unmarshal JSON into a struct, Unmarshal matches incoming object keys
    to the keys used by Marshal (either the struct field name or its tag),
    preferring an exact match but also accepting a case-insensitive match.
    By default, object keys which don't have a corresponding struct field are
    ignored (see Decoder.DisallowUnknownFields for an alternative).

    To unmarshal JSON into an interface value, Unmarshal stores one of these in
    the interface value:

      - bool, for JSON booleans
      - float64, for JSON numbers
      - string, for JSON strings
      - []any, for JSON arrays
      - map[string]any, for JSON objects
      - nil for JSON null

    To unmarshal a JSON array into a slice, Unmarshal decodes each JSON array
    element into the corresponding slice element, reusing existing slice
    elements in-place. The slice grows to accommodate additional elements, or is
    truncated if the JSON array is shorter. As a special case, to unmarshal an
    empty JSON array into a slice, Unmarshal replaces the slice with a new empty
    slice.

    To unmarshal a JSON array into a Go array, Unmarshal decodes JSON array
    elements into corresponding Go array elements. If the Go array is smaller
    than the JSON array, the additional JSON array elements are discarded.
    If the JSON array is smaller than the Go array, the additional Go array
    elements are set to zero values.

    To unmarshal a JSON object into a map, Unmarshal first establishes
    a map to use. If the map is nil, Unmarshal allocates a new map.
    Otherwise Unmarshal reuses the existing map, keeping existing entries.
    Unmarshal then stores key-value pairs from the JSON object into the map.
    The map's key type must either be any string type, an integer, or implement
    encoding.TextUnmarshaler.

    If the JSON-encoded data contain a syntax error, Unmarshal returns a
    SyntaxError.

    If a JSON value is not appropriate for a given target type, or if a JSON
    number overflows the target type, Unmarshal skips that field and completes
    the unmarshaling as best it can. If no more serious errors are encountered,
    Unmarshal returns an UnmarshalTypeError describing the earliest such error.
    In any case, it's not guaranteed that all the remaining fields following the
    problematic one will be unmarshaled into the target object.

    The JSON null value unmarshals into an interface, map, pointer, or slice
    by setting that Go value to nil. Because null is often used in JSON to mean
    “not present,” unmarshaling a JSON null into any other Go type has no effect
    on the value and produces no error.

    When unmarshaling quoted strings, invalid UTF-8 or invalid UTF-16 surrogate
    pairs are not treated as an error. Instead, they are replaced by the Unicode
    replacement character U+FFFD.

func Valid(data []byte) bool
    Valid reports whether data is a valid JSON encoding.


TYPES

type Decoder struct {
	// Has unexported fields.
}
    A Decoder reads and decodes JSON values from an input stream.

func NewDecoder(r io.Reader) *Decoder
    NewDecoder returns a new decoder that reads from r.

    The decoder introduces its own buffering and may read data from r beyond the
    JSON values requested.

func (dec *Decoder) Buffered() io.Reader
    Buffered returns a reader of the data remaining in the unread buffer, which
    may contain zero or more bytes. This is the data already consumed from the
    input io.Reader, but not yet read by a Decoder.Decode or Decoder.Token call.
    It may contain bytes that do not form valid JSON as it has not yet been
    validated according to the JSON grammar. The exact amount of buffered data
    is an implementation detail of the Decoder and may change over time.

    It is the caller's responsibility to concatenate this buffer with the
    remainder of the input Reader to obtain the full sequence of bytes after the
    last decoded JSON value.

    The reader is valid until the next call to Decoder.Decode or Decoder.Token.

func (dec *Decoder) Decode(v any) error
    Decode reads the next JSON-encoded value from its input and stores it in the
    value pointed to by v.

    See the documentation for Unmarshal for details about the conversion of JSON
    into a Go value.

func (dec *Decoder) DisallowUnknownFields()
    DisallowUnknownFields causes the Decoder to return an error when the
    destination is a struct and the input contains object keys which do not
    match any non-ignored, exported fields in the destination.

func (dec *Decoder) InputOffset() int64
    InputOffset returns the input stream byte offset of the current decoder
    position. The offset gives the location of the end of the most recently
    returned token and the beginning of the next token.

func (dec *Decoder) More() bool
    More reports whether there is another element in the current array or object
    being parsed.

func (dec *Decoder) Token() (Token, error)
    Token returns the next JSON token in the input stream. At the end of the
    input stream, Token returns nil, io.EOF.

    Token guarantees that the delimiters [ ] { } it returns are properly nested
    and matched: if Token encounters an unexpected delimiter in the input,
    it will return an error.

    The input stream consists of basic JSON values—bool, string, number,
    and null—along with delimiters [ ] { } of type Delim to mark the start and
    end of arrays and objects. Commas and colons are elided.

func (dec *Decoder) UseNumber()
    UseNumber causes the Decoder to unmarshal a number into an interface value
    as a Number instead of as a float64.

type Delim rune
    A Delim is a JSON array or object delimiter, one of [ ] { or }.

func (d Delim) String() string

type Encoder struct {
	// Has unexported fields.
}
    An Encoder writes JSON values to an output stream.

func NewEncoder(w io.Writer) *Encoder
    NewEncoder returns a new encoder that writes to w.

func (enc *Encoder) Encode(v any) error
    Encode writes the JSON encoding of v to the stream, followed by a newline
    character.

    See the documentation for Marshal for details about the conversion of Go
    values to JSON.

func (enc *Encoder) SetEscapeHTML(on bool)
    SetEscapeHTML specifies whether problematic HTML characters should be
    escaped inside JSON quoted strings. The default behavior is to escape &, <,
    and > to \u0026, \u003c, and \u003e to avoid certain safety problems that
    can arise when embedding JSON in HTML.

    In non-HTML settings where the escaping interferes with the readability of
    the output, SetEscapeHTML(false) disables this behavior.

func (enc *Encoder) SetIndent(prefix, indent string)
    SetIndent instructs the encoder to format each subsequent encoded value as
    if indented by the package-level function Indent(dst, src, prefix, indent).
    Calling SetIndent("", "") disables indentation.

type InvalidUTF8Error struct {
	S string // the whole string value that caused the error
}
    Before Go 1.2, an InvalidUTF8Error was returned by Marshal when attempting
    to encode a string value with invalid UTF-8 sequences. As of Go 1.2,
    Marshal instead coerces the string to valid UTF-8 by replacing invalid bytes
    with the Unicode replacement rune U+FFFD.

    Deprecated: No longer used; kept for compatibility.

func (e *InvalidUTF8Error) Error() string

type InvalidUnmarshalError struct {
	Type reflect.Type
}
    An InvalidUnmarshalError describes an invalid argument passed to Unmarshal.
    (The argument to Unmarshal must be a non-nil pointer.)

func (e *InvalidUnmarshalError) Error() string

type Marshaler = jsonv2.Marshaler
    Marshaler is the interface implemented by types that can marshal themselves
    into valid JSON.

type MarshalerError struct {
	Type reflect.Type
	Err  error
	// Has unexported fields.
}
    A MarshalerError represents an error from calling a [Marshaler.MarshalJSON]
    or encoding.TextMarshaler.MarshalText method.

func (e *MarshalerError) Error() string

func (e *MarshalerError) Unwrap() error
    Unwrap returns the underlying error.

type Number string
    A Number represents a JSON number literal.

func (n Number) Float64() (float64, error)
    Float64 returns the number as a float64.

func (n Number) Int64() (int64, error)
    Int64 returns the number as an int64.

func (n Number) MarshalJSONTo(enc *jsontext.Encoder) error
    MarshalJSONTo implements jsonv2.MarshalerTo.

func (n Number) String() string
    String returns the literal text of the number.

func (n *Number) UnmarshalJSONFrom(dec *jsontext.Decoder) error
    UnmarshalJSONFrom implements jsonv2.UnmarshalerFrom.

type Options = jsonopts.Options
    Options are a set of options to configure the v2 "json" package to operate
    with v1 semantics for particular features. Values of this type can be
    passed to v2 functions like jsonv2.Marshal or jsonv2.Unmarshal. Instead of
    referencing this type, use jsonv2.Options.

    See the "Migrating to v2" section for guidance on how to migrate usage of
    "json" from using v1 to using v2 instead.

func CallMethodsWithLegacySemantics(v bool) Options
    CallMethodsWithLegacySemantics specifies that calling of type-provided
    marshal and unmarshal methods follow legacy semantics:

      - When marshaling, a marshal method declared on a pointer receiver is only
        called if the Go value is addressable. Values obtained from an interface
        or map element are not addressable. Values obtained from a pointer or
        slice element are addressable. Values obtained from an array element
        or struct field inherit the addressability of the parent. In contrast,
        the v2 semantic is to always call marshal methods regardless of
        addressability.

      - When marshaling or unmarshaling, the Marshaler or Unmarshaler
        methods are ignored for map keys. However, encoding.TextMarshaler
        or encoding.TextUnmarshaler are still callable. In contrast, the v2
        semantic is to serialize map keys like any other value (with regard to
        calling methods), which may include calling Marshaler or Unmarshaler
        methods, where it is the implementation's responsibility to represent
        the Go value as a JSON string (as required for JSON object names).

      - When marshaling, if a map key value implements a marshal method and is a
        nil pointer, then it is serialized as an empty JSON string. In contrast,
        the v2 semantic is to report an error.

      - When marshaling, if an interface type implements a marshal method
        and the interface value is a nil pointer to a concrete type,
        then the marshal method is always called. In contrast, the v2 semantic
        is to never directly call methods on interface values and to instead
        defer evaluation based upon the underlying concrete value. Similar to
        non-interface values, marshal methods are not called on nil pointers and
        are instead serialized as a JSON null.

    This affects either marshaling or unmarshaling. The v1 default is true.

func DefaultOptionsV1() Options
    DefaultOptionsV1 is the full set of all options that define v1 semantics.
    It is equivalent to the following boolean options being set to true:

      - CallMethodsWithLegacySemantics
      - FormatByteArrayAsArray
      - FormatBytesWithLegacySemantics
      - FormatDurationAsNano
      - MatchCaseSensitiveDelimiter
      - MergeWithLegacySemantics
      - OmitEmptyWithLegacySemantics
      - ParseBytesWithLooseRFC4648
      - ParseTimeWithLooseRFC3339
      - ReportErrorsWithLegacySemantics
      - StringifyWithLegacySemantics
      - UnmarshalArrayFromAnyLength
      - jsonv2.Deterministic
      - jsonv2.FormatNilMapAsNull
      - jsonv2.FormatNilSliceAsNull
      - jsonv2.MatchCaseInsensitiveNames
      - jsontext.AllowDuplicateNames
      - jsontext.AllowInvalidUTF8
      - jsontext.EscapeForHTML
      - jsontext.EscapeForJS
      - jsontext.PreserveRawStrings

    All other options are not present.

    The Marshal and Unmarshal functions in this package are semantically
    identical to calling the v2 equivalents with this option:

        jsonv2.Marshal(v, jsonv1.DefaultOptionsV1())
        jsonv2.Unmarshal(b, v, jsonv1.DefaultOptionsV1())

func FormatByteArrayAsArray(v bool) Options
    FormatByteArrayAsArray specifies that a Go [N]byte is formatted as a normal
    Go array in contrast to the v2 default of formatting [N]byte as using binary
    data encoding (RFC 4648).

    This affects either marshaling or unmarshaling. The v1 default is true.

func FormatBytesWithLegacySemantics(v bool) Options
    FormatBytesWithLegacySemantics specifies that handling of []~byte and
    [N]~byte types follow legacy semantics:

      - A Go []~byte is to be treated as using some form of binary data encoding
        (RFC 4648) in contrast to the v2 default of only treating []byte as
        such. In particular, v2 does not treat slices of named byte types as
        representing binary data.

      - When marshaling, if a named byte implements a marshal method, then the
        slice is serialized as a JSON array of elements, each of which call the
        marshal method.

      - When unmarshaling, if the input is a JSON array, then unmarshal into the
        []~byte as if it were a normal Go slice. In contrast, the v2 default is
        to report an error unmarshaling a JSON array when expecting some form of
        binary data encoding.

    This affects either marshaling or unmarshaling. The v1 default is true.

func FormatDurationAsNano(v bool) Options
    FormatDurationAsNano specifies that a time.Duration is formatted as a JSON
    number representing the number of nanoseconds in contrast to the v2 default
    of reporting an error.

    This affects either marshaling or unmarshaling. The v1 default is true.

func MatchCaseSensitiveDelimiter(v bool) Options
    MatchCaseSensitiveDelimiter specifies that underscores and dashes are not
    to be ignored when performing case-insensitive name matching which occurs
    under jsonv2.MatchCaseInsensitiveNames or the `case:ignore` tag option.
    Thus, case-insensitive name matching is identical to strings.EqualFold.
    Use of this option diminishes the ability of case-insensitive matching to be
    able to match common case variants (e.g., "foo_bar" with "fooBar").

    This affects either marshaling or unmarshaling. The v1 default is true.

func MergeWithLegacySemantics(v bool) Options
    MergeWithLegacySemantics specifies that unmarshaling into a non-zero Go
    value follows legacy semantics:

      - When unmarshaling a JSON null, this preserves the original Go value
        if the kind is a bool, int, uint, float, string, array, or struct.
        Otherwise, it zeros the Go value. In contrast, the default v2 behavior
        is to consistently and always zero the Go value when unmarshaling a JSON
        null into it.

      - When unmarshaling a JSON value other than null, this merges into the
        original Go value for array elements, slice elements, struct fields (but
        not map values), pointer values, and interface values (only if a non-nil
        pointer). For slices, it will merge into the pre-existing value of slice
        elements even for those past the slice length. If the original slice
        length was longer than the JSON array, then it is truncated to match.
        In contrast, the default v2 behavior is to merge into the Go value
        for struct fields, map values, pointer values, and interface values.
        In general, the v2 semantic merges when unmarshaling a JSON object,
        otherwise it replaces the original value.

    This only affects unmarshaling and is ignored when marshaling. The v1
    default is true.

func OmitEmptyWithLegacySemantics(v bool) Options
    OmitEmptyWithLegacySemantics specifies that the `omitempty` tag option
    follows a definition of empty where a field is omitted if the Go value is
    false, 0, a nil pointer, a nil interface value, or any empty array, slice,
    map, or string. This overrides the v2 semantic where a field is empty if the
    value marshals as a JSON null or an empty JSON string, object, or array.

    The v1 and v2 definitions of `omitempty` are practically the same for Go
    strings, slices, arrays, and maps. Usages of `omitempty` on Go bools, ints,
    uints, floats, pointers, and interfaces should migrate to use the `omitzero`
    tag option, which omits a field if it is the zero Go value.

    This only affects marshaling and is ignored when unmarshaling. The v1
    default is true.

func ParseBytesWithLooseRFC4648(v bool) Options
    ParseBytesWithLooseRFC4648 specifies that when parsing binary data encoded
    as "base32" or "base64", to ignore the presence of '\r' and '\n' characters.
    In contrast, the v2 default is to report an error in order to be strictly
    compliant with RFC 4648, section 3.3, which specifies that non-alphabet
    characters must be rejected.

    This only affects unmarshaling and is ignored when marshaling. The v1
    default is true.

func ParseTimeWithLooseRFC3339(v bool) Options
    ParseTimeWithLooseRFC3339 specifies that a time.Time parses according
    to loose adherence to RFC 3339. In particular, it permits historically
    incorrect representations, allowing for deviations in hour format,
    sub-second separator, and timezone representation. In contrast, the default
    v2 behavior is to strictly comply with the grammar specified in RFC 3339.

    This only affects unmarshaling and is ignored when marshaling. The v1
    default is true.

func ReportErrorsWithLegacySemantics(v bool) Options
    ReportErrorsWithLegacySemantics specifies that Marshal and Unmarshal should
    report errors with legacy semantics:

      - When marshaling or unmarshaling, the returned error values are usually
        of types such as SyntaxError, MarshalerError, UnsupportedTypeError,
        UnsupportedValueError, InvalidUnmarshalError, or UnmarshalTypeError.
        In contrast, the v2 semantic is to always return errors as either
        jsonv2.SemanticError or jsontext.SyntacticError.

      - When marshaling, if a user-defined marshal method reports an error,
        it is always wrapped in a MarshalerError, even if the error itself is
        already a MarshalerError, which may lead to multiple redundant layers of
        wrapping. In contrast, the v2 semantic is to always wrap an error within
        jsonv2.SemanticError unless it is already a semantic error.

      - When unmarshaling, if a user-defined unmarshal method reports an error,
        it is never wrapped and reported verbatim. In contrast, the v2 semantic
        is to always wrap an error within jsonv2.SemanticError unless it is
        already a semantic error.

      - When marshaling or unmarshaling, if a Go struct contains type errors
        (e.g., conflicting names or malformed field tags), then such errors
        are ignored and the Go struct uses a best-effort representation.
        In contrast, the v2 semantic is to report a runtime error.

      - When unmarshaling with jsonv2.MatchCaseInsensitiveNames, if a JSON
        object name has a non-exact match with multiple Go struct fields, then
        an error is not reported and instead the first declared field is used.
        In contrast, the v2 semantic is to report a runtime error.

      - When unmarshaling, the syntactic structure of the JSON input is fully
        validated before performing the semantic unmarshaling of the JSON data
        into the Go value. Practically speaking, this means that JSON input with
        syntactic errors do not result in any mutations of the target Go value.
        In contrast, the v2 semantic is to perform a streaming decode and
        gradually unmarshal the JSON input into the target Go value, which means
        that the Go value may be partially mutated when a syntactic error is
        encountered.

      - When unmarshaling, a semantic error does not immediately terminate the
        unmarshal procedure, but rather evaluation continues. When unmarshal
        returns, only the first semantic error is reported. In contrast, the v2
        semantic is to terminate unmarshal the moment an error is encountered.

    This affects either marshaling or unmarshaling. The v1 default is true.

func StringifyWithLegacySemantics(v bool) Options
    StringifyWithLegacySemantics specifies that the `string` tag option may
    stringify bools and string values. It only takes effect on fields where the
    top-level type is a bool, string, numeric kind, or a pointer to such a kind.
    In contrast, the v2 default only allows the `string` tag option on Go types
    that would have otherwise serialized as a JSON number, and stringifies the
    JSON number within a JSON string. In particular, the v2 default does not
    stringify Go bools and strings. If ReportErrorsWithLegacySemantics is false,
    then incorrect usages of `string` result in a runtime error.

    When marshaling, such Go values are serialized as their usual JSON
    representation, but quoted within a JSON string. When unmarshaling,
    such Go values must be deserialized from a JSON string containing their
    usual JSON representation or Go number representation for that numeric kind.
    Note that the Go number grammar is a superset of the JSON number grammar. A
    JSON null quoted in a JSON string is a valid substitute for JSON null while
    unmarshaling into a Go value that `string` takes effect on. In contrast,
    the v2 default rejects stringified numbers outside of the grammar for a JSON
    number and also rejects a JSON null quoted in a JSON string.

    This affects either marshaling or unmarshaling. The v1 default is true.

func UnmarshalArrayFromAnyLength(v bool) Options
    UnmarshalArrayFromAnyLength specifies that Go arrays can be unmarshaled
    from input JSON arrays of any length. If the JSON array is too short,
    then the remaining Go array elements are zeroed. If the JSON array is too
    long, then the excess JSON array elements are skipped over. In contrast,
    the v2 default expects that Go arrays be unmarshaled from input JSON arrays
    of the exact same length.

    This only affects unmarshaling and is ignored when marshaling. The v1
    default is true.

type RawMessage = jsontext.Value
    RawMessage is a raw encoded JSON value. It implements Marshaler and
    Unmarshaler and can be used to delay JSON decoding or precompute a JSON
    encoding.

type SyntaxError struct {
	Offset int64 // error occurred after reading Offset bytes
	// Has unexported fields.
}
    A SyntaxError is a description of a JSON syntax error. Unmarshal will return
    a SyntaxError if the JSON can't be parsed.

func (e *SyntaxError) Error() string

type Token any
    A Token holds a value of one of these types:

      - Delim, for the four JSON delimiters [ ] { }
      - bool, for JSON booleans
      - float64, for JSON numbers
      - Number, for JSON numbers
      - string, for JSON string literals
      - nil, for JSON null

type UnmarshalFieldError struct {
	Key   string
	Type  reflect.Type
	Field reflect.StructField
}
    An UnmarshalFieldError describes a JSON object key that led to an unexported
    (and therefore unwritable) struct field.

    Deprecated: No longer used; kept for compatibility.

func (e *UnmarshalFieldError) Error() string

type UnmarshalTypeError struct {
	Value  string       // description of JSON value - "bool", "array", "number -5"
	Type   reflect.Type // type of Go value it could not be assigned to
	Offset int64        // error occurred after reading Offset bytes
	Struct string       // name of the root type containing the field
	Field  string       // the full path from root node to the value
	Err    error        // may be nil
}
    An UnmarshalTypeError describes a JSON value that was not appropriate for a
    value of a specific Go type.

func (e *UnmarshalTypeError) Error() string

func (e *UnmarshalTypeError) Unwrap() error

type Unmarshaler = jsonv2.Unmarshaler
    Unmarshaler is the interface implemented by types that can unmarshal a JSON
    description of themselves. The input can be assumed to be a valid encoding
    of a JSON value. UnmarshalJSON must copy the JSON data if it wishes to
    retain the data after returning.

type UnsupportedTypeError struct {
	Type reflect.Type
}
    An UnsupportedTypeError is returned by Marshal when attempting to encode an
    unsupported value type.

func (e *UnsupportedTypeError) Error() string

type UnsupportedValueError struct {
	Value reflect.Value
	Str   string
}
    An UnsupportedValueError is returned by Marshal when attempting to encode an
    unsupported value.

func (e *UnsupportedValueError) Error() string
```

## container/heap

```go
package heap // import "container/heap"

Package heap provides heap operations for any type that implements
heap.Interface. A heap is a tree with the property that each node is the
minimum-valued node in its subtree.

The minimum element in the tree is the root, at index 0.

A heap is a common way to implement a priority queue. To build a priority queue,
implement the Heap interface with the (negative) priority as the ordering for
the Less method, so Push adds items while Pop removes the highest-priority
item from the queue. The Examples include such an implementation; the file
example_pq_test.go has the complete source.

FUNCTIONS

func Fix(h Interface, i int)
    Fix re-establishes the heap ordering after the element at index i has
    changed its value. Changing the value of the element at index i and then
    calling Fix is equivalent to, but less expensive than, calling Remove(h,
    i) followed by a Push of the new value. The complexity is O(log n) where n =
    h.Len().

func Init(h Interface)
    Init establishes the heap invariants required by the other routines in
    this package. Init is idempotent with respect to the heap invariants and
    may be called whenever the heap invariants may have been invalidated.
    The complexity is O(n) where n = h.Len().

func Pop(h Interface) any
    Pop removes and returns the minimum element (according to Less) from the
    heap. The complexity is O(log n) where n = h.Len(). Pop is equivalent to
    Remove(h, 0).

func Push(h Interface, x any)
    Push pushes the element x onto the heap. The complexity is O(log n) where n
    = h.Len().

func Remove(h Interface, i int) any
    Remove removes and returns the element at index i from the heap. The
    complexity is O(log n) where n = h.Len().


TYPES

type Interface interface {
	sort.Interface
	Push(x any) // add x as element Len()
	Pop() any   // remove and return element Len() - 1.
}
    The Interface type describes the requirements for a type using the routines
    in this package. Any type that implements it may be used as a min-heap with
    the following invariants (established after Init has been called or if the
    data is empty or sorted):

        !h.Less(j, i) for 0 <= i < h.Len() and 2*i+1 <= j <= 2*i+2 and j < h.Len()

    Note that Push and Pop in this interface are for package heap's
    implementation to call. To add and remove things from the heap, use
    heap.Push and heap.Pop.
```

## container/list

```go
package list // import "container/list"

Package list implements a doubly linked list.

To iterate over a list (where l is a *List):

    for e := l.Front(); e != nil; e = e.Next() {
    	// do something with e.Value
    }

TYPES

type Element struct {

	// The value stored with this element.
	Value any
	// Has unexported fields.
}
    Element is an element of a linked list.

func (e *Element) Next() *Element
    Next returns the next list element or nil.

func (e *Element) Prev() *Element
    Prev returns the previous list element or nil.

type List struct {
	// Has unexported fields.
}
    List represents a doubly linked list. The zero value for List is an empty
    list ready to use.

func New() *List
    New returns an initialized list.

func (l *List) Back() *Element
    Back returns the last element of list l or nil if the list is empty.

func (l *List) Front() *Element
    Front returns the first element of list l or nil if the list is empty.

func (l *List) Init() *List
    Init initializes or clears list l.

func (l *List) InsertAfter(v any, mark *Element) *Element
    InsertAfter inserts a new element e with value v immediately after mark
    and returns e. If mark is not an element of l, the list is not modified.
    The mark must not be nil.

func (l *List) InsertBefore(v any, mark *Element) *Element
    InsertBefore inserts a new element e with value v immediately before mark
    and returns e. If mark is not an element of l, the list is not modified.
    The mark must not be nil.

func (l *List) Len() int
    Len returns the number of elements of list l. The complexity is O(1).

func (l *List) MoveAfter(e, mark *Element)
    MoveAfter moves element e to its new position after mark. If e or mark is
    not an element of l, or e == mark, the list is not modified. The element and
    mark must not be nil.

func (l *List) MoveBefore(e, mark *Element)
    MoveBefore moves element e to its new position before mark. If e or mark is
    not an element of l, or e == mark, the list is not modified. The element and
    mark must not be nil.

func (l *List) MoveToBack(e *Element)
    MoveToBack moves element e to the back of list l. If e is not an element of
    l, the list is not modified. The element must not be nil.

func (l *List) MoveToFront(e *Element)
    MoveToFront moves element e to the front of list l. If e is not an element
    of l, the list is not modified. The element must not be nil.

func (l *List) PushBack(v any) *Element
    PushBack inserts a new element e with value v at the back of list l and
    returns e.

func (l *List) PushBackList(other *List)
    PushBackList inserts a copy of another list at the back of list l. The lists
    l and other may be the same. They must not be nil.

func (l *List) PushFront(v any) *Element
    PushFront inserts a new element e with value v at the front of list l and
    returns e.

func (l *List) PushFrontList(other *List)
    PushFrontList inserts a copy of another list at the front of list l.
    The lists l and other may be the same. They must not be nil.

func (l *List) Remove(e *Element) any
    Remove removes e from l if e is an element of list l. It returns the element
    value e.Value. The element must not be nil.
```
