import type { FormStore } from '@formisch/honox';
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
export function FormError({ of: form, ...props }: FormErrorProps) {
  return (
    <Expandable expanded={!!form.errors}>
      <div
        class={clsx(
          'px-8 text-red-500 md:text-lg lg:px-10 lg:text-xl dark:text-red-400',
          props.class
        )}
      >
        {form.errors?.[0]}
      </div>
    </Expandable>
  );
}
