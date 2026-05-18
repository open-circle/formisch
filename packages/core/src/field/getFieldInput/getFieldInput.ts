import type { InternalFieldStore } from '../../types/index.ts';
import { getFieldBool } from '../getFieldBool/getFieldBool.ts';

/**
 * Options for retrieving field input.
 */
export interface GetFieldInputOptions {
  /**
   * When true, fields whose subtree contains no dirty descendant return
   * `undefined`. Object iterations omit clean keys; arrays are treated as
   * atomic and are returned in full whenever any descendant is dirty.
   */
  readonly dirtyOnly?: boolean;
}

/**
 * Returns the current input of the field store. For arrays and objects,
 * recursively collects input from all children. Returns `null` or `undefined`
 * for nullish array/object inputs, or the primitive value for value fields.
 *
 * @param internalFieldStore The field store to get input from.
 * @param config Options to filter the collected input (e.g. `dirtyOnly`).
 *
 * @returns The field input.
 */
// @__NO_SIDE_EFFECTS__
export function getFieldInput(
  internalFieldStore: InternalFieldStore,
  config?: GetFieldInputOptions
): unknown {
  // When `dirtyOnly`, bail with `undefined` for any subtree that contains
  // no dirty descendant. This applies uniformly to values, arrays and
  // objects. Inside arrays we still populate every item (atomic semantic)
  // so undefined slots never appear in the output.
  if (
    config?.dirtyOnly &&
    !getFieldBool(internalFieldStore, 'isDirty')
  ) {
    return undefined;
  }

  // If field store is array, collect input from children
  if (internalFieldStore.kind === 'array') {
    // If array input is not nullish, build array from children
    if (internalFieldStore.input.value) {
      // Create output array
      const value = [];

      // Collect input from each array item. Once we enter an array, every
      // item is fully populated regardless of dirty state — arrays are
      // atomic in `dirtyOnly` mode.
      for (
        let index = 0;
        index < internalFieldStore.items.value.length;
        index++
      ) {
        value[index] = getFieldInput(internalFieldStore.children[index]);
      }
      return value;
    }

    // Otherwise, return nullish input as-is
    return internalFieldStore.input.value;
  }

  // If field store is object, collect input from children
  if (internalFieldStore.kind === 'object') {
    // If object input is not nullish, build object from children
    if (internalFieldStore.input.value) {
      // Create output object
      const value: Record<string, unknown> = {};

      // Collect input from each object property
      for (const key in internalFieldStore.children) {
        const child = internalFieldStore.children[key];
        if (!config?.dirtyOnly || getFieldBool(child, 'isDirty')) {
          value[key] = getFieldInput(child, config);
        }
      }
      return value;
    }

    // Otherwise, return nullish input as-is
    return internalFieldStore.input.value;
  }

  // Return primitive value input
  return internalFieldStore.input.value;
}
