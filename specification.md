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
assembly "<assembly>"
```

**Example**
```rb
# custom bitwise and implementation that's the same as the default one but more bloat cuz function
fn bitwiseAnd int int -- int in
  fake(drop) fake(drop)
  assembly "    pop rax\n    pop rbx\n    and rbx, rax\n    push rbx\n"
  fake(int)
end
```

# Code
```html
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

```html
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