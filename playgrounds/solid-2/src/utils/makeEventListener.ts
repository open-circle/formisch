import { onSettled } from 'solid-js';

/**
 * Adds a window event listener once the component is mounted and removes it
 * when the component is disposed.
 */
export function makeEventListener<TType extends keyof WindowEventMap>(
  target: Window,
  type: TType,
  handler: (event: WindowEventMap[TType]) => void
) {
  onSettled(() => {
    target.addEventListener(type, handler);
    return () => target.removeEventListener(type, handler);
  });
}
