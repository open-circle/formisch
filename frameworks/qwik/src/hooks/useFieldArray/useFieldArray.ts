import {
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type InternalArrayStore,
  type RequiredPath,
  type Schema,
  type ValidArrayPath,
} from '@formisch/core/qwik';
import { createComputed$, useComputed$, useConstant } from '@qwik.dev/core';
import type * as v from 'valibot';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';
import { usePathSignal } from '../usePathSignal/usePathSignal.ts';

/**
 * Use field array config interface.
 */
export interface UseFieldArrayConfig<
  TSchema extends Schema = Schema,
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
  TSchema extends Schema,
  TFieldArrayPath extends RequiredPath,
>(
  form: FormStore<TSchema>,
  config: UseFieldArrayConfig<TSchema, TFieldArrayPath>
): FieldArrayStore<TSchema, TFieldArrayPath>;

// @__NO_SIDE_EFFECTS__
export function useFieldArray(
  form: FormStore,
  config: UseFieldArrayConfig
): FieldArrayStore {
  const pathSignal = usePathSignal(config.path);
  const internalFieldStore = useComputed$(
    () => getFieldStore(form[INTERNAL], pathSignal.value) as InternalArrayStore
  );

  return useConstant(() => ({
    path: pathSignal,
    items: createComputed$(() => internalFieldStore.value.items.value),
    errors: createComputed$(() => internalFieldStore.value.errors.value),
    isTouched: createComputed$(() =>
      getFieldBool(internalFieldStore.value, 'isTouched')
    ),
    isDirty: createComputed$(() =>
      getFieldBool(internalFieldStore.value, 'isDirty')
    ),
    isValid: createComputed$(
      () => !getFieldBool(internalFieldStore.value, 'errors')
    ),
  }));
}
