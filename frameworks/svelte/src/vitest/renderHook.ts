import { render } from '@testing-library/svelte';
import Hook from './Hook.svelte';

/**
 * Mounts a Svelte host component that invokes the hook in component context
 * and returns the hook's result via a callback.
 *
 * @param hook The rune-based factory to invoke inside a Svelte component.
 *
 * @returns An object with `result.current` and `unmount`.
 */
export function renderHook<T>(hook: () => T): {
  result: { current: T };
  unmount: () => void;
} {
  const result = { current: undefined as unknown as T };
  const view = render(Hook, {
    props: {
      run: hook,
      onResult: (value: T) => {
        result.current = value;
      },
    },
  });
  return { result, unmount: () => view.unmount() };
}
