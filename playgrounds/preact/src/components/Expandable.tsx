import { useSignal } from '@preact/signals';
import clsx from 'clsx';
import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { useEventListener } from '../hooks';

type ExpandableProps = {
  class?: string;
  id?: string;
  expanded: boolean;
  children: ComponentChildren;
};

/**
 * Wrapper component to vertically expand or collapse content.
 */
export function Expandable({
  id,
  expanded,
  children,
  ...props
}: ExpandableProps) {
  // Use element and frozen children signals
  const element = useSignal<HTMLDivElement | null>(null);
  const frozenChildren = useSignal<ComponentChildren>(children);

  // Freeze error while element collapses to prevent UI from jumping
  useEffect(() => {
    if (expanded) {
      frozenChildren.value = children;
    } else {
      const timeout = setTimeout(() => (frozenChildren.value = children), 200);
      return () => clearTimeout(timeout);
    }
  }, [expanded, children]);

  /**
   * Updates the expandable element height.
   */
  const updateElementHeight = () => {
    element.value!.style.height = `${
      expanded ? element.value!.scrollHeight : 0
    }px`;
  };

  // Expand or collapse content when expanded prop change
  useEffect(() => {
    setTimeout(updateElementHeight);
  }, [expanded]);

  // Update element height when window size change
  useEventListener('resize', () => {
    element.value!.style.maxHeight = '0';
    updateElementHeight();
    element.value!.style.maxHeight = '';
  });

  return (
    <div
      class={clsx(
        'm-0! h-0 origin-top duration-200',
        !expanded && 'invisible -translate-y-2 scale-y-75 opacity-0',
        props.class
      )}
      id={id}
      ref={(ref) => {
        element.value = ref;
      }}
      aria-hidden={!expanded}
    >
      {frozenChildren}
    </div>
  );
}
