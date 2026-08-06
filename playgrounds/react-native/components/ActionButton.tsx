import { clsx } from 'clsx';
import { useState } from 'react';
import { Pressable, Text, useColorScheme } from 'react-native';
import { Spinner } from './Spinner.tsx';

type ActionButtonProps = {
  variant: 'primary' | 'secondary';
  label: string;
  onPress: () => unknown;
};

/**
 * Button that is used for navigation, to confirm form entries or perform
 * individual actions.
 */
export function ActionButton({ variant, label, onPress }: ActionButtonProps) {
  // Use loading state
  const [loading, setLoading] = useState(false);

  // Use color scheme for the spinner color
  const colorScheme = useColorScheme();

  return (
    <Pressable
      className={clsx(
        'items-center justify-center rounded-2xl px-5 py-2.5 lg:px-6 lg:py-3',
        variant === 'primary' &&
          'bg-sky-600 hover:bg-sky-600/80 active:bg-sky-600/80 dark:bg-sky-400 dark:hover:bg-sky-400/80 dark:active:bg-sky-400/80',
        variant === 'secondary' &&
          'bg-sky-600/10 hover:bg-sky-600/20 active:bg-sky-600/20 dark:bg-sky-400/10 dark:hover:bg-sky-400/20 dark:active:bg-sky-400/20'
      )}
      disabled={loading}
      // Start and stop loading if function is async
      onPress={async () => {
        setLoading(true);
        await onPress();
        setLoading(false);
      }}
    >
      {loading ? (
        <Spinner
          color={
            variant === 'primary'
              ? colorScheme === 'dark'
                ? '#111827' // gray-900
                : '#ffffff' // white
              : colorScheme === 'dark'
                ? '#38bdf8' // sky-400
                : '#0284c7' // sky-600
          }
        />
      ) : (
        <Text
          className={clsx(
            'font-lexend-medium md:text-lg lg:text-xl',
            variant === 'primary' && 'text-white dark:text-gray-900',
            variant === 'secondary' && 'text-sky-600 dark:text-sky-400'
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
