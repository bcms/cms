import { client } from '@thebcms/client/test/client';

describe('Media', () => {
    it('should get all media', async () => {
        const allMedia = await client.media.getAll();
        expect(allMedia).toBeDefined();
        expect(allMedia.length).toBeGreaterThan(0);
    });
});
