import {
  baseConfigs,
  commonRules,
  componentRules,
  importConfig,
  jsdoc,
} from '@formisch/eslint-config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'eslint.config.js']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      ...baseConfigs,
      importConfig,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { jsdoc },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      // Hint: The `react-native` package ships Flow-typed JavaScript that the
      // TypeScript parser cannot parse, so the import plugin must not analyze
      // its module exports (see the `import/ignore` docs, which use React
      // Native as their example)
      'import/ignore': ['react-native'],
    },
    rules: commonRules,
  },
  {
    files: ['src/components/**/*.tsx'],
    rules: componentRules,
  },
]);
