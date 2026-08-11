import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    isolate: false,
    setupFiles: ['./src/vitest/setup.ts'],
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
  resolve: {
    alias: {
      '@formisch/valibot': resolve(
        import.meta.dirname,
        '../adapters/valibot/src/index.ts'
      ),
      '@formisch/zod': resolve(
        import.meta.dirname,
        '../adapters/zod/src/index.ts'
      ),
    },
  },
});
