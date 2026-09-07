import type { FieldElementProps } from '@formisch/honox';
import clsx from 'clsx';
import { useMemo } from 'hono/jsx';
import { AngleDownIcon } from '../icons';
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
  input: string | string[] | null | undefined;
  errors: [string, ...string[]] | null;
}

/**
 * Select field that allows users to select predefined values. Various
 * decorations can be displayed in or around the field to communicate the
 * entry requirements.
 */
export function Select({
  options,
  label,
  input,
  errors,
  ...props
}: SelectProps) {
  const { name, required, multiple, placeholder } = props;

  // Create computed value of selected values
  const values = useMemo(
    () =>
      Array.isArray(input)
        ? input
        : input && typeof input === 'string'
          ? [input]
          : [],
    [input]
  );

  return (
    <div class={clsx('px-8 lg:px-10', props.class)}>
      <InputLabel name={name} label={label} required={required} />
      <div class="relative flex items-center">
        <select
          {...props}
          class={clsx(
            'w-full appearance-none space-y-2 rounded-2xl border-2 bg-transparent px-5 outline-none md:text-lg lg:space-y-3 lg:px-6 lg:text-xl',
            errors
              ? 'border-red-600/50 dark:border-red-400/50'
              : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50',
            multiple ? 'py-5' : 'h-14 md:h-16 lg:h-[70px]',
            placeholder && !values.length && 'text-slate-500'
          )}
          id={name}
          aria-invalid={!!errors}
          aria-errormessage={`${name}-error`}
        >
          {/* Hint: Unlike React, hono/jsx has no `value` prop on `<select />`
              that survives server rendering, so the selection is expressed
              with the `selected` attribute of the options instead. */}
          <option value="" disabled hidden selected={!values.length}>
            {placeholder}
          </option>
          {options.map(({ label, value }) => (
            <option key={value} value={value} selected={values.includes(value)}>
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
