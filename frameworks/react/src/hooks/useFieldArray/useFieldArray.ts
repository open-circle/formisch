import {
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type InternalArrayStore,
  type RequiredPath,
  type Schema,
  type ValidArrayPath,
} from '@formisch/core/vanilla';
import type * as v from 'valibot';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';
import { useSignals } from '../useSignals/index.ts';

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
  useSignals();

  const internalFormStore = form[INTERNAL];
  const internalFieldStore = getFieldStore(
    internalFormStore,
    config.path
  ) as InternalArrayStore;

  // TODO: Check if we can use `useMemo` here
  return {
    path: config.path,
    get items() {
      return internalFieldStore.items.value;
    },
    get errors() {
      return internalFieldStore.errors.value;
    },
    get isTouched() {
      return getFieldBool(internalFieldStore, 'isTouched');
    },
    get isDirty() {
      return getFieldBool(internalFieldStore, 'isDirty');
    },
    get isValid() {
      return !getFieldBool(internalFieldStore, 'errors');
    },
  };
}
