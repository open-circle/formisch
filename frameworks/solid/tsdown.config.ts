import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.tsx'],
  external: ['@formisch/core/solid'],
  outDir: 'dist',
  clean: false,
  outExtensions: () => ({
    dts: '.d.ts',
  }),
  outputOptions: {
    paths: { '@formisch/core/solid': './internals.js' },
  },
  dts: {
    emitDtsOnly: true,
    resolve: ['@formisch/methods/solid'],
  },
  copy: [
    {
      from: '../../packages/core/dist/index.solid.js',
      to: 'dist/internals.js',
    },
    {
      from: '../../packages/core/dist/index.solid.d.ts',
      to: 'dist/internals.d.ts',
    },
  ],
});
