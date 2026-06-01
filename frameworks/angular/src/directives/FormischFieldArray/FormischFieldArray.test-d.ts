import type { Signal } from '@angular/core';
import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import { injectFieldArray, injectForm } from '../../functions/index.ts';
import type { FormischFieldArrayContext } from './FormischFieldArray.ts';

describe('FormischFieldArray', () => {
  test('provides the typed field array store as the $implicit context', () => {
    const schema = v.object({
      todos: v.array(v.object({ label: v.string() })),
    });
    const form = injectForm({ schema });
    const todosArray = injectFieldArray(form, { path: ['todos'] });

    // The directive's $implicit context is exactly the injectFieldArray return.
    expectTypeOf(todosArray).toEqualTypeOf<
      FormischFieldArrayContext<typeof schema, ['todos']>['$implicit']
    >();

    // The item ids are exposed as a string array signal.
    expectTypeOf<
      FormischFieldArrayContext<typeof schema, ['todos']>['$implicit']['items']
    >().toEqualTypeOf<Signal<string[]>>();
  });
});
