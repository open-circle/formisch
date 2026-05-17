import type { InternalArrayStore } from '@formisch/core';
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
    test('should return empty object for a clean form', () => {
      const store = createTestStore(
        v.object({ name: v.string(), age: v.number() }),
        { initialInput: { name: 'John', age: 25 } }
      );

      expect(getInput(store, { dirtyOnly: true })).toStrictEqual({});
    });

    test('should return only the dirty key from a flat object', () => {
      const store = createTestStore(
        v.object({ name: v.string(), email: v.string() }),
        { initialInput: { name: 'John', email: 'a@x.com' } }
      );
      store.children.email.input.value = 'b@x.com';
      store.children.email.isDirty.value = true;

      expect(getInput(store, { dirtyOnly: true })).toStrictEqual({
        email: 'b@x.com',
      });
    });

    test('should return only dirty indices when array items are dirty', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      const itemsArray = store.children.items as InternalArrayStore;
      itemsArray.children[1].input.value = 'B';
      itemsArray.children[1].isDirty.value = true;
      itemsArray.isDirty.value = true;

      const result = getInput(store, { dirtyOnly: true }) as {
        items: (string | undefined)[];
      };
      expect(result.items[1]).toBe('B');
      expect(result.items[0]).toBeUndefined();
      expect(result.items[2]).toBeUndefined();
    });

    test('should scope dirty filter to the given path', () => {
      const store = createTestStore(
        v.object({
          user: v.object({ email: v.string(), name: v.string() }),
        }),
        { initialInput: { user: { email: 'a@x.com', name: 'John' } } }
      );
      const user = store.children.user;
      if (user.kind !== 'object') throw new Error('expected object');
      user.children.email.input.value = 'b@x.com';
      user.children.email.isDirty.value = true;

      expect(
        getInput(store, { path: ['user'], dirtyOnly: true })
      ).toStrictEqual({ email: 'b@x.com' });
    });
  });
});
