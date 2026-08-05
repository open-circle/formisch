import { type FormStore, reset } from '@formisch/react-native';
import { Text, View } from 'react-native';
import { ActionButton } from './ActionButton.tsx';

type FormHeaderProps = {
  of: FormStore;
  heading: string;
  onSubmit: () => Promise<void>;
};

/**
 * Form header with heading and buttons to reset and submit the form.
 *
 * Hint: Unlike the DOM playgrounds the submit handler is passed explicitly,
 * as React Native has no form element with a native submit event.
 */
export function FormHeader({ of: form, heading, onSubmit }: FormHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-8 lg:px-10">
      <Text className="font-lexend text-2xl text-slate-900 md:text-3xl lg:text-4xl dark:text-slate-200">
        {heading}
      </Text>
      <View className="hidden lg:flex lg:flex-row lg:gap-8">
        <ActionButton
          variant="secondary"
          label="Reset"
          onPress={() => reset(form)}
        />
        <ActionButton variant="primary" label="Submit" onPress={onSubmit} />
      </View>
    </View>
  );
}
