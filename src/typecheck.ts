import assert from 'assert';
import { compilerError, info } from './errors';
import { timer } from './timer';
import {
    TypeCheckStack,
    Operation,
    Loc,
    OpType,
    Type,
    Intrinsic,
    Keyword,
    Program,
    Contract,
    EnhancedType,
} from './types';
import { hasParameter } from './utils/general';
import {
    humanType,
    getTypes,
    isAny,
    typeEqual,
    typeToEnhancedType,
    flatType,
} from './utils/types';

function $typecheckProgram(
    program: Program,
    stack: TypeCheckStack,
    expectedReturnValue?: { type: EnhancedType; loc: Loc }[],
    currentContact?: Contract
): {
    functionBodies: {
        fip: number;
        body: Operation[];
        loc: Loc;
        endLoc: Loc;
    }[];
    stack: TypeCheckStack;
} {
    const end = timer.start('$typecheckProgram()');
    const functionBodies: {
        fip: number;
        body: Operation[];
        loc: Loc;
        endLoc: Loc;
    }[] = [];
    const stackSnapshots: { stack: TypeCheckStack; byIf: boolean }[] = [];
    function pushStack(...values: { loc: Loc; type: Type | EnhancedType }[]) {
        stack.push(
            ...values.map(({ loc, type }) => ({
                loc,
                type: typeToEnhancedType(type),
            }))
        );
    }

    let ip = 0;
    while (ip < program.ops.length) {
        const op = program.ops[ip];
        if (op.type === OpType.Comment) {
        } else if (op.type === OpType.Const) {
            pushStack({
                loc: op.location,
                type: op._type,
            });
        } else if (op.type === OpType.SkipFn) {
            if (
                !hasParameter(op, [
                    '__typecheck_ignore__',
                    '__provided_externally__',
                ])
            ) {
                if (!program.ops[op.operation - 1])
                    compilerError(
                        [op.location],
                        op.functionName +
                            ' SkipFN: Could not Locate end location'
                    );
                functionBodies.push({
                    fip: ip + 1,
                    body: program.ops.slice(ip + 2, op.operation - 1),
                    loc: op.location,
                    endLoc: program.ops[op.operation - 1].location,
                });
            }
            ip = op.operation - 1;
        } else if (op.type === OpType.PrepFn)
            assert(false, 'Reached prepfn.. This should never happend');
        else if (op.type === OpType.Ret) {
            op.operation = currentContact ? currentContact.index : op.operation;
            if (!expectedReturnValue)
                compilerError(
                    [op.location],
                    "Can't return outside of a function"
                );
            if (stack.length !== expectedReturnValue.length)
                compilerError(
                    [op.location],
                    'The stack does not match the contracts outs (stack: %s, outs: %s)',
                    getTypes(stack.map((el) => el.type)),
                    getTypes(
                        [...expectedReturnValue].reverse().map((el) => el.type)
                    )
                );
            if (
                [...stack]
                    .reverse()
                    .map(
                        (el, i) =>
                            typeEqual(el.type, expectedReturnValue[i].type) ||
                            isAny(expectedReturnValue[i].type)
                    )
                    .includes(false)
            )
                compilerError(
                    [op.location],
                    'The stack does not match the contracts outs (stack: %s, outs: %s)',
                    getTypes(stack.map((el) => el.type)),
                    getTypes(
                        [...expectedReturnValue].reverse().map((el) => el.type)
                    )
                );
            if (stackSnapshots.length > 0)
                stack = stackSnapshots[stackSnapshots.length - 1].stack;
            else {
                end();
                return {
                    functionBodies,
                    stack: !expectedReturnValue
                        ? []
                        : expectedReturnValue.map((el) => ({
                              type: el.type,
                              loc: op.location,
                          })),
                };
            }
        } else if (op.type === OpType.Call) {
            if (
                hasParameter(
                    program.contracts[op.operation].prep,
                    '__function_exits__'
                )
            ) {
                if (stackSnapshots.length > 0)
                    stack = stackSnapshots[stackSnapshots.length - 1].stack;
                else {
                    end();
                    return {
                        functionBodies,
                        stack: !expectedReturnValue
                            ? []
                            : expectedReturnValue.map((el) => ({
                                  type: el.type,
                                  loc: op.location,
                              })),
                    };
                }
            } else {
                const contract = program.contracts[op.operation];
                if (!contract)
                    compilerError([op.location], 'No contract found');
                if (stack.length < contract.ins.length)
                    compilerError(
                        [op.location],
                        'The stack has not enough elements (' +
                            stack.length +
                            ' elements on the stack, ' +
                            contract.ins.length +
                            ' elements needed)'
                    );
                const supplied = [];
                for (const t of contract.ins) {
                    const stackType = stack.pop();
                    if (stackType === undefined)
                        compilerError(
                            [op.location],
                            'The stack has not enough elements'
                        );
                    // should never happen
                    else supplied.push(stackType.type);
                    if (!typeEqual(t.type, stackType?.type) && !isAny(t.type))
                        compilerError(
                            [op.location],
                            'Type does not match, ' +
                                humanType(t.type) +
                                ' required, ' +
                                +' supplied (contract: ' +
                                contract.ins
                                    .map((el) => humanType(el.type))
                                    .join(' ') +
                                ' -- ' +
                                [...contract.outs]
                                    .reverse()
                                    .map((el) => humanType(el.type))
                                    .join(' ') +
                                ', supplied: ' +
                                supplied.map(humanType).join(' ') +
                                ')'
                        );
                }
                for (const t of [...contract.outs].reverse()) {
                    pushStack({ loc: op.location, type: t.type });
                }
            }
        } else if (op.type === OpType.PushCString)
            pushStack({ loc: op.location, type: Type.Ptr });
        else if (op.type === OpType.PushInt)
            pushStack({ loc: op.location, type: Type.Int });
        else if (op.type === OpType.PushMem)
            pushStack({ loc: op.location, type: Type.Ptr });
        else if (op.type === OpType.PushString)
            pushStack(
                { loc: op.location, type: Type.Int },
                { loc: op.location, type: Type.Ptr }
            );
        else if (op.type === OpType.PushAsm) {
        } else if (op.type === OpType.Intrinsic) {
            switch (op.operation) {
                case Intrinsic.And:
                case Intrinsic.Or:
                case Intrinsic.Xor:
                case Intrinsic.Shl:
                case Intrinsic.Shr:
                case Intrinsic.Plus:
                case Intrinsic.Minus:
                case Intrinsic.Multiply:
                    var [n1, n2] = [stack.pop(), stack.pop()];
                    if (!n1 || !n2)
                        compilerError(
                            [op.location],
                            'Not enough numbers for this operation'
                        );
                    if (!typeEqual(n1?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'Left-hand operand is not an int, found ' +
                                humanType(n1?.type || -1)
                        );
                    if (!typeEqual(n2?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'Right-hand operand is not an int, found ' +
                                humanType(n2?.type || -1)
                        );
                    pushStack({ loc: op.location, type: Type.Int });
                    break;
                case Intrinsic.Argv:
                    pushStack({ loc: op.location, type: Type.Ptr });
                    break;
                case Intrinsic.DivMod:
                    var [n1, n2] = [stack.pop(), stack.pop()];
                    if (!n1 || !n2)
                        compilerError(
                            [op.location],
                            'Not enough numbers for this operation'
                        );
                    if (!typeEqual(n1?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'Left-hand operand is not an int, found ' +
                                humanType(n1?.type || -1)
                        );
                    if (!typeEqual(n2?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'Right-hand operand is not an int, found ' +
                                humanType(n2?.type || -1)
                        );
                    pushStack(
                        { loc: op.location, type: Type.Int },
                        { loc: op.location, type: Type.Int }
                    );
                    break;
                case Intrinsic.fakeDrop:
                case Intrinsic.Drop:
                    if (!stack.pop())
                        compilerError(
                            [op.location],
                            "Can't drop a value, stack does not have any"
                        );
                    break;
                case Intrinsic.Here:
                    pushStack(
                        { loc: op.location, type: Type.Int },
                        { loc: op.location, type: Type.Ptr }
                    );
                    break;
                case Intrinsic.Dup:
                    if (stack.length < 1)
                        compilerError(
                            [op.location],
                            "Can't dup a value, stack does not have any"
                        );
                    const v = stack.pop();
                    if (!!v) pushStack(v, v); // v -> v v
                    break;
                case Intrinsic.Equal:
                case Intrinsic.NotEqual:
                    var [v1, v2] = [stack.pop(), stack.pop()];
                    if (!v1 || !v2)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values'
                        );
                    else if (!typeEqual(v1.type, v2.type))
                        compilerError(
                            [op.location],
                            "The type of the values doesn't match (" +
                                [humanType(v1.type), humanType(v2.type)]
                        );
                    else pushStack({ type: Type.Bool, loc: op.location });
                    break;
                case Intrinsic.Load:
                case Intrinsic.Load16:
                case Intrinsic.Load32:
                case Intrinsic.Load64:
                    var ptr = stack.pop();
                    if (!ptr)
                        compilerError(
                            [op.location],
                            'Stack does not contain a pointer'
                        );
                    else if (!typeEqual(ptr.type, Type.Ptr))
                        compilerError(
                            [op.location],
                            'Stack does not contain a pointer'
                        );
                    else pushStack({ type: Type.Int, loc: op.location });
                    break;
                case Intrinsic.Over:
                    var [v1, v2] = [stack.pop(), stack.pop()];
                    if (!v1 || !v2)
                        compilerError(
                            [op.location],
                            'Stack does not contain enough values for this operation'
                        );
                    else pushStack(v2, v1, v2); // v2 v1 -> v2 v1 v2
                    break;
                case Intrinsic.Print:
                    var int = stack.pop();
                    if (!int)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values for this operation'
                        );
                    else if (!typeEqual(int.type, Type.Int))
                        compilerError(
                            [op.location],
                            'int expected, found ' + humanType(int.type)
                        );
                    break;
                case Intrinsic.Not:
                    var int = stack.pop();
                    if (!int)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values for this operation'
                        );
                    else if (!typeEqual(int.type, Type.Int))
                        compilerError(
                            [op.location],
                            'Integer expected, found ' + humanType(int.type)
                        );
                    pushStack({ loc: op.location, type: Type.Int });
                    break;
                case Intrinsic.Store:
                case Intrinsic.Store16:
                case Intrinsic.Store32:
                case Intrinsic.Store64:
                    var [ptr, int] = [stack.pop(), stack.pop()];
                    if (!ptr || !int)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values'
                        );
                    else if (
                        !typeEqual(int.type, Type.Int) ||
                        !typeEqual(ptr.type, Type.Ptr)
                    )
                        compilerError(
                            [op.location],
                            'Expected int ptr, found ' +
                                humanType(int.type) +
                                ' ' +
                                humanType(ptr.type)
                        );
                    break;
                case Intrinsic.Swap:
                    var [v1, v2] = [stack.pop(), stack.pop()];
                    if (!v1 || !v2)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values for this operation'
                        );
                    else pushStack(v1, v2);
                    break;
                case Intrinsic.Syscall1:
                    if (stack.length < 2)
                        compilerError(
                            [op.location],
                            'Stack does not contain enough values for this operation'
                        );
                    if (!typeEqual(stack.pop()?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'The top element of the stack is not an Int'
                        );
                    stack.pop();
                    pushStack({ type: Type.Int, loc: op.location });
                    break;
                case Intrinsic.Syscall2:
                    if (stack.length < 3)
                        compilerError(
                            [op.location],
                            'Stack does not contain enough values for this operation'
                        );
                    if (!typeEqual(stack.pop()?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'The top element of the stack is not an Int'
                        );
                    stack.pop();
                    stack.pop();
                    pushStack({ type: Type.Int, loc: op.location });
                    break;
                case Intrinsic.Syscall3:
                    if (stack.length < 4)
                        compilerError(
                            [op.location],
                            'Stack does not contain enough values for this operation'
                        );
                    if (!typeEqual(stack.pop()?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'The top element of the stack is not an Int'
                        );
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    pushStack({ type: Type.Int, loc: op.location });
                    break;
                case Intrinsic.Syscall4:
                    if (stack.length < 5)
                        compilerError(
                            [op.location],
                            'Stack does not contain enough values for this operation'
                        );
                    if (!typeEqual(stack.pop()?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'The top element of the stack is not an Int'
                        );
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    pushStack({ type: Type.Int, loc: op.location });
                    break;
                case Intrinsic.Syscall5:
                    if (stack.length < 6)
                        compilerError(
                            [op.location],
                            'Stack does not contain enough values for this operation'
                        );
                    if (!typeEqual(stack.pop()?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'The top element of the stack is not an Int'
                        );
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    pushStack({ type: Type.Int, loc: op.location });
                    break;
                case Intrinsic.Syscall6:
                    if (stack.length < 7)
                        compilerError(
                            [op.location],
                            'Stack does not contain enough values for this operation'
                        );
                    if (!typeEqual(stack.pop()?.type, Type.Int))
                        compilerError(
                            [op.location],
                            'The top element of the stack is not an Int'
                        );
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    pushStack({ type: Type.Int, loc: op.location });
                    break;
                case Intrinsic.StackInfo:
                    info('Stack Info:');
                    for (const [i, value] of Object.entries(
                        [...stack].reverse()
                    ))
                        info(
                            'From %s:%d:%d: %s',
                            ...value.loc,
                            humanType(value.type),
                            'index #' + i
                        );
                    process.exit(1);
                    break;
                case Intrinsic.CastBool:
                    var val = stack.pop();
                    if (!val)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values for this operation'
                        );
                    else pushStack({ loc: val.loc, type: Type.Bool });
                    break;
                case Intrinsic.CastInt:
                    var val = stack.pop();
                    if (!val)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values for this operation'
                        );
                    else pushStack({ loc: val.loc, type: Type.Int });
                    break;
                case Intrinsic.CastPtr:
                    var val = stack.pop();
                    if (!val)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values for this operation'
                        );
                    else pushStack({ loc: val.loc, type: Type.Ptr });
                    break;
                case Intrinsic.GreaterThanEqual:
                case Intrinsic.GreaterThan:
                case Intrinsic.LessThanEqual:
                case Intrinsic.LessThan:
                    var [v1, v2] = [stack.pop(), stack.pop()];

                    if (!v1 || !v2)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values for this operation'
                        );
                    else if (!typeEqual(v1.type, v2.type))
                        compilerError(
                            [op.location],
                            'Expected the values to be the same ' +
                                [humanType(v1.type), humanType(v2.type)].join(
                                    ', '
                                )
                        );
                    else pushStack({ loc: op.location, type: Type.Bool });
                    break;
                case Intrinsic.Rot:
                    var [v1, v2, v3] = [stack.pop(), stack.pop(), stack.pop()];
                    if (!v1 || !v2 || !v3)
                        compilerError(
                            [op.location],
                            'Stack does not have enough values for this operation'
                        );
                    else pushStack(v1, v3, v2);
                    break;
                case Intrinsic.fakeBool:
                    pushStack({ loc: op.location, type: Type.Bool });
                    break;
                case Intrinsic.fakeInt:
                    pushStack({ loc: op.location, type: Type.Int });
                    break;
                case Intrinsic.fakePtr:
                    pushStack({ loc: op.location, type: Type.Ptr });
                    break;
                case Intrinsic.fakeAny:
                    pushStack({ loc: op.location, type: Type.Any });
                    break;
                default:
                    assert(false, 'unreachable');
            }
        } else if (op.type === OpType.Keyword) {
            switch (op.operation) {
                case Keyword.Memory:
                    pushStack({ type: Type.Ptr, loc: op.location });
                    break;
                case Keyword.In:
                case Keyword.Splitter:
                case Keyword.Fn:
                case Keyword.Struct:
                    assert(false, 'unreachable');
                    break;
                case Keyword.If:
                    var v = stack.pop();
                    if (!v)
                        compilerError(
                            [op.location],
                            'Stack does not contain enough values for this operation'
                        );
                    else if (!typeEqual(v.type, Type.Bool))
                        compilerError(
                            [op.location],
                            'Expected Bool, found ' + humanType(v.type)
                        );
                    else {
                        stackSnapshots.push({ stack: [...stack], byIf: true });
                        break;
                    }
                case Keyword.Else:
                    var snapshot = stackSnapshots.pop();
                    if (!snapshot)
                        compilerError(
                            [op.location],
                            'Did not follow an if-block'
                        );
                    else {
                        stackSnapshots.push({
                            stack: [...stack],
                            byIf: snapshot.byIf,
                        });
                        stack = snapshot.stack;
                    }
                    break;
                case Keyword.End:
                    var snapshots = [stackSnapshots.pop()];
                    while (
                        snapshots[snapshots?.length - 1]?.byIf === false &&
                        stackSnapshots.length > 0
                    ) {
                        snapshots.push(stackSnapshots.pop());
                    }
                    snapshots = snapshots.filter((el) => el !== undefined);
                    if (snapshots.length < 1)
                        compilerError(
                            [op.location],
                            'Did not follow an if or while-block'
                        );
                    else {
                        for (var snapshot of snapshots) {
                            if (snapshot !== undefined) {
                                const snapshottypes = snapshot.stack.map(
                                    (el) => el.type
                                );
                                const stacktypes = stack.map((el) => el.type);
                                const flatsnapshottypes =
                                    flatType(snapshottypes);
                                const flatstacktypes = flatType(stacktypes);
                                if (
                                    flatsnapshottypes.length !==
                                    flatstacktypes.length
                                )
                                    compilerError(
                                        [op.location],
                                        'The stack after running the block has to be equal no matter the values. Expected Stack: ' +
                                            getTypes(snapshottypes) +
                                            ', Found: ' +
                                            getTypes(stacktypes)
                                    );
                                if (
                                    flatsnapshottypes
                                        .map((el, i) =>
                                            typeEqual(el, flatstacktypes[i])
                                        )
                                        .includes(false)
                                )
                                    compilerError(
                                        [op.location],
                                        'The stack after running the block has to be equal no matter the values. Expected Stack: ' +
                                            getTypes(snapshottypes) +
                                            ', Found: ' +
                                            getTypes(stacktypes)
                                    );
                            }
                        }
                    }
                    break;
                case Keyword.While:
                    stackSnapshots.push({ stack: [...stack], byIf: true });
                    break;
                case Keyword.IfStar:
                    var bool = stack.pop();
                    if (!bool)
                        compilerError(
                            [op.location],
                            'Stack does not contain enough values'
                        );
                    else if (!typeEqual(bool.type, Type.Bool))
                        compilerError(
                            [op.location],
                            'Expected bool, found ' + humanType(bool.type)
                        );
                    else {
                        stackSnapshots.push({ stack: [...stack], byIf: false });
                    }
                    break;
                default:
                    assert(false, 'Not implemented');
            }
        } else assert(false, 'unreachable');

        ip++;
    }
    end();
    return { stack, functionBodies };
}

export function typecheckProgram(program: Program) {
    const end = timer.start('typecheckProgram()');

    const { stack, functionBodies } = $typecheckProgram(program, []);
    if (stack.length > 0)
        compilerError(
            [program.ops[program.ops.length - 1].location],
            'Unhandled data found'
        );
    for (const fn of functionBodies) {
        const contract = program.contracts[fn.fip];
        if (!contract)
            compilerError(
                [fn.loc],
                'Function does not have a contract attached'
            );
        const illegalDef = fn.body.find(
            (el) => el.type === OpType.PrepFn || el.type === OpType.SkipFn
        );
        if (!!illegalDef)
            compilerError(
                [illegalDef.location],
                'Defining ' +
                    (illegalDef.type === OpType.PushMem
                        ? 'Memory'
                        : 'a Function') +
                    ' inside a Function is not allowed'
            );
        const fnStack: TypeCheckStack = [];
        const ins = [...contract.ins].reverse();
        for (let i = 0; i < ins.length; i++) {
            fnStack.push({ loc: fn.loc, type: ins[i].type });
        }
        const { functionBodies, stack: fnReturnStack } = $typecheckProgram(
            {
                contracts: program.contracts,
                mems: {},
                ops: fn.body,
                mainop: program.mainop,
                functionsToRun: program.functionsToRun,
            },
            fnStack,
            contract.outs,
            contract
        );
        if (functionBodies.length > 0)
            compilerError([fn.loc], 'Function definitions in function-body');
        const flatReturnStack = flatType(fnReturnStack.map((el) => el.type));
        const flatOuts = flatType(contract.outs.map((el) => el.type));
        flatOuts.reverse();
        if (flatReturnStack.length !== flatOuts.length)
            compilerError(
                [fn.endLoc],
                'Returnstack does not match the specified returnstack (expected: ' +
                    getTypes(contract.outs.map((el) => el.type)) +
                    ', found: ' +
                    getTypes(fnReturnStack.map((el) => el.type)) +
                    ')'
            );
        if (
            flatReturnStack
                .map((el, i) => typeEqual(el, flatOuts[i]))
                .includes(false)
        )
            compilerError(
                [fn.endLoc],
                'Returnstack does not match the specified returnstack (expected: %s, found: %s)',
                getTypes(flatOuts),
                getTypes(flatReturnStack)
            );
    }

    end();
}
