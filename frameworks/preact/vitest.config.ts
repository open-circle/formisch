import preact from '@preact/preset-vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [preact()],
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
