import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';
import solidConfig from './src/framework/vitest.solid.config.ts';

export default defineConfig({
  test: {
    name: 'core',
    environment: 'jsdom',
    isolate: false,
    setupFiles: ['./src/vitest/setup.ts'],
    typecheck: {
      checker: fileURLToPath(
        new URL('./node_modules/.bin/tsc', import.meta.url)
      ),
    },
    exclude: [...configDefaults.exclude, 'src/framework/index.solid.test.ts'],
    // Run the root project so Vitest forwards --typecheck only when requested.
    projects: ['.', solidConfig],
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
