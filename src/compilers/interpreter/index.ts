type Operation = {
    parameters?: string[];
} & (
    | {
          type: OpType.Intrinsic;
          operation: Intrinsic;
      }
    | {
          type: OpType.PushInt;
          operation: number;
      }
    | {
          type: OpType.Ret;
          panic?: string;
      }
    | {
          type: OpType.Call;
          operation: number;
          functionName: string;
          externalCall: boolean;
          ins: number;
          outs: number;
      }
    | {
          type: OpType.Keyword;
          reference?: number;
          operation: Keyword;
      }
    | {
          type: OpType.SkipFn;
          operation: number;
      }
    | {
          type: OpType.None;
      }
    | {
          type: OpType.PushStr;
          length: number;
          ptr: number;
      }
    | {
          type: OpType.Javascript;
          value: string;
      }
);
enum Intrinsic {
    Print,

    Plus,
    Minus,
    Multiply,
    DivMod,

    LessThan,
    LessThanEqual,
    GreaterThan,
    GreaterThanEqual,
    Equal,
    NotEqual,

    Drop,
    Dup,
    Over,
    Swap,
    Rot,

    Load,
    Store,

    Shl,
    Shr,
    Or,
    And,
    Not,
    Xor,
}
enum Keyword {
    If,
    End,
    Else,
    While,
    IfStar,
}
enum OpType {
    Intrinsic,
    Keyword,
    PushInt,
    SkipFn,
    Ret,
    Call,
    BindLet,
    None,
    PushStr,
    Javascript,
}

function printOperation(op: Operation) {
    if (op.type === OpType.Call)
        return console.info(
            'Call {name: %s, ip: %d, external: %s}',
            op.functionName,
            op.operation,
            op.externalCall
        );
    else if (op.type === OpType.Intrinsic)
        return console.info('Intrinsic {%s}', Intrinsic[op.operation]);
    else if (op.type === OpType.Keyword && op.reference !== undefined)
        return console.info('Keyword {%s}', Keyword[op.operation]);
    else if (op.type === OpType.Keyword)
        return console.info(
            'Keyword {%s, %d}',
            Keyword[op.operation],
            op.reference
        );
    else if (op.type === OpType.None) return;
    else if (op.type === OpType.PushInt)
        return console.info('PushInt {%d}', op.operation);
    else if (op.type === OpType.PushStr)
        return console.info(
            'PushStr {%s}',
            String.fromCharCode(
                ...(globalThis as any).__undefieddata__.memory.slice(
                    op.ptr,
                    op.ptr + op.length
                )
            )
        );
    else if (op.type === OpType.Ret) return console.info('Return');
    else if (op.type === OpType.SkipFn)
        return console.info('SkipFn {%d}', op.operation);
}

// Comment when compiling
// const operations: Operation[] = [
//     {
//         type: OpType.PushInt,
//         operation: 35,
//     },
//     {
//         type: OpType.PushInt,
//         operation: 34,
//     },
//     {
//         type: OpType.Intrinsic,
//         operation: Intrinsic.Plus,
//     },
//     {
//         type: OpType.Intrinsic,
//         operation: Intrinsic.Print,
//     },
//     {
//         type: OpType.None,
//     },
// ];
// Uncomment when compiling
const operations = (globalThis as any).__undefieddata__.operations;
const memory: number[] = (globalThis as any).__undefieddata__
    .memory as number[];
const memories: Record<string, number> = (globalThis as any).__undefieddata__
    .memories as Record<string, number>;
const run: number[] = (globalThis as any).__undefieddata__.run;
const stack: number[] = [];
const returnStack: number[] = [];
const undefiedProgramExports: Record<
    string,
    (...params: number[]) => Promise<number[]>
> = (globalThis as any).exports;
for (const e of (globalThis as any).__undefieddata__.exports as {
    name: string;
    ip: number;
}[])
    undefiedProgramExports[e.name] = generateFunction(e.ip, operations);

function resolveFunctionName(name: string): (...args: number[]) => any | any[] {
    const split = name.split('.');
    let obj = globalThis as any;

    for (let i = 0; i < split.length; i++) obj = obj?.[split[i]];

    if (obj === undefined || typeof obj !== 'function')
        throw new Error('No function with the name ' + name + ' was found!');

    return obj;
}

let stopRun = false;
(globalThis as any).killCurrentFunction = function killCurrentFunction() {
    stopRun = true;
};

class ExitError extends Error {
    exitCode;
    constructor(exitcode: number, message: string) {
        super(message);
        this.exitCode = exitcode;
    }
}

(ExitError as any) = (globalThis as any).ExitError as {
    new: (code: number, nessage: string) => { exitCode: number };
};

function interpret(
    operations: Operation[],
    ip: number,
    stack: number[]
): Promise<number[]> {
    return new Promise((res) => {
        async function nextInstruction() {
            try {
                let changed = false;
                const op = operations[ip];

                if (!op) throw new ExitError(0, 'No Intructions');

                if (op.type === OpType.PushInt) stack.push(op.operation);
                else if (op.type === OpType.Intrinsic) {
                    switch (op.operation) {
                        case Intrinsic.Print:
                            console.log(stack.pop()?.toString() + '\n');
                            changed = true;
                            break;
                        case Intrinsic.Plus:
                            stack.push((stack.pop() || 0) + (stack.pop() || 0));
                            break;
                        case Intrinsic.DivMod:
                            {
                                const [top, bottom] = [
                                    stack.pop() || 0,
                                    stack.pop() || 0,
                                ];
                                stack.push(
                                    Math.floor(bottom / top),
                                    bottom % top
                                );
                            }
                            break;
                        case Intrinsic.Minus:
                            {
                                const [top, bottom] = [
                                    stack.pop() || 0,
                                    stack.pop() || 0,
                                ];
                                stack.push(bottom - top);
                            }
                            break;
                        case Intrinsic.Multiply:
                            stack.push((stack.pop() || 0) * (stack.pop() || 0));
                            break;
                        case Intrinsic.Not:
                            stack.push(~(stack.pop() || 0));
                            break;
                        case Intrinsic.Or:
                            stack.push((stack.pop() || 0) | (stack.pop() || 0));
                            break;
                        case Intrinsic.Xor:
                            stack.push((stack.pop() || 0) ^ (stack.pop() || 0));
                            break;
                        case Intrinsic.Shl:
                            {
                                const [top, bottom] = [
                                    stack.pop() || 0,
                                    stack.pop() || 0,
                                ];
                                stack.push(bottom << top);
                            }
                            break;
                        case Intrinsic.Shr:
                            {
                                const [top, bottom] = [
                                    stack.pop() || 0,
                                    stack.pop() || 0,
                                ];
                                stack.push(bottom >> top);
                            }
                            break;
                        case Intrinsic.Drop:
                            stack.pop();
                            break;
                        case Intrinsic.Dup:
                            {
                                const val = stack.pop() || 0;
                                stack.push(val, val);
                            }
                            break;
                        case Intrinsic.Equal:
                            stack.push(
                                (stack.pop() || 0) === (stack.pop() || 0)
                                    ? 1
                                    : 0
                            );
                            break;
                        case Intrinsic.NotEqual:
                            stack.push(
                                (stack.pop() || 0) !== (stack.pop() || 0)
                                    ? 1
                                    : 0
                            );
                            break;
                        case Intrinsic.GreaterThan:
                            stack.push(
                                (stack.pop() || 0) < (stack.pop() || 0) ? 1 : 0
                            );
                            break;
                        case Intrinsic.GreaterThanEqual:
                            stack.push(
                                (stack.pop() || 0) <= (stack.pop() || 0) ? 1 : 0
                            );
                            break;
                        case Intrinsic.LessThan:
                            stack.push(
                                (stack.pop() || 0) > (stack.pop() || 0) ? 1 : 0
                            );
                            break;
                        case Intrinsic.LessThanEqual:
                            stack.push(
                                (stack.pop() || 0) >= (stack.pop() || 0) ? 1 : 0
                            );
                            break;
                        case Intrinsic.Load:
                            stack.push(memory[stack.pop() || 0]);
                            break;
                        case Intrinsic.Store:
                            {
                                const pointer = stack.pop() || 0;
                                const value = stack.pop() || 0;
                                memory[pointer] = value;
                            }
                            break;
                        case Intrinsic.Over:
                            {
                                const [top, bottom] = [
                                    stack.pop() || 0,
                                    stack.pop() || 0,
                                ];
                                stack.push(bottom, top, bottom);
                            }
                            break;
                        case Intrinsic.Swap:
                            {
                                const [top, bottom] = [
                                    stack.pop() || 0,
                                    stack.pop() || 0,
                                ];
                                stack.push(top, bottom);
                            }
                            break;
                        case Intrinsic.Rot:
                            {
                                const [a, b, c] = [
                                    stack.pop() || 0,
                                    stack.pop() || 0,
                                    stack.pop() || 0,
                                ];
                                stack.push(a, c, b);
                            }
                            break;
                        default:
                            throw new Error(
                                'Unreachable Intrinsic ' + op.operation
                            );
                    }
                } else if (op.type === OpType.SkipFn) ip = op.operation - 1;
                else if (op.type === OpType.Ret) {
                    if (op.panic !== undefined) throw new Error(op.panic);
                    if (returnStack.length > 0) ip = returnStack.pop() || 0;
                    else throw new ExitError(0, 'Return-based exit');
                } else if (op.type === OpType.Call) {
                    if (op.externalCall) {
                        changed = true;
                        const fn = resolveFunctionName(op.functionName);
                        const ins: number[] = [];

                        for (let i = 0; i < op.ins; i++)
                            ins.push(stack.pop() || 0);
                        const returnValue = await fn(...ins);
                        const outs =
                            returnValue === undefined
                                ? []
                                : returnValue instanceof Array
                                ? returnValue
                                : [returnValue];
                        if (outs.length !== op.outs)
                            throw new Error(
                                op.functionName +
                                    ' (external) does not return the desired amount of arguments (returned: ' +
                                    outs.length +
                                    ', desired: ' +
                                    op.outs +
                                    ')'
                            );
                        stack.push(...outs);
                    } else {
                        returnStack.push(ip);
                        ip = op.operation - 1;
                    }
                } else if (op.type === OpType.Keyword) {
                    switch (op.operation) {
                        case Keyword.End:
                            if (op.reference) ip = op.reference - 1;
                            break;
                        case Keyword.Else:
                            ip = (op.reference || 1) - 1;
                            break;
                        case Keyword.If:
                        case Keyword.IfStar:
                            if ((stack.pop() || 0) < 1)
                                ip = (op.reference || 1) - 1;
                            break;
                        case Keyword.While:
                            {
                                const val = stack.pop() || 0;
                                stack.push(val);
                                if (val < 1) ip = (op.reference || 1) - 1;
                            }
                            break;

                        default:
                            throw new Error('Unreachable (keywords)');
                    }
                } else if (op.type === OpType.None) {
                } else if (op.type === OpType.PushStr)
                    stack.push(op.length, op.ptr);
                else if (op.type === OpType.Javascript) {
                    try {
                        await eval(op.value)(stack);
                    } catch (e) {
                        console.error(
                            '\x1B[31mThe following Error occured in a javascript code-snippet:\n'
                        );
                        console.error(e);
                        console.error('\x1B[39m\n');
                        console.log(
                            'Code Snippet:\n',
                            op.value
                                .split('\n')
                                .map((el) => ' >  ' + el)
                                .join('\n'),
                            '\n'
                        );
                        throw e;
                    }
                } else throw new Error('Unreachable (optype)');
            } catch (e) {
                if (!e || !(e instanceof ExitError)) {
                    console.error(
                        '\n\x1B[31m[Program exited with -1: SYSERR]\n'
                    );
                    console.error(e, '\x1B[39m');
                } else {
                    if (e.exitCode === 0) {
                        if (e.message.length > 0)
                            console.log(
                                '\n[Program exited with 0: %s]',
                                e.message
                            );
                        else console.log('\n[Program exited with 0]');
                    } else {
                        if (e.message.length > 0)
                            console.error(
                                '\n\x1B[31m[Program exited with %d: %s]\x1B[39m',
                                e.exitCode,
                                e.message
                            );
                        else
                            console.error(
                                '\n\x1B[31m[Program exited with %d]\x1B[39m',
                                e.exitCode
                            );
                    }
                }
                return res(stack);
            }
            ip++;
            if (stopRun) {
                stopRun = false;
                throw new ExitError(1, 'SIGKILL');
            } else nextInstruction();
        }
        nextInstruction();
    });
}

function generateFunction(ip: number, operations: Operation[]) {
    return (...stack: number[]) => interpret(operations, ip, stack);
}

for (const r of run) interpret(operations, r, []);
if ((globalThis as any).__undefieddata__.mainop !== -1)
    // dont run when mainop is -1, as then nomain is set
    interpret(operations, (globalThis as any).__undefieddata__.mainop, stack);
