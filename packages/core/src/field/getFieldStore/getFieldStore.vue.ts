import type {
  InternalFieldStore,
  InternalFormStore,
  Path,
} from '../../types/index.ts';

// This framework-specific implementation exists because Vue does not expose a
// public `untrack` API. Formisch creates its Vue signals with `shallowRef`,
// which stores the current value in `_value`. Reading it directly avoids
// subscribing an enclosing computed or watcher to array item changes. The
// public `value` fallback preserves the previous behavior if Vue removes this
// internal property in the future.

/**
 * Returns the field store at the specified path by traversing the form store's
 * children hierarchy.
 *
 * @param internalFormStore The form store to traverse.
 * @param path The path to the field store.
 *
 * @returns The field store, or `undefined` if a dynamic array item in the path
 * does not exist at runtime.
 */
// @__NO_SIDE_EFFECTS__
export function getFieldStore(
  internalFormStore: InternalFormStore,
  path: Path
): InternalFieldStore | undefined {
  // Start at form store root
  let internalFieldStore: InternalFieldStore = internalFormStore;

  // Traverse path to find target field store
  for (const key of path) {
    // Return early if array item does not exist at runtime
    if (
      internalFieldStore.kind === 'array' &&
      // @ts-expect-error
      (internalFieldStore.items._value ?? internalFieldStore.items.value)[
        key
      ] === undefined
    ) {
      return undefined;
    }

    // Navigate to child at current path key
    // @ts-expect-error
    internalFieldStore = internalFieldStore.children[key];
  }

  // Return found field store
  return internalFieldStore;
}
