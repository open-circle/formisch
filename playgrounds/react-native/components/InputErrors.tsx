import { Text } from 'react-native';
import { Expandable } from './Expandable.tsx';

type InputErrorsProps = {
  errors: [string, ...string[]] | null;
};

/**
 * Input error that tells the user what to do to fix the problem.
 */
export function InputErrors({ errors }: InputErrorsProps) {
  return (
    <Expandable expanded={!!errors}>
      <Text className="font-lexend pt-4 text-sm text-red-500 md:text-base lg:pt-5 lg:text-lg dark:text-red-400">
        {errors?.[0]}
      </Text>
    </Expandable>
  );
}
