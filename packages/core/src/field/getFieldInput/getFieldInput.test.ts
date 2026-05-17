import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import type { InternalArrayStore } from '../../types/index.ts';
import { createTestStore } from '../../vitest/index.ts';
import { getFieldInput } from './getFieldInput.ts';

describe('getFieldInput', () => {
  describe('value fields', () => {
    test('should return string value', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      expect(getFieldInput(store.children.name)).toBe('John');
    });

    test('should return number value', () => {
      const store = createTestStore(v.object({ age: v.number() }), {
        initialInput: { age: 25 },
      });
      expect(getFieldInput(store.children.age)).toBe(25);
    });

    test('should return undefined for uninitialized field', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      expect(getFieldInput(store.children.name)).toBeUndefined();
    });
  });

  describe('object fields', () => {
    test('should collect input from all children', () => {
      const store = createTestStore(
        v.object({ name: v.string(), age: v.number() }),
        { initialInput: { name: 'John', age: 25 } }
      );
      expect(getFieldInput(store)).toStrictEqual({ name: 'John', age: 25 });
    });

    test('should return null for nullish object input', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: null } }
      );
      expect(getFieldInput(store.children.user)).toBeNull();
    });

    test('should return undefined for undefined object input', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: undefined } }
      );
      expect(getFieldInput(store.children.user)).toBeUndefined();
    });
  });

  describe('array fields', () => {
    test('should collect input from all items', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      expect(getFieldInput(store.children.items)).toStrictEqual([
        'a',
        'b',
        'c',
      ]);
    });

    test('should return empty array for empty array input', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: [] },
      });
      expect(getFieldInput(store.children.items)).toStrictEqual([]);
    });

    test('should return null for nullish array input', () => {
      const store = createTestStore(
        v.object({ items: v.nullish(v.array(v.string())) }),
        { initialInput: { items: null } }
      );
      expect(getFieldInput(store.children.items)).toBeNull();
    });
  });

  describe('nested structures', () => {
    test('should collect deeply nested input', () => {
      const store = createTestStore(
        v.object({
          users: v.array(v.object({ name: v.string(), age: v.number() })),
        }),
        {
          initialInput: {
            users: [
              { name: 'John', age: 25 },
              { name: 'Jane', age: 30 },
            ],
          },
        }
      );
      expect(getFieldInput(store)).toStrictEqual({
        users: [
          { name: 'John', age: 25 },
          { name: 'Jane', age: 30 },
        ],
      });
    });
  });

  describe('with dirtyOnly', () => {
    test('should return empty object when no field is dirty', () => {
      const store = createTestStore(
        v.object({ name: v.string(), age: v.number() }),
        { initialInput: { name: 'John', age: 25 } }
      );
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({});
    });

    test('should omit clean siblings of a dirty value', () => {
      const store = createTestStore(
        v.object({ name: v.string(), email: v.string() }),
        { initialInput: { name: 'John', email: 'a@x.com' } }
      );
      store.children.email.input.value = 'b@x.com';
      store.children.email.isDirty.value = true;
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({
        email: 'b@x.com',
      });
    });

    test('should include only dirty indices when items in an array are dirty', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      const itemsArray = store.children.items as InternalArrayStore;
      itemsArray.children[1].input.value = 'B';
      itemsArray.children[1].isDirty.value = true;
      itemsArray.isDirty.value = true;
      const result = getFieldInput(store, { dirtyOnly: true }) as {
        items: (string | undefined)[];
      };
      expect(result.items[1]).toBe('B');
      expect(result.items[0]).toBeUndefined();
      expect(result.items[2]).toBeUndefined();
    });

    test('should miss dirty leaves under a clean object parent', () => {
      const store = createTestStore(
        v.object({ user: v.object({ email: v.string(), name: v.string() }) }),
        { initialInput: { user: { email: 'a@x.com', name: 'John' } } }
      );
      const user = store.children.user;
      if (user.kind !== 'object') throw new Error('expected object');
      user.children.email.input.value = 'b@x.com';
      user.children.email.isDirty.value = true;
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({});
    });

    test('should include a value field even when its dirty input is undefined', () => {
      const store = createTestStore(
        v.object({ name: v.optional(v.string()) }),
        { initialInput: { name: 'John' } }
      );
      store.children.name.input.value = undefined;
      store.children.name.isDirty.value = true;
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({
        name: undefined,
      });
    });
  });
});
