import assert from 'assert';
import { open } from 'fs/promises';
import { join } from 'path';
import { format } from 'util';
import { compilerError } from './errors';
import { OpType, Keyword, Type, Intrinsic, Program } from './types';
import { cmd_echoed, humanLocation } from './utils';

export async function compile(program: Program, filename?: string) {
    const strings: string[] = [];
    filename ||= 'out';

    const out = await open(
        join(filename.startsWith('/') ? '' : process.cwd(), filename + '.asm'),
        'w'
    );
    let position = 0;
    async function write(str: string, ...args: any[]) {
        const to_write = format(str, ...args);
        assert(
            (await out.write(to_write, position)).bytesWritten ===
                to_write.length,
            'write failed'
        );
        position += to_write.length;
    }

    if (!program.mainop) {
        await write('BITS 64\n');
        await write('segment .text\n');
        await write('global _start\n');
        await write('_start:\n');
        await write('    mov rax, 1\n');
        await write('    mov rdi, 1\n');
        await write('    mov rsi, str_nomain\n');
        await write('    mov rdx, 33\n');
        await write('    syscall\n');
        await write('    mov rax, 60\n');
        await write('    mov rdi, 1\n');
        await write('    syscall\n');
        await write('\n');
        await write('section .data\n');
        await write(
            'str_nomain: db 0x50,0x41,0x4e,0x49,0x43,0x3a,0x20,0x4e,0x6f,0x20,0x6d,0x61,0x69,0x6e,0x20,0x66,0x75,0x6e,0x63,0x74,0x69,0x6f,0x6e,0x20,0x64,0x65,0x66,0x69,0x6e,0x65,0x64,0x21,0xa\n'
        ); // UTF-16 for 'No main function defined!\n'

        await out.close();
        cmd_echoed(
            `nasm -felf64 -o "${filename.replaceAll(
                '"',
                '\\"'
            )}.o" "${filename.replaceAll('"', '\\"')}.asm"`
        );
        cmd_echoed(
            `ld -o "${filename.replaceAll('"', '\\"')}" "${filename.replaceAll(
                '"',
                '\\"'
            )}.o"`
        );
        return;
    }

    //#region printfunc
    await write('BITS 64\n');
    await write('segment .text\n');
    await write('print:\n');
    await write('    mov     r9, -3689348814741910323\n');
    await write('    sub     rsp, 40\n');
    await write('    mov     BYTE [rsp+31], 10\n');
    await write('    lea     rcx, [rsp+30]\n');
    await write('.L2:\n');
    await write('    mov     rax, rdi\n');
    await write('    lea     r8, [rsp+32]\n');
    await write('    mul     r9\n');
    await write('    mov     rax, rdi\n');
    await write('    sub     r8, rcx\n');
    await write('    shr     rdx, 3\n');
    await write('    lea     rsi, [rdx+rdx*4]\n');
    await write('    add     rsi, rsi\n');
    await write('    sub     rax, rsi\n');
    await write('    add     eax, 48\n');
    await write('    mov     BYTE [rcx], al\n');
    await write('    mov     rax, rdi\n');
    await write('    mov     rdi, rdx\n');
    await write('    mov     rdx, rcx\n');
    await write('    sub     rcx, 1\n');
    await write('    cmp     rax, 9\n');
    await write('    ja      .L2\n');
    await write('    lea     rax, [rsp+32]\n');
    await write('    mov     edi, 1\n');
    await write('    sub     rdx, rax\n');
    await write('    xor     eax, eax\n');
    await write('    lea     rsi, [rsp+32+rdx]\n');
    await write('    mov     rdx, r8\n');
    await write('    mov     rax, 1\n');
    await write('    syscall\n');
    await write('    add     rsp, 40\n');
    await write('    ret\n');
    await write('global _start\n');
    await write('_start:\n');
    await write('    mov [args_ptr], rsp\n');
    await write('    mov rax, ret_stack_end\n');
    await write('    mov [ret_stack_rsp], rax\n');
    //#endregion printfunc

    const req_addrs: number[] = [program.mainop];
    for (const ip in program.ops) {
        const op = program.ops[ip];
        if (op.type === OpType.Keyword) {
            if (
                [
                    Keyword.If,
                    Keyword.Else,
                    Keyword.While,
                    Keyword.IfStar,
                ].includes(op.operation)
            ) {
                if (!op.reference)
                    return compilerError(
                        op.location,
                        'Error: Reference to end not defined (forgot to run crossReferenceProgram?)'
                    );
                req_addrs.push(op.reference);
            } else if (op.operation === Keyword.End && op.reference)
                req_addrs.push(op.reference);
        } else if (op.type === OpType.SkipFn) req_addrs.push(op.operation);
        else if (op.type === OpType.Call) req_addrs.push(op.operation);
    }

    for (const ip in program.ops) {
        const op = program.ops[ip];
        if (req_addrs.includes(Number(ip))) await write('addr_%d:\n', ip);

        if (op.type === OpType.PushString) {
            await write('    ;; push str\n');
            await write('    mov rax, %d\n', op.operation.length);
            await write('    push rax\n');
            await write('    push str_%d\n', strings.length);
            strings.push(op.operation);
        } else if (op.type === OpType.PushCString) {
            await write('    ;; push cstr\n');
            await write('    push str_%d\n', strings.length);
            strings.push(op.operation + '\x00');
        } else if (op.type === OpType.PushInt) {
            await write('    ;; push int\n');
            await write('    mov rax, %d\n', op.operation);
            await write('    push rax\n');
        } else if (op.type === OpType.PushMem) {
            await write('    push mem\n');
            await write('    pop rax\n');
            await write('    add rax, %d\n', op.operation);
            await write('    push rax\n');
        } else if (op.type === OpType.Const) {
            if (op._type === Type.Bool && ![1, 0].includes(op.operation))
                compilerError(
                    op.location,
                    format(
                        'The operation of a bool-const is not a 0 or 1 (found %d)',
                        op.operation
                    )
                );
            await write('    ;; push const\n');
            await write('    mov rax, %d\n', op.operation);
            await write('    push rax\n');
        } else if (op.type === OpType.SkipFn) {
            if (!op.operation || isNaN(op.operation))
                compilerError(op.location, 'Error: No end-block found!');
            await write('    ;; skip fn\n');
            await write('    jmp addr_%d\n', op.operation);
        } else if (op.type === OpType.PrepFn) {
            await write('    ;; prep fn\n');
            await write('    mov [ret_stack_rsp], rsp\n');
            await write('    mov rsp, rax\n');
        } else if (op.type === OpType.Call) {
            if (!op.operation || isNaN(op.operation))
                compilerError(op.location, "Error: Proc location wasn't found");
            await write('    ;; call\n');
            await write('    mov rax, rsp\n');
            await write('    mov rsp, [ret_stack_rsp]\n');
            await write('    call addr_%d\n', op.operation);
            await write('    mov [ret_stack_rsp], rsp\n');
            await write('    mov rsp, rax\n');
        } else if (op.type === OpType.Ret) {
            await write('    ;; end\n');
            await write('    mov rax, rsp\n');
            await write('    mov rsp, [ret_stack_rsp]\n');
            await write('    ret\n');
        } else if (op.type === OpType.Intrinsic) {
            switch (op.operation) {
                case Intrinsic.Plus:
                    await write('    ;; +\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    add rax, rbx\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Minus:
                    await write('    ;; -\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    sub rbx, rax\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Multiply:
                    await write('    ;; *\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    mul rbx\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.DivMod:
                    await write('    ;; /%\n');
                    await write('    xor rdx, rdx\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    div rbx\n');
                    await write('    push rax\n');
                    await write('    push rdx\n');
                    break;
                case Intrinsic.Print:
                    await write('    ;; print\n');
                    await write('    pop rdi\n');
                    await write('    call print\n');
                    break;
                case Intrinsic.Syscall1:
                    await write('    ;; syscall1\n');
                    await write('    pop rax\n');
                    await write('    pop rdi\n');
                    await write('    syscall\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Syscall2:
                    await write('    ;; syscall2\n');
                    await write('    pop rax\n');
                    await write('    pop rdi\n');
                    await write('    pop rsi\n');
                    await write('    syscall\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Syscall3:
                    await write('    ;; syscall3\n');
                    await write('    pop rax\n');
                    await write('    pop rdi\n');
                    await write('    pop rsi\n');
                    await write('    pop rdx\n');
                    await write('    syscall\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Syscall4:
                    await write('    ;; syscall4\n');
                    await write('    pop rax\n');
                    await write('    pop rdi\n');
                    await write('    pop rsi\n');
                    await write('    pop rdx\n');
                    await write('    pop r10\n');
                    await write('    syscall\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Syscall5:
                    await write('    ;; syscall5\n');
                    await write('    pop rax\n');
                    await write('    pop rdi\n');
                    await write('    pop rsi\n');
                    await write('    pop rdx\n');
                    await write('    pop r10\n');
                    await write('    pop r8\n');
                    await write('    syscall\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Syscall6:
                    await write('    ;; syscall6\n');
                    await write('    pop rax\n');
                    await write('    pop rdi\n');
                    await write('    pop rsi\n');
                    await write('    pop rdx\n');
                    await write('    pop r10\n');
                    await write('    pop r8\n');
                    await write('    pop r9\n');
                    await write('    syscall\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Drop:
                    await write('    ;; drop\n');
                    await write('    pop rax\n');
                    break;
                case Intrinsic.Dup:
                    await write('    ;; dup\n');
                    await write('    pop rax\n');
                    await write('    push rax\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Over:
                    await write('    ;; over\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    push rax\n');
                    await write('    push rbx\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Swap:
                    await write('    ;; swap\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    push rax\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Equal:
                    await write('    ;; =\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    cmp rax, rbx\n');
                    await write('    sete al\n');
                    await write('    movzx rax, al\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.NotEqual:
                    await write('    ;; =\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    cmp rax, rbx\n');
                    await write('    setne al\n');
                    await write('    movzx rax, al\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Load:
                    await write('    ;; -- @ --\n');
                    await write('    pop rax\n');
                    await write('    xor rbx, rbx\n');
                    await write('    mov bl, [rax]\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Store:
                    await write('    ;; -- ! --\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    mov [rax], bl\n');
                    break;
                case Intrinsic.Load64:
                    await write('    ;; -- @64 --\n');
                    await write('    pop rax\n');
                    await write('    xor rbx, rbx\n');
                    await write('    mov rbx, [rax]\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Store64:
                    await write('    ;; -- !64 --\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    mov [rax], rbx\n');
                    break;
                case Intrinsic.Here:
                    const loc = format('%s:%d:%d', ...op.location);
                    await write('    ;; here\n');
                    await write('    mov rax, %d\n', loc.length);
                    await write('    push rax\n');
                    await write('    push str_%d\n', strings.length);
                    strings.push(loc);
                    break;
                case Intrinsic.Argv:
                    await write('    ;; -- argv --\n');
                    await write('    mov rax, [args_ptr]\n');
                    await write('    add rax, 8\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.CastInt:
                case Intrinsic.CastPtr:
                case Intrinsic.fakeBool:
                case Intrinsic.fakeInt:
                case Intrinsic.fakePtr:
                case Intrinsic.fakeDrop:
                    break;
                case Intrinsic.CastBool:
                    await write('    ;; -- cast(bool) --\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, 0\n');
                    await write('    setne al\n');
                    await write('    movzx rax, al\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.LessThan:
                    await write('    ;; -- less than --\n');
                    await write('    mov rcx, 0\n');
                    await write('    mov rdx, 1\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, rbx\n');
                    await write('    cmovl rcx, rdx\n');
                    await write('    push rcx\n');
                    break;
                case Intrinsic.LessThanEqual:
                    await write('    ;; -- less than equal --\n');
                    await write('    mov rcx, 0\n');
                    await write('    mov rdx, 1\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, rbx\n');
                    await write('    cmovle rcx, rdx\n');
                    await write('    push rcx\n');
                    break;
                case Intrinsic.GreaterThan:
                    await write('    ;; -- greater than --\n');
                    await write('    mov rcx, 0\n');
                    await write('    mov rdx, 1\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, rbx\n');
                    await write('    cmovg rcx, rdx\n');
                    await write('    push rcx\n');
                    break;
                case Intrinsic.GreaterThanEqual:
                    await write('    ;; -- greater than equal --\n');
                    await write('    mov rcx, 0\n');
                    await write('    mov rdx, 1\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, rbx\n');
                    await write('    cmovge rcx, rdx\n');
                    await write('    push rcx\n');
                    break;
                case Intrinsic.Rot: // 3. 2. 1. -> 2. 1. 3.
                    await write('    ;; -- rot --\n');
                    await write('    pop rax\n'); // 1.
                    await write('    pop rbx\n'); // 2.
                    await write('    pop rcx\n'); // 3.
                    await write('    push rbx\n');
                    await write('    push rcx\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Shr:
                    await write('    ;; -- shr --\n');
                    await write('    pop rcx\n');
                    await write('    pop rbx\n');
                    await write('    shr rbx, cl\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Shl:
                    await write('    ;; -- shl --\n');
                    await write('    pop rcx\n');
                    await write('    pop rbx\n');
                    await write('    shl rbx, cl\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Or:
                    await write('    ;; -- or --\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    or rbx, rax\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.And:
                    await write('    ;; -- and --\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    and rbx, rax\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Xor:
                    await write('    ;; -- xor --\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    xor rbx, rax\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Not:
                    await write('    ;; -- not --\n');
                    await write('    pop rax\n');
                    await write('    not rax\n');
                    await write('    push rax\n');
                    break;
                default:
                    assert(false, 'Unreachable ( ' + humanLocation(op.location) + ' )');
                    break;
            }
        } else if (op.type === OpType.Keyword) {
            switch (op.operation) {
                case Keyword.End:
                    await write('    ;; end\n');
                    if (op.reference)
                        await write('    jmp addr_%d\n', op.reference);
                    break;
                case Keyword.Else:
                    if (!op.reference)
                        return compilerError(
                            op.location,
                            'No reference for this if-block defined. Probably a cross-referencing issue.'
                        );
                    await write('    ;; else\n');
                    await write('    jmp addr_%d\n', op.reference);
                    break;
                case Keyword.If:
                case Keyword.IfStar:
                    if (!op.reference)
                        return compilerError(
                            op.location,
                            'No reference for this if-block defined. Probably a cross-referencing issue.'
                        );
                    await write('    ;; if\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, 0\n');
                    await write('    je addr_%d\n', op.reference);
                    break;
                case Keyword.While:
                    if (!op.reference)
                        return compilerError(
                            op.location,
                            'No reference for this while-block defined. Probably a cross-referencing issue.'
                        );
                    await write('    ;; while\n');
                    await write('    pop rax\n');
                    await write('    push rax\n');
                    await write('    cmp rax, 0\n');
                    await write('    je addr_%d\n', op.reference);
                    break;
                default:
                    assert(false, 'unreachable');
            }
        } else assert(false, 'unreachable');
    }

    if (req_addrs.includes(program.ops.length))
        await write('addr_%d:\n', program.ops.length);
    await write('    ;; call\n');
    await write('    mov rax, rsp\n');
    await write('    mov rsp, [ret_stack_rsp]\n');
    await write('    call addr_%d\n', program.mainop);
    await write('    mov [ret_stack_rsp], rsp\n');
    await write('    mov rsp, rax\n');
    await write('    ;; -- exit program --\n');
    await write('    mov rax, 60\n');
    if (program.contracts[program.mainop].outs.length < 1)
        await write('    mov rdi, 0\n');
    else await write('    pop rdi\n');
    await write('    syscall\n');
    await write('segment .data\n');
    for (const s in strings) {
        await write(
            'str_%d: db %s\n',
            s,
            Object.values(strings[s])
                .map(
                    (el) => '0x' + el.charCodeAt(0).toString(16).substring(0, 2)
                )
                .join(',')
        );
    }
    await write('segment .bss\n');
    await write('    ret_stack_rsp: resq 1\n');
    await write('    ret_stack: resb 4096\n');
    await write('    ret_stack_end:\n');
    await write('    args_ptr: resq 1\n');
    await write('    mem: resb %d\n', program.memorysize);

    await out.close();

    cmd_echoed(
        `nasm -felf64 -o "${filename.replaceAll(
            '"',
            '\\"'
        )}.o" "${filename.replaceAll('"', '\\"')}.asm"`,
        'assembler'
    );
    cmd_echoed(
        `ld -o "${filename.replaceAll('"', '\\"')}" "${filename.replaceAll(
            '"',
            '\\"'
        )}.o"`,
        'linker'
    );
}
