import type { ReadonlySignal } from '@preact/signals';
import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FieldStore } from '../../types/index.ts';
import { useForm } from '../useForm/index.ts';
import { useField } from './useField.ts';

describe('useField', () => {
  test('should return a FieldStore typed against the form schema and path', () => {
    const schema = v.object({ name: v.string() });
    const form = useForm({ schema });
    const field = useField(form, { path: ['name'] });

    expectTypeOf(field).toEqualTypeOf<FieldStore<typeof schema, ['name']>>();
  });

  test('should narrow input type for primitive leaves', () => {
    const schema = v.object({ name: v.string(), age: v.number() });
    const form = useForm({ schema });

    expectTypeOf(useField(form, { path: ['name'] }).input).toEqualTypeOf<
      ReadonlySignal<string | undefined>
    >();
    expectTypeOf(useField(form, { path: ['age'] }).input).toEqualTypeOf<
      ReadonlySignal<number | undefined>
    >();
  });

  test('should narrow input type through nested object and array index paths', () => {
    const schema = v.object({
      user: v.object({ email: v.string() }),
      tags: v.array(v.string()),
    });
    const form = useForm({ schema });

    expectTypeOf(
      useField(form, { path: ['user', 'email'] }).input
    ).toEqualTypeOf<ReadonlySignal<string | undefined>>();
    expectTypeOf(useField(form, { path: ['tags', 0] }).input).toEqualTypeOf<
      ReadonlySignal<string | undefined>
    >();
  });

  test('should reject invalid paths', () => {
    const schema = v.object({ name: v.string() });
    const form = useForm({ schema });

    // @ts-expect-error nonexistent field
    useField(form, { path: ['nonexistent'] });

    // @ts-expect-error path through a string leaf
    useField(form, { path: ['name', 'nested'] });
  });
});
