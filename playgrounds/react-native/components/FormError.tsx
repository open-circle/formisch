import type { FormStore } from '@formisch/react-native';
import { clsx } from 'clsx';
import { Text } from 'react-native';
import { Expandable } from './Expandable.tsx';

type FormErrorProps = {
  of: FormStore;
  className?: string;
};

/**
 * Error component usually used at the end of a form to provide feedback to the
 * user.
 */
export function FormError({ of: form, className }: FormErrorProps) {
  return (
    <Expandable expanded={!!form.errors}>
      <Text
        className={clsx(
          'font-lexend px-8 text-red-500 md:text-lg lg:px-10 lg:text-xl dark:text-red-400',
          className
        )}
      >
        {form.errors?.[0]}
      </Text>
    </Expandable>
  );
}
