import { join } from 'path';
import { Intrinsic, Keyword, Type } from './types';

export const typeNames = {
    int: Type.Int,
    bool: Type.Bool,
    ptr: Type.Ptr,
    any: Type.Any,
};

export const IntrinsicNames = {
    '+': Intrinsic.Plus,
    '-': Intrinsic.Minus,
    '*': Intrinsic.Multiply,
    '/%': Intrinsic.DivMod,
    print: Intrinsic.Print,
    syscall1: Intrinsic.Syscall1,
    syscall2: Intrinsic.Syscall2,
    syscall3: Intrinsic.Syscall3,
    syscall4: Intrinsic.Syscall4,
    syscall5: Intrinsic.Syscall5,
    syscall6: Intrinsic.Syscall6,
    drop: Intrinsic.Drop,
    dup: Intrinsic.Dup,
    over: Intrinsic.Over,
    swap: Intrinsic.Swap,
    '=': Intrinsic.Equal,
    '@': Intrinsic.Load,
    '!': Intrinsic.Store,
    '@16': Intrinsic.Load16,
    '!16': Intrinsic.Store16,
    '@32': Intrinsic.Load32,
    '!32': Intrinsic.Store32,
    '@64': Intrinsic.Load64,
    '!64': Intrinsic.Store64,
    '!=': Intrinsic.NotEqual,
    here: Intrinsic.Here,
    argv: Intrinsic.Argv,
    '???': Intrinsic.StackInfo,
    'cast(bool)': Intrinsic.CastBool,
    'cast(int)': Intrinsic.CastInt,
    'cast(ptr)': Intrinsic.CastPtr,
    '<': Intrinsic.LessThan,
    '<=': Intrinsic.LessThanEqual,
    '>': Intrinsic.GreaterThan,
    '>=': Intrinsic.GreaterThanEqual,
    shr: Intrinsic.Shr,
    shl: Intrinsic.Shr,
    or: Intrinsic.Or,
    and: Intrinsic.And,
    not: Intrinsic.Not,
    xor: Intrinsic.Xor,
    rot: Intrinsic.Rot,
    'fake(drop)': Intrinsic.fakeDrop,
    'fake(bool)': Intrinsic.fakeBool,
    'fake(ptr)': Intrinsic.fakePtr,
    'fake(int)': Intrinsic.fakeInt,
    'fake(any)': Intrinsic.fakeAny,
};

export const KeywordNames = {
    if: Keyword.If,
    end: Keyword.End,
    else: Keyword.Else,
    while: Keyword.While,
    memory: Keyword.Memory,
    fn: Keyword.Fn,
    in: Keyword.In,
    '--': Keyword.Splitter,
    'if*': Keyword.IfStar,
    struct: Keyword.Struct,
};

export const INCLUDE_DIRECTORY = join(__dirname, '../std');

export const INFO = {
    name: 'Undefied',
    versionDetailed: {
        major: 1,
        minor: 2,
        patchLevel: 0,
    },
    version: '',
} as const;

Reflect.defineProperty(INFO, 'version', {
    set: (v) => {},
    get() {
        return `${INFO.versionDetailed.major}.${INFO.versionDetailed.minor}.${INFO.versionDetailed.patchLevel}`;
    },
});
