import type { FieldElementProps } from '@formisch/react';

interface RadioProps extends FieldElementProps {
  className?: string;
  label: string;
  value: string;
  checked: boolean;
}

/**
 * Simple radio button input. Should be used inside a RadioGroup component.
 */
export function Radio({ label, checked, ...props }: RadioProps) {
  return (
    <label className="flex cursor-pointer items-center space-x-3 font-medium select-none md:text-lg lg:text-xl">
      <input
        {...props}
        className="h-4 w-4 cursor-pointer lg:h-5 lg:w-5"
        type="radio"
        checked={checked}
      />
      <span>{label}</span>
    </label>
  );
}
