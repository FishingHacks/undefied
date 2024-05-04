import path, { join } from 'path';
import * as target_linux from './compilers/linux';
import * as target_linux_macro from './compilers/linux-macro';
import { crossReferenceProgram } from './crossreferencing';
import { error, info } from './errors';
import { generateTokens } from './generateTokens';
import { dce } from './optimizations/deadCodeElimination';
import { parseProgram } from './parser';
import { typecheckProgram } from './typecheck';
import { existsSync, rmSync } from 'fs';
import { Compiler, Loc, Token, TokenType } from './types';
import { timer } from './timer';
import { exists, isFile } from './utils/files';
import { cmd_echoed } from './utils/general';
import { getCompiler, targetId } from './targets';

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
        external = [],
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
    const end = timer.start(
        'compileFile() | ' + file + ' for target ' + target
    );

    const compiler = getCompiler(target);
    if (!compiler)
        error('No compiler for the specified target found (' + target + ')');
    predefConsts.__TARGET__ = targetId(target);
    args ||= [];
    while (true) {
        const arg = args[0];
        if (!arg) break;
        if (
            !arg.startsWith('-d') &&
            !arg.startsWith('-D') &&
            !arg.startsWith('-l') &&
            !arg.startsWith('-L') &&
            !arg.startsWith('-i') &&
            !arg.startsWith('-I') &&
            !arg.startsWith('--d') &&
            !arg.startsWith('--D') &&
            !arg.startsWith('--l') &&
            !arg.startsWith('--L') &&
            !arg.startsWith('--i') &&
            !arg.startsWith('--I')
        )
            break;
        const newArg = arg[1] === '-' ? arg.substring(2) : arg.substring(1);
        if (newArg.length < 2)
            error('Include, Libinclude or Define have to have a path or value');
        if (newArg[0] === 'l' || newArg[0] === 'L')
            libs.push(newArg.substring(1));
        else if (newArg[0] === 'i' || newArg[0] === 'I')
            external.push(
                newArg[1] === '/'
                    ? newArg.substring(1)
                    : join(process.cwd(), newArg.substring(1))
            );
        else if (newArg[1] === 'd' || newArg[1] === 'D') {
            const split = newArg.substring(1).split('=');
            if (split.length < 2)
                error('You have to defined a value for ' + split[0]);
            predefConsts[split[0]] = Number(split.slice(1).join('='));
            if (isNaN(predefConsts[split[0]])) {
                error(
                    "Error: Can't evaluate " +
                        split.slice(1).join('=') +
                        ' to a number'
                );
            }
        } else error('Could not parse ' + newArg);
        args.shift();
    }

    for (const f of external) {
        if (!existsSync(f))
            error(
                'External Library %s could not be located (Checked: %s)',
                f.substring(f.lastIndexOf('/') + 1),
                f
            );
    }

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

    if (!file.endsWith('.undefied'))
        error('Error: Only .undefied files are allowed');
    if (!(await exists(file)) || !(await isFile(file)))
        error("Error: Cannot find file '" + file + "'");
    tokens.push(...(await generateTokens(file)));
    const parsed = await parseProgram(
        tokens,
        Number(optimizations),
        predefConsts,
        dev,
        typecheckingOnly
    );
    const program = crossReferenceProgram(parsed);
    if (!unsafe) typecheckProgram(program);
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
            dev,
            unsafe,
        });
        if (!keepFiles) cleanFiles(file, compiler.removeFiles, dev);
        end();
        if (run) await compiler.runProgram(file, args);
    } else end();
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
