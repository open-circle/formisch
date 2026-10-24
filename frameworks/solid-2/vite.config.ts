import solid from '@solidjs/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Hint: Hot refresh is not needed for a library and its transform does not
  // support TypeScript function overloads, which the components use
  plugins: [solid({ refresh: { disabled: true } })],
  build: {
    // Compiled fallback for consumers without the `solid` export condition
    lib: {
      entry: './src/index.tsx',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    minify: false,
    emptyOutDir: true,
    rolldownOptions: {
      external: [
        'solid-js',
        '@solidjs/web',
        'valibot',
        '@formisch/core/solid-2',
      ],
      output: {
        paths: { '@formisch/core/solid-2': './internals.js' },
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'client',
          environment: 'jsdom',
          setupFiles: ['./src/vitest/setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.ssr.test.tsx'],
          typecheck: { enabled: true, include: ['src/**/*.test-d.ts'] },
        },
      },
      // Hint: The Node environment makes Vite resolve the server build of
      // Solid and compile JSX for server-side rendering
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.ssr.test.tsx'],
        },
      },
    ],
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
