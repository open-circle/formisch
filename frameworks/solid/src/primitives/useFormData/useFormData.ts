import type { PartialValues, Schema } from '@formisch/core/solid';
import { getInput } from '@formisch/methods/solid';
import { type Accessor, createMemo } from 'solid-js';
import type * as v from 'valibot';
import type { FormStore, MaybeGetter } from '../../types/index.ts';
import { unwrap } from '../../utils/index.ts';

/**
 * Returns a reactive accessor of the entire form input. The value updates
 * on every change, so it can be used for live previews, debug panels, or
 * conditional rendering based on multiple fields.
 *
 * @param form The form store instance or getter function.
 *
 * @returns An accessor for the current form input.
 */
export function useFormData<TSchema extends Schema>(
  form: MaybeGetter<FormStore<TSchema>>
): Accessor<PartialValues<v.InferInput<TSchema>>>;

// @__NO_SIDE_EFFECTS__
export function useFormData(
  form: MaybeGetter<FormStore>
): Accessor<unknown> {
  const getFormData = createMemo(() => getInput(unwrap(form)));
  return getFormData;
}
