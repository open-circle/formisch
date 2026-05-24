import {
  type FormSchema,
  type RequiredPath,
  type ValidArrayPath,
} from '@formisch/core/solid';
import type { JSX } from 'solid-js';
import type * as v from 'valibot';
import { useFieldArray } from '../../primitives/index.ts';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';

/**
 * FieldArray component props interface.
 */
export interface FieldArrayProps<
  TSchema extends FormSchema = FormSchema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * The form store to which the field array belongs.
   */
  readonly of: FormStore<TSchema>;
  /**
   * The path to the field array within the form schema.
   */
  readonly path: ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>;
  /**
   * The render function that receives the field array store and returns JSX.
   */
  readonly children: (
    store: FieldArrayStore<TSchema, TFieldArrayPath>
  ) => JSX.Element;
}

/**
 * Headless field array that provides reactive properties and state. The field array
 * component takes a form store, path to array field, and a render function that receives
 * a field array store to manage array items and handle array operations.
 *
 * @param props The field array component props.
 *
 * @returns The UI of the field array to be rendered.
 */
// @ts-expect-error
export function FieldArray<
  TSchema extends FormSchema,
  TFieldArrayPath extends RequiredPath,
>(props: FieldArrayProps<TSchema, TFieldArrayPath>): JSX.Element;

// @__NO_SIDE_EFFECTS__
export function FieldArray(props: FieldArrayProps): JSX.Element {
  const field = useFieldArray<FormSchema, RequiredPath>(
    () => props.of,
    () => ({ path: props.path })
  );
  return <>{props.children(field)}</>;
}
