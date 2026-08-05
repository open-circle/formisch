import type {
  FieldElement,
  FormSchema,
  PartialValues,
  PathValue,
  RequiredPath,
  ValidArrayPath,
  ValidPath,
} from '@formisch/core/react-native';
import type * as v from 'valibot';

/**
 * Field element props interface.
 */
export interface FieldElementProps {
  /**
   * The ref callback to register the field element.
   *
   * Hint: `FieldElement` is a structural subset of the imperative methods of
   * React Native host component instances, so refs of `TextInput` and other
   * focusable native components are accepted. On React 19 the callback
   * returns a cleanup function that unregisters the exact element, while
   * React 18 calls the callback with `null` instead.
   */
  readonly ref: (element: FieldElement | null) => void | (() => void);
  /**
   * The focus event handler of the field element.
   */
  readonly onFocus: () => void;
  /**
   * The blur event handler of the field element.
   */
  readonly onBlur: () => void;
  /**
   * The change text handler of the field element.
   */
  readonly onChangeText: (text: string) => void;
}

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
   * Whether the field value has been edited.
   */
  readonly isEdited: boolean;
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
  readonly onChange: (
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
   * Whether the field array value has been edited.
   */
  readonly isEdited: boolean;
  /**
   * Whether the field array input differs from its initial value.
   */
  readonly isDirty: boolean;
  /**
   * Whether the field array is valid according to the schema.
   */
  readonly isValid: boolean;
}
