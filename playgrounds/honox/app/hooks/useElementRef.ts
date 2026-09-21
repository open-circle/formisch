import { type RefObject, useCallback, useRef } from 'hono/jsx';

/**
 * Returns a ref object together with a callback ref that fills it.
 *
 * Hint: While server rendering, hono/jsx only drops `ref` props that are
 * functions. A plain ref object ends up in the markup as `ref="[object
 * Object]"`, so the callback is what gets passed to the element.
 */
export function useElementRef<T extends HTMLElement>(): [
  RefObject<T>,
  (element: T | null) => void,
] {
  const element = useRef<T>(null);
  const setElement = useCallback((newElement: T | null) => {
    element.current = newElement;
  }, []);
  return [element, setElement];
}
