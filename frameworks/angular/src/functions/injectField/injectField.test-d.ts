import type { Signal } from '@angular/core';
import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FieldStore } from '../../types/index.ts';
import { injectForm } from '../injectForm/index.ts';
import { injectField } from './injectField.ts';

describe('injectField', () => {
  test('should return a FieldStore typed against the form schema and path', () => {
    const schema = v.object({ name: v.string() });
    const form = injectForm({ schema });
    const field = injectField(form, { path: ['name'] });

    expectTypeOf(field).toEqualTypeOf<FieldStore<typeof schema, ['name']>>();
  });

  test('should narrow input type for primitive leaves', () => {
    const schema = v.object({ name: v.string(), age: v.number() });
    const form = injectForm({ schema });

    expectTypeOf(injectField(form, { path: ['name'] }).input).toEqualTypeOf<
      Signal<string | undefined>
    >();
    expectTypeOf(injectField(form, { path: ['age'] }).input).toEqualTypeOf<
      Signal<number | undefined>
    >();
  });

  test('should narrow onInput value type for primitive leaves', () => {
    const schema = v.object({ name: v.string() });
    const form = injectForm({ schema });

    expectTypeOf(injectField(form, { path: ['name'] }).onInput).toEqualTypeOf<
      (value: string | undefined) => void
    >();
  });

  test('should narrow input type through nested object and array index paths', () => {
    const schema = v.object({
      user: v.object({ email: v.string() }),
      tags: v.array(v.string()),
    });
    const form = injectForm({ schema });

    expectTypeOf(
      injectField(form, { path: ['user', 'email'] }).input
    ).toEqualTypeOf<Signal<string | undefined>>();
    expectTypeOf(injectField(form, { path: ['tags', 0] }).input).toEqualTypeOf<
      Signal<string | undefined>
    >();
  });

  test('should expose Signal boolean state properties', () => {
    const schema = v.object({ email: v.pipe(v.string(), v.email()) });
    const form = injectForm({ schema });
    const field = injectField(form, { path: ['email'] });

    expectTypeOf(field.errors).toEqualTypeOf<
      Signal<[string, ...string[]] | null>
    >();
    expectTypeOf(field.isTouched).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(field.isDirty).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(field.isValid).toEqualTypeOf<Signal<boolean>>();
  });

  test('should expose props with name and autofocus', () => {
    const schema = v.object({ email: v.pipe(v.string(), v.email()) });
    const form = injectForm({ schema });
    const field = injectField(form, { path: ['email'] });

    expectTypeOf(field.props.name).toEqualTypeOf<string>();
    expectTypeOf(field.props.autofocus).toEqualTypeOf<boolean>();
  });

  test('should reject invalid paths', () => {
    const schema = v.object({ name: v.string() });
    const form = injectForm({ schema });

    // @ts-expect-error nonexistent field
    injectField(form, { path: ['nonexistent'] });

    // @ts-expect-error path through a string leaf
    injectField(form, { path: ['name', 'nested'] });
  });
});
