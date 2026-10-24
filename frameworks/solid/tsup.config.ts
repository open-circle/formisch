import { defineConfig } from 'tsup';
import * as preset from 'tsup-preset-solid';

const preset_options: preset.PresetOptions = {
  // array or single object
  entries: [
    // default entry (index)
    {
      // entries with '.tsx' extension will have `solid` export condition generated
      entry: 'src/index.tsx',
      // will generate a separate development entry
      dev_entry: true,
    },
  ],
  // Set to `true` to remove all `console.*` calls and `debugger` statements in prod builds
  drop_console: true,
  esbuild_plugins: [
    {
      name: 'externalize-core',
      setup(build) {
        build.onResolve({ filter: /^@formisch\/core\/solid$/ }, () => ({
          path: './internals.js',
          external: true,
        }));
      },
    },
  ],
  // Set to `true` to generate a CommonJS build alongside ESM
  // cjs: true,
};

const CI =
  process.env['CI'] === 'true' ||
  process.env['GITHUB_ACTIONS'] === 'true' ||
  process.env['CI'] === '"1"' ||
  process.env['GITHUB_ACTIONS'] === '"1"';

export default defineConfig((config) => {
  const watching = !!config.watch;

  const parsed_options = preset.parsePresetOptions(preset_options, watching);

  if (!watching && !CI) {
    const package_fields = preset.generatePackageExports(parsed_options);
    package_fields.exports = {
      '.': package_fields.exports,
      './internals': {
        types: './dist/internals.d.ts',
        import: './dist/internals.js',
      },
      // SolidJS 2 build copied from `frameworks/solid-2` by tsdown
      './v2': {
        solid: './dist/v2/index.jsx',
        import: {
          types: './dist/v2/index.d.ts',
          default: './dist/v2/index.js',
        },
      },
      './v2/internals': {
        types: './dist/v2/internals.d.ts',
        import: './dist/v2/internals.js',
      },
    };

    console.log(
      `package.json: \n\n${JSON.stringify(package_fields, null, 2)}\n\n`
    );

    // will update ./package.json with the correct export fields
    preset.writePackageJson(package_fields);
  }

  return preset.generateTsupOptions(parsed_options).map((options) => ({
    ...options,
    dts: false,
  }));
});
