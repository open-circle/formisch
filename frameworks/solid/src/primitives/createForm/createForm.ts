import {
  createFormStore,
  type FormConfig,
  type FormSchema,
  getFieldBool,
  INTERNAL,
  validateFormInput,
} from '@formisch/core/solid';
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

  // Read the core directly: Solid 2 memos retain the committed batch snapshot.
  const form = {
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
      return getFieldBool(internalFormStore, 'isTouched');
    },
    get isEdited() {
      return getFieldBool(internalFormStore, 'isEdited');
    },
    get isDirty() {
      return getFieldBool(internalFormStore, 'isDirty');
    },
    get isValid() {
      return !getFieldBool(internalFormStore, 'errors');
    },
    get errors() {
      return internalFormStore.errors.value;
    },
  };

  if (config.validate === 'initial') {
    validateFormInput(form[INTERNAL]);
  }

  return form;
}
