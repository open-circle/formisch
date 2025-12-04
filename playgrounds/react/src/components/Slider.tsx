import type { FieldElementProps } from '@formisch/react';
import clsx from 'clsx';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';

interface SliderProps extends FieldElementProps {
  className?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  input: string | number | undefined;
  errors: [string, ...string[]] | null;
}

/**
 * Range slider that allows users to select predefined numbers. Various
 * decorations can be displayed in or around the field to communicate the
 * entry requirements.
 */
export function Slider({
  label,
  input,
  errors,
  className,
  ...props
}: SliderProps) {
  const { name, required } = props;
  return (
    <div className={clsx('px-8 lg:px-10', className)}>
      <InputLabel name={name} label={label} required={required} />
      <input
        {...props}
        className="w-full"
        type="range"
        id={name}
        value={input}
        aria-invalid={!!errors}
        aria-errormessage={`${name}-error`}
      />
      <InputErrors name={name} errors={errors} />
    </div>
  );
}
