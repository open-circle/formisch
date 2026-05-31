import type { Signal } from '@angular/core';
import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FormStore } from '../../types/index.ts';
import { injectForm } from './injectForm.ts';

describe('injectForm', () => {
  test('should return a FormStore typed against the schema', () => {
    const schema = v.object({
      email: v.pipe(v.string(), v.email()),
      password: v.pipe(v.string(), v.minLength(8)),
    });
    const form = injectForm({ schema });

    expectTypeOf(form).toExtend<FormStore<typeof schema>>();
    expectTypeOf(form.isSubmitting).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(form.isSubmitted).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(form.isValidating).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(form.isTouched).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(form.isDirty).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(form.isValid).toEqualTypeOf<Signal<boolean>>();
    expectTypeOf(form.errors).toEqualTypeOf<
      Signal<[string, ...string[]] | null>
    >();
  });

  test('should accept full, partial, and reject mistyped initialInput', () => {
    const schema = v.object({ name: v.string(), age: v.number() });

    injectForm({ schema, initialInput: { name: 'John', age: 30 } });
    injectForm({ schema, initialInput: { name: 'John' } });

    // @ts-expect-error wrong leaf type
    injectForm({ schema, initialInput: { name: 123 } });
  });
});
