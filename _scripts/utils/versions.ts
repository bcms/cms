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

export async function getClientVersion(): Promise<[string, string]> {
    const fs = new FS(process.cwd());
    const packageJson = JSON.parse(
        await fs.readString(['client', 'package.json']),
    );
    return [packageJson.name, packageJson.version];
}

export async function getUiVersion(): Promise<[string, string]> {
    const fs = new FS(process.cwd());
    const packageJson = JSON.parse(await fs.readString(['ui', 'package.json']));
    return [packageJson.name, packageJson.version];
}

export async function getSdkVersion(): Promise<[string, string]> {
    const fs = new FS(process.cwd());
    const packageJson = JSON.parse(
        await fs.readString(['ui', 'sdk.package.json']),
    );
    return [packageJson.name, packageJson.version];
}
