import type { FieldElementProps } from '@formisch/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';

interface TextInputProps extends FieldElementProps {
  className?: string;
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
export function TextInput({
  label,
  input,
  errors,
  className,
  ...props
}: TextInputProps) {
  const { name, required } = props;
  const [value, setValue] = useState<string | number | undefined>(input);
  useEffect(() => {
    if (!Number.isNaN(input)) {
      setValue(input);
    }
  }, [input]);
  return (
    <div className={clsx('px-8 lg:px-10', className)}>
      <InputLabel name={name} label={label} required={required} />
      <input
        {...props}
        className={clsx(
          'h-14 w-full rounded-2xl border-2 bg-white px-5 outline-none placeholder:text-slate-500 md:h-16 md:text-lg lg:h-[70px] lg:px-6 lg:text-xl dark:bg-gray-900',
          errors
            ? 'border-red-600/50 dark:border-red-400/50'
            : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50'
        )}
        id={name}
        value={value ?? ''}
        aria-invalid={!!errors}
        aria-errormessage={`${name}-error`}
      />
      <InputErrors name={name} errors={errors} />
    </div>
  );
}
