import clsx from 'clsx';
import type { Child } from 'hono/jsx';

type ButtonGroupProps = {
  class?: string;
  children: Child;
};

/**
 * Button group displays multiple related actions side-by-side and helps with
 * arrangement and spacing.
 */
export function ButtonGroup({ children, ...props }: ButtonGroupProps) {
  return (
    <div
      class={clsx('flex flex-wrap gap-6 px-8 lg:gap-8 lg:px-10', props.class)}
    >
      {children}
    </div>
  );
}
