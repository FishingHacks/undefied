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
    jmp addr_26
addr_1:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    ;; push int
    mov rax, 1
    push rax
addr_4:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_23
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
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
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
    je addr_20
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
    jmp addr_21
addr_20:
    ;; push int
    mov rax, 0
    push rax
addr_21:
    ;; end
    ;; end
    jmp addr_4
addr_23:
    ;; drop
    pop rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_26:
    ;; skip fn
    jmp addr_32
addr_27:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
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
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_32:
    ;; skip fn
    jmp addr_37
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; /%
    xor rdx, rdx
    pop rbx
    pop rax
    div rbx
    push rax
    push rdx
    ;; drop
    pop rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_37:
    ;; skip fn
    jmp addr_43
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; /%
    xor rdx, rdx
    pop rbx
    pop rax
    div rbx
    push rax
    push rdx
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; drop
    pop rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_43:
    ;; skip fn
    jmp addr_49
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 2
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
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_49:
    ;; skip fn
    jmp addr_53
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_53:
    ;; skip fn
    jmp addr_58
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 1
    push rax
    ;; syscall3
    pop rax
    pop rdi
    pop rsi
    pop rdx
    syscall
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_58:
    ;; skip fn
    jmp addr_63
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 3
    push rax
    ;; syscall1
    pop rax
    pop rdi
    syscall
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_63:
    ;; skip fn
    jmp addr_68
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; /%
    xor rdx, rdx
    pop rbx
    pop rax
    div rbx
    push rax
    push rdx
    ;; drop
    pop rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_68:
    ;; skip fn
    jmp addr_74
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; /%
    xor rdx, rdx
    pop rbx
    pop rax
    div rbx
    push rax
    push rdx
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; drop
    pop rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_74:
    ;; skip fn
    jmp addr_85
addr_75:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 8
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; -- argv --
    mov rax, [args_ptr]
    add rax, 8
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_85:
    ;; skip fn
    jmp addr_90
addr_86:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 1
    push rax
    ;; cast(bool)
    pop rax
    cmp rax, 0
    setne al
    movzx rax, al
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_90:
    ;; skip fn
    jmp addr_95
addr_91:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    ;; cast(bool)
    pop rax
    cmp rax, 0
    setne al
    movzx rax, al
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_95:
    ;; skip fn
    jmp addr_100
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_100:
    ;; skip fn
    jmp addr_108
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_105
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_91
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; else
    jmp addr_106
addr_105:
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_86
    mov [ret_stack_rsp], rsp
    mov rsp, rax
addr_106:
    ;; end
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_108:
    ;; skip fn
    jmp addr_118
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; here
    mov rax, 45
    push rax
    push str_0
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_27
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push str
    mov rax, 24
    push rax
    push str_1
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_27
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; drop
    pop rax
    ;; drop
    pop rax
    ;; push int
    mov rax, 0
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_118:
    ;; skip fn
    jmp addr_125
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
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
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_125:
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
    push str_3
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_27
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 2
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_75
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_27
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push str
    mov rax, 1
    push rax
    push str_4
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_27
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 1
    push rax
    ;; push int
    mov rax, 2
    push rax
    ;; print
    pop rdi
    call print
    ;; print
    pop rdi
    call print
    ;; -- exit program --
    mov rax, 60
    mov rdi, 0
    syscall
segment .data
str_0: db 0x2f,0x68,0x6f,0x6d,0x65,0x2f,0x66,0x69,0x73,0x68,0x69,0x2f,0x6a,0x73,0x2f,0x75,0x6e,0x64,0x65,0x66,0x69,0x65,0x64,0x2f,0x73,0x74,0x64,0x2f,0x73,0x74,0x64,0x2e,0x75,0x6e,0x64,0x65,0x66,0x69,0x65,0x64,0x3a,0x32,0x35,0x3a,0x31
str_1: db 0x3a,0x20,0x54,0x4f,0x44,0x4f,0x3a,0x20,0x49,0x6d,0x70,0x6c,0x65,0x6d,0x65,0x6e,0x74,0x20,0x63,0x73,0x74,0x72,0x65,0x71
str_2: db 0xa
str_3: db 0x45,0x78,0x69,0x74,0xa
str_4: db 0xa
segment .bss
    ret_stack_rsp: resq 1
    ret_stack: resb 4096
    ret_stack_end:
    args_ptr: resq 1
    mem: resb 0
