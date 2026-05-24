import {
  createFormStore,
  type FormConfig,
  type FormSchema,
  getFieldBool,
  INTERNAL,
  validateFormInput,
} from '@formisch/core/vue';
import * as v from 'valibot';
import { computed, onBeforeMount } from 'vue';
import type { FormStore } from '../../types/index.ts';

/**
 * Creates a reactive form store from a form configuration. The form store
 * manages form state and provides reactive properties.
 *
 * @param config The form configuration.
 *
 * @returns The form store with reactive properties.
 */
export function useForm<TSchema extends FormSchema>(
  config: FormConfig<TSchema>
): FormStore<TSchema>;

// @__NO_SIDE_EFFECTS__
export function useForm(config: FormConfig): FormStore {
  const internalFormStore = createFormStore(config, (input: unknown) =>
    v.safeParseAsync(config.schema, input)
  );

  onBeforeMount(async () => {
    if (config.validate === 'initial') {
      await validateFormInput(internalFormStore);
    }
  });

  const isTouched = computed(() =>
    getFieldBool(internalFormStore, 'isTouched')
  );
  const isDirty = computed(() => getFieldBool(internalFormStore, 'isDirty'));
  const isValid = computed(() => !getFieldBool(internalFormStore, 'errors'));

  return {
    [INTERNAL]: internalFormStore,
    get isSubmitting() {
      return internalFormStore.isSubmitting.value;
    },
    get isSubmitted() {
      return internalFormStore.isSubmitted.value;
    },
    get isValidating() {
      return internalFormStore.isValidating.value;
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
    get errors() {
      return internalFormStore.errors.value;
    },
  };
}
