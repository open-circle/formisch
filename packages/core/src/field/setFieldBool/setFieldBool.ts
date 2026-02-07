import { batch, untrack } from '../../framework/index.ts';
import type { InternalFieldStore } from '../../types/index.ts';

/**
 * Sets the specified boolean property for the field store and all nested
 * children. Recursively updates arrays and objects.
 *
 * @param internalFieldStore The field store to update.
 * @param type The boolean property type to set.
 * @param bool The boolean value to set.
 */
export function setFieldBool(
  internalFieldStore: InternalFieldStore,
  type: 'isTouched' | 'isDirty',
  bool: boolean
): void {
  // Batch all state updates for optimal reactivity performance
  batch(() => {
    // If field store is array, set property on self and children
    if (internalFieldStore.kind === 'array') {
      // Set property on current field
      internalFieldStore[type].value = bool;

      // Set property on each array item
      for (
        let index = 0;
        index < untrack(() => internalFieldStore.items.value).length;
        index++
      ) {
        // Recursively set property on child
        setFieldBool(internalFieldStore.children[index], type, bool);
      }

      // Otherwise, if field store is object, set property on children
    } else if (internalFieldStore.kind == 'object') {
      // Set property on each object property
      for (const key in internalFieldStore.children) {
        // Recursively set property on child
        setFieldBool(internalFieldStore.children[key], type, bool);
      }

      // Otherwise, set property on value field
    } else {
      internalFieldStore[type].value = bool;
    }
  });
}
