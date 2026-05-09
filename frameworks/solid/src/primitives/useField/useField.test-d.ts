import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FieldStore } from '../../types/index.ts';
import { createForm } from '../createForm/index.ts';
import { useField } from './useField.ts';

describe('useField', () => {
  test('should return a FieldStore typed against the form schema and path', () => {
    const schema = v.object({ name: v.string() });
    const form = createForm({ schema });
    const field = useField(form, { path: ['name'] });

    expectTypeOf(field).toEqualTypeOf<FieldStore<typeof schema, ['name']>>();
  });

  test('should narrow input type for primitive leaves', () => {
    const schema = v.object({ name: v.string(), age: v.number() });
    const form = createForm({ schema });

    expectTypeOf(useField(form, { path: ['name'] }).input).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(useField(form, { path: ['age'] }).input).toEqualTypeOf<
      number | undefined
    >();
  });

  test('should narrow input type through nested object and array index paths', () => {
    const schema = v.object({
      user: v.object({ email: v.string() }),
      tags: v.array(v.string()),
    });
    const form = createForm({ schema });

    expectTypeOf(
      useField(form, { path: ['user', 'email'] }).input
    ).toEqualTypeOf<string | undefined>();
    expectTypeOf(useField(form, { path: ['tags', 0] }).input).toEqualTypeOf<
      string | undefined
    >();
  });

  test('should reject invalid paths', () => {
    const schema = v.object({ name: v.string() });
    const form = createForm({ schema });

    // @ts-expect-error nonexistent field
    useField(form, { path: ['nonexistent'] });

    // @ts-expect-error path through a string leaf
    useField(form, { path: ['name', 'nested'] });
  });
});
