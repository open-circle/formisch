import {
  type FormSchema,
  getElementInput,
  getFieldBool,
  getFieldInput,
  getFieldStore,
  INTERNAL,
  type RequiredPath,
  setFieldBool,
  setFieldInput,
  validateIfRequired,
  type ValidPath,
} from '@formisch/core/react';
import { useEffect, useMemo } from 'react';
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
 * Creates a reactive field store for a specific field within a form store.
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
  const internalFieldStore = getFieldStore(internalFormStore, config.path)!;

  useEffect(() => {
    return () => {
      const elements = internalFieldStore.elements.filter(
        (element) => element.isConnected
      );
      // Keep `initialElements` in sync while the store still owns it (same
      // reference) and filter it separately otherwise, so the detached element
      // of a removed array item does not survive in the reset baseline
      if (internalFieldStore.elements === internalFieldStore.initialElements) {
        internalFieldStore.initialElements = elements;
      } else {
        internalFieldStore.initialElements =
          internalFieldStore.initialElements.filter(
            (element) => element.isConnected
          );
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
        name: internalFieldStore.name,
        autoFocus: !!internalFieldStore.errors.value,
        ref(element) {
          // An array reorder transfers registered elements between the field
          // stores, so the element may already be present when the framework
          // re-registers it against the destination store
          if (element && !internalFieldStore.elements.includes(element)) {
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [internalFormStore, internalFieldStore]
  );
}
