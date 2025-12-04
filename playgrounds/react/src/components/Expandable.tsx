import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener } from '../hooks';

type ExpandableProps = {
  className?: string;
  id?: string;
  expanded: boolean;
  children: ReactNode;
};

/**
 * Wrapper component to vertically expand or collapse content.
 */
export function Expandable({
  id,
  expanded,
  children,
  className,
}: ExpandableProps) {
  // Use element ref and frozen children state
  const element = useRef<HTMLDivElement>(null);
  const [frozenChildren, setFrozenChildren] = useState<ReactNode>(children);

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
      className={clsx(
        'm-0! h-0 origin-top duration-200',
        !expanded && 'invisible -translate-y-2 scale-y-75 opacity-0',
        className
      )}
      id={id}
      ref={element}
      aria-hidden={!expanded}
    >
      {frozenChildren}
    </div>
  );
}
