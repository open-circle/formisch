import type { FormStore } from '@formisch/qwik';
import { component$, useSignal, useTask$ } from '@qwik.dev/core';
import { isBrowser } from '@qwik.dev/core/build';
import clsx from 'clsx';
import { Expandable } from './Expandable';

type FormErrorProps = {
  of: FormStore;
  class?: string;
};

/**
 * Error component usually used at the end of a form to provide feedback to the
 * user.
 */
export const FormError = component$(
  ({ of: form, ...props }: FormErrorProps) => {
    // Use frozen response signal
    const frozenFormError = useSignal<[string, ...string[]] | null>();

    // Freeze response while element collapses to prevent UI from jumping
    useTask$(({ track, cleanup }) => {
      const nextFormError = track(() => form.errors.value);
      if (isBrowser && !nextFormError) {
        const timeout = setTimeout(
          () => (frozenFormError.value = nextFormError),
          200
        );
        cleanup(() => clearTimeout(timeout));
      } else {
        frozenFormError.value = nextFormError;
      }
    });

    return (
      <Expandable expanded={!!form.errors.value}>
        <div
          class={clsx(
            'px-8 text-red-500 md:text-lg lg:px-10 lg:text-xl dark:text-red-400',
            props.class
          )}
        >
          {frozenFormError.value?.[0]}
        </div>
      </Expandable>
    );
  }
);
