import { latest, createSignal as signal } from 'solid-js';
import type { Signal } from '../types/signal/index.ts';
import type { Framework } from './index.ts';

export { createUniqueId as createId, untrack } from 'solid-js';

/**
 * Batches signal updates using Solid's automatic update scheduling.
 *
 * @param fn The function to execute in batch.
 *
 * @returns The return value of the function.
 */
export function batch<T>(fn: () => T): T {
  // Solid 2 already batches writes. Flushing here would split nested batches
  // and is forbidden inside actions; the adapter's value is immediate.
  return fn();
}

/**
 * The current framework being used.
 */
export const framework: Framework = 'solid';

/**
 * Creates a reactive signal with an initial value.
 *
 * @param initialValue The initial value.
 *
 * @returns The created signal.
 */
// @__NO_SIDE_EFFECTS__
export function createSignal<T>(initialValue: T): Signal<T> {
  let currentValue = initialValue;
  // An initial function would create a writable memo in Solid 2. Use a plain
  // container so every Formisch value, including a function, stays a value.
  const [getSignal, setSignal] = signal(
    { value: initialValue },
    {
      ownedWrite: true,
      equals: (previous, next) => previous.value === next.value,
    }
  );
  return {
    get value() {
      // Track Solid's latest lane, but retain the core's synchronous value:
      // even latest() hides ambient writes until Solid's next flush.
      latest(getSignal);
      return currentValue;
    },
    set value(nextValue: T) {
      currentValue = nextValue;
      setSignal({ value: nextValue });
    },
  };
}
