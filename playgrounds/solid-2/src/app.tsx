import type { JSX } from '@solidjs/web';
import { Show } from 'solid-js';
import { Tabs } from './components';
import { getPathname } from './router';
import LoginPage from './routes/login';
import NestedPage from './routes/nested';
import PaymentPage from './routes/payment';
import SpecialPage from './routes/special';
import TodosPage from './routes/todos';
import { disableTransitions, makeEventListener } from './utils';

const pages: Record<string, () => JSX.Element> = {
  '/login': LoginPage,
  '/payment': PaymentPage,
  '/todos': TodosPage,
  '/special': SpecialPage,
  '/nested': NestedPage,
};

export default function App() {
  // Disable CSS transitions while window is resized
  makeEventListener(window, 'resize', disableTransitions);

  return (
    <>
      <Tabs items={['Login', 'Payment', 'Todos', 'Special', 'Nested']} />
      <main>
        <Show when={pages[getPathname()]} keyed>
          {(Page) => <Page />}
        </Show>
      </main>
    </>
  );
}
