import { type BaseFormStore, INTERNAL, walkFieldStore } from '@formisch/core';

/**
 * Retrieves all error messages from all fields in the form by walking through
 * the entire field store tree. This is useful for displaying a summary of all
 * validation errors across the form.
 *
 * @param form The form store to retrieve errors from.
 *
 * @returns A non-empty array of error messages, or null if no errors exist.
 */
// @__NO_SIDE_EFFECTS__
export function getAllErrors(
  form: BaseFormStore
): [string, ...string[]] | null {
  let allErrors: [string, ...string[]] | null = null;
  walkFieldStore(form[INTERNAL], (internalFieldStore) => {
    // Subscribe to items so reactive computations re-run when array items
    // are added or removed (walkFieldStore reads items via untrack internally)
    if (internalFieldStore.kind === 'array') {
      internalFieldStore.items.value;
    }
    const errors = internalFieldStore.errors.value;
    if (errors) {
      if (allErrors) {
        allErrors.push(...errors);
      } else {
        allErrors = [...errors];
      }
    }
  });
  return allErrors;
}
