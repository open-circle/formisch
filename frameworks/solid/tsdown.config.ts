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
    // SolidJS 2 build, published as `@formisch/solid/v2`
    ...[
      'index.jsx',
      'index.js',
      'index.d.ts',
      'internals.js',
      'internals.d.ts',
    ].map((file) => ({
      from: `../solid-2/dist/${file}`,
      to: `dist/v2/${file}`,
    })),
  ],
});
