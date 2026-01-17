import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FieldArrayStore } from '../../types/index.ts';
import { useForm } from '../useForm/index.ts';
import { useFieldArray } from './useFieldArray.ts';

describe('useFieldArray types', () => {
  test('should infer array type from path', () => {
    const schema = v.object({
      tags: v.array(v.string()),
    });
    const form = useForm({ schema });
    const fieldArray = useFieldArray(form, { path: ['tags'] });

    expectTypeOf(fieldArray).toMatchTypeOf<
      FieldArrayStore<typeof schema, ['tags']>
    >();
  });

  test('should infer nested array type', () => {
    const schema = v.object({
      user: v.object({
        hobbies: v.array(v.string()),
      }),
    });
    const form = useForm({ schema });
    const fieldArray = useFieldArray(form, { path: ['user', 'hobbies'] });

    expectTypeOf(fieldArray.path).toEqualTypeOf<['user', 'hobbies']>();
  });

  test('should have correct property types', () => {
    const schema = v.object({ items: v.array(v.string()) });
    const form = useForm({ schema });
    const fieldArray = useFieldArray(form, { path: ['items'] });

    expectTypeOf(fieldArray.items).toEqualTypeOf<readonly string[]>();
    expectTypeOf(fieldArray.errors).toEqualTypeOf<
      [string, ...string[]] | null
    >();
    expectTypeOf(fieldArray.isTouched).toBeBoolean();
    expectTypeOf(fieldArray.isDirty).toBeBoolean();
    expectTypeOf(fieldArray.isValid).toBeBoolean();
  });

  test('should work with array of objects', () => {
    const schema = v.object({
      users: v.array(
        v.object({
          name: v.string(),
          age: v.number(),
        })
      ),
    });
    const form = useForm({ schema });
    const fieldArray = useFieldArray(form, { path: ['users'] });

    expectTypeOf(fieldArray.items).toEqualTypeOf<readonly string[]>();
  });
});
