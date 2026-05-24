import { baseConfigs, tseslint } from '@formisch/eslint-config';
import solid from 'eslint-plugin-solid/configs/typescript';

export default tseslint.config(
  { ignores: ['eslint.config.js', 'app.config.timestamp_*', '.output', '.vinxi'] },
  ...baseConfigs,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: solid.plugins,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...solid.rules,
      // Unlike the published library, playgrounds are example apps and are
      // not documented with JSDoc, so the documentation requirements are off
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-type': 'off',
      // Non-null assertions are fine in example code (matches the library config)
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Playgrounds favor inline `type` aliases over `interface` for props
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  }
);
