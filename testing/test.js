const { spawn } = require('child_process');
const { readdirSync, rm } = require('fs');
const { readFile } = require('fs/promises');
const { join } = require('path');

function runCommand(command) {
    return new Promise((res) => {
        let out = '';

        const proc = spawn(command, { shell: true });
        proc.stdout.on('data', (data) => (out += data.toString()));
        proc.stderr.on('data', (data) => (out += data.toString()));
        proc.on('exit', (code) => res([code, out]));
    });
}

function scheduleDeletion(filename) {
    rm(filename, (err) => {});
    rm(filename + '.o', (err) => {});
    rm(filename + '.asm', (err) => {});
}

async function testFile(file) {
    console.log('Testing', file);
    const [comcode, comout] = await runCommand(
        'node "' +
            join(__dirname, '../bin/main.js').replaceAll('"', '\\"') +
            '" compile "' +
            file.replaceAll('"', '\\"') +
            '"'
    );
    if (comcode !== 0) {
        console.error('Compiling failed for', file);
        console.error(comout);
        return false;
    }
    const [code, output] = await runCommand(
        '"' + file.substring(0, file.length - 9).replaceAll('"', '\\"') + '"'
    );
    scheduleDeletion(file.substring(0, file.length - 9));
    console.log('Successfully tested', file, '\nOutput:\n' + output);
    if (code !== 0) return false;
    try {
        return (
            (await readFile(file.substring(0, file.length - 9) + '.output.txt'))
                .toString('utf-8')
                .trim() === output.trim()
        );
    } catch {
        return true;
    }
}

async function test() {
    const tests = await Promise.all(
        readdirSync(__dirname, { withFileTypes: true })
            .filter((el) => el.isFile() && el.name.endsWith('.undefied'))
            .map((el) => join(__dirname, el.name))
            .map(testFile)
    );

    console.log('Ran ' + tests.length + ' out of ' + tests.length + ' tests!');
    console.log('Failed: ' + tests.filter((el) => !el).length);
    console.log('Succeeded: ' + tests.filter((el) => el).length);
}
module.exports = test;
test();
