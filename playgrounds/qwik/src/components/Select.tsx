import type { FieldElementProps } from '@formisch/qwik';
import { component$, Signal, useComputed$ } from '@qwik.dev/core';
import clsx from 'clsx';
import { AngleDownIcon } from '~/icons';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';

interface SelectProps extends FieldElementProps {
  class?: string;
  label?: string;
  options: { label: string; value: string }[];
  multiple?: boolean;
  size?: number;
  placeholder?: string;
  required?: boolean;
  input: Readonly<Signal<string | string[] | null | undefined>>;
  errors: Readonly<Signal<[string, ...string[]] | null>>;
}

/**
 * Select field that allows users to select predefined values. Various
 * decorations can be displayed in or around the field to communicate the
 * entry requirements.
 */
export const Select = component$(
  ({ options, label, input, errors, ...props }: SelectProps) => {
    const { name, required, multiple, placeholder } = props;

    // Create computed value of selected values
    const values = useComputed$(() =>
      Array.isArray(input.value)
        ? input.value
        : input.value && typeof input.value === 'string'
          ? [input.value]
          : []
    );

    return (
      <div class={clsx('px-8 lg:px-10', props.class)}>
        <InputLabel name={name} label={label} required={required} />
        <div class="relative flex items-center">
          <select
            {...props}
            class={clsx(
              'w-full appearance-none space-y-2 rounded-2xl border-2 bg-transparent px-5 outline-none md:text-lg lg:space-y-3 lg:px-6 lg:text-xl',
              errors?.value
                ? 'border-red-600/50 dark:border-red-400/50'
                : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50',
              multiple ? 'py-5' : 'h-14 md:h-16 lg:h-[70px]',
              placeholder && !values.value?.length && 'text-slate-500'
            )}
            id={name}
            aria-invalid={!!errors?.value}
            aria-errormessage={`${name}-error`}
          >
            <option value="" disabled hidden selected={!input.value}>
              {placeholder}
            </option>
            {options.map(({ label, value }) => (
              <option
                key={value}
                value={value}
                selected={values.value?.includes(value)}
              >
                {label}
              </option>
            ))}
          </select>
          {!multiple && (
            <AngleDownIcon class="pointer-events-none absolute right-6 h-5 lg:right-8 lg:h-6" />
          )}
        </div>
        <InputErrors name={name} errors={errors} />
      </div>
    );
  }
);
