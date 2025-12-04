import {
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type InternalArrayStore,
  type RequiredPath,
  type Schema,
  type ValidArrayPath,
} from '@formisch/core/preact';
import { computed, useComputed } from '@preact/signals';
import { useMemo } from 'preact/hooks';
import type * as v from 'valibot';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';
import { usePathSignal } from '../usePathSignal/index.ts';

/**
 * Use field array config interface.
 */
export interface UseFieldArrayConfig<
  TSchema extends Schema = Schema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the array field within the form schema.
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
  const internalFieldStore = useComputed(
    () => getFieldStore(form[INTERNAL], pathSignal.value) as InternalArrayStore
  );

  return useMemo(
    () => ({
      path: pathSignal,
      items: computed(() => internalFieldStore.value.items.value),
      errors: computed(() => internalFieldStore.value.errors.value),
      isTouched: computed(() =>
        getFieldBool(internalFieldStore.value, 'isTouched')
      ),
      isDirty: computed(() =>
        getFieldBool(internalFieldStore.value, 'isDirty')
      ),
      isValid: computed(
        () => !getFieldBool(internalFieldStore.value, 'errors')
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}
