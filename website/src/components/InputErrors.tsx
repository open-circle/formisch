import {
  component$,
  type ReadonlySignal,
  useSignal,
  useTask$,
} from '@qwik.dev/core';
import { isBrowser } from '@qwik.dev/core/build';
import { Expandable } from './Expandable';

type InputErrorProps = {
  name: string;
  errors: ReadonlySignal<[string, ...string[]] | null>;
};

/**
 * Input error that tells the user what to do to fix the problem.
 */
export const InputErrors = component$(({ name, errors }: InputErrorProps) => {
  // Use frozen error signal
  const frozenError = useSignal<[string, ...string[]] | null>();

  // Freeze error while element collapses to prevent UI from jumping
  useTask$(({ track, cleanup }) => {
    const nextErrors = track(() => errors.value);
    if (isBrowser && !nextErrors) {
      const timeout = setTimeout(() => (frozenError.value = null), 200);
      cleanup(() => clearTimeout(timeout));
    } else {
      frozenError.value = nextErrors;
    }
  });

  return (
    <Expandable expanded={!!errors.value}>
      <div
        class="pt-4 text-sm text-red-500 md:text-base lg:pt-5 lg:text-lg dark:text-red-400"
        id={`${name}-error`}
      >
        {frozenError.value?.[0]}
      </div>
    </Expandable>
  );
});
