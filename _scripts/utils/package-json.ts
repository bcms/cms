import { FSFileTreeItem } from '@thebcms/selfhosted-utils/fs';

export function packageJsonExport(files: FSFileTreeItem[], packageJson: any) {
    for (let i = 0; i < files.length; i++) {
        const fileInfo = files[i];
        if (
            fileInfo.path.rel !== 'index.cjs' &&
            fileInfo.path.rel !== 'index.mjs' &&
            (fileInfo.path.rel.endsWith('.cjs') ||
                fileInfo.path.rel.endsWith('.mjs'))
        ) {
            const exportName =
                './' +
                fileInfo.path.rel
                    .replace('/index.cjs', '')
                    .replace('/index.mjs', '')
                    .replace('.mjs', '')
                    .replace('.cjs', '');
            if (!packageJson.exports[exportName]) {
                packageJson.exports[exportName] = {};
            }
            if (fileInfo.path.rel.endsWith('.mjs')) {
                packageJson.exports[exportName].import =
                    './' + fileInfo.path.rel;
            }
            if (fileInfo.path.rel.endsWith('.cjs')) {
                packageJson.exports[exportName].require =
                    './' + fileInfo.path.rel;
            }
        }
    }
}
