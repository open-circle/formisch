import { includeIgnoreFile } from '@eslint/compat';
import {
  baseConfigs,
  commonRules,
  importPlugin,
  jsdoc,
  tseslint,
} from '@formisch/eslint-config';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  { ignores: ['eslint.config.js'] },
  ...baseConfigs,
  ...svelte.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { import: importPlugin, jsdoc },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...commonRules,
      // Svelte-specific rules
      'no-undef': 'off',
      'import/namespace': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: tseslint.parser,
        svelteConfig,
      },
    },
  }
);
