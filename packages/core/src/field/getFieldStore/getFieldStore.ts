import { untrack } from '../../framework/index.ts';
import type {
  InternalFieldStore,
  InternalFormStore,
  Path,
} from '../../types/index.ts';

/**
 * Returns the field store at the specified path by traversing the form store's
 * children hierarchy.
 *
 * @param internalFormStore The form store to traverse.
 * @param path The path to the field store.
 *
 * @returns The field store, or `undefined` if a dynamic array item in the path
 * does not exist at runtime.
 *
 * @throws An error if no field store exists at the path.
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
      untrack(() => internalFieldStore.items.value)[key] === undefined
    ) {
      return undefined;
    }

    // Navigate to child at current path key
    // @ts-expect-error
    internalFieldStore = internalFieldStore.children?.[key];

    // Report missing schema fields before callers access their properties
    if (!internalFieldStore) {
      throw new Error(`No field store found at path ${JSON.stringify(path)}`);
    }
  }

  // Return found field store
  return internalFieldStore;
}
