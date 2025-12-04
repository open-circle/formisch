import type { FieldElementProps } from '@formisch/preact';
import { ReadonlySignal } from '@preact/signals';
import clsx from 'clsx';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';
import { Radio } from './Radio';

interface RadioGroupProps extends FieldElementProps {
  class?: string;
  label?: string;
  options: { label: string; value: string }[];
  required?: boolean;
  input: ReadonlySignal<string | undefined>;
  errors: ReadonlySignal<[string, ...string[]] | null>;
}

/**
 * Radio group that allows users to select a single option from a list.
 * Uses fieldset and legend for proper HTML semantics and accessibility.
 */
export const RadioGroup = ({
  label,
  options,
  input,
  errors,
  ...props
}: RadioGroupProps) => {
  const { name, required } = props;
  return (
    <fieldset
      class={clsx('px-8 lg:px-10', props.class)}
      aria-invalid={!!errors?.value}
      aria-errormessage={`${name}-error`}
    >
      <InputLabel component="legend" label={label} required={required} />
      <div class="flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800">
        {options.map(({ label, value }) => (
          <Radio
            {...props}
            key={value}
            label={label}
            value={value}
            checked={input.value === value}
          />
        ))}
      </div>
      <InputErrors name={name} errors={errors} />
    </fieldset>
  );
};
