import { computed, ref, type Ref } from 'vue';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';
import { search, type SearchSetItem } from '@thebcms/selfhosted-utils/search';

export interface UserMediaState {
    mediaData: Ref<{
        dirs: Media[];
        files: Media[];
    }>;
    mediaActiveParent: Ref<Media | undefined>;
    mediaSortDirection: Ref<1 | -1>;
    setMediaSort(dir: -1 | 1): void;
    setMediaParent(parentId?: string): void;
    searchMedia(searchTerm: string): void;
}

export interface UseMedia {
    (): UserMediaState;
}

let state: UserMediaState | null = null;

export const useMedia: UseMedia = () => {
    if (state) {
        return state;
    }
    const sdk = window.bcms.sdk;
    const throwable = window.bcms.throwable;
    throwable(async () => {
        await sdk.media.getAll();
    }).catch((err) => console.error(err));

    const sortDir = ref<1 | -1>(1);
    const activeParent = ref<Media>();
    const searchTerm = ref('');

    const data = computed(() => {
        const allMedia = sdk.store.media.items();
        let filteredMedia: Media[];
        if (searchTerm.value) {
            const basePath = activeParent.value
                ? sdk.media.resolvePath(activeParent.value, allMedia)
                : '/';
            const mediaToSearch: SearchSetItem<Media>[] = [];
            for (let i = 0; i < allMedia.length; i++) {
                const media = allMedia[i];
                const mediaPath = sdk.media.resolvePath(media, allMedia);
                if (mediaPath.startsWith(basePath)) {
                    mediaToSearch.push({
                        id: media._id,
                        obj: media,
                        data: [
                            (media.altText || '').toLowerCase(),
                            (media.caption || '').toLowerCase(),
                            media.mimetype.toLowerCase(),
                            media.name.toLowerCase(),
                        ],
                    });
                }
            }
            const result = search({
                searchTerm: searchTerm.value.toLowerCase(),
                set: mediaToSearch,
            });
            filteredMedia = result.items.map((e) => e.obj);
        } else {
            filteredMedia = allMedia;
        }
        filteredMedia.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase()
                ? sortDir.value
                : -sortDir.value,
        );
        const dirs: Media[] = [];
        const files: Media[] = [];
        for (let i = 0; i < filteredMedia.length; i++) {
            const media = filteredMedia[i];
            if (activeParent.value) {
                if (activeParent.value._id === media.parentId) {
                    if (media.type === 'DIR') {
                        dirs.push(media);
                    } else {
                        files.push(media);
                    }
                }
            } else if (media.isInRoot) {
                if (media.type === 'DIR') {
                    dirs.push(media);
                } else {
                    files.push(media);
                }
            }
        }
        return { dirs, files };
    });

    state = {
        mediaData: data,
        mediaActiveParent: activeParent,
        mediaSortDirection: sortDir,
        searchMedia(_searchTerm: string) {
            searchTerm.value = _searchTerm;
        },
        setMediaParent(parentId?: string) {
            activeParent.value = sdk.store.media
                .items()
                .find((e) => e._id === parentId);
        },
        setMediaSort(dir) {
            sortDir.value = dir;
        },
    };
    return state;
};
