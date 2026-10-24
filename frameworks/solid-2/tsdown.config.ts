import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.tsx'],
  external: ['solid-js', '@solidjs/web', 'valibot', '@formisch/core/solid-2'],
  outDir: 'dist',
  // Hint: `vite build` runs first and emits `dist/index.js`
  clean: false,
  platform: 'neutral',
  // Hint: JSX is kept untouched because `tsconfig.json` sets `jsx: preserve`.
  // The Solid compiler of the consuming app compiles it for client or server.
  outExtensions: () => ({
    js: '.jsx',
    dts: '.d.ts',
  }),
  outputOptions: {
    paths: { '@formisch/core/solid-2': './internals.js' },
  },
  dts: {
    resolve: ['@formisch/methods/solid-2'],
  },
  copy: [
    {
      from: '../../packages/core/dist/index.solid-2.js',
      to: 'dist/internals.js',
    },
    {
      from: '../../packages/core/dist/index.solid-2.d.ts',
      to: 'dist/internals.d.ts',
    },
  ],
});
