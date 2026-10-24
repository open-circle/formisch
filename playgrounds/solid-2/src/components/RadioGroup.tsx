import type { FieldElementProps } from '@formisch/solid/v2';
import clsx from 'clsx';
import { For, omit } from 'solid-js';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';
import { Radio } from './Radio';

interface RadioGroupProps extends FieldElementProps {
  class?: string;
  label?: string;
  options: { label: string; value: string }[];
  required?: boolean;
  input: string | undefined;
  errors: [string, ...string[]] | null;
}

/**
 * Radio group that allows users to select a single option from a list.
 * Uses fieldset and legend for proper HTML semantics and accessibility.
 */
export function RadioGroup(props: RadioGroupProps) {
  const fieldProps = omit(
    props,
    'class',
    'label',
    'options',
    'input',
    'errors'
  );

  return (
    <fieldset
      class={clsx('px-8 lg:px-10', props.class)}
      aria-invalid={props.errors ? 'true' : 'false'}
      aria-errormessage={`${props.name}-error`}
    >
      <InputLabel
        component="legend"
        label={props.label}
        required={props.required}
      />
      <div class="flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800">
        <For each={props.options}>
          {({ label, value }) => (
            <Radio
              {...fieldProps}
              label={label}
              value={value}
              checked={props.input === value}
            />
          )}
        </For>
      </div>
      <InputErrors name={props.name} errors={props.errors} />
    </fieldset>
  );
}
