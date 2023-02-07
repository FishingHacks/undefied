import assert from "assert";
import { Intrinsic, Operation, OpType, Program } from "../types";

export function dce(program: Program) {
    const newops: Operation[] = [];

    // because cast(int) and cast(ptr) (aka. Intrinsic.CastInt and Intrinsic.CastPtr) will get ignored during compilation, we can use this to not mess up indexes while still eliminating dead code

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
                operation: Intrinsic.CastInt,
                token: op.token,
            });
        } else if (op.type === OpType.Ret && skipping && op.operation !== 1) {
            skipping = false;
            
            newops.push({
                type: OpType.Intrinsic,
                location: op.location,
                operation: Intrinsic.CastInt,
                token: op.token,
            });
        } else if (skipping)
            newops.push({
                type: OpType.Intrinsic,
                location: op.location,
                operation: Intrinsic.CastInt,
                token: op.token,
            });
        else newops.push(op);
    }
    program.ops = newops;
    return program;
}