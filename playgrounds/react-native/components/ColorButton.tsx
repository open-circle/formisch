import { clsx } from 'clsx';
import { Pressable, Text } from 'react-native';

type ColorButtonProps = {
  color: 'green' | 'yellow' | 'purple' | 'blue' | 'red';
  label: string;
  onPress: () => void;
  width?: 'auto';
};

/**
 * Button with a specified color that is used for demo purposes in our
 * playground.
 */
export function ColorButton({
  color,
  label,
  onPress,
  width,
}: ColorButtonProps) {
  return (
    <Pressable
      className={clsx(
        'h-14 items-center justify-center rounded-2xl border-2 bg-white px-5 md:h-16 lg:h-[70px] lg:px-6 dark:bg-gray-900',
        color === 'green' &&
          'border-emerald-600/20 hover:bg-emerald-600/10 active:bg-emerald-600/10 dark:border-emerald-400/20 dark:hover:bg-emerald-400/10 dark:active:bg-emerald-400/10',
        color === 'yellow' &&
          'border-yellow-600/20 hover:bg-yellow-600/10 active:bg-yellow-600/10 dark:border-amber-300/20 dark:hover:bg-amber-300/10 dark:active:bg-amber-300/10',
        color === 'purple' &&
          'border-purple-600/20 hover:bg-purple-600/10 active:bg-purple-600/10 dark:border-purple-400/20 dark:hover:bg-purple-400/10 dark:active:bg-purple-400/10',
        color === 'blue' &&
          'border-sky-600/20 hover:bg-sky-600/10 active:bg-sky-600/10 dark:border-sky-400/20 dark:hover:bg-sky-400/10 dark:active:bg-sky-400/10',
        color === 'red' &&
          'border-red-600/20 hover:bg-red-600/10 active:bg-red-600/10 dark:border-red-400/20 dark:hover:bg-red-400/10 dark:active:bg-red-400/10',
        width !== 'auto' && 'w-full md:w-auto'
      )}
      onPress={onPress}
    >
      <Text
        className={clsx(
          'font-lexend-medium md:text-lg lg:text-xl',
          color === 'green' && 'text-emerald-600 dark:text-emerald-400',
          color === 'yellow' && 'text-yellow-600 dark:text-amber-300',
          color === 'purple' && 'text-purple-600 dark:text-purple-400',
          color === 'blue' && 'text-sky-600 dark:text-sky-400',
          color === 'red' && 'text-red-600 dark:text-red-400'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
