# Specs

# Intrinsics

| Name          | Symbol     | Stack Layout                | Stack Pushes |                                                                                                                                                                                                  Description |
| ------------- | ---------- | --------------------------- | ------------ | -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|               |            |                             |              |                                                                                                                                                                                           **Util Functions** |
| Print         | print      | int                         | _none_       |                                                                                                                                                             Print the top number of the stack (+ a new line) |
| FileLocation  | here       | _none_                      | Str          |                                            Puts the string representation of the current file, line and character (at the start of the 'here' token) as a built-in String Representation, ready for printing |
| StackInfo     | ???        | _none_                      | _none_       |                                                                                                                     Halts the program and prints the current Stack (Types-only). Happens during Typechecking |
|               |            |                             |              |                                                                                                                                                                                               **Operations** |
| Add           | +          | int int                     | int          |                                                                                                                                                                                Add the 2 integers at the top |
| Subtract      | -          | int int                     | int          |                                                                                                                                                                           Subtract the 2 integers at the top |
| Multiply      | \*         | int int                     | int          |                                                                                                                                                                           Multiply the 2 integers at the top |
| Div-Mod       | /%         | int int                     | int int      |                                                                                                                                                                     Divide and Mod the 2 integers at the top |
|               |            |                             |              |                                                                                                                                                                                         **Stack Operations** |
| Drop          | drop       | any                         | _none_       |                                                                                                                                                                                        discard the top value |
| Duplicate     | dup        | T                           | T T          |                                                                                                                                                                                      Duplicate the top value |
| Over          | over       | T1 T2                       | T1 T2 T2     |                                                                                                                                                                            Copy the 2nd top value to the top |
| Swap          | swap       | T1 T2                       | T2 T1        |                                                                                                                                                                               Swap the top and 2nd top value |
| Rotate        | rot        | T1 T2 T3                    | T3 T1 T2     |                                                                                                                                                                  Move the top value behind the 3rd top value |
|               |            |                             |              |                                                                                                                                                                                              **Comparisons** |
| LessThan      | <          | int int                     | bool         |                                                                                                                                                        Check if the top value is less than the 2nd top value |
| LessThanEq    | <=         | int int                     | bool         |                                                                                                                                            Check if the top value is less than or equal to the 2nd top value |
| GreaterThan   | >          | int int                     | bool         |                                                                                                                                                     Check if the top value is greater than the 2nd top value |
| GreaterThanEq | >=         | int int                     | bool         |                                                                                                                                         Check if the top value is less greater or equal to the 2nd top value |
| Equal         | =          | int int                     | bool         |                                                                                                                                                         Check if the top value is equal to the 2nd top value |
| NotEqual      | !=         | int int                     | bool         |                                                                                                                                                     Check if the top value is not equal to the 2nd top value |
|               |            |                             |              |                                                                                                                                                                                             **Instructions** |
| Syscall1      | syscall1   | int any                     | int          |                                                                                                                                                         Invoke the syscall-assembly instruction with 1 value |
| Syscall2      | syscall2   | int any any                 | int          |                                                                                                                                                        Invoke the syscall-assembly instruction with 2 values |
| Syscall3      | syscall3   | int any any any             | int          |                                                                                                                                                        Invoke the syscall-assembly instruction with 3 values |
| Syscall4      | syscall4   | int any any any any         | int          |                                                                                                                                                        Invoke the syscall-assembly instruction with 4 values |
| Syscall5      | syscall5   | int any any any any any     | int          |                                                                                                                                                        Invoke the syscall-assembly instruction with 5 values |
| Syscall6      | syscall6   | int any any any any any any | int          |                                                                                                                                                        Invoke the syscall-assembly instruction with 6 values |
| Load          | @          | ptr                         | int          |                                                                                                                                                                                           Load a 8-bit value |
| Store         | !          | ptr int                     | _none_       |                                                                                                                                                                                          Store a 8-bit value |
| Load16        | @16        | ptr                         | int          |                                                                                                                                                                                          Load a 16-bit value |
| Store16       | !16        | ptr int                     | _none_       |                                                                                                                                                                                         Store a 16-bit value |
| Load32        | @32        | ptr                         | int          |                                                                                                                                                                                          Load a 32-bit value |
| Store32       | !32        | ptr int                     | _none_       |                                                                                                                                                                                         Store a 32-bit value |
| Load64        | @64        | ptr                         | int          |                                                                                                                                                                                          Load a 64-bit value |
| Store64       | !64        | ptr int                     | _none_       |                                                                                                                                                                                         Store a 64-bit value |
| Arg0PtrPush   | argv       | _none_                      | ptr          |                                                                                                                                                                         Push the pointer of the 0th argument |
|               |            |                             |              |                                                                                                                                                                                                   **Typing** |
| CastPtr       | cast(ptr)  | any                         | ptr          |                                                                                                                                                                        Cast the top value to a pointer (ptr) |
| CastInt       | cast(int)  | any                         | int          |                                                                                                                                                                        Cast the top value to a integer (int) |
| CastBool      | cast(bool) | any                         | bool         |                                                                                                                                                                       Cast the top value to a boolean (bool) |
| FakeDrop      | fake(drop) | any                         | _none_       |                                                                                Tells the Typechecker to perform a drop, even when nothing happened. **WARN: THIS WILL CAUSE TYPE UNSAFETY. NOT RECOMMENDED** |
| FakeInt       | fake(int)  | any                         | _none_       |  Tells the Typechecker to push a integer (int) on the stack. **Only** during typechecking, doesn't have an effect on the actual stack on execution. **WARN: THIS WILL CAUSE TYPE UNSAFETY. NOT RECOMMENDED** |
| FakePtr       | fake(ptr)  | any                         | _none_       |  Tells the Typechecker to push a pointer (ptr) on the stack. **Only** during typechecking, doesn't have an effect on the actual stack on execution. **WARN: THIS WILL CAUSE TYPE UNSAFETY. NOT RECOMMENDED** |
| FakeBool      | fake(bool) | any                         | _none_       | Tells the Typechecker to push a boolean (bool) on the stack. **Only** during typechecking, doesn't have an effect on the actual stack on execution. **WARN: THIS WILL CAUSE TYPE UNSAFETY. NOT RECOMMENDED** |
|               |            |                             |              |                                                                                                                                                                                       **Bitwise Operations** |
| ShiftLeft     | shl        | int int                     | int          |                                                                                                                                                                               Perform a left shift operation |
| ShiftRight    | shr        | int int                     | int          |                                                                                                                                                                              Perform a right shift operation |
| And           | and        | int int                     | int          |                                                                                                                                                                                               And 2 integers |
| Or            | or         | int int                     | int          |                                                                                                                                                                                                Or 2 integers |
| Xor           | xor        | int int                     | int          |                                                                                                                                                                                               Xor 2 integers |
| Not           | not        | int                         | int          |                                                                                                                                                                                   Perform a not on a integer |

# Builtin Structure

## Str

| Name    | Value |
| :------ | ----: |
| pointer |   ptr |
| length  |   int |

# Builtin Types

| Name | Length |
| :--- | -----: |
| ptr  |      1 |
| int  |      1 |
| bool |      1 |
| void |      0 |
| any  |      1 |

# Keyword Specifications

## Include

```rb
include "string-or-module"
include "string-or-module"c
```

Example:

```rb
include "std/io"
include "./fileparser"c
```

## If

stack pops: `bool`

code: Code

```rb
if <code> end
if <code> else <code> end
if <code> else <code> if* <code> else <code> end
```

Example:

```rb
include "std/io"

true if 1 print end
1
     dup 3 = if  drop "three" puts
else dup 2 = if* drop "two" puts
else dup 1 = if* drop "one" puts
else             drop "idk" puts
end

# lnot lol
false if false else true end
```

## While

stack pops: `int|bool`
stack pushes: `int|bool`

```rb
while <code> end
```

```rb
10
while
  dup print
  1 -
end
```

## Memory Creations

name: word
simplified-code: ConstMemoryCode

```rb
memory <name> <simplified-code> end
```

```rb
include "std/str"

memory NameAndVersionString sizeof(Str) 2 * end
```

## Constant Definition

name: word
simplified-code: ConstMemoryCode

```rb
const <name> <simplified-code> end
```

> **Offsetting**
>
> Constants support offsettings. This means, that when you specify "offset" or "reset" in the `<simplified-code>`, it will take the current offset and add the original value to it.
> This is useful for enums.

**Example**

```rb
const undefiedStdLib->version 1 end
```

**Offsetting Example**

```rb
const Keyword.If 1 offset end
const Keyword.IfStar 1 offset end
const Keyword.Else 1 offset end
const Keyword.Struct 1 offset end
const Keyword.End 1 offset end
const Keyword.While 1 offset end
const Keyword.Const 1 offset end
const Keyword.Memory 1 offset end
const Keyword.Include 1 offset end
const Keyword.Fn 1 offset end
const Keyword.In 1 offset end
const Keyword.Splitter 1 offset end
const Keyword.Do 1 offset end
const Keyword.Call 1 offset end
const Keyword.Sizeof 1 offset end
const Keyword.AddrOf 1 offset end
const Keyword.CallAlike 1 offset end
const Keyword.length 1 reset end
```

## Structs

name: Word
property-name: Word
property-type: Type|StructName

```rb
struct <name> <property-name> <property-type> end
```

> **Note**
>
> The constants that specify the size of the structs, each field and the offsets for each field will be defined.
>
> **Example**

```rb
struct dynamicArr size int first ptr last ptr end

# Defined Constants:
# sizeof(dynamicArr) => 3 (size of the whole struct)
# dynamicArr.size => 0 (offset to the 'size' field)
# sizeof(dynamicArr.size) => 1 (size of the 'size' field)
# dynamicArr.first => 1 (offset of the 'first' field)
# sizeof(dynamicArr.first) => 1 (size of the 'first' field)
# dynamicArr.last => 2 (offset to the 'last' field)
# sizeof(dynamicArr.last) => 1 (size of the 'last field')
```

**Example**

```rb
struct linkedListEntry<int> value int previous ptr next ptr end
```

## Function definitions

name: Word
intypes: Type|StructName
outtypes: Type|StructName
code: Code

```rb
fn <name> in <code> end
fn <name> <intypes> in <code> end
fn <name> <intypes> -- <outtypes> in <code> end
fn <name> <intypes> -- in <code> end
fn <name> -- <outtypes> in <code> end
```

### Inline

When adding a `inline`-keyword before the `function`-keyword, then the function will get inlined. That means instead of adding a call instruction, it will paste the function body to every usage of the function. Only recommended for small functions, such as puts or eputs.

**Example**

```rb
inline fn 1plus int -- int in 1 + end

fn main in 10 1plus print end
```

This will result in:

```rb
fn main in 10 1 + print end
```

## Return

Stack Requirements: &lt;function return-types>

```rb
return
```

**Example**

```rb
include "std/str"

fn toStr
  int
  --
  Str
in
       dup 0 = if  drop "Zero"    return
  else dup 1 = if* drop "One"     return
  else dup 2 = if* drop "One"     return
  else dup 3 = if* drop "One"     return
  else dup 4 = if* drop "One"     return
  else dup 5 = if* drop "One"     return
  else             drop "unknown" return
  end
end
```

## Assembly

Embed custom assembly

```rb
assembly "<assembly>" end
```

**Example**

```rb
# custom bitwise and implementation that's the same as the default one but more bloat cuz function
fn bitwiseAnd int int -- int in
  fake(drop) fake(drop)
  assembly
    "pop rax"
    "pop rbx"
    "and rbx, rax"
    "push rbx"
  end
  fake(int)
end
```

## Undef

Undefine macros (inline functions), functions, structs and constants. Note: this won't delete the identifier. Older usages won't get replaced.

identifier

```rb
undef <identifier>
```

**Example**

```rb
const a 10 end
undef a
const a 11 end

inline fn nums 101 end
undef nums
inline fn nums 110 111

fn main in
  a print # 1
  nums print print # 111 110
end
```

```rb
const a 10 end
const oldA a end
inline fn oldAMacro a end
fn oldAFunction a end
undef a

const a 11 end
const newA a end
inline fn newAMacro a end
fn newAFunction a end

fn main in
  oldA           print # 10
  oldAMacro      print # 10
  oldAFunction   print # 10
  newA           print # 11
  newAMacro      print # 11
  newAFunction   print # 11
end
```

## .log, .error, .warn

Preprocessor: Log a value to the console.

```rb
.log|.error|.warn <constant>|string|number|cstring
```

**Example**

```rb
.ifdef tmp_mem .error "tmp_mem is already defined :c" .end

memory tmp_mem 10 1024 * end # allocate 10kb
```

## .ifdef, .ifndef

Preprocessor: Checks if a memory, struct, function, macro (inline function) or constant is defined or not defined

code: Code

```rb
.isdef|.isndef <identifier> <code> .end
```

**Example**

```rb
.isdef __LNX__ .log "Using Linux" .end
```

## .is, .isn

Preprocessor: Checks if a identifier is a specific thing (or not)

type: macro, fn, struct, const, memory, intrinsic or keyword (multiple can be supplied, split using `|`)

```rb
.is|.isn <type> <identifier> <code> .end
```

**Example**

```rb
.is macro|fn puts .log "puts is runnable" .end
.isn macro|fn puts .log "puts is not runnable" .end
```

## .ifeq, .ifneq

Preprocessor: Compares 2 constants

```rb
.ifeq|.ifneq <constant1> <constant2> <code> .end
```

**Example**

```rb
.ifeq PLATFORM PLATFORM_TERM .info "Compiling for the terminal" .end
.ifneq PLATFORM PLATFORM_TERM .info "Compiling not for the terminal" .end
```

# .if, .ifn

Preprocessor: Checks if a constant is true/false (only for constants of type `bool`)

```rb
.if|.ifn <constant> <code> .end
```

**Example**

```rb
.if __DEV__ .error "Compilation in devmode is disallowed" .end
.ifn __DEV__ .info "Compilation outside devmode is allowed" .end
```

# .pragma

Mark the inclusion behavior of this file. Default: once

```rb
.pragma once|multiple
```

**Example**

/once.undefied

```rb
# This is the default behavior, this doesn't need to be specified
.pragma once

.log "once"
```

/multiple.undefied

```rb
.pragma multiple

.log "multiple"
```

/main.undefied

```rb
include "./once"
include "./once"
include "./once"
include "./multiple"
include "./multiple"
include "./multiple"
```

The output during compilation should look something like this:

```
Info: /once.undefied:4:1: once
Info: /multiple.undefied:3:1: multiple
Info: /multiple.undefied:3:1: multiple
Info: /multiple.undefied:3:1: multiple
[INFO] [CMD]: Running nasm -felf64 -o "/main.o" "/main.asm"
[INFO] [CMD]: Running ld -o "/main" "/main.o"
[INFO] [CMD]: Running "/main"
```

## .end

Ends a preprocessor block

## .param

Set a parameter for a block

Supported Blocks:

-   `assembly`
-   `fn`

```rb
.param <identifier>
```

**Example**

```rb
.param deprecated
fn deprecated in end

fn main -- int in
  .param __supports_linux__
  assembly "push 10" end fake(int) # Puts int 10 to exit with non-zero exitcode 10
end
```

**Available parameter**

| Name                               |                                                                                                                                                                                        Usage |
| :--------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| `deprecated`                       |                                                                                                                                                 Function Only: Mark a function as deprecated |
| `__supports_linux__`               |                                                                                                                                                          Mark a assembly as supporting Linux |
| `__supports_target_linux__`        |                                                                                                                                             Mark a assembly as supporting the target `linux` |
| `__supports_target_linux_macros__` |                                                                                                                                      Mark a assembly as supporting the target `linux-macros` |
| `__supports_windows__`             |                                                                                                                                                        Mark a assembly as supporting Windows |
| `__supports_macos__`               |                                                                                                                                                          Mark a assembly as supporting MacOS |
| `__typecheck_ignore__`             |                                                                                                                                                                 dont typecheck this function |
| `__provided_externally__`          |                                Mark a function as non-undefinable, and as that a foreign source provides it. This will expect the function name as a label in assembly, but wont compile it. |
| `__export__`                       |                                                                                                                               When the parser or vm supports exporting, export this function |
| `__function_exits__`               |                                                                                                        This function will never return. All `ret` statements will get replaced with a panic. |
| `__run_function__`                 | This will cause the function to run before main. It has to have an empty in and out. All `__run_function__` marked functions will be ran in an arbitrary sequence, before the main function. |
| `__nomain__`                       |                                                               Apply this to the main function. It will cause it to not run it and instead just exit. May be useful for webassembly-alike vms |
| `--- Proposed ---`                 |                                                                                                                                                                           `--- Proposed ---` |

# Code

```
<keyword-def>
<constant-name>
<memory-name>
<function-name>
<value-integer>
<value-string>
<value-cstring>
<value-charcode>
```

# ConstMemoryCode

```
<constant-name>
<value-integer>
+
*
-
/
%
cast(int)
cast(ptr)
cast(bool)
offset (const only)
reset (const only)
```

# Predefined Constants

UTC means UTC+0

A version looks like this: `major.minor.patchlevel`. For `1.2.5` that means that the major is 1, the minor 2 and the patchlevel 5.

| Name                        |                                                  Value |
| :-------------------------- | -----------------------------------------------------: |
| `__UNIXTIME__`              |                The time at compilation is milliseconds |
| `__DATE_UTC_DAY__`          |                             The UTC Day at compilation |
| `__DATE_UTC_WEEK_DAY__`     |                         The UTC Weekday at compilation |
| `__DATE_UTC_MONTH__`        |                           The UTC Month at compilation |
| `__DATE_UTC_YEAR__`         |                            The UTC Year at compilation |
| `__TIME_UTC_HOURS__`        |                 The UTC Hour at compilation (24 hours) |
| `__TIME_UTC_MINUTES__`      |                          The UTC Minute at compilation |
| `__TIME_UTC_SECONDS__`      |                          The UTC Second at compilation |
| `__TIME_UTC_MILLISECONDS__` |                    The UTC Milliseconds at compilation |
| `---`                       |                                                  `---` |
| `__DATE_DAY__`              |             The Day at compilation (timezone adjusted) |
| `__DATE_WEEK_DAY__`         |         The Weekday at compilation (timezone adjusted) |
| `__DATE_MONTH__`            |           The Month at compilation (timezone adjusted) |
| `__DATE_YEAR__`             |            The Year at compilation (timezone adjusted) |
| `__TIME_HOURS__`            | The Hour at compilation (timezone adjusted) (24 hours) |
| `__TIME_MINUTES__`          |          The Minute at compilation (timezone adjusted) |
| `__TIME_SECONDS__`          |          The Second at compilation (timezone adjusted) |
| `__TIME_MILLISECONDS__`     |    The Milliseconds at compilation (timezone adjusted) |
| `__UNDEFIED_MAJOR__`        |                             The Compiler Version major |
| `__UNDEFIED_MINOR__`        |                             The Compiler Version minor |
| `__UNDEFIED_PATCHLEVEL__`   |                       The Compiler Version patch level |
| `__OPTIMIZATIONS__`         |   The Optimization level it got compiled with (0 or 1) |
| `__DEV__`                   | If the devmode was enabled at compilation (type: bool) |

**Note**

You can add your own predefined constants at compile time by adding arguments that follow this standard:

`-D<constant-name>=<number-above-0>`
`--D<constant-name>=<number-above-0>`

The `D` can be lowercase

> **Usecases**
>
> When you are developing a multi-platform system, the code should know what platform you are on.
>
> You can use -DPLATFORM=0 to set the PLATFORM constant to zero, that could be for example your Linux version.

```rb
const PLATFORM_UNDEFINED 0 end
const PLATFORM_WINDOWS 1 end
const PLATFORM_LINUX 2 end
const PLATFORM_MACOS 3 end

.ifndef PLATFORM const PLATFORM PLATFORM_UNDEFINED end .end
.ifdef PLATFORM .isn const PLATFORM undef PLATFORM const PLATFORM PLATFORM_UNDEFINED end .end .end

.if PLATFORM PLATFORM_UNDEFINED .error "No platform specified" .end
.if PLATFORM PLATFORM_WINDOWS .log "Compiling for windows" .end
.if PLATFORM PLATFORM_LINUX .log "Compiling for Linux" .end
.if PLATFORM PLATFORM_MACOS .log "Compiling for MacOS" .end
```

> **Compilation outputs**

```
$ undefied com main.undefied
Error: main.ts:9:34: No platform specified

$ undefied com main.undefied -DPLATFORM=1
Info: main.ts:9:34: Compiling for Windows
[INFO] [CMD]: Running nasm felf64 -o "/main.o" "/main.asm"
[INFO] [CMD]: Running ld -o "/main" "/main.o"

$ undefied com main.undefied -DPLATFORM=2
Info: main.ts:9:34: Compiling for Linux
[INFO] [CMD]: Running nasm felf64 -o "/main.o" "/main.asm"
[INFO] [CMD]: Running ld -o "/main" "/main.o"

$ undefied com main.undefied -DPLATFORM=3
Info: main.ts:9:34: Compiling for MacOS
[INFO] [CMD]: Running nasm felf64 -o "/main.o" "/main.asm"
[INFO] [CMD]: Running ld -o "/main" "/main.o"

$ undefied com main.undefied -DPLATFORM=4
[INFO] [CMD]: Running nasm felf64 -o "/main.o" "/main.asm"
[INFO] [CMD]: Running ld -o "/main" "/main.o"
```

# Predefined macros

| Name                        |                                                         Value |
| :-------------------------- | ------------------------------------------------------------: |
| `__UNDEFIED_VERSION__`      |           The compiler version during compilation as a string |
| `__UNDEFIED_VERSION_CSTR__` |          The compiler version during compilation as a cstring |
| `__BASE_FILE__`             |  The file that the compilation command was run on as a string |
| `__BASE_FILE_CSTR__`        | The file that the compilation command was run on as a cstring |
