import type { FieldElementProps } from '@formisch/solid/v2';
import clsx from 'clsx';
import { createMemo, omit } from 'solid-js';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';

interface TextInputProps extends FieldElementProps {
  class?: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'number' | 'date';
  label?: string;
  placeholder?: string;
  required?: boolean;
  input: string | number | undefined;
  errors: [string, ...string[]] | null;
}

/**
 * Text input field that users can type into. Various decorations can be
 * displayed in or around the field to communicate the entry requirements.
 */
export function TextInput(props: TextInputProps) {
  // Omit props that are not passed to the input element
  const inputProps = omit(props, 'class', 'input', 'label', 'errors');

  // Create memoized value
  const getValue = createMemo<string | number | undefined>((prevValue) =>
    props.input === undefined
      ? ''
      : !Number.isNaN(props.input)
        ? props.input
        : (prevValue ?? '')
  );

  return (
    <div class={clsx('px-8 lg:px-10', props.class)}>
      <InputLabel
        name={props.name}
        label={props.label}
        required={props.required}
      />
      <input
        {...inputProps}
        class={clsx(
          'h-14 w-full rounded-2xl border-2 bg-white px-5 outline-none placeholder:text-slate-500 md:h-16 md:text-lg lg:h-[70px] lg:px-6 lg:text-xl dark:bg-gray-900',
          props.errors
            ? 'border-red-600/50 dark:border-red-400/50'
            : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50'
        )}
        id={props.name}
        value={getValue()}
        aria-invalid={props.errors ? 'true' : 'false'}
        aria-errormessage={`${props.name}-error`}
      />
      <InputErrors name={props.name} errors={props.errors} />
    </div>
  );
}
