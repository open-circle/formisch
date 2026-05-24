import {
  createFormStore,
  type FormConfig,
  type FormSchema,
  getFieldBool,
  INTERNAL,
  validateFormInput,
} from '@formisch/core/preact';
import { computed } from '@preact/signals';
import { useLayoutEffect, useMemo } from 'preact/hooks';
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
export function useForm<TSchema extends FormSchema>(
  config: FormConfig<TSchema>
): FormStore<TSchema>;

// @__NO_SIDE_EFFECTS__
export function useForm(config: FormConfig): FormStore {
  const form = useMemo(() => {
    const internalFormStore = createFormStore(config, (input: unknown) =>
      v.safeParseAsync(config.schema, input)
    );
    return {
      [INTERNAL]: internalFormStore,
      isSubmitting: internalFormStore.isSubmitting,
      isSubmitted: internalFormStore.isSubmitted,
      isValidating: internalFormStore.isValidating,
      isTouched: computed(() => getFieldBool(internalFormStore, 'isTouched')),
      isDirty: computed(() => getFieldBool(internalFormStore, 'isDirty')),
      isValid: computed(() => !getFieldBool(internalFormStore, 'errors')),
      errors: internalFormStore.errors,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (config.validate === 'initial') {
      validateFormInput(form[INTERNAL]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return form;
}
