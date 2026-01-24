import {
  type FieldElement,
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
} from '@formisch/core/vue';
import type * as v from 'valibot';
import type { MaybeRefOrGetter } from 'vue';
import { computed, onUnmounted, toValue } from 'vue';
import type { FieldStore, FormStore } from '../../types/index.ts';

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
 * @param form The form store instance, ref, or getter function.
 * @param config The field configuration, ref, or getter function.
 *
 * @returns The field store with reactive properties and element props.
 */
export function useField<
  TSchema extends Schema,
  TFieldPath extends RequiredPath,
>(
  form: MaybeRefOrGetter<FormStore<TSchema>>,
  config: MaybeRefOrGetter<UseFieldConfig<TSchema, TFieldPath>>
): FieldStore<TSchema, TFieldPath>;

// @__NO_SIDE_EFFECTS__
export function useField(
  form: MaybeRefOrGetter<FormStore>,
  config: MaybeRefOrGetter<UseFieldConfig>
): FieldStore {
  const path = computed(() => toValue(config).path);
  const internalFormStore = computed(() => toValue(form)[INTERNAL]);
  const internalFieldStore = computed(() =>
    getFieldStore(internalFormStore.value, path.value)
  );

  onUnmounted(() => {
    internalFieldStore.value.elements =
      internalFieldStore.value.elements.filter(
        (element) => element.isConnected
      );
  });

  const input = computed(() => getFieldInput(internalFieldStore.value));
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
      return path.value;
    },
    get input() {
      return input.value;
    },
    set input(value) {
      setFieldInput(internalFormStore.value, path.value, value);
      validateIfRequired(
        internalFormStore.value,
        internalFieldStore.value,
        'input'
      );
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
    props: {
      get name() {
        return internalFieldStore.value.name;
      },
      autofocus: !!internalFieldStore.value.errors.value,
      ref(element) {
        if (element) {
          internalFieldStore.value.elements.push(element as FieldElement);
        }
      },
      onFocus() {
        setFieldBool(internalFieldStore.value, 'isTouched', true);
        validateIfRequired(
          internalFormStore.value,
          internalFieldStore.value,
          'touch'
        );
      },
      onChange() {
        validateIfRequired(
          internalFormStore.value,
          internalFieldStore.value,
          'change'
        );
      },
      onBlur() {
        validateIfRequired(
          internalFormStore.value,
          internalFieldStore.value,
          'blur'
        );
      },
    },
  };
}
