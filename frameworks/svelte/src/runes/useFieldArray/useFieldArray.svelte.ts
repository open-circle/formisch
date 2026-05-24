import {
  type FormSchema,
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type InternalArrayStore,
  type RequiredPath,
  type ValidArrayPath,
} from '@formisch/core/svelte';
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
 * @param form The form store instance or getter function.
 * @param config The field array configuration or getter function.
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
  const path = $derived(unwrap(config).path);
  const internalFieldStore = $derived(
    getFieldStore(unwrap(form)[INTERNAL], path) as InternalArrayStore
  );

  const isTouched = $derived(getFieldBool(internalFieldStore, 'isTouched'));
  const isDirty = $derived(getFieldBool(internalFieldStore, 'isDirty'));
  const isValid = $derived(!getFieldBool(internalFieldStore, 'errors'));

  return {
    get path() {
      return path;
    },
    get items() {
      return internalFieldStore.items.value;
    },
    get errors() {
      return internalFieldStore.errors.value;
    },
    get isTouched() {
      return isTouched;
    },
    get isDirty() {
      return isDirty;
    },
    get isValid() {
      return isValid;
    },
  };
}
