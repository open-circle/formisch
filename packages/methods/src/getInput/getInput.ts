import {
  type BaseFormStore,
  getFieldInput,
  getFieldStore,
  INTERNAL,
  type PartialValues,
  type PathValue,
  type RequiredPath,
  type Schema,
  type ValidPath,
} from '@formisch/core';
import type * as v from 'valibot';

/**
 * Get form input config interface.
 */
export interface GetFormInputConfig {
  /**
   * The path to a field. Leave undefined to get the entire form input.
   */
  readonly path?: undefined;
  /**
   * Whether to include only fields whose subtree contains a dirty descendant.
   * Object keys with no dirty descendant are omitted; arrays are returned in
   * full whenever any descendant is dirty. Useful for submitting only the
   * values that changed since the start input.
   */
  readonly dirtyOnly?: boolean;
}

/**
 * Get field input config interface.
 */
export interface GetFieldInputConfig<
  TSchema extends Schema,
  TFieldPath extends RequiredPath,
> {
  /**
   * The path to the field to retrieve input from.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
  /**
   * Whether to include only fields whose subtree contains a dirty descendant.
   * Object keys with no dirty descendant are omitted; arrays are returned in
   * full whenever any descendant is dirty. Useful for submitting only the
   * values that changed since the start input.
   */
  readonly dirtyOnly?: boolean;
}

/**
 * Retrieves the current input value of a specific field or the entire form.
 * Returns a partial object as not all fields may have been set.
 *
 * @param form The form store to retrieve input from.
 *
 * @returns The partial input values of the form or the specified field.
 */
export function getInput<TSchema extends Schema>(
  form: BaseFormStore<TSchema>
): PartialValues<v.InferInput<TSchema>>;

/**
 * Retrieves the current input value of a specific field or the entire form.
 * Returns a partial object as not all fields may have been set.
 *
 * @param form The form store to retrieve input from.
 * @param config The get input configuration.
 *
 * @returns The partial input values of the form or the specified field.
 */
export function getInput<
  TSchema extends Schema,
  TFieldPath extends RequiredPath | undefined = undefined,
>(
  form: BaseFormStore<TSchema>,
  config: TFieldPath extends RequiredPath
    ? GetFieldInputConfig<TSchema, TFieldPath>
    : GetFormInputConfig
): PartialValues<
  TFieldPath extends RequiredPath
    ? PathValue<v.InferInput<TSchema>, TFieldPath>
    : v.InferInput<TSchema>
>;

// @__NO_SIDE_EFFECTS__
export function getInput(
  form: BaseFormStore,
  config?: GetFormInputConfig | GetFieldInputConfig<Schema, RequiredPath>
): unknown {
  return getFieldInput(
    config?.path ? getFieldStore(form[INTERNAL], config.path) : form[INTERNAL],
    config?.dirtyOnly ? { dirtyOnly: true } : undefined
  );
}
