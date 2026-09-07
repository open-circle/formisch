import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  external: ['@formisch/core/react'],
  outDir: 'dist',
  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),
  outputOptions: {
    paths: { '@formisch/core/react': './internals.js' },
  },
  dts: {
    resolve: ['@formisch/methods/react'],
  },
  copy: [
    {
      from: '../../packages/core/dist/index.react.js',
      to: 'dist/internals.js',
    },
    {
      from: '../../packages/core/dist/index.react.d.ts',
      to: 'dist/internals.d.ts',
    },
  ],
});
