import { existsSync, lstatSync, constants } from "fs";
import { join } from "path";
import { lstat, readdir, access } from 'fs/promises';

export async function tree(folder: string): Promise<string[]> {
    const stat = await lstat(folder);
    if (stat.isFile()) return [folder];
    else if (!stat.isDirectory())
        throw new Error('The suppleid folder is not a directory');
    const folders: string[] = [folder];
    const files: string[] = [];

    while (folders.length > 0) {
        const path = folders.shift();
        if (!path) break;
        const stat = await lstat(path);
        if (stat.isFile()) files.push(path);
        else if (!stat.isDirectory())
            throw new Error(path + ' is not a folder');
        else {
            const dir = await readdir(path, { withFileTypes: true });
            for (const f of dir) {
                if (f.isFile()) files.push(join(path, f.name));
                else if (f.isDirectory()) folders.push(join(path, f.name));
            }
        }
    }
    return files;
}
export async function isFile(file: string) {
    return (await lstat(file)).isFile();
}
export async function exists(file: string, writable?: boolean) {
    try {
        await access(file, constants.R_OK | (writable ? constants.R_OK : 0));
        return true;
    } catch {}
    return false;
}
export function checkExistence(
    ...files: (string | undefined)[]
): string | undefined {
    for (const f of files) {
        if (f !== undefined && existsSync(f) && lstatSync(f).isFile()) return f;
    }
    return;
}
