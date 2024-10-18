import type { Media } from '@bcms/selfhosted-backend/media/models/main';

export function mediaPathResolver(media: Media, allMedia: Media[]): string {
    if (!media.parentId) {
        return `/${media.name}`;
    }
    const parentMedia = allMedia.find((e) => e._id === media.parentId);
    if (!parentMedia) {
        return `/${media.name}`;
    }
    return `${mediaPathResolver(parentMedia, allMedia)}/${media.name}`;
}
