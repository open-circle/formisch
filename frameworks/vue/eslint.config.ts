import eslint from '@eslint/js';
import { commonRules, importPlugin, jsdoc } from '@formisch/eslint-config';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript';
import pluginSecurity from 'eslint-plugin-security';
import pluginVue from 'eslint-plugin-vue';

export default defineConfigWithVueTs(
  { ignores: ['eslint.config.ts', 'dist', 'dist-ssr', 'coverage'] },
  eslint.configs.recommended,
  jsdoc.configs['flat/recommended'],
  pluginSecurity.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.strict,
  vueTsConfigs.stylistic,
  {
    name: 'app/files-to-lint',
    files: ['src/**/*.{ts,mts,tsx,vue}'],
    extends: [importPlugin.flatConfigs.recommended],
    plugins: { jsdoc },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...commonRules,
      // Vue-specific rules
      'vue/multi-word-component-names': 'off',
    },
  }
);
