import type { BaseFormStore, FormSchema } from '@formisch/core/qwik';
import type { Signal } from '@qwik.dev/core';

/**
 * Form store interface.
 */
export interface FormStore<TSchema extends FormSchema = FormSchema>
  extends BaseFormStore<TSchema> {
  /**
   * Whether the form is currently submitting.
   */
  readonly isSubmitting: Readonly<Signal<boolean>>;
  /**
   * Whether the form has been submitted.
   */
  readonly isSubmitted: Readonly<Signal<boolean>>;
  /**
   * Whether the form is currently validating.
   */
  readonly isValidating: Readonly<Signal<boolean>>;
  /**
   * Whether any field in the form has been touched.
   */
  readonly isTouched: Readonly<Signal<boolean>>;
  /**
   * Whether any field in the form has been edited.
   */
  readonly isEdited: ReadonlySignal<boolean>;
  /**
   * Whether any field in the form differs from its initial value.
   */
  readonly isDirty: Readonly<Signal<boolean>>;
  /**
   * Whether the form is valid according to the schema.
   */
  readonly isValid: Readonly<Signal<boolean>>;
  /**
   * The current error messages of the form.
   *
   * Hint: This property only contains validation errors at the root level
   * of the form. To get all errors from all fields, use `getDeepErrors`.
   */
  readonly errors: Readonly<Signal<[string, ...string[]] | null>>;
}
