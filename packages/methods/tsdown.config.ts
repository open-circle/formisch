import type { RolldownPluginOption } from 'rolldown';
import { defineConfig, type UserConfig, type UserConfigFn } from 'tsdown';

type Framework = 'preact' | 'qwik' | 'solid' | 'svelte' | 'vanilla' | 'vue';

/**
 * Rolldown plugin to rewrite framework-specific imports.
 */
function rewriteFrameworkImports(framework: Framework): RolldownPluginOption {
  return {
    name: 'rewrite-framework-imports',

    // Transform core imports to framework-specific imports
    transform(code) {
      return code.replace('@formisch/core', `@formisch/core/${framework}`);
    },
  };
}

/**
 * Defines the configuration for a specific framework.
 */
function defineFrameworkConfig(
  framework: Framework
): UserConfig | UserConfigFn {
  return defineConfig({
    entry: ['./src/index.ts'],
    external: [
      '@formisch/core',
      `@formisch/core/${framework}`,
      '@preact/signals',
      '@qwik.dev/core',
      'solid-js',
      'svelte',
      'valibot',
      'vue',
    ],
    clean: true,
    format: ['es'],
    minify: false,
    dts: true,
    outDir: './dist',
    outExtensions: () => ({
      js: `.${framework}.js`,
      dts: `.${framework}.d.ts`,
    }),
    plugins: [rewriteFrameworkImports(framework)],
  });
}

const config: (UserConfig | UserConfigFn)[] = [
  defineFrameworkConfig('preact'),
  defineFrameworkConfig('qwik'),
  defineFrameworkConfig('solid'),
  defineFrameworkConfig('svelte'),
  defineFrameworkConfig('vanilla'),
  defineFrameworkConfig('vue'),
];

export default config;
