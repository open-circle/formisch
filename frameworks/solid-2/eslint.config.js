import {
  baseConfigs,
  createSourceConfig,
  tseslint,
} from '@formisch/eslint-config';
import solidLint from 'eslint-plugin-solid/configs/v2';

const sourceConfig = createSourceConfig({
  tsconfigRootDir: import.meta.dirname,
});

export default tseslint.config(
  { ignores: ['eslint.config.js', 'vite.config.ts', 'tsdown.config.ts'] },
  ...baseConfigs,
  {
    ...sourceConfig,
    plugins: { ...solidLint.plugins, ...sourceConfig.plugins },
    settings: { ...sourceConfig.settings, ...solidLint.settings },
    rules: {
      ...solidLint.rules,
      ...sourceConfig.rules,
    },
  }
);
