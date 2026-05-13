import { describe, expectTypeOf, test } from 'vitest';
import type { PathValue, ValidArrayPath, ValidPath } from './path.ts';

describe('ValidPath', () => {
  test('should accept a valid path on a simple object', () => {
    expectTypeOf<ValidPath<{ name: string }, ['name']>>().toEqualTypeOf<
      ['name']
    >();
  });

  test('should accept a nested path', () => {
    expectTypeOf<
      ValidPath<{ user: { name: string } }, ['user', 'name']>
    >().toEqualTypeOf<['user', 'name']>();
  });

  test('should accept a path that traverses a union', () => {
    expectTypeOf<
      ValidPath<
        { data: { type: 'a'; name: string } | { type: 'b'; age: number } },
        ['data', 'name']
      >
    >().toEqualTypeOf<['data', 'name']>();
  });

  test('should accept a path through an optional field', () => {
    expectTypeOf<
      ValidPath<{ profile?: { name: string } }, ['profile', 'name']>
    >().toEqualTypeOf<['profile', 'name']>();
  });

  test('should accept a path that indexes into a tuple', () => {
    expectTypeOf<
      ValidPath<{ coords: [number, number] }, ['coords', 0]>
    >().toEqualTypeOf<['coords', 0]>();
  });

  test('should return a suggestion when the last segment is invalid', () => {
    expectTypeOf<
      ValidPath<{ user: { name: string } }, ['user', 'wrong']>
    >().toEqualTypeOf<readonly ['user', 'name']>();
  });

  test('should return a suggestion when the first segment is invalid', () => {
    expectTypeOf<
      ValidPath<{ user: { name: string } }, ['wrong']>
    >().toEqualTypeOf<readonly ['user']>();
  });
});

describe('ValidArrayPath', () => {
  test('should accept a simple array path', () => {
    expectTypeOf<ValidArrayPath<{ tags: string[] }, ['tags']>>().toEqualTypeOf<
      ['tags']
    >();
  });

  test('should accept a nested array path', () => {
    expectTypeOf<
      ValidArrayPath<{ user: { hobbies: string[] } }, ['user', 'hobbies']>
    >().toEqualTypeOf<['user', 'hobbies']>();
  });

  test('should accept an array path through array of objects', () => {
    expectTypeOf<
      ValidArrayPath<{ items: { tags: string[] }[] }, ['items', 0, 'tags']>
    >().toEqualTypeOf<['items', 0, 'tags']>();
  });

  test('should accept an array field present in only one union variant', () => {
    expectTypeOf<
      ValidArrayPath<
        { data: { kind: 'a'; items: string[] } | { kind: 'b'; name: string } },
        ['data', 'items']
      >
    >().toEqualTypeOf<['data', 'items']>();
  });

  test('should accept array fields contributed by different union variants', () => {
    interface Schema {
      data: { type: 'A'; items: string[] } | { type: 'B'; values: number[] };
    }
    expectTypeOf<ValidArrayPath<Schema, ['data', 'items']>>().toEqualTypeOf<
      ['data', 'items']
    >();
    expectTypeOf<ValidArrayPath<Schema, ['data', 'values']>>().toEqualTypeOf<
      ['data', 'values']
    >();
  });

  test('should accept a deeply nested array inside a single union variant', () => {
    expectTypeOf<
      ValidArrayPath<
        {
          payload:
            | { type: 'list'; entries: { tags: string[] }[] }
            | { type: 'single'; value: string };
        },
        ['payload', 'entries', 0, 'tags']
      >
    >().toEqualTypeOf<['payload', 'entries', 0, 'tags']>();
  });

  test('should return never when no variant contains an array', () => {
    expectTypeOf<
      ValidArrayPath<
        { data: { type: 'A'; name: string } | { type: 'B'; value: number } },
        ['data']
      >
    >().toEqualTypeOf<never>();
  });

  test('should not accept a non-array path', () => {
    expectTypeOf<
      ValidArrayPath<{ name: string; tags: string[] }, ['name']>
    >().not.toEqualTypeOf<['name']>();
  });

  test('should accept an optional array field', () => {
    expectTypeOf<ValidArrayPath<{ tags?: string[] }, ['tags']>>().toEqualTypeOf<
      ['tags']
    >();
  });

  test('should accept a nullable array field', () => {
    expectTypeOf<
      ValidArrayPath<{ tags: string[] | null }, ['tags']>
    >().toEqualTypeOf<['tags']>();
  });

  test('should accept a leaf array reached through an optional object inside array items', () => {
    expectTypeOf<
      ValidArrayPath<
        { items: { group?: { tags: string[] } }[] },
        ['items', number, 'group', 'tags']
      >
    >().toEqualTypeOf<['items', number, 'group', 'tags']>();
  });

  test('should accept an optional array field on array items', () => {
    expectTypeOf<
      ValidArrayPath<
        { items: { tags?: string[] }[] },
        ['items', number, 'tags']
      >
    >().toEqualTypeOf<['items', number, 'tags']>();
  });

  test('should accept a leaf array reached through multiple optional intermediates', () => {
    expectTypeOf<
      ValidArrayPath<{ a?: { b?: { tags: string[] } } }, ['a', 'b', 'tags']>
    >().toEqualTypeOf<['a', 'b', 'tags']>();
  });

  test('should accept a leaf array under an optional object with explicit `| undefined` (v.optional case)', () => {
    expectTypeOf<
      ValidArrayPath<
        { items: { group?: { tags: string[] } | undefined }[] },
        ['items', number, 'group', 'tags']
      >
    >().toEqualTypeOf<['items', number, 'group', 'tags']>();
  });

  test('should accept a leaf array under a field whose value is explicitly `T | undefined`', () => {
    expectTypeOf<
      ValidArrayPath<
        { group: { tags: string[] } | undefined },
        ['group', 'tags']
      >
    >().toEqualTypeOf<['group', 'tags']>();
  });

  test('should accept a leaf array when the union also contains a primitive', () => {
    expectTypeOf<
      ValidArrayPath<{ data: { items: string[] } | string }, ['data', 'items']>
    >().toEqualTypeOf<['data', 'items']>();
  });

  test('should accept a leaf array when the union also contains a number', () => {
    expectTypeOf<
      ValidArrayPath<
        { data: { values: number[] } | number },
        ['data', 'values']
      >
    >().toEqualTypeOf<['data', 'values']>();
  });
});

describe('PathValue', () => {
  test('should extract the value type at a simple path', () => {
    expectTypeOf<
      PathValue<{ name: string }, ['name']>
    >().toEqualTypeOf<string>();
  });

  test('should extract the value type through a union', () => {
    expectTypeOf<
      PathValue<
        { data: { type: 'a'; name: string } | { type: 'b'; name: number } },
        ['data', 'name']
      >
    >().toEqualTypeOf<string | number>();
  });

  test('should extract an array element type', () => {
    expectTypeOf<
      PathValue<{ items: { id: number }[] }, ['items', 0, 'id']>
    >().toEqualTypeOf<number>();
  });

  test('should extract a whole array when path stops at the array field', () => {
    expectTypeOf<
      PathValue<{ items: { id: number }[] }, ['items']>
    >().toEqualTypeOf<{ id: number }[]>();
  });

  test('should extract a tuple element by index', () => {
    expectTypeOf<
      PathValue<{ coords: [number, string] }, ['coords', 1]>
    >().toEqualTypeOf<string>();
  });

  test('should strip optionality from intermediate fields', () => {
    expectTypeOf<
      PathValue<{ profile?: { name: string } }, ['profile', 'name']>
    >().toEqualTypeOf<string>();
  });

  test('should preserve nullability at the leaf', () => {
    expectTypeOf<PathValue<{ name: string | null }, ['name']>>().toEqualTypeOf<
      string | null
    >();
  });

  test('should return unknown for an invalid path', () => {
    expectTypeOf<
      PathValue<{ name: string }, ['wrong']>
    >().toEqualTypeOf<unknown>();
  });

  test('should add `| undefined` when navigating to an optional field (issue #15)', () => {
    expectTypeOf<
      PathValue<{ group?: { name: string } }, ['group']>
    >().toEqualTypeOf<{ name: string } | undefined>();
  });

  test('should preserve `| undefined` for nullish leaf values (issue #15, v.nullish case)', () => {
    expectTypeOf<
      PathValue<{ group?: { name: string } | null | undefined }, ['group']>
    >().toEqualTypeOf<{ name: string } | null | undefined>();
  });
});
