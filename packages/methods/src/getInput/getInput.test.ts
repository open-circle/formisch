import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { getInput } from './getInput.ts';

describe('getInput', () => {
  test('should return full form input when no path provided', () => {
    const store = createTestStore(
      v.object({ name: v.string(), age: v.number() }),
      {
        initialInput: { name: 'John', age: 30 },
      }
    );

    const result = getInput(store);

    expect(result).toEqual({ name: 'John', age: 30 });
  });

  test('should return field input value', () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      initialInput: { name: 'John' },
    });

    const result = getInput(store, { path: ['name'] });

    expect(result).toBe('John');
  });

  test('should return nested field input', () => {
    const store = createTestStore(
      v.object({ user: v.object({ email: v.string() }) }),
      { initialInput: { user: { email: 'test@example.com' } } }
    );

    const result = getInput(store, { path: ['user', 'email'] });

    expect(result).toBe('test@example.com');
  });

  test('should return array item input', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b', 'c'] },
    });

    const result = getInput(store, { path: ['items', 1] });

    expect(result).toBe('b');
  });

  test('should return full array input', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b', 'c'] },
    });

    const result = getInput(store, { path: ['items'] });

    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('should return nested object within array', () => {
    const store = createTestStore(
      v.object({ users: v.array(v.object({ name: v.string() })) }),
      { initialInput: { users: [{ name: 'John' }, { name: 'Jane' }] } }
    );

    const result = getInput(store, { path: ['users', 0, 'name'] });

    expect(result).toBe('John');
  });

  test('should return undefined for uninitialized field', () => {
    const store = createTestStore(v.object({ name: v.optional(v.string()) }));

    const result = getInput(store, { path: ['name'] });

    expect(result).toBeUndefined();
  });

  describe('with dirtyOnly', () => {
    test('should return undefined for a clean form', () => {
      const store = createTestStore(
        v.object({ name: v.string(), age: v.number() }),
        { initialInput: { name: 'John', age: 25 } }
      );

      expect(getInput(store, { dirtyOnly: true })).toBeUndefined();
    });

    test('should return only the dirty key from a flat object', () => {
      const store = createTestStore(
        v.object({ name: v.string(), email: v.string() }),
        { initialInput: { name: 'John', email: 'a@example.com' } }
      );
      store.children.email.input.value = 'b@example.com';
      store.children.email.isDirty.value = true;

      expect(getInput(store, { dirtyOnly: true })).toStrictEqual({
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

      expect(getInput(store, { dirtyOnly: true })).toStrictEqual({
        items: ['a', 'B', 'c'],
      });
    });

    test('should scope dirty filter to the given path', () => {
      const store = createTestStore(
        v.object({
          user: v.object({ email: v.string(), name: v.string() }),
        }),
        { initialInput: { user: { email: 'a@example.com', name: 'John' } } }
      );
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        userStore.children.email.input.value = 'b@example.com';
        userStore.children.email.isDirty.value = true;
      }

      expect(
        getInput(store, { path: ['user'], dirtyOnly: true })
      ).toStrictEqual({ email: 'b@example.com' });
    });

    test('should return undefined for an object path with a fully clean subtree', () => {
      const store = createTestStore(
        v.object({
          user: v.object({ email: v.string(), name: v.string() }),
        }),
        { initialInput: { user: { email: 'a@example.com', name: 'John' } } }
      );

      expect(
        getInput(store, { path: ['user'], dirtyOnly: true })
      ).toBeUndefined();
    });

    test('should return the dirty value for a value path that is dirty', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      store.children.name.input.value = 'Jane';
      store.children.name.isDirty.value = true;

      expect(getInput(store, { path: ['name'], dirtyOnly: true })).toBe('Jane');
    });

    test('should return undefined for a value path that is clean', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });

      expect(
        getInput(store, { path: ['name'], dirtyOnly: true })
      ).toBeUndefined();
    });

    test('should return undefined for an array path that is fully clean', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });

      expect(
        getInput(store, { path: ['items'], dirtyOnly: true })
      ).toBeUndefined();
    });

    test('should preserve clean fields of array items when an item is dirty', () => {
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

      expect(getInput(store, { dirtyOnly: true })).toStrictEqual({
        users: [
          { name: 'Johnny', age: 25 },
          { name: 'Jane', age: 30 },
        ],
      });
    });
  });
});
