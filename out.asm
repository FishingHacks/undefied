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
    ;; dup
    pop rax
    push rax
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; drop
    pop rax
    ;; push int
    mov rax, 1
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; drop
    pop rax
    ;; push str
    mov rax, 40
    push rax
    push str_0
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
addr_11:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_47
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; push str
    mov rax, 10
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
    ;; push int
    mov rax, 0
    push rax
    ;; push int
    mov rax, 1
    push rax
addr_19:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_35
    ;; drop
    pop rax
    ;; over
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
    ;; over
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    ;; push int
    mov rax, 0
    push rax
    ;; !=
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovne rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_32
    ;; push int
    mov rax, 1
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; else
    jmp addr_33
addr_32:
    ;; push int
    mov rax, 0
    push rax
addr_33:
    ;; end
    ;; end
    jmp addr_19
addr_35:
    ;; drop
    pop rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
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
    ;; push str
    mov rax, 1
    push rax
    push str_2
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
    ;; push int
    mov rax, 1
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    ;; end
    jmp addr_11
addr_47:
    ;; -- exit program --
    mov rax, 60
    mov rdi, 0
    syscall
segment .data
str_0: db 0x41,0x72,0x67,0x75,0x6d,0x65,0x6e,0x74,0x20,0x50,0x72,0x69,0x6e,0x74,0x65,0x72,0x20,0x76,0x31,0x2e,0x30,0x2e,0x30,0x20,0x62,0x79,0x20,0x46,0x69,0x73,0x68,0x69,0x6e,0x67,0x48,0x61,0x63,0x6b,0x73,0xa
str_1: db 0x41,0x72,0x67,0x75,0x6d,0x65,0x6e,0x74,0x3a,0x20
str_2: db 0xa
segment .bss
    args_ptr: resq 1
    mem: resb 0
