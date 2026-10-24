import solid from '@solidjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) },
    // `@formisch/solid` also depends on Solid 1, so make sure the whole app
    // uses the single Solid 2 copy of this playground
    dedupe: ['solid-js', '@solidjs/web'],
  },
});
