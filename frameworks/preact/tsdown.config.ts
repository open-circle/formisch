import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  external: ['@formisch/core/preact'],
  outDir: 'dist',
  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),
  outputOptions: {
    paths: { '@formisch/core/preact': './internals.js' },
  },
  dts: {
    resolve: ['@formisch/methods/preact'],
  },
  copy: [
    {
      from: '../../packages/core/dist/index.preact.js',
      to: 'dist/internals.js',
    },
    {
      from: '../../packages/core/dist/index.preact.d.ts',
      to: 'dist/internals.d.ts',
    },
  ],
});
