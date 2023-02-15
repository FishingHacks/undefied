import { join } from 'path';
import * as target_linux from './compile';
import * as target_linux_macro from './compile_with_macros';
import { crossReferenceProgram } from './crossreferencing';
import { error, info } from './errors';
import { generateTokens } from './generateTokens';
import { dce } from './optimizations/deadCodeElimination';
import { parseProgram } from './parser';
import { typecheckProgram } from './typecheck';
import { cmd_echoed, exists, isFile } from './utils';
import { rmSync } from 'fs';
import { compiler, Loc, Token, TokenType } from './types';
import { timer } from './timer';

export default async function compileFile(
    file: string,
    {
        optimizations = '1',
        run = false,
        unsafe = false,
        target = 'linux',
        keepFiles = false,
        dev = false,
        dontRunFunctions,
        external,
        libs = [],
        predefConsts = {},
    }: {
        optimizations?: '0' | '1';
        unsafe?: boolean;
        run?: boolean;
        target?: string;
        keepFiles?: boolean;
        dev?: boolean;
        external?: string[];
        dontRunFunctions?: boolean;
        libs?: string[];
        predefConsts?: Record<string, number>;
    } = {},
    typecheckingOnly: boolean,
    args?: string[]
) {
    const end = timer.start('compileFile("' + file + '")');
    const tokens: Token[] = [];
    const includeLoc: Loc = ['<included-libs>', 0, 0];
    for (const l of libs) {
        tokens.push({
            loc: includeLoc,
            type: TokenType.Word,
            value: 'include',
        });
        tokens.push({
            loc: includeLoc,
            type: TokenType.String,
            value: l,
        });
    }

    const compiler = getCompiler(target);
    if (!compiler)
        error('No compiler for the specified target found (' + target + ')');
    predefConsts.__TARGET_LINUX__ = 0;
    predefConsts.__TARGET_LINUX_MACROS__ = 1;
    predefConsts.__TARGET__ = makeTarget(target);
    args ||= [];
    while (true) {
        const arg = args[0];
        if (!arg) break;
        if (
            !arg.startsWith('-D') &&
            !arg.startsWith('--D') &&
            !arg.startsWith('-d') &&
            !arg.startsWith('--d')
        )
            break;
        const newArgs = (
            arg.startsWith('-D') || arg.startsWith('-d')
                ? arg.substring(2)
                : arg.substring(3)
        ).split('=');
        predefConsts[newArgs[0]] = Number(newArgs.slice(1).join('='));
        if (isNaN(predefConsts[newArgs[0]])) {
            error(
                "Error: Can't evaluate " +
                    newArgs.slice(1).join('=') +
                    ' to a number'
            );
            break;
        }
        args.shift();
    }

    if (!file.endsWith('.undefied'))
        error('Error: Only .undefied files are allowed');
    if (!(await exists(file)) || !(await isFile(file)))
        error("Error: Cannot find file '" + file + "'");
    tokens.push(...(await generateTokens(file, dev)));
    const parsed = await parseProgram(
        tokens,
        Number(optimizations),
        predefConsts,
        dev
    );
    const program = crossReferenceProgram(parsed);
    if (!unsafe) typecheckProgram(program, dev);
    if (!typecheckingOnly) {
        if (optimizations === '1') dce(program, dev);
        else for (const c of Object.values(program.contracts)) c.used = true;
        file = file.substring(0, file.length - 9);
        await compiler.compile({
            program,
            filename: file,
            optimizations,
            dontRunFunctions,
            external,
        });
        if (!keepFiles) cleanFiles(file, compiler.removeFiles, dev);
        end();
        if (run)
            cmd_echoed(
                `"${
                    !file.startsWith('/') ? join(process.cwd(), file) : file
                }" ${args
                    .map((el) => '"' + el.replaceAll('"', '\\"') + '"')
                    .join(' ')}`,
                'Program Output'
            );
    }
}

function cleanFiles(filename: string, files: string[], dev: boolean) {
    const end = timer.start('cleanFiles()');
    if (!filename.startsWith('/')) filename = join(process.cwd(), filename);
    for (const f of files) {
        if (dev) info('Removing file ' + filename + f);
        rmSync(filename + f);
    }
    end();
}

function getCompiler(
    target: string
): { compile: compiler; removeFiles: string[] } | undefined {
    if (target === 'linux') return target_linux;
    else if (target === 'linux-macro') return target_linux_macro;
    return;
}

function makeTarget(target: string) {
    if (target === 'linux') return 0;
    else if (target === 'linux-macro') return 1;
    return 0;
}
