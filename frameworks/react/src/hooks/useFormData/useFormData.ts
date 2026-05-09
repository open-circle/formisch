import type { PartialValues, Schema } from '@formisch/core/react';
import { getInput } from '@formisch/methods/react';
import type * as v from 'valibot';
import type { FormStore } from '../../types/index.ts';
import { useSignals } from '../useSignals/index.ts';

/**
 * Returns a reactive snapshot of the entire form input. The value updates
 * on every change, so it can be used for live previews, debug panels, or
 * conditional rendering based on multiple fields.
 *
 * @param form The form store instance.
 *
 * @returns The current form input as a partial, schema-shaped object.
 */
export function useFormData<TSchema extends Schema>(
  form: FormStore<TSchema>
): PartialValues<v.InferInput<TSchema>>;

// @__NO_SIDE_EFFECTS__
export function useFormData(form: FormStore): unknown {
  useSignals();
  return getInput(form);
}
