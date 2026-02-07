import {
  baseConfigs,
  createSourceConfig,
  tseslint,
} from '@formisch/eslint-config';
import solidLint from 'eslint-plugin-solid/configs/typescript';

const sourceConfig = createSourceConfig({
  tsconfigRootDir: import.meta.dirname,
});

export default tseslint.config(
  { ignores: ['eslint.config.js'] },
  ...baseConfigs,
  {
    ...sourceConfig,
    plugins: { ...solidLint.plugins, ...sourceConfig.plugins },
    rules: {
      ...solidLint.rules,
      ...sourceConfig.rules,
    },
  }
);
