import type { FormSchema, RequiredPath } from '@formisch/core/angular';
import * as v from 'valibot';
import { describe, test } from 'vitest';
import { injectField } from '../functions/injectField/index.ts';
import { injectForm } from '../functions/injectForm/index.ts';
import type { FieldStore } from './field.ts';

/**
 * Mimics a directive or component that works with any field, for example
 * `FormischControl` or a reusable input component. The type arguments are
 * inferred from the field store that is passed in.
 */
const acceptsAnyField = <
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath,
>(
  field: FieldStore<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath> => field;

/**
 * Mimics a consumer that widens to the default `FieldStore` instead of staying
 * generic over the schema and path.
 */
const acceptsBareFieldStore = (field: FieldStore): FieldStore => field;

describe('FieldStore', () => {
  const schema = v.object({
    heading: v.string(),
    user: v.object({ name: v.string(), age: v.number() }),
    items: v.array(v.object({ label: v.string() })),
  });

  test('should accept any field when the consumer is generic over schema and path', () => {
    const form = injectForm({ schema });

    acceptsAnyField(injectField(form, { path: ['heading'] }));

    const nestedField = injectField(form, { path: ['user', 'name'] });
    acceptsAnyField(nestedField);

    const numberField = injectField(form, { path: ['user', 'age'] });
    acceptsAnyField(numberField);

    const arrayField = injectField(form, { path: ['items', 0, 'label'] });
    acceptsAnyField(arrayField);
  });

  test('should reject a concrete field store where the default FieldStore is expected', () => {
    const form = injectForm({ schema });
    const field = injectField(form, { path: ['heading'] });

    // @ts-expect-error `FieldStore` is invariant in its value type, because
    // `setInput` takes that value as an argument. Consumers that work with any
    // field must be generic over the schema and path instead of widening.
    acceptsBareFieldStore(field);
  });
});
