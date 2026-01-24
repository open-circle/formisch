import {
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type InternalArrayStore,
  type RequiredPath,
  type Schema,
  type ValidArrayPath,
} from '@formisch/core/vue';
import type * as v from 'valibot';
import type { MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';

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
 * @param form The form store instance, ref, or getter function.
 * @param config The field array configuration, ref, or getter function.
 *
 * @returns The field array store with reactive properties for array management.
 */
// @ts-expect-error
export function useFieldArray<
  TSchema extends Schema,
  TFieldArrayPath extends RequiredPath,
>(
  form: MaybeRefOrGetter<FormStore<TSchema>>,
  config: MaybeRefOrGetter<UseFieldArrayConfig<TSchema, TFieldArrayPath>>
): FieldArrayStore<TSchema, TFieldArrayPath>;

// @__NO_SIDE_EFFECTS__
export function useFieldArray(
  form: MaybeRefOrGetter<FormStore>,
  config: MaybeRefOrGetter<UseFieldArrayConfig>
): FieldArrayStore {
  const internalFieldStore = computed(
    () =>
      getFieldStore(
        toValue(form)[INTERNAL],
        toValue(config).path
      ) as InternalArrayStore
  );

  const isTouched = computed(() =>
    getFieldBool(internalFieldStore.value, 'isTouched')
  );
  const isDirty = computed(() =>
    getFieldBool(internalFieldStore.value, 'isDirty')
  );
  const isValid = computed(
    () => !getFieldBool(internalFieldStore.value, 'errors')
  );

  return {
    get path() {
      return toValue(config).path;
    },
    get items() {
      return internalFieldStore.value.items.value;
    },
    get errors() {
      return internalFieldStore.value.errors.value;
    },
    get isTouched() {
      return isTouched.value;
    },
    get isDirty() {
      return isDirty.value;
    },
    get isValid() {
      return isValid.value;
    },
  };
}
