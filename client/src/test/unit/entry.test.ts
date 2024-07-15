import { client } from '@thebcms/client/test/client';

describe('Entry', () => {
    it('should get entries', async () => {
        const entries = await client.entry.getAll('feature')
        console.log(entries[0])
    })
})