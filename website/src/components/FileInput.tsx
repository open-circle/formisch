/* eslint-disable qwik/valid-lexical-scope */
import type { FieldElementProps } from '@formisch/qwik';
import type { ReadonlySignal } from '@qwik.dev/core';
import { component$, useComputed$ } from '@qwik.dev/core';
import clsx from 'clsx';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';

interface FileInputProps extends FieldElementProps {
  class?: string;
  label?: string;
  accept?: string;
  required?: boolean;
  multiple?: boolean;
  input: ReadonlySignal<File | File[] | null | undefined>;
  errors: ReadonlySignal<[string, ...string[]] | null>;
}

/**
 * File input field that users can click or drag files into. Various
 * decorations can be displayed in or around the field to communicate the entry
 * requirements.
 */
export const FileInput = component$(
  ({ label, input, errors, ...props }: FileInputProps) => {
    const { name, required, multiple } = props;

    // Create computed value of selected files
    const files = useComputed$(() =>
      input.value
        ? Array.isArray(input.value)
          ? input.value
          : [input.value]
        : []
    );

    return (
      <div class={clsx('px-8 lg:px-10', props.class)}>
        <InputLabel name={name} label={label} required={required} />
        <label
          class={clsx(
            'relative flex min-h-[96px] w-full items-center justify-center rounded-2xl border-[3px] border-dashed border-slate-200 p-8 text-center focus-within:border-sky-600/50 hover:border-slate-300 md:min-h-[112px] md:text-lg lg:min-h-[128px] lg:p-10 lg:text-xl dark:border-slate-800 dark:focus-within:border-sky-400/50 dark:hover:border-slate-700',
            !files.value.length && 'text-slate-500'
          )}
        >
          {files.value.length
            ? `Selected file${multiple ? 's' : ''}: ${files.value
                .map((file) => file.name)
                .join(', ')}`
            : `Click or drag and drop file${multiple ? 's' : ''}`}
          <input
            {...props}
            class="absolute h-full w-full cursor-pointer opacity-0"
            type="file"
            id={name}
            aria-invalid={!!errors.value}
            aria-errormessage={`${name}-error`}
          />
        </label>
        <InputErrors name={name} errors={errors} />
      </div>
    );
  }
);
