import { FS } from '@thebcms/selfhosted-utils/fs';

export async function replaceStringInFile(config: {
    dirPath: string | string[];
    basePath: string;
    endsWith?: string[];
    regex: RegExp[];
}) {
    const fs = new FS(process.cwd());
    const filePaths = await fs.fileTree(config.dirPath, '');
    for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        if (
            config.endsWith &&
            !!config.endsWith.find((e) => filePath.path.abs.endsWith(e))
        ) {
            let replacer = config.basePath;
            if (filePath.dir !== '') {
                const depth = filePath.dir.split('/').length;
                replacer =
                    new Array(depth).fill('..').join('/') +
                    '' +
                    config.basePath;
            }
            const file = await fs.readString(filePath.path.abs);
            let fileFixed = file + '';
            for (let j = 0; j < config.regex.length; j++) {
                const regex = config.regex[j];
                fileFixed = fileFixed.replace(regex, replacer);
            }
            if (file !== fileFixed) {
                await fs.save(filePath.path.abs, fileFixed);
            }
        }
    }
}
