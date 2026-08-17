import type { FormischFieldIR, FormSchema } from './schema.ts';
import { describe, expectTypeOf, test } from 'vitest';

// A minimal valid IR object root for type testing
function makeObjectIR(): FormischFieldIR & { readonly type: 'object' } {
  return {
    type: 'object',
    optional: false,
    getDefault: () => ({}),
    properties: new Map(),
  };
}

// A minimal valid FormSchema (Standard Schema + ~formisch)
function makeFormSchema(): FormSchema {
  return {
    '~standard': {
      version: 1 as const,
      vendor: 'test',
      validate: () => ({ issues: undefined, value: {} }),
    },
    '~formisch': {
      version: 1 as const,
      root: makeObjectIR(),
    },
  } as FormSchema;
}

function acceptFormSchema<TSchema extends FormSchema>(
  schema: TSchema
): TSchema {
  return schema;
}

describe('FormSchema (IR-based)', () => {
  test('should accept a FormSchema with an object root IR', () => {
    acceptFormSchema(makeFormSchema());
  });

  test('should reject a schema without the ~formisch marker', () => {
    // @ts-expect-error missing ~formisch
    acceptFormSchema({
      '~standard': {
        version: 1 as const,
        vendor: 'test',
        validate: () => ({ issues: undefined, value: {} }),
      },
    });
  });

  test('FormischFieldIR should have the expected shape', () => {
    const ir = makeObjectIR();
    expectTypeOf(ir.type).toEqualTypeOf<'object'>();
    expectTypeOf(ir.optional).toEqualTypeOf<boolean>();
    expectTypeOf(ir.getDefault).toEqualTypeOf<() => unknown>();
  });
});
