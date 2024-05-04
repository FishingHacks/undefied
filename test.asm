;; Included Functions:
;; Function main Address: 1
;;   -> Ins: none
;;   -> Outs: none

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
    ;; skip fn main
    jmp addr_15
addr_1:
main_1:
    ;; prep fn main
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int 0
    mov rax, 0
    push rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int 3
    mov rax, 3
    push rax
    ;; =
    pop rax
    pop rbx
    cmp rax, rbx
    sete al
    movzx rax, al
    push rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_10
    ;; push int 3
    mov rax, 3
    push rax
    ;; print
    pop rdi
    call print
    ;; else
    jmp addr_12
addr_10:
    ;; push int 0
    mov rax, 0
    push rax
    ;; print
    pop rdi
    call print
addr_12:
    ;; end
    ;; drop
    pop rax
    ;; end/ret
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_15:
    ;; call all ___run_function__ functions
    ;; call (main)
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; exit program
    mov rax, 60
    mov rdi, 0
    syscall
segment .data
segment .bss
    ret_stack_rsp: resq 1
    ret_stack: resb 4096
    ret_stack_end:
    args_ptr: resq 1
