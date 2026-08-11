import type { FormSchema } from '@formisch/core';
import * as v from 'valibot';
import { transform } from './transform.ts';

/**
 * Wraps a Valibot schema with the Formisch IR, producing a `FormSchema` that
 * can be passed to Formisch form APIs. The Standard Schema `~standard`
 * passthrough is preserved for validation.
 *
 * @param schema The Valibot schema to wrap.
 *
 * @returns A FormSchema with the IR attached.
 */
// @__NO_SIDE_EFFECTS__
export function toFormisch(schema: v.GenericSchema): FormSchema {
  const root = transform(schema);
  return {
    '~standard': (schema as unknown as { '~standard': unknown })['~standard'],
    '~formisch': { version: 1 as const, root },
  } as FormSchema;
}
