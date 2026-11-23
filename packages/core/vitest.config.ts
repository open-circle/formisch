import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          isolate: false,
          setupFiles: ['./src/vitest/setup.ts'],
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.prod.test.ts'],
          typecheck: { enabled: true, include: ['src/**/*.test-d.ts'] },
        },
      },
      // Hint: Production-bundle tests load `@qwik.dev/core`'s `core.prod.mjs`
      // with browser flags in an isolated forked worker so neither Qwik's
      // global runtime registry nor module mocks leak into `isolate: false`
      // unit tests.
      {
        extends: true,
        test: {
          name: 'qwik-prod',
          environment: 'jsdom',
          isolate: true,
          pool: 'forks',
          include: ['src/**/*.prod.test.ts'],
        },
      },
    ],
    coverage: {
      include: ['src'],
      exclude: [
        'src/types',
        'src/vitest',
        'src/framework',
        'src/values.ts',
        '**/index.ts',
        '**/types.ts',
        '**/*.test.ts',
        '**/*.test-d.ts',
      ],
    },
  },
});
