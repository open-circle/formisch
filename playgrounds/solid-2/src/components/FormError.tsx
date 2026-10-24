import type { FormStore } from '@formisch/solid/v2';
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
export function FormError(props: FormErrorProps) {
  return (
    <Expandable expanded={!!props.of.errors}>
      <div
        class={clsx(
          'px-8 text-red-500 md:text-lg lg:px-10 lg:text-xl dark:text-red-400',
          props.class
        )}
      >
        {props.of.errors?.[0]}
      </div>
    </Expandable>
  );
}
