import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FormStore } from '../../types/index.ts';
import { createForm } from './createForm.ts';

describe('createForm', () => {
  test('should return a FormStore typed against the schema', () => {
    const schema = v.object({ name: v.string() });
    const form = createForm({ schema });

    expectTypeOf(form).toEqualTypeOf<FormStore<typeof schema>>();
  });

  test('should accept full, partial, and reject mistyped initialInput', () => {
    const schema = v.object({ name: v.string(), age: v.number() });

    createForm({ schema, initialInput: { name: 'John', age: 30 } });
    createForm({ schema, initialInput: { name: 'John' } });

    // @ts-expect-error wrong leaf type
    createForm({ schema, initialInput: { name: 123 } });
  });
});
