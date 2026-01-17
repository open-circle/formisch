import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FormStore } from '../../types/index.ts';
import { useForm } from './useForm.ts';

describe('useForm types', () => {
  test('should infer schema type from config', () => {
    const schema = v.object({ name: v.string() });
    const form = useForm({ schema });

    expectTypeOf(form).toMatchTypeOf<FormStore<typeof schema>>();
  });

  test('should have correct property types', () => {
    const schema = v.object({ name: v.string() });
    const form = useForm({ schema });

    expectTypeOf(form.isSubmitting).toBeBoolean();
    expectTypeOf(form.isSubmitted).toBeBoolean();
    expectTypeOf(form.isValidating).toBeBoolean();
    expectTypeOf(form.isTouched).toBeBoolean();
    expectTypeOf(form.isDirty).toBeBoolean();
    expectTypeOf(form.isValid).toBeBoolean();
    expectTypeOf(form.errors).toEqualTypeOf<[string, ...string[]] | null>();
  });

  test('should type check initial input', () => {
    const schema = v.object({
      name: v.string(),
      age: v.number(),
    });

    // This should compile
    useForm({
      schema,
      initialInput: { name: 'John', age: 30 },
    });

    // Partial input should also be allowed
    useForm({
      schema,
      initialInput: { name: 'John' },
    });
  });
});
