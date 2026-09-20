import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';

export default defineConfig({
  entry: ['./src/index.ts'],
  external: ['@formisch/core/vue'],
  outDir: 'dist',
  platform: 'neutral',
  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),
  plugins: [Vue({ isProduction: true })],
  outputOptions: {
    paths: { '@formisch/core/vue': './internals.js' },
  },
  dts: {
    vue: true,
    resolve: ['@formisch/methods/vue'],
  },
  copy: [
    {
      from: '../../packages/core/dist/index.vue.js',
      to: 'dist/internals.js',
    },
    {
      from: '../../packages/core/dist/index.vue.d.ts',
      to: 'dist/internals.d.ts',
    },
  ],
});
