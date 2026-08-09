import type * as v from 'valibot';
import {
  focusFieldElement,
  getFieldInput,
  walkFieldStore,
} from '../../field/index.ts';
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
  // Record validation order and mark form as validating
  const validationId = ++internalFormStore.validationId;
  internalFormStore.isValidating.value = true;

  try {
    // Parse form input with Valibot schema
    const result = await internalFormStore.parse(
      untrack(() => getFieldInput(internalFormStore))
    );

    // Return outdated result without processing it if a newer validation was
    // started in the meantime
    // Hint: Only the newest validation may write errors or reset the validating
    // state, so an older async result that settles late cannot overwrite the
    // state of a newer validation.
    if (internalFormStore.validationId !== validationId) {
      return result;
    }

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

    // Batch error, focus and validation state updates together so reactive
    // subscribers observe a single consistent update
    batch(() => {
      // Untracked to avoid subscribing a surrounding reactive scope to the
      // form structure.
      untrack(() => {
        // Set or reset errors on each field store.
        walkFieldStore(internalFormStore, (internalFieldStore) => {
          if (internalFieldStore.path.length === 0) {
            internalFieldStore.errors.value = rootErrors ?? null;
          } else {
            const fieldErrors = nestedErrors?.[internalFieldStore.name] ?? null;
            internalFieldStore.errors.value = fieldErrors;

            // Focus the first erroring field whose element can actually receive
            // focus, so the focus is not consumed by a field without a focusable
            // element (e.g. unmounted or hidden)
            if (
              shouldFocus &&
              fieldErrors &&
              focusFieldElement(internalFieldStore)
            ) {
              shouldFocus = false;
            }
          }
        });
      });

      // Reset validation state of form
      internalFormStore.isValidating.value = false;
    });

    // Return validation result
    return result;

    // If parsing throws, still reset validation state so form does not stay
    // stuck in a validating state
  } catch (error) {
    // Hint: The reset is guarded so a stale validation cannot clear the
    // validating state of a newer validation that is still pending.
    if (internalFormStore.validationId === validationId) {
      internalFormStore.isValidating.value = false;
    }
    throw error;
  }
}
