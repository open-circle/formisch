import clsx from 'clsx';
import type { Child } from 'hono/jsx';
import { useCallback, useEffect, useState } from 'hono/jsx';
import { useElementRef, useEventListener } from '../hooks';

type ExpandableProps = {
  class?: string;
  id?: string;
  expanded: boolean;
  children: Child;
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
  // Use element ref and frozen children state
  const [element, setElement] = useElementRef<HTMLDivElement>();
  const [frozenChildren, setFrozenChildren] = useState<Child>(children);

  // Freeze error while element collapses to prevent UI from jumping
  useEffect(() => {
    if (expanded) {
      setFrozenChildren(children);
    } else {
      const timeout = setTimeout(() => setFrozenChildren(children), 200);
      return () => clearTimeout(timeout);
    }
  }, [expanded, children]);

  /**
   * Updates the expandable element height.
   */
  const updateElementHeight = useCallback(() => {
    if (element.current) {
      element.current.style.height = `${
        expanded ? element.current.scrollHeight : 0
      }px`;
    }
  }, [expanded]);

  // Expand or collapse content when expanded prop change
  useEffect(() => {
    setTimeout(updateElementHeight);
  }, [expanded, updateElementHeight]);

  // Update element height when window size change
  useEventListener('resize', () => {
    if (element.current) {
      element.current.style.maxHeight = '0';
      updateElementHeight();
      element.current.style.maxHeight = '';
    }
  });

  return (
    <div
      class={clsx(
        'm-0! h-0 origin-top duration-200',
        !expanded && 'invisible -translate-y-2 scale-y-75 opacity-0',
        props.class
      )}
      id={id}
      ref={setElement}
      aria-hidden={!expanded}
    >
      {frozenChildren}
    </div>
  );
}
