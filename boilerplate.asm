;; Idk why, but when you want to use undefied intrinsics and keywords in assembly...

;; -----------------------
;; MACROS START
;; -----------------------

%macro rot 0
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
%endmacro

%macro swap 0
    pop rax
    pop rbx
    push rax
    push rbx
%endmacro

%macro dup 0
    pop rax
    push rax
    push rax
%endmacro

%macro plus 0
    pop rax
    pop rbx
    add rax, rbx
    push rax
%endmacro

%macro minus 0
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
%endmacro

%macro multiply 0
    pop rax
    pop rbx
    mul rbx
    push rax
%endmacro

%macro divmod 0
    xor rdx, rdx
    pop rbx
    pop rax
    div rbx
    push rax
    push rdx
%endmacro

%macro print 0
    pop rdi
    call _print
%endmacro

%macro syscall1 0
    pop rax
    pop rdi
    syscall
    push rax
%endmacro

%macro syscall2 0
    pop rax
    pop rdi
    pop rsi
    syscall
    push rax
%endmacro

%macro syscall3 0
    pop rax
    pop rdi
    pop rsi
    pop rdx
    syscall
    push rax
%endmacro

%macro syscall4 0
    pop rax
    pop rdi
    pop rsi
    pop rdx
    pop r10
    syscall
    push rax
%endmacro

%macro syscall5 0
    pop rax
    pop rdi
    pop rsi
    pop rdx
    pop r10
    pop r8
    syscall
    push rax
%endmacro

%macro syscall6 0
    pop rax
    pop rdi
    pop rsi
    pop rdx
    pop r10
    pop r8
    pop r9
    syscall
    push rax
%endmacro

%macro drop 0
    pop rax
%endmacro

%macro over 0
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
%endmacro

%macro equal 0
    pop rax
    pop rbx
    cmp rax, rbx
    sete al
    movzx rax, al
    push rax
%endmacro

%macro notequal 0
    pop rax
    pop rbx
    cmp rax, rbx
    setne al
    movzx rax, al
    push rax
%endmacro

%macro load8 0
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
%endmacro

%macro store8 0
    pop rax
    pop rbx
    mov [rax], bl
%endmacro

%macro load16 0
    pop rax
    xor rbx, rbx
    mov bx, [rax]
    push rbx
%endmacro

%macro store16 0
    pop rax
    pop rbx
    mov [rax], bx
%endmacro

%macro load32 0
    pop rax
    xor rbx, rbx
    mov ebx, [rax]
    push rbx
%endmacro

%macro store32 0
    pop rax
    pop rbx
    mov [rax], ebx
%endmacro

%macro load64 0
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
%endmacro

%macro store64 0
    pop rax
    pop rbx
    mov [rax], rbx
%endmacro

%macro argv 0
    mov rax, [args_ptr]
    add rax, 8
    push rax
%endmacro

%macro cast_int 0
%endmacro

%macro cast_ptr 0
%endmacro

%macro cast_bool 0
    pop rax
    cmp rax, 0
    setne al
    movzx rax, al
    push rax
%endmacro

%macro fake_int 0
%endmacro

%macro fake_ptr 0
%endmacro

%macro fake_bool 0
%endmacro

%macro fake_any 0
%endmacro

%macro fake_drop 0
%endmacro

%macro lessthan 0
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
%endmacro

%macro lessthanequal 0
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovle rcx, rdx
    push rcx
%endmacro

%macro greaterthan 0
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovg rcx, rdx
    push rcx
%endmacro

%macro greaterthanequal 0
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovge rcx, rdx
    push rcx
%endmacro

%macro shr 0
    pop rcx
    pop rbx
    shr rbx, cl
    push rbx
%endmacro

%macro shl 0
    pop rcx
    pop rbx
    shl rbx, cl
    push rbx
%endmacro

%macro or 0
    pop rax
    pop rbx
    or rbx, rax
    push rbx
%endmacro

%macro and 0
    pop rax
    pop rbx
    and rbx, rax
    push rax
%endmacro

%macro xor 0
    pop rax
    pop rbx
    xor rbx, rax
    push rax
%endmacro

%macro not 0
    pop rax
    not rax
    push rax
%endmacro

%macro exec_main_int 0
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call main_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    mov rax, 60
    pop rdi
    syscall
%endmacro

%macro exec_main_void 0
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call main_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    mov rax, 60
    mov rdi, 0
    syscall
%endmacro

%macro pushint 1
    mov rax, %1
    push rax
%endmacro

%macro pushstr 2
    mov rax, %1
    push rax
    push str_%2
%endmacro

%macro pushcstr 2
    push str_%1
%endmacro

%macro pushemptystr 0
    push 0
    push 0
%endmacro

%macro pushemptycstr 0
    push 0
%endmacro

%macro pushmem 1
    push mem_%1
%endmacro

%macro pushconst 1
    mov rax, %1
    push rax
%endmacro

%macro calladdr 1
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_%1
    mov [ret_stack_rsp], rsp, 
    mov rsp, rax
%endmacro

%macro callFn 1
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call %1
    mov [ret_stack_rsp], rsp, 
    mov rsp, rax
%endmacro

%macro skipfn 2
    jmp addr_%1
%endmacro

%macro prepfn 1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
%endmacro

%macro retj 0
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
%endmacro

%macro end 0
%endmacro

%macro endj 1
    jmp addr_%1
%endmacro

%macro eelse 1
    jmp addr_%1
%endmacro

%macro iff 1
    pop rax
    cmp rax, 0
    je addr_%1
%endmacro

%macro ifstar 1
    pop rax
    cmp rax, 0
    je addr_%1
%endmacro

%macro whilee 1
    pop rax
    push rax
    cmp rax, 0
    je addr_%1
%endmacro

;; -----------------------
;; MACROS END
;; -----------------------

BITS 64
segment .text
_print:
    mov     r9, -3689348814741910323
    sub     rsp, 40
    mov     BYTE [rsp+31], 10
    lea     rcx, [rsp+30]
.L2:
    mov     rax, rdi
    lea     r8, [rsp+32]
    mul     r9
    mov     rax, rdi
    sub     r8, rcx
    shr     rdx, 3
    lea     rsi, [rdx+rdx*4]
    add     rsi, rsi
    sub     rax, rsi
    add     eax, 48
    mov     BYTE [rcx], al
    mov     rax, rdi
    mov     rdi, rdx
    mov     rdx, rcx
    sub     rcx, 1
    cmp     rax, 9
    ja      .L2
    lea     rax, [rsp+32]
    mov     edi, 1
    sub     rdx, rax
    xor     eax, eax
    lea     rsi, [rsp+32+rdx]
    mov     rdx, r8
    mov     rax, 1
    syscall
    add     rsp, 40
    ret
global _start
_start:
    mov [args_ptr], rsp
    mov rax, ret_stack_end
    mov [ret_stack_rsp], rax
    skipfn 10000000, main 
main_1:
    prepfn main_1
    retj
addr_10000000:
    ;; run this if the stack is empty after the main_1 fn call
    exec_main_void
    ;; run this if the stack has the exit code after the main_1 fn call
    ;; exec_main_int
segment .data
segment .bss
    ret_stack_rsp: resq 1
    ret_stack: resb 4096
    ret_stack_end:
    args_ptr: resq 1