import type { FormSchema } from '@formisch/core';
import { z } from 'zod';
import { transform } from './transform.ts';

/**
 * Wraps a Zod schema with the Formisch IR, producing a `FormSchema` that can
 * be passed to Formisch form APIs.
 *
 * @param schema The Zod schema to wrap.
 *
 * @returns A FormSchema with the IR attached.
 */
// @__NO_SIDE_EFFECTS__
export function toFormisch(schema: z.ZodTypeAny): FormSchema {
  const root = transform(schema);
  return {
    '~standard': (schema as unknown as { '~standard': unknown })['~standard'],
    '~formisch': { version: 1 as const, root },
  } as FormSchema;
}
