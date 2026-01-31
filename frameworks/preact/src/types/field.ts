import type {
  FieldElement,
  PartialValues,
  PathValue,
  RequiredPath,
  Schema,
  ValidArrayPath,
  ValidPath,
} from '@formisch/core/preact';
import type { ReadonlySignal } from '@preact/signals';
import type { JSX } from 'preact';
import type * as v from 'valibot';

/**
 * Field element props interface.
 */
export interface FieldElementProps {
  /**
   * The name attribute of the field element.
   */
  readonly name: string;
  /**
   * Whether to autofocus the field element when there are errors.
   */
  readonly autofocus: boolean;
  /**
   * The ref callback to register the field element.
   */
  readonly ref: (element: FieldElement) => void;
  /**
   * The focus event handler of the field element.
   */
  readonly onFocus: JSX.FocusEventHandler<FieldElement>;
  /**
   * The input event handler of the field element.
   */
  readonly onInput: JSX.InputEventHandler<FieldElement>;
  /**
   * The change event handler of the field element.
   */
  readonly onChange: JSX.GenericEventHandler<FieldElement>;
  /**
   * The blur event handler of the field element.
   */
  readonly onBlur: JSX.FocusEventHandler<FieldElement>;
}

/**
 * Field store interface.
 */
export interface FieldStore<
  TSchema extends Schema = Schema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field within the form.
   */
  readonly path: ReadonlySignal<ValidPath<v.InferInput<TSchema>, TFieldPath>>;
  /**
   * The current input value of the field.
   */
  readonly input: ReadonlySignal<
    PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>
  >;
  /**
   * The current error messages of the field.
   */
  readonly errors: ReadonlySignal<[string, ...string[]] | null>;
  /**
   * Whether the field has been touched.
   */
  readonly isTouched: ReadonlySignal<boolean>;
  /**
   * Whether the field input differs from its initial value.
   */
  readonly isDirty: ReadonlySignal<boolean>;
  /**
   * Whether the field is valid according to the schema.
   */
  readonly isValid: ReadonlySignal<boolean>;
  /**
   * Sets the field input value programmatically.
   */
  readonly onInput: (
    value: PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>
  ) => void;
  /**
   * The props to spread onto the field element for integration.
   */
  readonly props: FieldElementProps;
}

/**
 * Field array store interface.
 */
export interface FieldArrayStore<
  TSchema extends Schema = Schema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the array field within the form.
   */
  readonly path: ReadonlySignal<
    ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>
  >;
  /**
   * The item IDs of the array field.
   */
  readonly items: ReadonlySignal<string[]>;
  /**
   * The current error messages of the field array.
   */
  readonly errors: ReadonlySignal<[string, ...string[]] | null>;
  /**
   * Whether the field array has been touched.
   */
  readonly isTouched: ReadonlySignal<boolean>;
  /**
   * Whether the field array input differs from its initial value.
   */
  readonly isDirty: ReadonlySignal<boolean>;
  /**
   * Whether the field array is valid according to the schema.
   */
  readonly isValid: ReadonlySignal<boolean>;
}
