import type { PartialValues, Schema } from '@formisch/core/vue';
import { getInput } from '@formisch/methods/vue';
import type * as v from 'valibot';
import {
  computed,
  type ComputedRef,
  type MaybeRefOrGetter,
  toValue,
} from 'vue';
import type { FormStore } from '../../types/index.ts';

/**
 * Returns a reactive computed ref of the entire form input. The value
 * updates on every change, so it can be used for live previews, debug
 * panels, or conditional rendering based on multiple fields.
 *
 * @param form The form store instance, ref, or getter function.
 *
 * @returns A computed ref of the current form input.
 */
export function useFormData<TSchema extends Schema>(
  form: MaybeRefOrGetter<FormStore<TSchema>>
): ComputedRef<PartialValues<v.InferInput<TSchema>>>;

// @__NO_SIDE_EFFECTS__
export function useFormData(
  form: MaybeRefOrGetter<FormStore>
): ComputedRef<unknown> {
  return computed(() => getInput(toValue(form)));
}
