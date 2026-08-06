import js from '@eslint/js';
import { qwikEslint9Plugin } from 'eslint-plugin-qwik';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ignores = [
  '**/*.log',
  '**/.DS_Store',
  '**/*.',
  '.vscode/settings.json',
  '**/.history',
  '**/.yarn',
  '**/bazel-*',
  '**/bazel-bin',
  '**/bazel-out',
  '**/bazel-qwik',
  '**/bazel-testlogs',
  '**/dist',
  '**/dist-dev',
  '**/lib',
  '**/lib-types',
  '**/etc',
  '**/external',
  '**/node_modules',
  '**/temp',
  '**/tsc-out',
  '**/tsdoc-metadata.json',
  '**/target',
  '**/output',
  '**/rollup.config.js',
  '**/build',
  '**/.cache',
  '**/.vscode',
  '**/.rollup.cache',
  '**/tsconfig.tsbuildinfo',
  '**/vite.config.ts',
  '**/*.cjs',
  '**/*.spec.tsx',
  '**/*.spec.ts',
  '**/.netlify',
  '**/pnpm-lock.yaml',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/server',
  '**/adapters',
  '**/functions',
  'eslint.config.js',
];

export default tseslint.config(
  globalIgnores(ignores),
  js.configs.recommended,
  tseslint.configs.recommended,
  qwikEslint9Plugin.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.serviceworker,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      'no-case-declarations': 'off',
      'no-console': 'off',
      'prefer-spread': 'off',
      'qwik/jsx-img': 'off',
    },
  }
);
