import {
  afterNextRender,
  assertInInjectionContext,
  computed,
} from '@angular/core';
import {
  createFormStore,
  type FormConfig,
  getFieldBool,
  INTERNAL,
  type Schema,
  validateFormInput,
} from '@formisch/core/angular';
import * as v from 'valibot';
import type { FormStore } from '../../types/index.ts';

/**
 * Creates a reactive form store from a form configuration. The form store
 * manages form state and provides reactive Signal properties callable in templates.
 *
 * Must be called in an injection context (component constructor or field initializer).
 *
 * @param config The form configuration.
 *
 * @returns The form store with reactive Signal properties.
 */
export function injectForm<TSchema extends Schema>(
  config: FormConfig<TSchema>
): FormStore<TSchema>;

// @__NO_SIDE_EFFECTS__
export function injectForm(config: FormConfig): FormStore {
  assertInInjectionContext(injectForm);

  const internalFormStore = createFormStore(config, (input: unknown) =>
    v.safeParseAsync(config.schema, input)
  );

  if (config.validate === 'initial') {
    afterNextRender(() => validateFormInput(internalFormStore));
  }

  return {
    [INTERNAL]: internalFormStore,
    isSubmitting: computed(() => internalFormStore.isSubmitting.value),
    isSubmitted: computed(() => internalFormStore.isSubmitted.value),
    isValidating: computed(() => internalFormStore.isValidating.value),
    isTouched: computed(() => getFieldBool(internalFormStore, 'isTouched')),
    isDirty: computed(() => getFieldBool(internalFormStore, 'isDirty')),
    isValid: computed(() => !getFieldBool(internalFormStore, 'errors')),
    errors: computed(() => internalFormStore.errors.value),
  };
}
