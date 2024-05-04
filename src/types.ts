export type TypeCheckStack = {
    loc: Loc;
    type: EnhancedType;
}[];

export type Loc = [string, number, number];

export interface Contract {
    ins: { type: EnhancedType; loc: Loc }[];
    outs: { type: EnhancedType; loc: Loc }[];
    used: boolean;
    prep: Operation;
    skip: Operation;
    name: string;
    index: number;
}

export interface Memory {
    size: number;
    type: Type;
}

export interface Program {
    ops: Operation[];
    mainop: number | undefined;
    mems: Record<string, Memory>;
    contracts: Record<number, Contract>;
    functionsToRun: number[];
}

export enum Type {
    Int,
    Bool,
    Ptr,
    Any,
}

export interface EnhancedType {
    types: Type[];
    pointerCount: number;
    typeName?: string;
    filledWith?: EnhancedType[];
}

export enum Intrinsic {
    Print,
    Here,
    StackInfo,

    Plus,
    Minus,
    Multiply,
    DivMod,

    LessThan,
    LessThanEqual,
    GreaterThan,
    GreaterThanEqual,
    Equal,
    NotEqual,

    Drop,
    Dup,
    Over,
    Swap,
    Rot,

    Syscall1,
    Syscall2,
    Syscall3,
    Syscall4,
    Syscall5,
    Syscall6,
    Load,
    Store,
    Load16,
    Store16,
    Load32,
    Store32,
    Load64,
    Store64,
    Argv,

    CastPtr,
    CastBool,
    CastInt,

    fakeDrop,
    fakePtr,
    fakeBool,
    fakeInt,
    fakeAny,

    Shl,
    Shr,
    Or,
    And,
    Not,
    Xor,

    None,
}

export enum Keyword {
    If,
    End,
    Else,
    While,
    Memory,
    Fn,
    In,
    Splitter,
    IfStar,
    Struct,
}

export enum OpType {
    Intrinsic,
    Keyword,
    PushInt,
    PushString,
    PushCString,
    PushMem,
    SkipFn,
    PrepFn,
    Ret,
    Call,
    Const,
    PushAsm,
    BindLet,
    Comment,
}

export type Operation = {
    location: Loc;
    token: Token;
    parameters?: Record<string, string>;
    ip: number;
} & (
    | {
          type: OpType.Intrinsic;
          operation: Intrinsic;
      }
    | {
          type: OpType.PushCString | OpType.PushString;
          operation: string;
      }
    | {
          type: OpType.PushInt;
          operation: number;
      }
    | {
          type: OpType.Ret;
          operation: number;
          functionEnd: boolean;
      }
    | {
          type: OpType.PushMem;
          operation: string;
      }
    | {
          type: OpType.Call;
          operation: number;
          functionName: string;
      }
    | {
          type: OpType.Keyword;
          reference?: number;
          operation: Keyword;
      }
    | {
          type: OpType.PrepFn | OpType.SkipFn;
          operation: number;
          functionName: string;
      }
    | {
          type: OpType.Const;
          operation: number;
          _type: Type;
      }
    | {
          type: OpType.PushAsm;
          operation: string;
      }
    | {
          type: OpType.Comment;
          operation: string;
      }
);

export type ValueToken<T extends TokenType, V extends any> = {
    value: V;
    type: T;
};

export type IntegerToken = ValueToken<TokenType.Integer, number>;
export type StringToken = ValueToken<
    TokenType.String | TokenType.CString,
    string
>;
export type WordToken = ValueToken<TokenType.Word, string>;
export type CommentToken = ValueToken<TokenType.Comment, string>;
export type ControlToken = {
    args?: Record<string, unknown>;
} & ValueToken<TokenType.Control, string>;
export type NullToken = ValueToken<TokenType.None, string>;

export type Token = { loc: Loc } & (
    | IntegerToken
    | StringToken
    | WordToken
    | CommentToken
    | ControlToken
    | NullToken
);
export enum TokenType {
    Word,
    String,
    CString,
    Integer,
    CharCode,
    None,
    Comment,
    Control,
}

export interface CompilerParameters {
    program: Program;
    optimizations: '0' | '1';
    filename?: string;
    external?: string[];
    dontRunFunctions?: boolean;
    dev?: boolean;
    unsafe?: boolean;
}
export type CompileFunction = (parameters: CompilerParameters) => void;

export interface Compiler {
    compile: CompileFunction;
    removeFiles: string[];
    runProgram: (file: string, args: string[]) => void | Promise<void>;
}
