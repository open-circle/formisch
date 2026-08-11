import {
  focusFieldElement,
  getFieldInput,
  walkFieldStore,
} from '../../field/index.ts';
import { batch, untrack } from '../../framework/index.ts';
import type { InternalFormStore, StandardIssue } from '../../types/index.ts';

export interface ValidateFormInputConfig {
  readonly shouldFocus?: boolean | undefined;
}

export async function validateFormInput(
  internalFormStore: InternalFormStore,
  config?: ValidateFormInputConfig
): Promise<ReturnType<InternalFormStore['parse']>> {
  // Record validation order and mark form as validating
  const validationId = ++internalFormStore.validationId;
  internalFormStore.isValidating.value = true;

  try {
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

    if (result.issues) {
      nestedErrors = {};
      for (const issue of result.issues as StandardIssue[]) {
        if (issue.path) {
          const path = [];
          for (const pathItem of issue.path) {
            const key =
              typeof pathItem === 'object' && pathItem !== null
                ? (pathItem as { key: PropertyKey }).key
                : pathItem;
            const keyType = typeof key;
            if (keyType !== 'string' && keyType !== 'number') break;
            path.push(key);
          }
          const name = JSON.stringify(path);
          const fieldErrors = nestedErrors[name];
          if (fieldErrors) {
            fieldErrors.push(issue.message);
          } else {
            nestedErrors[name] = [issue.message];
          }
        } else {
          if (rootErrors) {
            rootErrors.push(issue.message);
          } else {
            rootErrors = [issue.message];
          }
        }
      }
    }

    let shouldFocus = config?.shouldFocus ?? false;

    batch(() => {
      untrack(() => {
        walkFieldStore(internalFormStore, (internalFieldStore) => {
          if (internalFieldStore.path.length === 0) {
            internalFieldStore.errors.value = rootErrors ?? null;
          } else {
            const fieldErrors = nestedErrors?.[internalFieldStore.name] ?? null;
            internalFieldStore.errors.value = fieldErrors;
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
      // Hint: The validation ID must be rechecked because focusing an erroring
      // field can blur another field whose blur handler synchronously starts a
      // new validation, which must keep its validating state.
      if (internalFormStore.validationId === validationId) {
        internalFormStore.isValidating.value = false;
      }
    });

    return result;
  } catch (error) {
    // Hint: The reset is guarded so a stale validation cannot clear the
    // validating state of a newer validation that is still pending.
    if (internalFormStore.validationId === validationId) {
      internalFormStore.isValidating.value = false;
    }
    throw error;
  }
}
