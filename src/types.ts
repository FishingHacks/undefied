export type TypeCheckStack = {
    loc: Loc;
    type: Type;
}[];

export type Loc = [string, number, number];

export interface Program {
    ops: Operation[];
    mainop: number | undefined;
    mems: Record<string, number>;
    contracts: Record<number, { ins: Type[]; outs: Type[]; used: boolean }>;
}

export enum Type {
    Int,
    Bool,
    Ptr,
    Any,
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

export type Operation = { location: Loc; token: Token; parameters?: string[] } & (
    | {
          type: OpType.Intrinsic;
          operation: Intrinsic;
      }
    | {
          type: OpType.PushCString | OpType.PushString;
          operation: string;
      }
    | {
          type: OpType.PushInt | OpType.Ret;
          operation: number;
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

export type Token =
    | {
          loc: Loc;
          value: number;
          type: TokenType.Integer;
      }
    | {
          loc: Loc;
          value: string;
          type:
              | TokenType.CString
              | TokenType.String
              | TokenType.Word
              | TokenType.Comment;
      };
export enum TokenType {
    Word,
    String,
    CString,
    Integer,
    CharCode,
    None,
    Comment,
}

export type compiler = ({
    optimizations,
    program,
    filename,
}: {
    program: Program;
    optimizations: '0' | '1';
    filename?: string;
}) => void;
