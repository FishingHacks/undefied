/*
─│
«»
┌┬┐
├┼┤
└┴┘


┌──« Undefied CLI »────────────────┬────────────────────────────────────┐
│ undefied <option>                │                                    │
│           -> -h --help           │ Get Help                           │
│           -> -v --version        │ Get the Current Version            │
├──────────────────────────────────┼────────────────────────────────────┤
│ undefied compile file <options>  │ Compile your Program               │
│           -> -r --run            │ Run the Program after Compilation  │
│           -> -u --unsafe         │ Disable Typechecking               │
│           -> -O0                 │ Disable Optimizations              │
│           -> -O1                 │ Level 1 Optimizations              │
├──────────────────────────────────┼────────────────────────────────────┤
│ undefied typecheck <options>     │ Typecheck your Program             │
└──« Version vxx.x.x  »────────────┴────────────────────────────────────┘
*/

import chalk from 'chalk';

export default function helpMenu(version: string) {
    return (
        `┌──« ${chalk.bold(
            chalk.cyan('Undefied') + ' CLI'
        )} »──────────────────┬────────────────────────────────────┐\n` +
        `│ ${chalk.cyan('undefied')} ${chalk.gray(
            '<option>'
        )}                  │                                    │\n` +
        `│           -> ${chalk.blue(
            '-h --help'
        )}             │ ${chalk.underline(
            'Get Help'
        )}                           │\n` +
        `│           -> ${chalk.blue(
            '-v --version'
        )}          │ Get the Current Version            │\n` +
        `├────────────────────────────────────┼────────────────────────────────────┤\n` +
        `│ ${chalk.cyan('undefied')} ${chalk.greenBright(
            'compile'
        )} ${chalk.gray('<file> <options>')}  │ ${chalk.underline(
            'Compile your Program'
        )}               │\n` +
        `│           -> ${chalk.blue(
            '-r --run'
        )}              │ ${chalk.underline(
            'Run the Program after Compilation'
        )}  │\n` +
        `│           -> ${chalk.blue(
            '-u --unsafe'
        )}           │ ${chalk.underline(
            'Disable Typechecking'
        )}               │\n` +
        `│           -> ${chalk.blue(
            '-O0'
        )}                   │ ${chalk.underline(
            'Disable Optimizations'
        )}              │\n` +
        `│           -> ${chalk.blue(
            '-O1'
        )}                   │ Level 1 Optimizations              │\n` +
        `├────────────────────────────────────┼────────────────────────────────────┤\n` +
        `│ ${chalk.cyan('undefied')} ${chalk.greenBright(
            'typecheck'
        )} ${chalk.gray(
            '<file>'
        )}          │ Typecheck your Program             │\n` +
        `├────────────────────────────────────┼────────────────────────────────────┤\n` +
        `│ ${chalk.cyan('undefied')} ${chalk.greenBright(
            'check-std'
        )}                 │ Typecheck the Standard Library     │\n` +
        `└──« Version v${version}  »${
            version.length === 5 ? '─' : ''
        }──────────────┴────────────────────────────────────┘`
    );
}
