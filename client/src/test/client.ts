import { Client } from '@thebcms/client/main';

export const client = new Client(
    'http://localhost:8081',
    '620528baca65b6578d29868d',
    '620532ae4c704d5f29a22dfd',
    {
        id: '6645ea865de3c39b7aabf568',
        secret: '68a96f495727d64d4488f39957eaa82bf706106a6f08a17ab8a8e9b151547d1b',
    },
    {
        injectSvg: true,
    }
);
