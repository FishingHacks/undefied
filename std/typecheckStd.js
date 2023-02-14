const chalk = require('chalk');
const { spawnSync } = require('child_process');
const { readdirSync } = require('fs');
const { join } = require('path');

function tree(folder) {
    const files = [];
    const folders = [folder];

    while (folders.length > 0) {
        const dir = folders.pop();
        for (const f of readdirSync(dir, { withFileTypes: true })) {
            if (f.isFile()) files.push(join(dir, f.name));
            else if (f.isDirectory()) folders.push(join(dir, f.name));
        }
    }

    return files;
}

let errors = 0;
for (const f of tree(__dirname).filter((f) => f.endsWith('.undefied'))) {
    const proc = spawnSync(
        'node "' +
            join(__dirname, '../bin/main.js').replaceAll('"', '\\"') +
            '" check "' +
            f.replaceAll('"', '\\"') +
            '"',
        { shell: true }
    );
    if (proc.stderr?.length > 0) errors++;
    if (proc.stderr?.length > 0)
        console.log(
            chalk.redBright('Error: ' + f + ' did not typecheck properly!\n') +
                chalk.underline('STDERR:\n') +
                proc.stderr.toString() +
                chalk.underline('\nSTDOUT:\n') +
                proc.stdout.toString()
        );
}
if (errors < 1) console.log(chalk.greenBright('No errors in the standard library found!'));