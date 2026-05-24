import {
  type FormSchema,
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type InternalArrayStore,
  type RequiredPath,
  type ValidArrayPath,
} from '@formisch/core/solid';
import { createMemo } from 'solid-js';
import type * as v from 'valibot';
import type {
  FieldArrayStore,
  FormStore,
  MaybeGetter,
} from '../../types/index.ts';
import { unwrap } from '../../utils/index.ts';

/**
 * Use field array config interface.
 */
export interface UseFieldArrayConfig<
  TSchema extends FormSchema = FormSchema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field array within the form schema.
   */
  readonly path: ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>;
}

/**
 * Creates a reactive field array store of a specific field array within a form store.
 *
 * @param form The form store instance.
 * @param config The field array configuration.
 *
 * @returns The field array store with reactive properties for array management.
 */
// @ts-expect-error
export function useFieldArray<
  TSchema extends FormSchema,
  TFieldArrayPath extends RequiredPath,
>(
  form: MaybeGetter<FormStore<TSchema>>,
  config: MaybeGetter<UseFieldArrayConfig<TSchema, TFieldArrayPath>>
): FieldArrayStore<TSchema, TFieldArrayPath>;

// @__NO_SIDE_EFFECTS__
export function useFieldArray(
  form: MaybeGetter<FormStore>,
  config: MaybeGetter<UseFieldArrayConfig>
): FieldArrayStore {
  const getInternalFieldStore = createMemo(
    () =>
      getFieldStore(
        unwrap(form)[INTERNAL],
        unwrap(config).path
      ) as InternalArrayStore
  );

  const getIsTouched = createMemo(() =>
    getFieldBool(getInternalFieldStore(), 'isTouched')
  );
  const getIsDirty = createMemo(() =>
    getFieldBool(getInternalFieldStore(), 'isDirty')
  );
  const getIsValid = createMemo(
    () => !getFieldBool(getInternalFieldStore(), 'errors')
  );

  return {
    get path() {
      return unwrap(config).path;
    },
    get items() {
      return getInternalFieldStore().items.value;
    },
    get errors() {
      return getInternalFieldStore().errors.value;
    },
    get isTouched() {
      return getIsTouched();
    },
    get isDirty() {
      return getIsDirty();
    },
    get isValid() {
      return getIsValid();
    },
  };
}
