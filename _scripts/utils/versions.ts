import { FS } from '@bcms/selfhosted-utils/fs';

export async function getBackendVersion(): Promise<[string, string]> {
    const fs = new FS(process.cwd());
    const packageJson = JSON.parse(
        await fs.readString(['backend', 'package.json']),
    );
    return [packageJson.name, packageJson.version];
}

export async function getUtilsVersion(): Promise<[string, string]> {
    const fs = new FS(process.cwd());
    const packageJson = JSON.parse(
        await fs.readString(['backend', 'utils.package.json']),
    );
    return [packageJson.name, packageJson.version];
}
