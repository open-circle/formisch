import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  external: ['@formisch/core/react-native'],
  outDir: 'dist',
  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),
  outputOptions: {
    paths: { '@formisch/core/react-native': './internals.js' },
  },
  dts: {
    resolve: ['@formisch/methods/react-native'],
  },
  copy: [
    {
      from: '../../packages/core/dist/index.react-native.js',
      to: 'dist/internals.js',
    },
    {
      from: '../../packages/core/dist/index.react-native.d.ts',
      to: 'dist/internals.d.ts',
    },
  ],
});
