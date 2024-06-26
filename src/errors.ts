import chalk from 'chalk';
import { format } from 'util';
import { INFO } from './constants';
import { EnhancedType, Loc, TokenType } from './types';
import { humanTokenType } from './utils/tokens';
import { enhancedTypeEqual, humanEnhancedType } from './utils/types';

export function compilerError(
    location: Loc[],
    err: string,
    ...args: any[]
): never {
    if (location.length < 1) location[0] = ['<unknown>', 0, 0];
    error(
        format('%s:%d:%d: %s', ...location[0], format(err, ...args)) +
            location
                .slice(1)
                .map((el) => `\nat ${el[0]}:${el[1]}:${el[2]}`)
                .join('')
    );
}
export function compilerWarn(
    location: Loc[],
    message: string,
    ...args: any[]
) {
    if (location.length < 1) location[0] = ['<unknown>', 0, 0];
    warn(
        format('%s:%d:%d: %s', ...location[0], format(message, ...args)) +
            location
                .slice(1)
                .map((el) => `\nat ${el[0]}:${el[1]}:${el[2]}`)
                .join('')
    );
}
export function compilerInfo(
    location: Loc[],
    message: string,
    ...args: any[]
) {
    if (location.length < 1) location[0] = ['<unknown>', 0, 0];
    info(
        format('%s:%d:%d: %s', ...location[0], format(message, ...args)) +
            location
                .slice(1)
                .map((el) => `\nat ${el[0]}:${el[1]}:${el[2]}`)
                .join('')
    );
}

export function expected(loc: Loc, type: EnhancedType, specified?: EnhancedType) {
    if (!specified || !enhancedTypeEqual(type, specified))
        compilerError(
            [loc],
            'Expected ' +
                humanEnhancedType(type) +
                ', but found ' +
                (specified === undefined ? 'nothing' : humanEnhancedType(type))
        );
}
export function expectedTT(loc: Loc, type: TokenType, specified: TokenType|undefined) {
    if (type !== specified)
        compilerError(
            [loc],
            'Expected ' +
                humanTokenType(type) +
                ', but found ' +
                (specified === undefined || specified === TokenType.None
                    ? 'nothing'
                    : humanTokenType(type))
        );
}
export function expectedChars(
    loc: Loc,
    expected: string | number,
    specified: string | number
) {
    if (expected !== specified)
        compilerError([loc], 'Expected ' + expected + ' but found ' + specified);
}
export function doesntmatchTT(
    loc: Loc,
    type: TokenType,
    specified: TokenType,
    value: string | number,
    specifiedValue: string | number
) {
    expectedTT(loc, type, specified);
    expectedChars(loc, value, specifiedValue);
}
export function error(err: string, ...values: any[]): never {
    console.error(chalk.redBright('Error: ' + format(err, ...values)));
    const stack = new Error('Exit').stack;
    if (stack) console.log(chalk.redBright('Stacktrace:\n' + stack));
    console.log('\n' + INFO.name + ' v' + INFO.version);
    process.exit(1);
}
export function warn(warn: string, ...values: any[]) {
    console.warn(chalk.yellow('Warn: ' + format(warn, ...values)));
}
export function info(info: string, ...values: any[]) {
    console.log(chalk.cyan('Info: ' + format(info, ...values)));
}
export function success(success: string, ...values: any[]) {
    console.log(chalk.green('Success: ' + format(success, ...values)));
}
