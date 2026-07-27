import { type FormStore, reset } from '@formisch/react-native';
import { View } from 'react-native';
import { ActionButton } from './ActionButton.tsx';

type FormFooterProps = {
  of: FormStore;
  onSubmit: () => Promise<void>;
};

/**
 * Form footer with buttons to reset and submit the form.
 *
 * Hint: Unlike the DOM playgrounds the submit handler is passed explicitly,
 * as React Native has no form element with a native submit event.
 */
export function FormFooter({ of: form, onSubmit }: FormFooterProps) {
  return (
    <View className="flex-row gap-6 px-8 md:gap-8 lg:hidden">
      <ActionButton variant="primary" label="Submit" onPress={onSubmit} />
      <ActionButton
        variant="secondary"
        label="Reset"
        onPress={() => reset(form)}
      />
    </View>
  );
}
