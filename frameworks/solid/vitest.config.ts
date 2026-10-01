import solid from '@solidjs/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Native refresh currently redeclares overloaded component functions in dev.
  // Tests exercise lifecycle directly and do not need hot module replacement.
  plugins: [solid({ hot: false })],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/vitest/setup.ts'],
    coverage: {
      include: ['src'],
      exclude: [
        'src/types',
        'src/vitest',
        '**/index.ts',
        '**/index.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.test-d.ts',
      ],
    },
  },
});
