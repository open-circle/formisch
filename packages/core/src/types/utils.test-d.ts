import { describe, expectTypeOf, test } from 'vitest';
import type { DeepPartial, ExactRequired, PartialValues } from './utils.ts';

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
    expectTypeOf<DeepPartial<{ name: string | null }>>().toEqualTypeOf<{
      name?: string | null | undefined;
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

describe('ExactRequired', () => {
  test('should strip the optional marker and add `| undefined` to the value', () => {
    expectTypeOf<ExactRequired<{ a?: string }>>().toEqualTypeOf<{
      a: string | undefined;
    }>();
  });

  test('should preserve required properties unchanged', () => {
    expectTypeOf<ExactRequired<{ a: string }>>().toEqualTypeOf<{
      a: string;
    }>();
  });

  test('should preserve `| undefined` already present in optional values', () => {
    expectTypeOf<ExactRequired<{ a?: string | undefined }>>().toEqualTypeOf<{
      a: string | undefined;
    }>();
  });

  test('should preserve `| null` without adding undefined to required nullable values', () => {
    expectTypeOf<ExactRequired<{ a: string | null }>>().toEqualTypeOf<{
      a: string | null;
    }>();
  });

  test('should preserve nullish values on optional properties (v.nullish case)', () => {
    expectTypeOf<
      ExactRequired<{ a?: string | null | undefined }>
    >().toEqualTypeOf<{ a: string | null | undefined }>();
  });

  test('should treat mixed required and optional keys correctly', () => {
    expectTypeOf<
      ExactRequired<{ a?: string; b: number; c?: boolean | null }>
    >().toEqualTypeOf<{
      a: string | undefined;
      b: number;
      c: boolean | null | undefined;
    }>();
  });

  test('should preserve the `readonly` modifier', () => {
    expectTypeOf<
      ExactRequired<{ readonly a?: string; readonly b: number }>
    >().toEqualTypeOf<{
      readonly a: string | undefined;
      readonly b: number;
    }>();
  });

  test('should produce an empty object for an empty object', () => {
    expectTypeOf<ExactRequired<{}>>().toEqualTypeOf<{}>();
  });
});
