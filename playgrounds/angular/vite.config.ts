import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [angular(), tailwindcss()],
});
