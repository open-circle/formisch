import { qwikVite } from '@qwik.dev/core/optimizer';
import { qwikRouter } from '@qwik.dev/router/vite';
import rehypeShiki from '@shikijs/rehype/core';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import rehypeExternalLinks from 'rehype-external-links';
import { getSingletonHighlighter } from 'shiki';
import shikiAngularHtml from 'shiki/langs/angular-html.mjs';
import shikiBash from 'shiki/langs/bash.mjs';
import shikiSvelte from 'shiki/langs/svelte.mjs';
import shikiTypeScript from 'shiki/langs/ts.mjs';
import shikiTypeScriptX from 'shiki/langs/tsx.mjs';
import shikiVue from 'shiki/langs/vue.mjs';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const highlighter = await getSingletonHighlighter();

await Promise.all([
  highlighter.loadLanguage(
    shikiTypeScript,
    shikiTypeScriptX,
    shikiBash,
    shikiSvelte,
    shikiVue,
    shikiAngularHtml
  ),
  highlighter.loadTheme(
    JSON.parse(readFileSync('shiki/pace-theme-light+.json', 'utf8')),
    JSON.parse(readFileSync('shiki/pace-theme-dark.json', 'utf8'))
  ),
]);

export default defineConfig(() => {
  return {
    plugins: [
      qwikRouter({
        mdxPlugins: {
          remarkGfm: true,
          rehypeSyntaxHighlight: false,
          rehypeAutolinkHeadings: true,
        },
        mdx: {
          providerImportSource: '~/hooks/useMDXComponents.tsx',
          rehypePlugins: [
            [rehypeExternalLinks, { rel: 'noreferrer', target: '_blank' }],
            [
              rehypeShiki,
              highlighter,
              {
                themes: {
                  light: 'Pace Light',
                  dark: 'Pace Dark',
                },
              },
            ],
          ],
        },
      }),
      qwikVite({
        experimental: ['valibot'],
      }),
      tsconfigPaths(),
      tailwindcss(),
    ],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
