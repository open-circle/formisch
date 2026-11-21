import { untrack } from '../../framework/index.ts';
import type { Signal } from '../../types/index.ts';

/**
 * Returns the current value of a signal without creating a reactive
 * dependency on it.
 *
 * @param signal The signal to read.
 *
 * @returns The current value.
 */
// @__NO_SIDE_EFFECTS__
export function getUntrackedValue<T>(signal: Signal<T>): T {
  return untrack(() => signal.value);
}
