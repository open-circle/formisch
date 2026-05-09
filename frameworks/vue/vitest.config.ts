import vue from 'unplugin-vue/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/vitest/setup.ts'],
    coverage: {
      include: ['src'],
      exclude: [
        'src/types',
        'src/vitest',
        'src/shims-vue.d.ts',
        '**/index.ts',
        '**/*.test.ts',
        '**/*.test-d.ts',
      ],
    },
  },
});
