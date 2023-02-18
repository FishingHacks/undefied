import * as target_linux_macro from './compilers/linux-macro';
import * as target_linux from './compilers/linux';
import * as target_js from './compilers/javascript';
import { Compiler } from './types';

export const targetList = ['linux', 'linux-macro', 'javascript'] as const;
type Target = typeof targetList[number];
export const targets: Record<Target, Compiler> = {
    linux: target_linux,
    'linux-macro': target_linux_macro,
    javascript: target_js,
};

export function getCompiler(target: string): Compiler | undefined {
    return targets[target as Target];
}

export function targetId(target: string): number {
    const id = targetList.indexOf(target as Target);
    return id < 0 ? 0 : id;
}
