import type { InternalFieldStore } from '../../types/index.ts';

/**
 * Options for retrieving field input.
 */
export interface GetFieldInputOptions {
  /**
   * Whether to include only fields whose `isDirty` flag is set. Clean children
   * are skipped during the recursive walk.
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
  // If field store is array, collect input from children
  if (internalFieldStore.kind === 'array') {
    // If array input is not nullish, build array from children
    if (internalFieldStore.input.value) {
      // Create output array
      const value = [];

      // Collect input from each array item
      for (
        let index = 0;
        index < internalFieldStore.items.value.length;
        index++
      ) {
        const child = internalFieldStore.children[index];
        if (!config?.dirtyOnly || child.isDirty.value) {
          value[index] = getFieldInput(child, config);
        }
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
        if (!config?.dirtyOnly || child.isDirty.value) {
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
