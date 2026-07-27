import angular from '@analogjs/vite-plugin-angular';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  // Angular's JIT compiler cannot discover signal inputs declared with
  // `input()`, so the directives must be compiled ahead of time to be usable
  // in a test. This plugin runs the Angular compiler over the sources, which
  // lets the tests import from `src` and keeps coverage attributed to `src`.
  // It needs a tsconfig that emits, hence `tsconfig.spec.json` rather than the
  // `noEmit` base config — with a non-emitting one it silently builds an empty
  // program and every directive falls back to (broken) JIT compilation.
  plugins: [angular({ tsconfig: './tsconfig.spec.json' })],
  resolve: {
    // The inlined @formisch/core workspace package must not resolve its own
    // copy of @angular/core (pnpm installs core's older dev dependency next
    // to it). Two copies create two separate signal graphs, which silently
    // breaks dependency tracking between core signals and package computeds.
    dedupe: ['@angular/core'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/vitest/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['src/**/*.test-d.ts', ...configDefaults.exclude],
    typecheck: {
      include: ['src/**/*.{test,spec}-d.{ts,tsx}'],
    },
    coverage: {
      include: ['src'],
      exclude: [
        'src/types',
        'src/vitest',
        '**/index.ts',
        '**/*.test.ts',
        '**/*.test-d.ts',
      ],
    },
  },
});
