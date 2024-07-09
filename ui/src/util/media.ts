import { Buffer } from 'buffer';
import { createQueue, QueueResult } from '@thebcms/selfhosted-utils/queue';
import type {
    Media,
    MediaType,
} from '@thebcms/selfhosted-backend/media/models/main';
import type { MediaGetBinBody } from '@thebcms/selfhosted-backend/media/models/controller';

const loadQueue = createQueue<string>();
const typesWithImage: Array<keyof typeof MediaType> = ['IMG', 'GIF', 'VID'];

export async function mediaGetPreviewUrl(
    media: Media,
    options?: MediaGetBinBody,
): Promise<string> {
    if (typesWithImage.includes(media.type)) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const result = await loadQueue({
            name: 'load',
            handler: async () => {
                let src = '/icons/file-04.svg';
                await throwable(
                    async () => {
                        return sdk.media.bin({
                            media,
                            data: options ? options : {},
                        });
                    },
                    async (buffer) => {
                        src = `data:${media.mimetype};base64,${Buffer.from(
                            buffer,
                        ).toString('base64')}`;
                    },
                );
                return src;
            },
        }).wait;
        return (result as QueueResult<string>).data;
    } else {
        return '/icons/file-04.svg';
    }
}
