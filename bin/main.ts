import chalk from 'chalk';
import { spawnSync } from 'child_process';
import { join } from 'path';
import compileFile from '../src/completeCompiler';
import { INCLUDE_DIRECTORY, INFO } from '../src/constants';
import { error, success } from '../src/errors';
import helpMenu from '../src/help';
import {
    readConfig,
    executeConfig,
    resolveConfigPath,
} from '../src/readConfig';
import { timer } from '../src/timer';
import { getErrorName, hasErrored } from '../src/typingutils';

function compile(
    file: string,
    args: string[],
    typecheck: boolean,
    tryCatch: boolean
) {
    const {
        specified: options,
        remaining,
        values,
    } = optionParser(args, {
        run: ['r', 'run'],
        unsafe: ['u', 'unsafe'],
        opt0: ['O0'],
        opt1: ['O1'],
        keepFiles: ['keep'],
        target: ['t', 'target'],
        dev: ['d', 'dev'],
    });
    if (options.includes('opt0') && options.includes('opt1'))
        error("Error: You can't use multiple optimization levels");
    const optimization = options.find((el) => el.startsWith('opt')) || 'opt1';

    try {
        compileFile(
            file,
            {
                run: options.includes('run'),
                unsafe: options.includes('unsafe'),
                optimizations: optimization.substring(3) as '1',
                keepFiles: options.includes('keepFiles'),
                dev: options.includes('dev'),
                target: optionAsStr(values.target),
            },
            typecheck,
            remaining
        );
    } catch (e: any) {
        if (tryCatch)
            error(
                'Error: ' +
                    (e?.stack ||
                        e?.message ||
                        e?.name ||
                        e?.toString?.() ||
                        'unknown error')
            );
        else throw e;
    }
}

let end: () => void = () => {};
let profilingEnabled: boolean = false;

async function main(args: string[]) {
    end = timer.start('main()');
    args = args.slice(2);
    if (isCommand(args[0], 'profiling', 'p')) {
        profilingEnabled = true;
        args.shift();
    }
    if (isCommand(args[0], 'help', 'h') || args.length < 1) {
        console.log(helpMenu(INFO.version));
        process.exit(0);
    } else if (isCommand(args[0], 'version', 'v')) {
        console.log(chalk.bold(chalk.cyan('Undefied')) + ' v' + INFO.version);
    } else if (args[0] === 'compile' || args[0] === 'com') {
        const file = args[1].startsWith('/')
            ? args[1]
            : join(process.cwd(), args[1]);
        if (!file) error('Error: No file provided');
        compile(file, args.slice(2), false, true);
    } else if (args[0] === 'typecheck' || args[0] === 'check') {
        const file = args[1].startsWith('/')
            ? args[1]
            : join(process.cwd(), args[1]);
        if (!file) error('Error: No file provided');
        if (!file.endsWith('.undefied'))
            error('Error: Only .undefied files are allowed');
        compile(file, args.slice(2), true, true);
        success('Done! Everything looks like it should work!');
    } else if (args[0] === 'check-std' || args[0] === 'typecheck-std') {
        const proc = spawnSync(
            'node',
            [join(INCLUDE_DIRECTORY, 'typecheckStd.js')],
            { shell: true }
        );
        proc.output.forEach((el) =>
            el ? process.stdout.write(el.toString()) : null
        );
        if (proc.error) console.error(proc.error);
    } else if (args[0] === 'config') {
        const value = await readConfig(args[1]);
        if (hasErrored(value)) error(getErrorName(value.error));
        else
            await executeConfig(
                value.value,
                join(resolveConfigPath(args[1]), '..')
            );
        return;
    } else error('Error: Subcommand or option ' + args[0] + ' was not found');
}
process.on('beforeExit', () => {
    end();
    if (profilingEnabled) timer.print();
});
main(process.argv);

function isCommand(str: string, command: string, short: string) {
    return (
        str === '--' + command ||
        str === '-' + command ||
        str === '--' + short ||
        str === '-' + short
    );
}

function optionParser<T extends string>(
    args: string[],
    options: Record<T, string[]>
): {
    specified: T[];
    values: Record<T, string | boolean>;
    remaining: string[];
} {
    const end = timer.start('optionParser()');
    const specified: T[] = [];
    const values: Record<string, string | boolean> = {};
    let i = -1;

    function getKey(name: string): T | undefined {
        for (const [k, v] of Object.entries<string[]>(options))
            if (v.includes(name)) return k as T;
        return undefined;
    }

    let lastarg: string = '';
    while (true) {
        const arg = args[++i];
        if (!arg) break;
        if (!arg.startsWith('-') && lastarg === '') break;
        if (!arg.startsWith('-')) {
            values[lastarg] = arg;
            lastarg = '';
        } else {
            const newarg = arg.startsWith('--')
                ? arg.substring(2)
                : arg.substring(1);
            const key = getKey(newarg);
            if (key === undefined) break;
            lastarg = key;
            if (specified.includes(key)) break;
            specified.push(key);
            values[key] = true;
        }
    }
    for (const k of Object.keys(options)) {
        if (values[k] === undefined) values[k] = false;
    }

    end();
    return { specified, values, remaining: args.slice(i) };
}

function optionAsStr(option: boolean | string): string | undefined {
    if (option === true || option === false || option === '') return;
    return option;
}
