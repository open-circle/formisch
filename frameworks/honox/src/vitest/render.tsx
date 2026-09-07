import { useState } from 'hono/jsx';
import { flushSync, render as honoRender } from 'hono/jsx/dom';
import type { JSX } from 'hono/jsx/jsx-runtime';

/**
 * Render result interface.
 */
export interface RenderResult {
  /**
   * The container the JSX node was mounted into.
   */
  readonly container: HTMLDivElement;
  /**
   * Unmounts the JSX node and removes the container.
   */
  readonly unmount: () => void;
}

/**
 * The unmount functions of the containers that are still mounted.
 */
const mountedUnmountFns = new Set<() => void>();

/**
 * Mounts a hono/jsx element into a fresh container appended to `document.body`.
 *
 * Hint: There is no official `@testing-library/hono` package yet, so this is a
 * small stand-in for the `render` helper the other framework packages get from
 * `@testing-library/*`.
 */
export function renderHono(jsxNode: JSX.Element): RenderResult {
  const container = document.createElement('div');
  document.body.appendChild(container);

  // Hint: Rendering into the container a second time builds a fresh tree
  // instead of diffing against the mounted one, which would drop the DOM
  // without ever running the effect cleanups. Toggling the children of a root
  // component makes hono/jsx remove the subtree the way it does in an app.
  let setMounted: (mounted: boolean) => void = () => {};
  function Root(): JSX.Element | null {
    const [mounted, setMountedState] = useState(true);
    setMounted = setMountedState;
    return mounted ? jsxNode : null;
  }
  honoRender(<Root />, container);

  const unmount = (): void => {
    flushSync(() => setMounted(false));
    container.remove();
    mountedUnmountFns.delete(unmount);
  };
  mountedUnmountFns.add(unmount);

  return { container, unmount };
}

/**
 * Unmounts every container that is still mounted.
 */
export function cleanup(): void {
  for (const unmount of mountedUnmountFns) {
    unmount();
  }
}
