import {
  type BaseFormStore,
  type FormSchema,
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type RequiredPath,
  type ValidPath,
} from '@formisch/core';
import type * as v from 'valibot';

/**
 * Has form deep errors config interface.
 */
export interface HasFormDeepErrorsConfig {
  /**
   * The path to a field. Leave undefined to check the entire form.
   */
  readonly path?: undefined;
}

/**
 * Has field deep errors config interface.
 */
export interface HasFieldDeepErrorsConfig<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath,
> {
  /**
   * The path to the field to check for errors.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
}

/**
 * Checks whether a specific field or the entire form contains any errors by
 * walking through the field store and all its descendants. The walk stops as
 * soon as the first error is found, making this more efficient than collecting
 * all errors. This is useful for error indicators in multi-tab or
 * multi-section forms. Form-level errors are included.
 *
 * @param form The form store to check for errors.
 *
 * @returns Whether any errors exist.
 */
export function hasDeepErrors<TSchema extends FormSchema>(
  form: BaseFormStore<TSchema>
): boolean;

/**
 * Checks whether a specific field or the entire form contains any errors by
 * walking through the field store and all its descendants. The walk stops as
 * soon as the first error is found, making this more efficient than collecting
 * all errors. This is useful for error indicators in multi-tab or
 * multi-section forms. Form-level errors are included.
 *
 * @param form The form store to check for errors.
 * @param config The has deep errors configuration.
 *
 * @returns Whether any errors exist.
 */
export function hasDeepErrors<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath | undefined = undefined,
>(
  form: BaseFormStore<TSchema>,
  config: TFieldPath extends RequiredPath
    ? HasFieldDeepErrorsConfig<TSchema, TFieldPath>
    : HasFormDeepErrorsConfig
): boolean;

// @__NO_SIDE_EFFECTS__
export function hasDeepErrors(
  form: BaseFormStore,
  config?:
    | HasFormDeepErrorsConfig
    | HasFieldDeepErrorsConfig<FormSchema, RequiredPath>
): boolean {
  // Walks the field store and stops as soon as the first error is found
  return getFieldBool(
    config?.path ? getFieldStore(form[INTERNAL], config.path) : form[INTERNAL],
    'errors'
  );
}
