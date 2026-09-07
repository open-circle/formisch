import {
  type BaseFormStore,
  type FormSchema,
  INTERNAL,
  type SubmitEventHandler,
  type SubmitHandler,
  validateFormInput,
} from '@formisch/core';

/**
 * Creates a submit event handler for the form that validates the form input,
 * and calls the provided handler if validation succeeds. This is designed to
 * be used with the form's onsubmit event.
 *
 * @param form The form store to handle submission for.
 * @param handler The submit handler function called with validated output if validation succeeds.
 *
 * @returns A submit event handler function to attach to the form element.
 */
export function handleSubmit<TSchema extends FormSchema>(
  form: BaseFormStore<TSchema>,
  handler: SubmitHandler<TSchema>
): () => Promise<void>;

/**
 * Creates a submit event handler for the form that prevents default browser
 * submission, validates the form input, and calls the provided handler if
 * validation succeeds. This is designed to be used with the form's onsubmit event.
 *
 * @param form The form store to handle submission for.
 * @param handler The submit handler function called with validated output if validation succeeds.
 *
 * @returns A submit event handler function to attach to the form element.
 */
export function handleSubmit<TSchema extends FormSchema>(
  form: BaseFormStore<TSchema>,
  handler: SubmitEventHandler<TSchema>
): (event: SubmitEvent) => Promise<void>;

// @__NO_SIDE_EFFECTS__
export function handleSubmit(
  form: BaseFormStore,
  handler: SubmitHandler<FormSchema> | SubmitEventHandler<FormSchema>
): (event?: SubmitEvent) => Promise<void> {
  return async (event?: SubmitEvent) => {
    // Prevent default browser form submission
    event?.preventDefault();

    // Get internal form store
    const internalFormStore = form[INTERNAL];

    // Record submission order
    const submissionId = ++internalFormStore.submissionId;
    let isHandlingSubmit = false;

    // Mark form as submitted and submitting
    internalFormStore.isSubmitted.value = true;
    internalFormStore.isSubmitting.value = true;

    // Hint: Capture this call's ID before parsing can invalidate its input.
    const validationId = internalFormStore.validationId + 1;

    // Try to run submit actions if form is valid
    try {
      const result = await validateFormInput(internalFormStore, {
        shouldFocus: true,
      });

      // Run handler only for current successful validation
      if (
        result.success &&
        internalFormStore.submissionId === submissionId &&
        internalFormStore.validationId === validationId
      ) {
        isHandlingSubmit = true;
        // @ts-expect-error - union of SubmitHandler and SubmitEventHandler
        await handler(result.output, event);
      }

      // If an error occurred, set form errors
    } catch (error: unknown) {
      // Hint: Once the handler starts, input changes must not hide its errors.
      // A newer submission or full reset still takes precedence.
      if (
        internalFormStore.submissionId === submissionId &&
        (isHandlingSubmit || internalFormStore.validationId === validationId)
      ) {
        internalFormStore.errors.value = [
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
            ? error.message
            : 'An unknown error has occurred.',
        ];
      }

      // Finally reset submitting state
    } finally {
      if (internalFormStore.submissionId === submissionId) {
        internalFormStore.isSubmitting.value = false;
      }
    }
  };
}
