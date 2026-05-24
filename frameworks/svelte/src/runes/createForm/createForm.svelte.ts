import {
  createFormStore,
  type FormConfig,
  type FormSchema,
  getFieldBool,
  INTERNAL,
  validateFormInput,
} from '@formisch/core/svelte';
import { onMount } from 'svelte';
import * as v from 'valibot';
import type { FormStore } from '../../types/index.ts';

/**
 * Creates a reactive form store from a form configuration. The form store
 * manages form state and provides reactive properties.
 *
 * @param config The form configuration.
 *
 * @returns The form store with reactive properties.
 */
export function createForm<TSchema extends FormSchema>(
  config: FormConfig<TSchema>
): FormStore<TSchema>;

// @__NO_SIDE_EFFECTS__
export function createForm(config: FormConfig): FormStore {
  const internalFormStore = createFormStore(config, (input: unknown) =>
    v.safeParseAsync(config.schema, input)
  );

  onMount(() => {
    if (config.validate === 'initial') {
      validateFormInput(internalFormStore);
    }
  });

  const isTouched = $derived(getFieldBool(internalFormStore, 'isTouched'));
  const isDirty = $derived(getFieldBool(internalFormStore, 'isDirty'));
  const isValid = $derived(!getFieldBool(internalFormStore, 'errors'));

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
      return isTouched;
    },
    get isDirty() {
      return isDirty;
    },
    get isValid() {
      return isValid;
    },
    get errors() {
      return internalFormStore.errors.value;
    },
  };
}
