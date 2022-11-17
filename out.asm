BITS 64
segment .text
print:
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
    ;; skip fn
    jmp addr_5
addr_1:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push cstr
    push str_0
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_5:
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; print
    pop rdi
    call print
    ;; push int
    mov rax, 11
    push rax
    ;; push int
    mov rax, 10
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; print
    pop rdi
    call print
    ;; push str
    mov rax, 5
    push rax
    push str_1
    ;; push int
    mov rax, 1
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; syscall3
    pop rax
    pop rdi
    pop rsi
    pop rdx
    syscall
    ;; -- argv --
    mov rax, [args_ptr]
    add rax, 8
    push rax
    ;; print
    pop rdi
    call print
    ;; -- exit program --
    mov rax, 60
    mov rdi, 0
    syscall
segment .data
str_0: db 0x61,0x0
str_1: db 0x45,0x78,0x69,0x74,0xa
segment .bss
    ret_stack_rsp: resq 1
    ret_stack: resb 4096
    ret_stack_end:
    args_ptr: resq 1
    mem: resb 0
