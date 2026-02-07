import type {
  PartialValues,
  PathValue,
  RequiredPath,
  Schema,
  ValidArrayPath,
  ValidPath,
} from '@formisch/core/vue';
import type * as v from 'valibot';
import type { ComponentPublicInstance } from 'vue';

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
   * The ref callback to register the field element.
   */
  readonly ref: (element: Element | ComponentPublicInstance | null) => void;
  /**
   * The focus event handler of the field element.
   */
  readonly onFocus: (event: FocusEvent) => void;
  /**
   * The change event handler of the field element.
   */
  readonly onChange: (event: Event) => void;
  /**
   * The blur event handler of the field element.
   */
  readonly onBlur: (event: FocusEvent) => void;
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
  get input(): PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>;
  /**
   * Sets the current input value of the field.
   */
  set input(value: PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>);
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
