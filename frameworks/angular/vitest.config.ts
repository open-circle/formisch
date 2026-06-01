import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
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
