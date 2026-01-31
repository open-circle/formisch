import type { InternalFieldStore } from '../../types/index.ts';

/**
 * Returns whether the specified boolean property is true for the field store
 * or any of its nested children. Recursively checks arrays and objects.
 *
 * @param internalFieldStore The field store to check.
 * @param type The boolean property type to check.
 *
 * @returns Whether the property is true.
 */
// @__NO_SIDE_EFFECTS__
export function getFieldBool(
  internalFieldStore: InternalFieldStore,
  type: 'errors' | 'isTouched' | 'isDirty'
): boolean {
  // If current field has property set to true, return true
  if (internalFieldStore[type].value) {
    return true;
  }

  // If field store is array, check all children
  if (internalFieldStore.kind === 'array') {
    // Check each array item
    for (
      let index = 0;
      index < internalFieldStore.items.value.length;
      index++
    ) {
      // If any child has property set to true, return true
      if (getFieldBool(internalFieldStore.children[index], type)) {
        return true;
      }
    }

    // Otherwise, return false
    return false;
  }

  // If field store is object, check all children
  if (internalFieldStore.kind == 'object') {
    // Check each object property
    for (const key in internalFieldStore.children) {
      // If any child has property set to true, return true
      if (getFieldBool(internalFieldStore.children[key], type)) {
        return true;
      }
    }

    // Otherwise, return false
    return false;
  }

  // Otherwise, for value fields, property is false
  return false;
}
