import solid from '@solidjs/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [solid({ ssr: true, start: false })],
  build: {
    target: 'esnext',
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: './src/index.tsx',
      formats: ['es'],
      fileName: () => (isSsrBuild ? 'index.ssr.js' : 'index.js'),
    },
    rolldownOptions: {
      // Methods must use the same core instance as the public internals export.
      external: (id) =>
        id === '@formisch/core/solid' ||
        id === 'valibot' ||
        id.startsWith('valibot/') ||
        id === 'solid-js' ||
        id.startsWith('solid-js/') ||
        id.startsWith('@solidjs/'),
      output: {
        entryFileNames: isSsrBuild ? 'index.ssr.js' : 'index.js',
        paths: { '@formisch/core/solid': './internals.js' },
      },
    },
  },
  ssr: {
    noExternal: ['@formisch/methods'],
  },
}));
