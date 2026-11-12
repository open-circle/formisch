import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      // Use the react build of @formisch/core for testing
      // Hint: Only the exact specifier is matched, so that framework variants
      // can import their own entry point (e.g. @formisch/core/react-native).
      {
        find: /^@formisch\/core$/,
        replacement: path.resolve(__dirname, '../core/dist/index.react.js'),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    coverage: {
      include: ['src'],
      exclude: [
        'src/types',
        'src/vitest',
        '**/index.ts',
        '**/types.ts',
        '**/*.test.ts',
        '**/*.test-d.ts',
      ],
    },
  },
});
