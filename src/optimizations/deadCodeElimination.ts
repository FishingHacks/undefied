import assert from 'assert';
import { compilerInfo } from '../errors';
import { timer } from '../timer';
import { Intrinsic, Operation, OpType, Program } from '../types';

export function dce(program: Program, dev: boolean) {
    const end = timer.start('dce()');
    if (program.mainop !== undefined) mark(program, program.mainop, dev);
    const newops: Operation[] = [];

    let skipping = false;
    for (const ci in program.ops) {
        const i = Number(ci);
        const op = program.ops[i];

        if (op.type === OpType.SkipFn && skipping) assert(false, 'Unreachable');
        else if (
            op.type === OpType.SkipFn &&
            program.contracts[i + 1] &&
            !program.contracts[i + 1].used
        ) {
            skipping = true;
            newops.push({
                type: OpType.Intrinsic,
                location: op.location,
                operation: Intrinsic.None,
                token: op.token,
                ip: -1
            });
        } else if (op.type === OpType.Ret && skipping && op.functionEnd) {
            skipping = false;

            newops.push({
                type: OpType.Intrinsic,
                location: op.location,
                operation: Intrinsic.None,
                token: op.token,
                ip: -1,
            });
        } else if (skipping)
            newops.push({
                type: OpType.Intrinsic,
                location: op.location,
                operation: Intrinsic.None,
                token: op.token,
                ip: -1,
            });
        else newops.push(op);
    }
    program.ops = newops;
    end();
    return program;
}

function mark(program: Program, ip: number, dev: boolean) {
    const _end = timer.start('dce() -> mark()');
    let end: number = -1;

    while (true) {
        if (ip === end) break;
        const operation = program.ops[ip++];
        if (!operation) break;
        if (operation.type === OpType.SkipFn) end = operation.operation;
        if (operation.type === OpType.PrepFn && program.contracts[ip - 1]) {
            program.contracts[ip - 1].used = true;
            if (dev) compilerInfo([operation.location], 'Marking ' + operation.functionName + ' as used');
        }

        if (operation.type === OpType.Call)
            mark(program, operation.operation - 1, dev);
    }
    _end();
}
