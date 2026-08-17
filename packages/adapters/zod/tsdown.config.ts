import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  external: ['zod', '@formisch/core'],
  clean: true,
  format: ['es'],
  minify: false,
  dts: true,
  outDir: './dist',
});
