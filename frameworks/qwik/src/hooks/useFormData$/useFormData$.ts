import type { PartialValues, Schema } from '@formisch/core/qwik';
import { getInput } from '@formisch/methods/qwik';
import { type ReadonlySignal, useComputed$ } from '@qwik.dev/core';
import type * as v from 'valibot';
import type { FormStore } from '../../types/index.ts';

/**
 * Returns a reactive signal of the entire form input. The signal value
 * updates on every change, so it can be used for live previews, debug
 * panels, or conditional rendering based on multiple fields.
 *
 * @param form The form store instance.
 *
 * @returns A readonly signal of the current form input.
 */
export function useFormData$<TSchema extends Schema>(
  form: FormStore<TSchema>
): ReadonlySignal<PartialValues<v.InferInput<TSchema>>>;

// @__NO_SIDE_EFFECTS__
export function useFormData$(form: FormStore): ReadonlySignal<unknown> {
  return useComputed$(() => getInput(form));
}
