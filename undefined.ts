import { readFile } from 'fs/promises';

type Loc = [string, number, number];

interface Token {
    loc: Loc;
    value: string | number;
    type: TokenType;
}
enum TokenType {
    Word,
    String,
    CString,
    Integer,
    None,
}

async function generateTokens(file: string) {
    const lines = (await readFile(file)).toString().split('\n');
    let location: Loc = [file, 0, 0];
    let value = '';
    let type: TokenType = TokenType.None;
    let tokens: Token[] = [];

    for (const i in lines) {
        const l = Number(i);
        const line = lines[l];
        const characters = Object.values(line);
        for (const j in characters) {
            const c = Number(j);
            const character = line[c];

            if (character === ' ') {
                if (type !== TokenType.None) {
                    if (type === TokenType.Integer) {
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
            } else if (character === '"' && (type === TokenType.None || TokenType.String)) {
                if (type !== TokenType.None && type !== TokenType.String)
                    throw new Error('`"` in a non-string definition');
                if (type === TokenType.None) {
                    location = [file, l + 1, c + 1];
                    type = TokenType.String;
                } else {
                    tokens.push({ type, value, loc: location });
                    type = TokenType.None;
                    value = '';
                }
            } else if (
                character === 'c' &&
                value === '' &&
                tokens[tokens.length - 1].type === TokenType.String
            ) {
                tokens[tokens.length - 1].type = TokenType.CString;
            } else if (
                (type === TokenType.None ||
                type === TokenType.Integer) && character.match(/^[0-9]$/))
             {
                if (type === TokenType.None) {
                    type = TokenType.Integer;
                    location = [file, l + 1, c + 1];
                }
                value += c;
            } else {
                if (type === TokenType.None) {
                    type = TokenType.Word;
                    location = [file, l + 1, c + 1];
                }
                value += c;
            }
        }
    }
}
