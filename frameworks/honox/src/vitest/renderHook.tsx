import { useState } from 'hono/jsx';
import { flushSync } from 'hono/jsx/dom';
import { renderHono } from './render.tsx';

/**
 * Render hook result interface.
 */
export interface RenderHookResult<TValue> {
  /**
   * The latest value returned by the hook.
   */
  readonly result: { current: TValue };
  /**
   * Re-renders the host component to run the hook again.
   */
  readonly rerender: () => void;
  /**
   * Unmounts the host component.
   */
  readonly unmount: () => void;
}

/**
 * Runs a hook inside a host component and exposes its latest return value.
 *
 * Hint: There is no official `@testing-library/hono` package yet, so this is a
 * small stand-in for the `renderHook` helper the other framework packages get
 * from `@testing-library/*`.
 */
export function renderHook<TValue>(
  hook: () => TValue
): RenderHookResult<TValue> {
  const result = { current: undefined as TValue };
  let forceRerender = (): void => {};

  function HookHost(): null {
    const [, setRenderCount] = useState(0);
    forceRerender = () => setRenderCount((count) => count + 1);
    result.current = hook();
    return null;
  }

  const { unmount } = renderHono(<HookHost />);

  return {
    result,
    rerender: () => flushSync(forceRerender),
    unmount,
  };
}
