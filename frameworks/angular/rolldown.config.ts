import { readFileSync } from 'node:fs';
import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

// The Angular components are first compiled with `ngc` (partial Ivy) into the
// `tmp` directory, then bundled here into a self-contained package. The
// methods are inlined, while the core is copied to the shared internals entry.
// Angular and valibot stay external as peer dependencies.
const external = [
  /^@angular\//,
  /^rxjs(\/|$)/,
  'valibot',
  '@formisch/core/angular',
];
const paths = { '@formisch/core/angular': './internals.js' };

export default defineConfig([
  {
    input: './tmp/index.js',
    external,
    plugins: [
      {
        name: 'copy-core',
        generateBundle() {
          for (const extension of ['js', 'd.ts']) {
            this.emitFile({
              type: 'asset',
              fileName: `internals.${extension}`,
              source: readFileSync(
                `../../packages/core/dist/index.angular.${extension}`,
                'utf8'
              ),
            });
          }
        },
      },
    ],
    output: {
      file: 'dist/index.js',
      format: 'es',
      paths,
    },
  },
  {
    input: './tmp/index.d.ts',
    external,
    plugins: [dts({ dtsInput: true, resolve: ['@formisch/methods/angular'] })],
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
      paths,
    },
  },
]);
