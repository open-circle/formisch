import { resetItemState } from '../../array/resetItemState/index.ts';
import { batch, createId, untrack } from '../../framework/index.ts';
import type {
  InternalFieldStore,
  InternalFormStore,
  Path,
} from '../../types/index.ts';
import { getUntrackedValue } from '../getUntrackedValue/index.ts';
import { initializeFieldStore } from '../initializeFieldStore/index.ts';

/**
 * Invalidates the validation of the previous form input, so that its pending
 * result is discarded.
 *
 * @param internalFormStore The form store to invalidate the validation of.
 */
function invalidateValidation(internalFormStore: InternalFormStore): void {
  internalFormStore.validationId++;
  internalFormStore.isValidating.value = false;
}

/**
 * Sets the input for a nested field store and all its children, updating
 * touched and dirty states accordingly. Handles dynamic array resizing.
 * Invalidates the validation of the previous input before the form input
 * changes.
 *
 * @param internalFormStore The form store providing the empty input config.
 * @param internalFieldStore The field store to update.
 * @param input The new input value.
 * @param isHidden Whether a nullish parent hides the field from the form input.
 *
 * @returns Whether the form input has changed.
 */
function setNestedInput(
  internalFormStore: InternalFormStore,
  internalFieldStore: InternalFieldStore,
  input: unknown,
  isHidden: boolean
): boolean {
  // Mark field as touched and edited
  internalFieldStore.isTouched.value = true;
  internalFieldStore.isEdited.value = true;

  // Create variable to track whether form input changes
  let isChanged = false;

  // If field store is array, handle array input
  if (internalFieldStore.kind === 'array') {
    // Normalize input to empty array if nullish
    const arrayInput = input ?? [];
    const items = internalFieldStore.items.value;

    // Tuples have a fixed number of children, so ignore any extra input items
    // instead of growing them (they have no `item` schema to initialize
    // additional children, unlike dynamic arrays)
    const length =
      internalFieldStore.schema.type === 'array'
        ? (arrayInput as unknown[]).length
        : internalFieldStore.children.length;

    // Get next array input
    const nextInput = input == null ? input : true;

    // If array input or number of items changes, invalidate validation
    // Hint: The items of a nullish array are not part of the form input.
    if (
      !isHidden &&
      (internalFieldStore.input.value !== nextInput ||
        (nextInput === true && length !== items.length))
    ) {
      isChanged = true;
      invalidateValidation(internalFormStore);
    }

    // If new array is shorter, truncate items
    if (length < items.length) {
      internalFieldStore.items.value = items.slice(0, length);

      // Otherwise, if new array is longer, extend items
    } else if (length > items.length) {
      // Initialize or reset each newly visible child
      for (let index = items.length; index < length; index++) {
        // Reset the reused stale child but keep its start input as baseline
        // Hint: A child store from a previously longer array still holds stale
        // errors and nested values that must be cleared, but its `startInput`
        // and `startItems` are the dirty baseline. Passing `keepStart`
        // preserves them so editing a regrown index is detected as dirty, just
        // like a direct edit on a never-shrunk array would be.
        if (internalFieldStore.children[index]) {
          resetItemState(
            internalFormStore,
            internalFieldStore.children[index],
            // @ts-expect-error
            arrayInput[index],
            true
          );

          // Otherwise, create and initialize a brand-new child
        } else {
          // Create empty child object
          // @ts-expect-error
          internalFieldStore.children[index] = {};

          // Initialize field store for new child
          initializeFieldStore(
            internalFormStore,
            internalFieldStore.children[index],
            // @ts-expect-error
            internalFieldStore.schema.item,
            // @ts-expect-error
            arrayInput[index],
            [...internalFieldStore.path, index]
          );
        }
      }

      // Extend items array with new items, capped to the clamped length so a
      // tuple never grows beyond its fixed number of children
      internalFieldStore.items.value = [
        ...items,
        ...Array.from({ length: length - items.length }, createId),
      ];
    }

    // Set input for each array item
    for (let index = 0; index < length; index++) {
      // Recursively set nested input
      if (
        setNestedInput(
          internalFormStore,
          internalFieldStore.children[index],
          // @ts-expect-error
          arrayInput[index],
          isHidden || nextInput !== true
        )
      ) {
        isChanged = true;
      }
    }

    // Set array input
    internalFieldStore.input.value = nextInput;

    // Update dirty state based on input or items length change
    internalFieldStore.isDirty.value =
      internalFieldStore.startInput.value !== internalFieldStore.input.value ||
      internalFieldStore.startItems.value.length !==
        internalFieldStore.items.value.length;

    // Otherwise, if field store is object, handle object input
  } else if (internalFieldStore.kind === 'object') {
    // Get next object input
    const nextInput = input == null ? input : true;

    // If object input changes, invalidate validation
    if (!isHidden && internalFieldStore.input.value !== nextInput) {
      isChanged = true;
      invalidateValidation(internalFormStore);
    }

    // Set input for each object property
    // Hint: The children of a nullish object are not part of the form input.
    for (const key in internalFieldStore.children) {
      // Recursively set nested input
      if (
        setNestedInput(
          internalFormStore,
          internalFieldStore.children[key],
          // @ts-expect-error
          input?.[key],
          isHidden || nextInput !== true
        )
      ) {
        isChanged = true;
      }
    }

    // Set object input
    internalFieldStore.input.value = nextInput;

    // Update dirty state based on input change
    internalFieldStore.isDirty.value =
      internalFieldStore.startInput.value !== internalFieldStore.input.value;

    // Otherwise, handle value field input
  } else {
    // If value input changes, invalidate validation
    // Hint: The current input is read without tracking it, so that a
    // surrounding reactive scope is not subscribed to the input it sets.
    if (
      !isHidden &&
      !Object.is(getUntrackedValue(internalFieldStore.input), input)
    ) {
      isChanged = true;
      invalidateValidation(internalFormStore);
    }

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

  // Return whether form input has changed
  return isChanged;
}

/**
 * Sets the input for a field at the specified path in the form store,
 * traversing the path and updating all parent fields along the way. The
 * validation of the previous input is only invalidated if the form input
 * changes.
 *
 * @param internalFormStore The form store containing the field.
 * @param path The path to the field.
 * @param input The new input value.
 *
 * @returns Whether the form input may have to be validated, which is not the
 * case if it is unchanged while a validation of it is pending.
 */
export function setFieldInput(
  internalFormStore: InternalFormStore,
  path: Path,
  input: unknown
): boolean {
  // Get whether validation is pending before input is set
  const isValidating = getUntrackedValue(internalFormStore.isValidating);

  // Create variable to track whether form input changes
  let isChanged = false;

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
          // If parent input is nullish, invalidate validation
          // Hint: A nullish parent becomes present, which changes the form
          // input even if the target field keeps its input.
          if (!internalFieldStore.input.value) {
            isChanged = true;
            invalidateValidation(internalFormStore);
          }

          // Set parent input to truthy
          internalFieldStore.input.value = true;

          // Update dirty state based on input change
          // Hint: A nullish container becomes present even when the target
          // child's value equals its own baseline (e.g. `undefined` to
          // `{ name: '' }`). Arrays also compare item IDs so structural dirty
          // state from a changed length, order or item is preserved.
          internalFieldStore.isDirty.value =
            internalFieldStore.startInput.value !==
              internalFieldStore.input.value ||
            (internalFieldStore.kind === 'array' &&
              internalFieldStore.startItems.value.join() !==
                internalFieldStore.items.value.join());
        }
      }

      // Set nested input on target field
      if (setNestedInput(internalFormStore, internalFieldStore, input, false)) {
        isChanged = true;
      }
    });
  });

  // Return whether form input may have to be validated
  // Hint: If the form input is unchanged, a validation that was pending
  // before still validates the current input. Starting another one would only
  // discard its result, for example for a submission that waits for it.
  return isChanged || !isValidating;
}
