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
  // Svelte's render() does not propagate the Hook component's generic, so the
  // onResult callback is typed against `unknown` here; the cast is safe
  // because both sides are owned by this helper.
  const view = render(Hook, {
    props: {
      run: hook as () => unknown,
      onResult: (value: unknown) => {
        result.current = value as T;
      },
    },
  });
  return { result, unmount: () => view.unmount() };
}
