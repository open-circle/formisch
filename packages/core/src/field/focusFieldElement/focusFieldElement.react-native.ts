import type { InternalFieldStore } from '../../types/index.ts';

/**
 * Focuses the first focusable element of a field store. The elements are tried
 * in order and the first one wins, so elements are registered `TextInput` refs
 * on React Native and there is no `activeElement` equivalent to confirm which
 * element actually received focus.
 *
 * @param internalFieldStore The field store to focus.
 *
 * @returns Whether an element was focused.
 */
export function focusFieldElement(
  internalFieldStore: InternalFieldStore
): boolean {
  for (const element of internalFieldStore.elements) {
    element.focus();
    return true;
  }

  // Otherwise, no element could be focused
  return false;
}
