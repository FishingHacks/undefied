;; NASM MACROS

;; GENERAL START
%macro ptr+ 0
    pop rax
    pop rbx
    add rax, rbx
    push rax
%endmacro

%macro +ptr 0
    pop rax
    pop rbx
    add rax, rbx
    push rax
%endmacro

%macro ptr- 0
    pop rax
    pop rbx
    sub rax, rbx
    push rax
%endmacro

%macro -ptr 0
    pop rax
    pop rbx
    sub rax, rbx
    push rax
%endmacro

%macro @ptr 0
    load64
%endmacro

%macro @@ptr 0
    load64
    load64
%endmacro

%macro !ptr 0
    store64
%endmacro

%macro puts 0
    pushint 1
    fputs
%endmacro

%macro eputs 0
    pushint 2
    fputs
%endmacro

%macro div 0
    divmod
    drop
%endmacro

%macro mod 0
    divmod
    swap
    drop
%endmacro

%macro @int 0
    load64
%endmacro

%macro !int 0
    store64
%endmacro

%macro land 0
    cast(bool)
    pop rax
    pop rbx
    and rbx, rax
    push rax
%endmacro land

%macro lor 0
    cast(bool)
    pop rax
    pop rbx
    or rbx, rax
    push rax
%endmacro

%macro lxor 0
    cast(bool)
    pop rax
    pop rbx
    xor rbx, rax
    push rax
%endmacro

%macro lnot 0
    cast(bool)
    pop rax
    xor rax, 1
    push rax
%endmacro

%macro @bool 0
    load64
    cast(bool)
%endmacro

%macro !bool 0
    store64
%endmacro

%macro bswap16 0
    pop rbx
    movzx eax, bx
    rol ax, 8
    push rax
%endmacro

%macro bswap32 0
    pop rbx
    movzx eax, bx
    bswap eax
    push rax
%endmacro

%macro bswap64 0
    pop rbx
    movzx eax, bx
    bswap eax
    push rax
%endmacro

%macro 2drop 0
    drop
    drop
%endmacro

%macro 2dup 0
    over
    over
%endmacro
;; GENERAL END

;; LINUX START
%macro fputs 0
    pushint 1
    syscall3
    drop
%endmacro

%macro nthArg
    pushint 8
    multiply
    argv
    plus
    load64
%endmacro

%macro argc 0
    argv
    pushint 0
    pushint 8
    minus
    ptr+
    @int
%endmacro
;; LINUX END