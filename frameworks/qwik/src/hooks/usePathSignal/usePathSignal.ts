import type { Path } from '@formisch/core/qwik';
import { type Signal, useSignal } from '@qwik.dev/core';

// @__NO_SIDE_EFFECTS__
function isEqual(a: Path, b: Path): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Creates a readonly signal for a field path. Compares new path values for
 * equality to avoid unnecessary updates to the signal.
 *
 * @param path The field path to wrap in a signal.
 *
 * @returns A readonly signal containing the field path.
 */
// @__NO_SIDE_EFFECTS__
export function usePathSignal<TPath extends Path>(
  path: TPath
): Readonly<Signal<TPath>> {
  const signal = useSignal(path);
  if (!isEqual(signal.value, path)) {
    signal.value = path;
  }
  return signal;
}
