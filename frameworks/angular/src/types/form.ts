import type { Signal } from '@angular/core';
import type { BaseFormStore, FormSchema } from '@formisch/core/angular';

/**
 * Form store interface.
 */
export interface FormStore<TSchema extends FormSchema = FormSchema>
  extends BaseFormStore<TSchema> {
  /**
   * Whether the form is currently submitting.
   */
  readonly isSubmitting: Signal<boolean>;
  /**
   * Whether the form has been submitted.
   */
  readonly isSubmitted: Signal<boolean>;
  /**
   * Whether the form is currently validating.
   */
  readonly isValidating: Signal<boolean>;
  /**
   * Whether any field in the form has been touched.
   */
  readonly isTouched: Signal<boolean>;
  /**
   * Whether any field in the form differs from its initial value.
   */
  readonly isDirty: Signal<boolean>;
  /**
   * Whether the form is valid according to the schema.
   */
  readonly isValid: Signal<boolean>;
  /**
   * The current error messages of the form.
   *
   * Hint: This property only contains validation errors at the root level
   * of the form. To get all errors from all fields, use `getAllErrors`.
   */
  readonly errors: Signal<[string, ...string[]] | null>;
}
