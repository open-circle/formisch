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
      <Providers />
    </body>
  </QwikRouterProvider>
));
