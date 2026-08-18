import {
  type BaseFormStore,
  type FormSchema,
  INTERNAL,
  type RequiredPath,
  type ValidPath,
} from '@formisch/core';
import type * as v from 'valibot';
import { getFirstErrorStore } from '../getDeepError/getFirstErrorStore.ts';
import type { DeepErrorEntry } from '../getDeepErrorEntries/index.ts';

/**
 * Get form deep error entry config interface.
 */
export interface GetFormDeepErrorEntryConfig {
  /**
   * The path to a field. Leave undefined to get the entry of the entire form.
   */
  readonly path?: undefined;
}

/**
 * Get field deep error entry config interface.
 */
export interface GetFieldDeepErrorEntryConfig<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath,
> {
  /**
   * The path to the field to retrieve the entry from.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
}

/**
 * Retrieves the errors of the first erroring field of a specific field or the
 * entire form as an entry pairing the path to the field with its error
 * messages, by walking through the field store and all its descendants and
 * stopping at the first field with errors. This is useful for locating the
 * first erroring descendant of a field whose value is a nested structure while
 * retaining all errors at that path. Form-level errors are included with an
 * empty path.
 *
 * @param form The form store to retrieve the error entry from.
 *
 * @returns An entry containing the path and error messages, or null if no
 * errors exist.
 */
export function getDeepErrorEntry<TSchema extends FormSchema>(
  form: BaseFormStore<TSchema>
): DeepErrorEntry<v.InferInput<TSchema>> | null;

/**
 * Retrieves the errors of the first erroring field of a specific field or the
 * entire form as an entry pairing the path to the field with its error
 * messages, by walking through the field store and all its descendants and
 * stopping at the first field with errors. This is useful for locating the
 * first erroring descendant of a field whose value is a nested structure while
 * retaining all errors at that path. Form-level errors are included with an
 * empty path.
 *
 * @param form The form store to retrieve the error entry from.
 * @param config The get deep error entry configuration.
 *
 * @returns An entry containing the path and error messages, or null if no
 * errors exist.
 */
export function getDeepErrorEntry<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath | undefined = undefined,
>(
  form: BaseFormStore<TSchema>,
  config: TFieldPath extends RequiredPath
    ? GetFieldDeepErrorEntryConfig<TSchema, TFieldPath>
    : GetFormDeepErrorEntryConfig
): DeepErrorEntry<v.InferInput<TSchema>> | null;

// @__NO_SIDE_EFFECTS__
export function getDeepErrorEntry(
  form: BaseFormStore,
  config?:
    | GetFormDeepErrorEntryConfig
    | GetFieldDeepErrorEntryConfig<FormSchema, RequiredPath>
): DeepErrorEntry | null {
  const internalFieldStore = getFirstErrorStore(form[INTERNAL], config?.path);
  const errors = internalFieldStore?.errors.value;
  return internalFieldStore && errors
    ? { path: internalFieldStore.path, errors }
    : null;
}
