import type { FieldElementProps } from '@formisch/react-native';
import { clsx } from 'clsx';
import { View } from 'react-native';
import { InputErrors } from './InputErrors.tsx';
import { InputLabel } from './InputLabel.tsx';
import { Radio } from './Radio.tsx';

interface RadioGroupProps extends FieldElementProps {
  className?: string;
  label?: string;
  options: { label: string; value: string }[];
  required?: boolean;
  input: string | undefined;
  errors: [string, ...string[]] | null;
  onValueChange: (input: string) => void;
}

/**
 * Radio group that allows users to select a single option from a list.
 *
 * Hint: Unlike the DOM playgrounds the selected value is passed explicitly
 * via `onValueChange`, as React Native has no radio element whose state could
 * be read from a change event.
 */
export function RadioGroup({
  label,
  options,
  input,
  errors,
  className,
  required,
  onValueChange,
  ref,
  onFocus,
}: RadioGroupProps) {
  return (
    <View
      className={clsx('px-8 lg:px-10', className)}
      ref={ref}
      role="radiogroup"
      aria-invalid={!!errors}
    >
      <InputLabel label={label} required={required} />
      <View className="flex-row flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800">
        {options.map(({ label, value }) => (
          <Radio
            key={value}
            label={label}
            checked={input === value}
            onPress={() => {
              // Mark the field as touched, as press does not trigger focus
              onFocus();
              onValueChange(value);
            }}
          />
        ))}
      </View>
      <InputErrors errors={errors} />
    </View>
  );
}
