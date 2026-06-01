import type { Signal } from '@angular/core';
import type {
  FormSchema,
  PartialValues,
  PathValue,
  RequiredPath,
  ValidArrayPath,
  ValidPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';
import type { CONTROL, FieldControl } from './control.ts';

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
   * The name of the field element as a reactive signal.
   */
  readonly name: Signal<string>;
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
  readonly setInput: (
    value: PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>
  ) => void;
  /**
   * The element-binding contract consumed by the `[formischControl]` directive.
   */
  readonly [CONTROL]: FieldControl;
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
