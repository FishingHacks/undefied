import assert from 'assert';
import chalk from 'chalk';
import { spawnSync } from 'child_process';
import { constants, existsSync, lstatSync } from 'fs';
import { access, lstat } from 'fs/promises';
import { error, info } from './errors';
import { timer } from './timer';
import { Loc, Operation, TokenType, Type } from './types';

export function humanTokenType(type: TokenType) {
    if (type === TokenType.CString) return 'CString';
    else if (type === TokenType.Integer) return 'Integer';
    else if (type === TokenType.None) assert(false, 'This should never happen');
    else if (type === TokenType.String) return 'String';
    else if (type === TokenType.Word) return 'Word';
    else if (type === TokenType.CharCode) return 'CharCode';
    else if (type === TokenType.Comment) return 'Comment';
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
    const end = timer.start('[CMD]: ' + name || cmd);
    info('[CMD]: Running ' + cmd);
    const proc = spawnSync(cmd, { shell: true });
    end();
    if (proc.stderr.length > 0)
        proc.stderr
            .toString('utf-8')
            .split('\n')
            .map((el) => '[' + (name === undefined ? cmd : name) + ']: ' + el)
            .forEach((el) => error(el));
    if (proc.stdout.length > 0)
        proc.stdout
            .toString('utf-8')
            .split('\n')
            .map((el) => '[' + (name === undefined ? cmd : name) + ']: ' + el)
            .forEach((el) => info(el));
    if (proc.error) {
        error(
            '[ERR] [' +
                (name === undefined ? cmd : name) +
                ']: ' +
                (proc.error.stack || proc.error.message || proc.error.name)
        );
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
export function arrayify<T>(value: T | T[]): T[] {
    if (value instanceof Array) return value;
    return [value];
}
export function hasParameter(
    op: Operation | undefined,
    parameter: string | string[]
): boolean {
    parameter = arrayify(parameter);
    if (!op) return false;
    else if (!op.parameters) return false;
    for (const p of parameter) if (op.parameters.includes(p)) return true;
    return false;
}
