// Hint: The React Native types are imported directly because imports within
// framework-specific files are not rewritten at build time, and the linter
// type-checks this file against the React Native `FieldElement` contract.
import type { InternalFieldStore } from '../../types/field/field.react-native.ts';

/**
 * Focuses the first focusable element of a field store. The elements are
 * tried in order and the first one that actually receives focus wins. React
 * Native has no `activeElement` equivalent, so focus is verified via the
 * element's own `isFocused` method (implemented by `TextInput`) and assumed
 * to have succeeded for elements that cannot report it.
 *
 * @param internalFieldStore The field store to focus.
 *
 * @returns Whether an element was focused.
 */
export function focusFieldElement(
  internalFieldStore: InternalFieldStore
): boolean {
  // Try to focus each element and stop at the first that receives focus, so
  // the focus is not consumed by an element that cannot be focused
  for (const element of internalFieldStore.elements) {
    element.focus();
    // Verify focus if the element can report it, otherwise trust the call
    if (!element.isFocused || element.isFocused()) {
      return true;
    }
  }

  // Otherwise, no element could be focused
  return false;
}
