import type {
  FieldElement,
  FormSchema,
  PartialValues,
  PathValue,
  RequiredPath,
  ValidArrayPath,
  ValidPath,
} from '@formisch/core/qwik';
import type { QRL, Signal } from '@qwik.dev/core';
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
  readonly ref: QRL<(element: FieldElement) => void>;
  /**
   * The focus event handler of the field element.
   */
  readonly onFocus$: QRL<(event: FocusEvent, element: FieldElement) => void>;
  /**
   * The input event handler of the field element.
   */
  readonly onInput$: QRL<(event: InputEvent, element: FieldElement) => void>;
  /**
   * The change event handler of the field element.
   */
  readonly onChange$: QRL<(event: Event, element: FieldElement) => void>;
  /**
   * The blur event handler of the field element.
   */
  readonly onBlur$: QRL<(event: FocusEvent, element: FieldElement) => void>;
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
  readonly path: Readonly<Signal<ValidPath<v.InferInput<TSchema>, TFieldPath>>>;
  /**
   * The current input value of the field.
   */
  readonly input: Readonly<
    Signal<PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>>
  >;
  /**
   * The current error messages of the field.
   */
  readonly errors: Readonly<Signal<[string, ...string[]] | null>>;
  /**
   * Whether the field has been touched.
   */
  readonly isTouched: Readonly<Signal<boolean>>;
  /**
   * Whether the field value has been edited.
   */
  readonly isEdited: ReadonlySignal<boolean>;
  /**
   * Whether the field input differs from its initial value.
   */
  readonly isDirty: Readonly<Signal<boolean>>;
  /**
   * Whether the field is valid according to the schema.
   */
  readonly isValid: Readonly<Signal<boolean>>;
  /**
   * Sets the field input value programmatically.
   */
  readonly onInput: QRL<
    (value: PartialValues<PathValue<v.InferInput<TSchema>, TFieldPath>>) => void
  >;
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
  readonly path: Readonly<
    Signal<ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>>
  >;
  /**
   * The item IDs of the array field.
   */
  readonly items: Readonly<Signal<string[]>>;
  /**
   * The current error messages of the field array.
   */
  readonly errors: Readonly<Signal<[string, ...string[]] | null>>;
  /**
   * Whether the field array has been touched.
   */
  readonly isTouched: Readonly<Signal<boolean>>;
  /**
   * Whether the field array value has been edited.
   */
  readonly isEdited: ReadonlySignal<boolean>;
  /**
   * Whether the field array input differs from its initial value.
   */
  readonly isDirty: Readonly<Signal<boolean>>;
  /**
   * Whether the field array is valid according to the schema.
   */
  readonly isValid: Readonly<Signal<boolean>>;
}
