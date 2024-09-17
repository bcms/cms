import {
    type Media,
    MediaSchema,
} from '@bcms/selfhosted-backend/media/models/main';
import { createMongoDBRepository } from '@bcms/selfhosted-backend/_server/modules/mongodb';
import { Config } from '@bcms/selfhosted-backend/config';

export interface MediaRepoMethods {
    findByParentIdAndName(
        parentId: string,
        name: string,
    ): Promise<Media | null>;
    findInRootByName(name: string): Promise<Media | null>;
    deleteManyById(ids: string[]): Promise<void>;
}

export const MediaRepo = createMongoDBRepository<Media, MediaRepoMethods>({
    name: 'Media',
    collection: `${Config.dbPrefix}_medias`,
    schema: MediaSchema,
    methods({ mdb, cache }) {
        return {
            async findByParentIdAndName(parentId: string, name: string) {
                const cacheHit = cache.find(
                    (e) => e.parentId === parentId && e.name === name,
                );
                if (cacheHit) {
                    return cacheHit;
                }
                const result = await mdb.findOne({
                    parentId,
                    name,
                });
                if (result) {
                    cache.set(result);
                }
                return result;
            },

            async findInRootByName(name: string) {
                const cacheHit = cache.find(
                    (e) => e.isInRoot && e.name === name,
                );
                if (cacheHit) {
                    return cacheHit;
                }
                const result = await mdb.findOne({
                    isInRoot: true,
                    name,
                });
                if (result) {
                    cache.set(result);
                }
                return result;
            },

            async deleteManyById(ids) {
                await mdb.deleteMany({
                    _id: { $in: ids },
                });
                cache.remove(ids);
            },
        };
    },
});
