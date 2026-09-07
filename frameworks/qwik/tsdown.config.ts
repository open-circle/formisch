import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  external: ['@formisch/core/qwik'],
  outDir: 'dist',
  outExtensions: () => ({
    dts: '.d.ts',
    js: '.qwik.js',
  }),
  outputOptions: {
    paths: { '@formisch/core/qwik': './internals.qwik.js' },
  },
  dts: {
    resolve: ['@formisch/methods/qwik'],
  },
  copy: [
    {
      from: '../../packages/core/dist/index.qwik.js',
      to: 'dist/internals.qwik.js',
    },
    {
      from: '../../packages/core/dist/index.qwik.d.ts',
      to: 'dist/internals.qwik.d.ts',
    },
  ],
});
