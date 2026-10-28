import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  external: ['@formisch/core/honox'],
  outDir: 'dist',
  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),
  outputOptions: {
    paths: { '@formisch/core/honox': './internals.js' },
  },
  dts: {
    resolve: ['@formisch/methods/honox'],
  },
  copy: [
    {
      from: '../../packages/core/dist/index.honox.js',
      to: 'dist/internals.js',
    },
    {
      from: '../../packages/core/dist/index.honox.d.ts',
      to: 'dist/internals.d.ts',
    },
  ],
});
