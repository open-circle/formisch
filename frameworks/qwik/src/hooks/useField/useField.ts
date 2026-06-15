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
} from '@formisch/core/qwik';
import {
  $,
  createComputed$,
  useComputed$,
  useConstant,
  useTask$,
} from '@qwik.dev/core';
import type * as v from 'valibot';
import type { FieldStore, FormStore } from '../../types/index.ts';
import { usePathSignal } from '../usePathSignal/index.ts';

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
  const pathSignal = usePathSignal(config.path);
  const internalFormStore = form[INTERNAL];
  const internalFieldStore = useComputed$(() =>
    getFieldStore(internalFormStore, pathSignal.value)
  );

  useTask$(({ track, cleanup }) => {
    track(internalFieldStore);
    cleanup(() => {
      const internalFieldStoreValue = internalFieldStore.value;
      const elements = internalFieldStoreValue.elements.filter(
        (element) => element.isConnected
      );
      // Keep `initialElements` in sync unless a reorder has moved the elements,
      // so resetting a remounted field restores its live element, not a stale one
      if (
        internalFieldStoreValue.elements ===
        internalFieldStoreValue.initialElements
      ) {
        internalFieldStoreValue.initialElements = elements;
      }
      internalFieldStoreValue.elements = elements;
    });
  });

  return useConstant(() => ({
    path: pathSignal,
    input: createComputed$(() => getFieldInput(internalFieldStore.value)),
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
    onInput: $((value) => {
      setFieldInput(internalFormStore, pathSignal.value, value);
      validateIfRequired(internalFormStore, internalFieldStore.value, 'input');
    }),
    props: {
      get name() {
        return internalFieldStore.value.name;
      },
      autofocus: !!internalFieldStore.value.errors.value,
      ref: $((element) => {
        internalFieldStore.value.elements.push(element);
      }),
      onFocus$: $(() => {
        setFieldBool(internalFieldStore.value, 'isTouched', true);
        validateIfRequired(
          internalFormStore,
          internalFieldStore.value,
          'touch'
        );
      }),
      onInput$: $((_, element) => {
        setFieldInput(
          internalFormStore,
          pathSignal.value,
          getElementInput(element, internalFieldStore.value)
        );
        validateIfRequired(
          internalFormStore,
          internalFieldStore.value,
          'input'
        );
      }),
      onChange$: $(() => {
        validateIfRequired(
          internalFormStore,
          internalFieldStore.value,
          'change'
        );
      }),
      onBlur$: $(() => {
        validateIfRequired(internalFormStore, internalFieldStore.value, 'blur');
      }),
    },
  }));
}
