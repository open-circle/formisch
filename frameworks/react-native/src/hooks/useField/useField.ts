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
import { useMemo, useRef } from 'react';
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

  // Track the last registered element instance as a fallback for React 18,
  // which ignores ref cleanup functions and calls the ref with `null` instead
  const instanceRef = useRef<FieldElement | null>(null);

  return useMemo(() => {
    // Removes element instances that do not pass the given filter from the
    // field store.
    // Hint: `initialElements` is kept in sync while the store still owns it
    // (same reference) and filtered separately otherwise, so the detached
    // element of a removed array item does not survive in the reset baseline
    const filterElements = (predicate: (element: FieldElement) => boolean) => {
      const elements = internalFieldStore.elements.filter(predicate);
      if (internalFieldStore.elements === internalFieldStore.initialElements) {
        internalFieldStore.initialElements = elements;
      } else {
        internalFieldStore.initialElements =
          internalFieldStore.initialElements.filter(predicate);
      }
      internalFieldStore.elements = elements;
    };

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
        ref(element) {
          if (element) {
            instanceRef.current = element;
            // Hint: An array operation may have moved an element array in
            // which the element is already registered, so it is only added
            // once
            if (!internalFieldStore.elements.includes(element)) {
              internalFieldStore.elements.push(element);
            }
            // Hint: React 19 and React Native's merged refs invoke this
            // cleanup with the exact element that detaches, so multiple
            // elements sharing this ref are removed individually
            return () => {
              filterElements((item) => item !== element);
            };
          }
          // Hint: React 18 and react-native-web's merged refs ignore the
          // cleanup above and call the ref with `null` instead, so only the
          // last registered instance is known and can be removed
          const instance = instanceRef.current;
          instanceRef.current = null;
          filterElements((item) => item !== instance);
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalFormStore, internalFieldStore]);
}
