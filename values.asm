%macro sizeof(u8)
    pushint 1
%endmacro
%macro sizeof(u16)
    pushint 2
%endmacro
%macro sizeof(u32)
    pushint 4
%endmacro
%macro sizeof(u64)
    pushint 8
%endmacro
%macro true
    pushint 1
%endmacro
%macro false
    pushint 0
%endmacro
%macro null
    pushint 0
%endmacro
%macro nullptr
    pushint 0
%endmacro
%macro sizeof(bool)
    pushint 8
%endmacro
%macro sizeof(ptr)
    pushint 8
%endmacro
%macro sizeof(int)
    pushint 8
%endmacro
%macro sizeof(any)
    pushint 8
%endmacro
%macro sizeof(void)
    pushint 0
%endmacro

%macro inc64 0
    dup
    load64
    pushint 1
    plus
    swap
    store64
%endmacro
%macro dec64 0
    dup
    load64
    pushint 1
    minus
    swap
    store64
%endmacro
%macro inc32 0
    dup
    load32
    pushint 1
    plus
    swap
    store32
%endmacro
%macro dec32 0
    dup
    load32
    pushint 1
    minus
    swap
    store32
%endmacro
%macro inc16 0
    dup
    load16
    pushint 1
    plus
    swap
    store16
%endmacro
%macro dec16 0
    dup
    load16
    pushint 1
    minus
    swap
    store16
%endmacro
%macro inc8 0
    dup
    load8
    pushint 1
    plus
    swap
    store8
%endmacro
%macro dec8 0
    dup
    load8
    pushint 1
    minus
    swap
    store8
%endmacro