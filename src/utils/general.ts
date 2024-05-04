import { spawnSync } from 'child_process';
import { info, error, compilerError } from '../errors';
import { timer } from '../timer';
import { Loc, Operation } from '../types';

export function stringMultiply(char: string, i: number) {
    let str = '';
    for (let j = 0; j < i; j++) str += char;
    return str;
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
    for (const p of parameter) if (op.parameters[p] !== undefined) return true;
    return false;
}
export function parameterRequired(op: Operation, ...parameter: string[]) {
    parameter = arrayify(parameter);
    for (const p of parameter) {
        if (!hasParameter(op, p)) compilerError([op.location], 'Expected parameter %s', p);
    }
}
export function parameterDisallowed(op: Operation, ...parameter: string[]) {
    parameter = arrayify(parameter);
    for (const p of parameter) {
        if (hasParameter(op, p)) compilerError([op.location], 'Parameter %s is not allowed here', p);
    }
}
export function getParameter(
    op: Operation | undefined,
    name: string
): string | undefined {
    return op?.parameters?.[name];
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
export function valid<T>(isValid: boolean, value: T): T | undefined {
    if (!isValid) return;
    return value;
}
