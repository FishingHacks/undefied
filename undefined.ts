import { open, readFile } from "fs/promises";
import { join } from "path";
import chalk from "chalk";
import { format } from "util";
import assert from "assert";
import { spawnSync } from "child_process";
import { cp, existsSync } from "fs";

const INCLUDE_DIRECTORY = join(process.argv[1], "../std");

type Loc = [string, number, number];

interface Program {
  ops: Operation[];
  memorysize: number;

  contracts: Record<number, { ins: Type[]; outs: Type[] }>;
}

enum Type {
  Int,
  Bool,
  Ptr,
}

enum Intrinsic {
  Plus,
  Minus,
  Multiply,
  DivMod,
  Drop,
  Dup,
  Over,
  Swap,
  Print,
  Syscall1,
  Syscall2,
  Syscall3,
  Syscall4,
  Syscall5,
  Syscall6,
  Equal,
  Load,
  Store,
  Load64,
  Store64,
  NotEqual,
  Here,
  Argv,
  StackInfo,
  CastPtr,
  CastBool,
  CastInt,
}

enum Keyword {
  If,
  End,
  Else,
  While,
  Memory,
  Fn,
  In,
  Splitter,
}

enum OpType {
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
}

type Operation =
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
    };

type Token =
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
enum TokenType {
  Word,
  String,
  CString,
  Integer,
  None,
}

function humanTokenType(type: TokenType) {
  if (type === TokenType.CString) return "CString";
  else if (type === TokenType.Integer) return "Integer";
  else if (type === TokenType.None) assert(false, "This should never happen");
  else if (type === TokenType.String) return "String";
  else if (type === TokenType.Word) return "Word";
  else assert(false, "This should never happen");
}

async function generateTokens(file: string) {
  const lines = (await readFile(file))
    .toString()
    .split("\n")
    .map((el) => (el.endsWith("\r") ? el.substring(0, el.length - 1) : el));
  let location: Loc = [file, 0, 0];
  let value = "";
  let type: TokenType = TokenType.None;
  let tokens: Token[] = [];

  for (const i in lines) {
    const l = Number(i);
    const line = lines[l];
    const characters = Object.values(line);
    for (const j in characters) {
      const c = Number(j);
      const character = line[c];

      if (character === "#") break;
      else if (character === " " && type !== TokenType.String) {
        if (type !== TokenType.None) {
          if (type === TokenType.Integer) {
            tokens.push({
              loc: location,
              type,
              value: parseInt(value),
            });
          } else if (type === TokenType.Word) {
            tokens.push({ loc: location, type, value });
          } else compilerError(location, "unreachable");
        }
        type = TokenType.None;
        value = "";
      } else if (character === '"') {
        if (type !== TokenType.None && type !== TokenType.String)
          throw new Error('`"` in a non-string definition');
        if (type === TokenType.None) {
          location = [file, l + 1, c + 1];
          type = TokenType.String;
        } else {
          tokens.push({ loc: location, type, value: escapeStr(value) });
          type = TokenType.None;
          value = "";
        }
      } else if (
        character === "c" &&
        value === "" &&
        tokens[tokens.length - 1].type === TokenType.String
      ) {
        tokens[tokens.length - 1].type = TokenType.CString;
      } else if (
        (type === TokenType.None || type === TokenType.Integer) &&
        character.match(/^[0-9]$/)
      ) {
        if (type === TokenType.None) {
          type = TokenType.Integer;
          location = [file, l + 1, c + 1];
        }
        value += character;
      } else {
        if (type === TokenType.None) {
          type = TokenType.Word;
          location = [file, l + 1, c + 1];
        } else if (type === TokenType.Integer) type = TokenType.Word;

        value += character;
      }
    }
    if (type !== TokenType.None) {
      if (type !== TokenType.Integer) {
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
    value = "";
  }
  if (type !== TokenType.None) {
    if (type === TokenType.Integer)
      tokens.push({
        loc: location,
        type,
        value: parseInt(value),
      });
    else if (type === TokenType.Word)
      tokens.push({ loc: location, type, value });
    else compilerError(location, 'Error: Expected `"`, found nothing');
  }
  return tokens;
}

async function parseProgram(tokens: Token[]): Promise<Program> {
  const memories: Record<string, number> = {};
  const functions: Record<string, number> = {};
  const program: Program = { ops: [], memorysize: 0, contracts: {} };

  let ip = 0;
  while (ip < tokens.length) {
    const token = tokens[ip];
    if (token.type === TokenType.CString)
      program.ops.push({
        location: token.loc,
        token,
        operation: token.value,
        type: OpType.PushCString,
      });
    else if (token.type === TokenType.String)
      program.ops.push({
        location: token.loc,
        token,
        operation: token.value,
        type: OpType.PushString,
      });
    else if (token.type === TokenType.Integer)
      program.ops.push({
        location: token.loc,
        token,
        operation: token.value,
        type: OpType.PushInt,
      });
    else if (token.type === TokenType.Word && token.value === "memory") {
      ip++;
      const name = tokens[ip];
      if (!name) compilerError(token.loc, "Expected Word but got nothing");
      if (name.type !== TokenType.Word)
        compilerError(
          token.loc,
          "Expected Word but got " + humanTokenType(name.type)
        );
      if (
        KeywordNames[name.value as keyof typeof KeywordNames] !== undefined ||
        memories[name.value] !== undefined ||
        functions[name.value] !== undefined ||
        IntrinsicNames[name.value as keyof typeof IntrinsicNames] !== undefined
      )
        compilerError(
          token.loc,
          "Redefinition of memory, function, Intrinsic or Keyword is not allowed"
        );
      ip++;
      const size = tokens[ip];
      if (!size) compilerError(name.loc, "Expected Integer but got nothing");
      if (size.type !== TokenType.Integer)
        compilerError(
          size.loc,
          "Expected Integer but got " + humanTokenType(size.type)
        );
      ip++;
      const end = tokens[ip];
      if (!end)
        compilerError(size.loc, "Expected `end` Keyword, but got nothing");
      if (end.type !== TokenType.Word)
        compilerError(
          end.loc,
          "Expected Word but got " + humanTokenType(size.type)
        );
      if (end.value !== "end")
        compilerError(
          end.loc,
          "Expected `end` Keyword, but got `" + end.value + "`"
        );
      if (isNaN(Number(size.value))) assert(false, "unreachable");
      program.memorysize += Number(size.value);
    } else if (token.type === TokenType.Word && token.value === "fn") {
      ip++;
      const name = tokens[ip];
      if (!name)
        compilerError(token.loc, "Error: Expected Word but found nothing");
      if (name.type !== TokenType.Word)
        compilerError(
          token.loc,
          "Error: Expected Word but found " + humanTokenType(name.type)
        );

      if (
        KeywordNames[name.value as keyof typeof KeywordNames] !== undefined ||
        memories[name.value] !== undefined ||
        functions[name.value] !== undefined ||
        IntrinsicNames[name.value as keyof typeof IntrinsicNames] !== undefined
      )
        compilerError(
          token.loc,
          "Redefinition of memory, function, Intrinsic or Keyword is not allowed"
        );

      const ins: Type[] = [];
      const outs: Type[] = [];
      let isAtIns = true;

      ip++;
      while (ip < tokens.length) {
        const typeorsplit = tokens[ip];
        if (typeorsplit.type !== TokenType.Word)
          compilerError(
            typeorsplit.loc,
            "Expected Word, but found " + humanTokenType(typeorsplit.type)
          );
        if (
          typeorsplit.value !== "--" &&
          typeorsplit.value !== "in" &&
          typeNames[typeorsplit.value as keyof typeof typeNames] === undefined
        )
          compilerError(
            token.loc,
            "Expected a Type, -- or in, found " + typeorsplit.value
          );

        if (typeorsplit.value === "in") break;
        else if (typeorsplit.value === "--" && !isAtIns)
          compilerError(
            token.loc,
            "Found -- more than once in the function contract"
          );
        else if (typeorsplit.value === "--") isAtIns = false;
        else if (
          typeNames[typeorsplit.value as keyof typeof typeNames] !== undefined
        )
          (isAtIns ? ins : outs).push(
            typeNames[typeorsplit.value as keyof typeof typeNames]
          );
        else assert(false, "Unreachable");

        ip++;
      }
      if (tokens[ip].value !== "in")
        compilerError(token.loc, "Expected in but found " + tokens[ip].value);

      program.ops.push({
        location: token.loc,
        token,
        operation: 0,
        type: OpType.SkipFn,
      });

      program.contracts[program.ops.length] = { ins, outs };
      functions[name.value] = program.ops.length;
      program.ops.push({
        location: token.loc,
        token,
        operation: 0,
        type: OpType.PrepFn,
      });
    } else if (token.type === TokenType.Word && token.value === "include") {
      ip++;
      const path = tokens[ip];
      if (!path) compilerError(token.loc, "Expected String but found nothing");
      if (path.type !== TokenType.String)
        compilerError(
          path.loc,
          "Expected String but found " + humanTokenType(path.type)
        );

      const file = join(
        INCLUDE_DIRECTORY,
        path.value +
          (path.value.toString().endsWith(".undefied") ? "" : ".undefied")
      );
      if (!existsSync(file)) compilerError(path.loc, "File does not exist");
      console.log("Including", file);
      const generatedTokens = await generateTokens(file);
      generatedTokens.push(...tokens.slice(ip + 1));
      tokens = generatedTokens;
      ip = -1;
    } else {
      if (
        IntrinsicNames[token.value as keyof typeof IntrinsicNames] ===
          undefined &&
        KeywordNames[token.value as keyof typeof KeywordNames] === undefined &&
        memories[token.value] === undefined &&
        functions[token.value] === undefined
      ) {
        throw new Error(
          'Word "' +
            token.value +
            '" is not an Intrinsic, Keyword, function or memory name'
        );
      } else if (
        IntrinsicNames[token.value as keyof typeof IntrinsicNames] !== undefined
      )
        program.ops.push({
          location: token.loc,
          token,
          operation: IntrinsicNames[token.value as keyof typeof IntrinsicNames],
          type: OpType.Intrinsic,
        });
      else if (
        KeywordNames[token.value as keyof typeof KeywordNames] !== undefined
      )
        program.ops.push({
          location: token.loc,
          token,
          operation: KeywordNames[token.value as keyof typeof KeywordNames],
          type: OpType.Keyword,
        });
      else if (memories[token.value] !== undefined)
        program.ops.push({
          location: token.loc,
          token,
          type: OpType.PushMem,
          operation: memories[token.value],
        });
      else if (functions[token.value] !== undefined)
        program.ops.push({
          location: token.loc,
          token,
          type: OpType.Call,
          operation: functions[token.value],
        });
      else {
        console.log(token);
        compilerError(token.loc, "Unknown error");
      }
    }
    ip++;
  }

  return program;
}

function crossReferenceProgram(program: Program): Program {
  const stack: string[] = [];
  let _ip: string | undefined;
  let _op: Operation;

  for (const ip in program.ops) {
    const op = program.ops[ip];

    if (op.type === OpType.Keyword) {
      switch (op.operation) {
        case Keyword.If:
          stack.push(ip);
          break;
        case Keyword.Else:
          _ip = stack.pop();
          if (!_ip)
            compilerError(
              op.location,
              "End expected `if` block, found nothing"
            );
          _op = program.ops[Number(_ip)];
          if (_op.operation !== Keyword.If)
            compilerError(
              _op.location,
              "Expected `if` block, found `" + _op.token.value + "`"
            );
          if (_op.type !== OpType.Keyword)
            compilerError(_op.location, "Expected keyword");
          else _op.reference = Number(ip) + 1;
          stack.push(ip);

          break;
        case Keyword.End:
          _ip = stack.pop();
          if (!_ip)
            compilerError(
              op.location,
              "End expected `if` block, found nothing"
            );
          _op = program.ops[Number(_ip)];
          if (_op.type === OpType.SkipFn) {
            _op.operation = Number(ip) + 1;
            program.ops[ip] = {
              type: OpType.Ret,
              location: op.location,
              token: op.token,
              operation: 0,
            };
            break;
          }
          if (_op.type !== OpType.Keyword) break;
          if (
            ![Keyword.Else, Keyword.If, Keyword.While].includes(_op.operation)
          )
            compilerError(
              _op.location,
              "End can only end `if` or `while` blocks, found `" +
                _op.token.value +
                "`"
            );
          if (_op.operation === Keyword.While) {
            op.reference = Number(_ip);
            _op.reference = Number(ip) + 1;
          } else _op.reference = Number(ip);

          break;
        case Keyword.While:
          stack.push(ip);
          break;
      }
    } else if (op.type === OpType.SkipFn) {
      stack.push(ip);
    }
  }

  assert(stack.length === 0, "Stack is not empty");

  return program;
}

function humanType(type: Type) {
  if (type === Type.Bool) return "bool";
  else if (type === Type.Int) return "int";
  else if (type === Type.Ptr) return "ptr";
  else return "unknown type with id " + type;
}

function $typecheckProgram(
  program: Program,
  stack: { loc: Loc; type: Type }[]
) {
  const functionBodies: {
    fip: number;
    body: Operation[];
    loc: Loc;
    endLoc: Loc;
  }[] = [];
  const stackSnapshot: Type[][] = [];

  let ip = 0;
  while (ip < program.ops.length) {
    const op = program.ops[ip];
    if (op.type === OpType.SkipFn) {
      functionBodies.push({
        fip: ip + 1,
        body: program.ops.slice(ip + 2, op.operation - 1),
        loc: op.location,
        endLoc: program.ops[op.operation].location,
      });
      ip = op.operation - 1;
    } else if (op.type === OpType.PrepFn)
      assert(false, "Reached prepfn.. This should never happend");
    else if (op.type === OpType.Ret) assert(false, "This should never happen");
    else if (op.type === OpType.Call) {
      const contract = program.contracts[op.operation];
      if (!contract) compilerError(op.location, "No contract found");
      if (stack.length < contract.ins.length)
        compilerError(
          op.location,
          "The stack has not enough elements (" +
            stack.length +
            " elements on the stack, " +
            contract.ins.length +
            " elements needed)"
        );
      for (const t of contract.ins) {
        const stackType = stack.pop();
        if (stackType === undefined)
          compilerError(op.location, "The stack has not enough elements"); // should never happen
        if (t !== stackType?.type)
          compilerError(
            op.location,
            "Type does not match, " +
              humanType(t) +
              " required, " +
              humanType(stackType?.type || -1) +
              " supplied"
          );
      }
      for (const t of contract.outs) {
        stack.push({ loc: op.location, type: t });
      }
    } else if (op.type === OpType.PushCString)
      stack.push({ loc: op.location, type: Type.Ptr });
    else if (op.type === OpType.PushInt)
      stack.push({ loc: op.location, type: Type.Int });
    else if (op.type === OpType.PushMem)
      stack.push({ loc: op.location, type: Type.Ptr });
    else if (op.type === OpType.PushString)
      stack.push(
        { loc: op.location, type: Type.Int },
        { loc: op.location, type: Type.Ptr }
      );
    else if (op.type === OpType.Intrinsic) {
      switch (op.operation) {
        case Intrinsic.Plus:
        case Intrinsic.Minus:
        case Intrinsic.Multiply:
          var [n1, n2] = [stack.pop(), stack.pop()];
          if (!n1 || !n2)
            compilerError(op.location, "Not enough numbers for this operation");
          if (n1?.type !== Type.Int)
            compilerError(
              op.location,
              "Left-hand operand is not an int, found " +
                humanType(n1?.type || -1)
            );
          if (n2?.type !== Type.Int)
            compilerError(
              op.location,
              "Right-hand operand is not an int, found " +
                humanType(n2?.type || -1)
            );
          stack.push({ loc: op.location, type: Type.Int });
          break;
        case Intrinsic.Argv:
          stack.push({ loc: op.location, type: Type.Ptr });
          break;
        case Intrinsic.DivMod:
          var [n1, n2] = [stack.pop(), stack.pop()];
          if (!n1 || !n2)
            compilerError(op.location, "Not enough numbers for this operation");
          if (n1?.type !== Type.Int)
            compilerError(
              op.location,
              "Left-hand operand is not an int, found " +
                humanType(n1?.type || -1)
            );
          if (n2?.type !== Type.Int)
            compilerError(
              op.location,
              "Right-hand operand is not an int, found " +
                humanType(n2?.type || -1)
            );
          stack.push(
            { loc: op.location, type: Type.Int },
            { loc: op.location, type: Type.Int }
          );
          break;
        case Intrinsic.Drop:
          if (!stack.pop())
            compilerError(
              op.location,
              "Can't drop a value, stack does not have any"
            );
          break;
        case Intrinsic.Here:
          stack.push(
            { loc: op.location, type: Type.Int },
            { loc: op.location, type: Type.Ptr }
          );
          break;
        case Intrinsic.Dup:
          if (stack.length < 1)
            compilerError(
              op.location,
              "Can't dup a value, stack does not have any"
            );
          const v = stack.pop();
          if (!!v) stack.push(v, v);
          break;
        case Intrinsic.Equal:
        case Intrinsic.NotEqual:
          var [v1, v2] = [stack.pop(), stack.pop()];
          if (!v1 || !v2)
            compilerError(op.location, "Stack does not have enough values");
          else if (v1.type !== v2.type)
            compilerError(
              op.location,
              "The type of the values doesn't match (" +
                [humanType(v1.type), humanType(v2.type)]
            );
          else stack.push({ type: Type.Bool, loc: op.location });
          break;
        case Intrinsic.Load:
        case Intrinsic.Load64:
          var ptr = stack.pop();
          if (!ptr)
            compilerError(op.location, "Stack does not contain a pointer");
          else if (ptr.type !== Type.Ptr)
            compilerError(op.location, "Stack does not contain a pointer");
          else stack.push({ type: Type.Int, loc: op.location });
          break;
        case Intrinsic.Over:
          var [v1, v2] = [stack.pop(), stack.pop()];
          if (!v1 || !v2)
            compilerError(
              op.location,
              "Stack does not contain enough values for this operation"
            );
          else stack.push(v2, v1, v2);
          break;
        case Intrinsic.Print:
          var int = stack.pop();
          if (!int)
            compilerError(
              op.location,
              "Stack does not have enough values for this operation"
            );
          else if (int.type !== Type.Int)
            compilerError(
              op.location,
              "Integer expected, found " + humanType(int.type)
            );
          break;
        case Intrinsic.Store:
        case Intrinsic.Store64:
          var [ptr, int] = [stack.pop(), stack.pop()];
          if (!ptr || !int)
            compilerError(op.location, "Stack does not have enough values");
          else if (int.type !== Type.Int || ptr.type !== Type.Ptr)
            compilerError(
              op.location,
              "Expected int ptr, found " +
                humanType(int.type) +
                " " +
                humanType(ptr.type)
            );
          break;
        case Intrinsic.Swap:
          var [v1, v2] = [stack.pop(), stack.pop()];
          if (!v1 || !v2)
            compilerError(
              op.location,
              "Stack does not have enough values for this operation"
            );
          else stack.push(v1, v2);
          break;
        case Intrinsic.Syscall1:
          if (stack.length < 2)
            compilerError(
              op.location,
              "Stack does not contain enough values for this operation"
            );
          if (stack.pop()?.type !== Type.Int)
            compilerError(
              op.location,
              "The top element of the stack is not an Int"
            );
          stack.pop();
          break;
        case Intrinsic.Syscall2:
          if (stack.length < 3)
            compilerError(
              op.location,
              "Stack does not contain enough values for this operation"
            );
          if (stack.pop()?.type !== Type.Int)
            compilerError(
              op.location,
              "The top element of the stack is not an Int"
            );
          stack.pop();
          stack.pop();
          break;
        case Intrinsic.Syscall3:
          if (stack.length < 4)
            compilerError(
              op.location,
              "Stack does not contain enough values for this operation"
            );
          if (stack.pop()?.type !== Type.Int)
            compilerError(
              op.location,
              "The top element of the stack is not an Int"
            );
          stack.pop();
          stack.pop();
          stack.pop();
          break;
        case Intrinsic.Syscall4:
          if (stack.length < 5)
            compilerError(
              op.location,
              "Stack does not contain enough values for this operation"
            );
          if (stack.pop()?.type !== Type.Int)
            compilerError(
              op.location,
              "The top element of the stack is not an Int"
            );
          stack.pop();
          stack.pop();
          stack.pop();
          stack.pop();
          break;
        case Intrinsic.Syscall5:
          if (stack.length < 6)
            compilerError(
              op.location,
              "Stack does not contain enough values for this operation"
            );
          if (stack.pop()?.type !== Type.Int)
            compilerError(
              op.location,
              "The top element of the stack is not an Int"
            );
          stack.pop();
          stack.pop();
          stack.pop();
          stack.pop();
          stack.pop();
          break;
        case Intrinsic.Syscall6:
          if (stack.length < 7)
            compilerError(
              op.location,
              "Stack does not contain enough values for this operation"
            );
          if (stack.pop()?.type !== Type.Int)
            compilerError(
              op.location,
              "The top element of the stack is not an Int"
            );
          stack.pop();
          stack.pop();
          stack.pop();
          stack.pop();
          stack.pop();
          stack.pop();
          break;
        case Intrinsic.StackInfo:
          for (const value of stack.reverse())
            console.log(
              "From %s:%d:%d: %s",
              ...value.loc,
              humanType(value.type)
            );
          process.exit(1);
          break;
        case Intrinsic.CastBool:
          var val = stack.pop();
          if (!val)
            compilerError(
              op.location,
              "Stack does not have enough values for this operation"
            );
          else stack.push({ loc: val.loc, type: Type.Bool });
          break;
        case Intrinsic.CastInt:
          var val = stack.pop();
          if (!val)
            compilerError(
              op.location,
              "Stack does not have enough values for this operation"
            );
          else stack.push({ loc: val.loc, type: Type.Int });
          break;
        case Intrinsic.CastPtr:
          var val = stack.pop();
          if (!val)
            compilerError(
              op.location,
              "Stack does not have enough values for this operation"
            );
          else stack.push({ loc: val.loc, type: Type.Ptr });
          break;
        default:
          assert(false, "unreachable");
      }
    } else if (op.type === OpType.Keyword) {
      assert(false, "Not implemented");
    }

    ip++;
  }
  return { stack, functionBodies };
}

function typecheckProgram(program: Program) {
  const { stack, functionBodies } = $typecheckProgram(program, []);
  if (stack.length > 0)
    compilerError(
      program.ops[program.ops.length - 1].location,
      "Unhandled data found"
    );
  for (const fn of functionBodies) {
    const contract = program.contracts[fn.fip];
    if (!contract)
      compilerError(fn.loc, "Function does not have a contract attached");
    const illegalDef = fn.body.find(
      (el) =>
        el.type === OpType.PrepFn ||
        el.type === OpType.SkipFn ||
        el.type === OpType.PushMem
    );
    if (!!illegalDef)
      compilerError(
        illegalDef.location,
        "Defining " +
          (illegalDef.type === OpType.PushMem ? "Memory" : "a Function") +
          " inside a Function is not allowed"
      );
    const fnStack: {
      loc: Loc;
      type: Type;
    }[] = [];
    for (const inType of contract.ins) {
      fnStack.push({ loc: fn.loc, type: inType });
    }
    const { functionBodies, stack: fnReturnStack } = $typecheckProgram(
      { contracts: program.contracts, memorysize: 0, ops: fn.body },
      fnStack
    );
    if (functionBodies.length > 0)
      compilerError(fn.loc, "Function definitions in function-body");
    if (fnReturnStack.length !== contract.outs.length)
      compilerError(
        fn.endLoc,
        "Returnstack does not match the specified returnstack (expected: " +
          getTypes(contract.outs) +
          ", found: " +
          getTypes(fnReturnStack.map((el) => el.type)) +
          ")"
      );
    if (
      fnReturnStack.map((el, i) => el.type === contract.outs[i]).includes(false)
    )
      compilerError(
        fn.endLoc,
        "Returnstack does not match the specified returnstack (expected: " +
          getTypes(contract.outs) +
          ", found: " +
          getTypes(fnReturnStack.map((el) => el.type)) +
          ")"
      );
  }
}

function getTypes(types: Type[]) {
  if (types.length < 1) return chalk.gray(chalk.italic("<empty>"));
  return types.map((el) => humanType(el)).join(" ");
}

const typeNames = { int: Type.Int, bool: Type.Bool, ptr: Type.Ptr };

const IntrinsicNames = {
  "+": Intrinsic.Plus,
  "-": Intrinsic.Minus,
  "*": Intrinsic.Multiply,
  "/%": Intrinsic.DivMod,
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
  "=": Intrinsic.Equal,
  "@": Intrinsic.Load,
  "!": Intrinsic.Store,
  "@64": Intrinsic.Load64,
  "!64": Intrinsic.Store64,
  "!=": Intrinsic.NotEqual,
  here: Intrinsic.Here,
  argv: Intrinsic.Argv,
  "???": Intrinsic.StackInfo,
  "cast(bool)": Intrinsic.CastBool,
  "cast(int)": Intrinsic.CastInt,
  "cast(ptr)": Intrinsic.CastPtr,
};

const KeywordNames = {
  if: Keyword.If,
  end: Keyword.End,
  else: Keyword.Else,
  while: Keyword.While,
  memory: Keyword.Memory,
  fn: Keyword.Fn,
  in: Keyword.In,
  "--": Keyword.Splitter,
};

const opTypes = {
  0: "Word",
  1: "String",
  2: "CString",
  3: "Integer",
  4: "None",
};

function compilerError(location: Loc, error: string) {
  console.error(chalk.redBright(format("%s:%d:%d: %s", ...location, error)));
  process.exit(1);
}

function cmd_echoed(cmd: string) {
  console.log(chalk.yellow("[INFO] [CMD]: Running " + cmd));
  spawnSync(cmd, { shell: true });
}

async function compile(program: Program) {
  const strings: string[] = [];

  const out = await open(join(process.cwd(), "out.asm"), "w");
  let position = 0;
  async function write(str: string, ...args: any[]) {
    const to_write = format(str, ...args);
    assert(
      (await out.write(to_write, position)).bytesWritten === to_write.length,
      "write failed"
    );
    position += to_write.length;
  }

  await write("BITS 64\n");
  await write("segment .text\n");
  await write("print:\n");
  await write("    mov     r9, -3689348814741910323\n");
  await write("    sub     rsp, 40\n");
  await write("    mov     BYTE [rsp+31], 10\n");
  await write("    lea     rcx, [rsp+30]\n");
  await write(".L2:\n");
  await write("    mov     rax, rdi\n");
  await write("    lea     r8, [rsp+32]\n");
  await write("    mul     r9\n");
  await write("    mov     rax, rdi\n");
  await write("    sub     r8, rcx\n");
  await write("    shr     rdx, 3\n");
  await write("    lea     rsi, [rdx+rdx*4]\n");
  await write("    add     rsi, rsi\n");
  await write("    sub     rax, rsi\n");
  await write("    add     eax, 48\n");
  await write("    mov     BYTE [rcx], al\n");
  await write("    mov     rax, rdi\n");
  await write("    mov     rdi, rdx\n");
  await write("    mov     rdx, rcx\n");
  await write("    sub     rcx, 1\n");
  await write("    cmp     rax, 9\n");
  await write("    ja      .L2\n");
  await write("    lea     rax, [rsp+32]\n");
  await write("    mov     edi, 1\n");
  await write("    sub     rdx, rax\n");
  await write("    xor     eax, eax\n");
  await write("    lea     rsi, [rsp+32+rdx]\n");
  await write("    mov     rdx, r8\n");
  await write("    mov     rax, 1\n");
  await write("    syscall\n");
  await write("    add     rsp, 40\n");
  await write("    ret\n");
  await write("global _start\n");
  await write("_start:\n");
  await write("    mov [args_ptr], rsp\n");
  await write("    mov rax, ret_stack_end\n");
  await write("    mov [ret_stack_rsp], rax\n");

  const req_addrs: number[] = [];
  for (const ip in program.ops) {
    const op = program.ops[ip];
    if (op.type === OpType.Keyword) {
      if ([Keyword.If, Keyword.Else, Keyword.While].includes(op.operation)) {
        if (!op.reference)
          return compilerError(
            op.location,
            "Error: Reference to end not defined (forgot to run crossReferenceProgram?)"
          );
        req_addrs.push(op.reference);
      } else if (op.operation === Keyword.End && op.reference)
        req_addrs.push(op.reference);
    } else if (op.type === OpType.SkipFn) req_addrs.push(op.operation);
    else if (op.type === OpType.Call) req_addrs.push(op.operation);
  }

  for (const ip in program.ops) {
    const op = program.ops[ip];
    if (req_addrs.includes(Number(ip))) await write("addr_%d:\n", ip);

    if (op.type === OpType.PushString) {
      await write("    ;; push str\n");
      await write("    mov rax, %d\n", op.operation.length);
      await write("    push rax\n");
      await write("    push str_%d\n", strings.length);
      strings.push(op.operation);
    } else if (op.type === OpType.PushCString) {
      await write("    ;; push cstr\n");
      await write("    push str_%d\n", strings.length);
      strings.push(op.operation + "\x00");
    } else if (op.type === OpType.PushInt) {
      await write("    ;; push int\n");
      await write("    mov rax, %d\n", op.operation);
      await write("    push rax\n");
    } else if (op.type === OpType.PushMem) {
      await write("    push mem\n");
      await write("    pop rax\n");
      await write("    add rax, %d\n", op.operation);
      await write("    push rax\n");
    } else if (op.type === OpType.SkipFn) {
      if (!op.operation || isNaN(op.operation))
        compilerError(op.location, "Error: No end-block found!");
      await write("    ;; skip fn\n");
      await write("    jmp addr_%d\n", op.operation);
    } else if (op.type === OpType.PrepFn) {
      await write("    ;; prep fn\n");
      await write("    mov [ret_stack_rsp], rsp\n");
      await write("    mov rsp, rax\n");
    } else if (op.type === OpType.Call) {
      if (!op.operation || isNaN(op.operation))
        compilerError(op.location, "Error: Proc location wasn't found");
      await write("    ;; call\n");
      await write("    mov rax, rsp\n");
      await write("    mov rsp, [ret_stack_rsp]\n");
      await write("    call addr_%d\n", op.operation);
      await write("    mov [ret_stack_rsp], rsp\n");
      await write("    mov rsp, rax\n");
    } else if (op.type === OpType.Ret) {
      await write("    ;; end\n");
      await write("    mov rax, rsp\n");
      await write("    mov rsp, [ret_stack_rsp]\n");
      await write("    ret\n");
    } else if (op.type === OpType.Intrinsic) {
      switch (op.operation) {
        case Intrinsic.Plus:
          await write("    ;; +\n");
          await write("    pop rax\n");
          await write("    pop rbx\n");
          await write("    add rax, rbx\n");
          await write("    push rax\n");
          break;
        case Intrinsic.Minus:
          await write("    ;; -\n");
          await write("    pop rax\n");
          await write("    pop rbx\n");
          await write("    sub rbx, rax\n");
          await write("    push rbx\n");
          break;
        case Intrinsic.Multiply:
          await write("    ;; *\n");
          await write("    pop rax\n");
          await write("    pop rbx\n");
          await write("    mul rbx\n");
          await write("    push rax\n");
          break;
        case Intrinsic.DivMod:
          await write("    ;; /%\n");
          await write("    xor rdx, rdx\n");
          await write("    pop rbx\n");
          await write("    pop rax\n");
          await write("    div rbx\n");
          await write("    push rax\n");
          await write("    push rdx\n");
          break;
        case Intrinsic.Print:
          await write("    ;; print\n");
          await write("    pop rdi\n");
          await write("    call print\n");
          break;
        case Intrinsic.Syscall1:
          await write("    ;; syscall1\n");
          await write("    pop rax\n");
          await write("    pop rdi\n");
          await write("    syscall\n");
          break;
        case Intrinsic.Syscall2:
          await write("    ;; syscall2\n");
          await write("    pop rax\n");
          await write("    pop rdi\n");
          await write("    pop rsi\n");
          await write("    syscall\n");
          break;
        case Intrinsic.Syscall3:
          await write("    ;; syscall3\n");
          await write("    pop rax\n");
          await write("    pop rdi\n");
          await write("    pop rsi\n");
          await write("    pop rdx\n");
          await write("    syscall\n");
          break;
        case Intrinsic.Syscall4:
          await write("    ;; syscall4\n");
          await write("    pop rax\n");
          await write("    pop rdi\n");
          await write("    pop rsi\n");
          await write("    pop rdx\n");
          await write("    pop r10\n");
          await write("    syscall\n");
          break;
        case Intrinsic.Syscall5:
          await write("    ;; syscall5\n");
          await write("    pop rax\n");
          await write("    pop rdi\n");
          await write("    pop rsi\n");
          await write("    pop rdx\n");
          await write("    pop r10\n");
          await write("    pop r8\n");
          await write("    syscall\n");
          break;
        case Intrinsic.Syscall6:
          await write("    ;; syscall6\n");
          await write("    pop rax\n");
          await write("    pop rdi\n");
          await write("    pop rsi\n");
          await write("    pop rdx\n");
          await write("    pop r10\n");
          await write("    pop r8\n");
          await write("    pop r9\n");
          await write("    syscall\n");
          break;
        case Intrinsic.Drop:
          await write("    ;; drop\n");
          await write("    pop rax\n");
          break;
        case Intrinsic.Dup:
          await write("    ;; dup\n");
          await write("    pop rax\n");
          await write("    push rax\n");
          await write("    push rax\n");
          break;
        case Intrinsic.Over:
          await write("    ;; over\n");
          await write("    pop rbx\n");
          await write("    pop rax\n");
          await write("    push rax\n");
          await write("    push rbx\n");
          await write("    push rax\n");
          break;
        case Intrinsic.Swap:
          await write("    ;; swap\n");
          await write("    pop rax\n");
          await write("    pop rbx\n");
          await write("    push rax\n");
          await write("    push rbx\n");
          break;
        case Intrinsic.Equal:
          await write("    ;; =\n");
          await write("    pop rax\n");
          await write("    pop rbx\n");
          await write("    cmp rax, rbx\n");
          await write("    push rax\n");
          break;
        case Intrinsic.NotEqual:
          await write("    ;; !=\n");
          await write("    mov rcx, 0\n");
          await write("    mov rdx, 1\n");
          await write("    pop rbx\n");
          await write("    pop rax\n");
          await write("    cmp rax, rbx\n");
          await write("    cmovne rcx, rdx\n");
          await write("    push rcx\n");
          break;
        case Intrinsic.Load:
          await write("    ;; -- @ --\n");
          await write("    pop rax\n");
          await write("    xor rbx, rbx\n");
          await write("    mov bl, [rax]\n");
          await write("    push rbx\n");
          break;
        case Intrinsic.Store:
          await write("    ;; -- ! --\n");
          await write("    pop rax\n");
          await write("    pop rbx\n");
          await write("    mov [rax], bl\n");
          break;
        case Intrinsic.Load64:
          await write("    ;; -- @64 --\n");
          await write("    pop rax\n");
          await write("    xor rbx, rbx\n");
          await write("    mov rbx, [rax]\n");
          await write("    push rbx\n");
          break;
        case Intrinsic.Store64:
          await write("    ;; -- !64 --\n");
          await write("    pop rax\n");
          await write("    pop rbx\n");
          await write("    mov [rax], rbx\n");
          break;
        case Intrinsic.Here:
          const loc = format("%s:%d:%d", ...op.location);
          await write("    ;; here\n");
          await write("    mov rax, %d\n", loc.length);
          await write("    push rax\n");
          await write("    push str_%d\n", strings.length);
          strings.push(loc);
          break;
        case Intrinsic.Argv:
          await write("    ;; -- argv --\n");
          await write("    mov rax, [args_ptr]\n");
          await write("    add rax, 8\n");
          await write("    push rax\n");
          break;
        case Intrinsic.CastInt:
        case Intrinsic.CastPtr:
          break;
        case Intrinsic.CastBool:
          await write("    ;; cast(bool)\n");
          await write("    pop rax\n");
          await write("    cmp rax, 0\n");
          await write("    setne al\n");
          await write("    movzx rax, al\n");
          await write("    push rax\n");
          break;
        default:
          assert(false, "Unreachable");
          break;
      }
    } else if (op.type === OpType.Keyword) {
      switch (op.operation) {
        case Keyword.End:
          await write("    ;; end\n");
          if (op.reference) await write("    jmp addr_%d\n", op.reference);
          break;
        case Keyword.Else:
          if (!op.reference)
            return compilerError(
              op.location,
              "No reference for this if-block defined. Probably a cross-referencing issue."
            );
          await write("    ;; else\n");
          await write("    jmp addr_%d\n", op.reference);
          break;
        case Keyword.If:
          if (!op.reference)
            return compilerError(
              op.location,
              "No reference for this if-block defined. Probably a cross-referencing issue."
            );
          await write("    ;; if\n");
          await write("    pop rax\n");
          await write("    cmp rax, 0\n");
          await write("    je addr_%d\n", op.reference);
          break;
        case Keyword.While:
          if (!op.reference)
            return compilerError(
              op.location,
              "No reference for this while-block defined. Probably a cross-referencing issue."
            );
          await write("    ;; while\n");
          await write("    pop rax\n");
          await write("    push rax\n");
          await write("    cmp rax, 0\n");
          await write("    je addr_%d\n", op.reference);
          break;
        default:
          assert(false, "unreachable");
      }
    } else assert(false, "unreachable");
  }

  if (req_addrs.includes(program.ops.length))
    await write("addr_%d:\n", program.ops.length);
  await write("    ;; -- exit program --\n");
  await write("    mov rax, 60\n");
  await write("    mov rdi, 0\n");
  await write("    syscall\n");
  await write("segment .data\n");
  for (const s in strings) {
    await write(
      "str_%d: db %s\n",
      s,
      Object.values(strings[s])
        .map((el) => "0x" + el.charCodeAt(0).toString(16).substring(0, 2))
        .join(",")
    );
  }
  await write("segment .bss\n");
  await write("    ret_stack_rsp: resq 1\n");
  await write("    ret_stack: resb 4096\n");
  await write("    ret_stack_end:\n");
  await write("    args_ptr: resq 1\n");
  await write("    mem: resb %d\n", program.memorysize);

  await out.close();

  cmd_echoed("nasm -felf64 -o out.o out.asm");
  cmd_echoed("ld -o out out.o");
}

async function main(args: string[]) {
  const program = crossReferenceProgram(
    await parseProgram(await generateTokens("test.undefied"))
  );
  typecheckProgram(program);
  compile(program);
}

function escapeStr(str: string): string {
  let _str = "";
  let escaping = false;
  const translationMatrix = { n: "\n", r: "\r", t: "\t", "0": "\0" };

  for (const c of Object.values(str)) {
    if (escaping)
      _str += translationMatrix[c as keyof typeof translationMatrix] || c;
    else if (c === "\\") escaping = true;
    else _str += c;
  }

  return _str;
}

main(process.argv);
