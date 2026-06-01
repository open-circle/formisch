import type { FieldElementProps } from '@formisch/solid';
import clsx from 'clsx';
import { Show, splitProps } from 'solid-js';
import { InputErrors } from './InputErrors';

interface CheckboxProps extends FieldElementProps {
  class?: string;
  label?: string;
  value?: string;
  input: boolean | undefined;
  required?: boolean;
  errors: [string, ...string[]] | null;
}

/**
 * Checkbox that allows users to select an option. The label next to the
 * checkbox describes the selection option.
 */
export function Checkbox(props: CheckboxProps) {
  const [, inputProps] = splitProps(props, [
    'class',
    'label',
    'input',
    'errors',
  ]);

  return (
    <div class={clsx('px-8 lg:px-10', props.class)}>
      <label class="flex space-x-4 font-medium select-none md:text-lg lg:text-xl">
        <input
          {...inputProps}
          class="mt-1 h-4 w-4 cursor-pointer lg:mt-1 lg:h-5 lg:w-5"
          type="checkbox"
          id={props.name}
          value={props.value}
          checked={props.input}
          aria-invalid={!!props.errors}
          aria-errormessage={`${props.name}-error`}
        />
        <span>{props.label}</span>{' '}
        <Show when={props.required}>
          <span class="ml-1 text-red-600 dark:text-red-400">*</span>
        </Show>
      </label>
      <InputErrors name={props.name} errors={props.errors} />
    </div>
  );
}
