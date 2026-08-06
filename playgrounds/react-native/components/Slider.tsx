import type { FieldElementProps } from '@formisch/react-native';
import RNSlider from '@react-native-community/slider';
import { clsx } from 'clsx';
import { useColorScheme, View } from 'react-native';
import { InputErrors } from './InputErrors.tsx';
import { InputLabel } from './InputLabel.tsx';

interface SliderProps extends FieldElementProps {
  className?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  input: number | undefined;
  errors: [string, ...string[]] | null;
  onValueChange: (input: number) => void;
}

/**
 * Range slider that allows users to select predefined numbers.
 *
 * Hint: Unlike the DOM playgrounds the value is a number instead of a string,
 * as React Native's slider emits real numbers.
 */
export function Slider({
  label,
  input,
  errors,
  className,
  min,
  max,
  step,
  required,
  onValueChange,
  ref,
  onFocus,
  onBlur,
}: SliderProps) {
  // Use color scheme for the slider colors
  const colorScheme = useColorScheme();
  const activeColor = colorScheme === 'dark' ? '#38bdf8' : '#0284c7'; // sky-400 / sky-600
  const inactiveColor = colorScheme === 'dark' ? '#1e293b' : '#e2e8f0'; // slate-800 / slate-200

  return (
    <View className={clsx('px-8 lg:px-10', className)} ref={ref}>
      <InputLabel label={label} required={required} />
      <RNSlider
        style={{ width: '100%', height: 40 }}
        value={input}
        minimumValue={min ?? 0}
        maximumValue={max ?? 100}
        step={step ?? 1}
        minimumTrackTintColor={activeColor}
        maximumTrackTintColor={inactiveColor}
        thumbTintColor={activeColor}
        onSlidingStart={() => onFocus()}
        onSlidingComplete={() => onBlur()}
        onValueChange={onValueChange}
      />
      <InputErrors errors={errors} />
    </View>
  );
}
