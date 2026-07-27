import { clsx } from 'clsx';
import { Pressable, Text, View } from 'react-native';

type RadioProps = {
  label: string;
  checked: boolean;
  onPress: () => void;
};

/**
 * Simple radio button. Should be used inside a RadioGroup component.
 */
export function Radio({ label, checked, onPress }: RadioProps) {
  return (
    <Pressable
      className="flex-row items-center gap-3"
      role="radio"
      aria-checked={checked}
      onPress={onPress}
    >
      <View
        className={clsx(
          'h-4 w-4 items-center justify-center rounded-full border-2 lg:h-5 lg:w-5',
          checked
            ? 'border-sky-600 dark:border-sky-400'
            : 'border-slate-200 dark:border-slate-800'
        )}
      >
        {checked && (
          <View className="h-2 w-2 rounded-full bg-sky-600 lg:h-2.5 lg:w-2.5 dark:bg-sky-400" />
        )}
      </View>
      <Text className="font-lexend-medium select-none text-slate-600 md:text-lg lg:text-xl dark:text-slate-400">
        {label}
      </Text>
    </Pressable>
  );
}
