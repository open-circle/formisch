import {
  baseConfigs,
  commonRules,
  componentRules,
  importConfig,
  jsdoc,
} from '@formisch/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'eslint.config.js']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [...baseConfigs, importConfig],
    plugins: { jsdoc },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: commonRules,
  },
  {
    files: ['src/components/**/*.tsx'],
    rules: componentRules,
  },
]);
