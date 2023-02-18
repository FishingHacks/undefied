import chalk from 'chalk';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface functionDescriptor {
    name: string;
    location: string;
}

class Timer {
    private _values: {
        start: number;
        end: number;
        name: string;
        calledBy: functionDescriptor;
    }[] = [];

    start(name: string): () => void {
        const obj = {
            start: Date.now(),
            end: -1,
            name,
            calledBy: getFunctionDescription(),
        };
        this._values.push(obj);
        function end() {
            if (obj.end !== -1) throw new Error(name + ' was already ended');
            obj.end = Date.now();
        }

        return end;
    }

    print() {
        console.log('Profiler');

        const _newValues: Record<
            string,
            {
                start: number;
                end: number;
                length: number;
                name: string;
                calledBy: functionDescriptor;
                id: number;
            }[]
        > = {};

        let i = 0;

        function addProfiling(
            name: string,
            start: number,
            end: number,
            calledBy: functionDescriptor
        ) {
            if (_newValues[name] === undefined) _newValues[name] = [];
            _newValues[name].push({
                end,
                start,
                length: end === -1 ? -1 : end - start,
                name,
                calledBy,
                id: ++i,
            });
        }

        for (const { name, start, end, calledBy } of this._values) {
            if (end === -1) console.log(chalk.bold(name) + ': not ended yet');
            else
                console.log(
                    chalk.bold(name) +
                        ': ' +
                        formatTimelength(end - start) +
                        ' (Start: ' +
                        new Date(start).toLocaleTimeString() +
                        ' | End: ' +
                        new Date(end).toLocaleTimeString() +
                        ' | Called By: ' +
                        calledBy.name +
                        ' in ' +
                        getFilename(calledBy.location) +
                        ')'
                );
            addProfiling(name, start, end, calledBy);
        }

        writeFileSync(
            join(
                process.cwd(),
                'profiling-undefiedcompiler-' + makeDate() + '.json'
            ),
            JSON.stringify(_newValues)
        );
    }
}

class FakeTimer extends Timer {
    start(name: string): () => void {
        return () => {};
    }
    print(): void {}
}

// switch the comments to disable profiling
// export const timer = new FakeTimer();
export const timer = new Timer();

function formatTimelength(length: number) {
    if (length < 2000) return length + 'ms';
    else if (length < 120000) return (length / 1000).toFixed(3) + 's';
    else if (length < 7200000) return (length / 60000).toFixed(3) + 'm';
    else return (length / 3600000).toFixed(3) + 'hr';
}

function makeDate() {
    const date = new Date();
    return `${date.getDate()}-${
        date.getMonth() + 1
    }-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
}

function getFunctionDescription(): functionDescriptor {
    const stack = new Error().stack;
    if (!stack) return { name: 'unknown function', location: '' };
    const splitStack = stack.split('\n');
    if (splitStack.length < 5)
        return { name: 'unknown function', location: '' };
    const fn = splitStack[4].substring(7); // skip "    at "
    const fnWithLoc = fn.startsWith('async') ? fn.substring(6) : fn;
    const [name, loc] = fnWithLoc.split(' ');
    if (!name || !loc) return { name: 'unknown function', location: '' };
    return { name, location: loc.substring(1, loc.length - 1) };
}
function getFilename(path: string) {
    return path.substring(path.lastIndexOf('/') + 1);
}
