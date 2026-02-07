import {
  baseConfigs,
  createSourceConfig,
  tseslint,
} from '@formisch/eslint-config';
import { qwikEslint9Plugin } from 'eslint-plugin-qwik';
import globals from 'globals';

const sourceConfig = createSourceConfig({
  tsconfigRootDir: import.meta.dirname,
});

export default tseslint.config(
  { ignores: ['eslint.config.js', 'dist', 'server'] },
  ...baseConfigs,
  qwikEslint9Plugin.configs.recommended,
  {
    ...sourceConfig,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.serviceworker,
      },
      parserOptions: sourceConfig.languageOptions.parserOptions,
    },
  }
);
