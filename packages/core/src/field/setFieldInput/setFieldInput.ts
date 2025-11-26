import { batch, createId, untrack } from '../../framework/index.ts';
import type {
  InternalFieldStore,
  InternalFormStore,
  Path,
  PathKey,
} from '../../types/index.ts';
import { initializeFieldStore } from '../initializeFieldStore/index.ts';

/**
 * Sets the input for a nested field store and all its children, updating
 * touched and dirty states accordingly. Handles dynamic array resizing.
 *
 * @param internalFieldStore The field store to update.
 * @param input The new input value.
 */
function setNestedInput(
  internalFieldStore: InternalFieldStore,
  input: unknown
): void {
  // Mark field as touched
  internalFieldStore.isTouched.value = true;

  // If field store is array, handle array input
  if (internalFieldStore.kind === 'array') {
    // Normalize input to empty array if nullish
    const arrayInput = input ?? [];
    const items = internalFieldStore.items.value;

    // If new array is shorter, truncate items
    if (
      // @ts-expect-error
      arrayInput.length < items.length
    ) {
      internalFieldStore.items.value = items.slice(
        0,
        // @ts-expect-error
        arrayInput.length
      );

      // Otherwise, if new array is longer, extend items
    } else if (
      // @ts-expect-error
      arrayInput.length > items.length
    ) {
      // If new items exceed children capacity, initialize new children
      // @ts-expect-error
      if (arrayInput.length > internalFieldStore.children.length) {
        // TODO: Check if we can merge this for loop with the one below
        // Parse path for child initialization
        const path = JSON.parse(internalFieldStore.name) as PathKey[];

        // Initialize missing children
        for (
          let index = internalFieldStore.children.length;
          // @ts-expect-error
          index < arrayInput.length;
          index++
        ) {
          // Create empty child object
          // @ts-expect-error
          internalFieldStore.children[index] = {};

          // Add current index to path
          path.push(index);

          // Initialize field store for new child
          initializeFieldStore(
            internalFieldStore.children[index],
            // @ts-expect-error
            internalFieldStore.schema.item,
            // @ts-expect-error
            arrayInput[index],
            path
          );

          // Remove index from path for next iteration
          path.pop();
        }
      }

      // Extend items array with new items
      internalFieldStore.items.value = [
        ...items,
        // @ts-expect-error
        ...arrayInput.slice(items.length).map(createId),
      ];
    }

    // Set input for each array item
    for (
      let index = 0;
      // @ts-expect-error
      index < arrayInput.length;
      index++
    ) {
      // Recursively set nested input
      setNestedInput(
        internalFieldStore.children[index],
        // @ts-expect-error
        arrayInput[index]
      );
    }

    // Set array input
    internalFieldStore.input.value = input == null ? input : true;

    // Update dirty state based on input or items length change
    internalFieldStore.isDirty.value =
      internalFieldStore.startInput.value !== internalFieldStore.input.value ||
      internalFieldStore.startItems.value.length !== items.length;

    // Otherwise, if field store is object, handle object input
  } else if (internalFieldStore.kind === 'object') {
    // Set input for each object property
    for (const key in internalFieldStore.children) {
      // Recursively set nested input
      setNestedInput(
        internalFieldStore.children[key],
        // @ts-expect-error
        input?.[key]
      );
    }

    // Set object input
    internalFieldStore.input.value = input == null ? input : true;

    // Update dirty state based on input change
    internalFieldStore.isDirty.value =
      internalFieldStore.startInput.value !== internalFieldStore.input.value;

    // Otherwise, handle value field input
  } else {
    // Set value input
    internalFieldStore.input.value = input;

    // TODO: Should we add support for Dates and Files?
    // Get start input for comparison
    const startInput = internalFieldStore.startInput.value;

    // Update dirty state with special handling for empty string and NaN
    internalFieldStore.isDirty.value =
      startInput !== input &&
      // Hint: This check ensures that an empty string or `NaN` does not mark
      // the field as dirty if the start input was `undefined` or `null`.
      (startInput != null || (input !== '' && !Number.isNaN(input)));
  }
}

/**
 * Sets the input for a field at the specified path in the form store,
 * traversing the path and updating all parent fields along the way.
 *
 * @param internalFormStore The form store containing the field.
 * @param path The path to the field.
 * @param input The new input value.
 */
export function setFieldInput(
  internalFormStore: InternalFormStore,
  path: Path,
  input: unknown
): void {
  // Batch all state updates for optimal reactivity performance
  batch(() => {
    // Untrack to avoid creating reactive dependencies during update
    untrack(() => {
      // Start at form store root
      let internalFieldStore: InternalFieldStore = internalFormStore;

      // Traverse path to target field
      for (let index = 0; index < path.length; index++) {
        // Navigate to child at current path key
        // @ts-expect-error
        internalFieldStore = internalFieldStore.children[path[index]];

        // If not at target field, mark parent input as truthy
        if (index < path.length - 1) {
          internalFieldStore.input.value = true;

          // Otherwise, set nested input on target field
        } else {
          setNestedInput(internalFieldStore, input);
        }
      }
    });
  });
}
