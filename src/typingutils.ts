import { inspect } from 'util';

// Constants
export const nothing = Symbol('__nothing__');

type jsonstringifyreplacer =
    | (number | string)[]
    | ((this: any, key: string, value: any) => any);
type jsonstringifyArgs = [
    any,
    jsonstringifyreplacer | undefined,
    string | number | undefined
];

export function JsonStringify(
    value: any,
    replacer?: jsonstringifyreplacer,
    space?: string | number
): CanError<undefined | string> {
    return toCanError<string | undefined, jsonstringifyArgs>(
        JSON.stringify as any,
        value,
        replacer,
        space
    );
}
export function MaybeJsonStringify(
    value: any,
    replacer?: jsonstringifyreplacer,
    space?: string | number
): Maybe<undefined | string> {
    return canErrorToMaybe(JsonStringify(value, replacer, space));
}

export function isNull(value: any): value is null {
    return value === null;
}
export function isUndefined(value: any): value is undefined {
    return value === undefined;
}
export function isNil(value: any): value is undefined | null {
    return value === undefined || value === null;
}
export function isStr(value: any): value is string {
    return typeof value === 'string';
}
export function isArray(value: any): value is any[] {
    return Array.isArray(value);
}
export function isObj(value: any): value is Remove<object, Array<any>> {
    if (isArray(value)) return false;
    return typeof value === 'object';
}
export function isBigInt(value: any): value is BigInt {
    return typeof value === 'bigint';
}
export function isFn(value: any): value is Function {
    return typeof value === 'function';
}
export function isNum(value: any): value is number {
    return typeof value === 'number';
}
export function isSymbol(value: any): value is symbol {
    return typeof value === 'symbol';
}
export function makeError(e: any): string | Error {
    if (!canBeStringified(e)) return new Error();
    else if (e instanceof Error) return e as Error;
    else return maybeOrValue(stringifyMaybe(e), 'unknown error');
}

export function canBeStringified(
    value: any
): value is Remove<any, undefined | null> {
    return !isNil(value);
}
export function stringify(value: any): CanError<string> {
    if (isNil(value)) canErrorError('Value cannot be stringified');
    else if (isArray(value) || isStr(value))
        return toCanError(JSON.stringify, value);
    else if (isObj(value)) return canErrorValue(inspect(value));
    else if (isBigInt(value)) return canErrorValue(value.toString() + 'n');
    return canErrorValue<string>(value.toString());
}
export function stringifyMaybe(value: any): Maybe<string> {
    return canErrorToMaybe(stringify(value));
}

export function getErrorName(error: string|Error): string {
    if (isStr(error)) return error;
    else return error.name;
}
export function maybeOrValue<T>(value: Maybe<T>, fallback: T): T {
    if (isNothing(value)) return fallback;
    return value;
}
export function maybeToCanError<T>(value: Maybe<T>): CanError<T> {
    if (isNothing(value)) return { value: nothing, error: new Error() };
    else return { value, error: nothing };
}
export function canErrorToMaybe<T>(value: CanError<T>): Maybe<T> {
    if (hasErrored(value)) return nothing;
    return value.value;
}
export function canErrorValue<T>(value: T): CanError<T> {
    return { error: nothing, value };
}
export function canErrorError(error: Error | string): CanError<any> {
    return { value: nothing, error };
}
export function isNothing(value: Nothing | any): value is Nothing {
    return value === nothing;
}
export function hasErrored(
    value: CanError<any>
): value is { value: Nothing; error: Error | string } {
    return !isNothing(value.error);
}
export function throwIfError<T>(value: CanError<T>): T {
    if (hasErrored(value)) throw value.error;
    return value.value;
}
export function maybeError<T extends NotMaybe<any>>(
    value: Maybe<T>
): NotMaybe<T> {
    if (isNothing(value)) throw new Error();
    else return value as NotMaybe<T>;
}
export function toCanError<T, K extends Array<any>>(
    fn: (...args: K) => T,
    ...args: K
): CanError<T> {
    try {
        return { value: fn(...args), error: nothing };
    } catch (e: any) {
        return canErrorError(makeError(e));
    }
}
export function toMaybe<T, K extends Array<any>>(
    fn: (...args: K) => T,
    ...args: K
): Maybe<T> {
    try {
        return fn(...args);
    } catch {
        return nothing;
    }
}

// Types
export type Optional<T extends {}> = { [K in keyof T]+?: T[K] | undefined };
export type Required<T extends {}> = { [K in keyof T]-?: T[K] | undefined };
export type Maybe<T> = T | Nothing;
export type Nothing = typeof nothing;
export type CanError<T> =
    | { value: T; error: Nothing }
    | { value: Nothing; error: Error | string };
export type NotMaybe<T> = T extends Nothing ? never : T;
export type Remove<T, K> = T extends K ? never : T;
