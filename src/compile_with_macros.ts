import * as macros from './macros';
import assert from 'assert';
import { open, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { format } from 'util';
import { compilerError, compilerWarn } from './errors';
import { OpType, Keyword, Type, Intrinsic, Program } from './types';
import { cmd_echoed, hasParameter, humanLocation, humanType } from './utils';
import * as crypto from 'crypto';
import chalk from 'chalk';
import { timer } from './timer';

function generateStringName(str: string): string {
    return crypto.randomUUID().replaceAll('-', '');
}

export async function compile({
    optimizations,
    program,
    filename,
    external = [],
    dontRunFunctions = false,
}: {
    program: Program;
    optimizations: '0' | '1';
    filename?: string;
    external?: string[];
    dontRunFunctions?: boolean;
}) {
    const end = timer.start('compile() for target `linux-macros`');
    const strings: [string, string][] = [];
    const used: (keyof typeof macros)[] = [];
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
        assert(
            (await out.write(to_write, position)).bytesWritten ===
                to_write.length,
            'write failed'
        );
        position += to_write.length;
    }
    function useMacro(
        macro: keyof typeof macros,
        ...args: string[]
    ): Promise<void> {
        if (!used.includes(macro)) used.push(macro);
        return write(
            '    ' +
                macro +
                (args.length > 0 ? ' ' + args.join(', ') : '') +
                '\n'
        );
    }

    if (!program.mainop) {
        const asmEnd = timer.start('writing assembly');
        
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

        asmEnd();

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
            else await write(ins.map(humanType).join(', '));
            await write('\n');
            await write(';;   -> Outs: ');
            if (outs.length < 1) await write('none');
            else await write(outs.map(humanType).join(', '));
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
    await write('_print:\n');
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
    
    let ip = 0;
    while (ip < program.ops.length) {
        const op = program.ops[++ip];
        if (!op) break;
        if (req_addrs.includes(Number(ip))) await write('addr_%d:\n', ip);

        if (op.type === OpType.PushString) {
            if (op.operation.length < 1) await useMacro('pushemptystr');
            else {
                await write('    ;; ' + JSON.stringify(op.operation) + '\n');
                await useMacro(
                    'pushstr',
                    op.operation.length.toString(),
                    getStringId(op.operation)
                );
            }
        } else if (op.type === OpType.PushCString) {
            if (op.operation.length < 1) await useMacro('pushemptycstr');
            else {
                await write('    ;; ' + JSON.stringify(op.operation) + '\n');
                await useMacro('pushcstr', getStringId(op.operation + '\x00'));
            }
        } else if (op.type === OpType.PushInt) {
            await useMacro('pushint', op.operation.toString());
        } else if (op.type === OpType.PushMem) {
            await useMacro('pushmem', op.operation);
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
            if (!used.includes('pushconst')) used.push('pushconst');
            await write(
                '    pushconst %d ;; name: %s, value: %s\n',
                op.operation,
                op.token.value,
                value
            );
        } else if (op.type === OpType.Comment)
            await write(
                op.operation
                    .split('\n')
                    .map((el) => '    ;; #' + el)
                    .join('\n') + '\n'
            );
        else if (op.type === OpType.SkipFn) {
            if (!op.operation || isNaN(op.operation))
                compilerError([op.location], 'Error: No end-block found!');
            if (op.parameters?.includes('__provided_externally__'))
                ip = op.operation - 1;
            else
                await useMacro(
                    'skipfn',
                    op.operation.toString(),
                    op.functionName
                );
        } else if (op.type === OpType.PrepFn) {
            await write(`${op.functionName}_${getId(op.functionName)}:\n`);
            await write(
                '     ;; ' +
                    program.contracts[ip].ins.map(humanType).join(' ') +
                    ' -- ' +
                    program.contracts[ip].outs.map(humanType).join(' ') +
                    '\n'
            );
            await useMacro('prepfn', op.functionName);
        } else if (op.type === OpType.Call) {
            if (!op.operation || isNaN(op.operation))
                compilerError(
                    [op.location],
                    "Error: Proc location wasn't found"
                );
            if (
                !hasParameter(
                    program.ops[op.operation],
                    '__provided_externally__'
                )
            )
                await useMacro(
                    'calladdr',
                    op.operation.toString() + ' ;; ' + op.functionName
                );
            else await useMacro('callFn', op.functionName);
            if (program.ops[op.operation].parameters?.includes('deprecated'))
                compilerWarn(
                    [op.location, program.ops[op.operation].location],
                    op.functionName + ' is deprecated!'
                );
        } else if (op.type === OpType.PushAsm) {
            if (
                !op.parameters?.includes('__supports_linux__') &&
                !op.parameters?.includes('__supports_target_linux_macros__')
            )
                compilerError(
                    [op.location],
                    'This assembly does not seem to support the current target. (missing: __supports_linux__ or __supports_target_linux_macros__)'
                );
            await write('    ;; custom assembly start\n');
            await write(
                (op.operation || '')
                    .split('\n')
                    .map((el) => '    ' + el)
                    .join('\n')
            );
            if (op.operation && !op.operation.endsWith('\n')) await write('\n');
            await write('    ;; custom assembly end\n');
        } else if (op.type === OpType.Ret) {
            if (
                !hasParameter(
                    program.contracts[op.operation]?.prep,
                    '__function_exits__'
                )
            )
                await useMacro('retj');
            else {
                const str = chalk.red(
                    'PANIC: ' +
                        program.contracts[op.operation].name +
                        ' returned even tho it was marked as __function_exits__!'
                );
                await useMacro(
                    'returnpanic',
                    str.length.toString(),
                    getStringId(str)
                );
            }
        } else if (op.type === OpType.Intrinsic) {
            switch (op.operation) {
                case Intrinsic.Plus:
                    await useMacro('plus');
                    break;
                case Intrinsic.Minus:
                    await useMacro('minus');
                    break;
                case Intrinsic.Multiply:
                    await useMacro('multiply');
                    break;
                case Intrinsic.DivMod:
                    await useMacro('divmod');
                    break;
                case Intrinsic.Print:
                    await useMacro('print');
                    break;
                case Intrinsic.Syscall1:
                    await useMacro('syscall1');
                    break;
                case Intrinsic.Syscall2:
                    await useMacro('syscall2');
                    break;
                case Intrinsic.Syscall3:
                    await useMacro('syscall3');
                    break;
                case Intrinsic.Syscall4:
                    await useMacro('syscall4');
                    break;
                case Intrinsic.Syscall5:
                    await useMacro('syscall5');
                    break;
                case Intrinsic.Syscall6:
                    await useMacro('syscall6');
                    break;
                case Intrinsic.Drop:
                    await useMacro('drop');
                    break;
                case Intrinsic.Dup:
                    await useMacro('dup');
                    break;
                case Intrinsic.Over:
                    await useMacro('over');
                    break;
                case Intrinsic.Swap:
                    await useMacro('swap');
                    break;
                case Intrinsic.Equal:
                    await useMacro('equal');
                    break;
                case Intrinsic.NotEqual:
                    await useMacro('notequal');
                    break;
                case Intrinsic.Load:
                    await useMacro('load8');
                    break;
                case Intrinsic.Store:
                    await useMacro('store8');
                    break;
                case Intrinsic.Load16:
                    await useMacro('load16');
                    break;
                case Intrinsic.Store16:
                    await useMacro('store16');
                    break;
                case Intrinsic.Load32:
                    await useMacro('load32');
                    break;
                case Intrinsic.Store32:
                    await useMacro('store32');
                    break;
                case Intrinsic.Load64:
                    await useMacro('load64');
                    break;
                case Intrinsic.Store64:
                    await useMacro('store64');
                    break;
                case Intrinsic.Here:
                    const loc = format('%s:%d:%d', ...op.location);
                    await write('    ;; here\n');
                    await write('    mov rax, %d\n', loc.length);
                    await write('    push rax\n');
                    await write('    push str_%s', getStringId(loc));
                    await write(' ;; ' + JSON.stringify(loc));
                    await write('\n');
                    break;
                case Intrinsic.Argv:
                    await useMacro('argv');
                    break;
                case Intrinsic.CastInt:
                    await useMacro('cast_int');
                    break;
                case Intrinsic.CastPtr:
                    await useMacro('cast_ptr');
                    break;
                case Intrinsic.fakeBool:
                    await useMacro('fake_bool');
                    break;
                case Intrinsic.fakeInt:
                    await useMacro('fake_int');
                    break;
                case Intrinsic.fakePtr:
                    await useMacro('fake_ptr');
                    break;
                case Intrinsic.fakeAny:
                    await useMacro('fake_any');
                    break;
                case Intrinsic.fakeDrop:
                    await useMacro('fake_drop');
                    break;
                case Intrinsic.CastBool:
                    await useMacro('cast_bool');
                    break;
                case Intrinsic.LessThan:
                    await useMacro('lessthan');
                    break;
                case Intrinsic.LessThanEqual:
                    await useMacro('lessthanequal');
                    break;
                case Intrinsic.GreaterThan:
                    await useMacro('greaterthan');
                    break;
                case Intrinsic.GreaterThanEqual:
                    await useMacro('greaterthanequal');
                    break;
                case Intrinsic.Rot:
                    await useMacro('rot');
                    break;
                case Intrinsic.Shr:
                    await useMacro('shr');
                    break;
                case Intrinsic.Shl:
                    await useMacro('shl');
                    break;
                case Intrinsic.Or:
                    await useMacro('or');
                    break;
                case Intrinsic.And:
                    await useMacro('and');
                    break;
                case Intrinsic.Xor:
                    await useMacro('xor');
                    break;
                case Intrinsic.Not:
                    await useMacro('not');
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
                    if (op.reference)
                        await useMacro('endj', op.reference.toString());
                    else await useMacro('end');
                    break;
                case Keyword.Else:
                    if (!op.reference)
                        return compilerError(
                            [op.location],
                            'No reference for this if-block defined. Probably a cross-referencing issue.'
                        );
                    await useMacro('eelse', op.reference.toString());
                    break;
                case Keyword.If:
                case Keyword.IfStar:
                    if (!op.reference)
                        return compilerError(
                            [op.location],
                            'No reference for this if-block defined. Probably a cross-referencing issue.'
                        );
                    await useMacro(
                        op.operation === Keyword.IfStar ? 'ifstar' : 'iff',
                        op.reference.toString()
                    );
                    break;
                case Keyword.While:
                    if (!op.reference)
                        return compilerError(
                            [op.location],
                            'No reference for this while-block defined. Probably a cross-referencing issue.'
                        );
                    await useMacro('whilee', op.reference.toString());
                    break;
                default:
                    assert(false, 'unreachable');
            }
        } else assert(false, 'unreachable');
    }

    if (req_addrs.includes(program.ops.length))
        await write('addr_%d:\n', program.ops.length);
    if (!dontRunFunctions) {
        await write('    ;; call all ___run_function__ functions\n');
        for (const f of program.functionsToRun)
            await useMacro('calladdr', f.toString());
    }

    if (!hasParameter(program.contracts[program.mainop].prep, '__nomain__'))
        if (program.contracts[program.mainop].outs.length < 1)
            await useMacro('exec_main_void');
        else await useMacro('exec_main_int');
    else {
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
    for (const [name, sz] of Object.entries(program.mems)) {
        if (usedMems.includes(name))
            await write('    mem_' + name + ': resb ' + sz + '\n');
    }

    for (const f of external) {
        await write('%include "%s"\n', JSON.stringify(join('', f)));
    }
    
    asmEnd();

    await out.close();

    const generatedMacros = generateMacros(used);
    await writeFile(
        join(filename.startsWith('/') ? '' : process.cwd(), filename + '.asm'),
        ';; -----------------------\n;; MACROS START\n;; -----------------------\n' +
            generatedMacros +
            '\n\n' +
            ';; -----------------------\n;; MACROS END\n;; -----------------------\n\n' +
            (
                await readFile(
                    join(
                        filename.startsWith('/') ? '' : process.cwd(),
                        filename + '.asm'
                    )
                )
            ).toString()
    );

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

function generateMacros(intrinsics_used: (keyof typeof macros)[]) {
    const usedMacros: string[] = [];
    for (const [k, m] of Object.entries(macros))
        if (intrinsics_used.includes(k as any)) usedMacros.push(m);

    return usedMacros.join('\n\n');
}

export const removeFiles: string[] = ['.o', '.asm'];
