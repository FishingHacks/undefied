import chalk from "chalk";
import { format } from "util";
import { INFO } from "./constants";
import { Loc, TokenType, Type } from "./types";
import { humanTokenType, humanType } from "./utils";

export function compilerError(location: Loc, err: string) {
    error(chalk.redBright(format('%s:%d:%d: %s', ...location, err)));
}

export function expected(loc: Loc, type: Type, specified?: Type) {
    compilerError(
        loc,
        'Expected ' +
            humanType(type) +
            ', but found ' +
            (specified === undefined ? 'nothing' : humanType(type))
    );
}
export function expectedTT(loc: Loc, type: TokenType, specified?: TokenType) {
    compilerError(
        loc,
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
    compilerError(loc, 'Expected ' + expected + ' but found ' + specified);
}
export function doesntmatchTT(
    loc: Loc,
    type: TokenType,
    specified: TokenType,
    value: string | number,
    specifiedValue: string | number
) {
    if (type !== specified) expectedTT(loc, type, specified);
    else expectedChars(loc, value, specifiedValue);
}
export function error(err: string) {
    console.error(chalk.redBright('Error: ' + err));
    console.log('\n' + INFO.name + ' v' + INFO.version);
    process.exit(1);
}