import autoAnimate from '@formkit/auto-animate';
import { useCallback } from 'hono/jsx';

/**
 * Returns a callback ref that animates the children of the referenced element
 * whenever they are added, removed or reordered.
 *
 * Hint: There is no official `@formkit/auto-animate` adapter for hono/jsx, so
 * the framework-agnostic core is wired up to a callback ref here. Like the
 * React adapter, the ref is returned in a tuple. See `useElementRef` for why a
 * callback and not a ref object is used.
 */
export function useAutoAnimate<T extends HTMLElement = HTMLDivElement>(): [
  (element: T | null) => (() => void) | undefined,
] {
  const ref = useCallback((element: T | null) => {
    if (element) {
      // Hint: hono/jsx calls the returned function when the element is removed
      const controller = autoAnimate(element);
      return () => controller.destroy?.();
    }
  }, []);
  return [ref];
}
