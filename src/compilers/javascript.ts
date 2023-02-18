import chalk from 'chalk';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { createServer } from 'http';
import path, { join } from 'path';
import { format } from 'util';
import { compilerError, error } from '../errors';
import {
    CompilerParameters,
    Contract,
    Intrinsic,
    OpType,
    Keyword,
} from '../types';
import { hasParameter } from '../utils/general';

interface UndefiedData {
    operations: any[];
    exports: { name: string; ip: number }[];
    memories: Record<string, number>;
    memory: number[];
    run: number[];
    mainop: number;
}

function pushInt(int: number) {
    return {
        type: 2, // OpType.PushInt
        operation: int,
    };
}
function ret(message?: string) {
    return {
        type: 4, // OpType.Ret
        panic: message,
    };
}
function call(contract: Contract) {
    return {
        type: 5, // OpType.Call
        operation: contract.prep.ip,
        functionName: contract.name,
        externalCall: !!contract.prep.parameters?.includes(
            '__provided_externally__'
        ),
        ins: contract.ins.length,
        outs: contract.outs.length,
    };
}
function skipFn(ip: number) {
    return {
        type: 3, // OpType.SkipFn
        operation: ip,
    };
}
function none() {
    return {
        type: 7, // OpType.None
    };
}
function pushStr(ptr: number, length: number) {
    return {
        type: 8, // OpType.PushStr
        length,
        ptr,
    };
}
function assembly(asm: string) {
    return {
        type: 9, // OpType.Assembly
        value: asm,
    };
}
function $intrinsic(intrinsic: number) {
    return function () {
        return {
            type: 0, // OpType.Intrinsic
            operation: intrinsic,
        };
    };
}
const intrinsic = {
    print: $intrinsic(0),

    plus: $intrinsic(1),
    minus: $intrinsic(2),
    multiply: $intrinsic(3),
    divmod: $intrinsic(4),

    lessThan: $intrinsic(5),
    lessThanEqual: $intrinsic(6),
    greaterThan: $intrinsic(7),
    greaterThanEqual: $intrinsic(8),
    equal: $intrinsic(9),
    notEqual: $intrinsic(10),

    drop: $intrinsic(11),
    dup: $intrinsic(12),
    over: $intrinsic(13),
    swap: $intrinsic(14),
    rot: $intrinsic(15),

    load: $intrinsic(16),
    store: $intrinsic(17),

    shr: $intrinsic(18),
    shl: $intrinsic(19),
    or: $intrinsic(20),
    and: $intrinsic(21),
    not: $intrinsic(22),
    xor: $intrinsic(23),
};
function $keyword(keyword: number) {
    return function (reference?: number) {
        return {
            type: 1, // OpType.Keyword
            operation: keyword,
            reference,
        };
    };
}
const keyword = {
    if: $keyword(0),
    end: $keyword(1),
    else: $keyword(2),
    while: $keyword(3),
    ifstar: $keyword(4),
};

export function compile({
    program,
    dontRunFunctions = false,
    external = [],
    filename,
}: CompilerParameters) {
    if (external.find((el) => !el.endsWith('.js')))
        error('You can only include .js files!');

    if (!program.mainop) error('No main function defined!');

    const data: UndefiedData = {
        operations: [],
        exports: [],
        memories: {},
        memory: [0],
        run: [],
        mainop: program.contracts[program.mainop]?.prep?.parameters?.includes(
            '__nomain__'
        )
            ? -1
            : program.mainop,
    };
    const strings: Record<string, number> = {};
    function getStr(str: string) {
        if (strings[str] !== undefined) return strings[str];
        else {
            const start = data.memory.length;
            for (let i = 0; i < str.length; i++)
                data.memory[start + i] = str[i].charCodeAt(0);
            return (strings[str] = start);
        }
    }
    function useMemory(name: string, sz: number) {
        if (data.memories[name] !== undefined) return data.memories[name];
        else {
            const start = data.memory.length;
            for (let i = 0; i < sz; i++) data.memory[start + i] = 0;
            return (data.memories[name] = start);
        }
    }

    let prevLength = -1;
    for (const op of program.ops) {
        if (prevLength + 1 !== data.operations.length)
            throw new Error(
                data.operations.length +
                    ' ' +
                    prevLength +
                    JSON.stringify(program.ops[op.ip - 1])
            );
        prevLength++;
        if (op.type === OpType.Call)
            data.operations.push(call(program.contracts[op.operation]));
        else if (op.type === OpType.Comment) data.operations.push(none());
        else if (op.type === OpType.Const)
            data.operations.push(pushInt(op.operation));
        else if (op.type === OpType.PrepFn) {
            if (
                op.functionName === 'main' &&
                data.operations.length !== program.mainop
            )
                throw new Error(
                    'Actual ip does not match the predef ip ' +
                        data.operations.length +
                        ' | ' +
                        program.mainop
                );
            if (op.parameters?.includes('__export__'))
                data.exports.push({ name: op.functionName, ip: op.ip });
            if (
                op.parameters?.includes('__run_function__') &&
                !dontRunFunctions
            )
                data.run.push(op.ip);
            data.operations.push(none());
        } else if (op.type === OpType.PushAsm)
            if (!hasParameter(op, '__supports_javascript__'))
                compilerError(
                    [op.location],
                    'This assembly does not seem to be supporting the current target (missing: __supports_javascript__)'
                );
            else data.operations.push(assembly('(async function(stack) {' + op.operation + '})'));
        else if (op.type === OpType.PushCString)
            data.operations.push(pushInt(getStr(op.operation + '\x00')));
        else if (op.type === OpType.PushInt)
            data.operations.push(pushInt(op.operation));
        else if (op.type === OpType.PushMem)
            data.operations.push(
                pushInt(
                    useMemory(op.operation, program.mems[op.operation].size)
                )
            );
        else if (op.type === OpType.PushString)
            data.operations.push(
                pushStr(getStr(op.operation), op.operation.length)
            );
        else if (op.type === OpType.Ret) {
            if (
                program.ops[op.operation].parameters?.includes(
                    '__function_exits__'
                )
            )
                data.operations.push(
                    ret(
                        chalk.red(
                            `PANIC: ${
                                program.contracts[op.operation].name
                            } returned even tho it was marked as __function_exits__. Return at ${
                                op.location[0]
                            }:${op.location[1]}:${op.location[2]}`
                        )
                    )
                );
            else data.operations.push(ret());
        } else if (op.type === OpType.SkipFn)
            data.operations.push(skipFn(op.operation));
        else if (op.type === OpType.Intrinsic) {
            switch (op.operation) {
                case Intrinsic.And:
                    data.operations.push(intrinsic.and());
                    break;
                case Intrinsic.Argv:
                    compilerError(
                        [op.location],
                        'Javascript does not support argv!'
                    );
                case Intrinsic.CastBool:
                case Intrinsic.CastInt:
                case Intrinsic.CastPtr:
                case Intrinsic.fakeAny:
                case Intrinsic.fakeBool:
                case Intrinsic.fakePtr:
                case Intrinsic.fakeInt:
                case Intrinsic.fakeDrop:
                case Intrinsic.None:
                    data.operations.push(none());
                    break;
                case Intrinsic.DivMod:
                    data.operations.push(intrinsic.divmod());
                    break;
                case Intrinsic.Drop:
                    data.operations.push(intrinsic.drop());
                    break;
                case Intrinsic.Dup:
                    data.operations.push(intrinsic.dup());
                    break;
                case Intrinsic.Equal:
                    data.operations.push(intrinsic.equal());
                    break;
                case Intrinsic.GreaterThan:
                    data.operations.push(intrinsic.greaterThan());
                    break;
                case Intrinsic.GreaterThanEqual:
                    data.operations.push(intrinsic.greaterThanEqual());
                    break;
                case Intrinsic.Here:
                    {
                        const loc = format('%s:%d:%d', ...op.location);
                        data.operations.push(pushStr(getStr(loc), loc.length));
                    }
                    break;
                case Intrinsic.LessThan:
                    data.operations.push(intrinsic.lessThan());
                    break;
                case Intrinsic.LessThanEqual:
                    data.operations.push(intrinsic.lessThanEqual());
                    break;
                case Intrinsic.Load:
                case Intrinsic.Load16:
                case Intrinsic.Load32:
                case Intrinsic.Load64:
                    data.operations.push(intrinsic.load());
                    break;
                case Intrinsic.Store:
                case Intrinsic.Store16:
                case Intrinsic.Store32:
                case Intrinsic.Store64:
                    data.operations.push(intrinsic.store());
                    break;
                case Intrinsic.Minus:
                    data.operations.push(intrinsic.minus());
                    break;
                case Intrinsic.Multiply:
                    data.operations.push(intrinsic.multiply());
                    break;
                case Intrinsic.Not:
                    data.operations.push(intrinsic.not());
                    break;
                case Intrinsic.NotEqual:
                    data.operations.push(intrinsic.notEqual());
                    break;
                case Intrinsic.Or:
                    data.operations.push(intrinsic.or());
                    break;
                case Intrinsic.Over:
                    data.operations.push(intrinsic.over());
                    break;
                case Intrinsic.Plus:
                    data.operations.push(intrinsic.plus());
                    break;
                case Intrinsic.Print:
                    data.operations.push(intrinsic.print());
                    break;
                case Intrinsic.Rot:
                    data.operations.push(intrinsic.rot());
                    break;
                case Intrinsic.Shl:
                    data.operations.push(intrinsic.shl());
                    break;
                case Intrinsic.Shr:
                    data.operations.push(intrinsic.shr());
                    break;
                case Intrinsic.StackInfo:
                    data.operations.push(none());
                    break;
                case Intrinsic.Swap:
                    data.operations.push(intrinsic.swap());
                    break;
                case Intrinsic.Syscall1:
                case Intrinsic.Syscall2:
                case Intrinsic.Syscall3:
                case Intrinsic.Syscall4:
                case Intrinsic.Syscall5:
                case Intrinsic.Syscall6:
                    compilerError(
                        [op.location],
                        'syscall' +
                            (op.type - 17) +
                            ' is not allowed in Javascript compile target'
                    );
                    break;
                case Intrinsic.Xor:
                    data.operations.push(intrinsic.xor());
                    break;

                default:
                    throw new Error('Unreachable');
            }
        } else if (op.type === OpType.Keyword) {
            if (op.operation === Keyword.Else)
                data.operations.push(keyword.else(op.reference));
            else if (op.operation === Keyword.End)
                data.operations.push(keyword.end(op.reference));
            else if (op.operation === Keyword.If)
                data.operations.push(keyword.if(op.reference));
            else if (op.operation === Keyword.IfStar)
                data.operations.push(keyword.ifstar(op.reference));
            else if (op.operation === Keyword.While)
                data.operations.push(keyword.while(op.reference));
            else error('Unreachable (keyword)');
        }
    }

    const browserjs =
        '// ExitError\n' +
        'class ExitError extends Error {exitCode;constructor(exitcode, message) {super(message);this.exitCode = exitcode;}}\nglobalThis.ExitError = ExitError;\n' +
        '\n// Console Environment Setup\n' +
        readFileSync(join(__filename, '../interpreter/console.js')) +
        '\n\n// Syscall Support\n' +
        readFileSync(join(__filename, '../interpreter/syscall.js')) +
        '\n\n// Compiled Data\nglobalThis.exports={};globalThis.__undefieddata__ = ' +
        JSON.stringify(data) +
        ';\n\n' +
        readFileSync(join(__filename, '../interpreter/utils.js')) +
        '\n\n\n' +
        external
            .map(
                (el) =>
                    '// Included File ' +
                    path.basename(el) +
                    '\n' +
                    readFileSync(el).toString()
            )
            .join('\n\n\n') +
        '\n\n\n// Interpreter\n\nfunction runUndefiedCode() {' +
        readFileSync(join(__filename, '../interpreter/index.js')).toString() +
        '\n}\nsetTimeout(runUndefiedCode, 50);';

    const nodeJS =
        '\n\n// Syscall Support\n' +
        readFileSync(join(__filename, '../interpreter/syscall.js')) +
        '\n\n// Compiled Data\nglobalThis.exports={};globalThis.__undefieddata__ = ' +
        JSON.stringify(data) +
        ';\n\n' +
        readFileSync(join(__filename, '../interpreter/utils.js')) +
        '\n\n\n' +
        external
            .map(
                (el) =>
                    '// Included File ' +
                    path.basename(el) +
                    '\n' +
                    readFileSync(el).toString()
            )
            .join('\n\n\n') +
        '\n\n\n// Interpreter\n\nfunction runUndefiedCode() {' +
        readFileSync(join(__filename, '../interpreter/index.js')).toString() +
        '\n}\nsetTimeout(runUndefiedCode, 50);';

    writeFileSync(filename + '.js', nodeJS);
    writeFileSync(filename + '.html', makeHTML(browserjs));
}

export const removeFiles = [];
export function runProgram(file: string, args: string[]) {
    if (args[0] === '--node' || args[0] === '-node') {
        const proc = spawn('node', [file + '.js']);
        proc.stderr.pipe(process.stderr);
        proc.stdout.pipe(process.stdout);
        proc.stdin.pipe(process.stdin);
        proc.on('close', process.exit);
        proc.on('error', process.exit);
        proc.on('exit', process.exit);
        return;
    }
    const html = readFileSync(file + '.html');

    try {
        createServer((req, res) => {
            res.write(html);
            res.end();
        }).listen(8080, () =>
            console.log(
                chalk.green(
                    'Server running on ' + chalk.bold('http://localhost:8080\n')
                )
            )
        );
    } catch {
        error('Could not start http server on port 8080');
    }
}

function makeHTML(js: string) {
    return (
        '<!DOCTYPE html><html lang="en"><head><title>Undefied Javascript Runtime</title></head><body><script>' +
        js +
        '</script></body></html>'
    );
}
