import {
  type BaseFormStore,
  type FormSchema,
  getFieldStore,
  INTERNAL,
  type RequiredPath,
  type ValidPath,
  walkFieldStore,
} from '@formisch/core';
import type * as v from 'valibot';

/**
 * Get form deep error config interface.
 */
export interface GetFormDeepErrorConfig {
  /**
   * The path to a field. Leave undefined to get the error of the entire form.
   */
  readonly path?: undefined;
}

/**
 * Get field deep error config interface.
 */
export interface GetFieldDeepErrorConfig<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath,
> {
  /**
   * The path to the field to retrieve the error from.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
}

/**
 * Retrieves the first error message of a specific field or the entire form by
 * walking through the field store and all its descendants and stopping at the
 * first field with errors. This is useful for displaying a single error
 * message for a field whose value is a nested structure, such as a rich text
 * editor or tags input. Form-level errors are included.
 *
 * @param form The form store to retrieve the error from.
 *
 * @returns The first error message, or null if no errors exist.
 */
export function getDeepError<TSchema extends FormSchema>(
  form: BaseFormStore<TSchema>
): string | null;

/**
 * Retrieves the first error message of a specific field or the entire form by
 * walking through the field store and all its descendants and stopping at the
 * first field with errors. This is useful for displaying a single error
 * message for a field whose value is a nested structure, such as a rich text
 * editor or tags input. Form-level errors are included.
 *
 * @param form The form store to retrieve the error from.
 * @param config The get deep error configuration.
 *
 * @returns The first error message, or null if no errors exist.
 */
export function getDeepError<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath | undefined = undefined,
>(
  form: BaseFormStore<TSchema>,
  config: TFieldPath extends RequiredPath
    ? GetFieldDeepErrorConfig<TSchema, TFieldPath>
    : GetFormDeepErrorConfig
): string | null;

// @__NO_SIDE_EFFECTS__
export function getDeepError(
  form: BaseFormStore,
  config?:
    | GetFormDeepErrorConfig
    | GetFieldDeepErrorConfig<FormSchema, RequiredPath>
): string | null {
  // Walk the field store tree in depth-first order and stop at the first
  // field with errors, so errors of a field surface before its descendants
  let deepError: string | null = null;
  walkFieldStore(
    config?.path ? getFieldStore(form[INTERNAL], config.path) : form[INTERNAL],
    (internalFieldStore) => {
      const errors = internalFieldStore.errors.value;
      if (errors) {
        deepError = errors[0];
        return true;
      }
    }
  );
  return deepError;
}
