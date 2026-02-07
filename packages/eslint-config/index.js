import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import pluginSecurity from 'eslint-plugin-security';
import tseslint from 'typescript-eslint';

/**
 * Base ESLint configs to extend in all packages.
 */
export const baseConfigs = [
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  jsdoc.configs['flat/recommended'],
  pluginSecurity.configs.recommended,
];

/**
 * Import plugin config - must be applied with file restrictions.
 */
export const importConfig = importPlugin.flatConfigs.recommended;

/**
 * Common rules for source files across all packages.
 */
export const commonRules = {
  // Enable rules -----------------------------------------------------------

  // TypeScript
  '@typescript-eslint/consistent-type-definitions': 'error',
  '@typescript-eslint/consistent-type-imports': 'error',

  // Import
  'import/extensions': ['error', 'ignorePackages'],

  // JSDoc
  'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
  'jsdoc/sort-tags': [
    'error',
    {
      linesBetween: 1,
      tagSequence: [
        { tags: ['deprecated'] },
        { tags: ['param'] },
        { tags: ['returns'] },
      ],
    },
  ],
  'jsdoc/require-jsdoc': [
    'error',
    {
      contexts: [
        'ExportNamedDeclaration[declaration.type="TSDeclareFunction"]:not(ExportNamedDeclaration[declaration.type="TSDeclareFunction"] + ExportNamedDeclaration[declaration.type="TSDeclareFunction"])',
        'ExportNamedDeclaration[declaration.type="FunctionDeclaration"]:not(ExportNamedDeclaration[declaration.type="TSDeclareFunction"] + ExportNamedDeclaration[declaration.type="FunctionDeclaration"])',
      ],
      require: { FunctionDeclaration: false },
    },
  ],
  'jsdoc/check-tag-names': [
    'error',
    { definedTags: ['alpha', 'beta', '__NO_SIDE_EFFECTS__'] },
  ],

  // Disable rules ----------------------------------------------------------

  // Import
  'import/no-unresolved': 'off',

  // JSDoc
  'jsdoc/require-param-type': 'off',
  'jsdoc/require-returns-type': 'off',

  // Security
  'security/detect-object-injection': 'off',

  // TypeScript
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/prefer-function-type': 'off',
  '@typescript-eslint/no-inferrable-types': 'off',
};

/**
 * Rules to disable JSDoc param checking for component files.
 */
export const componentRules = {
  'jsdoc/require-param': 'off',
  'jsdoc/check-param-names': 'off',
};

/**
 * Creates a source file configuration object.
 *
 * @param options Configuration options.
 * @param options.tsconfigRootDir The root directory for tsconfig resolution.
 * @param options.files The file patterns to match (default: src/**\/*.{ts,tsx}).
 * @param options.extraPlugins Additional plugins to include.
 * @param options.extraRules Additional rules to merge.
 *
 * @returns The ESLint configuration object for source files.
 */
export function createSourceConfig(options = {}) {
  const {
    tsconfigRootDir,
    files = ['src/**/*.{ts,tsx}'],
    extraPlugins = {},
    extraRules = {},
  } = options;
  return {
    files,
    plugins: { import: importPlugin, jsdoc, ...extraPlugins },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    rules: { ...commonRules, ...extraRules },
  };
}

// Re-export plugins and tseslint for framework configs
export { eslint, importPlugin, jsdoc, pluginSecurity, tseslint };
