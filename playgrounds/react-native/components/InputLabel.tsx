import { clsx } from 'clsx';
import { Text, View } from 'react-native';

type InputLabelProps = {
  label?: string;
  required?: boolean;
  margin?: 'none';
};

/**
 * Input label for a form field.
 */
export function InputLabel({ label, required, margin }: InputLabelProps) {
  return (
    <>
      {label && (
        <View className={clsx('flex-row', !margin && 'mb-4 lg:mb-5')}>
          <Text className="font-lexend-medium text-slate-600 md:text-lg lg:text-xl dark:text-slate-400">
            {label}
          </Text>
          {required && (
            <Text className="font-lexend-medium ml-1 text-red-600 md:text-lg lg:text-xl dark:text-red-400">
              *
            </Text>
          )}
        </View>
      )}
    </>
  );
}
