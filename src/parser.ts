import assert from 'assert';
import { join } from 'path';
import {
    typeNames,
    KeywordNames,
    IntrinsicNames,
    INCLUDE_DIRECTORY,
} from './constants';
import {
    compilerError,
    expectedTT,
    doesntmatchTT,
    expectedChars,
    error,
} from './errors';
import { generateTokens, makeNumber } from './generateTokens';
import { Loc, TokenType, OpType, Type, Token, Program } from './types';
import { checkExistence, humanTokenType, valid } from './utils';

export async function parseProgram(tokens: Token[]): Promise<Program> {
    const memories: Record<string, number> = {};
    const functions: Record<string, number> = {};
    const structs: Record<string, { name: string; type: Type[] }[]> = {};
    const program: Program = {
        ops: [],
        memorysize: 0,
        contracts: {},
        mainop: undefined,
    };
    const constants: Record<string, { type: Type; value: number }> = {};
    const included: string[] = [];
    if (!tokens.length) error('The file is empty!');

    let isInFunction: boolean = false;
    let nestings = 0;

    let offsetValue = 0;

    let ip = 0;

    function makeType(typ: string, loc: Loc): Type[] {
        const types: Type[] = [];

        if (typeNames[typ as keyof typeof typeNames] !== undefined)
            types.push(typeNames[typ as keyof typeof typeNames]);
        else if (structs[typ] === undefined)
            compilerError(loc, "Couldn't find Type or Struct of name " + typ);
        else {
            for (const { type } of structs[typ]) {
                types.push(...type);
            }
        }

        return types;
    }

    function structToTypes(struct: typeof structs[string]): Type[] {
        const types: Type[] = [];

        for (const { type } of struct) {
            types.push(...type);
        }

        return types;
    }

    while (ip < tokens.length) {
        const token = tokens[ip];
        if (
            !isInFunction &&
            (token.type !== TokenType.Word ||
                ![
                    'include',
                    'end',
                    'in',
                    '--',
                    'fn',
                    'const',
                    'memory',
                    'struct',
                ].includes(token.value))
        )
            compilerError(token.loc, 'No code outside a method is allowed');
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
        else if (token.type === TokenType.Word && token.value === 'memory') {
            ip++;
            const name = tokens[ip];
            if (!name)
                compilerError(token.loc, 'Expected Word but got nothing');
            if (name.type !== TokenType.Word)
                compilerError(
                    token.loc,
                    'Expected Word but got ' + humanTokenType(name.type)
                );
            if (
                KeywordNames[name.value as keyof typeof KeywordNames] !==
                    undefined ||
                memories[name.value] !== undefined ||
                functions[name.value] !== undefined ||
                IntrinsicNames[name.value as keyof typeof IntrinsicNames] !==
                    undefined ||
                structs[name.value] !== undefined
            )
                compilerError(
                    token.loc,
                    'Redefinition of memory, function, structs, Intrinsic or Keyword is not allowed'
                );
            ip++;
            const toks: Token[] = [];

            while (ip < tokens.length) {
                const tok = tokens[ip];
                if (tok.type === TokenType.Word && tok.value === 'end') break;
                else if (tok.type === TokenType.Integer) toks.push(tok);
                else if (tok.type !== TokenType.Word)
                    compilerError(
                        tok.loc,
                        'Only numbers, constants, +, *, -, /, % and casting is allowed in memories'
                    );
                else if (constants[tok.value] !== undefined)
                    toks.push({
                        loc: tok.loc,
                        type: TokenType.Integer,
                        value: constants[tok.value].value,
                    });
                else if (makeNumber(tok.value) !== undefined)
                    toks.push({
                        type: TokenType.Integer,
                        value: makeNumber(tok.value) || 0,
                        loc: tok.loc,
                    });
                else if (
                    ![
                        '+',
                        '-',
                        '/',
                        '*',
                        '%',
                        'cast(ptr)',
                        'cast(bool)',
                        'cast(int)',
                    ].includes(tok.value)
                )
                    compilerError(
                        tok.loc,
                        'Only numbers, +, *, -, /, %, casting and offsetting is allowed in constants'
                    );
                else toks.push(tok);
                ip++;
            }
            if (
                tokens[ip].type !== TokenType.Word ||
                tokens[ip].value !== 'end'
            )
                compilerError(tokens[ip].loc, 'Expected end but found nothing');
            const simStack: number[] = [];
            for (const t of toks) {
                if (t.type === TokenType.Integer) simStack.push(t.value);
                else if (t.type === TokenType.Word) {
                    switch (t.value) {
                        case '+':
                            if (simStack.length < 2)
                                compilerError(
                                    t.loc,
                                    'Simulationstack does not contain enough values for this operation'
                                );
                            else
                                simStack.push(
                                    (simStack.pop() || 0) +
                                        (simStack.pop() || 0)
                                );
                            break;
                        case '-':
                            if (simStack.length < 2)
                                compilerError(
                                    t.loc,
                                    'Simulationstack does not contain enough values for this operation'
                                );
                            else
                                simStack.push(
                                    (simStack.pop() || 0) -
                                        (simStack.pop() || 0)
                                );
                            break;
                        case '*':
                            if (simStack.length < 2)
                                compilerError(
                                    t.loc,
                                    'Simulationstack does not contain enough values for this operation'
                                );
                            else
                                simStack.push(
                                    (simStack.pop() || 0) *
                                        (simStack.pop() || 0)
                                );
                            break;
                        case '/':
                            if (simStack.length < 2)
                                compilerError(
                                    t.loc,
                                    'Simulationstack does not contain enough values for this operation'
                                );
                            else
                                simStack.push(
                                    (simStack.pop() || 0) /
                                        (simStack.pop() || 0)
                                );
                            break;
                        case '%':
                            if (simStack.length < 2)
                                compilerError(
                                    t.loc,
                                    'Simulationstack does not contain enough values for this operation'
                                );
                            else
                                simStack.push(
                                    (simStack.pop() || 0) %
                                        (simStack.pop() || 0)
                                );
                            break;
                        default:
                            assert(false, 'unreachable');
                    }
                } else assert(false, 'unreachable');
            }

            if (simStack.length !== 1)
                compilerError(
                    token.loc,
                    'Error: No or too many elements on the Simulation stack'
                );
            const size = simStack[simStack.length - 1];
            const end = tokens[ip];
            if (!end)
                compilerError(
                    token.loc,
                    'Expected `end` Keyword, but got nothing'
                );
            if (end.type !== TokenType.Word)
                compilerError(
                    end.loc,
                    'Expected Word but got ' + humanTokenType(end.type)
                );
            if (end.value !== 'end')
                compilerError(
                    end.loc,
                    'Expected `end` Keyword, but got `' + end.value + '`'
                );
            if (isNaN(Number(size))) assert(false, 'unreachable');
            memories[name.value] = program.memorysize;
            program.memorysize += Number(size);
        } else if (token.type === TokenType.Word && token.value === 'fn') {
            isInFunction = true;
            ip++;
            const name = tokens[ip];
            if (!name)
                compilerError(
                    token.loc,
                    'Error: Expected Word but found nothing'
                );
            if (name.type !== TokenType.Word)
                compilerError(
                    token.loc,
                    'Error: Expected Word but found ' +
                        humanTokenType(name.type)
                );

            if (
                KeywordNames[name.value as keyof typeof KeywordNames] !==
                    undefined ||
                memories[name.value] !== undefined ||
                functions[name.value] !== undefined ||
                IntrinsicNames[name.value as keyof typeof IntrinsicNames] !==
                    undefined ||
                constants[name.value] !== undefined ||
                structs[name.value] !== undefined
            )
                compilerError(
                    token.loc,
                    'Redefinition of memory, function, constant, structs, Intrinsic or Keyword is not allowed'
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
                        'Expected Word, but found ' +
                            humanTokenType(typeorsplit.type)
                    );
                if (
                    typeorsplit.value !== '--' &&
                    typeorsplit.value !== 'in' &&
                    typeNames[typeorsplit.value as keyof typeof typeNames] ===
                        undefined &&
                    structs[typeorsplit.value] === undefined
                )
                    compilerError(
                        typeorsplit.loc,
                        'Expected a Type, -- or in, found ' + typeorsplit.value
                    );

                if (typeorsplit.value === 'in') break;
                else if (typeorsplit.value === '--' && !isAtIns)
                    compilerError(
                        token.loc,
                        'Found -- more than once in the function contract'
                    );
                else if (typeorsplit.value === '--') isAtIns = false;
                else if (
                    typeNames[typeorsplit.value as keyof typeof typeNames] !==
                    undefined
                )
                    (isAtIns ? ins : outs).push(
                        typeNames[typeorsplit.value as keyof typeof typeNames]
                    );
                else if (structs[typeorsplit.value] !== undefined) {
                    (isAtIns ? ins : outs).push(
                        ...structToTypes(structs[typeorsplit.value])
                    );
                } else assert(false, 'Unreachable');

                ip++;
            }
            if (tokens[ip].value !== 'in')
                compilerError(
                    token.loc,
                    'Expected in but found ' + tokens[ip].value
                );

            program.ops.push({
                location: token.loc,
                token,
                operation: 0,
                type: OpType.SkipFn,
            });

            if (name.value === 'main') {
                if (ins.length > 0)
                    compilerError(
                        token.loc,
                        "The main function can't take any arguments"
                    );
                if (outs.length > 1)
                    compilerError(
                        token.loc,
                        "The main function can't return more than 1 thing"
                    );
                if (outs.length === 1 && outs[0] !== Type.Int)
                    compilerError(
                        token.loc,
                        'The main method has to return an int or nothing'
                    );
                program.mainop = program.ops.length;
            }
            program.contracts[program.ops.length] = {
                ins,
                outs,
                used: name.value === 'main',
            };
            functions[name.value] = program.ops.length;
            program.ops.push({
                location: token.loc,
                token,
                operation: 0,
                type: OpType.PrepFn,
            });
        } else if (token.type === TokenType.Word && token.value === 'include') {
            ip++;
            const path = tokens[ip];
            if (!path)
                compilerError(token.loc, 'Expected String but found nothing');
            if (
                path.type !== TokenType.String &&
                path.type !== TokenType.CString
            )
                compilerError(
                    path.loc,
                    'Expected String but found ' + humanTokenType(path.type)
                );

            const file = join(token.loc[0], '..');
            const files = [
                valid(
                    !path.value.toString().startsWith('./'),
                    join(
                        INCLUDE_DIRECTORY,
                        path.value +
                            (path.value.toString().endsWith('.undefied')
                                ? ''
                                : '.undefied')
                    )
                ),
                valid(
                    !path.value.toString().startsWith('./'),
                    join(
                        process.cwd(),
                        'modules',
                        path.value +
                            (path.value.toString().endsWith('.undefied')
                                ? ''
                                : '.undefied')
                    )
                ),
                valid(
                    !path.value.toString().startsWith('./') &&
                        !path.value.toString().endsWith('.undefied'),
                    join(
                        process.cwd(),
                        'modules',
                        path.value.toString(),
                        'main.undefied'
                    )
                ),
                valid(
                    !path.value.toString().startsWith('./'),
                    join(
                        file,
                        'modules',
                        path.value +
                            (path.value.toString().endsWith('.undefied')
                                ? ''
                                : '.undefied')
                    )
                ),
                valid(
                    !path.value.toString().startsWith('./') &&
                        !path.value.toString().endsWith('.undefied'),
                    join(
                        file,
                        'modules',
                        path.value.toString(),
                        'main.undefied'
                    )
                ),
                valid(
                    path.value.toString().startsWith('./'),
                    join(
                        file,
                        '..',
                        path.value +
                            (path.value.toString().endsWith('.undefied')
                                ? ''
                                : '.undefied')
                    )
                ),
                valid(
                    path.value.toString().startsWith('./') &&
                        !path.value.toString().endsWith('.undefied'),
                    join(file, '..', path.value.toString(), 'main.undefied')
                ),
            ];
            const importFile = checkExistence(...files);
            if (!importFile)
                compilerError(
                    path.loc,
                    'File does not exist (Checked for: ' +
                        files.filter((el) => el !== undefined).join(' ')
                );
            else if (!included.includes(importFile)) {
                included.push(importFile);
                console.log('Including', importFile);
                const generatedTokens = await generateTokens(importFile);
                generatedTokens.push(...tokens.slice(ip + 1));
                tokens = generatedTokens;
                ip = -1;
            }
        } else if (token.type === TokenType.Word && token.value === 'const') {
            ip++;
            const name = tokens[ip];
            if (!name)
                compilerError(token.loc, 'Expected Word but found nothing');
            else if (name.type !== TokenType.Word)
                compilerError(
                    name.loc,
                    'Expected Word but found ' + humanTokenType(name.type)
                );
            else {
                if (
                    KeywordNames[name.value as keyof typeof KeywordNames] !==
                        undefined ||
                    memories[name.value] !== undefined ||
                    functions[name.value] !== undefined ||
                    IntrinsicNames[
                        name.value as keyof typeof IntrinsicNames
                    ] !== undefined ||
                    constants[name.value] !== undefined ||
                    structs[name.value] !== undefined
                )
                    compilerError(
                        token.loc,
                        'Redefinition of memory, function, constant, structs, Intrinsic or Keyword is not allowed'
                    );
                const toks: Token[] = [];
                ip++;
                let offset: boolean = false;
                let reset: boolean = false;
                while (ip < tokens.length) {
                    const tok = tokens[ip];
                    if (tok.type === TokenType.Word && tok.value === 'end')
                        break;
                    else if (tok.type === TokenType.Integer) toks.push(tok);
                    else if (tok.type !== TokenType.Word)
                        compilerError(
                            tok.loc,
                            'Only numbers, constants, +, *, -, /, %, casting or offsetting is allowed in constants'
                        );
                    else if (tok.value === 'offset') {
                        if (offset || reset)
                            compilerError(
                                tok.loc,
                                'only 1 offset or reset is allowed'
                            );
                        offset = true;
                    } else if (tok.value === 'reset') {
                        if (offset || reset)
                            compilerError(
                                tok.loc,
                                'only 1 offset or reset is allowed'
                            );
                        reset = true;
                    } else if (constants[tok.value] !== undefined)
                        toks.push({
                            loc: tok.loc,
                            type: TokenType.Integer,
                            value: constants[tok.value].value,
                        });
                    else if (makeNumber(tok.value) !== undefined)
                        toks.push({
                            type: TokenType.Integer,
                            value: makeNumber(tok.value) || 0,
                            loc: tok.loc,
                        });
                    else if (
                        ![
                            '+',
                            '-',
                            '/',
                            '*',
                            '%',
                            'cast(ptr)',
                            'cast(bool)',
                            'cast(int)',
                        ].includes(tok.value)
                    )
                        compilerError(
                            tok.loc,
                            'Only numbers, +, *, -, /, %, casting and offsetting is allowed in constants'
                        );
                    else toks.push(tok);
                    ip++;
                }
                if (
                    tokens[ip].type !== TokenType.Word ||
                    tokens[ip].value !== 'end'
                )
                    compilerError(
                        tokens[ip].loc,
                        'Expected end but found nothing'
                    );
                const simStack: number[] = [];
                let type: Type = Type.Int;
                for (const t of toks) {
                    if (t.type === TokenType.Integer) simStack.push(t.value);
                    else if (t.type === TokenType.Word) {
                        switch (t.value) {
                            case '+':
                                if (simStack.length < 2)
                                    compilerError(
                                        t.loc,
                                        'Simulationstack does not contain enough values for this operation'
                                    );
                                {
                                    const [v2, v1] = [
                                        simStack.pop(),
                                        simStack.pop(),
                                    ];
                                    simStack.push((v1 || 0) + (v2 || 0));
                                }
                                break;
                            case '-':
                                if (simStack.length < 2)
                                    compilerError(
                                        t.loc,
                                        'Simulationstack does not contain enough values for this operation'
                                    );
                                else {
                                    const [v2, v1] = [
                                        simStack.pop(),
                                        simStack.pop(),
                                    ];
                                    simStack.push((v1 || 0) - (v2 || 0));
                                }
                                break;
                            case '*':
                                if (simStack.length < 2)
                                    compilerError(
                                        t.loc,
                                        'Simulationstack does not contain enough values for this operation'
                                    );
                                {
                                    const [v2, v1] = [
                                        simStack.pop(),
                                        simStack.pop(),
                                    ];
                                    simStack.push((v1 || 0) * (v2 || 0));
                                }
                                break;
                            case '/':
                                if (simStack.length < 2)
                                    compilerError(
                                        t.loc,
                                        'Simulationstack does not contain enough values for this operation'
                                    );
                                {
                                    const [v2, v1] = [
                                        simStack.pop(),
                                        simStack.pop(),
                                    ];
                                    simStack.push((v1 || 0) / (v2 || 0));
                                }
                                break;
                            case '%':
                                if (simStack.length < 2)
                                    compilerError(
                                        t.loc,
                                        'Simulationstack does not contain enough values for this operation'
                                    );
                                {
                                    const [v2, v1] = [
                                        simStack.pop(),
                                        simStack.pop(),
                                    ];
                                    simStack.push((v1 || 0) % (v2 || 0));
                                }
                                break;
                            case 'cast(ptr)':
                                type = Type.Ptr;
                                break;
                            case 'cast(bool)':
                                type = Type.Bool;
                                break;
                            case 'cast(int)':
                                type = Type.Int;
                                break;
                            default:
                                assert(false, 'unreachable');
                        }
                    } else assert(false, 'unreachable');
                }

                if (simStack.length !== 1 && !reset)
                    compilerError(
                        token.loc,
                        'Error: No or too many elements on the Simulation stack'
                    );
                else {
                    if ((offset || reset) && type !== Type.Int)
                        compilerError(token.loc, 'Only integers can be offset');
                    if (type === Type.Bool)
                        simStack[0] = simStack[0] === 0 ? 0 : 1;
                    if (offset || reset) {
                        constants[name.value] = { type, value: offsetValue };
                        offsetValue = offset ? offsetValue + simStack[0] : 0;
                    } else constants[name.value] = { type, value: simStack[0] };
                }
            }
        } else if (token.type === TokenType.Word && token.value === 'struct') {
            ip++;
            const name = tokens[ip];
            if (name?.type !== TokenType.Word)
                expectedTT(token.loc, TokenType.Word, name?.type);
            if (
                KeywordNames[name.value as keyof typeof KeywordNames] !==
                    undefined ||
                memories[name.value] !== undefined ||
                functions[name.value] !== undefined ||
                IntrinsicNames[name.value as keyof typeof IntrinsicNames] !==
                    undefined ||
                constants[name.value] !== undefined ||
                structs[name.value] !== undefined
            )
                compilerError(
                    token.loc,
                    'Redefinition of memory, function, constant, structs, Intrinsic or Keyword is not allowed'
                );
            ip++;
            if (
                tokens[ip]?.type !== TokenType.Word &&
                tokens[ip]?.value !== 'in'
            )
                doesntmatchTT(
                    tokens[ip]?.loc || name.loc,
                    TokenType.Word,
                    tokens[ip]?.type || TokenType.None,
                    'in',
                    tokens[ip]?.value || 'none'
                );
            ip++;
            const values: typeof structs[string] = [];
            let typeName: string = '';
            let lastLoc: Loc = tokens[ip].loc;
            let lastLen: number = 0;

            while (tokens[ip] !== undefined && tokens[ip].value !== 'end') {
                const tok = tokens[ip];
                lastLoc = tok.loc;
                lastLen = tok.value.toString().length;

                if (tok.type !== TokenType.Word)
                    expectedTT(tok.loc, TokenType.Word, tok.type);
                else if (typeName === '') typeName = tok.value;
                else {
                    values.push({
                        name: typeName,
                        type: makeType(tok.value, tok.loc),
                    });
                    typeName = '';
                }
                ip++;
            }
            if (tokens[ip] === undefined || tokens[ip].value !== 'end')
                compilerError(
                    tokens[ip]
                        ? tokens[ip].loc
                        : [
                              lastLoc[0],
                              lastLoc[1],
                              lastLoc[2] + typeName.length + lastLen,
                          ],
                    'Expected end but found ' +
                        (tokens[ip] ? tokens[ip].value : 'nothing')
                );
            if (typeName !== '')
                compilerError(tokens[ip].loc, 'Expected a type but found end');

            let offset: number = 0;
            for (const v of values) {
                if (constants[name.value + '.' + v.name] !== undefined)
                    compilerError(
                        token.loc,
                        'You have already constants for the length and/or offset of parts of this Struct'
                    );
                if (
                    constants['sizeof' + name.value + '.' + v.name + ')'] !==
                    undefined
                )
                    compilerError(
                        token.loc,
                        'You have already constants for the length and/or offset of parts of this Struct'
                    );
                constants[name.value + '.' + v.name] = {
                    type: Type.Ptr,
                    value: offset,
                };
                constants['sizeof(' + name.value + '.' + v.name + ')'] = {
                    type: Type.Int,
                    value: v.type.length,
                };
                offset += v.type.length;
            }
            if (constants['sizeof(' + name.value + ')'] !== undefined)
                compilerError(
                    token.loc,
                    'You have already constants for the size of this struct'
                );
            constants['sizeof(' + name.value + ')'] = {
                type: Type.Int,
                value: offset,
            };

            structs[name.value] = values;
        } else if (token.type === TokenType.Word && token.value === 'return') {
            program.ops.push({
                type: OpType.Ret,
                location: token.loc,
                operation: 1,
                token,
            });
        } else if (
            token.type === TokenType.Word &&
            token.value === 'assembly'
        ) {
            ip++;
            let value = '';

            while (ip < tokens.length) {
                const tok = tokens[ip];
                if (!tok) break;

                if (
                    tok.type === TokenType.String ||
                    tok.type === TokenType.CString
                ) {
                    if (tok.value) value += tok.value + '\n';
                } else if (tok.type === TokenType.Word && tok.value === 'end')
                    break;
                else if (tok.type === TokenType.Word)
                    expectedChars(tok.loc, 'end', tok.value);
                else
                    compilerError(
                        tok.loc,
                        'Expected end, CString or String, but found ' +
                            humanTokenType(tok.type)
                    );

                ip++;
            }

            if (tokens[ip] === undefined)
                compilerError(
                    token.loc,
                    'Expected end, CString or String but found nothing!'
                );
            else if (tokens[ip].type !== TokenType.Word)
                expectedTT(tokens[ip].loc, TokenType.Word, tokens[ip].type);
            else if (tokens[ip].value !== 'end')
                expectedChars(tokens[ip].loc, 'end', tokens[ip].value);
            else
                program.ops.push({
                    type: OpType.PushAsm,
                    location: token.loc,
                    token,
                    operation: value,
                });
        } else {
            if (
                IntrinsicNames[token.value as keyof typeof IntrinsicNames] ===
                    undefined &&
                KeywordNames[token.value as keyof typeof KeywordNames] ===
                    undefined &&
                memories[token.value] === undefined &&
                functions[token.value] === undefined &&
                constants[token.value] === undefined
            ) {
                compilerError(
                    token.loc,
                    'Word "' +
                        token.value +
                        '" is not an Intrinsic, Keyword, function or memory name'
                );
            } else if (
                IntrinsicNames[token.value as keyof typeof IntrinsicNames] !==
                undefined
            )
                program.ops.push({
                    location: token.loc,
                    token,
                    operation:
                        IntrinsicNames[
                            token.value as keyof typeof IntrinsicNames
                        ],
                    type: OpType.Intrinsic,
                });
            else if (
                KeywordNames[token.value as keyof typeof KeywordNames] !==
                undefined
            ) {
                if (token.value === 'end' && nestings < 1) isInFunction = false;
                else if (token.value === 'end') nestings--;
                else if (
                    ['if', 'while', 'const', 'memory'].includes(token.value)
                )
                    nestings++;
                program.ops.push({
                    location: token.loc,
                    token,
                    operation:
                        KeywordNames[token.value as keyof typeof KeywordNames],
                    type: OpType.Keyword,
                });
            } else if (memories[token.value] !== undefined)
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
            else if (constants[token.value] !== undefined) {
                program.ops.push({
                    _type: constants[token.value].type,
                    operation: constants[token.value].value,
                    location: token.loc,
                    token,
                    type: OpType.Const,
                });
            } else {
                console.log(token);
                compilerError(token.loc, 'Unknown error');
            }
        }
        ip++;
    }
    return program;
}
