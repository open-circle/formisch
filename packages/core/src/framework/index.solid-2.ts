// Hint: Solid 2 is imported through the `solid-js-2` pnpm alias because this
// package also depends on Solid 1 for `index.solid.ts`. The build renames the
// alias back to `solid-js` in the published output.
import { createSignal as signal } from 'solid-js-2';
import type { Signal } from '../types/signal/index.ts';
import type { Framework } from './index.ts';

export { createUniqueId as createId, untrack } from 'solid-js-2';

/**
 * The current framework being used.
 */
export const framework: Framework = 'solid-2';

/**
 * Batches multiple signal updates into a single update cycle.
 *
 * Hint: Solid 2 has no `batch` function. Every write is staged and committed
 * on the next microtask, so consecutive writes are already batched and this
 * function only has to execute the callback.
 *
 * @param fn The function to execute in batch.
 *
 * @returns The return value of the function.
 */
export function batch<T>(fn: () => T): T {
  return fn();
}

/**
 * Creates a reactive signal with an initial value.
 *
 * @param initialValue The initial value.
 *
 * @returns The created signal.
 */
// @__NO_SIDE_EFFECTS__
export function createSignal<T>(initialValue: T): Signal<T> {
  // Hint: Solid 2 stages writes, so reading a Solid signal right after writing
  // it still returns the previous value until the queue is flushed. The core
  // relies on reading its own writes synchronously, for example when
  // validating right after setting an input. Therefore, the value is kept in
  // this closure and the Solid signal only tracks a version number that
  // notifies dependents. This also avoids Solid 2 treating function values as
  // computations. `ownedWrite` permits writes inside owned scopes, such as the
  // initial validation that runs in the component body.
  const [trackVersion, setVersion] = signal(0, { ownedWrite: true });
  let currentValue = initialValue;
  let version = 0;
  return {
    get value() {
      trackVersion();
      return currentValue;
    },
    set value(nextValue: T) {
      // Like Solid 1, identical values do not notify dependents
      if (nextValue !== currentValue) {
        currentValue = nextValue;
        setVersion(++version);
      }
    },
  };
}
