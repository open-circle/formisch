import type { FieldElementProps } from '@formisch/react';
import clsx from 'clsx';
import { useMemo } from 'react';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';

interface FileInputProps extends FieldElementProps {
  className?: string;
  label?: string;
  accept?: string;
  required?: boolean;
  multiple?: boolean;
  input: File | File[] | null | undefined;
  errors: [string, ...string[]] | null;
}

/**
 * File input field that users can click or drag files into. Various
 * decorations can be displayed in or around the field to communicate the entry
 * requirements.
 */
export function FileInput({
  label,
  input,
  errors,
  className,
  ...props
}: FileInputProps) {
  const { name, required, multiple } = props;

  // Create computed value of selected files
  const files = useMemo(
    () => (input ? (Array.isArray(input) ? input : [input]) : []),
    [input]
  );

  return (
    <div className={clsx('px-8 lg:px-10', className)}>
      <InputLabel name={name} label={label} required={required} />
      <label
        className={clsx(
          'relative flex min-h-24 w-full items-center justify-center rounded-2xl border-[3px] border-dashed border-slate-200 p-8 text-center focus-within:border-sky-600/50 hover:border-slate-300 md:min-h-28 md:text-lg lg:min-h-32 lg:p-10 lg:text-xl dark:border-slate-800 dark:focus-within:border-sky-400/50 dark:hover:border-slate-700',
          !files?.length && 'text-slate-500'
        )}
      >
        {files?.length
          ? `Selected file${multiple ? 's' : ''}: ${files
              .map((file) => file?.name)
              .join(', ')}`
          : `Click or drag and drop file${multiple ? 's' : ''}`}
        <input
          {...props}
          className="absolute h-full w-full cursor-pointer opacity-0"
          type="file"
          id={name}
          aria-invalid={!!errors}
          aria-errormessage={`${name}-error`}
        />
      </label>
      <InputErrors name={name} errors={errors} />
    </div>
  );
}
