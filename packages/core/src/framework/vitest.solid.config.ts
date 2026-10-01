import { fileURLToPath } from 'node:url';
import { defineProject, type UserWorkspaceConfig } from 'vitest/config';

const config: UserWorkspaceConfig = defineProject({
  root: fileURLToPath(new URL('../..', import.meta.url)),
  resolve: {
    conditions: ['browser'],
  },
  test: {
    name: 'solid',
    environment: 'jsdom',
    isolate: true,
    include: ['src/framework/index.solid.test.ts'],
  },
});

export default config;
