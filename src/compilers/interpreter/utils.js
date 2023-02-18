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
        return Math.floor(Math.random() * int + 1);
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
})();
