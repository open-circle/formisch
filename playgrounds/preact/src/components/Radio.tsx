import type { FieldElementProps } from '@formisch/preact';
import { ReadonlySignal } from '@preact/signals';
import clsx from 'clsx';
import { forwardRef } from 'preact/compat';
import { InputErrors } from './InputErrors';

interface RadioProps extends FieldElementProps {
  class?: string;
  label?: string;
  value?: string;
  input: ReadonlySignal<boolean | undefined>;
  required?: boolean;
  errors: ReadonlySignal<[string, ...string[]] | null>;
}

/**
 * Radio button that allows users to select just one option. The label next to the
 * radio button describes the selection option.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, value, input, errors, ...props }: RadioProps) => {
    const { name, required } = props;
    return (
      <div class={clsx('px-8 lg:px-10', props.class)}>
        <label class="flex space-x-4 font-medium select-none md:text-lg lg:text-xl">
          <input
            {...props}
            class="mt-1 h-4 w-4 cursor-pointer lg:mt-1 lg:h-5 lg:w-5"
            type="radio"
            id={name}
            value={value}
            checked={input}
            aria-invalid={!!errors?.value}
            aria-errormessage={`${name}-error`}
          />
          <span>{label}</span>{' '}
          {required && (
            <span class="ml-1 text-red-600 dark:text-red-400">*</span>
          )}
        </label>
        <InputErrors name={name} errors={errors} />
      </div>
    );
  }
);
