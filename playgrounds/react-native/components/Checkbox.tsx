import type { FieldElementProps } from '@formisch/react-native';
import { clsx } from 'clsx';
import { Pressable, Text, View } from 'react-native';
import { InputErrors } from './InputErrors.tsx';

interface CheckboxProps extends FieldElementProps {
  className?: string;
  padding?: 'none';
  label?: string;
  required?: boolean;
  input: boolean | undefined;
  errors: [string, ...string[]] | null;
  onValueChange: (input: boolean) => void;
}

/**
 * Checkbox that allows users to select an option. The label next to the
 * checkbox describes the selection option.
 *
 * Hint: Unlike the DOM playgrounds the new value is passed explicitly via
 * `onValueChange`, as React Native has no checkbox element whose state could
 * be read from a change event.
 */
export function Checkbox({
  label,
  input,
  errors,
  className,
  padding,
  required,
  onValueChange,
  ref,
  onFocus,
}: CheckboxProps) {
  return (
    <View className={clsx(padding !== 'none' && 'px-8 lg:px-10', className)}>
      <Pressable
        ref={ref}
        className="flex-row items-center gap-4"
        role="checkbox"
        aria-checked={!!input}
        aria-invalid={!!errors}
        onPress={() => {
          // Mark the field as touched, as press does not trigger focus
          onFocus();
          onValueChange(!input);
        }}
      >
        <View
          className={clsx(
            'h-4 w-4 items-center justify-center rounded border-2 lg:h-5 lg:w-5',
            input
              ? 'border-sky-600 bg-sky-600 dark:border-sky-400 dark:bg-sky-400'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-gray-900'
          )}
        >
          {input && (
            <Text className="text-[10px] font-bold text-white lg:text-xs dark:text-gray-900">
              ✓
            </Text>
          )}
        </View>
        <Text className="font-lexend-medium select-none text-slate-600 md:text-lg lg:text-xl dark:text-slate-400">
          {label}
          {required && (
            <Text className="text-red-600 dark:text-red-400"> *</Text>
          )}
        </Text>
      </Pressable>
      <InputErrors errors={errors} />
    </View>
  );
}
