import type { Signal } from '@angular/core';
import * as v from 'valibot';
import { expectTypeOf } from 'vitest';
import type { FieldArrayStore } from '../../types/index.ts';
import { injectFieldArray } from './injectFieldArray.ts';

const Schema = v.object({
  todos: v.array(v.object({ title: v.string() })),
});

declare const fieldArray: ReturnType<
  typeof injectFieldArray<typeof Schema, ['todos']>
>;

expectTypeOf(fieldArray).toMatchTypeOf<
  FieldArrayStore<typeof Schema, ['todos']>
>();
expectTypeOf(fieldArray.path).toEqualTypeOf<['todos']>();
expectTypeOf(fieldArray.items).toEqualTypeOf<Signal<string[]>>();
expectTypeOf(fieldArray.errors).toEqualTypeOf<
  Signal<[string, ...string[]] | null>
>();
expectTypeOf(fieldArray.isTouched).toEqualTypeOf<Signal<boolean>>();
expectTypeOf(fieldArray.isDirty).toEqualTypeOf<Signal<boolean>>();
expectTypeOf(fieldArray.isValid).toEqualTypeOf<Signal<boolean>>();
