import type { FormStore } from '@formisch/react';
import clsx from 'clsx';
import { Expandable } from './Expandable';

type FormErrorProps = {
  of: FormStore;
  className?: string;
};

/**
 * Error component usually used at the end of a form to provide feedback to the
 * user.
 */
export function FormError({ of: form, className }: FormErrorProps) {
  return (
    <Expandable expanded={!!form.errors}>
      <div
        className={clsx(
          'px-8 text-red-500 md:text-lg lg:px-10 lg:text-xl dark:text-red-400',
          className
        )}
      >
        {form.errors?.[0]}
      </div>
    </Expandable>
  );
}
