import { effect, effectScope } from 'vue';
import type { Signal } from '../../types/index.ts';

// Hint: This framework-specific implementation exists because Vue does not
// expose a public `untrack` API. Formisch creates its Vue signals with
// `shallowRef`, which stores the current value in `_value`. Reading it
// directly avoids subscribing an enclosing computed or watcher to the state
// that setting an input compares with. If Vue removes this internal property
// in the future, the value is read in an effect of its own instead, so that
// the read is still not tracked by an enclosing one.

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
  // If signal has internal value, return it
  // Hint: The `in` check is used instead of `??` because the current value
  // can be `undefined` or `null`.
  if ('_value' in signal) {
    return signal._value as T;
  }

  // Otherwise, read value in effect of detached scope and stop it
  // Hint: The read subscribes only this temporary effect. Stopping the
  // detached scope removes it again, so nothing is left behind in an
  // enclosing scope.
  let value!: T;
  const scope = effectScope(true);
  try {
    scope.run(() =>
      effect(() => {
        value = signal.value;
      })
    );
  } finally {
    scope.stop();
  }
  return value;
}
