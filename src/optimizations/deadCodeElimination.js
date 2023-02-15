"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dce = void 0;
const assert_1 = __importDefault(require("assert"));
const errors_1 = require("../errors");
const timer_1 = require("../timer");
const types_1 = require("../types");
function dce(program, dev) {
    const end = timer_1.timer.start('dce()');
    if (program.mainop !== undefined)
        mark(program, program.mainop, dev);
    const newops = [];
    let skipping = false;
    for (const ci in program.ops) {
        const i = Number(ci);
        const op = program.ops[i];
        if (op.type === types_1.OpType.SkipFn && skipping)
            (0, assert_1.default)(false, 'Unreachable');
        else if (op.type === types_1.OpType.SkipFn &&
            program.contracts[i + 1] &&
            !program.contracts[i + 1].used) {
            skipping = true;
            newops.push({
                type: types_1.OpType.Intrinsic,
                location: op.location,
                operation: types_1.Intrinsic.None,
                token: op.token,
                ip: -1
            });
        }
        else if (op.type === types_1.OpType.Ret && skipping && op.functionEnd) {
            skipping = false;
            newops.push({
                type: types_1.OpType.Intrinsic,
                location: op.location,
                operation: types_1.Intrinsic.None,
                token: op.token,
                ip: -1,
            });
        }
        else if (skipping)
            newops.push({
                type: types_1.OpType.Intrinsic,
                location: op.location,
                operation: types_1.Intrinsic.None,
                token: op.token,
                ip: -1,
            });
        else
            newops.push(op);
    }
    program.ops = newops;
    end();
    return program;
}
exports.dce = dce;
function mark(program, ip, dev) {
    const _end = timer_1.timer.start('dce() -> mark()');
    let end = -1;
    while (true) {
        if (ip === end)
            break;
        const operation = program.ops[ip++];
        if (!operation)
            break;
        if (operation.type === types_1.OpType.SkipFn)
            end = operation.operation;
        if (operation.type === types_1.OpType.PrepFn && program.contracts[ip - 1]) {
            program.contracts[ip - 1].used = true;
            if (dev)
                (0, errors_1.compilerInfo)([operation.location], 'Marking ' + operation.functionName + ' as used');
        }
        if (operation.type === types_1.OpType.Call)
            mark(program, operation.operation - 1, dev);
    }
    _end();
}
