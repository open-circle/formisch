import type { FieldElementProps } from '@formisch/preact';
import { ReadonlySignal, useSignal, useSignalEffect } from '@preact/signals';
import clsx from 'clsx';
import type { JSX } from 'preact';
import { forwardRef } from 'preact/compat';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';

interface TextInputProps extends FieldElementProps {
  class?: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'number' | 'date';
  label?: string;
  placeholder?: string;
  required?: boolean;
  input: ReadonlySignal<string | number | undefined>;
  errors: ReadonlySignal<[string, ...string[]] | null>;
}

/**
 * Text input field that users can type into. Various decorations can be
 * displayed in or around the field to communicate the entry requirements.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, input, errors, ...props }: TextInputProps) => {
    const { name, required } = props;
    const signal = useSignal<string | number>();
    useSignalEffect(() => {
      if (!Number.isNaN(input.value)) {
        signal.value = input.value;
      }
    });
    return (
      <div class={clsx('px-8 lg:px-10', props.class)}>
        <InputLabel name={name} label={label} required={required} />
        <input
          // Preact 11 types `type` as a discriminated union, which a union of
          // input types cannot satisfy without widening the props first
          {...(props as JSX.IntrinsicElements['input'])}
          class={clsx(
            'h-14 w-full rounded-2xl border-2 bg-white px-5 outline-none placeholder:text-slate-500 md:h-16 md:text-lg lg:h-[70px] lg:px-6 lg:text-xl dark:bg-gray-900',
            errors?.value
              ? 'border-red-600/50 dark:border-red-400/50'
              : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50'
          )}
          id={name}
          value={signal}
          aria-invalid={!!errors?.value}
          aria-errormessage={`${name}-error`}
        />
        <InputErrors name={name} errors={errors} />
      </div>
    );
  }
);
