import { untrack } from '../../framework/index.ts';
import type { InternalFieldStore } from '../../types/index.ts';

/**
 * Walks through the field store and all nested children, calling the callback
 * for each field store in depth-first order.
 *
 * @param internalFieldStore The field store to walk.
 * @param callback The callback to invoke for each field store.
 */
export function walkFieldStore(
  internalFieldStore: InternalFieldStore,
  callback: (internalFieldStore: InternalFieldStore) => void
): void {
  // Invoke callback for current field store
  callback(internalFieldStore);

  // If field store is array, walk all children
  if (internalFieldStore.kind === 'array') {
    // Walk each array item
    for (
      let index = 0;
      index < untrack(() => internalFieldStore.items.value).length;
      index++
    ) {
      // Recursively walk child
      walkFieldStore(internalFieldStore.children[index], callback);
    }

    // Otherwise, if field store is object, walk all children
  } else if (internalFieldStore.kind === 'object') {
    // Walk each object property
    for (const key in internalFieldStore.children) {
      // Recursively walk child
      walkFieldStore(internalFieldStore.children[key], callback);
    }
  }
}
