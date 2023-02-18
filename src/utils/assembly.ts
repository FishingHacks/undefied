export function nasmLabelIsValid(label: string): boolean {
    if (label[0] === '.') return false;
    if (!label.endsWith(':')) return false;
    return (
        /^[0-9a-zA-Z_$#@~.?\n]+$/.exec(label.substring(0, label.length - 1)) !==
        null
    );
}
