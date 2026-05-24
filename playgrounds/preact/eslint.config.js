import { baseConfigs, tseslint } from '@formisch/eslint-config';
import preact from 'eslint-config-preact';

export default tseslint.config(
  { ignores: ['eslint.config.js', 'dist'] },
  ...baseConfigs,
  {
    ...preact[1],
    plugins: preact[1].plugins,
    settings: preact[1].settings,
    languageOptions: {
      ...preact[1].languageOptions,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...preact[1].rules,
      // Preact-specific rules
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      // Playgrounds favor inline `type` aliases over `interface` for props
      '@typescript-eslint/consistent-type-definitions': 'off',
      // Unlike the published library, playgrounds are example apps and are
      // not documented with JSDoc, so the documentation requirements are off
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-type': 'off',
      // Non-null assertions are fine in example code (matches the library config)
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  }
);
