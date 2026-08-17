import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  external: ['valibot', '@formisch/core'],
  clean: true,
  format: ['es'],
  minify: false,
  dts: true,
  outDir: './dist',
});
