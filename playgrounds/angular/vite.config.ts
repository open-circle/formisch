import tailwindcss from '@tailwindcss/vite';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [angular(), tailwindcss()],
  resolve: {
    alias: {
      '@formisch/angular': fileURLToPath(
        new URL('../../frameworks/angular/src/index.ts', import.meta.url)
      ),
    },
  },
});
