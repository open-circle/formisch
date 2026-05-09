import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    conditions: ['browser'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/vitest/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.svelte.{js,ts}',
    ],
    typecheck: {
      include: [
        'src/**/*.{test,spec}-d.{ts,tsx}',
        'src/**/*.{test,spec}.svelte-d.ts',
      ],
    },
    coverage: {
      include: ['src'],
      exclude: [
        'src/types',
        'src/vitest',
        '**/index.ts',
        '**/*.test.ts',
        '**/*.test.svelte',
        '**/*.test.svelte.ts',
        '**/*.test-d.ts',
      ],
    },
  },
});
