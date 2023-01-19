import { join } from 'path';
import { compile } from './compile';
import { crossReferenceProgram } from './crossreferencing';
import { error } from './errors';
import { generateTokens } from './generateTokens';
import { dce } from './optimizations/deadCodeElimination';
import { parseProgram } from './parser';
import { typecheckProgram } from './typecheck';
import { cmd_echoed, exists, isFile } from './utils';

export default async function compileFile(
    file: string,
    {
        optimizations = '1',
        run = false,
        unsafe = false,
    }: { optimizations?: '0' | '1'; unsafe?: boolean; run?: boolean } = {},
    args?: string[]
) {
    if (!file.endsWith('.undefied'))
        error('Error: Only .undefied files are allowed');
    args ||= [];
    if (!(await exists(file)) || !(await isFile(file)))
        error("Error: Cannot find file '" + file + "'");
    const program = crossReferenceProgram(
        await parseProgram(await generateTokens(file))
    );
    if (!unsafe) typecheckProgram(program);
    if (optimizations === '1') dce(program);
    file = file.substring(0, file.length - 9);
    await compile(program, file);
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
