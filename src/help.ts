/*
─│
«»
┌┬┐
├┼┤
└┴┘


┌──« Undefied CLI »─────────────────────┬────────────────────────────────────┐
│ undefied <option>                     │                                    │
│           -> -h --help                │ Get Help                           │
│           -> -v --version             │ Get the Current Version            │
│           -> -p --profiling           │ Enable profiling                   │
├───────────────────────────────────────┼────────────────────────────────────┤
│ undefied compile|com <file> [options] │ Compile your Program               │
│           -> -r --run                 │ Run the Program after Compilation  │
│           -> -u --unsafe              │ Disable Typechecking               │
│           -> -O0                      │ Disable Optimizations              │
│           -> -O1                      │ Level 1 Optimizations              │
│           -> --keep                   │ Keep the assembly files            │
│           -> -t --target <target>     │ Select the target                  |
|           -> -d --dev                 │ Enable devmode                     │
├───────────────────────────────────────┼────────────────────────────────────┤
│ undefied typecheck|check <file>       │ Typecheck your Program             │
├───────────────────────────────────────┼────────────────────────────────────┤
│ undefied config [configfile]          │ Run your undefiedconfig            │
├───────────────────────────────────────┼────────────────────────────────────┤
│ undefied check-std|typecheck-std      │ Typecheck the Standard Library     │ 
└──« Version vxx.x.x  »─────────────────┴────────────────────────────────────┘


*/

import chalk from 'chalk';
import { targetList } from './targets';

export default function helpMenu(version: string) {
    return (
        `┌──« ${chalk.bold(
            chalk.cyan('Undefied') + ' CLI'
        )} »─────────────────────┬────────────────────────────────────┐\n` +
        `│ ${chalk.cyan('undefied')} ${chalk.gray(
            '<option>'
        )}                     │                                    │\n` +
        `│           -> ${chalk.blue(
            '-h --help'
        )}                │ ${chalk.underline(
            'Get Help'
        )}                           │\n` +
        `│           -> ${chalk.blue(
            '-v --version'
        )}             │ ${chalk.underline(
            'Get the Current Version'
        )}            │\n` +
        `│           -> ${chalk.blue(
            '-p --profiling'
        )}           │ Enable profiling                   │\n` +
        `├───────────────────────────────────────┼────────────────────────────────────┤\n` +
        `│ ${chalk.cyan('undefied')} ${chalk.greenBright(
            'compile|com'
        )} ${chalk.gray('<file> [options]')} │ ${chalk.underline(
            'Compile your Program'
        )}               │\n` +
        `│           -> ${chalk.blue(
            '-r --run'
        )}                 │ ${chalk.underline(
            'Run the Program after Compilation'
        )}  │\n` +
        `│           -> ${chalk.blue(
            '-u --unsafe'
        )}              │ ${chalk.underline(
            'Disable Typechecking'
        )}               │\n` +
        `│           -> ${chalk.blue(
            '-O0'
        )}                      │ ${chalk.underline(
            'Disable Optimizations'
        )}              │\n` +
        `│           -> ${chalk.blue(
            '-O1'
        )}                      │ ${chalk.underline(
            'Level 1 Optimizations'
        )}              │\n` +
        `│           -> ${chalk.blue(
            '--keep'
        )}                   │ ${chalk.underline(
            'Keep the assembly files'
        )}            │\n` +
        `│           -> ${chalk.blue('-t --target')} ${chalk.gray(
            '<target>'
        )}     │ ${chalk.underline('Select the target')}                  |\n` +
        `│           -> ${chalk.blue(
            '-d --dev'
        )}                 │ Enable devmode                     │\n` +
        `├───────────────────────────────────────┼────────────────────────────────────┤\n` +
        `│ ${chalk.cyan('undefied')} ${chalk.greenBright(
            'typecheck|check'
        )} ${chalk.gray(
            '<file>'
        )}       │ Typecheck your Program             │\n` +
        `├───────────────────────────────────────┼────────────────────────────────────┤\n` +
        `│ ${chalk.cyan('undefied')} ${chalk.greenBright(
            'check-std|typecheck-std'
        )}      │ Typecheck the Standard Library     │\n` +
        `├───────────────────────────────────────┼────────────────────────────────────┤\n` +
        `│ ${chalk.cyan('undefied')} ${chalk.greenBright(
            'config'
        )} ${chalk.gray(
            '[configfile]'
        )}          │ Run your undefiedconfig            │\n` +
        `└──« Version v${version}  »${
            version.length === 5 ? '─' : ''
        }─────────────────┴────────────────────────────────────┘\n\n` +
        '<option>: Options is required\n' +
        '[option]: Option is optional\n\n' +
        chalk.bold(chalk.red('Available Targets')) +
        '\n' +
        targetList.join('\n') +
        '\n\n' +
        chalk.bold('Profiler: https://github.com/FishingHacks/simple-profiler')
    ).split('\n').map(el => '   ' + el).join('\n');
}
