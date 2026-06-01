import type { FormStore } from '@formisch/qwik';
import {
  component$,
  createContextId,
  type Signal,
  Slot,
  useContextProvider,
  useSignal,
} from '@qwik.dev/core';
import { Debugger, SideBar, Tabs, useSideBarToggle } from '~/components';

export const FormStoreContext =
  createContextId<Signal<FormStore | undefined>>('form-store-context');

export default component$(() => {
  const toggle = useSideBarToggle();

  const formContext = useSignal<FormStore>();
  useContextProvider(FormStoreContext, formContext);

  return (
    <main class="flex w-full max-w-(--breakpoint-2xl) flex-1 flex-col self-center lg:flex-row">
      <div class="flex flex-1 flex-col gap-12 py-10 md:gap-14 md:py-14 lg:gap-16 lg:py-24 xl:py-32">
        <Tabs items={['Login', 'Payment', 'Todos', 'Special', 'Nested']} />
        <Slot />
      </div>
      <SideBar toggle={toggle}>
        <Debugger of={formContext.value} />
      </SideBar>
    </main>
  );
});
