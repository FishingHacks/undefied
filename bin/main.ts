import chalk from 'chalk';
import { spawnSync } from 'child_process';
import { join } from 'path';
import compileFile from '../src/completeCompiler';
import { INCLUDE_DIRECTORY, INFO } from '../src/constants';
import { crossReferenceProgram } from '../src/crossreferencing';
import { error } from '../src/errors';
import { generateTokens } from '../src/generateTokens';
import helpMenu from '../src/help';
import { parseProgram } from '../src/parser';
import { typecheckProgram } from '../src/typecheck';
import { exists, isFile } from '../src/utils';

async function main(args: string[]) {
    args = args.slice(2);
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
        const { active: options, remaining } = parseOptions(args.slice(2), {
            run: ['r', 'run'],
            unsafe: ['u', 'unsafe'],
            opt0: ['O0'],
            opt1: ['O1'],
        });
        if (options.includes('opt0') && options.includes('opt1'))
            error("Error: You can't use multiple optimization levels");
        const optimization =
            options.find((el) => el.startsWith('opt')) || 'opt1';

        try {
            compileFile(
                file,
                {
                    run: options.includes('run'),
                    unsafe: options.includes('unsafe'),
                    optimizations: optimization.substring(3) as '1',
                },
                remaining
            );
        } catch (e: any) {
            error(
                'Error: ' +
                    (e?.stack ||
                        e?.message ||
                        e?.name ||
                        e?.toString?.() ||
                        'unknown error')
            );
        }
    } else if (args[0] === 'typecheck' || args[0] === 'check') {
        const file = args[1].startsWith('/')
            ? args[1]
            : join(process.cwd(), args[1]);
        if (!file) error('Error: No file provided');
        if (!file.endsWith('.undefied'))
            error('Error: Only .undefied files are allowed');
        args ||= [];
        if (!(await exists(file)) || !(await isFile(file)))
            error("Error: Cannot find file '" + file + "'");
        const program = crossReferenceProgram(
            await parseProgram(await generateTokens(file))
        );
        typecheckProgram(program);
        console.log(chalk.green('Done! Everything looks like it should work!'));
    } else if (args[0] === 'check-std' || args[0] === 'typecheck-std') {
        const proc = spawnSync('node', [
            join(INCLUDE_DIRECTORY, 'typecheckStd.js'),
        ], {shell: true});
        proc.output.forEach(el => el ? process.stdout.write(el.toString()) : null);
        if (proc.error) console.error(proc.error);
    } else error('Error: Subcommand or option ' + args[0] + ' was not found');
}

main(process.argv);

function isCommand(str: string, command: string, short: string) {
    return (
        str === '--' + command ||
        str === '-' + command ||
        str === '--' + short ||
        str === '-' + short
    );
}

function parseOptions(
    args: string[],
    options: Record<string, string[]>
): { active: string[]; remaining: string[] } {
    const active: string[] = [];
    const used: string[] = [];

    for (const [k, v] of Object.entries(options)) {
        if (!active.includes(k)) {
            for (const str of v) {
                if (active.includes(k)) break;
                for (const arg of args) {
                    if (
                        (arg === '--' + str || arg === '-' + str) &&
                        !used.includes(arg)
                    ) {
                        active.push(k);
                        used.push(arg);
                        break;
                    }
                }
            }
        }
    }

    return { active, remaining: args.filter((el) => !used.includes(el)) };
}
