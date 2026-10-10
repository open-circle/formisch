import { baseConfigs, jsdoc } from '@formisch/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'eslint.config.js']),
  {
    files: ['app/**/*.{ts,tsx}'],
    extends: [...baseConfigs],
    plugins: { jsdoc },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
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
  },
]);
