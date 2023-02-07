import { readFile } from 'fs/promises';
import { compilerError } from './errors';
import { parseHexValue, parseOctalValue, parseBinValue } from './numberParser';
import { Loc, Token, TokenType } from './types';

export async function generateTokens(file: string) {
    const lines = (await readFile(file))
        .toString()
        .split('\n')
        .map((el) => (el.endsWith('\r') ? el.substring(0, el.length - 1) : el));
    let location: Loc = [file, 0, 0];
    let value = '';
    let type: TokenType = TokenType.None;
    let tokens: Token[] = [];

    for (const i in lines) {
        const l = Number(i);
        const line = lines[l];
        const characters = Object.values(line);
        let lastWasLineBreak = 2;

        for (const j in characters) {
            if (lastWasLineBreak > 0) lastWasLineBreak--;
            const c = Number(j);
            const character = line[c];

            if (character === '#') break;
            else if (
                character === ' ' &&
                type !== TokenType.String &&
                type !== TokenType.CharCode
            ) {
                if (type !== TokenType.None) {
                    if (type === TokenType.Integer) {
                        tokens.push({
                            loc: location,
                            type,
                            value: parseInt(value),
                        });
                    } else if (type === TokenType.Word) {
                        const num = makeNumber(value);
                        if (num !== undefined)
                            tokens.push({
                                loc: location,
                                type: TokenType.Integer,
                                value: num,
                            });
                        else tokens.push({ loc: location, type, value });
                    } else compilerError(location, 'unreachable');
                }
                type = TokenType.None;
                value = '';
            } else if (character === '"') {
                if (type !== TokenType.None && type !== TokenType.String)
                    compilerError(
                        [file, l + 1, c + 1],
                        '`"` in a non-string definition'
                    );
                else if (type === TokenType.None) {
                    location = [file, l + 1, c + 1];
                    type = TokenType.String;
                } else {
                    tokens.push({
                        loc: location,
                        type,
                        value: escapeStr(value),
                    });
                    type = TokenType.None;
                    value = '';
                }
            } else if (character === "'") {
                if (type !== TokenType.None && type !== TokenType.CharCode)
                    compilerError(
                        [file, l + 1, c + 1],
                        '`"` in a non-string definition'
                    );
                else if (type === TokenType.None) {
                    location = [file, l + 1, c + 1];
                    type = TokenType.CharCode;
                } else if (value.length > 1)
                    compilerError(
                        location,
                        'A Character literal can only have 1 character'
                    );
                else {
                    tokens.push({
                        loc: location,
                        type: TokenType.Integer,
                        value: value.charCodeAt(0) || 0,
                    });
                    type = TokenType.None;
                    value = '';
                }
            } else if (
                character === 'c' &&
                value === '' &&
                lastWasLineBreak < 1 &&
                tokens[tokens.length - 1].type === TokenType.String
            ) {
                tokens[tokens.length - 1].type = TokenType.CString;
            } else if (
                (type === TokenType.None || type === TokenType.Integer) &&
                character.match(/^[0-9]$/)
            ) {
                if (type === TokenType.None) {
                    type = TokenType.Integer;
                    location = [file, l + 1, c + 1];
                }
                value += character;
            } else {
                if (type === TokenType.None) {
                    type = TokenType.Word;
                    location = [file, l + 1, c + 1];
                } else if (type === TokenType.Integer) type = TokenType.Word;

                value += character;
            }
        }
        if (type !== TokenType.None) {
            if (type === TokenType.CharCode) {
            } else if (type !== TokenType.Integer) {
                tokens.push({ loc: location, type, value });
            } else {
                tokens.push({
                    loc: location,
                    type,
                    value: parseInt(value),
                });
            }
        }
        type = TokenType.None;
        value = '';
    }
    if (type !== TokenType.None) {
        if (type === TokenType.Integer)
            tokens.push({
                loc: location,
                type,
                value: parseInt(value),
            });
        else if (type === TokenType.Word)
            tokens.push({ loc: location, type, value });
        else compilerError(location, 'Error: Expected `"`, found nothing');
    }
    return tokens;
}

export function makeNumber(identifier: string): undefined | number {
    if (identifier.startsWith('-')) {
        const num = Number(identifier);
        if (!isNaN(num) && isFinite(num) && num < 1) return num;
    }
    if (identifier.length < 3) return;
    if (identifier.startsWith('0x')) {
        try {
            return parseHexValue(identifier.substring(2));
        } catch {}
    }
    if (identifier.startsWith('0o')) {
        try {
            return parseOctalValue(identifier.substring(2));
        } catch {}
    }
    if (identifier.startsWith('0b')) {
        try {
            return parseBinValue(identifier.substring(2));
        } catch {}
    }
    return undefined;
}

export function escapeStr(str: string): string {
    let _str = '';
    let escaping = false;
    const translationMatrix = { n: '\n', r: '\r', t: '\t', '0': '\0' };

    for (const c of Object.values(str)) {
        if (escaping) {
            _str += translationMatrix[c as keyof typeof translationMatrix] || c;
            escaping = false;
        }
        else if (c === '\\') escaping = true;
        else _str += c;
    }

    return _str;
}