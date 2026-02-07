import type {
  FieldElement,
  PartialValues,
  PathValue,
  RequiredPath,
  Schema,
  ValidArrayPath,
  ValidPath,
} from '@formisch/core/svelte';
import type { FocusEventHandler, FormEventHandler } from 'svelte/elements';
import type * as v from 'valibot';

/**
 * Field element props interface.
 */
export interface FieldElementProps {
  /**
   * The name of the field.
   */
  readonly name: string;
  /**
   * Whether the field should autofocus.
   */
  readonly autofocus: boolean;
  /**
   * The element reference callback with cleanup.
   */
  readonly [ref: symbol]: (element: FieldElement) => () => void;
  /**
   * The focus event handler of the field element.
   */
  readonly onfocus: FocusEventHandler<FieldElement>;
  /**
   * The input event handler of the field element.
   */
  readonly oninput: FormEventHandler<FieldElement>;
  /**
   * The change event handler of the field element.
   */
  readonly onchange: FormEventHandler<FieldElement>;
  /**
   * The blur event handler of the field element.
   */
  readonly onblur: FocusEventHandler<FieldElement>;
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
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
  /**
   * The current input value of the field.
   */
  readonly input: PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>;
  /**
   * The current error messages of the field.
   */
  readonly errors: [string, ...string[]] | null;
  /**
   * Whether the field has been touched.
   */
  readonly isTouched: boolean;
  /**
   * Whether the field input differs from its initial value.
   */
  readonly isDirty: boolean;
  /**
   * Whether the field is valid according to the schema.
   */
  readonly isValid: boolean;
  /**
   * Sets the field input value programmatically.
   */
  readonly onInput: (
    value: PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>
  ) => void;
  /**
   * The props for the field element.
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
  readonly path: ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>;
  /**
   * The item IDs of the array field.
   */
  readonly items: string[];
  /**
   * The current error messages of the field array.
   */
  readonly errors: [string, ...string[]] | null;
  /**
   * Whether the field array has been touched.
   */
  readonly isTouched: boolean;
  /**
   * Whether the field array input differs from its initial value.
   */
  readonly isDirty: boolean;
  /**
   * Whether the field array is valid according to the schema.
   */
  readonly isValid: boolean;
}
