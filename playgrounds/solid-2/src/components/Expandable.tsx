import type { JSX } from '@solidjs/web';
import clsx from 'clsx';
import { children, createEffect, createSignal, untrack } from 'solid-js';
import { makeEventListener } from '~/utils';

type ExpandableProps = {
  class?: string;
  id?: string;
  expanded: boolean;
  children: JSX.Element;
};

/**
 * Wrapper component to vertically expand or collapse content.
 */
export function Expandable(props: ExpandableProps) {
  // Use element variable, resolved children and frozen children signal
  let element!: HTMLDivElement;
  const getChildren = children(() => props.children);
  const [getFrozenChildren, setFrozenChildren] = createSignal<JSX.Element>();

  // Freeze error while element collapses to prevent UI from jumping
  createEffect(
    () => props.expanded,
    (expanded) => {
      // Children are read once per change of the expanded state
      const resolvedChildren = untrack(getChildren);
      if (expanded) {
        setFrozenChildren(() => resolvedChildren);
      } else {
        const timeout = setTimeout(
          () => setFrozenChildren(() => resolvedChildren),
          200
        );
        return () => clearTimeout(timeout);
      }
    }
  );

  /**
   * Updates the expandable element height.
   */
  const updateElementHeight = () => {
    element.style.height = `${props.expanded ? element.scrollHeight : 0}px`;
  };

  // Expand or collapse content when expanded prop change
  createEffect(
    () => props.expanded,
    () => {
      setTimeout(updateElementHeight);
    }
  );

  // Update element height when window size change
  makeEventListener(window, 'resize', () => {
    element.style.maxHeight = '0';
    updateElementHeight();
    element.style.maxHeight = '';
  });

  return (
    <div
      class={clsx(
        'm-0! h-0 origin-top duration-200',
        !props.expanded && 'invisible -translate-y-2 scale-y-75 opacity-0',
        props.class
      )}
      id={props.id}
      ref={(el) => (element = el)}
      aria-hidden={props.expanded ? 'false' : 'true'}
    >
      {getFrozenChildren()}
    </div>
  );
}
