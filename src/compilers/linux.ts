import assert from 'assert';
import { open } from 'fs/promises';
import { join } from 'path';
import { format } from 'util';
import { compilerError, compilerWarn, error } from '../errors';
import { OpType, Keyword, Type, Intrinsic, Program } from '../types';
import * as crypto from 'crypto';
import chalk from 'chalk';
import { timer } from '../timer';
import { nasmLabelIsValid } from '../utils/assembly';
import { cmd_echoed, hasParameter, humanLocation } from '../utils/general';
import { humanType } from '../utils/types';

function generateStringName(str: string): string {
    return crypto.randomUUID().replaceAll('-', '');
}

export async function compile({
    optimizations,
    program,
    filename,
    dontRunFunctions = false,
    external = [],
}: {
    program: Program;
    optimizations: '0' | '1';
    filename?: string;
    external?: string[];
    dontRunFunctions?: boolean;
}) {
    const end = timer.start('compile() for target `linux`');
    const strings: [string, string][] = [];
    const defs: string[] = [];

    function getId(name: string) {
        defs.push(name);
        return defs.filter((el) => el === name).length;
    }

    function getStringId(str: string) {
        for (const [string, id] of strings) {
            if (str === string) return id;
        }
        const id = generateStringName(str);
        strings.push([str, id]);
        return id;
    }

    const usedMems: string[] = [];

    filename ||= 'out';

    const out = await open(
        join(filename.startsWith('/') ? '' : process.cwd(), filename + '.asm'),
        'w'
    );
    let position = 0;
    async function write(str: string, ...args: any[]) {
        const to_write = format(str, ...args);
        if (to_write.includes(';;') && optimizations !== '0') return;
        assert(
            (await out.write(to_write, position)).bytesWritten ===
                to_write.length,
            'write failed'
        );
        position += to_write.length;
    }
    async function writeLabel(
        panicIfInvalid: boolean,
        label: string,
        ...args: any[]
    ) {
        const labelName = format(label, ...args);
        if (!nasmLabelIsValid(labelName))
            if (panicIfInvalid) error('Label name %s is invalid!', labelName);
            else return;
        await write(labelName);
        await write('\n');
    }

    if (!program.mainop) {
        const asmend = timer.start('writing assembly');
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

        asmend();

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
        end();
        return;
    }

    //#region printfunc
    if (optimizations === '0') {
        const functionMetadataGenEnd = timer.start(
            'included functions comment metadata generation'
        );
        await write(';; Included Functions:\n');
        for (const [op, { ins, outs, used }] of Object.entries(
            program.contracts
        )) {
            if (!used) continue;
            const operation = program.ops[Number(op)];
            if (
                operation.type !== OpType.PrepFn &&
                operation.type !== OpType.SkipFn
            )
                continue;
            await write(';; Function ');
            await write(operation.functionName);
            await write(' Address: ');
            await write(op);
            await write('\n');
            await write(';;   -> Ins: ');
            if (ins.length < 1) await write('none');
            else await write(ins.map((el) => humanType(el.type)).join(', '));
            await write('\n');
            await write(';;   -> Outs: ');
            if (outs.length < 1) await write('none');
            else await write(outs.map((el) => humanType(el.type)).join(', '));
            await write('\n\n');
        }
        functionMetadataGenEnd();
    }

    const addrLabelCollectionEnd = timer.start('address label collection');
    const req_addrs: number[] = [program.mainop, ...program.functionsToRun];
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
                        [op.location],
                        'Error: Reference to end not defined (forgot to run crossReferenceProgram?)'
                    );
                req_addrs.push(op.reference);
            } else if (op.operation === Keyword.End && op.reference)
                req_addrs.push(op.reference);
        } else if (op.type === OpType.SkipFn) req_addrs.push(op.operation);
        else if (op.type === OpType.Call) req_addrs.push(op.operation);
    }
    addrLabelCollectionEnd();

    const printAsmEnd = timer.start('writing assembly for print');
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
    printAsmEnd();

    const asmEnd = timer.start('writing assembly');
    let ip = -1;
    while (ip < program.ops.length) {
        const op = program.ops[++ip];
        if (!op) break;
        if (req_addrs.includes(Number(ip)))
            await writeLabel(true, 'addr_%d:', ip);

        if (op.type === OpType.PushString) {
            await write(
                '    ;; push str ' + JSON.stringify(op.operation) + '\n'
            );
            await write('    mov rax, %d\n', op.operation.length);
            await write('    push rax\n');
            if (op.operation.length > 0)
                await write('    push str_%s\n', getStringId(op.operation));
            else await write('    push 0\n');
        } else if (op.type === OpType.PushCString) {
            await write(
                '    ;; push cstr ' + JSON.stringify(op.operation) + '\n'
            );
            await write(
                '    push str_%s\n',
                getStringId(op.operation + '\x00')
            );
        } else if (op.type === OpType.PushInt) {
            await write('    ;; push int ' + op.operation + '\n');
            await write('    mov rax, %d\n', op.operation);
            await write('    push rax\n');
        } else if (op.type === OpType.PushMem) {
            await write('    ;; push mem ' + op.operation + '\n');
            await write('    push mem_' + op.operation + '\n');
            if (!usedMems.includes(op.operation)) usedMems.push(op.operation);
        } else if (op.type === OpType.Const) {
            if (op._type === Type.Bool && ![1, 0].includes(op.operation))
                compilerError(
                    [op.location],
                    format(
                        'The operation of a bool-const is not a 0 or 1 (found %d)',
                        op.operation
                    )
                );
            const value =
                op._type === Type.Ptr
                    ? '0x' + op.operation.toString(16)
                    : op._type === Type.Bool
                    ? op.operation === 0
                        ? 'false'
                        : 'true'
                    : op.operation.toString();
            await write(
                '    ;; push const ' +
                    op.token.value +
                    ' with value ' +
                    value +
                    '\n'
            );
            await write('    mov rax, %d\n', op.operation);
            await write('    push rax\n');
        } else if (op.type === OpType.Comment)
            await write(
                op.operation
                    .split('\n')
                    .map((el) => '    ;; ' + el)
                    .join('\n') + '\n'
            );
        else if (op.type === OpType.SkipFn) {
            if (!op.operation || isNaN(op.operation))
                compilerError([op.location], 'Error: No end-block found!');
            if (hasParameter(op, '__provided_externally__'))
                ip = op.operation - 1;
            else {
                await write('    ;; skip fn ' + op.functionName);
                await write('\n');
                await write('    jmp addr_%d\n', op.operation);
            }
        } else if (op.type === OpType.PrepFn) {
            if (!hasParameter(op, ['__fn_anon__', '__fn_anonymous__']))
                await writeLabel(
                    false,
                    `${op.functionName}_${getId(op.functionName)}:`
                );
            await write('    ;; prep fn ' + op.functionName);
            await write('\n');
            await write('    mov [ret_stack_rsp], rsp\n');
            await write('    mov rsp, rax\n');
        } else if (op.type === OpType.Call) {
            if (!op.operation || isNaN(op.operation))
                compilerError(
                    [op.location],
                    "Error: Proc location wasn't found"
                );
            const useFunctionName = hasParameter(
                program.ops[op.operation],
                '__provided_externally__'
            );
            await write('    ;; call ' + op.functionName + '\n');
            await write('    mov rax, rsp\n');
            await write('    mov rsp, [ret_stack_rsp]\n');
            if (!useFunctionName)
                await write('    call addr_%d\n', op.operation);
            else await write('    call %s\n', op.functionName);
            await write('    mov [ret_stack_rsp], rsp\n');
            await write('    mov rsp, rax\n');
            if (hasParameter(program.ops[op.operation], 'deprecated'))
                compilerWarn(
                    [op.location, program.ops[op.operation].location],
                    op.functionName + ' is deprecated!'
                );
        } else if (op.type === OpType.PushAsm) {
            await write('    ;; assembly\n');
            if (
                !hasParameter(op, '__supports_linux__') &&
                !hasParameter(op, '__supports_target_linux__')
            )
                compilerError(
                    [op.location],
                    'This assembly does not seem to support the current target. (missing: __supports_linux__ or __supports_target_linux__)'
                );
            for (const value of op.operation.split('\n'))
                await write(
                    value.length > 0
                        ? '    ;;   ' + JSON.stringify(value) + '\n'
                        : ''
                );
            await write('    ;; end\n');
            await write(
                (op.operation || '')
                    .split('\n')
                    .map((el) => '    ' + el)
                    .join('\n')
            );
            if (op.operation && !op.operation.endsWith('\n')) await write('\n');
        } else if (op.type === OpType.Ret) {
            if (
                hasParameter(
                    program.contracts[op.operation]?.prep,
                    '__function_exits__'
                )
            ) {
                const str = chalk.red(
                    'PANIC: ' +
                        program.contracts[op.operation].name +
                        ' returned even tho it was marked as __function_exits__! Return at ' +
                        op.location[0] +
                        ':' +
                        op.location[1] +
                        ':' +
                        op.location[2]
                );
                await write(
                    '   ;; ReturnPanic (ret on __function_exits__ functions)\n'
                );
                await write('   mov rax, 1\n');
                await write('   mov rdi, 2\n');
                await write('   mov rsi, str_%s\n', getStringId(str));
                await write('   mov rdx, %d\n', str.length);
                await write('   syscall\n');
                await write('   mov rax, 60\n');
                await write('   mov rdi, 0\n');
                await write('   syscall\n');
            } else {
                await write('    ;; end/ret\n');
                await write('    mov rax, rsp\n');
                await write('    mov rsp, [ret_stack_rsp]\n');
                await write('    ret\n');
            }
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
                    await write('    ;; !=\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    cmp rax, rbx\n');
                    await write('    setne al\n');
                    await write('    movzx rax, al\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.Load:
                    await write('    ;; @\n');
                    await write('    pop rax\n');
                    await write('    xor rbx, rbx\n');
                    await write('    mov bl, [rax]\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Store:
                    await write('    ;; !\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    mov [rax], bl\n');
                    break;
                case Intrinsic.Load16:
                    await write('    ;; @16\n');
                    await write('    pop rax\n');
                    await write('    xor rbx, rbx\n');
                    await write('    mov bx, [rax]\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Store16:
                    await write('    ;; !16\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    mov [rax], bx\n');
                    break;
                case Intrinsic.Load32:
                    await write('    ;; @32\n');
                    await write('    pop rax\n');
                    await write('    xor rbx, rbx\n');
                    await write('    mov ebx, [rax]\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Store32:
                    await write('    ;; !32\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    mov [rax], ebx\n');
                    break;
                case Intrinsic.Load64:
                    await write('    ;; @64\n');
                    await write('    pop rax\n');
                    await write('    xor rbx, rbx\n');
                    await write('    mov rbx, [rax]\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Store64:
                    await write('    ;; !64\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    mov [rax], rbx\n');
                    break;
                case Intrinsic.Here:
                    const loc = format('%s:%d:%d', ...op.location);
                    await write('    ;; here\n');
                    await write('    mov rax, %d\n', loc.length);
                    await write('    push rax\n');
                    await write('    push str_%s', getStringId(loc));
                    await write(' ;; ' + JSON.stringify(loc) + '\n');
                    break;
                case Intrinsic.Argv:
                    await write('    ;; argv\n');
                    await write('    mov rax, [args_ptr]\n');
                    await write('    add rax, 8\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.CastInt:
                    await write('    ;; cast(int)\n');
                    break;
                case Intrinsic.CastPtr:
                    await write('    ;; cast(ptr)\n');
                    break;
                case Intrinsic.fakeBool:
                    await write('    ;; fake(bool)\n');
                    break;
                case Intrinsic.fakeInt:
                    await write('    ;; fake(int)\n');
                    break;
                case Intrinsic.fakePtr:
                    await write('    ;; fake(ptr)\n');
                    break;
                case Intrinsic.fakeAny:
                    await write('    ;; fake(any)\n');
                    break;
                case Intrinsic.fakeDrop:
                    await write('    ;; fake(drop)\n');
                    break;
                case Intrinsic.CastBool:
                    await write('    ;; cast(bool)\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, 0\n');
                    await write('    setne al\n');
                    await write('    movzx rax, al\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.LessThan:
                    await write('    ;; <\n');
                    await write('    mov rcx, 0\n');
                    await write('    mov rdx, 1\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, rbx\n');
                    await write('    cmovl rcx, rdx\n');
                    await write('    push rcx\n');
                    break;
                case Intrinsic.LessThanEqual:
                    await write('    ;; <=\n');
                    await write('    mov rcx, 0\n');
                    await write('    mov rdx, 1\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, rbx\n');
                    await write('    cmovle rcx, rdx\n');
                    await write('    push rcx\n');
                    break;
                case Intrinsic.GreaterThan:
                    await write('    ;; >\n');
                    await write('    mov rcx, 0\n');
                    await write('    mov rdx, 1\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, rbx\n');
                    await write('    cmovg rcx, rdx\n');
                    await write('    push rcx\n');
                    break;
                case Intrinsic.GreaterThanEqual:
                    await write('    ;; >=\n');
                    await write('    mov rcx, 0\n');
                    await write('    mov rdx, 1\n');
                    await write('    pop rbx\n');
                    await write('    pop rax\n');
                    await write('    cmp rax, rbx\n');
                    await write('    cmovge rcx, rdx\n');
                    await write('    push rcx\n');
                    break;
                case Intrinsic.Rot: // 3. 2. 1. -> 2. 1. 3.
                    await write('    ;; rot\n');
                    await write('    pop rax\n'); // 1.
                    await write('    pop rbx\n'); // 2.
                    await write('    pop rcx\n'); // 3.
                    await write('    push rax\n'); // 1.
                    await write('    push rcx\n'); // 3.
                    await write('    push rbx\n'); // 2.
                    break;
                case Intrinsic.Shr:
                    await write('    ;; shr\n');
                    await write('    pop rcx\n');
                    await write('    pop rbx\n');
                    await write('    shr rbx, cl\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Shl:
                    await write('    ;; shl\n');
                    await write('    pop rcx\n');
                    await write('    pop rbx\n');
                    await write('    shl rbx, cl\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Or:
                    await write('    ;; or\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    or rbx, rax\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.And:
                    await write('    ;; and\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    and rbx, rax\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Xor:
                    await write('    ;; xor\n');
                    await write('    pop rax\n');
                    await write('    pop rbx\n');
                    await write('    xor rbx, rax\n');
                    await write('    push rbx\n');
                    break;
                case Intrinsic.Not:
                    await write('    ;; not\n');
                    await write('    pop rax\n');
                    await write('    not rax\n');
                    await write('    push rax\n');
                    break;
                case Intrinsic.None:
                    // used to eliminate code without shifting the array layout/length
                    break;
                default:
                    assert(
                        false,
                        'Unreachable ( ' + humanLocation(op.location) + ' )'
                    );
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
                            [op.location],
                            'No reference for this if-block defined. Probably a cross-referencing issue.'
                        );
                    await write('    ;; else\n');
                    await write('    jmp addr_%d\n', op.reference);
                    break;
                case Keyword.If:
                case Keyword.IfStar:
                    if (!op.reference)
                        return compilerError(
                            [op.location],
                            'No reference for this if-block defined. Probably a cross-referencing issue.'
                        );
                    await write(
                        '    ;; if' +
                            (op.operation === Keyword.IfStar ? '*\n' : '\n')
                    );
                    await write('    pop rax\n');
                    await write('    cmp rax, 0\n');
                    await write('    je addr_%d\n', op.reference);
                    break;
                case Keyword.While:
                    if (!op.reference)
                        return compilerError(
                            [op.location],
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
        await writeLabel(true, 'addr_%d:', program.ops.length);
    if (!dontRunFunctions) {
        await write('    ;; call all ___run_function__ functions\n');
        for (const f of program.functionsToRun) {
            await write('    mov rax, rsp\n');
            await write('    mov rsp, [ret_stack_rsp]\n');
            await write('    call addr_%d\n', f);
            await write('    mov [ret_stack_rsp], rsp\n');
            await write('    mov rsp, rax\n');
        }
    }
    if (!hasParameter(program.contracts[program.mainop].prep, '__nomain__')) {
        await write('    ;; call (main)\n');
        await write('    mov rax, rsp\n');
        await write('    mov rsp, [ret_stack_rsp]\n');
        await write('    call addr_%d\n', program.mainop);
        await write('    mov [ret_stack_rsp], rsp\n');
        await write('    mov rsp, rax\n');
        await write('    ;; exit program\n');
        await write('    mov rax, 60\n');
        if (program.contracts[program.mainop].outs.length < 1)
            await write('    mov rdi, 0\n');
        else await write('    pop rdi\n');
        await write('    syscall\n');
    } else {
        await write('    ;; skip calling main, __nomain__ is defined\n');
        await write('    ;; exit(0)\n');
        await write('    mov rax, 60\n');
        await write('    mov rdi, 0\n');
        await write('    syscall\n');
    }
    await write('segment .data\n');
    for (const [str, id] of strings) {
        await write(
            '    str_%s: db %s',
            id,
            Object.values(str)
                .map(
                    (el) => '0x' + el.charCodeAt(0).toString(16).substring(0, 2)
                )
                .join(',')
        );
        await write(' ;; ' + JSON.stringify(str));
        await write('\n');
    }
    await write('segment .bss\n');
    await write('    ret_stack_rsp: resq 1\n');
    await write('    ret_stack: resb 4096\n');
    await write('    ret_stack_end:\n');
    await write('    args_ptr: resq 1\n');
    for (const [name, { size }] of Object.entries(program.mems)) {
        if (usedMems.includes(name))
            await write('    mem_' + name + ': resb ' + size + '\n');
    }

    for (const f of external) {
        await write('%%include "%s"\n', JSON.stringify(join('', f)));
    }
    asmEnd();
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
    end();
}

export const removeFiles: string[] = ['.o', '.asm'];
export async function runProgram(file: string, args: string[]) {
    cmd_echoed(
        `"${!file.startsWith('/') ? join(process.cwd(), file) : file}" ${args
            .map((el) => '"' + el.replaceAll('"', '\\"') + '"')
            .join(' ')}`,
        'Program Output'
    );
}
