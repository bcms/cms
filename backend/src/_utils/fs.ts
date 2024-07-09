import * as os from 'os';
import * as path from 'path';
import * as fsp from 'fs/promises';
import * as fse from 'fs-extra';
import * as fs from 'fs';

export interface FSFileTreeItem {
    path: {
        abs: string;
        rel: string;
    };
    dir: string;
}

export type FSFileTreeList = FSFileTreeItem[];

export class FS {
    private isWin: boolean;
    private slash: string;

    constructor(public baseRoot: string) {
        this.isWin = os.platform() === 'win32';
        this.slash = this.isWin ? '\\' : '/';
    }

    private arrayPathToString(root: string | string[]): string {
        return root instanceof Array ? path.join(...root) : root;
    }

    async exist(root_: string | string[], isFile?: boolean): Promise<boolean> {
        const root = this.arrayPathToString(root_);
        return new Promise<boolean>((resolve, reject) => {
            const pth =
                root.startsWith('/') || root.charAt(1) === ':'
                    ? root
                    : path.join(this.baseRoot, root);
            fs.stat(pth, (err, stats) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        resolve(false);
                        return;
                    } else {
                        reject(err);
                    }
                    return;
                }
                if (isFile) {
                    resolve(stats.isFile());
                } else {
                    resolve(stats.isDirectory());
                }
            });
        });
    }

    async save(root_: string | string[], data: string | Buffer): Promise<void> {
        const root = this.arrayPathToString(root_);
        let parts = root.split(this.slash).filter((e) => !!e);
        let isAbs = false;
        let base = '';
        if (this.isWin) {
            if (root.charAt(1) === ':') {
                isAbs = true;
                base = parts[0];
                parts.splice(0, 1);
            }
        } else if (root.startsWith('/')) {
            isAbs = true;
        }
        if (!isAbs) {
            parts = [...this.baseRoot.split(this.slash), ...parts];
        }
        if (!this.isWin) {
            base = '/';
        } else if (this.isWin && !isAbs) {
            base = parts[0];
            parts.splice(0, 1);
        }
        for (let j = 0; j < parts.length - 1; j++) {
            base = path.join(base, parts[j]);
            try {
                if (!(await this.exist(base))) {
                    await fsp.mkdir(base);
                }
            } catch (error) {
                // Do nothing.
            }
        }
        await fsp.writeFile(path.join(base, parts[parts.length - 1]), data);
    }

    async mkdir(root_: string | string[]): Promise<void> {
        const root = this.arrayPathToString(root_);
        if (root.startsWith('/') || root.charAt(1) === ':') {
            return await fse.mkdirp(root);
        }
        return await fse.mkdirp(path.join(this.baseRoot, root));
    }

    async read(root_: string | string[]): Promise<Buffer> {
        const root = this.arrayPathToString(root_);
        if (root.startsWith('/') || root.charAt(1) === ':') {
            return await fsp.readFile(root);
        }
        return await fsp.readFile(path.join(this.baseRoot, root));
    }

    async readString(root_: string | string[]): Promise<string> {
        const root = this.arrayPathToString(root_);
        if (root.startsWith('/') || root.charAt(1) === ':') {
            return (await fsp.readFile(root)).toString();
        }
        return (await fsp.readFile(path.join(this.baseRoot, root))).toString();
    }

    async readdir(root_: string | string[]): Promise<string[]> {
        const root = this.arrayPathToString(root_);
        if (root.startsWith('/') || root.charAt(1) === ':') {
            return await fsp.readdir(root);
        }
        return await fsp.readdir(path.join(this.baseRoot, root));
    }

    async deleteFile(root_: string | string[]): Promise<void> {
        const root = this.arrayPathToString(root_);
        if (root.startsWith('/') || root.charAt(1) === ':') {
            return await fsp.unlink(root);
        }
        await fsp.unlink(path.join(this.baseRoot, root));
    }

    async deleteDir(root_: string | string[]): Promise<void> {
        const root = this.arrayPathToString(root_);
        if (root.startsWith('/') || root.charAt(1) === ':') {
            await fse.remove(root);
        }
        await fse.remove(path.join(this.baseRoot, root));
    }

    async rename(
        root_: string | string[],
        currName: string,
        newName: string,
    ): Promise<void> {
        const root = this.arrayPathToString(root_);
        await this.move(
            root.startsWith('/') || root.charAt(1) === ':'
                ? path.join(root, currName)
                : path.join(this.baseRoot, root, currName),
            root.startsWith('/') || root.charAt(1) === ':'
                ? path.join(root, newName)
                : path.join(this.baseRoot, root, newName),
        );
    }

    async fileTree(
        startingLocation_: string | string[],
        currentLocation_: string | string[],
    ): Promise<FSFileTreeList> {
        const startingLocation = this.arrayPathToString(startingLocation_);
        const currentLocation = this.arrayPathToString(currentLocation_);
        const output: FSFileTreeList = [];
        const basePath =
            startingLocation.startsWith('/') ||
            startingLocation.charAt(1) === ':'
                ? path.join(startingLocation, currentLocation)
                : path.join(this.baseRoot, startingLocation, currentLocation);
        const files = await fsp.readdir(basePath);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = path.join(basePath, file);
            const stat = await fsp.lstat(filePath);
            if (stat.isDirectory()) {
                const children = await this.fileTree(
                    startingLocation,
                    path.join(currentLocation, file),
                );
                for (let j = 0; j < children.length; j++) {
                    const child = children[j];
                    output.push(child);
                }
            } else {
                output.push({
                    path: {
                        abs: filePath,
                        rel: path.join(
                            currentLocation,
                            filePath.replace(basePath, '').substring(1),
                        ),
                    },
                    dir: currentLocation,
                });
            }
        }
        return output;
    }

    async copy(
        srcPath_: string | string[],
        destPath_: string | string[],
    ): Promise<void> {
        const srcPath = this.arrayPathToString(srcPath_);
        const destPath = this.arrayPathToString(destPath_);
        await fse.copy(
            srcPath.startsWith('/') || srcPath.charAt(1) === ':'
                ? srcPath
                : path.join(this.baseRoot, srcPath),
            destPath.startsWith('/') || destPath.charAt(1) === ':'
                ? destPath
                : path.join(this.baseRoot, destPath),
        );
    }

    async move(
        srcPath_: string | string[],
        destPath_: string | string[],
    ): Promise<void> {
        const srcPath = this.arrayPathToString(srcPath_);
        const destPath = this.arrayPathToString(destPath_);
        await fse.move(
            srcPath.startsWith('/') || srcPath.charAt(1) === ':'
                ? srcPath
                : path.join(this.baseRoot, srcPath),
            destPath.startsWith('/') || destPath.charAt(1) === ':'
                ? destPath
                : path.join(this.baseRoot, destPath),
        );
    }
}

export interface FSConfig {
    base?: string | string[];
}
