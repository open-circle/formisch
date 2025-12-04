import {
  getElementInput,
  getFieldBool,
  getFieldInput,
  getFieldStore,
  INTERNAL,
  type RequiredPath,
  type Schema,
  setFieldBool,
  setFieldInput,
  validateIfRequired,
  type ValidPath,
} from '@formisch/core/vanilla';
import { useEffect } from 'react';
import type * as v from 'valibot';
import type { FieldStore, FormStore } from '../../types/index.ts';
import { useSignals } from '../useSignals/index.ts';

/**
 * Use field config interface.
 */
export interface UseFieldConfig<
  TSchema extends Schema = Schema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field within the form schema.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
}

/**
 * Creates a reactive field store of a specific field within a form store.
 *
 * @param form The form store instance.
 * @param config The field configuration.
 *
 * @returns The field store with reactive properties and element props.
 */
export function useField<
  TSchema extends Schema,
  TFieldPath extends RequiredPath,
>(
  form: FormStore<TSchema>,
  config: UseFieldConfig<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath>;

// @__NO_SIDE_EFFECTS__
export function useField(form: FormStore, config: UseFieldConfig): FieldStore {
  useSignals();

  const internalFormStore = form[INTERNAL];
  const internalFieldStore = getFieldStore(internalFormStore, config.path);

  useEffect(() => {
    return () => {
      internalFieldStore.elements = internalFieldStore.elements.filter(
        (element) => element.isConnected
      );
    };
  }, [internalFieldStore]);

  // TODO: Check if we can use `useMemo` here
  return {
    path: config.path,
    get input() {
      return getFieldInput(internalFieldStore);
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
    props: {
      name: internalFieldStore.name,
      autoFocus: !!internalFieldStore.errors.value,
      ref(element) {
        // TODO: Do we need the if check in React?
        if (element) {
          internalFieldStore.elements.push(element);
        }
      },
      onFocus() {
        setFieldBool(internalFieldStore, 'isTouched', true);
        validateIfRequired(internalFormStore, internalFieldStore, 'touch');
      },
      onChange(event) {
        setFieldInput(
          internalFormStore,
          config.path,
          getElementInput(event.currentTarget, internalFieldStore)
        );
        validateIfRequired(internalFormStore, internalFieldStore, 'input');
        validateIfRequired(internalFormStore, internalFieldStore, 'change');
      },
      onBlur() {
        validateIfRequired(internalFormStore, internalFieldStore, 'blur');
      },
    },
  };
}
