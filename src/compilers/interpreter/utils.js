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
