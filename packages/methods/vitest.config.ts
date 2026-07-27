import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Use the react-native build of @formisch/core for react-native tests
      // Hint: This entry must come first because the alias below also
      // matches the prefix of this subpath
      '@formisch/core/react-native': path.resolve(
        __dirname,
        '../core/dist/index.react-native.js'
      ),
      // Use the react build of @formisch/core for testing
      '@formisch/core': path.resolve(__dirname, '../core/dist/index.react.js'),
    },
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
