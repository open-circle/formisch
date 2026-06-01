import type { FieldElementProps } from '@formisch/preact';
import { forwardRef } from 'preact/compat';

interface RadioProps extends FieldElementProps {
  class?: string;
  label: string;
  value: string;
  checked: boolean;
}

/**
 * Simple radio button input. Should be used inside a RadioGroup component.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, checked, ...props }: RadioProps) => {
    return (
      <label class="flex cursor-pointer items-center space-x-3 font-medium select-none md:text-lg lg:text-xl">
        <input
          {...props}
          class="h-4 w-4 cursor-pointer lg:h-5 lg:w-5"
          type="radio"
          checked={checked}
        />
        <span>{label}</span>
      </label>
    );
  }
);
