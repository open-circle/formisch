import { makeEventListener } from '@solid-primitives/event-listener';
import clsx from 'clsx';
import {
  createEffect,
  createSignal,
  JSX,
  on,
  onCleanup,
  untrack,
} from 'solid-js';
import { isServer } from 'solid-js/web';

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
  // Use element and frozen children signals
  const [getElement, setElement] = createSignal<HTMLDivElement>();
  const [getFrozenChildren, setFrozenChildren] = createSignal<JSX.Element>(
    props.children
  );

  // Freeze error while element collapses to prevent UI from jumping
  createEffect(() => {
    const children = untrack(() => props.children);
    if (props.expanded) {
      setFrozenChildren(children);
    } else {
      const timeout = setTimeout(() => setFrozenChildren(children), 200);
      onCleanup(() => clearTimeout(timeout));
    }
  });

  /**
   * Updates the expandable element height.
   */
  const updateElementHeight = () => {
    getElement()!.style.height = `${
      props.expanded ? getElement()!.scrollHeight : 0
    }px`;
  };

  // Expand or collapse content when expanded prop change
  createEffect(
    on(
      () => props.expanded,
      () => {
        setTimeout(updateElementHeight);
      }
    )
  );

  // Update element height when window size change
  if (!isServer) {
    makeEventListener(window, 'resize', () => {
      getElement()!.style.maxHeight = '0';
      updateElementHeight();
      getElement()!.style.maxHeight = '';
    });
  }

  return (
    <div
      class={clsx(
        'm-0! h-0 origin-top duration-200',
        !props.expanded && 'invisible -translate-y-2 scale-y-75 opacity-0',
        props.class
      )}
      id={props.id}
      ref={setElement}
      aria-hidden={!props.expanded}
    >
      {getFrozenChildren()}
    </div>
  );
}
