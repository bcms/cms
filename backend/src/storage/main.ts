import * as fileSystem from 'fs';
import * as systemPath from 'path';
import { Logger } from '@thebcms/selfhosted-backend/server';
import { Config } from '@thebcms/selfhosted-backend/config';
import { FS } from '@thebcms/selfhosted-backend/_utils/fs';

export const StorageTypes = {
    'user-avatar': 'user-avatar',
};

export type StorageType = keyof typeof StorageTypes;

export interface StorageFileMetadata {
    mimetype: string;
    size: number;
    name: string;
}

export class Storage {
    static logger = new Logger('Storage');
    static fs = new FS(systemPath.join(process.cwd(), 'uploads'));

    private static async readFileMetadata(
        filename: string,
        type: StorageType,
    ): Promise<StorageFileMetadata> {
        if (
            !(await this.fs.exist(
                [Config.storageScope, type, filename + '.meta.json'],
                true,
            ))
        ) {
            throw Error(
                `Failed to find metadata for:[${
                    Config.storageScope
                }, ${type}, ${filename + '.meta.json'}]`,
            );
        }
        return JSON.parse(
            await this.fs.readString([
                Config.storageScope,
                type,
                filename + '.meta.json',
            ]),
        );
    }

    private static async writeFileMetadata(
        filename: string,
        type: StorageType,
        data: StorageFileMetadata,
    ) {
        await this.fs.save(
            [Config.storageScope, type, filename + '.meta.json'],
            JSON.stringify(data),
        );
    }

    static async read(filename: string, type: StorageType) {
        const meta = await this.readFileMetadata(filename, type);
        const data = await this.fs.read([Config.storageScope, type, filename]);
        return {
            data,
            mimetype: meta.mimetype,
            name: meta.name,
        };
    }

    static async readStream(filename: string, type: StorageType) {
        const meta = await this.readFileMetadata(filename, type);
        const stream = fileSystem.createReadStream(
            systemPath.join(
                process.cwd(),
                'uploads',
                Config.storageScope,
                type,
                filename,
            ),
        );
        return {
            mimetype: meta.mimetype,
            name: meta.name,
            stream,
        };
    }

    static async remove(filename: string, type: StorageType) {
        await this.readFileMetadata(filename, type);
        await this.fs.deleteFile([
            Config.storageScope,
            type,
            filename + '.meta.json',
        ]);
        await this.fs.deleteFile([Config.storageScope, type, filename]);
    }

    static async save(
        filename: string,
        type: StorageType,
        mimetype: string,
        data: Buffer,
    ): Promise<{
        uri: string;
    }> {
        await this.writeFileMetadata(filename, type, {
            name: filename,
            mimetype,
            size: data.length,
        });
        await this.fs.save([Config.storageScope, type, filename], data);
        return {
            uri: `/api/v4/storage/${
                Config.storageScope
            }/get/${type}/${filename}?v=${Date.now()}`,
        };
    }
}
