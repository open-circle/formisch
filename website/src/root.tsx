import { component$ } from '@qwik.dev/core';
import { QwikRouterProvider, RouterOutlet } from '@qwik.dev/router';
import { HeadContent } from './components';
import { useChaptersProvider } from './routes/plugin@chapters';
import { useFrameworkProvider } from './routes/plugin@framework';
import { useThemeProvider } from './routes/plugin@theme';
import './styles/root.css';
import { disableTransitions } from './utils';

const Providers = component$(() => {
  useThemeProvider();
  useChaptersProvider();
  useFrameworkProvider();
  return <RouterOutlet />;
});

export default component$(() => (
  <QwikRouterProvider>
    <head>
      <HeadContent />
    </head>
    <body
      class="font-lexend flex min-h-screen flex-col bg-white text-slate-600 dark:bg-gray-900 dark:text-slate-400"
      window:onResize$={() => disableTransitions()}
    >
      {/* Hint for AI agents on how to consume our documentation as Markdown.
          Hidden from the accessibility tree and kept free of focusable links,
          as it targets crawlers and agents reading the HTML, not users. */}
      <div aria-hidden="true" class="sr-only">
        This documentation is available as Markdown for AI agents. Append ".md"
        to any documentation URL (e.g. "/react/api/useForm/" becomes
        "/react/api/useForm.md") or send an "Accept: text/markdown" header to
        receive the Markdown version. An MCP server with tools to search and
        read this documentation is available at "/mcp". A machine-readable index
        of all Markdown resources is available at "/llms.txt".
      </div>
      <Providers />
    </body>
  </QwikRouterProvider>
));
