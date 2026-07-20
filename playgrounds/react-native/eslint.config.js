const expoConfig = require('eslint-config-expo/flat');
const { defineConfig, globalIgnores } = require('eslint/config');

module.exports = defineConfig([
  globalIgnores(['dist', '.expo']),
  expoConfig,
]);
