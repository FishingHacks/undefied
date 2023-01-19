import assert from 'assert';
import chalk from 'chalk';
import { spawnSync } from 'child_process';
import { constants, existsSync, lstatSync } from 'fs';
import { access, lstat } from 'fs/promises';
import { error } from './errors';
import { Loc, TokenType, Type } from './types';

export function humanTokenType(type: TokenType) {
    if (type === TokenType.CString) return 'CString';
    else if (type === TokenType.Integer) return 'Integer';
    else if (type === TokenType.None) assert(false, 'This should never happen');
    else if (type === TokenType.String) return 'String';
    else if (type === TokenType.Word) return 'Word';
    else if (type === TokenType.CharCode) return 'CharCode';
    else assert(false, 'This should never happen');
}

export function humanType(type: Type) {
    if (type === Type.Bool) return 'bool';
    else if (type === Type.Int) return 'int';
    else if (type === Type.Ptr) return 'ptr';
    else return 'unknown type with id ' + type;
}

export function getTypes(types: Type[]) {
    if (types.length < 1) return chalk.gray(chalk.italic('<empty>'));
    return types.map((el) => humanType(el)).join(' ');
}

export function valid<T>(isValid: boolean, value: T): T | undefined {
    if (!isValid) return;
    return value;
}

export function checkExistence(
    ...files: (string | undefined)[]
): string | undefined {
    for (const f of files) {
        if (f !== undefined && existsSync(f) && lstatSync(f).isFile()) return f;
    }
    return;
}

export function cmd_echoed(cmd: string, name?: string) {
    console.log(chalk.yellow('[INFO] [CMD]: Running ' + cmd));
    const proc = spawnSync(cmd, { shell: true });
    if (proc.stderr.length > 0)
        console.error(
            chalk.redBright(
                proc.stderr
                    .toString('utf-8')
                    .split('\n')
                    .map((el) => '[ERR] [' + (name === undefined?cmd:name) + ']: ' + el)
                    .join('\n')
            )
        );
    if (proc.stdout.length > 0)
        console.error(
            chalk.yellow(
                proc.stdout
                    .toString('utf-8')
                    .split('\n')
                    .map((el) => '[INFO] [' + (name === undefined?cmd:name) + ']: ' + el)
                    .join('\n')
            )
        );
    if (proc.error) {
        error('[ERR] [' + (name === undefined?cmd:name) + ']: ' + (proc.error.stack || proc.error.message || proc.error.name));
    }
    if (proc.stderr.length > 0) process.exit(1);
}

export async function exists(file: string, writable?: boolean) {
    try {
        await access(file, constants.R_OK | (writable ? constants.R_OK : 0));
        return true;
    } catch {}
    return false;
}

export async function isFile(file: string) {
    return (await lstat(file)).isFile();
}

export function humanLocation(location: Loc) {
    return location.join(':');
}