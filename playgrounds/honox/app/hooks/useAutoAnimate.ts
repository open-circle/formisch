import autoAnimate from '@formkit/auto-animate';
import { useCallback } from 'hono/jsx';

/**
 * Returns a callback ref that animates the children of the referenced element
 * whenever they are added, removed or reordered.
 *
 * Hint: There is no official `@formkit/auto-animate` adapter for hono/jsx, so
 * the framework-agnostic core is wired up to a callback ref here. See
 * `useElementRef` for why a callback and not a ref object is used.
 */
export function useAutoAnimate<T extends HTMLElement = HTMLDivElement>(): (
  element: T | null
) => void {
  return useCallback((element: T | null) => {
    if (element) {
      autoAnimate(element);
    }
  }, []);
}
