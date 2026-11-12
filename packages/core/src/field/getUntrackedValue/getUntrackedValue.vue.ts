import type { Signal } from '../../types/index.ts';

// Hint: This framework-specific implementation exists because Vue does not
// expose a public `untrack` API. Formisch creates its Vue signals with
// `shallowRef`, which stores the current value in `_value`. Reading it
// directly avoids subscribing an enclosing computed or watcher to the state
// that setting an input compares with. The public `value` fallback preserves
// the comparison, with a tracked read, if Vue removes this internal property
// in the future.

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
  // Hint: The `in` check is used instead of `??` because the current value
  // can be `undefined` or `null`.
  return '_value' in signal ? (signal._value as T) : signal.value;
}
