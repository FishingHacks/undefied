import chalk from 'chalk';
import { error } from '../errors';
import { EnhancedType, Type } from '../types';
import { stringMultiply } from './general';

export function humanType(type: Type | EnhancedType) {
    if (typeof type === 'number') return $humanType(type);
    else return humanEnhancedType(type);
}
export function enhancedTypeEqual(a: EnhancedType, b: EnhancedType) {
    if (a.pointerCount !== b.pointerCount) return false;
    if (
        a.types.length === 1 &&
        b.types.length === 1 &&
        a.types[0] === Type.Any &&
        b.types[0] === Type.Any &&
        a.pointerCount === b.pointerCount
    )
        return true;
    if (isAny(a) || isAny(b)) return true;
    for (let i = 0; i < a.types.length; i++) {
        if (b.types[i] !== a.types[i]) return false;
    }
    if ((a.filledWith?.length || 0) !== (b.filledWith?.length || 0))
        return false;
    if (a.filledWith && b.filledWith)
        for (let i = 0; i < a.filledWith.length; i++) {
            if (b.filledWith[i] !== a.filledWith[i]) return false;
        }
    return true;
}
export function humanEnhancedType(type: EnhancedType) {
    if (type.typeName) {
        let str = type.typeName;
        if (type.filledWith && type.filledWith.length > 0)
            str +=
                '<' + type.filledWith.map(humanEnhancedType).join(', ') + '>';
        str += stringMultiply(' ptr-to', type.pointerCount);
        return str;
    } else {
        return type.types
            .map(
                (el) =>
                    $humanType(el) +
                    stringMultiply(' ptr-to', type.pointerCount)
            )
            .join(' ');
    }
}
export function getEnhancedTypes(types: EnhancedType[]) {
    if (types.length < 1) return chalk.gray(chalk.italic('<empty>'));
    return types.map((el) => humanEnhancedType(el)).join(' ');
}
export function $humanType(type: Type) {
    if (type === Type.Bool) return 'bool';
    else if (type === Type.Int) return 'int';
    else if (type === Type.Ptr) return 'ptr';
    else return 'unknown type with id ' + type;
}
export function createEnhancedType(
    type: Type | Type[],
    typeName?: string,
    pointerCount?: number,
    filledWith?: EnhancedType[] | Type[]
): EnhancedType {
    if (!(type instanceof Array)) type = [type];
    pointerCount ||= 0;
    if (filledWith)
        filledWith = filledWith.map((el) =>
            typeof el === 'number'
                ? {
                      types: [el],
                      pointerCount: 0,
                  }
                : el
        );
    return {
        types: type,
        pointerCount,
        filledWith: filledWith as EnhancedType[] | undefined,
        typeName,
    };
}
export function isAny(type: Type | EnhancedType) {
    if (typeof type === 'number') return type === Type.Any;
    else
        return (
            type.types.length === 1 &&
            type.pointerCount === 0 &&
            type.types[0] === Type.Any
        );
}
export function typeToEnhancedType(type: Type | EnhancedType): EnhancedType {
    if (typeof type === 'number') return { types: [type], pointerCount: 0 };
    else return type;
}
export function typeEqual(a?: Type | EnhancedType, b?: Type | EnhancedType) {
    if (a === undefined || b === undefined) return false;
    else if (isAny(a) || isAny(b)) return true;
    return enhancedTypeEqual(typeToEnhancedType(a), typeToEnhancedType(b));
}
export function getTypes(types: (Type | EnhancedType)[]) {
    return getEnhancedTypes(types.map(typeToEnhancedType));
}
export function exactMatch(a: Type | EnhancedType, b: Type | EnhancedType) {
    if (typeof b === 'number') {
        if (typeof a !== 'number')
            return !(
                a.pointerCount > 0 ||
                a.types.length !== 1 ||
                a.types[0] !== b
            );
        else return a === b;
    } else {
        const newA = typeToEnhancedType(a);
        if (
            newA.pointerCount !== b.pointerCount ||
            newA.types.length !== b.types.length
        )
            return false;
        for (let i = 0; i < b.types.length; i++) {
            if (newA.types[i] !== b.types[i]) return false;
        }
        return true;
    }
}
export function flatType(types: EnhancedType[]): EnhancedType[] {
    const newTypes: EnhancedType[] = [];

    for (const t of types) {
        if (t.types.length === 1) newTypes.push(t);
        else if (t.types.length > 1) {
            newTypes.push(
                ...t.types.map((type) =>
                    createEnhancedType(
                        type,
                        t.typeName,
                        t.pointerCount,
                        t.filledWith
                    )
                )
            );
        }
    }

    return newTypes;
}
