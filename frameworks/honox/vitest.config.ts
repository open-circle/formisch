import { defineConfig } from 'vitest/config';

export default defineConfig({
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
      // Hint: The Node environment has no DOM, so hono/jsx renders the
      // components with its server renderer like HonoX does for islands
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
