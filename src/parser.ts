import assert from 'assert';
import { join } from 'path';
import {
    typeNames,
    KeywordNames,
    IntrinsicNames,
    INCLUDE_DIRECTORY,
    INFO,
} from './constants';
import {
    compilerError,
    expectedTT,
    doesntmatchTT,
    expectedChars,
    error,
    compilerWarn,
    compilerInfo,
    warn,
} from './errors';
import { generateTokens, makeNumber } from './generateTokens';
import { timer } from './timer';
import {
    Loc,
    TokenType,
    OpType,
    Type,
    Token,
    Program,
    Operation,
    Memory,
    EnhancedType,
    ControlToken,
    WordToken,
} from './types';
import { checkExistence } from './utils/files';
import { valid } from './utils/general';
import { humanTokenType, nameIsValid } from './utils/tokens';
import { $humanType, createEnhancedType, exactMatch } from './utils/types';

export async function parseProgram(
    tokens: Token[],
    optimizations: number,
    predefConsts: Record<string, number>,
    dev: boolean,
    check: boolean
): Promise<Program> {
    const end = timer.start('parseProgram()');
    const functions: Record<string, number> = {};
    const structs: Record<string, { name: string; type: Type[] }[]> = {};
    const program: Program = {
        ops: [],
        mems: {},
        contracts: {},
        mainop: undefined,
        functionsToRun: [],
    };
    function val(value: number) {
        return { type: Type.Int, value };
    }
    const dt = new Date();
    const transformedPredefConsts: Record<
        string,
        { type: Type; value: number }
    > = {};
    for (const [k, v] of Object.entries(predefConsts)) {
        transformedPredefConsts[k] = { type: Type.Int, value: v };
    }

    const constants: Record<string, { type: Type; value: number }> = {
        ...transformedPredefConsts,
        __UNIXTIME__: val(dt.getTime()),

        // UTC
        __DATE_UTC_DAY__: val(dt.getUTCDate()),
        __DATE_UTC_WEEK_DAY__: val(dt.getUTCDay()),
        __DATE_UTC_MONTH__: val(dt.getUTCMonth() + 1),
        __DATE_UTC_YEAR__: val(dt.getUTCFullYear()),
        __TIME_UTC_HOURS__: val(dt.getUTCHours()),
        __TIME_UTC_MINUTES__: val(dt.getUTCMinutes()),
        __TIME_UTC_SECONDS__: val(dt.getUTCSeconds()),
        __TIME_UTC_MILLISECONDS__: val(dt.getUTCMilliseconds()),

        // Local
        __DATE_DAY__: val(dt.getDate()),
        __DATE_WEEK_DAY__: val(dt.getDay()),
        __DATE_MONTH__: val(dt.getMonth() + 1),
        __DATE_YEAR__: val(dt.getFullYear()),
        __TIME_HOURS__: val(dt.getHours()),
        __TIME_MINUTES__: val(dt.getMinutes()),
        __TIME_SECONDS__: val(dt.getSeconds()),
        __TIME_MILLISECONDS__: val(dt.getMilliseconds()),

        __UNDEFIED_MAJOR__: val(INFO.versionDetailed.major),
        __UNDEFIED_MINOR__: val(INFO.versionDetailed.minor),
        __UNDEFIED_PATCHLEVEL__: val(INFO.versionDetailed.patchLevel),
        __OPTIMIZATIONS__: val(optimizations),
        __DEV__: {
            type: Type.Bool,
            value: dev ? 1 : 0,
        },
        __TYPECHECK__: {
            type: Type.Bool,
            value: check ? 1 : 0,
        },
    };
    const included: string[] = [];
    if (tokens.length < 1) error('The file is empty!');

    let isInFunction: boolean = false;
    let nestings = 0;

    let offsetValue = 0;
    let inlineNextFunction = false;

    const builtinLoc: Loc = ['<built-in>', 0, 0];
    const macros: Record<string, Token[]> = {
        __UNDEFIED_VERSION__: [
            { type: TokenType.String, value: INFO.version, loc: builtinLoc },
        ],
        __UNDEFIED_VERSION_CSTR__: [
            { type: TokenType.CString, value: INFO.version, loc: builtinLoc },
        ],
        __BASE_FILE__: [
            {
                type: TokenType.String,
                value: tokens[0].loc[0],
                loc: builtinLoc,
            },
        ],
        __BASE_FILE_CSTR__: [
            {
                type: TokenType.CString,
                value: tokens[0].loc[0],
                loc: builtinLoc,
            },
        ],
    };

    let ip = 0;

    let pragmaMultiple: string[] = [];
    let lastincluded: string = tokens[0].loc[0];

    function makeType(typ: string, loc: Loc): Type[] {
        const types: Type[] = [];

        if (typeNames[typ as keyof typeof typeNames] !== undefined)
            types.push(typeNames[typ as keyof typeof typeNames]);
        else if (structs[typ] === undefined)
            compilerError([loc], "Couldn't find Type or Struct of name " + typ);
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
    function isDefined(name: string | number): boolean {
        return (
            KeywordNames[name as keyof typeof KeywordNames] !== undefined ||
            program.mems[name] !== undefined ||
            functions[name] !== undefined ||
            IntrinsicNames[name as keyof typeof IntrinsicNames] !== undefined ||
            constants[name] !== undefined ||
            structs[name] !== undefined ||
            macros[name] !== undefined
        );
    }
    function getDefType(
        name: string | number
    ):
        | 'macro'
        | 'fn'
        | 'struct'
        | 'const'
        | 'memory'
        | 'intrinsic'
        | 'keyword'
        | undefined {
        if (KeywordNames[name as keyof typeof KeywordNames] !== undefined)
            return 'keyword';
        if (IntrinsicNames[name as keyof typeof IntrinsicNames] !== undefined)
            return 'intrinsic';
        if (functions[name] !== undefined) return 'fn';
        if (constants[name] !== undefined) return 'const';
        if (structs[name] !== undefined) return 'struct';
        if (macros[name] !== undefined) return 'macro';
        if (program.mems[name] !== undefined) return 'memory';
    }
    function isBlockKeyword(name: string): boolean {
        return [
            'struct',
            'const',
            'assembly',
            'if',
            'while',
            'memory',
            'fn',
            'namespace',
            'impl',
        ].includes(name);
    }

    const preprocessorBlocks: string[] = [
        '.ifdef',
        '.ifndef',
        '.ifeq',
        '.ifneq',
        '.is',
        '.isn',
        '.if',
        '.ifn',
    ];
    const outsideKeywords: string[] = [
        'include',
        'end',
        'in',
        '--',
        'fn',
        'const',
        'memory',
        'struct',
        'inline',
        'undef',
        '.ifdef',
        '.ifndef',
        '.is',
        '.isn',
        '.end',
        '.ifeq',
        '.ifneq',
        '.log',
        '.error',
        '.warn',
        '.pragma',
        '.if',
        '.ifn',
        '.param',
        '.defparam',
        'namespace',
        'impl',
    ];

    // what words should not reset the parameters
    const sustainParameters: string[] = [
        'fn',
        '.param',
        '.defparam',
        'assembly',
    ];

    function skipPreprocessor(...toks: Token[]) {
        let $nestings = 0;
        while (true) {
            const tok = tokens[++ip];
            if (!tok)
                compilerError(
                    [
                        tokens[--ip]?.loc || ['<unknown>', 0, 0],
                        ...toks.map((el) => el.loc),
                    ],
                    'Expected .end, but found nothing'
                );
            if (tok.type === TokenType.Word && tok.value === '.end')
                $nestings--;
            else if (
                tok.type === TokenType.Word &&
                preprocessorBlocks.includes(tok.value)
            )
                $nestings++;
            if ($nestings < 0) break;
        }
    }

    let nextParams: Record<string, string> = {};
    let currentNamespace = '';

    while (ip < tokens.length) {
        const token = tokens[ip];
        if (!token) break;
        if (token.type === TokenType.None) {
            ip++;
            continue;
        }
        if (token.type === TokenType.Control) {
            if (token.args) {
                const type = token.args.type;
                if (type && typeof type === 'string') {
                    if (type === 'reset_namespace') currentNamespace = '';
                    else
                        warn(
                            'Warn: An internal control type with the action of %s could not get handled!',
                            type
                        );
                }
            }

            ip++;
            continue;
        }
        if (token.type !== TokenType.Word && Object.keys(nextParams).length > 0)
            nextParams = {};
        if (
            token.type === TokenType.Word &&
            !sustainParameters.includes(token.value) &&
            Object.keys(nextParams).length > 0
        )
            nextParams = {};
        if (token.type === TokenType.Comment)
            program.ops.push({
                type: OpType.Comment,
                location: token.loc,
                token,
                operation: token.value,
                ip: program.ops.length,
            });
        else if (
            !isInFunction &&
            (token.type !== TokenType.Word ||
                !outsideKeywords.includes(token.value))
        )
            compilerError([token.loc], 'No code outside a method is allowed');
        if (token.type === TokenType.CString)
            program.ops.push({
                location: token.loc,
                token,
                operation: token.value,
                type: OpType.PushCString,
                ip: program.ops.length,
            });
        else if (token.type === TokenType.String)
            program.ops.push({
                location: token.loc,
                token,
                operation: token.value,
                type: OpType.PushString,
                ip: program.ops.length,
            });
        else if (token.type === TokenType.Integer)
            program.ops.push({
                location: token.loc,
                token,
                operation: token.value,
                type: OpType.PushInt,
                ip: program.ops.length,
            });
        else if (token.type === TokenType.Word && token.value === 'memory') {
            ip++;
            const nameT = tokens[ip];
            expectedTT(nameT?.loc || token.loc, TokenType.Word, nameT?.type);

            const name = currentNamespace + nameT.value;
            if (isDefined(name))
                compilerError(
                    [token.loc],
                    'Redefinition of memory, function, structs, Intrinsic or Keyword is not allowed'
                );
            ip++;
            const toks: Token[] = [];

            while (ip < tokens.length) {
                const tok = tokens[ip];
                if (
                    tok.type === TokenType.Word &&
                    (tok.value === 'end' || tok.value === 'in')
                )
                    break;
                else if (tok.type === TokenType.Integer) toks.push(tok);
                else if (tok.type !== TokenType.Word)
                    compilerError(
                        [tok.loc],
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
                        [tok.loc],
                        'Only numbers, +, *, -, /, %, casting and offsetting is allowed in constants'
                    );
                else toks.push(tok);
                ip++;
            }
            if (
                tokens[ip].type !== TokenType.Word ||
                (tokens[ip] as WordToken).value !== 'end'
            )
                compilerError(
                    [tokens[ip].loc],
                    'Expected end but found nothing'
                );
            const simStack: number[] = [];
            for (const t of toks) {
                if (t.type === TokenType.Integer) simStack.push(t.value);
                else if (t.type === TokenType.Word) {
                    switch (t.value) {
                        case '+':
                            if (simStack.length < 2)
                                compilerError(
                                    [t.loc],
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
                                    [t.loc],
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
                                    [t.loc],
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
                                    [t.loc],
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
                                    [t.loc],
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
                    [token.loc],
                    'Error: No or too many elements on the Simulation stack'
                );
            const size = simStack[simStack.length - 1];
            const end = tokens[ip];
            if (!end)
                compilerError(
                    [token.loc],
                    'Expected `end` Keyword, but got nothing'
                );
            if (end.type !== TokenType.Word)
                compilerError(
                    [end.loc],
                    'Expected Word but got ' + humanTokenType(end.type)
                );

            let type: Type = Type.Any;
            if (end.value === 'in') {
                const _type = tokens[++ip];
                expectedTT(_type?.loc || end.loc, TokenType.Word, _type?.type);
                if (
                    typeNames[_type.value as keyof typeof typeNames] ===
                    undefined
                )
                    compilerError(
                        [_type.loc],
                        _type.value + ' is not a valid type'
                    );
                else type = typeNames[_type.value as keyof typeof typeNames];
                type;
                const _end = tokens[++ip];
                doesntmatchTT(
                    _end?.loc || _type.loc,
                    TokenType.Word,
                    _end?.type,
                    'end',
                    _end?.value
                );
            } else if (end.value !== 'end')
                compilerError(
                    [end.loc],
                    'Expected `end` Keyword, but got `' + end.value + '`'
                );
            if (isNaN(Number(size))) assert(false, 'unreachable');
            const memory: Memory = { size: Number(size), type };
            program.mems[name] = memory;
        } else if (token.type === TokenType.Word && token.value === 'fn') {
            isInFunction = true;
            ip++;
            const nameT = tokens[ip];
            expectedTT(nameT?.loc || token.loc, TokenType.Word, nameT?.type);

            if (!nameIsValid(nameT.value.toString()))
                compilerError([nameT.loc, token.loc], 'This name is not valid');
            const name = currentNamespace + nameT.value;
            if (isDefined(name))
                compilerError(
                    [token.loc],
                    'Redefinition of memory, function, constant, structs, Intrinsic or Keyword is not allowed'
                );

            const ins: { type: EnhancedType; loc: Loc }[] = [];
            const outs: { type: EnhancedType; loc: Loc }[] = [];
            let isAtIns = true;
            function pushType(type: string, loc: Loc) {
                const arr = isAtIns ? ins : outs;
                const typeByName = typeNames[type as keyof typeof typeNames];
                if (typeByName !== undefined)
                    return arr.push({
                        type: createEnhancedType(typeByName),
                        loc,
                    });
                const struct = structs[type];
                if (struct !== undefined)
                    return arr.push({
                        type: createEnhancedType(
                            struct.map((el) => el.type).flat(),
                            type
                        ),
                        loc,
                    });
                else if (type === 'ptr-to') {
                    if (arr.length < 1)
                        compilerError(
                            [loc],
                            'Cannot apply ptr-to: Typecheck is empty'
                        );
                    else return arr[arr.length - 1].type.pointerCount++;
                } else
                    compilerError(
                        [loc],
                        'Expect a structname, type or ptr-to, but found %s %s %s',
                        type
                    );
            }

            ip++;
            while (ip < tokens.length) {
                const typeorsplit = tokens[ip];
                if (typeorsplit.type === TokenType.Comment) {
                    ip++;
                    continue;
                } else if (typeorsplit.type !== TokenType.Word)
                    compilerError(
                        [typeorsplit.loc],
                        'Expected Word, but found ' +
                            humanTokenType(typeorsplit.type)
                    );
                if (typeorsplit.value === 'in') break;
                else if (typeorsplit.value === '--' && !isAtIns)
                    compilerError(
                        [token.loc],
                        'Found -- more than once in the function contract'
                    );
                else if (typeorsplit.value === '--') isAtIns = false;
                else if (!inlineNextFunction)
                    pushType(typeorsplit.value, typeorsplit.loc);

                ip++;
            }
            if (tokens[ip].value !== 'in')
                compilerError(
                    [token.loc],
                    'Expected in but found ' + tokens[ip].value
                );
            if (!inlineNextFunction) {
                for (const val of ins) {
                    if (
                        (val.type.types.length > 1 || val.type.typeName) &&
                        val.type.pointerCount < 1
                    )
                        compilerError(
                            [val.loc],
                            'Structs are only allowed in ptr-to types!'
                        );
                }
            }

            if (inlineNextFunction) {
                const toks: Token[] = [];
                let $nestings = 0;
                while (ip < tokens.length) {
                    const tok = tokens[++ip];
                    if (!tok) break;
                    if (tok.type === TokenType.Word && tok.value === 'end') {
                        if ($nestings < 1) break;
                        else --$nestings;
                    } else if (
                        tok.type === TokenType.Word &&
                        isBlockKeyword(tok.value)
                    )
                        $nestings++;
                    toks.push(tok);
                }
                if (tokens[ip] === undefined)
                    compilerError(
                        [tokens[ip - 1].loc],
                        'Expected end, but found nothing'
                    );
                macros[name] = toks;
            }

            if (!inlineNextFunction) {
                if (
                    nextParams.__run_function__ !== undefined &&
                    (outs.length > 0 || ins.length > 0)
                )
                    compilerError(
                        [token.loc],
                        'A function with __run_function__ has to have no ins and outs'
                    );
                if (
                    nextParams.__run_function__ !== undefined &&
                    nextParams.__provided_externally__ !== undefined
                )
                    compilerError(
                        [token.loc],
                        "A function with __run_function__ can't be supplied from an external source"
                    );
            }

            if (!inlineNextFunction)
                program.ops.push({
                    location: token.loc,
                    token,
                    operation: 0,
                    type: OpType.SkipFn,
                    functionName: name,
                    parameters: nextParams,
                    ip: program.ops.length,
                });

            if (name === 'main' && !inlineNextFunction) {
                if (ins.length > 2)
                    compilerError(
                        [token.loc],
                        'The main function can take 2 arguments max'
                    );
                if (ins.length >= 1 && !exactMatch(ins[0].type, Type.Int))
                    compilerError(
                        [token.loc],
                        'The first parameter has to be an int'
                    );
                if (
                    ins.length === 2 &&
                    !exactMatch(
                        ins[1].type,
                        createEnhancedType(Type.Ptr, undefined, 1)
                    )
                )
                    compilerError(
                        [token.loc],
                        'The second parameter has to be an ptr ptr-to'
                    );
                if (outs.length > 1)
                    compilerError(
                        [token.loc],
                        "The main function can't return more than 1 thing"
                    );
                if (outs.length > 1)
                    compilerError(
                        [token.loc],
                        'The main method has to return an int or nothing'
                    );
                if (outs.length === 1 && !exactMatch(outs[0].type, Type.Int))
                    compilerError(
                        [token.loc],
                        'The main method has to return an int or nothing'
                    );
                program.mainop = program.ops.length;
            }
            if (!inlineNextFunction) {
                const prep: Operation = {
                    location: token.loc,
                    token,
                    operation: 0,
                    type: OpType.PrepFn,
                    functionName: name,
                    parameters: nextParams,
                    ip: program.ops.length,
                };
                program.contracts[program.ops.length] = {
                    ins,
                    outs,
                    used:
                        name === 'main' ||
                        nextParams.__run_function__ !== undefined ||
                        nextParams.__export__ !== undefined,
                    prep,
                    skip: program.ops[program.ops.length - 1],
                    name: name,
                    index: program.ops.length,
                };
                if (
                    nextParams.__run_function__ &&
                    !program.functionsToRun.includes(program.ops.length)
                )
                    program.functionsToRun.push(program.ops.length);
                if (
                    nextParams.__fn_anonymous__ === undefined &&
                    nextParams.__fn_anon__ === undefined
                )
                    functions[name] = program.ops.length;
                program.ops.push(prep);
            }
            nextParams = {};
            inlineNextFunction = false;
        } else if (token.type === TokenType.Word && token.value === 'include') {
            ip++;
            const path = tokens[ip];
            if (!path)
                compilerError([token.loc], 'Expected String but found nothing');
            if (
                path.type !== TokenType.String &&
                path.type !== TokenType.CString
            )
                compilerError(
                    [path.loc],
                    'Expected String but found ' + humanTokenType(path.type)
                );

            const file = join(token.loc[0], '..');
            const files = path.value.startsWith('/')
                ? [
                      valid(
                          !path.value.endsWith('.undefied'),
                          path.value + '.undefied'
                      ),
                      path.value,
                  ]
                : [
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
                              path.value +
                                  (path.value.toString().endsWith('.undefied')
                                      ? ''
                                      : '.undefied')
                          )
                      ),
                      valid(
                          path.value.toString().startsWith('./') &&
                              !path.value.toString().endsWith('.undefied'),
                          join(file, path.value.toString(), 'main.undefied')
                      ),
                  ];
            const importFile = checkExistence(...files);
            if (!importFile)
                compilerError(
                    [path.loc],
                    'File does not exist (Checked for: ' +
                        files.filter((el) => el !== undefined).join(' ')
                );
            else if (
                !included.includes(importFile) ||
                pragmaMultiple.includes(importFile)
            ) {
                included.push(importFile);
                if (dev) compilerInfo([token.loc], 'Including %s', importFile);
                const generatedTokens = await generateTokens(importFile);
                generatedTokens.push(...tokens.slice(ip + 1));
                tokens = generatedTokens;
                ip = -1;
            }
            lastincluded = importFile;
        } else if (token.type === TokenType.Word && token.value === 'const') {
            ip++;
            const nameT = tokens[ip];
            expectedTT(nameT?.loc || token.loc, TokenType.Word, nameT?.type);
            if (!nameIsValid(nameT.value.toString()))
                compilerError([nameT.loc, token.loc], 'This name is not valid');
            const name = currentNamespace + nameT.value;

            if (isDefined(name))
                compilerError(
                    [token.loc],
                    'Redefinition of memory, function, constant, structs, Intrinsic or Keyword is not allowed'
                );
            const toks: Token[] = [];
            ip++;
            let offset: boolean = false;
            let reset: boolean = false;
            while (ip < tokens.length) {
                const tok = tokens[ip];
                if (tok.type === TokenType.Word && tok.value === 'end') break;
                else if (tok.type === TokenType.Integer) toks.push(tok);
                else if (tok.type !== TokenType.Word)
                    compilerError(
                        [tok.loc],
                        'Only numbers, constants, +, *, -, /, %, casting or offsetting is allowed in constants'
                    );
                else if (tok.value === 'offset') {
                    if (offset || reset)
                        compilerError(
                            [tok.loc],
                            'only 1 offset or reset is allowed'
                        );
                    offset = true;
                } else if (tok.value === 'reset') {
                    if (offset || reset)
                        compilerError(
                            [tok.loc],
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
                        [tok.loc],
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
                    [tokens[ip].loc],
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
                                    [t.loc],
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
                                    [t.loc],
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
                                    [t.loc],
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
                                    [t.loc],
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
                                    [t.loc],
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
                    [token.loc],
                    'Error: No or too many elements on the Simulation stack'
                );
            else {
                if ((offset || reset) && type !== Type.Int)
                    compilerError([token.loc], 'Only integers can be offset');
                if (type === Type.Bool) simStack[0] = simStack[0] === 0 ? 0 : 1;
                if (offset || reset) {
                    constants[name] = { type, value: offsetValue };
                    offsetValue = offset ? offsetValue + simStack[0] : 0;
                } else constants[name] = { type, value: simStack[0] };
            }
        } else if (token.type === TokenType.Word && token.value === 'struct') {
            ip++;
            const nameT = tokens[ip];
            expectedTT(token.loc, TokenType.Word, nameT?.type);
            const name = nameT.value;
            if (!nameIsValid(name.toString()))
                compilerError([nameT.loc, token.loc], 'This name is not valid');

            if (isDefined(name))
                compilerError(
                    [token.loc],
                    'Redefinition of memory, function, constant, structs, Intrinsic or Keyword is not allowed'
                );
            ip++;
            if (
                tokens[ip]?.type !== TokenType.Word &&
                tokens[ip]?.value !== 'in'
            )
                doesntmatchTT(
                    tokens[ip]?.loc || nameT.loc,
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

                if (tok.type === TokenType.Comment) {
                    ip++;
                    continue;
                } else if (tok.type !== TokenType.Word)
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
                    [
                        tokens[ip]
                            ? tokens[ip].loc
                            : [
                                  lastLoc[0],
                                  lastLoc[1],
                                  lastLoc[2] + typeName.length + lastLen,
                              ],
                    ],
                    'Expected end but found ' +
                        (tokens[ip] ? tokens[ip].value : 'nothing')
                );
            if (typeName !== '')
                compilerError(
                    [tokens[ip].loc],
                    'Expected a type but found end'
                );

            let offset: number = 0;
            for (const v of values) {
                if (constants[name + '.' + v.name] !== undefined)
                    compilerWarn(
                        [token.loc],
                        'You have already constants for the length and/or offset of parts of this Struct'
                    );
                else
                    constants[name + '.' + v.name] = {
                        type: Type.Ptr,
                        value: offset,
                    };
                if (
                    constants['sizeof' + name + '.' + v.name + ')'] !==
                    undefined
                )
                    compilerWarn(
                        [token.loc],
                        'You have already constants for the length and/or offset of parts of this Struct'
                    );
                else
                    constants['sizeof(' + name + '.' + v.name + ')'] = {
                        type: Type.Int,
                        value: v.type.length,
                    };
                offset += v.type.length;
            }
            if (constants['sizeof(' + name + ')'] !== undefined)
                compilerWarn(
                    [token.loc],
                    'You have already constants for the size of this struct'
                );
            else
                constants['sizeof(' + name + ')'] = {
                    type: Type.Int,
                    value: offset,
                };

            structs[name] = values;
            function comment(str: string) {
                program.ops.push({
                    type: OpType.Comment,
                    location: token.loc,
                    token,
                    operation: str,
                    ip: program.ops.length,
                });
            }
            comment(' struct ' + name + ' {');
            for (const { name, type } of values)
                comment(
                    '     ' +
                        name +
                        ': [' +
                        type.map($humanType).join(', ') +
                        '],'
                );
            comment(' }');
        } else if (token.type === TokenType.Word && token.value === 'return') {
            program.ops.push({
                type: OpType.Ret,
                location: token.loc,
                operation: 1,
                token,
                ip: program.ops.length,
                functionEnd: false,
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
                        [tok.loc],
                        'Expected end, CString or String, but found ' +
                            humanTokenType(tok.type)
                    );

                ip++;
            }

            if (tokens[ip] === undefined)
                compilerError(
                    [token.loc],
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
                    parameters: nextParams,
                    ip: program.ops.length,
                });
            nextParams = {};
        } else if (token.type === TokenType.Word && token.value === 'inline') {
            if (!check) inlineNextFunction = true;
            if (tokens[ip + 1] === undefined)
                compilerError([token.loc], 'expected fn, found nothing');
            if (
                tokens[ip + 1].type !== TokenType.Word ||
                tokens[ip + 1].value !== 'fn'
            )
                doesntmatchTT(
                    tokens[ip + 1].loc,
                    TokenType.Word,
                    tokens[ip + 1].type,
                    'fn',
                    tokens[ip + 1].value
                );
        } else if (token.type === TokenType.Word && token.value === 'undef') {
            expectedTT(
                tokens[++ip].loc || token.loc,
                TokenType.Word,
                tokens[ip]?.type
            );
            const name = tokens[ip].value;
            if (!isDefined(name))
                compilerError(
                    [token.loc],
                    'Error: No function, macro, struct or constant with the name `' +
                        name +
                        '` found!'
                );
            if (functions[name] !== undefined) delete functions[name];
            else if (constants[name] !== undefined) delete constants[name];
            else if (structs[name] !== undefined) delete structs[name];
            else if (macros[name] !== undefined) delete macros[name];
            else
                compilerError(
                    [token.loc],
                    'Error: No function, macro, struct or constant with the name `' +
                        name +
                        '` found!'
                );
        } else if (
            token.type === TokenType.Word &&
            (token.value === '.ifdef' || token.value === '.ifndef')
        ) {
            expectedTT(
                tokens[++ip]?.loc || token.loc,
                TokenType.Word,
                tokens[ip]?.type
            );
            if (isDefined(tokens[ip].value) !== (token.value === '.ifdef')) {
                skipPreprocessor(token);
            }
        } else if (token.type === TokenType.Word && token.value === '.end') {
        } else if (token.type === TokenType.Word && token.value === '.is') {
            const type = tokens[++ip];
            const name = tokens[++ip];
            expectedTT(type?.loc || token.loc, TokenType.Word, name?.type);
            const types = type.value.toString().split('|');
            const availableTypes = [
                'macro',
                'fn',
                'struct',
                'const',
                'memory',
                'intrinsic',
                'keyword',
            ];
            if (types.map((el) => availableTypes.includes(el)).includes(false))
                compilerError(
                    [type.loc],
                    'One of the specified types is not available! Available types: macro, fn, const, struct, memory'
                );
            expectedTT(name?.loc || token.loc, TokenType.Word, name?.type);

            if (!isDefined(name.value))
                compilerError([name.loc], name.value + ' is not defined');
            const defType = getDefType(name.value);
            if (!types.includes(defType as any)) skipPreprocessor(token);
        } else if (
            token.type === TokenType.Word &&
            (token.value === '.ifeq' || token.value === '.ifneq')
        ) {
            const val1 = tokens[++ip];
            const val2 = tokens[++ip];
            expectedTT(val1?.loc, TokenType.Word, val1?.type);
            if (constants[val1.value] === undefined)
                compilerError([val1.loc], val1.value + ' is not a constant');
            expectedTT(val2?.loc, TokenType.Word, val2?.type);
            if (constants[val2.value] === undefined)
                compilerError([val2.loc], val2.value + ' is not a constant');

            const eq =
                constants[val1.value].value === constants[val2.value].value;
            if (eq !== (token.value === '.ifeq')) skipPreprocessor(token);
        } else if (token.type === TokenType.Word && token.value === '.isn') {
            const type = tokens[++ip];
            const name = tokens[++ip];
            expectedTT(type?.loc || token.loc, TokenType.Word, name?.type);
            const types = type.value.toString().split('|');
            const availableTypes = [
                'macro',
                'fn',
                'struct',
                'const',
                'memory',
                'intrinsic',
                'keyword',
            ];
            if (types.map((el) => availableTypes.includes(el)).includes(false))
                compilerError(
                    [type.loc],
                    'One of the specified types is not available! Available types: macro, fn, const, struct, memory'
                );
            expectedTT(name?.loc || token.loc, TokenType.Word, name?.type);

            if (!isDefined(name.value))
                compilerError([name.loc], name.value + ' is not defined');
            const defType = getDefType(name.value);
            if (types.includes(defType as any)) skipPreprocessor(token);
        } else if (
            token.type === TokenType.Word &&
            ['.log', '.error', '.warn'].includes(token.value)
        ) {
            const log =
                token.value === '.error'
                    ? compilerError
                    : token.value === '.warn'
                    ? compilerWarn
                    : compilerInfo;

            const value = tokens[++ip];
            if (!value)
                compilerError(
                    [token.loc],
                    'Expected Word, Int, CString or String, but found nothing'
                );
            if (value.type === TokenType.Comment)
                compilerError(
                    [value.loc],
                    'Expected Word, Int, CString or String, but found Comment'
                );

            if (
                constants[value.value] === undefined &&
                value.type === TokenType.Word
            )
                compilerError(
                    [value.loc],
                    value.value + ' is not a defined constant'
                );
            log(
                [token.loc],
                value.type === TokenType.Word
                    ? constants[value.value].value.toString()
                    : value.value.toString()
            );
        } else if (token.type === TokenType.Word && token.value === '.pragma') {
            const type = tokens[++ip];
            expectedTT(type?.loc || token.loc, TokenType.Word, type?.type);
            if (type.value !== 'once' && type.value !== 'multiple')
                compilerError(
                    [type.loc],
                    'Expected once or multiple, but found %s',
                    type.value
                );
            const f = lastincluded;
            if (type.value === 'once' && pragmaMultiple.includes(f))
                pragmaMultiple = pragmaMultiple.filter((el) => el !== f);
            else if (type.value === 'multiple' && !pragmaMultiple.includes(f))
                pragmaMultiple.push(f);
        } else if (
            token.type === TokenType.Word &&
            (token.value === '.if' || token.value === '.ifn')
        ) {
            const val1 = tokens[++ip];
            expectedTT(val1?.loc, TokenType.Word, val1?.type);
            if (constants[val1.value] === undefined)
                compilerError([val1.loc], val1.value + ' is not a constant');
            if (constants[val1.value].type !== Type.Bool)
                compilerError([val1.loc], val1.value + ' is not of type bool');
            if ((token.value === '.if') !== (constants[val1.value].value !== 0))
                skipPreprocessor(token);
        } else if (token.type === TokenType.Word && token.value === '.param') {
            const paramname = tokens[++ip];
            expectedTT(
                paramname?.loc || token.loc,
                TokenType.Word,
                paramname?.type
            );
            nextParams[paramname.value.toString()] = '';
        } else if (
            token.type === TokenType.Word &&
            token.value === '.defparam'
        ) {
            const paramname = tokens[++ip];
            const paramvalue = tokens[++ip];
            expectedTT(
                paramname?.loc || token.loc,
                TokenType.Word,
                paramname?.type
            );
            expectedTT(
                paramvalue?.loc || token.loc,
                TokenType.String,
                paramvalue?.type
            );
            nextParams[paramname.value.toString()] =
                paramvalue.value.toString();
        } else if (
            token.type === TokenType.Word &&
            (token.value === 'namespace' || token.value === 'impl')
        ) {
            nestings++;
            const name = tokens[++ip];
            expectedTT(name?.loc || token.loc, TokenType.Word, name?.type);
            if (!nameIsValid(name.value.toString()))
                compilerError([name.loc, token.loc], 'This name is not valid');

            const traits: string[] = [];

            while (true) {
                const tok = tokens[++ip];

                if (!tok) break;
                else if (tok.type !== TokenType.Word)
                    compilerError(
                        [tok.loc, token.loc],
                        'Expected Word, but found ' + humanTokenType(tok.type)
                    );
                else if (tok.value === 'in') break;
                else traits.push(tok.value);
            }

            doesntmatchTT(
                tokens[ip]?.loc || tokens[ip - 1]?.loc || token.loc,
                TokenType.Word,
                tokens[ip]?.type,
                'in',
                tokens[ip]?.value
            );

            const oldip = ip;

            let $nestings = 0;
            while (ip < tokens.length) {
                const tok = tokens[++ip];
                if (!tok) break;
                else if (
                    tok.type === TokenType.Word &&
                    isBlockKeyword(tok.value)
                )
                    $nestings++;
                else if (tok.type === TokenType.Word && tok.value === 'end')
                    $nestings--;
                if ($nestings < 0) break;
            }
            const end = tokens[ip];
            doesntmatchTT(
                end?.loc || tokens[ip - 1]?.loc || token.loc,
                TokenType.Word,
                end?.type,
                'end',
                end?.value
            );
            end.type = TokenType.Control;
            (end as ControlToken).args = {
                type: 'reset_namespace',
            };

            currentNamespace = name.value.toString() + '::';

            ip = oldip;
        } else {
            const name = token.value;
            const namespacedName =
                token.value.startsWith(':') && !token.value.startsWith('::')
                    ? currentNamespace + token.value.substring(1)
                    : token.value;

            if (
                IntrinsicNames[name as keyof typeof IntrinsicNames] ===
                    undefined &&
                KeywordNames[name as keyof typeof KeywordNames] === undefined &&
                program.mems[namespacedName] === undefined &&
                functions[namespacedName] === undefined &&
                constants[namespacedName] === undefined &&
                macros[namespacedName] === undefined &&
                token.type === TokenType.Word
            ) {
                compilerError(
                    [token.loc],
                    'Word "' +
                        token.value +
                        '" is not an Intrinsic, Keyword, function or memory name'
                );
            } else if (
                IntrinsicNames[name as keyof typeof IntrinsicNames] !==
                undefined
            )
                program.ops.push({
                    location: token.loc,
                    token,
                    operation:
                        IntrinsicNames[name as keyof typeof IntrinsicNames],
                    type: OpType.Intrinsic,
                    ip: program.ops.length,
                });
            else if (
                KeywordNames[name as keyof typeof KeywordNames] !== undefined
            ) {
                if (name === 'end' && nestings < 1) isInFunction = false;
                else if (name === 'end') nestings--;
                else if (isBlockKeyword(name)) nestings++;
                program.ops.push({
                    location: token.loc,
                    token,
                    operation: KeywordNames[name as keyof typeof KeywordNames],
                    type: OpType.Keyword,
                    ip: program.ops.length,
                });
            } else if (program.mems[namespacedName] !== undefined)
                program.ops.push({
                    location: token.loc,
                    token,
                    type: OpType.PushMem,
                    operation: namespacedName,
                    ip: program.ops.length,
                });
            else if (functions[namespacedName] !== undefined)
                program.ops.push({
                    location: token.loc,
                    token,
                    type: OpType.Call,
                    operation: functions[namespacedName],
                    functionName: token.value,
                    ip: program.ops.length,
                });
            else if (constants[namespacedName] !== undefined)
                program.ops.push({
                    _type: constants[namespacedName].type,
                    operation: constants[namespacedName].value,
                    location: token.loc,
                    token,
                    type: OpType.Const,
                    ip: program.ops.length,
                });
            else if (macros[namespacedName] !== undefined) {
                program.ops.push({
                    type: OpType.Comment,
                    operation: ' InlineCall (' + name + ')',
                    location: token.loc,
                    token,
                    ip: program.ops.length,
                });
                tokens = [
                    ...macros[namespacedName],
                    {
                        type: TokenType.Comment,
                        loc: token.loc,
                        value: ' InlineCallEnd (' + token.value + ')',
                    },
                    ...tokens.slice(ip + 1),
                ];
                ip = -1;
                // comments and None got handled previously already
            } else if (token.type !== TokenType.Comment) {
                console.log(token);
                compilerError([token.loc], 'Unknown error');
            }
        }
        ip++;
    }

    end();
    return program;
}
