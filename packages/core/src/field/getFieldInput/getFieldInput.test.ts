import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
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
    test('should return undefined when no field is dirty', () => {
      const store = createTestStore(
        v.object({ name: v.string(), age: v.number() }),
        { initialInput: { name: 'John', age: 25 } }
      );
      expect(getFieldInput(store, { dirtyOnly: true })).toBeUndefined();
    });

    test('should omit clean siblings of a dirty value', () => {
      const store = createTestStore(
        v.object({ name: v.string(), email: v.string() }),
        { initialInput: { name: 'John', email: 'a@example.com' } }
      );
      store.children.email.input.value = 'b@example.com';
      store.children.email.isDirty.value = true;
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({
        email: 'b@example.com',
      });
    });

    test('should return the full current array when any item is dirty', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        itemsStore.children[1].input.value = 'B';
        itemsStore.children[1].isDirty.value = true;
      }
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({
        items: ['a', 'B', 'c'],
      });
    });

    test('should include dirty leaves under a clean object parent', () => {
      const store = createTestStore(
        v.object({ user: v.object({ email: v.string(), name: v.string() }) }),
        { initialInput: { user: { email: 'a@example.com', name: 'John' } } }
      );
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        userStore.children.email.input.value = 'b@example.com';
        userStore.children.email.isDirty.value = true;
      }
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({
        user: { email: 'b@example.com' },
      });
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

    test('should return all dirty branches across multiple keys and depths', () => {
      const store = createTestStore(
        v.object({
          name: v.string(),
          email: v.string(),
          user: v.object({ first: v.string(), last: v.string() }),
        }),
        {
          initialInput: {
            name: 'John',
            email: 'a@example.com',
            user: { first: 'A', last: 'B' },
          },
        }
      );
      store.children.email.input.value = 'b@example.com';
      store.children.email.isDirty.value = true;
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        userStore.children.first.input.value = 'C';
        userStore.children.first.isDirty.value = true;
      }
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({
        email: 'b@example.com',
        user: { first: 'C' },
      });
    });

    test('should return full objects inside arrays when any item is dirty', () => {
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
      const usersStore = store.children.users;
      expect(usersStore.kind).toBe('array');
      if (usersStore.kind === 'array') {
        const user0 = usersStore.children[0];
        expect(user0.kind).toBe('object');
        if (user0.kind === 'object') {
          user0.children.name.input.value = 'Johnny';
          user0.children.name.isDirty.value = true;
        }
      }
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({
        users: [
          { name: 'Johnny', age: 25 },
          { name: 'Jane', age: 30 },
        ],
      });
    });

    test('should include an object that transitioned from null to set', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: null } }
      );
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        userStore.input.value = true;
        userStore.isDirty.value = true;
        userStore.children.name.input.value = 'John';
        userStore.children.name.isDirty.value = true;
      }
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({
        user: { name: 'John' },
      });
    });

    test('should include an object that transitioned from set to null', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: { name: 'John' } } }
      );
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        userStore.input.value = null;
        userStore.isDirty.value = true;
      }
      expect(getFieldInput(store, { dirtyOnly: true })).toStrictEqual({
        user: null,
      });
    });

    test('should return value for a dirty value field called directly', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      store.children.name.input.value = 'Jane';
      store.children.name.isDirty.value = true;
      expect(
        getFieldInput(store.children.name, { dirtyOnly: true })
      ).toBe('Jane');
    });

    test('should return undefined when called directly on a clean value field', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      expect(
        getFieldInput(store.children.name, { dirtyOnly: true })
      ).toBeUndefined();
    });

    test('should return undefined when called directly on a clean array', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      expect(
        getFieldInput(store.children.items, { dirtyOnly: true })
      ).toBeUndefined();
    });

    test('should return undefined when called directly on a clean object subtree', () => {
      const store = createTestStore(
        v.object({ user: v.object({ name: v.string() }) }),
        { initialInput: { user: { name: 'John' } } }
      );
      expect(
        getFieldInput(store.children.user, { dirtyOnly: true })
      ).toBeUndefined();
    });
  });
});
