import type { MaybeGetter } from '../../types/index.ts';

/**
 * Unwraps a value that may be a getter function.
 *
 * @param value The value or getter function.
 *
 * @returns The unwrapped value.
 */
export function unwrap<T>(value: MaybeGetter<T>): T;
export function unwrap(value: MaybeGetter<unknown>): unknown {
  if (typeof value === 'function') {
    return value();
  }
  return value;
}
