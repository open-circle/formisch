import type { Signal } from '@angular/core';
import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FieldStore } from '../../types/index.ts';
import { injectForm } from '../injectForm/index.ts';
import { injectField } from './injectField.ts';

const schemaSimple = v.object({ name: v.string() });
const schemaMixed = v.object({ name: v.string(), age: v.number() });
const schemaEmail = v.object({ email: v.pipe(v.string(), v.email()) });
const schemaNested = v.object({
  user: v.object({ email: v.string() }),
  tags: v.array(v.string()),
});

declare const formSimple: ReturnType<typeof injectForm<typeof schemaSimple>>;
declare const formMixed: ReturnType<typeof injectForm<typeof schemaMixed>>;
declare const formEmail: ReturnType<typeof injectForm<typeof schemaEmail>>;
declare const formNested: ReturnType<typeof injectForm<typeof schemaNested>>;

describe('injectField', () => {
  test('should return a FieldStore typed against the form schema and path', () => {
    const field = injectField(formSimple, { path: ['name'] });

    expectTypeOf(field).toEqualTypeOf<FieldStore<typeof schemaSimple, ['name']>>();
  });

  test('should narrow input type for primitive leaves', () => {
    expectTypeOf(injectField(formMixed, { path: ['name'] }).input).toEqualTypeOf<
      Signal<string | undefined>
    >();
    expectTypeOf(injectField(formMixed, { path: ['age'] }).input).toEqualTypeOf<
      Signal<number | undefined>
    >();
  });

  test('should narrow onInput value type for primitive leaves', () => {
    expectTypeOf(
      injectField(formSimple, { path: ['name'] }).onInput
    ).toEqualTypeOf<(value: string | undefined) => void>();
  });

  test('should narrow input type through nested object and array index paths', () => {
    expectTypeOf(
      injectField(formNested, { path: ['user', 'email'] }).input
    ).toEqualTypeOf<Signal<string | undefined>>();
    expectTypeOf(
      injectField(formNested, { path: ['tags', 0] }).input
    ).toEqualTypeOf<Signal<string | undefined>>();
  });

  test('should expose Signal boolean state properties', () => {
    const field = injectField(formEmail, { path: ['email'] });

    expectTypeOf(field.errors).toEqualTypeOf<Signal<[string, ...string[]] | null>>();
    expectTypeOf(field.isTouched).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(field.isDirty).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(field.isValid).toEqualTypeOf<Signal<boolean>>();
  });

  test('should expose props with name and autofocus', () => {
    const field = injectField(formEmail, { path: ['email'] });

    expectTypeOf(field.props.name).toEqualTypeOf<string>();
    expectTypeOf(field.props.autofocus).toEqualTypeOf<boolean>();
  });

  test('should reject invalid paths', () => {
    // @ts-expect-error nonexistent field
    injectField(formSimple, { path: ['nonexistent'] });

    // @ts-expect-error path through a string leaf
    injectField(formSimple, { path: ['name', 'nested'] });
  });
});
