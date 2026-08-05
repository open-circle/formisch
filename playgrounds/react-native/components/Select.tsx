import type { FieldElementProps } from '@formisch/react-native';
import { clsx } from 'clsx';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { InputErrors } from './InputErrors.tsx';
import { InputLabel } from './InputLabel.tsx';

interface SelectProps<TValue extends string, TMultiple extends boolean>
  extends FieldElementProps {
  className?: string;
  label?: string;
  options: { label: string; value: TValue }[];
  multiple?: TMultiple;
  required?: boolean;
  input: string | string[] | null | undefined;
  errors: [string, ...string[]] | null;
  onValueChange: (input: TMultiple extends true ? TValue[] : TValue) => void;
}

/**
 * Select field that allows users to select predefined values.
 *
 * Hint: Unlike the DOM playgrounds the options are rendered as a pressable
 * list and the new value is passed explicitly via `onValueChange`, as React
 * Native has no select element.
 */
export function Select<
  TValue extends string,
  TMultiple extends boolean = false,
>({
  options,
  label,
  input,
  errors,
  className,
  multiple,
  required,
  onValueChange,
  ref,
  onFocus,
}: SelectProps<TValue, TMultiple>) {
  // Create computed value of selected values
  const values = useMemo(
    () =>
      Array.isArray(input)
        ? input
        : input && typeof input === 'string'
          ? [input]
          : [],
    [input]
  );

  return (
    <View className={clsx('px-8 lg:px-10', className)} ref={ref}>
      <InputLabel label={label} required={required} />
      <View
        className={clsx(
          'rounded-2xl border-2',
          errors
            ? 'border-red-600/50 dark:border-red-400/50'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
        )}
        aria-invalid={!!errors}
      >
        {options.map(({ label, value }, index) => {
          const selected = values.includes(value);
          return (
            <Pressable
              key={value}
              className={clsx(
                'h-14 flex-row items-center justify-between px-5 md:h-16 lg:h-[70px] lg:px-6',
                index > 0 &&
                  'border-t-2 border-t-slate-200 dark:border-t-slate-800'
              )}
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={selected}
              onPress={() => {
                // Mark the field as touched, as press does not trigger focus
                onFocus();
                // Hint: The cast is required because TypeScript cannot narrow
                // the generic conditional type by the runtime `multiple` check
                onValueChange(
                  (multiple
                    ? selected
                      ? values.filter((item) => item !== value)
                      : [...values, value]
                    : value) as TMultiple extends true ? TValue[] : TValue
                );
              }}
            >
              <Text
                className={clsx(
                  'font-lexend md:text-lg lg:text-xl',
                  selected
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                {label}
              </Text>
              {selected && (
                <Text className="font-bold text-sky-600 md:text-lg lg:text-xl dark:text-sky-400">
                  ✓
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
      <InputErrors errors={errors} />
    </View>
  );
}
