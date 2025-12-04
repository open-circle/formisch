import type { FieldElementProps } from '@formisch/react';
import clsx from 'clsx';
import { InputErrors } from './InputErrors';

interface CheckboxProps extends FieldElementProps {
  className?: string;
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
export function Checkbox({
  label,
  value,
  input,
  errors,
  className,
  ...props
}: CheckboxProps) {
  const { name, required } = props;
  return (
    <div className={clsx('px-8 lg:px-10', className)}>
      <label className="flex space-x-4 font-medium select-none md:text-lg lg:text-xl">
        <input
          {...props}
          className="mt-1 h-4 w-4 cursor-pointer lg:mt-1 lg:h-5 lg:w-5"
          type="checkbox"
          id={name}
          value={value}
          checked={!!input}
          aria-invalid={!!errors}
          aria-errormessage={`${name}-error`}
        />
        <span>{label}</span>{' '}
        {required && (
          <span className="ml-1 text-red-600 dark:text-red-400">*</span>
        )}
      </label>
      <InputErrors name={name} errors={errors} />
    </div>
  );
}
