import type { Signal } from '@angular/core';
import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import { injectField, injectForm } from '../../functions/index.ts';
import type { FormischFieldContext } from './FormischField.ts';

describe('FormischField', () => {
  test('provides the typed field store as the $implicit context', () => {
    const schema = v.object({
      email: v.string(),
      age: v.number(),
      todos: v.array(v.object({ label: v.string() })),
    });
    const form = injectForm({ schema });
    const emailField = injectField(form, { path: ['email'] });

    // The directive's $implicit context is exactly the injectField return type.
    expectTypeOf(emailField).toEqualTypeOf<
      FormischFieldContext<typeof schema, ['email']>['$implicit']
    >();

    // The input signal is narrowed to the value at the path, including nested
    // paths with numeric array indices.
    expectTypeOf<
      FormischFieldContext<typeof schema, ['email']>['$implicit']['input']
    >().toEqualTypeOf<Signal<string | undefined>>();
    expectTypeOf<
      FormischFieldContext<typeof schema, ['age']>['$implicit']['input']
    >().toEqualTypeOf<Signal<number | undefined>>();
    expectTypeOf<
      FormischFieldContext<
        typeof schema,
        ['todos', number, 'label']
      >['$implicit']['input']
    >().toEqualTypeOf<Signal<string | undefined>>();
  });
});
