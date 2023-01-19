export function parseHexDig(dig: string) {
    dig = dig.toLowerCase();

    if (cc(dig) >= cc('0') && cc(dig) <= cc('9')) return cc(dig) - cc('0');
    else if (cc(dig) >= cc('a') && cc(dig) <= cc('f')) return cc(dig) - cc('a') + 10;
    else throw new Error('Digit ' + dig + ' is not a hexadecimal value');
}

export function parseBinDig(dig: string) {
    if (dig === '1') return 1;
    else if (dig === '0') return 0;
    else throw new Error('Digit ' + dig + ' is not a binary digit');
}

export function parseOctalDig(dig: string) {
    if (cc(dig) >= cc('0') && cc(dig) <= cc('7')) return cc(dig) - cc('0');
    else throw new Error('Digit ' + dig + ' is not a octal digit');
}

export function cc(char: string): number {return char.charCodeAt(0)}



export function parseHexValue(value: string) {
    return parseValue(value, 16, parseHexDig);
}
export function parseBinValue(value: string) {
    return parseValue(value, 2, parseBinDig);
}
export function parseOctalValue(value: string) {
    return parseValue(value, 7, parseOctalDig);
}

export function parseValue(value: string, system: number, parser: (dig: string) => number) {
    let val = 0;
    for (const c of Object.values(value)) {
        val *= system;
        val += parser(c);
    }
    return val;
}