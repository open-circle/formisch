import {
  baseConfigs,
  componentRules,
  createSourceConfig,
  tseslint,
} from '@formisch/eslint-config';
import preact from 'eslint-config-preact';

const sourceConfig = createSourceConfig({
  tsconfigRootDir: import.meta.dirname,
});

export default tseslint.config(
  { ignores: ['eslint.config.js', 'dist'] },
  ...baseConfigs,
  {
    ...preact[1],
    ...sourceConfig,
    plugins: { ...preact[1].plugins, ...sourceConfig.plugins },
    languageOptions: {
      ...preact[1].languageOptions,
      parser: undefined,
      parserOptions: sourceConfig.languageOptions.parserOptions,
    },
    rules: {
      ...preact[1].rules,
      ...sourceConfig.rules,
      // Preact-specific rules
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
    },
  },
  {
    files: ['src/components/**/*.tsx'],
    rules: componentRules,
  }
);
