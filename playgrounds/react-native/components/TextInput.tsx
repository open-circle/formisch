import type { FieldElementProps } from '@formisch/react-native';
import { clsx } from 'clsx';
import {
  type KeyboardTypeOptions,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { InputErrors } from './InputErrors.tsx';
import { InputLabel } from './InputLabel.tsx';

interface TextInputProps extends FieldElementProps {
  className?: string;
  padding?: 'none';
  type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'number' | 'date';
  label?: string;
  placeholder?: string;
  required?: boolean;
  input: string | undefined;
  errors: [string, ...string[]] | null;
}

/**
 * The keyboard type used for each input type.
 */
const KEYBOARD_TYPES: Record<TextInputProps['type'], KeyboardTypeOptions> = {
  text: 'default',
  email: 'email-address',
  tel: 'phone-pad',
  password: 'default',
  url: 'url',
  number: 'decimal-pad',
  date: 'numbers-and-punctuation',
};

/**
 * Text input field that users can type into. Various decorations can be
 * displayed in or around the field to communicate the entry requirements.
 */
export function TextInput({
  label,
  input,
  errors,
  className,
  padding,
  type,
  placeholder,
  required,
  ...props
}: TextInputProps) {
  return (
    <View className={clsx(padding !== 'none' && 'px-8 lg:px-10', className)}>
      <InputLabel label={label} required={required} />
      <RNTextInput
        {...props}
        className={clsx(
          'font-lexend h-14 w-full rounded-2xl border-2 bg-white px-5 text-slate-600 outline-none placeholder:text-slate-500 md:h-16 md:text-lg lg:h-[70px] lg:px-6 lg:text-xl dark:bg-gray-900 dark:text-slate-400',
          errors
            ? 'border-red-600/50 dark:border-red-400/50'
            : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50'
        )}
        value={input ?? ''}
        placeholder={
          placeholder ?? (type === 'date' ? 'YYYY-MM-DD' : undefined)
        }
        keyboardType={KEYBOARD_TYPES[type]}
        autoCapitalize={type === 'email' ? 'none' : undefined}
        autoComplete={
          type === 'email'
            ? 'email'
            : type === 'password'
              ? 'current-password'
              : undefined
        }
        secureTextEntry={type === 'password'}
        aria-invalid={!!errors}
      />
      <InputErrors errors={errors} />
    </View>
  );
}
