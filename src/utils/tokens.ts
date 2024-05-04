import assert from "assert";
import { Token, TokenType } from "../types";

export function tokensToStr(toks: Token[]): string {
    let str = '';
    for (const tok of toks) {
        if (tok.type === TokenType.None) {
        } else if (tok.type === TokenType.Comment)
            str += '# ' + tok.value + '\n';
        else if (tok.type === TokenType.CString)
            str += JSON.stringify(tok.value) + 'c ';
        else if (tok.type === TokenType.String)
            str += JSON.stringify(tok.value) + ' ';
        else if (tok.type === TokenType.Integer) str += tok.value + ' ';
        else if (tok.type === TokenType.Word) str += tok.value + ' ';
    }
    return str.substring(0, str.length - 1);
}
export function humanTokenType(type: TokenType): string {
    if (type === TokenType.CString) return 'CString';
    else if (type === TokenType.Integer) return 'Integer';
    else if (type === TokenType.None) assert(false, 'This should never happen');
    else if (type === TokenType.String) return 'String';
    else if (type === TokenType.Word) return 'Word';
    else if (type === TokenType.CharCode) return 'CharCode';
    else if (type === TokenType.Comment) return 'Comment';
    else assert(false, 'This should never happen');
}
export const DISALLOWED_NAME_TOKENS = [':', ' ', '\n', '\r', '\t', '\v'];
export function nameIsValid(name: string): boolean {
    for (const tok of DISALLOWED_NAME_TOKENS) if (name.includes(tok)) return false;
    return true;
}