import type { PartialValues, Schema } from '@formisch/core/svelte';
import { getInput } from '@formisch/methods/svelte';
import type * as v from 'valibot';
import type { FormStore, MaybeGetter } from '../../types/index.ts';
import { unwrap } from '../../utils/index.ts';

/**
 * Form data store interface.
 */
export interface FormDataStore<TSchema extends Schema = Schema> {
  /**
   * The current input values of the form.
   */
  readonly current: PartialValues<v.InferInput<TSchema>>;
}

/**
 * Returns a reactive store of the entire form input. The `current`
 * property updates on every change, so it can be used for live previews,
 * debug panels, or conditional rendering based on multiple fields.
 *
 * @param form The form store instance or getter function.
 *
 * @returns A reactive store exposing the current form input.
 */
export function useFormData<TSchema extends Schema>(
  form: MaybeGetter<FormStore<TSchema>>
): FormDataStore<TSchema>;

// @__NO_SIDE_EFFECTS__
export function useFormData(form: MaybeGetter<FormStore>): { current: unknown } {
  const current = $derived(getInput(unwrap(form)));
  return {
    get current() {
      return current;
    },
  };
}
