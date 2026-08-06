import { ActivityIndicator } from 'react-native';

type SpinnerProps = {
  color: string;
};

/**
 * Spinner provide a visual cue that an action is being processed.
 */
export function Spinner({ color }: SpinnerProps) {
  return <ActivityIndicator size="small" color={color} aria-label="Loading" />;
}
