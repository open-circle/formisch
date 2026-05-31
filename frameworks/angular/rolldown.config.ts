import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

// The Angular components are first compiled with `ngc` (partial Ivy) into the
// `tmp` directory, then bundled here into a self-contained package. The
// internal `@formisch/core` and `@formisch/methods` code is inlined (it has no
// published framework-specific entry points), while Angular and valibot stay
// external as peer dependencies.
const external = [/^@angular\//, /^rxjs(\/|$)/, 'valibot'];
const resolve = ['@formisch/core/angular', '@formisch/methods/angular'];

export default defineConfig([
  {
    input: './tmp/index.js',
    external,
    output: {
      file: 'dist/index.js',
      format: 'es',
    },
  },
  {
    input: './tmp/index.d.ts',
    external,
    plugins: [dts({ dtsInput: true, resolve })],
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
  },
]);
