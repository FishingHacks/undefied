import chalk from 'chalk';
import { join } from 'path';
import compileFile from './completeCompiler';
import UndefiedConfig from './config';
import { info, success } from './errors';
import { timer } from './timer';
import {
    CanError,
    canErrorError,
    canErrorValue,
    isArray,
    isObj,
    isUndefined,
    makeError,
} from './typingutils';
import { isFile } from './utils';

export function resolveConfigPath(path?: string): string {
    path ||= 'undefiedconfig.js';
    if (!path.startsWith('/')) path = join(process.cwd(), path);
    return path;
}

export async function readConfig(
    path?: string
): Promise<CanError<UndefiedConfig>> {
    const end = timer.start('readConfig()');
    try {
        path = resolveConfigPath(path);
        if (isUndefined(path)) {
            end();
            return canErrorError(
                new TypeError('path is not string. This should never happen :3')
            );
        }

        if (!(await isFile(path))) {
            end();
            return canErrorError(
                new Error('The UndefiedConfig file could not be found')
            );
        }

        try {
            const json = require(path);
            if (!isObj(json)) {
                end();
                return canErrorError(
                    new Error('The UndefiedConfig file could not be parsed')
                );
            }
            if (!(json as any).files || !isArray((json as any).files)) {
                end();
                return canErrorError(
                    new Error('The UndefiedConfig file is not valid.')
                );
            }
            end();
            return canErrorValue(json as UndefiedConfig);
        } catch {
            end();
            return canErrorError(
                new Error('The UndefiedConfig file could not be parsed')
            );
        }
    } catch (e) {
        end();
        return canErrorError(makeError(e));
    }
}

export async function executeConfig(cfg: UndefiedConfig, dir: string) {
    const end = timer.start('executeConfig()');

    for (const f of cfg.files) {
        const fullPath = join(dir, f);
        info(' + Compiling ' + f);
        cfg.globalPredefConsts ||= {};
        if (cfg.devMode) {
            const consts = Object.entries(cfg.globalPredefConsts);
            console.log('  └ ' + chalk.bold('Config'));
            console.log(
                '    ├ Optimizations: ' +
                    chalk.magenta(fillin(cfg.optimizations?.toString(), '0'))
            );
            console.log(
                '    ├ Typechecking: ' +
                    chalk.blueBright(cfg.disableTypechecking ? 'false' : 'true')
            );
            console.log(
                '    ├ Devmode: ' +
                    chalk.blueBright(fillin(cfg.devMode, false).toString())
            );
            console.log(
                '    ├ Target: ' + chalk.green(fillin(cfg.target, 'linux'))
            );
            console.log(
                '    ├ Keep .asm and .o Files: ' +
                    chalk.blueBright((cfg.keep || false).toString())
            );
            console.log(
                '    ├ Included Assembly Files: ' +
                    fillin(cfg.include, [])
                        .map((el) => chalk.greenBright(el))
                        .join(', ')
            );
            console.log(
                '    ├ Default Included Libs: ' +
                    fillin(cfg.libs, [])
                        .map((el) => chalk.greenBright(el))
                        .join(', ')
            );
            console.log(
                '    ├ Run Marked Functions: ' +
                    chalk.blueBright(cfg.dontRunFunctions ? 'false' : 'true')
            );
            console.log('    └ ' + chalk.bold('Constants'));
            if (consts.length < 1)
                console.log(chalk.gray(chalk.italic('      none')));
            else {
                for (const i in consts) {
                    if (Number(i) === consts.length - 1)
                        console.log(
                            '      └ ' +
                                consts[i][0] +
                                ': ' +
                                chalk.blueBright(consts[i][1])
                        );
                    else
                        console.log(
                            '      ├ ' +
                                consts[i][0] +
                                ': ' +
                                chalk.blueBright(consts[i][1])
                        );
                }
            }
        }
        await compileFile(
            fullPath,
            {
                optimizations: fillin(cfg.optimizations, '0').toString() as '0',
                dev: cfg.devMode,
                dontRunFunctions: cfg.dontRunFunctions,
                external: cfg.include,
                keepFiles: cfg.keep,
                libs: cfg.libs,
                predefConsts: cfg.globalPredefConsts,
                run: false,
                target: cfg.target,
                unsafe: cfg.disableTypechecking,
            },
            false,
            []
        );
    }
    console.log(' ');
    success('Finished Compilation');
    end();
}

function fillin<T>(value: T | undefined, fallback: T): T {
    if (value === undefined) return fallback;
    return value;
}
