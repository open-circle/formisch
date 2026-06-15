import type * as v from 'valibot';
import { getFieldInput, walkFieldStore } from '../../field/index.ts';
import { batch, untrack } from '../../framework/index.ts';
import type { InternalFormStore, Schema } from '../../types/index.ts';

/**
 * Validate form input config interface.
 */
export interface ValidateFormInputConfig {
  /**
   * Whether to focus the first field with an error.
   */
  readonly shouldFocus?: boolean | undefined;
}

/**
 * Validates the form input using the configured Valibot schema. Parses the
 * current form input, processes validation issues, assigns errors to fields,
 * and optionally focuses the first field with an error.
 *
 * @param internalFormStore The form store to validate.
 * @param config The validation configuration.
 *
 * @returns The Valibot validation result.
 */
export async function validateFormInput(
  internalFormStore: InternalFormStore,
  config?: ValidateFormInputConfig
): Promise<v.SafeParseResult<Schema>> {
  try {
    // Update validation state
    internalFormStore.validators++;
    internalFormStore.isValidating.value = true;

    // Parse form input with Valibot schema
    const result = await internalFormStore.parse(
      untrack(() => getFieldInput(internalFormStore))
    );

    // Create variables for root and nested errors
    let rootErrors: [string, ...string[]] | undefined;
    let nestedErrors:
      | Record<string, [string, ...string[]] | undefined>
      | undefined;

    // Process validation issues into error variables
    if (result.issues) {
      // Initialize nested errors object
      nestedErrors = {};

      // Process each validation issue
      for (const issue of result.issues) {
        // If issue has path, assign to nested errors
        if (issue.path) {
          // Initialize path array
          const path = [];

          // Build path from issue path items
          for (const pathItem of issue.path) {
            const key = pathItem.key;
            const keyType = typeof key;
            const itemType = pathItem.type;
            // Skip unsupported path types
            if (
              (keyType !== 'string' && keyType !== 'number') ||
              itemType === 'map' ||
              itemType === 'set'
            ) {
              break;
            }

            // Add key to path
            path.push(key);
          }

          // Convert path to name of field
          const name = JSON.stringify(path);

          // Append or initialize nested errors
          const fieldErrors = nestedErrors[name];
          if (fieldErrors) {
            fieldErrors.push(issue.message);
          } else {
            nestedErrors[name] = [issue.message];
          }

          // Otherwise, assign to root errors
        } else {
          if (rootErrors) {
            rootErrors.push(issue.message);
          } else {
            rootErrors = [issue.message];
          }
        }
      }
    }

    // Create variable to decide if first error field should be focused
    let shouldFocus = config?.shouldFocus ?? false;

    // Batch all state updates for optimal reactivity performance
    batch(() => {
      // Set or reset errors on each field store
      walkFieldStore(internalFormStore, (internalFieldStore) => {
        if (internalFieldStore.name === '[]') {
          internalFieldStore.errors.value = rootErrors ?? null;
        } else {
          const fieldErrors = nestedErrors?.[internalFieldStore.name] ?? null;
          internalFieldStore.errors.value = fieldErrors;

          // Focus first field that has an error and a rendered element, so the
          // focus is not consumed by an erroring field without an element
          if (shouldFocus && fieldErrors && internalFieldStore.elements[0]) {
            internalFieldStore.elements[0].focus();
            shouldFocus = false;
          }
        }
      });
    });

    // Return validation result
    return result;

    // Always reset validation state, even if parsing throws
  } finally {
    batch(() => {
      internalFormStore.validators--;
      internalFormStore.isValidating.value = internalFormStore.validators > 0;
    });
  }
}
