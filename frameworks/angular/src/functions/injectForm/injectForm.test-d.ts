import type { Signal } from '@angular/core';
import * as v from 'valibot';
import { expectTypeOf } from 'vitest';
import type { FormStore } from '../../types/index.ts';
import { injectForm } from './injectForm.ts';

const Schema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

declare const form: ReturnType<typeof injectForm<typeof Schema>>;

expectTypeOf(form).toMatchTypeOf<FormStore<typeof Schema>>();
expectTypeOf(form.isSubmitting).toEqualTypeOf<Signal<boolean>>();
expectTypeOf(form.isSubmitted).toEqualTypeOf<Signal<boolean>>();
expectTypeOf(form.isValidating).toEqualTypeOf<Signal<boolean>>();
expectTypeOf(form.isTouched).toEqualTypeOf<Signal<boolean>>();
expectTypeOf(form.isDirty).toEqualTypeOf<Signal<boolean>>();
expectTypeOf(form.isValid).toEqualTypeOf<Signal<boolean>>();
expectTypeOf(form.errors).toEqualTypeOf<Signal<[string, ...string[]] | null>>();
