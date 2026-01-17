import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FieldStore } from '../../types/index.ts';
import { useForm } from '../useForm/index.ts';
import { useField } from './useField.ts';

describe('useField types', () => {
  test('should infer field type from path', () => {
    const schema = v.object({
      name: v.string(),
      age: v.number(),
    });
    const form = useForm({ schema });
    const field = useField(form, { path: ['name'] });

    expectTypeOf(field).toMatchTypeOf<FieldStore<typeof schema, ['name']>>();
    expectTypeOf(field.input).toEqualTypeOf<string | undefined>();
  });

  test('should infer nested field type', () => {
    const schema = v.object({
      user: v.object({
        email: v.string(),
      }),
    });
    const form = useForm({ schema });
    const field = useField(form, { path: ['user', 'email'] });

    expectTypeOf(field.input).toEqualTypeOf<string | undefined>();
  });

  test('should have correct property types', () => {
    const schema = v.object({ name: v.string() });
    const form = useForm({ schema });
    const field = useField(form, { path: ['name'] });

    expectTypeOf(field.path).toEqualTypeOf<['name']>();
    expectTypeOf(field.errors).toEqualTypeOf<[string, ...string[]] | null>();
    expectTypeOf(field.isTouched).toBeBoolean();
    expectTypeOf(field.isDirty).toBeBoolean();
    expectTypeOf(field.isValid).toBeBoolean();
  });

  test('should have correct props types', () => {
    const schema = v.object({ name: v.string() });
    const form = useForm({ schema });
    const field = useField(form, { path: ['name'] });

    expectTypeOf(field.props.name).toBeString();
    expectTypeOf(field.props.autoFocus).toBeBoolean();
    expectTypeOf(field.props.ref).toBeFunction();
    expectTypeOf(field.props.onFocus).toBeFunction();
    expectTypeOf(field.props.onChange).toBeFunction();
    expectTypeOf(field.props.onBlur).toBeFunction();
  });
});
