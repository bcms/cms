import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@thebcms/selfhosted-cli': fileURLToPath(new URL('./src', import.meta.url)),
            '@thebcms/selfhosted-backend': fileURLToPath(new URL('../backend/src', import.meta.url)),
            '@thebcms/selfhosted-utils': fileURLToPath(new URL('../backend/src/_utils', import.meta.url)),
        },
    },
});