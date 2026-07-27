import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { View } from 'react-native';

type ButtonGroupProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Button group displays multiple related actions side-by-side and helps with
 * arrangement and spacing.
 */
export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <View
      className={clsx(
        'flex-row flex-wrap gap-6 px-8 lg:gap-8 lg:px-10',
        className
      )}
    >
      {children}
    </View>
  );
}
