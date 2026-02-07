import type { Path } from '@formisch/core/preact';
import { type ReadonlySignal, useSignal } from '@preact/signals';

/**
 * Compares two paths for equality.
 *
 * @param a The first path.
 * @param b The second path.
 *
 * @returns Whether the paths are equal.
 */
// @__NO_SIDE_EFFECTS__
function isEqual(a: Path, b: Path): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Creates a readonly signal for a path that updates when the path changes.
 *
 * @param path The path value.
 *
 * @returns A readonly signal containing the path.
 */
// @__NO_SIDE_EFFECTS__
export function usePathSignal<TPath extends Path>(
  path: TPath
): ReadonlySignal<TPath> {
  const signal = useSignal(path);
  if (!isEqual(signal.value, path)) {
    signal.value = path;
  }
  return signal;
}
