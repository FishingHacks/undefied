import assert from 'assert';
import { compilerError } from './errors';
import { Operation, OpType, Keyword, Program } from './types';

export function crossReferenceProgram(program: Program): Program {
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
                            [op.location],
                            'End expected `if` block, found nothing'
                        );
                    _op = program.ops[Number(_ip)];
                    if (
                        _op.operation !== Keyword.If &&
                        _op.operation !== Keyword.IfStar
                    )
                        compilerError(
                            [_op.location],
                            'Expected `if` block, found `' +
                                _op.token.value +
                                '`'
                        );
                    if (_op.type !== OpType.Keyword)
                        compilerError([_op.location], 'Expected keyword');
                    else _op.reference = Number(ip) + 1;

                    if (_op.operation === Keyword.IfStar) {
                        const else_ip = stack.pop();
                        const ifstar_else_op = program.ops[Number(else_ip)];
                        if (
                            !ifstar_else_op ||
                            ifstar_else_op.type !== OpType.Keyword ||
                            ifstar_else_op.operation !== Keyword.Else
                        )
                            compilerError(
                                [_op.location],
                                'if* needs to be prepended by else'
                            );
                        else ifstar_else_op.reference = Number(ip);
                    }

                    stack.push(ip);

                    break;
                case Keyword.End:
                    _ip = stack.pop();
                    if (!_ip)
                        compilerError(
                            [op.location],
                            'End expected `if` block, found nothing'
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
                        ![Keyword.Else, Keyword.If, Keyword.While].includes(
                            _op.operation
                        )
                    )
                        compilerError(
                            [_op.location],
                            'End can only end `if` or `while` blocks, found `' +
                                _op.token.value +
                                '`'
                        );
                    if (_op.operation === Keyword.While) {
                        op.reference = Number(_ip);
                        _op.reference = Number(ip) + 1;
                    } else _op.reference = Number(ip);

                    break;
                case Keyword.While:
                    stack.push(ip);
                    break;
                case Keyword.IfStar:
                    const else_ip = stack.pop();
                    _op = program.ops[Number(else_ip)];
                    if (
                        !else_ip ||
                        !_op ||
                        _op.type !== OpType.Keyword ||
                        _op.operation !== Keyword.Else
                    )
                        compilerError(
                            [op.location],
                            'if* can only come after else'
                        );
                    else {
                        stack.push(else_ip);
                        stack.push(ip);
                    }
            }
        } else if (op.type === OpType.SkipFn) stack.push(ip);
    }

    assert(
        stack.length === 0,
        'Stack is not empty\n' +
            stack
                .map((ip) => program.ops[Number(ip)])
                .map(
                    (op) =>
                        op.location[0] +
                        ':' +
                        op.location[1] +
                        ':' +
                        op.location[2] +
                        ': ' +
                        JSON.stringify(op)
                )
                .join('\n')
    );

    return program;
}
