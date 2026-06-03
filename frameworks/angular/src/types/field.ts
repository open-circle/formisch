import type { Signal } from '@angular/core';
import type {
  FieldElement,
  FormSchema,
  PartialValues,
  PathValue,
  RequiredPath,
  ValidArrayPath,
  ValidPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';

/**
 * Field store interface.
 */
export interface FieldStore<
  TSchema extends FormSchema = FormSchema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field within the form.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
  /**
   * The current input value of the field as a reactive signal.
   */
  readonly input: Signal<
    PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>
  >;
  /**
   * The current error messages of the field.
   */
  readonly errors: Signal<[string, ...string[]] | null>;
  /**
   * Whether the field has been touched.
   */
  readonly isTouched: Signal<boolean>;
  /**
   * Whether the field input differs from its initial value.
   */
  readonly isDirty: Signal<boolean>;
  /**
   * Whether the field is valid according to the schema.
   */
  readonly isValid: Signal<boolean>;
  /**
   * Sets the field input value programmatically.
   */
  readonly onInput: (
    value: PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>
  ) => void;
  /**
   * Registers a DOM element with the field for focus management.
   * Apply the `formischFieldElement` directive to a focusable element instead
   * of calling this directly.
   *
   * @param element The field element to register.
   *
   * @returns A cleanup function that unregisters the element.
   */
  readonly registerElement: (element: FieldElement) => () => void;
  /**
   * The name attribute value derived from the field path.
   */
  readonly name: string;
  /**
   * Whether the field element should be autofocused (true when the field has errors).
   */
  readonly autofocus: boolean;
  /**
   * Marks the field as touched and triggers touch-mode validation.
   */
  readonly onFocus: (event: FocusEvent) => void;
  /**
   * Updates the field value from a DOM event and triggers input and change validation.
   */
  readonly onChange: (event: Event) => void;
  /**
   * Triggers blur-mode validation.
   */
  readonly onBlur: (event: FocusEvent) => void;
}

/**
 * Field array store interface.
 */
export interface FieldArrayStore<
  TSchema extends FormSchema = FormSchema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the array field within the form.
   */
  readonly path: ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>;
  /**
   * The item IDs of the array field.
   */
  readonly items: Signal<string[]>;
  /**
   * The current error messages of the field array.
   */
  readonly errors: Signal<[string, ...string[]] | null>;
  /**
   * Whether the field array has been touched.
   */
  readonly isTouched: Signal<boolean>;
  /**
   * Whether the field array input differs from its initial value.
   */
  readonly isDirty: Signal<boolean>;
  /**
   * Whether the field array is valid according to the schema.
   */
  readonly isValid: Signal<boolean>;
}
