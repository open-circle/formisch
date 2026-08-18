import {
  type InternalFieldStore,
  type InternalFormStore,
  type Path,
  walkFieldStore,
} from '@formisch/core';

/**
 * Returns the first field store with errors at a path or in its descendants.
 *
 * @param internalFormStore The internal form store.
 * @param path The optional path to start the search at.
 *
 * @returns The first field store with errors, or undefined if none exists.
 */
// @__NO_SIDE_EFFECTS__
export function getFirstErrorStore(
  internalFormStore: InternalFormStore,
  path?: Path
): InternalFieldStore | undefined {
  let internalFieldStore: InternalFieldStore | undefined = internalFormStore;

  // Resolve the optional path while guarding dynamic array items that no
  // longer exist at runtime
  for (const key of path ?? []) {
    if (!internalFieldStore || internalFieldStore.kind === 'value') {
      return undefined;
    }
    if (internalFieldStore.kind === 'array') {
      if (
        typeof key !== 'number' ||
        key < 0 ||
        key >= internalFieldStore.items.value.length
      ) {
        return undefined;
      }
      internalFieldStore = internalFieldStore.children[key];
    } else {
      internalFieldStore = internalFieldStore.children[key];
    }
  }

  if (!internalFieldStore) {
    return undefined;
  }

  // Walk the resolved subtree in depth-first order and stop at the first
  // field with errors, so errors of a field surface before its descendants
  let firstErrorStore: InternalFieldStore | undefined;
  walkFieldStore(internalFieldStore, (internalFieldStore) => {
    if (internalFieldStore.errors.value) {
      firstErrorStore = internalFieldStore;
      return true;
    }
  });
  return firstErrorStore;
}
