export type TypeCheckStack = {
    loc: Loc;
    type: Type;
}[];

export type Loc = [string, number, number];

export interface Program {
    ops: Operation[];
    memorysize: number;
    mainop: number | undefined;

    contracts: Record<number, { ins: Type[]; outs: Type[]; used: boolean }>;
}

export enum Type {
    Int,
    Bool,
    Ptr,
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
    
    Shl,
    Shr,
    Or,
    And,
    Not,
    Xor,
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
    BindLet
}

export type Operation =
    | {
          type: OpType.Intrinsic;
          location: Loc;
          token: Token;
          operation: Intrinsic;
      }
    | {
          type: OpType.PushCString | OpType.PushString;
          location: Loc;
          token: Token;
          operation: string;
      }
    | {
          type: OpType.PushInt | OpType.PushMem | OpType.Call | OpType.Ret;
          location: Loc;
          token: Token;
          operation: number;
      }
    | {
          type: OpType.Keyword;
          location: Loc;
          reference?: number;
          token: Token;
          operation: Keyword;
      }
    | {
          type: OpType.PrepFn | OpType.SkipFn;
          location: Loc;
          token: Token;
          operation: number;
      }
    | {
          type: OpType.Const;
          operation: number;
          _type: Type;
          token: Token;
          location: Loc;
      }
    | {
          type: OpType.PushAsm;
          location: Loc;
          token: Token;
          operation: string;
      };

export type Token =
    | {
          loc: Loc;
          value: number;
          type: TokenType.Integer;
      }
    | {
          loc: Loc;
          value: string;
          type: TokenType.CString | TokenType.String | TokenType.Word;
      };
export enum TokenType {
    Word,
    String,
    CString,
    Integer,
    CharCode,
    None,
}