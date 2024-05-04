globalThis.devmode = false;

// ExitError
class ExitError extends Error {exitCode;constructor(exitcode, message) {super(message);this.exitCode = exitcode;}}
globalThis.ExitError = ExitError;

// Syscall Support
(function () {
    const exitError = globalThis.ExitError;

    function SC_exit(int) {
        throw new exitError(int);
    }

    const arr = [SC_exit];
    for (const el of arr) globalThis[el.name] = el;
})();


// Compiled Data
globalThis.exports={};globalThis.__undefieddata__ = {"operations":[{"type":7},{"type":7},{"type":3,"operation":5},{"type":7},{"type":4},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":7},{"type":3,"operation":450},{"type":7},{"type":8,"length":9,"ptr":1},{"type":7},{"type":2,"operation":1},{"type":5,"operation":3,"functionName":"fputs","externalCall":true,"ins":3,"outs":0},{"type":7},{"type":4}],"exports":[],"memories":{},"memory":[0,72,101,119,119,111,32,58,51,10],"run":[],"mainop":443};

// Util functions for javascript
(function () {
    const utils = (globalThis.undefiedutils = {});
    const memory = __undefieddata__.memory;
    const isNode = globalThis.process !== undefined;

    utils.readMemory = function readMemory(offset, length) {
        return memory.slice(offset, offset + length);
    };

    utils.writeMemory = function writeMemory(offset, length, data) {
        if (data.length !== length)
            throw new Error('The data array length has to be equal to length');
        for (let i = 0; i < length; i++) memory[offset + i] = data[i];
    };

    utils.free = function free(ptr) {
        const size = memory[ptr - 1];
        for (let i = 0; i < size; i++) delete memory[memory.length - 1 - i];
    };

    utils.malloc = function malloc(sz) {
        if (sz === 0) return -1;
        memory[memory.length] = sz + 1;
        const ptr = memory.length;
        for (let i = 0; i < sz; i++) memory[ptr + i] = 0;
        return ptr;
    };

    utils.toUndefiedStr = function toUndefiedStr(str) {
        const ptr = malloc(str.length);
        utils.writeMemory(
            ptr,
            str.length,
            Object.values(str).map((el) => el.charCodeAt(0))
        );
        return [str.length, ptr];
    };

    utils.panic = function panic(str) {
        console.log('\x1B[31m%s\x1B[39m', str);
        throw new window.ExitError(1);
    };

    utils.color_r = function r(color = 0) {
        return Number((BigInt(color) & 4278190080n) >> 24n);
    };
    utils.color_g = function g(color = 0) {
        return Number((BigInt(color) & 16711680n) >> 16n);
    };
    utils.color_b = function b(color = 0) {
        return Number((BigInt(color) & 65280n) >> 8n);
    };
    utils.color_a = function a(color = 0) {
        return Number(BigInt(color) & 255n); // extract the first byte of the 4-byte color
    };
    utils.rgbaToRgbaArray = function rgbaToRgbaArray(color = 0) {
        return [utils.color_r(color), utils.color_g(color), utils.color_b(color), utils.color_a(color)];
    };
    utils.rgba = function rgba(r = 0, g = 0, b = 0, a = 0) {
        if (r > 255) r = 255;
        if (r < 0) r = 0;
        if (g > 255) g = 255;
        if (g < 0) g = 0;
        if (b > 255) b = 255;
        if (b < 0) b = 0;
        if (a > 255) a = 255;
        if (a < 0) a = 0;
        return (
            (BigInt(r) << 24n) |
            (BigInt(g) << 16n) |
            (BigInt(b) << 8n) |
            BigInt(a)
        );
    };
})();

// Util functions for undefied

(function () {
    function exportFn(fn, name) {
        name ||= fn.name;
        if (globalThis[name] !== undefined)
            throw new Error('globalThis.' + name + ' is already defined!');
        globalThis[name] = fn;
    }

    const utils = globalThis.undefiedutils;
    const memory = __undefieddata__.memory;
    const isNode = globalThis.process !== undefined;

    const requestFrame =
        globalThis.requestAnimationFrame ||
        ((fn) => globalThis.setTimeout(fn, 1));
    let input = isNode ? () => 'input is not yet setup' : prompt;
    if (isNode) {
        const util = require('util');
        const readline = require('readline/promises');
        console.log = function log(...args) {
            process.stdout.write(util.format(...args));
        };
        console.error = function error(...args) {
            process.stderr.write(util.format(...args));
        };
        input = async function prompt(text = '') {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            const result = await rl.question(
                text.length > 0 ? text + ': ' : ''
            );
            rl.close();
            return result;
        };
    }

    let changes = 0;
    globalThis.bufferLength ||= 10;

    function toString(ptr, length) {
        return String.fromCharCode(...utils.readMemory(ptr, length));
    }

    function malloc(sz) {
        return utils.malloc(sz);
    }

    function free(sz) {
        return utils.free(sz);
    }

    let buffer = '';

    function fputs(fd, ptr, length) {
        changes++;
        if (fd !== 2 && fd !== 1)
            throw new Error(
                'fputs called with a file descriptor other than 1 or 2 (' +
                    fd +
                    ')'
            );
        buffer += toString(ptr, length);
        if (changes > globalThis.bufferLength) {
            changes = 0;
            if (buffer.length > 0) console.log(buffer);
            buffer = '';
            return new Promise((r) => requestFrame(() => r()));
        }
    }

    function fromJSString(str) {
        return utils.toUndefiedStr(str);
    }
    function fromJSStringCstr(str) {
        return utils.toUndefiedStr(
            str.endsWith('\x00') ? str : str + '\x00'
        )[1];
    }

    async function readLine() {
        changes = 0;
        if (buffer.length > 0) console.log(buffer);
        buffer = '';
        await new Promise((r) => requestFrame(r));
        const str = (await input()) || '';
        return fromJSString(str);
    }

    async function readPrompt(ptr, length) {
        changes = 0;
        if (buffer.length > 0) console.log(buffer);
        buffer = '';
        await new Promise((r) => requestFrame(r));
        const str = (await input(toString(ptr, length))) || '';
        return fromJSString(str);
    }
    function awaitNextRender() {
        changes = 0;
        if (buffer.length > 0) console.log(buffer);
        buffer = '';
        return new Promise((r) => requestFrame(() => r()));
    }
    function sleep(time) {
        return new Promise((r) => setTimeout(() => r(), time));
    }
    function random(int) {
        return Math.floor(Math.random() * (int + 1));
    }

    // CANVAS STUFF
    let ctx;

    function canvasInitialize(w, h) {
        canvas.width = w;
        canvas.height = h;
        ctx = canvas.getContext('2d');
    }

    function useCtx() {
        if (!ctx)
            utils.panic(
                'The Canvas is not yet set up (Call Canvas::Initalize with width and height)'
            );
    }

    function putCanvas(ptr, w, h) {
        useCtx();
        if (w > canvas.width)
            utils.panic(
                'The specified width is greather than the canvas width!'
            );
        if (h > canvas.height)
            utils.panic(
                'The specified height is greather than the canvas height!'
            );
        const array = memory.slice(ptr, ptr + w * h);
        if (array.length !== w * h)
            utils.panic('The Array is not properly set up');
        const buf = new Uint8ClampedArray(array.length * 4);
        for (let i = 0; i < array.length; i++) {
            const [r, g, b, a] = utils.rgbaToRgbaArray(memory[ptr+i]);
            buf[i * 4 + 0] = r;
            buf[i * 4 + 1] = g;
            buf[i * 4 + 2] = b;
            buf[i * 4 + 3] = a;
        }

        ctx.putImageData(new ImageData(buf, w), 0, 0);
    }

    function getSize() {
        return [globalThis.canvas.width, globalThis.canvas.height];
    }
    function getWidth() {
        return globalThis.canvas.width;
    }
    function getHeight() {
        return globalThis.canvas.height;
    }

    exportFn(toString, 'Str::toJSString');
    exportFn(free);
    exportFn(malloc);
    exportFn(fputs);
    exportFn(fromJSString, 'Str::fromJSString');
    exportFn(fromJSStringCstr, 'CStr::fromJSString');
    exportFn(readPrompt);
    exportFn(readLine);
    exportFn(awaitNextRender);
    exportFn(sleep);
    exportFn(random);
    exportFn(getSize);
    exportFn(getWidth);
    exportFn(getHeight);
    exportFn(canvasInitialize, 'Canvas::Initialize');
    exportFn(putCanvas, 'Canvas::PutData');
})();






// Interpreter

function runUndefiedCode() {"use strict";
var Intrinsic;
(function (Intrinsic) {
    Intrinsic[Intrinsic["Print"] = 0] = "Print";
    Intrinsic[Intrinsic["Plus"] = 1] = "Plus";
    Intrinsic[Intrinsic["Minus"] = 2] = "Minus";
    Intrinsic[Intrinsic["Multiply"] = 3] = "Multiply";
    Intrinsic[Intrinsic["DivMod"] = 4] = "DivMod";
    Intrinsic[Intrinsic["LessThan"] = 5] = "LessThan";
    Intrinsic[Intrinsic["LessThanEqual"] = 6] = "LessThanEqual";
    Intrinsic[Intrinsic["GreaterThan"] = 7] = "GreaterThan";
    Intrinsic[Intrinsic["GreaterThanEqual"] = 8] = "GreaterThanEqual";
    Intrinsic[Intrinsic["Equal"] = 9] = "Equal";
    Intrinsic[Intrinsic["NotEqual"] = 10] = "NotEqual";
    Intrinsic[Intrinsic["Drop"] = 11] = "Drop";
    Intrinsic[Intrinsic["Dup"] = 12] = "Dup";
    Intrinsic[Intrinsic["Over"] = 13] = "Over";
    Intrinsic[Intrinsic["Swap"] = 14] = "Swap";
    Intrinsic[Intrinsic["Rot"] = 15] = "Rot";
    Intrinsic[Intrinsic["Load"] = 16] = "Load";
    Intrinsic[Intrinsic["Store"] = 17] = "Store";
    Intrinsic[Intrinsic["Shl"] = 18] = "Shl";
    Intrinsic[Intrinsic["Shr"] = 19] = "Shr";
    Intrinsic[Intrinsic["Or"] = 20] = "Or";
    Intrinsic[Intrinsic["And"] = 21] = "And";
    Intrinsic[Intrinsic["Not"] = 22] = "Not";
    Intrinsic[Intrinsic["Xor"] = 23] = "Xor";
})(Intrinsic || (Intrinsic = {}));
var Keyword;
(function (Keyword) {
    Keyword[Keyword["If"] = 0] = "If";
    Keyword[Keyword["End"] = 1] = "End";
    Keyword[Keyword["Else"] = 2] = "Else";
    Keyword[Keyword["While"] = 3] = "While";
    Keyword[Keyword["IfStar"] = 4] = "IfStar";
})(Keyword || (Keyword = {}));
var OpType;
(function (OpType) {
    OpType[OpType["Intrinsic"] = 0] = "Intrinsic";
    OpType[OpType["Keyword"] = 1] = "Keyword";
    OpType[OpType["PushInt"] = 2] = "PushInt";
    OpType[OpType["SkipFn"] = 3] = "SkipFn";
    OpType[OpType["Ret"] = 4] = "Ret";
    OpType[OpType["Call"] = 5] = "Call";
    OpType[OpType["BindLet"] = 6] = "BindLet";
    OpType[OpType["None"] = 7] = "None";
    OpType[OpType["PushStr"] = 8] = "PushStr";
    OpType[OpType["Javascript"] = 9] = "Javascript";
})(OpType || (OpType = {}));
function printOperation(op) {
    if (op.type === OpType.Call)
        return console.info('Call {name: %s, ip: %d, external: %s}', op.functionName, op.operation, op.externalCall);
    else if (op.type === OpType.Intrinsic)
        return console.info('Intrinsic {%s}', Intrinsic[op.operation]);
    else if (op.type === OpType.Keyword && op.reference !== undefined)
        return console.info('Keyword {%s}', Keyword[op.operation]);
    else if (op.type === OpType.Keyword)
        return console.info('Keyword {%s, %d}', Keyword[op.operation], op.reference);
    else if (op.type === OpType.None)
        return;
    else if (op.type === OpType.PushInt)
        return console.info('PushInt {%d}', op.operation);
    else if (op.type === OpType.PushStr)
        return console.info('PushStr {%s}', String.fromCharCode(...globalThis.__undefieddata__.memory.slice(op.ptr, op.ptr + op.length)));
    else if (op.type === OpType.Ret)
        return console.info('Return');
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
const operations = globalThis.__undefieddata__.operations;
const memory = globalThis.__undefieddata__
    .memory;
const memories = globalThis.__undefieddata__
    .memories;
const run = globalThis.__undefieddata__.run;
const stack = [];
const returnStack = [];
const undefiedProgramExports = globalThis.exports;
for (const e of globalThis.__undefieddata__.exports)
    undefiedProgramExports[e.name] = generateFunction(e.ip, operations);
function resolveFunctionName(name) {
    const split = name.split('.');
    let obj = globalThis;
    for (let i = 0; i < split.length; i++)
        obj = obj?.[split[i]];
    if (obj === undefined || typeof obj !== 'function')
        throw new Error('No function with the name ' + name + ' was found!');
    return obj;
}
let stopRun = false;
globalThis.killCurrentFunction = function killCurrentFunction() {
    stopRun = true;
};
class ExitError extends Error {
    exitCode;
    constructor(exitcode, message) {
        super(message);
        this.exitCode = exitcode;
    }
}
ExitError = globalThis.ExitError;
let firstRun = true;
function interpret(operations, ip, stack) {
    const printExit = firstRun;
    firstRun = false;
    let time = Date.now();
    return new Promise((res, rej) => {
        async function nextInstruction() {
            try {
                let changed = false;
                const op = operations[ip];
                if (!op)
                    throw new ExitError(0, 'No Intructions');
                if (globalThis.devmode && op.type !== OpType.None)
                    printOperation(op);
                if (op.type === OpType.PushInt)
                    stack.push(op.operation);
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
                                stack.push(Math.floor(bottom / top), bottom % top);
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
                            stack.push((stack.pop() || 0) === (stack.pop() || 0)
                                ? 1
                                : 0);
                            break;
                        case Intrinsic.NotEqual:
                            stack.push((stack.pop() || 0) !== (stack.pop() || 0)
                                ? 1
                                : 0);
                            break;
                        case Intrinsic.GreaterThan:
                            stack.push((stack.pop() || 0) < (stack.pop() || 0) ? 1 : 0);
                            break;
                        case Intrinsic.GreaterThanEqual:
                            stack.push((stack.pop() || 0) <= (stack.pop() || 0) ? 1 : 0);
                            break;
                        case Intrinsic.LessThan:
                            stack.push((stack.pop() || 0) > (stack.pop() || 0) ? 1 : 0);
                            break;
                        case Intrinsic.LessThanEqual:
                            stack.push((stack.pop() || 0) >= (stack.pop() || 0) ? 1 : 0);
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
                            throw new Error('Unreachable Intrinsic ' + op.operation);
                    }
                }
                else if (op.type === OpType.SkipFn)
                    ip = op.operation - 1;
                else if (op.type === OpType.Ret) {
                    if (op.panic !== undefined) {
                        console.log('\x1B[31m%s\x1B[39m', op.panic);
                        throw new Error(op.panic);
                    }
                    if (returnStack.length > 0)
                        ip = returnStack.pop() || 0;
                    else
                        throw new ExitError(0, 'Return-based exit');
                }
                else if (op.type === OpType.Call) {
                    if (op.externalCall) {
                        changed = true;
                        const fn = resolveFunctionName(op.functionName);
                        const ins = [];
                        for (let i = 0; i < op.ins; i++)
                            ins.push(stack.pop() || 0);
                        const returnValue = await fn(...ins);
                        const outs = returnValue === undefined
                            ? []
                            : returnValue instanceof Array
                                ? returnValue
                                : [returnValue];
                        if (outs.length !== op.outs)
                            throw new Error(op.functionName +
                                ' (external) does not return the desired amount of arguments (returned: ' +
                                outs.length +
                                ', desired: ' +
                                op.outs +
                                ')');
                        stack.push(...outs);
                    }
                    else {
                        returnStack.push(ip);
                        ip = op.operation - 1;
                    }
                }
                else if (op.type === OpType.Keyword) {
                    switch (op.operation) {
                        case Keyword.End:
                            if (op.reference)
                                ip = op.reference - 1;
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
                                if (val < 1)
                                    ip = (op.reference || 1) - 1;
                            }
                            break;
                        default:
                            throw new Error('Unreachable (keywords)');
                    }
                }
                else if (op.type === OpType.None) {
                }
                else if (op.type === OpType.PushStr)
                    stack.push(op.length, op.ptr);
                else if (op.type === OpType.Javascript) {
                    try {
                        await eval(op.value)(stack);
                    }
                    catch (e) {
                        console.error('\x1B[31mThe following Error occured in a javascript code-snippet:\n');
                        console.error(e);
                        console.error('\x1B[39m\n');
                        console.log('Code Snippet:\n', op.value
                            .split('\n')
                            .map((el) => ' >  ' + el)
                            .join('\n'), '\n');
                        throw e;
                    }
                }
                else
                    throw new Error('Unreachable (optype)');
            }
            catch (e) {
                await globalThis.awaitNextRender();
                if (printExit) {
                    if (!e || !(e instanceof ExitError)) {
                        console.error('\n\x1B[31m[Program exited with -1: SYSERR]\n');
                        console.error(e, '\x1B[39m');
                        return rej(e);
                    }
                    else {
                        if (e.exitCode === 0) {
                            if (e.message.length > 0)
                                console.log('\n[Program exited with 0: %s]', e.message);
                            else
                                console.log('\n[Program exited with 0]');
                        }
                        else {
                            if (e.message.length > 0)
                                console.error('\n\x1B[31m[Program exited with %d: %s]\x1B[39m', e.exitCode, e.message);
                            else
                                console.error('\n\x1B[31m[Program exited with %d]\x1B[39m', e.exitCode);
                        }
                    }
                    return res(stack);
                }
                else {
                    if (!e || !(e instanceof ExitError))
                        return rej(e);
                    else
                        return res(stack);
                }
                return rej(e);
            }
            ip++;
            if (stopRun) {
                stopRun = false;
                await globalThis.awaitNextRender();
                if (printExit) {
                    console.error('\n\x1B[31m[Program exited with -1: SIGKILL]\n\x1B[39m');
                }
                return rej(new ExitError(1, 'SIGKILL'));
            }
            else if (Date.now() - time > 16)
                requestAnimationFrame(nextInstruction);
            else
                return await nextInstruction();
        }
        nextInstruction();
    }).then((value) => !globalThis.process
        ? globalThis.awaitNextRender().then(() => value)
        : value);
}
function generateFunction(ip, operations) {
    return (...stack) => interpret(operations, ip, [...stack].reverse());
}
globalThis.__undefiedinterpreter__ = {
    interpret,
    generateFunction,
    operations,
};
(async function () {
    for (const r of run)
        await interpret(operations, r, []);
    if (globalThis.__undefieddata__.mainop !== -1)
        // dont run when mainop is -1, as then nomain is set
        await interpret(operations, globalThis.__undefieddata__.mainop, stack);
})();

}
setTimeout(runUndefiedCode, 50);