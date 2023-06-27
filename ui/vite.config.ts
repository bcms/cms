import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@ui': fileURLToPath(new URL('./src', import.meta.url)),
      '@becomes/cms-backend': fileURLToPath(
        new URL('../backend/src', import.meta.url),
      ),
      '@becomes/cms-sdk': fileURLToPath(new URL('./sdk/src', import.meta.url)),
    },
  },
});
