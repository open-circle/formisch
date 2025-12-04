import type { FieldElementProps } from '@formisch/react';
import clsx from 'clsx';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';
import { Radio } from './Radio';

interface RadioGroupProps extends FieldElementProps {
  className?: string;
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
export const RadioGroup = ({
  label,
  options,
  input,
  errors,
  className,
  ...props
}: RadioGroupProps) => {
  const { name, required } = props;
  return (
    <fieldset
      className={clsx('px-8 lg:px-10', className)}
      aria-invalid={!!errors}
      aria-errormessage={`${name}-error`}
    >
      <InputLabel component="legend" label={label} required={required} />
      <div className="flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800">
        {options.map(({ label, value }) => (
          <Radio
            {...props}
            key={value}
            label={label}
            value={value}
            checked={input === value}
          />
        ))}
      </div>
      <InputErrors name={name} errors={errors} />
    </fieldset>
  );
};
