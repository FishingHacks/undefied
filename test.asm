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
    jmp addr_6
addr_1:
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
addr_6:
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
    push str_ce48e859a7e64ca69df2fb71cd2cee45
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
    push str_ce48e859a7e64ca69df2fb71cd2cee45
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
    push str_ce48e859a7e64ca69df2fb71cd2cee45
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
    call addr_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_262:
    ;; skip fn
    jmp addr_283
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
    call addr_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_283:
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
    call addr_1
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
    call addr_1
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_319:
    ;; skip fn
    jmp addr_336
addr_330:
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
addr_336:
    ;; skip fn
    jmp addr_365
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
addr_365:
    ;; skip fn
    jmp addr_402
addr_377:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    ;; push int
    mov rax, 1
    push rax
addr_380:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_399
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
    je addr_396
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
    jmp addr_397
addr_396:
    ;; push int
    mov rax, 0
    push rax
addr_397:
    ;; end
    ;; end
    jmp addr_380
addr_399:
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
addr_402:
    ;; skip fn
    jmp addr_407
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_377
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; drop
    pop rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_407:
    ;; skip fn
    jmp addr_501
addr_454:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    push mem
    pop rax
    add rax, 129
    push rax
    ;; -- !64 --
    pop rax
    pop rbx
    mov [rax], rbx
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
    push mem
    pop rax
    add rax, 129
    push rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
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
    je addr_468
    ;; drop
    pop rax
    ;; drop
    pop rax
    ;; push const
    mov rax, 0
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_468:
    ;; end
    push mem
    pop rax
    add rax, 129
    push rax
    ;; -- @64 --
    pop rax
    xor rbx, rbx
    mov rbx, [rax]
    push rbx
addr_471:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_496
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
    ;; over
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
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
    je addr_485
    ;; drop
    pop rax
    ;; drop
    pop rax
    ;; drop
    pop rax
    ;; push const
    mov rax, 0
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_485:
    ;; end
    ;; push int
    mov rax, 1
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_330
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; push int
    mov rax, 1
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_330
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
    ;; push int
    mov rax, 1
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    ;; end
    jmp addr_471
addr_496:
    ;; drop
    pop rax
    ;; drop
    pop rax
    ;; drop
    pop rax
    ;; push const
    mov rax, 1
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_501:
    ;; skip fn
    jmp addr_517
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_515
    ;; drop
    pop rax
    ;; push const
    mov rax, 1
    push rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_515:
    ;; end
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_517:
    ;; skip fn
    jmp addr_525
addr_518:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_521
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_521:
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
addr_525:
    ;; skip fn
    jmp addr_547
addr_539:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_543
    ;; push str
    mov rax, 4
    push rax
    push str_946ef65d9bda41e590b8222946fbfa76
    ;; else
    jmp addr_544
addr_543:
    ;; push str
    mov rax, 5
    push rax
    push str_b2369615ea814f44a5753121a6dd8584
addr_544:
    ;; end
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_547:
    ;; skip fn
    jmp addr_577
addr_567:
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
addr_577:
    ;; skip fn
    jmp addr_588
addr_578:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- argv --
    mov rax, [args_ptr]
    add rax, 8
    push rax
    ;; push int
    mov rax, 0
    push rax
    ;; push int
    mov rax, 8
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_330
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    push mem
    pop rax
    add rax, 137
    push rax
    ;; -- ! --
    pop rax
    pop rbx
    mov [rax], bl
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_588:
    ;; skip fn
    jmp addr_605
addr_589:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 48
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
    je addr_597
    ;; drop
    pop rax
    ;; push int
    mov rax, 0
    push rax
    ;; else
    jmp addr_601
addr_597:
    ;; push int
    mov rax, 49
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
    je addr_602
    ;; push int
    mov rax, 1
    push rax
addr_601:
    ;; else
    jmp addr_603
addr_602:
    ;; push int
    mov rax, 2
    push rax
addr_603:
    ;; end
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_605:
    ;; skip fn
    jmp addr_636
addr_606:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    push mem
    pop rax
    add rax, 145
    push rax
    ;; -- ! --
    pop rax
    pop rbx
    mov [rax], bl
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
addr_611:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_631
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; dup
    pop rax
    push rax
    push rax
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_589
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    push mem
    pop rax
    add rax, 145
    push rax
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    ;; push int
    mov rax, 2
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    push mem
    pop rax
    add rax, 145
    push rax
    ;; -- ! --
    pop rax
    pop rbx
    mov [rax], bl
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
    ;; push int
    mov rax, 1
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    ;; end
    jmp addr_611
addr_631:
    ;; drop
    pop rax
    ;; drop
    pop rax
    push mem
    pop rax
    add rax, 145
    push rax
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_636:
    ;; skip fn
    jmp addr_666
addr_637:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 48
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; over
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
    ;; push int
    mov rax, 57
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_518
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_649
    ;; push int
    mov rax, 48
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    ;; else
    jmp addr_661
addr_649:
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 97
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; over
    pop rbx
    pop rax
    push rax
    push rbx
    push rax
    ;; push int
    mov rax, 102
    push rax
    ;; -- less than --
    mov rcx, 0
    mov rdx, 1
    pop rbx
    pop rax
    cmp rax, rbx
    cmovl rcx, rdx
    push rcx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_518
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; if
    pop rax
    cmp rax, 0
    je addr_662
    ;; push int
    mov rax, 97
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    ;; push int
    mov rax, 10
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
addr_661:
    ;; else
    jmp addr_664
addr_662:
    ;; drop
    pop rax
    ;; push int
    mov rax, 16
    push rax
addr_664:
    ;; end
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_666:
    ;; skip fn
    jmp addr_697
addr_667:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 0
    push rax
    push mem
    pop rax
    add rax, 146
    push rax
    ;; -- ! --
    pop rax
    pop rbx
    mov [rax], bl
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
addr_672:
    ;; while
    pop rax
    push rax
    cmp rax, 0
    je addr_692
    ;; swap
    pop rax
    pop rbx
    push rax
    push rbx
    ;; dup
    pop rax
    push rax
    push rax
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_637
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    push mem
    pop rax
    add rax, 146
    push rax
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    ;; push int
    mov rax, 16
    push rax
    ;; *
    pop rax
    pop rbx
    mul rbx
    push rax
    ;; +
    pop rax
    pop rbx
    add rax, rbx
    push rax
    push mem
    pop rax
    add rax, 146
    push rax
    ;; -- ! --
    pop rax
    pop rbx
    mov [rax], bl
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
    ;; push int
    mov rax, 1
    push rax
    ;; -
    pop rax
    pop rbx
    sub rbx, rax
    push rbx
    ;; end
    jmp addr_672
addr_692:
    ;; drop
    pop rax
    ;; drop
    pop rax
    push mem
    pop rax
    add rax, 146
    push rax
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_697:
    ;; skip fn
    jmp addr_783
addr_720:
    ;; prep fn
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_578
    mov [ret_stack_rsp], rsp
    mov rsp, rax
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
    push str_9f62cdcd55194b34aaadad423c7de5c7
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push int
    mov rax, 2
    push rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_567
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_377
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; push str
    mov rax, 1
    push rax
    push str_8c6bb1a41d1b4255932ebce82e3effd6
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
    ;; -- @ --
    pop rax
    xor rbx, rbx
    mov bl, [rax]
    push rbx
    ;; print
    pop rdi
    call print
    ;; push int
    mov rax, 4
    push rax
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 1
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
    je addr_744
    ;; push str
    mov rax, 3
    push rax
    push str_f10513c51b364741a68538a7bc3bb72e
    ;; else
    jmp addr_749
addr_744:
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
    mov rax, 2
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
    je addr_750
    ;; push str
    mov rax, 3
    push rax
    push str_6918915147234d7cb9345e8e66a4a508
addr_749:
    ;; else
    jmp addr_755
addr_750:
    ;; dup
    pop rax
    push rax
    push rax
    ;; push int
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
    je addr_756
    ;; push str
    mov rax, 5
    push rax
    push str_e3e596e015024fb8ad6152edbc7ae459
addr_755:
    ;; else
    jmp addr_757
addr_756:
    ;; push str
    mov rax, 7
    push rax
    push str_4de9a88177f94aa4b2d0049de666b934
addr_757:
    ;; end
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_258
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; drop
    pop rax
    ;; push str
    mov rax, 2
    push rax
    push str_c5c470b2884d46de85df68e7d3762d1b
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_606
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; print
    pop rdi
    call print
    ;; push str
    mov rax, 4
    push rax
    push str_6e38f1b6d6da482c92ccbfcc46be9ee8
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_606
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; print
    pop rdi
    call print
    ;; push str
    mov rax, 2
    push rax
    push str_231362a98ccf432285b1d25ba71fbb8f
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_606
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; print
    pop rdi
    call print
    ;; push str
    mov rax, 1
    push rax
    push str_084aa26618be40e1b9d69240926383f0
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_667
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; print
    pop rdi
    call print
    ;; push str
    mov rax, 2
    push rax
    push str_3ac64a601fa4422db42b4f7cbb53f55c
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_667
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; print
    pop rdi
    call print
    ;; push str
    mov rax, 4
    push rax
    push str_ddfde49a87bc43d0a528d889ecdff29d
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_667
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; print
    pop rdi
    call print
    ;; push str
    mov rax, 3
    push rax
    push str_47221e659aec40d0a325e0db0bac50b5
    ;; push str
    mov rax, 3
    push rax
    push str_47221e659aec40d0a325e0db0bac50b5
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_454
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_539
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; end
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    ret
addr_783:
    ;; call
    mov rax, rsp
    mov rsp, [ret_stack_rsp]
    call addr_720
    mov [ret_stack_rsp], rsp
    mov rsp, rax
    ;; -- exit program --
    mov rax, 60
    mov rdi, 0
    syscall
segment .data
str_ce48e859a7e64ca69df2fb71cd2cee45: db 0x30
str_946ef65d9bda41e590b8222946fbfa76: db 0x74,0x72,0x75,0x65
str_b2369615ea814f44a5753121a6dd8584: db 0x66,0x61,0x6c,0x73,0x65
str_9f62cdcd55194b34aaadad423c7de5c7: db 0x45,0x78,0x69,0x74,0xa
str_8c6bb1a41d1b4255932ebce82e3effd6: db 0xa
str_f10513c51b364741a68538a7bc3bb72e: db 0x6f,0x6e,0x65
str_6918915147234d7cb9345e8e66a4a508: db 0x74,0x77,0x6f
str_e3e596e015024fb8ad6152edbc7ae459: db 0x74,0x68,0x72,0x65,0x65
str_4de9a88177f94aa4b2d0049de666b934: db 0x75,0x6e,0x6b,0x6e,0x6f,0x77,0x6e
str_c5c470b2884d46de85df68e7d3762d1b: db 0x31,0x30
str_6e38f1b6d6da482c92ccbfcc46be9ee8: db 0x31,0x30,0x30,0x31
str_231362a98ccf432285b1d25ba71fbb8f: db 0x31,0x31
str_084aa26618be40e1b9d69240926383f0: db 0x66
str_3ac64a601fa4422db42b4f7cbb53f55c: db 0x66,0x66
str_ddfde49a87bc43d0a528d889ecdff29d: db 0x66,0x66,0x66,0x66
str_47221e659aec40d0a325e0db0bac50b5: db 0x61,0x61,0x61
segment .bss
    ret_stack_rsp: resq 1
    ret_stack: resb 4096
    ret_stack_end:
    args_ptr: resq 1
    mem: resb 147
