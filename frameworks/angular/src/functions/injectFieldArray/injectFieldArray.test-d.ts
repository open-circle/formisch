import type { Signal } from '@angular/core';
import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FieldArrayStore } from '../../types/index.ts';
import { injectForm } from '../injectForm/index.ts';
import { injectFieldArray } from './injectFieldArray.ts';

describe('injectFieldArray', () => {
  test('should return a FieldArrayStore typed against the form schema and path', () => {
    const schema = v.object({
      todos: v.array(v.object({ title: v.string() })),
    });
    const form = injectForm({ schema });
    const fieldArray = injectFieldArray(form, { path: ['todos'] });

    expectTypeOf(fieldArray).toExtend<FieldArrayStore<typeof schema, ['todos']>>();
    expectTypeOf(fieldArray.path).toEqualTypeOf<['todos']>();
    expectTypeOf(fieldArray.items).toEqualTypeOf<Signal<string[]>>();
    expectTypeOf(fieldArray.errors).toEqualTypeOf<Signal<[string, ...string[]] | null>>();
    expectTypeOf(fieldArray.isTouched).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(fieldArray.isDirty).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(fieldArray.isValid).toEqualTypeOf<Signal<boolean>>();
  });
});
