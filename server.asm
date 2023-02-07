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
    jmp addr_9
addr_1:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    ;; push int
    mov rax, 1
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], rbx
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_9:
    ;; skip fn
    jmp addr_60
addr_55:
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
    push rax
    ;; drop
    pop rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_60:
    ;; skip fn
    jmp addr_106
addr_92:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 10
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_100
    ;; push int
    mov rax, 48
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; else
    jmp addr_104
addr_100:
    ;; push int
    mov rax, 97
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; push int
    mov rax, 10
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
addr_104:
    ;; end
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_106:
    ;; skip fn
    jmp addr_156
addr_107:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_115
    ;; drop
    pop rax
    ;; push str
    mov rax, 1
    push rax
    push str_0
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_115:
    ;; end
    ;; push int
    mov rax, 31
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
addr_118:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_144
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 15
    push rax
    ;; -- and --
    pop rax
    pop rbx
    and rbx, rax
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_92
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; over
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
    push mem
    pop rax
    add rax, 0
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; -- ! --
    pop rax
    pop rbx
    mov [rax], bl
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
    ;; push int
    mov rax, 4
    push rax
    ;; -- shr --
    pop rcx
    pop rbx
    shr rbx, cl
    push rbx
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_142
    ;; drop
    pop rax
    ;; push int
    mov rax, 0
    push rax
addr_142:
    ;; end
    ;; end
    jmp addr_118
addr_144:
    ;; drop
    pop rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 32
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    push mem
    pop rax
    add rax, 0
    push rax
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_156:
    ;; skip fn
    jmp addr_206
addr_157:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_165
    ;; drop
    pop rax
    ;; push str
    mov rax, 1
    push rax
    push str_1
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_165:
    ;; end
    ;; push int
    mov rax, 31
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
addr_168:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_194
    ;; push int
    mov rax, 10
    push rax
    ;; /%
    xor rdx, rdx
    pop rbx
    pop rax
    div rbx
    push rax
    push rdx
    ;; push int
    mov rax, 48
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; dup
    pop rax
    push rax
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    push mem
    pop rax
    add rax, 32
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; -- ! --
    pop rax
    pop rbx
    mov [rax], bl
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
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_192
    ;; drop
    pop rax
    ;; push int
    mov rax, 0
    push rax
addr_192:
    ;; end
    ;; end
    jmp addr_168
addr_194:
    ;; drop
    pop rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 32
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    push mem
    pop rax
    add rax, 32
    push rax
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_206:
    ;; skip fn
    jmp addr_257
addr_207:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_215
    ;; drop
    pop rax
    ;; push str
    mov rax, 1
    push rax
    push str_2
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_215:
    ;; end
    ;; push int
    mov rax, 31
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
addr_218:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_245
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; -- and --
    pop rax
    pop rbx
    and rbx, rax
    push rbx
    ;; push int
    mov rax, 48
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; over
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
    push mem
    pop rax
    add rax, 64
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; -- ! --
    pop rax
    pop rbx
    mov [rax], bl
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
    ;; push int
    mov rax, 1
    push rax
    ;; -- shr --
    pop rcx
    pop rbx
    shr rbx, cl
    push rbx
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_243
    ;; drop
    pop rax
    ;; push int
    mov rax, 0
    push rax
addr_243:
    ;; end
    ;; end
    jmp addr_218
addr_245:
    ;; drop
    pop rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 32
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    push mem
    pop rax
    add rax, 64
    push rax
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_257:
    ;; skip fn
    jmp addr_262
addr_258:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 1
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_55
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_262:
    ;; skip fn
    jmp addr_267
addr_263:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 1
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_55
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_267:
    ;; skip fn
    jmp addr_283
addr_276:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_157
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_55
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_283:
    ;; skip fn
    jmp addr_288
addr_284:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 1
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_276
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_288:
    ;; skip fn
    jmp addr_301
addr_294:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_107
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_55
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_301:
    ;; skip fn
    jmp addr_306
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 1
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_294
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_306:
    ;; skip fn
    jmp addr_319
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_207
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; -- rot --
    pop rax
    pop rbx
    pop rcx
    push rax
    push rcx
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_55
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_319:
    ;; skip fn
    jmp addr_345
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_343
    ;; drop
    pop rax
    ;; push const
    mov rax, 1
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_343:
    ;; end
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_345:
    ;; skip fn
    jmp addr_353
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_349
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_349:
    ;; end
    ;; drop
    pop rax
    ;; push const
    mov rax, 0
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_353:
    ;; skip fn
    jmp addr_401
addr_395:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
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
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_401:
    ;; skip fn
    jmp addr_430
addr_426:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_430:
    ;; skip fn
    jmp addr_467
addr_442:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    ;; push int
    mov rax, 1
    push rax
addr_445:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_464
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
    ;; =
    pop rax
    pop rbx
    cmp rax, rbx
    setne al
    movzx rax, al
    push rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_461
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
    jmp addr_462
addr_461:
    ;; push int
    mov rax, 0
    push rax
addr_462:
    ;; end
    ;; end
    jmp addr_445
addr_464:
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
addr_467:
    ;; skip fn
    jmp addr_472
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_442
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; drop
    pop rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_472:
    ;; skip fn
    jmp addr_611
addr_608:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    pop rbx
    movzx eax, bx
    rol ax, 8
    push rax
        ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_611:
    ;; skip fn
    jmp addr_624
addr_620:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 41
    push rax
    ;; syscall3
    pop rax
    pop rdi
    pop rsi
    pop rdx
    syscall
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_624:
    ;; skip fn
    jmp addr_629
addr_625:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 50
    push rax
    ;; syscall2
    pop rax
    pop rdi
    pop rsi
    syscall
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_629:
    ;; skip fn
    jmp addr_634
addr_630:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 49
    push rax
    ;; syscall3
    pop rax
    pop rdi
    pop rsi
    pop rdx
    syscall
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_634:
    ;; skip fn
    jmp addr_639
addr_635:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 43
    push rax
    ;; syscall3
    pop rax
    pop rdi
    pop rsi
    pop rdx
    syscall
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_639:
    ;; skip fn
    jmp addr_644
addr_640:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 0
    push rax
    ;; syscall3
    pop rax
    pop rdi
    pop rsi
    pop rdx
    syscall
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_644:
    ;; skip fn
    jmp addr_649
addr_645:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 3
    push rax
    ;; syscall1
    pop rax
    pop rdi
    syscall
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_649:
    ;; skip fn
    jmp addr_654
addr_650:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 44
    push rax
    ;; syscall6
    pop rax
    pop rdi
    pop rsi
    pop rdx
    pop r10
    pop r8
    pop r9
    syscall
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_654:
    ;; skip fn
    jmp addr_744
addr_655:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 3
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], rbx
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], rbx
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 2
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], rbx
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 0
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], rbx
    ;; push str
    mov rax, 14
    push rax
    push str_3
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 0
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_284
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push str
    mov rax, 6
    push rax
    push str_4
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 2
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push str
    mov rax, 6
    push rax
    push str_5
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    ;; push const
    mov rax, 0
    push rax
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 3
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 2
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    push mem
    pop rax
    add rax, 137
    push rax
    ;; push const
    mov rax, 8
    push rax
    ;; push int
    mov rax, 0
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_650
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_744:
    ;; skip fn
    jmp addr_748
addr_745:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_608
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_748:
    ;; skip fn
    jmp addr_778
addr_749:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    push mem
    pop rax
    add rax, 169
    push rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], rbx
    push mem
    pop rax
    add rax, 177
    push rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], rbx
    push mem
    pop rax
    add rax, 169
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_426
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
addr_758:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_776
    push mem
    pop rax
    add rax, 177
    push rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
    push mem
    pop rax
    add rax, 169
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_426
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- ! --
    pop rax
    pop rbx
    mov [rax], bl
    push mem
    pop rax
    add rax, 169
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 1
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 1
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_774
    ;; drop
    pop rax
    ;; push int
    mov rax, 0
    push rax
addr_774:
    ;; end
    ;; end
    jmp addr_758
addr_776:
    ;; drop
    pop rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_778:
    ;; skip fn
    jmp addr_793
addr_785:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push str
    mov rax, 112
    push rax
    push str_6
    ;; push int
    mov rax, 0
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_655
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; drop
    pop rax
    ;; push const
    mov rax, 1
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_793:
    ;; skip fn
    jmp addr_909
addr_794:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    ;; push const
    mov rax, 1
    push rax
    ;; push const
    mov rax, 2
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_620
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 0
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_807
    ;; drop
    pop rax
    ;; push str
    mov rax, 35
    push rax
    push str_7
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_263
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_807:
    ;; end
    ;; push str
    mov rax, 29
    push rax
    push str_8
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_284
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push str
    mov rax, 1
    push rax
    push str_9
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 16
    push rax
    ;; push int
    mov rax, 0
    push rax
    push mem
    pop rax
    add rax, 185
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_749
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; drop
    pop rax
    ;; push const
    mov rax, 2
    push rax
    push mem
    pop rax
    add rax, 185
    push rax
    ;; push const
    mov rax, 0
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], bx
    ;; push const
    mov rax, 16777343
    push rax
    push mem
    pop rax
    add rax, 185
    push rax
    ;; push const
    mov rax, 4
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], ebx
    ;; push const
    mov rax, 6969
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_745
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    push mem
    pop rax
    add rax, 185
    push rax
    ;; push const
    mov rax, 2
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_395
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], bx
    ;; dup
    pop rax
    push rax
    push rax
    ;; push const
    mov rax, 16
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    push mem
    pop rax
    add rax, 185
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_630
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_848
    ;; drop
    pop rax
    ;; push str
    mov rax, 33
    push rax
    push str_10
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_263
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_848:
    ;; end
    ;; push str
    mov rax, 38
    push rax
    push str_11
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push const
    mov rax, 6969
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_284
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push str
    mov rax, 1
    push rax
    push str_12
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 1
    push rax
    ;; over
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_625
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_865
    ;; drop
    pop rax
    ;; push str
    mov rax, 33
    push rax
    push str_13
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_263
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_865:
    ;; end
    ;; push str
    mov rax, 31
    push rax
    push str_14
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 1
    push rax
addr_869:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_905
    ;; drop
    pop rax
    push mem
    pop rax
    add rax, 217
    push rax
    ;; over
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
    push mem
    pop rax
    add rax, 201
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_635
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 0
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; if
    pop rax
    cmp rax, 0
    je addr_885
    ;; drop
    pop rax
    ;; drop
    pop rax
    ;; push str
    mov rax, 28
    push rax
    push str_15
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_263
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_885:
    ;; end
    ;; push str
    mov rax, 36
    push rax
    push str_16
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; print
    pop rdi
    call print
    ;; dup
    pop rax
    push rax
    push rax
    ;; push const
    mov rax, 1024
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    push mem
    pop rax
    add rax, 221
    push rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_640
    mov [ret_stack_rsp], rsp
    mov rsp, rax
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
    push mem
    pop rax
    add rax, 221
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_785
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_645
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; drop
    pop rax
    ;; end
    jmp addr_869
addr_905:
    ;; drop
    pop rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_645
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; drop
    pop rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_909:
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_794
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- exit program --
    mov rax, 60
    mov rdi, 0
    syscall
segment .data
str_0: db 0x30
str_1: db 0x30
str_2: db 0x30
str_3: db 0x53,0x65,0x6e,0x64,0x69,0x6e,0x67,0x20,0x74,0x6f,0x20,0x66,0x64,0x20
str_4: db 0xa,0x2d,0x2d,0x2d,0xa,0xa
str_5: db 0xa,0x2d,0x2d,0x2d,0xa,0xa
str_6: db 0x48,0x54,0x54,0x50,0x2f,0x31,0x2e,0x31,0x20,0x32,0x30,0x30,0x20,0x4f,0x4b,0xd,0xa,0x53,0x65,0x72,0x76,0x65,0x72,0x3a,0x20,0x48,0x54,0x54,0x50,0x6f,0x72,0x74,0x68,0xd,0xa,0x43,0x6f,0x6e,0x74,0x65,0x6e,0x74,0x2d,0x54,0x79,0x70,0x65,0x3a,0x20,0x74,0x65,0x78,0x74,0x2f,0x68,0x74,0x6d,0x6c,0xd,0xa,0x43,0x6f,0x6e,0x6e,0x65,0x63,0x74,0x69,0x6f,0x6e,0x3a,0x20,0x43,0x6c,0x6f,0x73,0x65,0x64,0xd,0xa,0xd,0xa,0x3c,0x68,0x31,0x3e,0x48,0x65,0x6c,0x6c,0x6f,0x20,0x66,0x72,0x6f,0x6d,0x20,0x48,0x54,0x54,0x50,0x6f,0x72,0x74,0x68,0x21,0x3c,0x2f,0x68,0x31,0x3e,0xa
str_7: db 0x45,0x52,0x52,0x4f,0x52,0x3a,0x20,0x43,0x6f,0x75,0x6c,0x64,0x20,0x6e,0x6f,0x74,0x20,0x63,0x72,0x65,0x61,0x74,0x65,0x20,0x54,0x43,0x50,0x20,0x73,0x6f,0x63,0x6b,0x65,0x74,0xa
str_8: db 0x53,0x75,0x63,0x63,0x65,0x73,0x73,0x66,0x75,0x6c,0x6c,0x79,0x20,0x63,0x72,0x65,0x61,0x74,0x65,0x64,0x20,0x73,0x6f,0x63,0x6b,0x65,0x74,0x3a,0x20
str_9: db 0xa
str_10: db 0x45,0x52,0x52,0x4f,0x52,0x3a,0x20,0x63,0x6f,0x75,0x6c,0x64,0x20,0x6e,0x6f,0x74,0x20,0x62,0x69,0x6e,0x64,0x20,0x74,0x68,0x65,0x20,0x73,0x6f,0x63,0x6b,0x65,0x74,0xa
str_11: db 0x53,0x75,0x63,0x63,0x65,0x73,0x73,0x66,0x75,0x6c,0x6c,0x79,0x20,0x62,0x6f,0x75,0x6e,0x64,0x20,0x74,0x68,0x65,0x20,0x73,0x6f,0x63,0x6b,0x65,0x74,0x20,0x74,0x6f,0x20,0x70,0x6f,0x72,0x74,0x20
str_12: db 0xa
str_13: db 0x45,0x52,0x52,0x4f,0x52,0x3a,0x20,0x43,0x6f,0x75,0x6c,0x64,0x20,0x6e,0x6f,0x74,0x20,0x73,0x74,0x61,0x72,0x74,0x20,0x6c,0x69,0x73,0x74,0x65,0x6e,0x69,0x6e,0x67,0xa
str_14: db 0x53,0x75,0x63,0x63,0x65,0x73,0x73,0x66,0x75,0x6c,0x6c,0x79,0x20,0x73,0x74,0x61,0x72,0x74,0x65,0x64,0x20,0x6c,0x69,0x73,0x74,0x65,0x6e,0x69,0x6e,0x67,0xa
str_15: db 0x45,0x52,0x52,0x4f,0x52,0x3a,0x20,0x53,0x65,0x72,0x76,0x65,0x72,0x20,0x61,0x63,0x63,0x65,0x70,0x74,0x20,0x66,0x61,0x69,0x6c,0x65,0x64,0xa
str_16: db 0x43,0x6c,0x69,0x65,0x6e,0x74,0x20,0x61,0x63,0x63,0x65,0x70,0x74,0x65,0x64,0x20,0x74,0x68,0x65,0x20,0x72,0x65,0x71,0x75,0x65,0x73,0x74,0x20,0x77,0x69,0x74,0x68,0x20,0x66,0x64,0x20
segment .bss
    ret_stack_rsp: resq 1
    ret_stack: resb 4096
    ret_stack_end:
    args_ptr: resq 1
    mem: resb 1253
