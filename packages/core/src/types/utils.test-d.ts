import { describe, expectTypeOf, test } from 'vitest';
import type {
  DeepPartial,
  ExactKeysOf,
  ExactRequired,
  IsAny,
  IsNever,
  MaybePromise,
  PartialValues,
  PropertiesOf,
} from './utils.ts';

describe('IsAny', () => {
  test('should return true for `any`', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expectTypeOf<IsAny<any>>().toEqualTypeOf<true>();
  });

  test('should return false for `never`', () => {
    expectTypeOf<IsAny<never>>().toEqualTypeOf<false>();
  });

  test('should return false for `unknown`', () => {
    expectTypeOf<IsAny<unknown>>().toEqualTypeOf<false>();
  });

  test('should return false for primitives', () => {
    expectTypeOf<IsAny<string>>().toEqualTypeOf<false>();
    expectTypeOf<IsAny<number>>().toEqualTypeOf<false>();
    expectTypeOf<IsAny<boolean>>().toEqualTypeOf<false>();
    expectTypeOf<IsAny<null>>().toEqualTypeOf<false>();
    expectTypeOf<IsAny<undefined>>().toEqualTypeOf<false>();
  });

  test('should return false for objects, arrays, and unions', () => {
    expectTypeOf<IsAny<{ a: number }>>().toEqualTypeOf<false>();
    expectTypeOf<IsAny<string[]>>().toEqualTypeOf<false>();
    expectTypeOf<IsAny<string | number>>().toEqualTypeOf<false>();
  });
});

describe('IsNever', () => {
  test('should return true for `never`', () => {
    expectTypeOf<IsNever<never>>().toEqualTypeOf<true>();
  });

  test('should return false for `any`', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expectTypeOf<IsNever<any>>().toEqualTypeOf<false>();
  });

  test('should return false for `unknown`', () => {
    expectTypeOf<IsNever<unknown>>().toEqualTypeOf<false>();
  });

  test('should return false for non-`never` types', () => {
    expectTypeOf<IsNever<string>>().toEqualTypeOf<false>();
    expectTypeOf<IsNever<undefined>>().toEqualTypeOf<false>();
    expectTypeOf<IsNever<null>>().toEqualTypeOf<false>();
    expectTypeOf<IsNever<{ a: number }>>().toEqualTypeOf<false>();
    expectTypeOf<IsNever<unknown>>().toEqualTypeOf<false>();
  });

  test('should not distribute over unions (returns false for `T | never`)', () => {
    // `never` is the identity of `|`, so `string | never` simplifies to `string`.
    // The non-distributive `[T] extends [never]` check is what makes IsNever
    // safe to call with naked type parameters that could be unions.
    expectTypeOf<IsNever<string | never>>().toEqualTypeOf<false>();
  });
});

describe('MaybePromise', () => {
  test('should produce `T | Promise<T>`', () => {
    expectTypeOf<MaybePromise<string>>().toEqualTypeOf<
      string | Promise<string>
    >();
    expectTypeOf<MaybePromise<number>>().toEqualTypeOf<
      number | Promise<number>
    >();
  });

  test('should distribute over union inputs', () => {
    expectTypeOf<MaybePromise<string | number>>().toEqualTypeOf<
      string | number | Promise<string | number>
    >();
  });
});

describe('ExactKeysOf', () => {
  test('should return the keys of a plain object', () => {
    expectTypeOf<ExactKeysOf<{ a: number; b: string }>>().toEqualTypeOf<
      'a' | 'b'
    >();
  });

  test('should return the literal indices of a tuple', () => {
    expectTypeOf<ExactKeysOf<[number, string, boolean]>>().toEqualTypeOf<
      0 | 1 | 2
    >();
  });

  test('should return `number` for a dynamic array', () => {
    expectTypeOf<ExactKeysOf<string[]>>().toEqualTypeOf<number>();
    expectTypeOf<ExactKeysOf<readonly string[]>>().toEqualTypeOf<number>();
  });

  test('should return the union of keys across object union members', () => {
    expectTypeOf<ExactKeysOf<{ a: number } | { b: string }>>().toEqualTypeOf<
      'a' | 'b'
    >();
  });

  test('should return the union of keys across object and tuple union members', () => {
    expectTypeOf<ExactKeysOf<{ a: string } | [string]>>().toEqualTypeOf<
      'a' | 0
    >();
  });

  test('should return `never` for primitives', () => {
    expectTypeOf<ExactKeysOf<string>>().toEqualTypeOf<never>();
    expectTypeOf<ExactKeysOf<number>>().toEqualTypeOf<never>();
    expectTypeOf<ExactKeysOf<boolean>>().toEqualTypeOf<never>();
    expectTypeOf<ExactKeysOf<null>>().toEqualTypeOf<never>();
    expectTypeOf<ExactKeysOf<undefined>>().toEqualTypeOf<never>();
  });

  test('should return `never` for `any`, `unknown`, and `never`', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expectTypeOf<ExactKeysOf<any>>().toEqualTypeOf<never>();
    expectTypeOf<ExactKeysOf<unknown>>().toEqualTypeOf<never>();
    expectTypeOf<ExactKeysOf<never>>().toEqualTypeOf<never>();
  });
});

describe('PropertiesOf', () => {
  test('should return the same shape for a plain object', () => {
    expectTypeOf<PropertiesOf<{ a: number; b: string }>>().toEqualTypeOf<{
      a: number;
      b: string;
    }>();
  });

  test('should produce an indexed object for tuples', () => {
    expectTypeOf<PropertiesOf<[number, string]>>().toEqualTypeOf<{
      0: number;
      1: string;
    }>();
  });

  test('should produce an index signature for dynamic arrays', () => {
    expectTypeOf<PropertiesOf<string[]>>().toEqualTypeOf<
      Record<number, string>
    >();
  });

  test('should merge keys across object union members', () => {
    expectTypeOf<PropertiesOf<{ a: number } | { b: string }>>().toEqualTypeOf<{
      a: number;
      b: string;
    }>();
  });

  test('should union value types for keys shared across union members', () => {
    expectTypeOf<
      PropertiesOf<{ a: number; b: string } | { a: boolean; c: Date }>
    >().toEqualTypeOf<{
      a: number | boolean;
      b: string;
      c: Date;
    }>();
  });

  test('should produce `{}` for primitives and non-indexable types', () => {
    expectTypeOf<PropertiesOf<string>>().toEqualTypeOf<{}>();
    expectTypeOf<PropertiesOf<number>>().toEqualTypeOf<{}>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expectTypeOf<PropertiesOf<any>>().toEqualTypeOf<{}>();
    expectTypeOf<PropertiesOf<unknown>>().toEqualTypeOf<{}>();
    expectTypeOf<PropertiesOf<never>>().toEqualTypeOf<{}>();
  });
});

describe('ExactRequired', () => {
  test('should pass primitive and nullish types through unchanged', () => {
    expectTypeOf<ExactRequired<string>>().toEqualTypeOf<string>();
    expectTypeOf<ExactRequired<number>>().toEqualTypeOf<number>();
    expectTypeOf<ExactRequired<boolean>>().toEqualTypeOf<boolean>();
    expectTypeOf<ExactRequired<null>>().toEqualTypeOf<null>();
    expectTypeOf<ExactRequired<undefined>>().toEqualTypeOf<undefined>();
  });

  test('should strip the optional marker while preserving the exact value (v.exactOptional case, strict mode)', () => {
    expectTypeOf<ExactRequired<{ a?: string }>>().toEqualTypeOf<{
      a: string;
    }>();
  });

  test('should preserve required properties unchanged', () => {
    expectTypeOf<ExactRequired<{ a: string }>>().toEqualTypeOf<{
      a: string;
    }>();
  });

  test('should preserve `| undefined` written explicitly on optional values (v.optional case)', () => {
    expectTypeOf<ExactRequired<{ a?: string | undefined }>>().toEqualTypeOf<{
      a: string | undefined;
    }>();
  });

  test('should preserve `| null` without adding undefined to required nullable values', () => {
    expectTypeOf<ExactRequired<{ a: string | null }>>().toEqualTypeOf<{
      a: string | null;
    }>();
  });

  test('should preserve explicit nullish values on optional properties (v.nullish case)', () => {
    expectTypeOf<
      ExactRequired<{ a?: string | null | undefined }>
    >().toEqualTypeOf<{ a: string | null | undefined }>();
  });

  test('should treat mixed required and optional keys correctly', () => {
    expectTypeOf<
      ExactRequired<{
        a?: string;
        b: number;
        c?: boolean | null | undefined;
      }>
    >().toEqualTypeOf<{
      a: string;
      b: number;
      c: boolean | null | undefined;
    }>();
  });

  test('should preserve the `readonly` modifier', () => {
    expectTypeOf<
      ExactRequired<{ readonly a?: string; readonly b: number }>
    >().toEqualTypeOf<{
      readonly a: string;
      readonly b: number;
    }>();
  });

  test('should produce an empty object for an empty object', () => {
    expectTypeOf<ExactRequired<{}>>().toEqualTypeOf<{}>();
  });

  test('should distribute over unions and preserve each member precisely', () => {
    expectTypeOf<
      ExactRequired<
        | { type: 'a'; value?: string }
        | { type: 'b'; count?: number | undefined }
      >
    >().toEqualTypeOf<
      { type: 'a'; value: string } | { type: 'b'; count: number | undefined }
    >();
  });

  test('should pass primitive members of unions through unchanged', () => {
    expectTypeOf<
      ExactRequired<string | { a?: number | undefined }>
    >().toEqualTypeOf<string | { a: number | undefined }>();
  });

  test('should pass arrays through unchanged', () => {
    expectTypeOf<ExactRequired<string[]>>().toEqualTypeOf<string[]>();
    expectTypeOf<ExactRequired<{ id: number }[]>>().toEqualTypeOf<
      { id: number }[]
    >();
  });

  test('should pass tuples through unchanged', () => {
    expectTypeOf<ExactRequired<[number, string]>>().toEqualTypeOf<
      [number, string]
    >();
  });
});

describe('DeepPartial', () => {
  test('should make primitives optional', () => {
    expectTypeOf<DeepPartial<string>>().toEqualTypeOf<string | undefined>();
    expectTypeOf<DeepPartial<number>>().toEqualTypeOf<number | undefined>();
    expectTypeOf<DeepPartial<boolean>>().toEqualTypeOf<boolean | undefined>();
  });

  test('should make all object properties optional with optional values', () => {
    expectTypeOf<DeepPartial<{ name: string; age: number }>>().toEqualTypeOf<{
      name?: string | undefined;
      age?: number | undefined;
    }>();
  });

  test('should recurse into nested objects', () => {
    expectTypeOf<
      DeepPartial<{ user: { name: string; age: number } }>
    >().toEqualTypeOf<{
      user?:
        | {
            name?: string | undefined;
            age?: number | undefined;
          }
        | undefined;
    }>();
  });

  test('should preserve already-optional properties', () => {
    expectTypeOf<DeepPartial<{ name?: string }>>().toEqualTypeOf<{
      name?: string | undefined;
    }>();
  });

  test('should handle null and undefined values', () => {
    expectTypeOf<
      DeepPartial<{ name: string | null; age: number | undefined }>
    >().toEqualTypeOf<{
      name?: string | null | undefined;
      age?: number | undefined;
    }>();
  });
});

describe('PartialValues', () => {
  test('should make primitive values optional', () => {
    expectTypeOf<PartialValues<string>>().toEqualTypeOf<string | undefined>();
    expectTypeOf<PartialValues<number>>().toEqualTypeOf<number | undefined>();
    expectTypeOf<PartialValues<boolean>>().toEqualTypeOf<boolean | undefined>();
  });

  test('should keep object keys required but make leaf values optional', () => {
    expectTypeOf<PartialValues<{ name: string }>>().toEqualTypeOf<{
      name: string | undefined;
    }>();
  });

  test('should recurse into nested objects without making intermediates optional', () => {
    expectTypeOf<PartialValues<{ user: { name: string } }>>().toEqualTypeOf<{
      user: { name: string | undefined };
    }>();
  });

  test('should keep dynamic arrays of primitives as-is (no `(T | undefined)[]`)', () => {
    expectTypeOf<PartialValues<string[]>>().toEqualTypeOf<string[]>();
    expectTypeOf<PartialValues<number[]>>().toEqualTypeOf<number[]>();
  });

  test('should make object members of dynamic arrays partial', () => {
    expectTypeOf<PartialValues<{ id: number }[]>>().toEqualTypeOf<
      { id: number | undefined }[]
    >();
  });

  test('should distribute over union element types in dynamic arrays', () => {
    // The reason `infer TItem` is used: without distribution, the conditional
    // would see the whole union, fail both the object and array branch, and
    // skip recursion entirely — leaving `{ id: number }` untouched.
    expectTypeOf<PartialValues<(string | { id: number })[]>>().toEqualTypeOf<
      (string | { id: number | undefined })[]
    >();
  });

  test('should recurse element-wise into tuples', () => {
    expectTypeOf<PartialValues<[string, number]>>().toEqualTypeOf<
      [string | undefined, number | undefined]
    >();
  });

  test('should preserve already-optional properties on objects', () => {
    expectTypeOf<PartialValues<{ name?: string }>>().toEqualTypeOf<{
      name?: string | undefined;
    }>();
  });

  test('should keep null and undefined in primitive value positions', () => {
    expectTypeOf<PartialValues<{ name: string | null }>>().toEqualTypeOf<{
      name: string | null | undefined;
    }>();
  });
});
