import type { BaseFormStore, FormSchema } from '@formisch/core/preact';
import type { ReadonlySignal } from '@preact/signals';

/**
 * Form store interface.
 */
export interface FormStore<TSchema extends FormSchema = FormSchema>
  extends BaseFormStore<TSchema> {
  /**
   * Whether the form is currently submitting.
   */
  readonly isSubmitting: ReadonlySignal<boolean>;
  /**
   * Whether the form has been submitted.
   */
  readonly isSubmitted: ReadonlySignal<boolean>;
  /**
   * Whether the form is currently validating.
   */
  readonly isValidating: ReadonlySignal<boolean>;
  /**
   * Whether any field in the form has been touched.
   */
  readonly isTouched: ReadonlySignal<boolean>;
  /**
   * Whether any field in the form differs from its initial value.
   */
  readonly isDirty: ReadonlySignal<boolean>;
  /**
   * Whether the form is valid according to the schema.
   */
  readonly isValid: ReadonlySignal<boolean>;
  /**
   * The current error messages of the form.
   *
   * Hint: This property only contains validation errors at the root level
   * of the form. To get all errors from all fields, use `getAllErrors`.
   */
  readonly errors: ReadonlySignal<[string, ...string[]] | null>;
}
