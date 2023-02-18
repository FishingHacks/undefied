(() => {
    // NODE UTILS START

    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.
    //#region utilcode
    var formatRegExp = /%[sdj%]/g;
    function format(f) {
        if (!isString(f)) {
            var objects = [];
            for (var i = 0; i < arguments.length; i++) {
                if (typeof arguments[i] === 'object') {
                    objects.push(inspect(arguments[i]));
                } else objects.push(arguments[i].toString());
            }
            return objects.join(' ');
        }

        var i = 1;
        var args = arguments;
        var len = args.length;
        var str = String(f).replace(formatRegExp, function (x) {
            if (x === '%%') return '%';
            if (i >= len) return x;
            switch (x) {
                case '%s':
                    return String(args[i++]);
                case '%d':
                    return Number(args[i++]);
                case '%j':
                    try {
                        return JSON.stringify(args[i++]);
                    } catch (_) {
                        return '[Circular]';
                    }
                default:
                    return x;
            }
        });
        for (var x = args[i]; i < len; x = args[++i]) {
            if (isNull(x) || !isObject(x)) {
                str += ' ' + x;
            } else {
                str += ' ' + inspect(x);
            }
        }
        return str;
    }
    function inspect(obj) {
        // default options
        var ctx = {
            seen: [],
            stylize: stylizeWithColor,
            depth: 10,
            colors: true,
            showHidden: false,
        };
        return formatValue(ctx, obj, ctx.depth);
    }
    inspect.colors = {
        bold: [1, 22],
        italic: [3, 23],
        underline: [4, 24],
        inverse: [7, 27],
        white: [37, 39],
        grey: [90, 39],
        black: [30, 39],
        blue: [34, 39],
        cyan: [36, 39],
        green: [32, 39],
        magenta: [35, 39],
        red: [31, 39],
        yellow: [33, 39],
    };
    inspect.styles = {
        special: 'cyan',
        number: 'yellow',
        boolean: 'yellow',
        undefined: 'grey',
        null: 'bold',
        string: 'green',
        date: 'magenta',
        // "name": intentionally not styling
        regexp: 'red',
    };
    function stylizeWithColor(str, styleType) {
        var style = inspect.styles[styleType];

        if (style) {
            return (
                '\u001b[' +
                inspect.colors[style][0] +
                'm' +
                str +
                '\u001b[' +
                inspect.colors[style][1] +
                'm'
            );
        } else {
            return str;
        }
    }
    function arrayToHash(array) {
        var hash = {};

        array.forEach(function (val, idx) {
            hash[val] = true;
        });

        return hash;
    }
    function formatValue(ctx, value, recurseTimes) {
        // Primitive types cannot have properties
        var primitive = formatPrimitive(ctx, value);
        if (primitive) {
            return primitive;
        }

        // Look up the keys of the object.
        var keys = Object.keys(value);
        var visibleKeys = arrayToHash(keys);

        if (ctx.showHidden) {
            keys = Object.getOwnPropertyNames(value);
        }

        // IE doesn't make error fields non-enumerable
        // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
        if (
            isError(value) &&
            (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)
        ) {
            return formatError(value);
        }

        // Some type of object without properties can be shortcutted.
        if (keys.length === 0) {
            if (isFunction(value)) {
                var name = value.name ? ': ' + value.name : '';
                return ctx.stylize('[Function' + name + ']', 'special');
            }
            if (isRegExp(value)) {
                return ctx.stylize(
                    RegExp.prototype.toString.call(value),
                    'regexp'
                );
            }
            if (isDate(value)) {
                return ctx.stylize(Date.prototype.toString.call(value), 'date');
            }
            if (isError(value)) {
                return formatError(value);
            }
        }

        var base = '',
            array = false,
            braces = ['{', '}'];

        // Make Array say that they are Array
        if (isArray(value)) {
            array = true;
            braces = ['[', ']'];
        }

        // Make functions say that they are functions
        if (isFunction(value)) {
            var n = value.name ? ': ' + value.name : '';
            base = ' [Function' + n + ']';
        }

        // Make RegExps say that they are RegExps
        if (isRegExp(value)) {
            base = ' ' + RegExp.prototype.toString.call(value);
        }

        // Make dates with properties first say the date
        if (isDate(value)) {
            base = ' ' + Date.prototype.toUTCString.call(value);
        }

        // Make error with message first say the error
        if (isError(value)) {
            base = ' ' + formatError(value);
        }

        if (keys.length === 0 && (!array || value.length == 0)) {
            return braces[0] + base + braces[1];
        }

        if (recurseTimes < 0) {
            if (isRegExp(value)) {
                return ctx.stylize(
                    RegExp.prototype.toString.call(value),
                    'regexp'
                );
            } else {
                return ctx.stylize('[Object]', 'special');
            }
        }

        ctx.seen.push(value);

        var output;
        if (array) {
            output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
        } else {
            output = keys.map(function (key) {
                return formatProperty(
                    ctx,
                    value,
                    recurseTimes,
                    visibleKeys,
                    key,
                    array
                );
            });
        }

        ctx.seen.pop();

        return reduceToSingleString(output, base, braces);
    }
    function formatPrimitive(ctx, value) {
        if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
        if (isString(value)) {
            var simple =
                "'" +
                JSON.stringify(value)
                    .replace(/^"|"$/g, '')
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"') +
                "'";
            return ctx.stylize(simple, 'string');
        }
        if (isNumber(value)) return ctx.stylize('' + value, 'number');
        if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');
        // For some reason typeof null is "object", so special case here.
        if (isNull(value)) return ctx.stylize('null', 'null');
    }
    function formatError(value) {
        return '[' + Error.prototype.toString.call(value) + ']';
    }
    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
        var output = [];
        for (var i = 0, l = value.length; i < l; ++i) {
            if (Object.prototype.hasOwnProperty.call(value, String(i))) {
                output.push(
                    formatProperty(
                        ctx,
                        value,
                        recurseTimes,
                        visibleKeys,
                        String(i),
                        true
                    )
                );
            } else {
                output.push('');
            }
        }
        keys.forEach(function (key) {
            if (!key.match(/^\d+$/)) {
                output.push(
                    formatProperty(
                        ctx,
                        value,
                        recurseTimes,
                        visibleKeys,
                        key,
                        true
                    )
                );
            }
        });
        return output;
    }
    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
        var name, str, desc;
        desc = Object.getOwnPropertyDescriptor(value, key) || {
            value: value[key],
        };
        if (desc.get) {
            if (desc.set) {
                str = ctx.stylize('[Getter/Setter]', 'special');
            } else {
                str = ctx.stylize('[Getter]', 'special');
            }
        } else {
            if (desc.set) {
                str = ctx.stylize('[Setter]', 'special');
            }
        }
        if (!Object.prototype.hasOwnProperty.call(visibleKeys, key)) {
            name = '[' + key + ']';
        }
        if (!str) {
            if (ctx.seen.indexOf(desc.value) < 0) {
                if (isNull(recurseTimes)) {
                    str = formatValue(ctx, desc.value, null);
                } else {
                    str = formatValue(ctx, desc.value, recurseTimes - 1);
                }
                if (str.indexOf('\n') > -1) {
                    if (array) {
                        str = str
                            .split('\n')
                            .map(function (line) {
                                return '  ' + line;
                            })
                            .join('\n')
                            .slice(2);
                    } else {
                        str =
                            '\n' +
                            str
                                .split('\n')
                                .map(function (line) {
                                    return '   ' + line;
                                })
                                .join('\n');
                    }
                }
            } else {
                str = ctx.stylize('[Circular]', 'special');
            }
        }
        if (isUndefined(name)) {
            if (array && key.match(/^\d+$/)) {
                return str;
            }
            name = JSON.stringify('' + key);
            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                name = name.slice(1, -1);
                name = ctx.stylize(name, 'name');
            } else {
                name = name
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"')
                    .replace(/(^"|"$)/g, "'");
                name = ctx.stylize(name, 'string');
            }
        }

        return name + ': ' + str;
    }
    function reduceToSingleString(output, base, braces) {
        var numLinesEst = 0;
        var length = output.reduce(function (prev, cur) {
            numLinesEst++;
            if (cur.indexOf('\n') >= 0) numLinesEst++;
            return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
        }, 0);

        if (length > 60) {
            return (
                braces[0] +
                (base === '' ? '' : base + '\n ') +
                ' ' +
                output.join(',\n  ') +
                ' ' +
                braces[1]
            );
        }

        return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }
    function isArray(ar) {
        return Array.isArray(ar);
    }
    function isBoolean(arg) {
        return typeof arg === 'boolean';
    }
    function isNull(arg) {
        return arg === null;
    }
    function isNumber(arg) {
        return typeof arg === 'number';
    }
    function isString(arg) {
        return typeof arg === 'string';
    }
    function isUndefined(arg) {
        return arg === void 0;
    }
    function isRegExp(re) {
        return (
            isObject(re) &&
            Object.prototype.toString.call(re) === '[object RegExp]'
        );
    }
    function isObject(arg) {
        return typeof arg === 'object' && arg !== null;
    }
    function isDate(d) {
        return (
            isObject(d) && Object.prototype.toString.call(d) === '[object Date]'
        );
    }
    function isError(e) {
        return (
            isObject(e) &&
            (Object.prototype.toString.call(e) === '[object Error]' ||
                e instanceof Error)
        );
    }
    function isFunction(arg) {
        return typeof arg === 'function';
    }
    function _extend(origin, add) {
        // Don't do anything if add isn't an object
        if (!add || !isObject(add)) return origin;

        var keys = Object.keys(add);
        var i = keys.length;
        while (i--) {
            origin[keys[i]] = add[keys[i]];
        }
        return origin;
    }
    // #endregion
    // NODE UTILS END

    function highlight(
        text,
        currentForeground,
        currentBackground,
        italic,
        underline,
        strikethrough,
        bold,
        lastElement
    ) {
        const elements = [];

        const split = text.split('\033[');
        if (split[0].length > 0) lastElement.textContent += split[0];

        for (let i = 1; i < split.length; i++) {
            const currentSplit = split[i];
            const styler = currentSplit.substring(0, currentSplit.indexOf('m'));
            const text = currentSplit.substring(currentSplit.indexOf('m') + 1);

            if (styler.startsWith('38')) {
                const [_38, _2, r, g, b] = styler.split(';');
                if (r && g && b) {
                    currentForeground =
                        '#' +
                        [r, g, b]
                            .map((el) =>
                                Number(el).toString(16).substring(0, 2)
                            )
                            .map((el) => (el.length === 1 ? ' ' + el : ''))
                            .join('');
                }
            } else if (styler.startsWith('48')) {
                const [_38, _2, r, g, b] = styler.split(';');
                if (r && g && b) {
                    currentBackground =
                        '#' +
                        [r, g, b]
                            .map((el) =>
                                Number(el).toString(16).substring(0, 2)
                            )
                            .map((el) => (el.length === 1 ? ' ' + el : ''))
                            .join('');
                }
            } else if (styler === '39') currentForeground = 'darkgray'; // RESET
            else if (styler === '30') currentForeground = 'black';
            else if (styler === '34') currentForeground = 'dodgerblue';
            else if (styler === '36') currentForeground = 'darkcyan';
            else if (styler === '90') currentForeground = 'gray';
            else if (styler === '32') currentForeground = 'darkgreen';
            else if (styler === '35') currentForeground = 'darkmagenta';
            else if (styler === '31') currentForeground = 'darkred';
            else if (styler === '37') currentForeground = 'darkgray';
            else if (styler === '33') currentForeground = '#ca8a04';
            else if (styler === '94') currentForeground = 'lightskyblue';
            else if (styler === '96') currentForeground = 'cyan';
            else if (styler === '92') currentForeground = 'green';
            else if (styler === '95') currentForeground = 'magenta';
            else if (styler === '91') currentForeground = 'red';
            else if (styler === '97') currentForeground = 'lightgray';
            else if (styler === '93') currentBackground = '#facc15';
            // background
            else if (styler === '49') currentBackground = '#171717'; // RESET
            else if (styler === '40') currentBackground = '#171717';
            else if (styler === '44') currentBackground = 'dodgerblue';
            else if (styler === '46') currentBackground = 'darkcyan';
            else if (styler === '100') currentBackground = 'gray';
            else if (styler === '42') currentBackground = 'darkgreen';
            else if (styler === '45') currentBackground = 'darkmagenta';
            else if (styler === '41') currentBackground = 'darkred';
            else if (styler === '47') currentBackground = 'darkgray';
            else if (styler === '43') currentBackground = '#ca804';
            else if (styler === '104') currentBackground = 'lightskyblue';
            else if (styler === '106') currentBackground = 'cyan';
            else if (styler === '102') currentBackground = 'green';
            else if (styler === '105') currentBackground = 'magenta';
            else if (styler === '101') currentBackground = 'red';
            else if (styler === '107') currentBackground = 'lightgray';
            else if (styler === '103') currentBackground = '#facc15';
            // text style
            else if (styler === '22') bold = false; // RESET
            else if (styler === '23') italic = false; // RESET
            else if (styler === '29') strikethrough = false; // RESET
            else if (styler === '24') underline = false; // RESET
            else if (styler === '3') italic = true;
            else if (styler === '1') bold = true;
            else if (styler === '9') {
                underline = false;
                strikethrough = true;
            } else if (styler === '4') {
                underline = true;
                strikethrough = false;
            }
            const span = document.createElement('span');
            span.style.color = currentForeground;
            span.style.backgroundColor = currentBackground;
            span.style.fontStyle = italic ? 'italic' : 'normal';
            span.style.textDecoration = strikethrough
                ? 'line-through'
                : underline
                ? 'underline'
                : 'none';
            span.style.fontWeight = bold ? 'bold' : 'normal';
            span.textContent = text;
            elements.push(span);
        }

        return {
            currentBackground,
            currentForeground,
            italic,
            strikethrough,
            bold,
            underline,
            elements,
        };
    }

    document.body.style.margin = '0px';
    document.body.style.padding = '0px';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'hidden';

    function generateFancyness(element) {
        const heading = document.createElement('span');
        heading.textContent = 'Console\n';
        heading.style.fontWeight = 'bold';
        heading.style.fontSize = '1.5rem';
        element.append(heading);
        const elements = [
            document.createElement('span'),
            document.createElement('span'),
            document.createElement('span'),
            document.createElement('span'),
        ];
        elements[0].style.fontWeight = 'bold';
        elements[1].style.fontWeight = 'bold';
        elements[3].style.textDecoration = 'underlined';
        elements[1].style.color = 'lightskyblue';
        elements[3].style.color = 'lightskyblue';
        elements[0].style.color = 'green';
        elements[2].style.color = 'dodgerblue';
        elements[0].textContent = 'root@linux ';
        elements[1].textContent = '~/undefied $ ';
        elements[2].textContent = './run.sh ';
        elements[3].textContent = './undefiedProgram.js\n';
        element.append(...elements);
    }

    let element = document.getElementsByClassName('console')[0];
    if (!element && !window.logToConsole) {
        element = document.createElement('pre');
        element.classList.add('console');
        element.style.backgroundColor = '#171717';
        element.style.padding = '.5rem';
        element.style.color = 'darkgray';
        element.style.width = 'calc(100vw - 1rem)';
        element.style.height = 'calc(100vh - 1rem)';
        element.style.margin = '0px';
        element.style.overflowX = 'hidden';
        element.style.overflowY = 'scroll';
        element.style.whiteSpace = 'pre-wrap';
        element.style.wordBreak = 'break-word';
        generateFancyness(element);
        document.body.append(element);
    }
    let styles = {
        fg: 'darkgray',
        bg: '#171717',
        italic: false,
        underline: false,
        strikethrough: false,
        bold: false,
    };
    if (!window.logToConsole) {
        let lastElement = undefined;

        // const oldlog = console.log;
        console.log = function log(...args) {
            // oldlog(...args);
            if (!lastElement) {
                lastElement = document.createElement('span');
                lastElement.style.color = styles.fg;
                lastElement.style.backgroundColor = styles.bg;
                lastElement.style.fontStyle = styles.italic
                    ? 'italic'
                    : 'normal';
                lastElement.style.textDecoration = styles.strikethrough
                    ? 'line-through'
                    : styles.underline
                    ? 'underline'
                    : 'none';
                lastElement.style.fontWeight = styles.bold ? 'bold' : 'normal';
                element.append(lastElement);
            }
            const str = format(...args);
            const newStyles = highlight(
                str,
                styles.fg,
                styles.bg,
                styles.italic,
                styles.underline,
                styles.strikethrough,
                styles.bold,
                lastElement
            );
            styles.bg = newStyles.currentBackground;
            styles.fg = newStyles.currentForeground;
            styles.bold = newStyles.bold;
            styles.italic = newStyles.italic;
            styles.strikethrough = newStyles.strikethrough;
            styles.underline = newStyles.underline;
            if (newStyles.elements.length > 0) {
                element.append(
                    ...newStyles.elements
                        .slice(0, newStyles.elements.length - 1)
                        .filter((el) => el.textContent.length > 0),
                    newStyles.elements[newStyles.elements.length - 1]
                );
                lastElement = newStyles.elements[newStyles.elements.length - 1];
            }
            element.scrollTo({
                top: element.scrollHeight,
                behavior: window.hardScroll ? 'instant' : 'smooth',
            });
        };
        console.error = console.log;
        console.clear = function clear() {
            lastElement = undefined;
            [...element.children].slice(5).forEach((el) => el.remove());
        };
        console.assert = function assert(condition, ...args) {
            if (args.length < 1) args.push('console.assert');
            if (!condition)
                console.error(
                    '\033[31m\033[1mAssertion Failed: %s\033[39m\033[22m',
                    ...args
                );
        };

        const counter = {};
        console.count = function count(label) {
            if (label === undefined) label = 'default';
            if (typeof label !== 'string') label = label.toString();
            counter[label] ||= 0;
            console.log(label + ': ' + counter[label]++ + '\n');
        };
        console.countReset = function countReset(label) {
            if (label === undefined) label = 'default';
            if (typeof label !== 'string') label = label.toString();
            delete counter[label];
        };
        console.debug = function debug(...args) {
            if (args.length < 1) return;
            console.log('\033[34m%s\033[39m', ...args);
        };
        console.dir = console.log;
    }
})();
