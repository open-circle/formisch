import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [angular(), tailwindcss()],
  optimizeDeps: {
    // The linked @formisch/angular package ships partial Ivy declarations
    // that must run through the Angular linker. Vite skips linked packages
    // during dependency optimization by default, so include it explicitly —
    // the Angular plugin applies the linker in the optimizer. Restart the dev
    // server after rebuilding the package to pick up a fresh dist.
    include: ['@formisch/angular'],
  },
});
