import {
  type FieldElement,
  type FormSchema,
  getFieldBool,
  getFieldInput,
  getFieldStore,
  INTERNAL,
  type RequiredPath,
  setFieldBool,
  setFieldInput,
  validateIfRequired,
  type ValidPath,
} from '@formisch/core/react-native';
import { useEffect, useMemo, useRef } from 'react';
import type { TextInput } from 'react-native';
import type * as v from 'valibot';
import type { FieldStore, FormStore } from '../../types/index.ts';
import { useSignals } from '../useSignals/index.ts';

/**
 * Use field config interface.
 */
export interface UseFieldConfig<
  TSchema extends FormSchema = FormSchema,
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
  TSchema extends FormSchema,
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

  // Track the registered `TextInput` instance so it can be identified and
  // removed on unmount, since native elements have no `isConnected` check
  const instanceRef = useRef<TextInput | null>(null);

  useEffect(() => {
    return () => {
      const instance = instanceRef.current as unknown as FieldElement | null;
      const elements = internalFieldStore.elements.filter(
        (element) => element !== instance
      );
      // Keep `initialElements` in sync unless a reorder has moved the elements,
      // so resetting a remounted field restores its live element, not a stale one
      if (internalFieldStore.elements === internalFieldStore.initialElements) {
        internalFieldStore.initialElements = elements;
      }
      internalFieldStore.elements = elements;
    };
  }, [internalFieldStore]);

  return useMemo(
    () => ({
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
      get isEdited() {
        return getFieldBool(internalFieldStore, 'isEdited');
      },
      get isDirty() {
        return getFieldBool(internalFieldStore, 'isDirty');
      },
      get isValid() {
        return !getFieldBool(internalFieldStore, 'errors');
      },
      onChange(value) {
        setFieldInput(internalFormStore, config.path, value);
        validateIfRequired(internalFormStore, internalFieldStore, 'input');
        validateIfRequired(internalFormStore, internalFieldStore, 'change');
      },
      props: {
        ref(instance) {
          // React nulls the ref before running the effect cleanup below, so
          // only the non-null call is recorded and the last known instance
          // is what gets filtered out on unmount
          if (instance) {
            instanceRef.current = instance;
            internalFieldStore.elements.push(
              instance as unknown as FieldElement
            );
          }
        },
        onFocus() {
          setFieldBool(internalFieldStore, 'isTouched', true);
          validateIfRequired(internalFormStore, internalFieldStore, 'touch');
        },
        onChangeText(text) {
          setFieldInput(internalFormStore, config.path, text);
          validateIfRequired(internalFormStore, internalFieldStore, 'input');
          validateIfRequired(internalFormStore, internalFieldStore, 'change');
        },
        onBlur() {
          validateIfRequired(internalFormStore, internalFieldStore, 'blur');
        },
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [internalFormStore, internalFieldStore]
  );
}
