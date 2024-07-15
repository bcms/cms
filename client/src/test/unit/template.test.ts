import { client } from '@thebcms/client/test/client';
// import { createFS } from '@banez/fs';

// const fs = createFS({
//     base: process.cwd(),
// });

describe('Template', () => {
    it('should get all templates', async () => {
        const templates = await client.template.getAll();
        expect(templates).toBeInstanceOf(Array);
    });
});
