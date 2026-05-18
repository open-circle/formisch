import type { InternalFieldStore } from '../../types/index.ts';
import { getFieldBool } from '../getFieldBool/getFieldBool.ts';

/**
 * Returns only the dirty input of the field store. Object keys whose subtree
 * contains no dirty descendant are omitted; arrays are treated as atomic and
 * returned in full whenever any descendant is dirty. Returns `undefined` for
 * subtrees that contain no dirty descendant.
 *
 * @param internalFieldStore The field store to get dirty input from.
 * @param dirtyOnly Whether to filter to dirty fields only. Defaults to `true`.
 *
 * @returns The dirty input, or `undefined` if no descendant is dirty.
 */
// @__NO_SIDE_EFFECTS__
export function getDirtyFieldInput(
  internalFieldStore: InternalFieldStore,
  dirtyOnly: boolean = true
): unknown {
  // Bail with `undefined` if no descendant is dirty
  if (dirtyOnly && !getFieldBool(internalFieldStore, 'isDirty')) {
    return undefined;
  }

  // If field store is array, return the full current array (atomic)
  if (internalFieldStore.kind === 'array') {
    if (internalFieldStore.input.value) {
      const value = [];
      for (
        let index = 0;
        index < internalFieldStore.items.value.length;
        index++
      ) {
        value[index] = getDirtyFieldInput(
          internalFieldStore.children[index],
          false
        );
      }
      return value;
    }
    return internalFieldStore.input.value;
  }

  // If field store is object, recurse only into dirty branches
  if (internalFieldStore.kind === 'object') {
    if (internalFieldStore.input.value) {
      const value: Record<string, unknown> = {};
      for (const key in internalFieldStore.children) {
        const child = internalFieldStore.children[key];
        if (!dirtyOnly || getFieldBool(child, 'isDirty')) {
          value[key] = getDirtyFieldInput(child, dirtyOnly);
        }
      }
      return value;
    }
    return internalFieldStore.input.value;
  }

  // Return primitive value input
  return internalFieldStore.input.value;
}
