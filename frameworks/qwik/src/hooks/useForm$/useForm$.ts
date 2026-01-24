import {
  createFormStore,
  type FormConfig,
  getFieldBool,
  INTERNAL,
  type Schema,
  validateFormInput,
} from '@formisch/core/qwik';
import type { QRL } from '@qwik.dev/core';
import {
  $,
  createComputed$,
  implicit$FirstArg,
  useConstant,
  useTask$,
} from '@qwik.dev/core';
import * as v from 'valibot';
import type { FormStore } from '../../types/index.ts';
import { useResolvedQrl } from '../useResolvedQrl/useResolvedQrl.ts';

/**
 * Creates a reactive form store from a form configuration. The form store
 * manages form state and provides reactive properties.
 *
 * @param configQrl The QRL containing the form configuration.
 *
 * @returns The form store with reactive properties.
 */
export function useFormQrl<TSchema extends Schema>(
  configQrl: QRL<FormConfig<TSchema>>
): FormStore<TSchema>;

// @__NO_SIDE_EFFECTS__
export function useFormQrl(configQrl: QRL<FormConfig>): FormStore {
  const config = useResolvedQrl(configQrl);

  const form = useConstant(() => {
    const internalFormStore = createFormStore(
      {
        ...config,
        schema: JSON.parse(JSON.stringify(config.schema)),
      },
      $(async (input: unknown) =>
        v.safeParseAsync((await configQrl.resolve()).schema, input)
      )
    );
    return {
      [INTERNAL]: internalFormStore,
      isSubmitting: internalFormStore.isSubmitting,
      isSubmitted: internalFormStore.isSubmitted,
      isValidating: internalFormStore.isValidating,
      isTouched: createComputed$(() =>
        getFieldBool(internalFormStore, 'isTouched')
      ),
      isDirty: createComputed$(() =>
        getFieldBool(internalFormStore, 'isDirty')
      ),
      isValid: createComputed$(
        () => !getFieldBool(internalFormStore, 'errors')
      ),
      errors: internalFormStore.errors,
    };
  });

  const validate = config.validate;
  useTask$(async () => {
    if (validate === 'initial') {
      await validateFormInput(form[INTERNAL]);
    }
  });

  return form;
}

/**
 * Creates a reactive form store from a form configuration. The form store
 * manages form state and provides reactive properties.
 *
 * @returns The form store with reactive properties.
 */
export const useForm$ = implicit$FirstArg(useFormQrl);
