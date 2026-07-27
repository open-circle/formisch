import eslint from '@eslint/js';
import { commonRules, importPlugin, jsdoc } from '@formisch/eslint-config';
import pluginSecurity from 'eslint-plugin-security';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['eslint.config.ts', 'dist', 'coverage'] },
  eslint.configs.recommended,
  jsdoc.configs['flat/recommended'],
  pluginSecurity.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    name: 'app/files-to-lint',
    files: ['src/**/*.ts'],
    extends: [importPlugin.flatConfigs.recommended],
    plugins: { jsdoc },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...commonRules,
    },
  }
);
