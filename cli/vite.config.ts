import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@bcms/selfhosted-cli': fileURLToPath(
                new URL('./src', import.meta.url),
            ),
            '@bcms/selfhosted-backend': fileURLToPath(
                new URL('../backend/src', import.meta.url),
            ),
            '@bcms/selfhosted-utils': fileURLToPath(
                new URL('../backend/src/_utils', import.meta.url),
            ),
            '@bcms/selfhosted-client': fileURLToPath(
                new URL('../client/src', import.meta.url),
            ),
            '@bcms/selfhosted-sdk': fileURLToPath(
                new URL('../ui/src/sdk', import.meta.url),
            ),
        },
    },
});
